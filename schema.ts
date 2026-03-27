import { pgTable, text, integer, real, timestamp } from 'drizzle-orm/pg-core';

// Note: Using pg-core types but will use better-sqlite3 for dev as requested.
// Drizzle handles the translation if we use the sqlite-core equivalent.
import { sqliteTable, text as sqliteText, integer as sqliteInteger, real as sqliteReal } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: sqliteInteger('id').primaryKey({ autoIncrement: true }),
  mobile: sqliteText('mobile').unique(),
  email: sqliteText('email').unique(),
  password: sqliteText('password'), // For admin
  role: sqliteText('role').default('user'), // 'user', 'admin'
  fullName: sqliteText('full_name'),
  creditLimitIrr: sqliteReal('credit_limit_irr').default(0),
  creditLimitGold: sqliteReal('credit_limit_gold').default(0),
  creditLimitUsdt: sqliteReal('credit_limit_usdt').default(0),
  createdAt: sqliteInteger('created_at', { mode: 'timestamp' }).default(new Date()),
});

export const wallets = sqliteTable('wallets', {
  id: sqliteInteger('id').primaryKey({ autoIncrement: true }),
  userId: sqliteInteger('user_id').references(() => users.id),
  irrBalance: sqliteReal('irr_balance').default(0),
  usdtBalance: sqliteReal('usdt_balance').default(0),
  goldBalance: sqliteReal('gold_balance').default(0), // in grams
});

export const transactions = sqliteTable('transactions', {
  id: sqliteInteger('id').primaryKey({ autoIncrement: true }),
  userId: sqliteInteger('user_id').references(() => users.id),
  type: sqliteText('type'), // 'deposit', 'withdraw', 'exchange'
  asset: sqliteText('asset'), // 'IRR', 'USDT', 'GOLD'
  amount: sqliteReal('amount'),
  status: sqliteText('status').default('pending'), // 'pending', 'completed', 'failed'
  createdAt: sqliteInteger('created_at', { mode: 'timestamp' }).default(new Date()),
});

export const marketRates = sqliteTable('market_rates', {
  id: sqliteInteger('id').primaryKey({ autoIncrement: true }),
  asset: sqliteText('asset').unique(), // 'USDT_IRR', 'GOLD_IRR'
  rate: sqliteReal('rate'),
  updatedAt: sqliteInteger('updated_at', { mode: 'timestamp' }).default(new Date()),
});

export const wholesalers = sqliteTable('wholesalers', {
  id: sqliteInteger('id').primaryKey({ autoIncrement: true }),
  name: sqliteText('name'),
  apiUrl: sqliteText('api_url'),
  apiKey: sqliteText('api_key'),
  createdAt: sqliteInteger('created_at', { mode: 'timestamp' }).default(new Date()),
});

export const productSettings = sqliteTable('product_settings', {
  id: sqliteInteger('id').primaryKey({ autoIncrement: true }),
  asset: sqliteText('asset').unique(), // 'GOLD', 'USDT', 'BTC'
  wholesalerId: sqliteInteger('wholesaler_id').references(() => wholesalers.id),
  spreadPercent: sqliteReal('spread_percent').default(0),
  autoHedgeEnabled: sqliteInteger('auto_hedge_enabled', { mode: 'boolean' }).default(false),
  updatedAt: sqliteInteger('updated_at', { mode: 'timestamp' }).default(new Date()),
});

export const systemSettings = sqliteTable('system_settings', {
  id: sqliteInteger('id').primaryKey({ autoIncrement: true }),
  globalAutoHedgeEnabled: sqliteInteger('global_auto_hedge_enabled', { mode: 'boolean' }).default(false),
  updatedAt: sqliteInteger('updated_at', { mode: 'timestamp' }).default(new Date()),
});
