import prisma from './prisma';
import { ProductCategory, ProductUnit, Role } from '@prisma/client';

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
  actorUserId?: number;
  actorRole?: Role;
  reason?: string;
}) {
  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
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

    const exists = await tx.productSetting.findUnique({
      where: { asset: created.name },
    });

    if (!exists) {
      await tx.productSetting.create({
        data: {
          asset: created.name,
          spreadPercent: 0,
          autoHedgeEnabled: false,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        actorRole: input.actorRole,
        actionType: 'CREATE_PRODUCT',
        targetType: 'PRODUCT',
        targetId: String(created.id),
        newValue: JSON.stringify(created),
        reason: input.reason,
      },
    });

    return created;
  });

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
  actorUserId?: number;
  actorRole?: Role;
  reason?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const oldProduct = await tx.product.findUnique({
      where: { id: input.id },
    });

    if (!oldProduct) {
      throw new Error('Product not found');
    }

    const updatedProduct = await tx.product.update({
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

    if (input.name && input.name.trim() !== oldProduct.name) {
      await tx.productSetting.updateMany({
        where: { asset: oldProduct.name },
        data: { asset: input.name.trim() },
      });
    }

    const exists = await tx.productSetting.findUnique({
      where: { asset: updatedProduct.name },
    });

    if (!exists) {
      await tx.productSetting.create({
        data: {
          asset: updatedProduct.name,
          spreadPercent: 0,
          autoHedgeEnabled: false,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        actorRole: input.actorRole,
        actionType: 'UPDATE_PRODUCT',
        targetType: 'PRODUCT',
        targetId: String(updatedProduct.id),
        oldValue: JSON.stringify(oldProduct),
        newValue: JSON.stringify(updatedProduct),
        reason: input.reason,
      },
    });

    return updatedProduct;
  });
}

// ================= DELETE =================

export async function deleteProduct(id: number, actor?: { userId?: number; role?: Role; reason?: string }) {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const hasOrders = await prisma.order.count({
    where: { asset: product.name as any },
  });

  if (hasOrders > 0) {
    const disabled = await prisma.product.update({
      where: { id },
      data: { isActive: false, canBuy: false, canSell: false },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: actor?.userId,
        actorRole: actor?.role,
        actionType: 'SOFT_DISABLE_PRODUCT',
        targetType: 'PRODUCT',
        targetId: String(id),
        oldValue: JSON.stringify(product),
        newValue: JSON.stringify(disabled),
        reason: actor?.reason ?? 'Referenced by orders',
      },
    });

    return disabled;
  }

  return prisma.$transaction(async (tx) => {
    await tx.productSetting.deleteMany({
      where: {
        asset: product.name,
      },
    });

    const deleted = await tx.product.delete({
      where: { id },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: actor?.userId,
        actorRole: actor?.role,
        actionType: 'DELETE_PRODUCT',
        targetType: 'PRODUCT',
        targetId: String(id),
        oldValue: JSON.stringify(product),
        reason: actor?.reason,
      },
    });

    return deleted;
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
