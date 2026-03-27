import prisma from '../lib/prisma';

// ---------------- WHOLSALERS ----------------

export async function getWholesalers() {
  return await prisma.wholesaler.findMany({
    orderBy: { id: 'desc' },
  });
}

export async function addWholesaler(input: {
  name: string;
  apiUrl: string;
  apiKey?: string;
}) {
  return await prisma.wholesaler.create({
    data: {
      name: input.name,
      apiUrl: input.apiUrl,
      apiKey: input.apiKey,
    },
  });
}

export async function updateWholesaler(input: {
  id: number;
  name?: string;
  apiUrl?: string;
  apiKey?: string;
  isActive?: boolean;
}) {
  return await prisma.wholesaler.update({
    where: { id: input.id },
    data: {
      name: input.name,
      apiUrl: input.apiUrl,
      apiKey: input.apiKey,
      isActive: input.isActive,
    },
  });
}

export async function deleteWholesaler(id: number) {
  return await prisma.wholesaler.delete({
    where: { id },
  });
}

// ---------------- PRODUCT SETTINGS ----------------

export async function getProductSettings() {
  // همه محصولات
  const products = await prisma.product.findMany();

  // تنظیمات موجود
  const settings = await prisma.productSetting.findMany({
    include: {
      wholesaler: true,
    },
  });

  const map = new Map(settings.map((s) => [s.asset, s]));

  const result = [];

  for (const product of products) {
    let setting = map.get(product.name);

    // اگر نبود → بساز
    if (!setting) {
      setting = await prisma.productSetting.create({
        data: {
          asset: product.name,
          spreadPercent: 0,
          autoHedgeEnabled: false,
        },
        include: {
          wholesaler: true,
        },
      });
    }

    result.push(setting);
  }

  return result;
}

// ---------------- UPDATE ----------------

export async function updateProductSettings(input: {
  asset: string;
  wholesalerId?: number | null;
  spreadPercent?: number;
  autoHedgeEnabled?: boolean;
}) {
  return await prisma.productSetting.upsert({
    where: { asset: input.asset },
    update: {
      wholesalerId: input.wholesalerId,
      spreadPercent: input.spreadPercent,
      autoHedgeEnabled: input.autoHedgeEnabled,
    },
    create: {
      asset: input.asset,
      wholesalerId: input.wholesalerId,
      spreadPercent: input.spreadPercent ?? 0,
      autoHedgeEnabled: input.autoHedgeEnabled ?? false,
    },
    include: {
      wholesaler: true,
    },
  });
}