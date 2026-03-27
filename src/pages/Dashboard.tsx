import React from 'react';
import { trpc } from '../_core/trpc';
import { GlassCard, GlassButton } from '../components/GlassUI';
import Sidebar from '../components/Sidebar';
import { Coins, History, Wallet, Gift } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'wouter';
import TradingModule from '../components/TradingModule';
import { useAuth } from '../_core/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const userId = user?.id;

  const prices = trpc.getPrices.useQuery(undefined, { refetchInterval: 5000 });
  const wallet = trpc.getWallet.useQuery(undefined, { enabled: Boolean(userId) });
  const transactions = trpc.getMyTransactions.useQuery(undefined, { enabled: Boolean(userId) });
  const products = trpc.getProducts.useQuery();

  const totalWallet = Object.entries(wallet.data ?? {}).reduce((acc, [asset, balance]: any) => {
    const n = Number(balance.total ?? 0);
    if (asset === 'USDT') return acc + n;
    const sell = prices.data?.[asset]?.sellPrice;
    return acc + (sell ? n * Number(sell) : 0);
  }, 0);

  return (
    <div className="min-h-screen relative overflow-hidden flex p-4 lg:p-8 gap-8">
      <Sidebar />

      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 max-w-7xl mx-auto space-y-8">
        <motion.header className="flex items-center justify-between">
          <div className="text-right">
            <h1 className="text-3xl font-bold mb-2 gold-text">خوش آمدید {user?.firstName ?? ''}</h1>
            <p className="text-white/50 text-lg">داشبورد متصل به داده واقعی</p>
          </div>
          <div className="flex gap-3">
            <Link href="/exchange"><GlassButton>واریز سریع</GlassButton></Link>
            <Link href="/shop"><GlassButton variant="secondary">خرید طلا</GlassButton></Link>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-2"><Coins size={18} /> قیمت GOLD</div>
            <p className="text-2xl font-bold">{Number(prices.data?.GOLD?.buyPrice ?? 0).toLocaleString()}</p>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-2"><Wallet size={18} /> ارزش کل کیف پول (USDT)</div>
            <p className="text-2xl font-bold">{totalWallet.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-2"><History size={18} /> تراکنش‌های اخیر</div>
            <p className="text-2xl font-bold">{transactions.data?.length ?? 0}</p>
          </GlassCard>
        </div>

        <TradingModule />

        <GlassCard className="p-6">
          <h3 className="font-bold mb-4">محصولات فعال</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {(products.data ?? []).map((p: any) => (
              <div key={p.id} className="rounded-xl p-3 bg-white/5 border border-white/10">
                <p className="font-bold">{p.name}</p>
                <p className="text-white/50">{p.category} · {p.unit}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <Link href="/referral">
          <GlassCard className="p-6 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><Gift size={20} /> سیستم دعوت دوستان</div>
              <span>مشاهده</span>
            </div>
          </GlassCard>
        </Link>
      </motion.main>
    </div>
  );
}
