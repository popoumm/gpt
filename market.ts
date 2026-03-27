import prisma from './prisma';
import { Role } from '@prisma/client';

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
  actorUserId?: number;
  actorRole?: Role;
  reason?: string;
}) {
  if (!input.name.trim()) throw new Error('name required');
  try {
    new URL(input.apiUrl);
  } catch {
    throw new Error('apiUrl invalid');
  }

  const created = await prisma.wholesaler.create({
    data: {
      name: input.name,
      apiUrl: input.apiUrl,
      apiKey: input.apiKey,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      actionType: 'ADD_WHOLESALER',
      targetType: 'WHOLESALER',
      targetId: String(created.id),
      newValue: JSON.stringify(created),
      reason: input.reason,
    },
  });

  return created;
}

export async function updateWholesaler(input: {
  id: number;
  name?: string;
  apiUrl?: string;
  apiKey?: string;
  isActive?: boolean;
  actorUserId?: number;
  actorRole?: Role;
  reason?: string;
}) {
  if (input.apiUrl) {
    try {
      new URL(input.apiUrl);
    } catch {
      throw new Error('apiUrl invalid');
    }
  }

  return prisma.$transaction(async (tx) => {
    const old = await tx.wholesaler.findUnique({ where: { id: input.id } });
    if (!old) throw new Error('wholesaler not found');

    const updated = await tx.wholesaler.update({
      where: { id: input.id },
      data: {
        name: input.name,
        apiUrl: input.apiUrl,
        apiKey: input.apiKey,
        isActive: input.isActive,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        actorRole: input.actorRole,
        actionType: 'UPDATE_WHOLESALER',
        targetType: 'WHOLESALER',
        targetId: String(input.id),
        oldValue: JSON.stringify(old),
        newValue: JSON.stringify(updated),
        reason: input.reason,
      },
    });

    return updated;
  });
}

export async function deleteWholesaler(id: number, actor?: { userId?: number; role?: Role; reason?: string }) {
  const settings = await prisma.productSetting.count({ where: { wholesalerId: id } });
  if (settings > 0) {
    return prisma.wholesaler.update({
      where: { id },
      data: { isActive: false },
    });
  }

  const old = await prisma.wholesaler.findUnique({ where: { id } });
  const deleted = await prisma.wholesaler.delete({
    where: { id },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: actor?.userId,
      actorRole: actor?.role,
      actionType: 'DELETE_WHOLESALER',
      targetType: 'WHOLESALER',
      targetId: String(id),
      oldValue: JSON.stringify(old),
      reason: actor?.reason,
    },
  });

  return deleted;
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
  actorUserId?: number;
  actorRole?: Role;
  reason?: string;
}) {
  if (typeof input.spreadPercent === 'number' && (input.spreadPercent < 0 || input.spreadPercent > 20)) {
    throw new Error('spreadPercent invalid');
  }

  return prisma.$transaction(async (tx) => {
    const old = await tx.productSetting.findUnique({ where: { asset: input.asset } });
    const updated = await tx.productSetting.upsert({
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

    await tx.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        actorRole: input.actorRole,
        actionType: 'UPDATE_PRODUCT_SETTING',
        targetType: 'PRODUCT_SETTING',
        targetId: input.asset,
        oldValue: old ? JSON.stringify(old) : null,
        newValue: JSON.stringify(updated),
        reason: input.reason,
      },
    });

    return updated;
  });
}
