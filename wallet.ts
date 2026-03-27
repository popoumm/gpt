import { AssetType } from '@prisma/client';
import prisma from '../lib/prisma';

// ---------------- DEFAULT WALLET ----------------

export async function createDefaultWallet(userId: number) {
  const assets: AssetType[] = ['GOLD', 'USD', 'AED', 'USDT', 'TRX'];

  await Promise.all(
    assets.map(async (asset) => {
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

  const result: Record<AssetType, number> = {
    GOLD: 0,
    USD: 0,
    AED: 0,
    USDT: 0,
    TRX: 0,
  };

  wallets.forEach((wallet) => {
    result[wallet.asset] = wallet.balance;
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
  if (amount <= 0) {
    throw new Error('مقدار نامعتبر است');
  }

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
  if (amount <= 0) {
    throw new Error('مقدار نامعتبر است');
  }

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