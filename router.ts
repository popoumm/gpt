import prisma from './prisma';
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { registerUser, loginUser } from './auth';
import { Role } from '@prisma/client';
import {
  getWallet,
  deposit,
  withdraw,
  createDeposit,
  confirmDeposit,
  createWithdraw,
  confirmWithdraw,
  getDepositRequests,
  getWithdrawRequests,
} from './wallet';
import {
  instantTrade,
  getOrderBook,
  getRecentTrades,
  createLimitOrder,
  cancelOrder,
  matchOrders,
} from './trading';
import { getLatestPrices } from './priceService';
import {
  getUsers,
  updateUserCredit,
  getRates,
  updateRate,
  getTransactions,
  logAudit,
  getAdminKpis,
  getAuditLogs,
} from './admin';

import {
  getWholesalers,
  addWholesaler,
  updateWholesaler,
  deleteWholesaler,
  getProductSettings,
  updateProductSettings,
} from './market';

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from './product';

type Context = {
  user?: { id: number; role: Role } | null;
};

const t = initTRPC.context<Context>().create();
const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

const operatorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'OPERATOR' && ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next();
});

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next();
});

export const appRouter = t.router({
  // ================= AUTH =================

  register: publicProcedure
  .input(
    z.object({
      firstName: z.string(),
      lastName: z.string(),
      phone: z.string(),
      password: z.string(),
      referralCode: z.string().optional(), // 🔥 اضافه شد
    })
  )
    .mutation(({ input }) => registerUser(input)),
    adminCreateUser: adminProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        phone: z.string(),
        password: z.string(),
        role: z.nativeEnum(Role),
      })
    )
    .mutation(({ input }) =>
      registerUser({
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        password: input.password,
        role: input.role,
      })
    ),

  login: publicProcedure
    .input(
      z.object({
        phone: z.string(),
        password: z.string(),
      })
    )
    .mutation(({ input }) => loginUser(input)),
    getMe: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error('Not authenticated');
    
      return await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          role: true,
          firstName: true,
        },
      });
    }),
    getMyReferral: protectedProcedure.query(async ({ ctx }) => {
      return await prisma.user.findFirst({
        where: { id: ctx.user.id },
        select: {
          referralCode: true,
          referralEarnings: true,
          referrals: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    }),
  // ================= PRICES =================

  getPrices: publicProcedure.query(() => getLatestPrices()),

  // ================= WALLET =================

  getWallet: protectedProcedure
    .query(({ ctx }) => getWallet(ctx.user.id)),

  deposit: protectedProcedure
    .input(
      z.object({
        asset: z.string(),
        amount: z.number().positive(),
      })
    )
    .mutation(({ input, ctx }) => deposit(ctx.user.id, input.asset as any, input.amount)),

  withdraw: protectedProcedure
    .input(
      z.object({
        asset: z.string(),
        amount: z.number().positive(),
      })
    )
    .mutation(({ input, ctx }) => withdraw(ctx.user.id, input.asset as any, input.amount)),

  createDeposit: protectedProcedure
    .input(
      z.object({
        asset: z.string(),
        amount: z.number().positive(),
        refId: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => createDeposit(ctx.user.id, input.asset, input.amount, input.refId)),

  confirmDeposit: operatorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const result = await confirmDeposit(input.id);
      await logAudit({
        actorUserId: ctx.user?.id,
        actorRole: ctx.user?.role,
        actionType: 'CONFIRM_DEPOSIT',
        targetType: 'DEPOSIT_REQUEST',
        targetId: String(input.id),
      });
      return result;
    }),

  getDepositRequests: protectedProcedure
    .input(z.object({ userId: z.number().optional() }).optional())
    .query(({ input, ctx }) => {
      const userId = ctx.user.role === 'USER' ? ctx.user.id : input?.userId;
      return getDepositRequests(userId);
    }),

  createWithdraw: protectedProcedure
    .input(
      z.object({
        asset: z.string(),
        amount: z.number().positive(),
        address: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => createWithdraw(ctx.user.id, input.asset, input.amount, input.address)),

  confirmWithdraw: operatorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const result = await confirmWithdraw(input.id);
      await logAudit({
        actorUserId: ctx.user?.id,
        actorRole: ctx.user?.role,
        actionType: 'CONFIRM_WITHDRAW',
        targetType: 'WITHDRAW_REQUEST',
        targetId: String(input.id),
      });
      return result;
    }),

  getWithdrawRequests: protectedProcedure
    .input(z.object({ userId: z.number().optional() }).optional())
    .query(({ input, ctx }) => {
      const userId = ctx.user.role === 'USER' ? ctx.user.id : input?.userId;
      return getWithdrawRequests(userId);
    }),

  // ================= TRADING =================

  // ================= ADMIN =================

  getUsers: operatorProcedure.query(() => getUsers()),

  updateUserCredit: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        creditLimitIrr: z.number().optional(),
        creditLimitGold: z.number().optional(),
        creditLimitUsdt: z.number().optional(),
        creditLimitUsd: z.number().optional(),
        creditLimitAed: z.number().optional(),
        creditLimitTrx: z.number().optional(),
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(({ input, ctx }) =>
      updateUserCredit({
        ...input,
        actorUserId: ctx.user?.id,
        actorRole: ctx.user?.role,
      })
    ),

  getRates: operatorProcedure.query(() => getRates()),

  updateRate: operatorProcedure
    .input(
      z.object({
        productId: z.number(),
        price: z.number().optional(),
        manualPrice: z.number().nullable().optional(),
        useApi: z.boolean().optional(),
        buySpread: z.number().optional(),
        sellSpread: z.number().optional(),
        isActive: z.boolean().optional(),
        canBuy: z.boolean().optional(),
        canSell: z.boolean().optional(),
        autoTrade: z.boolean().optional(),
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(({ input, ctx }) =>
      updateRate({
        ...input,
        actorUserId: ctx.user?.id,
        actorRole: ctx.user?.role,
      })
    ),

  getTransactions: operatorProcedure
    .input(
      z.object({
        page: z.number().optional(),
        pageSize: z.number().optional(),
        type: z.enum(['DEPOSIT', 'WITHDRAW', 'TRADE']).optional(),
        status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
        asset: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      }).optional()
    )
    .query(({ input }) => getTransactions(input)),
  getAdminKpis: operatorProcedure.query(() => getAdminKpis()),
  getAuditLogs: adminProcedure
    .input(z.object({ page: z.number().optional(), pageSize: z.number().optional() }).optional())
    .query(({ input }) => getAuditLogs(input)),

  instantTrade: protectedProcedure
  .input(
    z.object({
      asset: z.string(),
      type: z.string(),
      amount: z.number().positive(),
    })
  )
  .mutation(({ input, ctx }) =>
    instantTrade(
      ctx.user.id,
      input.asset as any,
      input.type as any,
      input.amount
    )
  ),

  createLimitOrder: protectedProcedure
    .input(
      z.object({
        asset: z.string(),
        type: z.enum(['BUY', 'SELL']),
        amount: z.number().positive(),
        price: z.number().positive(),
      })
    )
    .mutation(({ input, ctx }) =>
      createLimitOrder(ctx.user.id, input.asset, input.type as any, input.amount, input.price)
    ),

  getOrderBook: publicProcedure
  .input(
    z.object({
      asset: z.string().optional(),
    }).optional()
  )
  .query(({ input }) => getOrderBook(input?.asset)),

  getRecentTrades: publicProcedure
  .input(
    z.object({
      asset: z.string().optional(),
    }).optional()
  )
  .query(({ input }) => getRecentTrades(input?.asset)),

  cancelOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
      })
    )
    .mutation(({ input, ctx }) => cancelOrder(input.orderId, ctx.user.id)),

  getMyOpenOrders: protectedProcedure
    .input(z.object({ asset: z.string().optional() }).optional())
    .query(({ input, ctx }) =>
      prisma.order.findMany({
        where: {
          userId: ctx.user.id,
          orderMode: 'LIMIT',
          status: { in: ['PENDING', 'PARTIALLY_FILLED'] },
          ...(input?.asset ? { asset: input.asset as any } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
    ),

  getMyTransactions: protectedProcedure
    .query(({ ctx }) =>
      prisma.transaction.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
    ),

  matchOrders: operatorProcedure
    .input(z.object({ asset: z.string() }))
    .mutation(({ input }) => matchOrders(input.asset)),

  // ================= PRODUCTS =================

  getProducts: publicProcedure.query(() => getProducts()),

  createProduct: adminProcedure
    .input(
      z.object({
        name: z.string(),
        category: z.string(),
        apiId: z.number().nullable().optional(),
        useApi: z.boolean().optional(),
        manualPrice: z.number().nullable().optional(),
        buySpread: z.number().optional(),
        sellSpread: z.number().optional(),
        isActive: z.boolean().optional(),
        canBuy: z.boolean().optional(),
        canSell: z.boolean().optional(),
        autoTrade: z.boolean().optional(),
      })
    )
    .mutation(({ input, ctx }) => createProduct({ ...input, actorUserId: ctx.user?.id, actorRole: ctx.user?.role })),

  updateProduct: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        category: z.string().optional(),
        apiId: z.number().nullable().optional(),
        useApi: z.boolean().optional(),
        manualPrice: z.number().nullable().optional(),
        buySpread: z.number().optional(),
        sellSpread: z.number().optional(),
        isActive: z.boolean().optional(),
        canBuy: z.boolean().optional(),
        canSell: z.boolean().optional(),
        autoTrade: z.boolean().optional(),
      })
    )
    .mutation(({ input, ctx }) => updateProduct({ ...input, actorUserId: ctx.user?.id, actorRole: ctx.user?.role })),

  deleteProduct: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => deleteProduct(input.id, { userId: ctx.user?.id, role: ctx.user?.role })),

  // ================= MARKET (🔥 جدید) =================

  getWholesalers: operatorProcedure.query(() => getWholesalers()),

  addWholesaler: operatorProcedure
    .input(
      z.object({
        name: z.string(),
        apiUrl: z.string(),
        apiKey: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => addWholesaler({ ...input, actorUserId: ctx.user?.id, actorRole: ctx.user?.role })),

  updateWholesaler: operatorProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        apiUrl: z.string().optional(),
        apiKey: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(({ input, ctx }) => updateWholesaler({ ...input, actorUserId: ctx.user?.id, actorRole: ctx.user?.role })),

  deleteWholesaler: operatorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => deleteWholesaler(input.id, { userId: ctx.user?.id, role: ctx.user?.role })),

  getProductSettings: operatorProcedure.query(() => getProductSettings()),

  updateProductSettings: operatorProcedure
    .input(
      z.object({
        asset: z.string(),
        wholesalerId: z.number().nullable().optional(),
        spreadPercent: z.number().optional(),
        autoHedgeEnabled: z.boolean().optional(),
      })
    )
    .mutation(({ input, ctx }) => updateProductSettings({ ...input, actorUserId: ctx.user?.id, actorRole: ctx.user?.role })),
});

export type AppRouter = typeof appRouter;
