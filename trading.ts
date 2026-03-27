import prisma from '../lib/prisma';
import { AssetType, OrderType } from '@prisma/client';
import { getLatestPrices } from './priceService';

// 🔥 گرفتن یا ساخت ولت
async function getOrCreateWallet(userId: number, asset: AssetType) {
  let wallet = await prisma.wallet.findUnique({
    where: {
      userId_asset: { userId, asset },
    },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        asset,
        balance: 0,
      },
    });
  }

  return wallet;
}

// 🔥 موتور ترید
export async function instantTrade(
  userId: number,
  asset: AssetType,
  type: OrderType,
  amount: number
) {
  if (!amount || amount <= 0) {
    throw new Error('مقدار نامعتبر است');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { referredBy: true },
  });

  if (!user) throw new Error('کاربر یافت نشد');

  // 🔥 گرفتن قیمت
  const prices = getLatestPrices();
  const assetPrice =
  prices[asset] ||
  prices['GOLD'] ||
  Object.values(prices)[0];

  if (!assetPrice) {
    throw new Error('قیمت یافت نشد');
  }

  const price =
    type === 'BUY' ? assetPrice.buyPrice : assetPrice.sellPrice;

  const total = amount * price;

  // ---------------- BUY ----------------
  if (type === 'BUY') {
    const usdtWallet = await getOrCreateWallet(userId, 'USDT');
    const assetWallet = await getOrCreateWallet(userId, asset);

    // 🔥 اعتبار + موجودی
    const totalBalance =
      usdtWallet.balance + (user.creditLimitUsdt || 0);

    if (totalBalance < total) {
      throw new Error('موجودی کافی نیست');
    }

    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: usdtWallet.id },
        data: {
          balance: { decrement: total },
        },
      }),

      prisma.wallet.update({
        where: { id: assetWallet.id },
        data: {
          balance: { increment: amount },
        },
      }),
    ]);
  }

  // ---------------- SELL ----------------
  if (type === 'SELL') {
    const assetWallet = await getOrCreateWallet(userId, asset);
    const usdtWallet = await getOrCreateWallet(userId, 'USDT');

    const credit =
  asset === 'GOLD'
    ? user.creditLimitGold
    : asset === 'USDT'
    ? user.creditLimitUsdt
    : 0;

const totalBalance = assetWallet.balance + (credit || 0);

    if (totalBalance < amount) {
      throw new Error('موجودی کافی نیست');
    }

    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: assetWallet.id },
        data: {
          balance: { decrement: amount },
        },
      }),

      prisma.wallet.update({
        where: { id: usdtWallet.id },
        data: {
          balance: { increment: total },
        },
      }),
    ]);
  }

  // 🔥 ثبت تراکنش
  await prisma.transaction.create({
    data: {
      userId,
      type: 'TRADE',
      asset,
      amount,
      status: 'COMPLETED',
    },
  });

  // 🔥 رفرال
  if (user.referredBy) {
    const percent = user.referredBy.referralPercent || 0.05;
    const commission = total * percent;

    const refWallet = await getOrCreateWallet(
      user.referredBy.id,
      'USDT'
    );

    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: refWallet.id },
        data: {
          balance: { increment: commission },
        },
      }),

      prisma.user.update({
        where: { id: user.referredBy.id },
        data: {
          referralEarnings: { increment: commission },
        },
      }),
    ]);
  }

  // 🔥 ثبت Order (برای orderbook)
  const order = await prisma.order.create({
    data: {
      userId,
      asset,
      type,
      amount,
      price,
      status: 'FILLED',
    },
  });

  return {
    success: true,
    price,
    total,
    orderId: order.id,
  };
}

// ================= ORDER BOOK =================

// 🔥 orderbook (واقعی + فیک)
export async function getOrderBook(asset?: string) {
  const realOrders = await prisma.order.findMany({
    where: {
      status: 'FILLED',
      ...(asset ? { asset } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  // 🔥 فیک برای شلوغی
 // 🔥 قیمت مارکت واقعی (از آخرین اردر)
const marketPrice =
realOrders[0]?.price || 2500;

// 🔥 فیک حرفه‌ای (نزدیک به قیمت واقعی)
const fakeOrders = Array.from({ length: 30 }).map(() => {
const isBuy = Math.random() > 0.5;

const variance = (Math.random() - 0.5) * 50;

return {
  id: `fake-${Math.random()}`,
  asset: 'GOLD',
  type: isBuy ? 'BUY' : 'SELL',
  amount: Number((Math.random() * 3 + 0.1).toFixed(3)),
  price: Number((marketPrice + variance).toFixed(2)),
  createdAt: new Date(),
};
});

  return [...fakeOrders, ...realOrders];
}
export async function getRecentTrades(asset?: string) {
  const trades = await prisma.order.findMany({
    where: {
      status: 'FILLED',
      ...(asset ? { asset } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  return trades;
}