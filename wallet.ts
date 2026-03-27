import { AssetType } from '@prisma/client';
import prisma from './prisma';

const VALID_ASSETS: AssetType[] = ['GOLD', 'USD', 'AED', 'USDT', 'TRX'];
const MIN_AMOUNT = 10;

function ensureValidAsset(asset: string): AssetType {
  if (!VALID_ASSETS.includes(asset as AssetType)) {
    throw new Error('asset invalid');
  }

  return asset as AssetType;
}

function ensureValidAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('amount invalid');
  }

  if (amount < MIN_AMOUNT) {
    throw new Error('minimum amount');
  }
}

// ---------------- DEFAULT WALLET ----------------

export async function createDefaultWallet(userId: number) {
  await Promise.all(
    VALID_ASSETS.map(async (asset) => {
      try {
        await prisma.wallet.create({
          data: {
            userId,
            asset,
            balance: 0,
          },
        });
      } catch {
        // اگر قبلا ساخته شده باشه ارور نده
      }
    })
  );
}

// ---------------- GET WALLET ----------------

export async function getWallet(userId: number) {
  const wallets = await prisma.wallet.findMany({
    where: { userId },
  });

  const result: Record<AssetType, { available: number; locked: number; total: number }> = {
    GOLD: { available: 0, locked: 0, total: 0 },
    USD: { available: 0, locked: 0, total: 0 },
    AED: { available: 0, locked: 0, total: 0 },
    USDT: { available: 0, locked: 0, total: 0 },
    TRX: { available: 0, locked: 0, total: 0 },
  };

  wallets.forEach((wallet) => {
    result[wallet.asset] = {
      available: wallet.balance,
      locked: wallet.lockedBalance,
      total: wallet.balance + wallet.lockedBalance,
    };
  });

  return result;
}

// ---------------- GET OR CREATE ----------------

export async function getOrCreateWallet(
  userId: number,
  asset: AssetType
) {
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

// ---------------- DEPOSIT ----------------

export async function deposit(
  userId: number,
  asset: AssetType,
  amount: number
) {
  ensureValidAmount(amount);

  const wallet = await getOrCreateWallet(userId, asset);

  return await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: { increment: amount },
    },
  });
}

// ---------------- WITHDRAW ----------------

export async function withdraw(
  userId: number,
  asset: AssetType,
  amount: number
) {
  ensureValidAmount(amount);

  const wallet = await getOrCreateWallet(userId, asset);

  if (wallet.balance < amount) {
    throw new Error('موجودی کافی نیست');
  }

  return await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: { decrement: amount },
    },
  });
}

export async function createDeposit(
  userId: number,
  asset: string,
  amount: number,
  refId?: string
) {
  const validAsset = ensureValidAsset(asset);
  ensureValidAmount(amount);

  return prisma.depositRequest.create({
    data: {
      userId,
      asset: validAsset,
      amount,
      refId,
    },
  });
}

export async function confirmDeposit(id: number) {
  const deposit = await prisma.depositRequest.findUnique({ where: { id } });

  if (!deposit) throw new Error('not found');
  if (deposit.status !== 'PENDING') {
    throw new Error('deposit not pending');
  }

  const validAsset = ensureValidAsset(deposit.asset);

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.upsert({
      where: {
        userId_asset: {
          userId: deposit.userId,
          asset: validAsset,
        },
      },
      update: {},
      create: {
        userId: deposit.userId,
        asset: validAsset,
        balance: 0,
      },
    });

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: deposit.amount },
      },
    });

    const updatedDeposit = await tx.depositRequest.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    await tx.transaction.create({
      data: {
        userId: deposit.userId,
        type: 'DEPOSIT',
        asset: validAsset,
        amount: deposit.amount,
        status: 'COMPLETED',
        refId: `DEP-${deposit.id}`,
      },
    });

    return updatedDeposit;
  });
}

export async function createWithdraw(
  userId: number,
  asset: string,
  amount: number,
  address?: string
) {
  const validAsset = ensureValidAsset(asset);
  ensureValidAmount(amount);

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: {
        userId_asset: { userId, asset: validAsset },
      },
    });

    if (!wallet || wallet.balance < amount) {
      throw new Error('insufficient balance');
    }

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: amount },
      },
    });

    const withdrawRequest = await tx.withdrawRequest.create({
      data: {
        userId,
        asset: validAsset,
        amount,
        address,
      },
    });

    await tx.transaction.create({
      data: {
        userId,
        type: 'WITHDRAW',
        asset: validAsset,
        amount,
        status: 'PENDING',
        refId: `WD-${withdrawRequest.id}`,
      },
    });

    return withdrawRequest;
  });
}

export async function confirmWithdraw(id: number) {
  const withdraw = await prisma.withdrawRequest.findUnique({ where: { id } });

  if (!withdraw) throw new Error('not found');
  if (withdraw.status !== 'PENDING') {
    throw new Error('withdraw not pending');
  }

  const validAsset = ensureValidAsset(withdraw.asset);

  return prisma.$transaction(async (tx) => {
    const updatedWithdraw = await tx.withdrawRequest.update({
      where: { id },
      data: {
        status: 'COMPLETED',
      },
    });

    await tx.transaction.create({
      data: {
        userId: withdraw.userId,
        type: 'WITHDRAW',
        asset: validAsset,
        amount: withdraw.amount,
        status: 'COMPLETED',
        refId: `WD-${withdraw.id}`,
      },
    });

    return updatedWithdraw;
  });
}

export async function getDepositRequests(userId?: number) {
  return prisma.depositRequest.findMany({
    where: {
      ...(typeof userId === 'number' ? { userId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getWithdrawRequests(userId?: number) {
  return prisma.withdrawRequest.findMany({
    where: {
      ...(typeof userId === 'number' ? { userId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
}
