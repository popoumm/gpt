import prisma from './prisma';
import { AssetType, OrderStatus, OrderType } from '@prisma/client';
import { getLatestPrices } from './priceService';

const TAKER_FEE_RATE = 0.001;
const VALID_ASSETS: AssetType[] = ['GOLD', 'USD', 'AED', 'USDT', 'TRX'];

function asAssetType(asset: string): AssetType {
  if (!VALID_ASSETS.includes(asset as AssetType)) {
    throw new Error('asset invalid');
  }

  return asset as AssetType;
}

function assertPositive(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} invalid`);
  }
}

async function getOrCreateWallet(userId: number, asset: AssetType) {
  return prisma.wallet.upsert({
    where: { userId_asset: { userId, asset } },
    update: {},
    create: {
      userId,
      asset,
      balance: 0,
      lockedBalance: 0,
    },
  });
}

function getExecutionPrice(asset: AssetType, type: OrderType) {
  const prices = getLatestPrices();
  const assetPrice = prices[asset] || prices.GOLD || Object.values(prices)[0];

  if (!assetPrice) {
    throw new Error('price not found');
  }

  return type === 'BUY' ? Number(assetPrice.buyPrice) : Number(assetPrice.sellPrice);
}

function orderStatusFromRemaining(remaining: number): OrderStatus {
  if (remaining <= 0) return 'FILLED';
  return 'PARTIALLY_FILLED';
}

export async function instantTrade(userId: number, assetRaw: AssetType, type: OrderType, amount: number) {
  const asset = asAssetType(assetRaw);
  assertPositive(amount, 'amount');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { referredBy: true },
  });

  if (!user) throw new Error('کاربر یافت نشد');

  const price = getExecutionPrice(asset, type);
  const gross = amount * price;
  const fee = gross * TAKER_FEE_RATE;

  if (type === 'BUY') {
    await prisma.$transaction(async (tx) => {
      const usdtWallet = await tx.wallet.findUnique({ where: { userId_asset: { userId, asset: 'USDT' } } });
      const available = (usdtWallet?.balance ?? 0) + (user.creditLimitUsdt || 0);
      const totalCost = gross + fee;

      if (available < totalCost) {
        throw new Error('موجودی کافی نیست');
      }

      const baseWallet = await tx.wallet.upsert({
        where: { userId_asset: { userId, asset } },
        update: {},
        create: { userId, asset, balance: 0, lockedBalance: 0 },
      });

      const quoteWallet = await tx.wallet.upsert({
        where: { userId_asset: { userId, asset: 'USDT' } },
        update: {},
        create: { userId, asset: 'USDT', balance: 0, lockedBalance: 0 },
      });

      await tx.wallet.update({
        where: { id: quoteWallet.id },
        data: { balance: { decrement: totalCost } },
      });

      await tx.wallet.update({
        where: { id: baseWallet.id },
        data: { balance: { increment: amount } },
      });

      const order = await tx.order.create({
        data: {
          userId,
          asset,
          type,
          amount,
          price,
          filledAmount: amount,
          remainingAmount: 0,
          orderMode: 'MARKET',
          fee,
          status: 'FILLED',
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'TRADE',
          asset,
          amount,
          status: 'COMPLETED',
          refId: `ORD-${order.id}`,
        },
      });

      await tx.tradeExecution.create({
        data: {
          asset,
          price,
          amount,
          takerOrderId: order.id,
          isSimulated: false,
        },
      });

      if (user.referredBy) {
        const percent = user.referredBy.referralPercent || 0.05;
        const commission = gross * percent;

        const referralWallet = await tx.wallet.upsert({
          where: { userId_asset: { userId: user.referredBy.id, asset: 'USDT' } },
          update: {},
          create: { userId: user.referredBy.id, asset: 'USDT', balance: 0, lockedBalance: 0 },
        });

        await tx.wallet.update({
          where: { id: referralWallet.id },
          data: { balance: { increment: commission } },
        });

        await tx.user.update({
          where: { id: user.referredBy.id },
          data: { referralEarnings: { increment: commission } },
        });
      }
    });
  }

  if (type === 'SELL') {
    await prisma.$transaction(async (tx) => {
      const baseWallet = await tx.wallet.findUnique({ where: { userId_asset: { userId, asset } } });
      const credit = asset === 'GOLD' ? user.creditLimitGold : asset === 'USDT' ? user.creditLimitUsdt : 0;
      const available = (baseWallet?.balance ?? 0) + (credit || 0);

      if (available < amount) {
        throw new Error('موجودی کافی نیست');
      }

      const ensuredBase = await tx.wallet.upsert({
        where: { userId_asset: { userId, asset } },
        update: {},
        create: { userId, asset, balance: 0, lockedBalance: 0 },
      });

      const usdtWallet = await tx.wallet.upsert({
        where: { userId_asset: { userId, asset: 'USDT' } },
        update: {},
        create: { userId, asset: 'USDT', balance: 0, lockedBalance: 0 },
      });

      await tx.wallet.update({
        where: { id: ensuredBase.id },
        data: { balance: { decrement: amount } },
      });

      await tx.wallet.update({
        where: { id: usdtWallet.id },
        data: { balance: { increment: gross - fee } },
      });

      const order = await tx.order.create({
        data: {
          userId,
          asset,
          type,
          amount,
          price,
          filledAmount: amount,
          remainingAmount: 0,
          orderMode: 'MARKET',
          fee,
          status: 'FILLED',
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'TRADE',
          asset,
          amount,
          status: 'COMPLETED',
          refId: `ORD-${order.id}`,
        },
      });

      await tx.tradeExecution.create({
        data: {
          asset,
          price,
          amount,
          takerOrderId: order.id,
          isSimulated: false,
        },
      });

      if (user.referredBy) {
        const percent = user.referredBy.referralPercent || 0.05;
        const commission = gross * percent;

        const referralWallet = await tx.wallet.upsert({
          where: { userId_asset: { userId: user.referredBy.id, asset: 'USDT' } },
          update: {},
          create: { userId: user.referredBy.id, asset: 'USDT', balance: 0, lockedBalance: 0 },
        });

        await tx.wallet.update({
          where: { id: referralWallet.id },
          data: { balance: { increment: commission } },
        });

        await tx.user.update({
          where: { id: user.referredBy.id },
          data: { referralEarnings: { increment: commission } },
        });
      }
    });
  }

  return {
    success: true,
    price,
    fee,
    total: gross,
  };
}

export async function createLimitOrder(
  userId: number,
  assetRaw: string,
  type: OrderType,
  amount: number,
  price: number
) {
  const asset = asAssetType(assetRaw);
  assertPositive(amount, 'amount');
  assertPositive(price, 'price');

  const reserveNotional = amount * price;
  const reserveFee = reserveNotional * TAKER_FEE_RATE;

  return prisma.$transaction(async (tx) => {
    if (type === 'BUY') {
      const quoteWallet = await tx.wallet.upsert({
        where: { userId_asset: { userId, asset: 'USDT' } },
        update: {},
        create: { userId, asset: 'USDT', balance: 0, lockedBalance: 0 },
      });
      const totalReserve = reserveNotional + reserveFee;

      if (quoteWallet.balance < totalReserve) {
        throw new Error('insufficient balance');
      }

      await tx.wallet.update({
        where: { id: quoteWallet.id },
        data: {
          balance: { decrement: totalReserve },
          lockedBalance: { increment: totalReserve },
        },
      });
    }

    if (type === 'SELL') {
      const baseWallet = await tx.wallet.upsert({
        where: { userId_asset: { userId, asset } },
        update: {},
        create: { userId, asset, balance: 0, lockedBalance: 0 },
      });

      if (baseWallet.balance < amount) {
        throw new Error('insufficient balance');
      }

      await tx.wallet.update({
        where: { id: baseWallet.id },
        data: {
          balance: { decrement: amount },
          lockedBalance: { increment: amount },
        },
      });
    }

    const order = await tx.order.create({
      data: {
        userId,
        asset,
        type,
        amount,
        price,
        filledAmount: 0,
        remainingAmount: amount,
        orderMode: 'LIMIT',
        fee: 0,
        status: 'PENDING',
      },
    });

    return order;
  });
}

export async function matchOrders(assetRaw: string) {
  const asset = asAssetType(assetRaw);

  const [buys, sells] = await Promise.all([
    prisma.order.findMany({
      where: {
        asset,
        orderMode: 'LIMIT',
        status: { in: ['PENDING', 'PARTIALLY_FILLED'] },
        type: 'BUY',
      },
      orderBy: [{ price: 'desc' }, { createdAt: 'asc' }],
    }),
    prisma.order.findMany({
      where: {
        asset,
        orderMode: 'LIMIT',
        status: { in: ['PENDING', 'PARTIALLY_FILLED'] },
        type: 'SELL',
      },
      orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  let i = 0;
  let j = 0;
  const executions: any[] = [];

  while (i < buys.length && j < sells.length) {
    const bid = buys[i];
    const ask = sells[j];

    if (bid.price < ask.price) break;

    const bidRemaining = bid.remainingAmount ?? bid.amount;
    const askRemaining = ask.remainingAmount ?? ask.amount;
    const tradeAmount = Math.min(bidRemaining, askRemaining);
    const tradePrice = ask.price;

    const maker = bid.createdAt <= ask.createdAt ? bid : ask;
    const taker = maker.id === bid.id ? ask : bid;

    const buyFee = taker.id === bid.id ? tradeAmount * tradePrice * TAKER_FEE_RATE : 0;
    const sellFee = taker.id === ask.id ? tradeAmount * tradePrice * TAKER_FEE_RATE : 0;

    await prisma.$transaction(async (tx) => {
      const buyerAssetWallet = await tx.wallet.upsert({
        where: { userId_asset: { userId: bid.userId, asset } },
        update: {},
        create: { userId: bid.userId, asset, balance: 0, lockedBalance: 0 },
      });

      const buyerUsdtWallet = await tx.wallet.upsert({
        where: { userId_asset: { userId: bid.userId, asset: 'USDT' } },
        update: {},
        create: { userId: bid.userId, asset: 'USDT', balance: 0, lockedBalance: 0 },
      });

      const sellerAssetWallet = await tx.wallet.upsert({
        where: { userId_asset: { userId: ask.userId, asset } },
        update: {},
        create: { userId: ask.userId, asset, balance: 0, lockedBalance: 0 },
      });

      const sellerUsdtWallet = await tx.wallet.upsert({
        where: { userId_asset: { userId: ask.userId, asset: 'USDT' } },
        update: {},
        create: { userId: ask.userId, asset: 'USDT', balance: 0, lockedBalance: 0 },
      });

      const buyerReservedChunk = tradeAmount * bid.price * (1 + TAKER_FEE_RATE);
      const buyerActualCost = tradeAmount * tradePrice + buyFee;
      const buyerRefund = Math.max(0, buyerReservedChunk - buyerActualCost);

      await tx.wallet.update({
        where: { id: buyerUsdtWallet.id },
        data: {
          lockedBalance: { decrement: buyerReservedChunk },
          balance: { increment: buyerRefund },
        },
      });

      await tx.wallet.update({
        where: { id: buyerAssetWallet.id },
        data: {
          balance: { increment: tradeAmount },
        },
      });

      await tx.wallet.update({
        where: { id: sellerAssetWallet.id },
        data: {
          lockedBalance: { decrement: tradeAmount },
        },
      });

      await tx.wallet.update({
        where: { id: sellerUsdtWallet.id },
        data: {
          balance: { increment: tradeAmount * tradePrice - sellFee },
        },
      });

      const nextBidRemaining = Math.max(0, bidRemaining - tradeAmount);
      const nextAskRemaining = Math.max(0, askRemaining - tradeAmount);

      await tx.order.update({
        where: { id: bid.id },
        data: {
          filledAmount: { increment: tradeAmount },
          remainingAmount: nextBidRemaining,
          fee: { increment: buyFee },
          status: nextBidRemaining === 0 ? 'FILLED' : orderStatusFromRemaining(nextBidRemaining),
        },
      });

      await tx.order.update({
        where: { id: ask.id },
        data: {
          filledAmount: { increment: tradeAmount },
          remainingAmount: nextAskRemaining,
          fee: { increment: sellFee },
          status: nextAskRemaining === 0 ? 'FILLED' : orderStatusFromRemaining(nextAskRemaining),
        },
      });

      await tx.tradeExecution.create({
        data: {
          asset,
          price: tradePrice,
          amount: tradeAmount,
          makerOrderId: maker.id,
          takerOrderId: taker.id,
          isSimulated: false,
        },
      });
    });

    bid.remainingAmount = Math.max(0, bidRemaining - tradeAmount);
    ask.remainingAmount = Math.max(0, askRemaining - tradeAmount);

    executions.push({
      buyOrderId: bid.id,
      sellOrderId: ask.id,
      price: tradePrice,
      amount: tradeAmount,
    });

    if ((bid.remainingAmount ?? 0) <= 0) i += 1;
    if ((ask.remainingAmount ?? 0) <= 0) j += 1;
  }

  return {
    matched: executions.length,
    executions,
  };
}

export async function cancelOrder(orderId: number, userId: number) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) throw new Error('order not found');
  if (order.userId !== userId) throw new Error('forbidden');
  if (!['PENDING', 'PARTIALLY_FILLED'].includes(order.status)) {
    throw new Error('cannot cancel order');
  }
  if (order.orderMode !== 'LIMIT') {
    throw new Error('only limit orders can be cancelled');
  }

  const remaining = order.remainingAmount ?? 0;

  return prisma.$transaction(async (tx) => {
    if (remaining > 0 && order.type === 'BUY') {
      const quoteWallet = await tx.wallet.findUnique({
        where: { userId_asset: { userId, asset: 'USDT' } },
      });

      if (quoteWallet) {
        const release = remaining * order.price * (1 + TAKER_FEE_RATE);
        await tx.wallet.update({
          where: { id: quoteWallet.id },
          data: {
            lockedBalance: { decrement: release },
            balance: { increment: release },
          },
        });
      }
    }

    if (remaining > 0 && order.type === 'SELL') {
      const baseWallet = await tx.wallet.findUnique({
        where: { userId_asset: { userId, asset: order.asset } },
      });

      if (baseWallet) {
        await tx.wallet.update({
          where: { id: baseWallet.id },
          data: {
            lockedBalance: { decrement: remaining },
            balance: { increment: remaining },
          },
        });
      }
    }

    return tx.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
      },
    });
  });
}

export async function getOrderBook(assetRaw?: string) {
  const assetFilter = assetRaw ? asAssetType(assetRaw) : undefined;

  const orders = await prisma.order.findMany({
    where: {
      orderMode: 'LIMIT',
      status: { in: ['PENDING', 'PARTIALLY_FILLED'] },
      ...(assetFilter ? { asset: assetFilter } : {}),
    },
    orderBy: [{ createdAt: 'asc' }],
  });

  const bidMap = new Map<number, number>();
  const askMap = new Map<number, number>();

  for (const order of orders) {
    const remaining = order.remainingAmount ?? order.amount;
    if (remaining <= 0) continue;

    const target = order.type === 'BUY' ? bidMap : askMap;
    target.set(order.price, (target.get(order.price) ?? 0) + remaining);
  }

  type BookLevel = { price: number; amount: number; total: number; source: 'real' };

  let bids: BookLevel[] = Array.from(bidMap.entries())
    .map(([price, amount]) => ({ price, amount, total: price * amount, source: 'real' as const }))
    .sort((a, b) => b.price - a.price);

  let asks: BookLevel[] = Array.from(askMap.entries())
    .map(([price, amount]) => ({ price, amount, total: price * amount, source: 'real' as const }))
    .sort((a, b) => a.price - b.price);

  return { bids, asks };
}

export async function getRecentTrades(assetRaw?: string) {
  const assetFilter = assetRaw ? asAssetType(assetRaw) : undefined;

  const rows = await prisma.tradeExecution.findMany({
    where: {
      ...(assetFilter ? { asset: assetFilter } : {}),
    },
    orderBy: { executedAt: 'desc' },
    take: 30,
  });

  return rows.map((row) => ({
    id: row.id,
    asset: row.asset,
    type: 'TRADE',
    price: row.price,
    amount: row.amount,
    executedAt: row.executedAt,
    isSimulated: row.isSimulated,
  }));
}
