import prisma from '../lib/prisma';

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { id: 'desc' },
  });
}

export async function updateUserCredit(input: {
  userId: number;
  creditLimitIrr?: number;
  creditLimitGold?: number;
  creditLimitUsdt?: number;
}) {
  return await prisma.user.update({
    where: { id: input.userId },
    data: {
      creditLimitUsd: input.creditLimitIrr ?? 0,
      creditLimitGold: input.creditLimitGold ?? 0,
      creditLimitUsdt: input.creditLimitUsdt ?? 0,
    },
  });
}

export async function getRates() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { id: 'desc' },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    unit: p.unit,
    price: p.price,
    manualPrice: p.manualPrice,
    useApi: p.useApi,
    buySpread: p.buySpread,
    sellSpread: p.sellSpread,
    isActive: p.isActive,
    canBuy: p.canBuy,
    canSell: p.canSell,
    autoTrade: p.autoTrade,
  }));
}

export async function updateRate(input: {
  productId: number;
  price?: number;
  manualPrice?: number | null;
  useApi?: boolean;
  buySpread?: number;
  sellSpread?: number;
  isActive?: boolean;
  canBuy?: boolean;
  canSell?: boolean;
  autoTrade?: boolean;
}) {
  return await prisma.product.update({
    where: { id: input.productId },
    data: {
      price: input.price,
      manualPrice: input.manualPrice,
      useApi: input.useApi,
      buySpread: input.buySpread,
      sellSpread: input.sellSpread,
      isActive: input.isActive,
      canBuy: input.canBuy,
      canSell: input.canSell,
      autoTrade: input.autoTrade,
    },
  });
}

export async function getTransactions() {
  return await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
  });
}