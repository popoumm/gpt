import prisma from '../lib/prisma';
import { ProductCategory, ProductUnit } from '@prisma/client';

// ================= GET =================

export async function getProducts() {
  return await prisma.product.findMany({
    include: {
      api: true,
    },
    orderBy: {
      id: 'desc',
    },
  });
}

// ================= CREATE =================

export async function createProduct(input: {
  name: string;
  category: ProductCategory;
  unit?: ProductUnit;
  apiId?: number | null;
  useApi?: boolean;
  manualPrice?: number | null;
  buySpread?: number;
  sellSpread?: number;
  isActive?: boolean;
  canBuy?: boolean;
  canSell?: boolean;
  autoTrade?: boolean;
}) {
  const product = await prisma.product.create({
    data: {
      name: input.name.trim(),

      category: input.category,
      unit: input.unit ?? ProductUnit.GRAM,

      apiId: input.apiId ?? null,
      useApi: input.useApi ?? true,

      manualPrice: input.manualPrice ?? null,

      buySpread: input.buySpread ?? 0,
      sellSpread: input.sellSpread ?? 0,

      isActive: input.isActive ?? true,
      canBuy: input.canBuy ?? true,
      canSell: input.canSell ?? true,

      autoTrade: input.autoTrade ?? true,
    },
    include: {
      api: true,
    },
  });

  // اگر تنظیمات بازار برای این محصول نبود، بساز
  const exists = await prisma.productSetting.findUnique({
    where: { asset: product.name },
  });

  if (!exists) {
    await prisma.productSetting.create({
      data: {
        asset: product.name,
        spreadPercent: 0,
        autoHedgeEnabled: false,
      },
    });
  }

  return product;
}

// ================= UPDATE =================

export async function updateProduct(input: {
  id: number;
  name?: string;
  category?: ProductCategory;
  unit?: ProductUnit;
  apiId?: number | null;
  useApi?: boolean;
  manualPrice?: number | null;
  buySpread?: number;
  sellSpread?: number;
  isActive?: boolean;
  canBuy?: boolean;
  canSell?: boolean;
  autoTrade?: boolean;
}) {
  const oldProduct = await prisma.product.findUnique({
    where: { id: input.id },
  });

  if (!oldProduct) {
    throw new Error('Product not found');
  }

  const updatedProduct = await prisma.product.update({
    where: { id: input.id },
    data: {
      name: input.name?.trim(),
      category: input.category,
      unit: input.unit,

      apiId: input.apiId,
      useApi: input.useApi,

      manualPrice: input.manualPrice,

      buySpread: input.buySpread,
      sellSpread: input.sellSpread,

      isActive: input.isActive,
      canBuy: input.canBuy,
      canSell: input.canSell,

      autoTrade: input.autoTrade,
    },
    include: {
      api: true,
    },
  });

  // اگر اسم محصول عوض شد، ProductSetting هم sync بشه
  if (input.name && input.name.trim() !== oldProduct.name) {
    await prisma.productSetting.updateMany({
      where: { asset: oldProduct.name },
      data: { asset: input.name.trim() },
    });
  }

  // اگر ProductSetting برای اسم جدید نبود، بساز
  const exists = await prisma.productSetting.findUnique({
    where: { asset: updatedProduct.name },
  });

  if (!exists) {
    await prisma.productSetting.create({
      data: {
        asset: updatedProduct.name,
        spreadPercent: 0,
        autoHedgeEnabled: false,
      },
    });
  }

  return updatedProduct;
}

// ================= DELETE =================

export async function deleteProduct(id: number) {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  await prisma.productSetting.deleteMany({
    where: {
      asset: product.name,
    },
  });

  return await prisma.product.delete({
    where: { id },
  });
}

// ================= ADVANCED =================

export async function getProductFull(asset: string) {
  const product = await prisma.product.findFirst({
    where: { name: asset },
    include: {
      api: true,
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const setting = await prisma.productSetting.findUnique({
    where: { asset },
    include: {
      wholesaler: true,
    },
  });

  return {
    product,
    setting,
  };
}