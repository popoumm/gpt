import { Role, TransactionStatus, TransactionType } from '@prisma/client';
import prisma from './prisma';

const MAX_CREDIT_LIMIT = 1_000_000_000;

type CreditUpdateInput = {
  userId: number;
  creditLimitIrr?: number;
  creditLimitGold?: number;
  creditLimitUsdt?: number;
  creditLimitUsd?: number;
  creditLimitAed?: number;
  creditLimitTrx?: number;
  reason?: string;
  actorUserId?: number;
  actorRole?: Role;
};

function validateCreditValue(value: number | undefined, field: string) {
  if (typeof value !== 'number') return;

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} invalid`);
  }

  if (value > MAX_CREDIT_LIMIT) {
    throw new Error(`${field} too large`);
  }
}

export async function logAudit(input: {
  actorUserId?: number;
  actorRole?: Role;
  actionType: string;
  targetType: string;
  targetId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  reason?: string;
}) {
  return prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      actionType: input.actionType,
      targetType: input.targetType,
      targetId: input.targetId,
      oldValue: input.oldValue ? JSON.stringify(input.oldValue) : null,
      newValue: input.newValue ? JSON.stringify(input.newValue) : null,
      reason: input.reason,
    },
  });
}

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { id: 'desc' },
  });
}

export async function updateUserCredit(input: CreditUpdateInput) {
  validateCreditValue(input.creditLimitIrr, 'creditLimitIrr');
  validateCreditValue(input.creditLimitGold, 'creditLimitGold');
  validateCreditValue(input.creditLimitUsdt, 'creditLimitUsdt');
  validateCreditValue(input.creditLimitUsd, 'creditLimitUsd');
  validateCreditValue(input.creditLimitAed, 'creditLimitAed');
  validateCreditValue(input.creditLimitTrx, 'creditLimitTrx');

  return prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { id: input.userId } });
    if (!existing) throw new Error('user not found');

    const updated = await tx.user.update({
      where: { id: input.userId },
      data: {
        creditLimitIrr: input.creditLimitIrr,
        creditLimitGold: input.creditLimitGold,
        creditLimitUsdt: input.creditLimitUsdt,
        creditLimitUsd: input.creditLimitUsd,
        creditLimitAed: input.creditLimitAed,
        creditLimitTrx: input.creditLimitTrx,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        actorRole: input.actorRole,
        actionType: 'UPDATE_USER_CREDIT',
        targetType: 'USER',
        targetId: String(input.userId),
        oldValue: JSON.stringify({
          creditLimitIrr: existing.creditLimitIrr,
          creditLimitGold: existing.creditLimitGold,
          creditLimitUsdt: existing.creditLimitUsdt,
          creditLimitUsd: existing.creditLimitUsd,
          creditLimitAed: existing.creditLimitAed,
          creditLimitTrx: existing.creditLimitTrx,
        }),
        newValue: JSON.stringify({
          creditLimitIrr: updated.creditLimitIrr,
          creditLimitGold: updated.creditLimitGold,
          creditLimitUsdt: updated.creditLimitUsdt,
          creditLimitUsd: updated.creditLimitUsd,
          creditLimitAed: updated.creditLimitAed,
          creditLimitTrx: updated.creditLimitTrx,
        }),
        reason: input.reason,
      },
    });

    return updated;
  });
}

export async function getRates() {
  const products = await prisma.product.findMany({
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
  reason?: string;
  actorUserId?: number;
  actorRole?: Role;
}) {
  if (typeof input.price === 'number' && input.price <= 0) throw new Error('price invalid');
  if (typeof input.manualPrice === 'number' && input.manualPrice <= 0) throw new Error('manualPrice invalid');
  if (typeof input.buySpread === 'number' && (input.buySpread < 0 || input.buySpread > 20)) throw new Error('buySpread invalid');
  if (typeof input.sellSpread === 'number' && (input.sellSpread < 0 || input.sellSpread > 20)) throw new Error('sellSpread invalid');

  return prisma.$transaction(async (tx) => {
    const existing = await tx.product.findUnique({ where: { id: input.productId } });
    if (!existing) throw new Error('product not found');

    const updated = await tx.product.update({
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

    await tx.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        actorRole: input.actorRole,
        actionType: 'UPDATE_RATE',
        targetType: 'PRODUCT',
        targetId: String(input.productId),
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(updated),
        reason: input.reason,
      },
    });

    return updated;
  });
}

export async function getTransactions(input?: {
  page?: number;
  pageSize?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  asset?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const page = input?.page && input.page > 0 ? input.page : 1;
  const pageSize = input?.pageSize && input.pageSize > 0 ? Math.min(input.pageSize, 100) : 20;

  const where: any = {
    ...(input?.type ? { type: input.type } : {}),
    ...(input?.status ? { status: input.status } : {}),
    ...(input?.asset ? { asset: input.asset as any } : {}),
  };

  if (input?.dateFrom || input?.dateTo) {
    where.createdAt = {
      ...(input.dateFrom ? { gte: input.dateFrom } : {}),
      ...(input.dateTo ? { lte: input.dateTo } : {}),
    };
  }

  const [rows, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getAdminKpis() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [totalUsers, trades24h, pendingRequests, feeOrders, referralPayoutTotal] = await Promise.all([
    prisma.user.count(),
    prisma.tradeExecution.aggregate({
      _sum: { amount: true },
      where: { executedAt: { gte: since24h } },
    }),
    prisma.transaction.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({ _sum: { fee: true } }),
    prisma.user.aggregate({ _sum: { referralEarnings: true } }),
  ]);

  return {
    totalUsers,
    tradeVolume24h: trades24h._sum.amount ?? 0,
    pendingTransactions: pendingRequests,
    platformFees: feeOrders._sum.fee ?? 0,
    referralPayoutTotal: referralPayoutTotal._sum.referralEarnings ?? 0,
  };
}

export async function getAuditLogs(input?: { page?: number; pageSize?: number }) {
  const page = input?.page && input.page > 0 ? input.page : 1;
  const pageSize = input?.pageSize && input.pageSize > 0 ? Math.min(input.pageSize, 100) : 20;

  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count(),
  ]);

  return { rows, total, page, pageSize };
}
