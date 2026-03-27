import prisma from './lib/prisma';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { registerUser, loginUser } from './services/auth';
import { Role } from '@prisma/client';
import { getWallet, deposit, withdraw } from './services/wallet';
import { instantTrade, getOrderBook, getRecentTrades } from './services/trading';
import { getLatestPrices } from './services/priceService';
import {
  getUsers,
  updateUserCredit,
  getRates,
  updateRate,
  getTransactions,
} from './services/admin';

import {
  getWholesalers,
  addWholesaler,
  updateWholesaler,
  deleteWholesaler,
  getProductSettings,
  updateProductSettings,
} from './services/market';

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from './services/product';

const t = initTRPC.create();

export const appRouter = t.router({
  // ================= AUTH =================

  register: t.procedure
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
    adminCreateUser: t.procedure
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

  login: t.procedure
    .input(
      z.object({
        phone: z.string(),
        password: z.string(),
      })
    )
    .mutation(({ input }) => loginUser(input)),
    getMe: t.procedure.query(async ({ ctx }) => {
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
    getMyReferral: t.procedure.query(async () => {
      return await prisma.user.findFirst({
        orderBy: { id: 'desc' }, // آخرین یوزر
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

  getPrices: t.procedure.query(() => getLatestPrices()),

  // ================= WALLET =================

  getWallet: t.procedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getWallet(input.userId)),

  deposit: t.procedure
    .input(
      z.object({
        userId: z.number(),
        asset: z.string(),
        amount: z.number(),
      })
    )
    .mutation(({ input }) =>
      deposit(input.userId, input.asset as any, input.amount)
    ),

  withdraw: t.procedure
    .input(
      z.object({
        userId: z.number(),
        asset: z.string(),
        amount: z.number(),
      })
    )
    .mutation(({ input }) =>
      withdraw(input.userId, input.asset as any, input.amount)
    ),

  // ================= TRADING =================

  // ================= ADMIN =================

  getUsers: t.procedure.query(() => getUsers()),

  updateUserCredit: t.procedure
    .input(
      z.object({
        userId: z.number(),
        creditLimitIrr: z.number().optional(),
        creditLimitGold: z.number().optional(),
        creditLimitUsdt: z.number().optional(),
      })
    )
    .mutation(({ input }) => updateUserCredit(input)),

  getRates: t.procedure.query(() => getRates()),

  updateRate: t.procedure
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
      })
    )
    .mutation(({ input }) => updateRate(input)),

  getTransactions: t.procedure.query(() => getTransactions()),

  instantTrade: t.procedure
  .input(
    z.object({
      userId: z.number(),
      asset: z.string(),
      type: z.string(),
      amount: z.number(),
    })
  )
  .mutation(({ input }) =>
    instantTrade(
      input.userId,
      input.asset as any,
      input.type as any,
      input.amount
    )
  ),

  getOrderBook: t.procedure
  .input(
    z.object({
      asset: z.string().optional(),
    }).optional()
  )
  .query(({ input }) => getOrderBook(input?.asset)),

  getRecentTrades: t.procedure
  .input(
    z.object({
      asset: z.string().optional(),
    }).optional()
  )
  .query(({ input }) => getRecentTrades(input?.asset)),

  // ================= PRODUCTS =================

  getProducts: t.procedure.query(() => getProducts()),

  createProduct: t.procedure
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
    .mutation(({ input }) => createProduct(input)),

  updateProduct: t.procedure
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
    .mutation(({ input }) => updateProduct(input)),

  deleteProduct: t.procedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteProduct(input.id)),

  // ================= MARKET (🔥 جدید) =================

  getWholesalers: t.procedure.query(() => getWholesalers()),

  addWholesaler: t.procedure
    .input(
      z.object({
        name: z.string(),
        apiUrl: z.string(),
        apiKey: z.string().optional(),
      })
    )
    .mutation(({ input }) => addWholesaler(input)),

  updateWholesaler: t.procedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        apiUrl: z.string().optional(),
        apiKey: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => updateWholesaler(input)),

  deleteWholesaler: t.procedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteWholesaler(input.id)),

  getProductSettings: t.procedure.query(() => getProductSettings()),

  updateProductSettings: t.procedure
    .input(
      z.object({
        asset: z.string(),
        wholesalerId: z.number().nullable().optional(),
        spreadPercent: z.number().optional(),
        autoHedgeEnabled: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => updateProductSettings(input)),
});

export type AppRouter = typeof appRouter;