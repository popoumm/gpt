import React, { useMemo } from 'react';
import { GlassCard, GlassButton, GlassInput } from './components/GlassUI';
import Sidebar from './components/Sidebar';
import {
  TrendingUp,
  TrendingDown,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  RefreshCcw,
  Activity,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'wouter';
import { trpc } from './_core/trpc';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Prices() {
  const [search, setSearch] = React.useState('');
  const pricesQuery = trpc.getPrices.useQuery(undefined, { refetchInterval: 5000 });
  const productsQuery = trpc.getProducts.useQuery();

  const rows = useMemo(() => {
    const products = productsQuery.data ?? [];
    const prices = pricesQuery.data ?? {};

    return products
      .map((product: any) => {
        const market = prices[product.name];
        if (!market) return null;

        const change = market.basePrice ? ((market.buyPrice - market.basePrice) / market.basePrice) * 100 : 0;

        return {
          id: product.id,
          name: product.name,
          unit: product.unit,
          buyPrice: market.buyPrice,
          sellPrice: market.sellPrice,
          change,
        };
      })
      .filter(Boolean)
      .filter((row: any) => row.name.toLowerCase().includes(search.toLowerCase()));
  }, [productsQuery.data, pricesQuery.data, search]);

  return (
    <div className="min-h-screen relative overflow-hidden flex p-4 lg:p-8 gap-8">
      <div className="glow-bg" />
      <Sidebar />

      <motion.main variants={containerVariants} initial="hidden" animate="visible" className="flex-1 max-w-5xl mx-auto">
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-right">
            <h1 className="text-3xl font-bold mb-2 gold-text">قیمت لحظه‌ای بازار</h1>
            <p className="text-white/50 text-lg">دریافت مستقیم از سرویس قیمت</p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <GlassInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی نرخ..." className="pr-12 py-3" />
            </div>
            <GlassButton variant="secondary" className="px-5" onClick={() => pricesQuery.refetch()}><RefreshCcw size={20} /></GlassButton>
          </div>
        </motion.header>

        <div className="space-y-6">
          {rows.map((item: any) => {
            const up = item.change >= 0;

            return (
              <motion.div key={item.id} variants={itemVariants}>
                <GlassCard className="p-6 hover:bg-white/[0.03] transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${up ? 'bg-[#00FFA3]/10 border-[#00FFA3]/20 text-[#00FFA3]' : 'bg-[#FF4D4D]/10 border-[#FF4D4D]/20 text-[#FF4D4D]'}`}>
                        {up ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                      </div>
                      <div className="text-right">
                        <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-white/30">
                          <Clock size={12} /> به‌روزرسانی خودکار هر ۵ ثانیه
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-12">
                      <div className="text-left" dir="ltr">
                        <div className="text-sm mb-1">Buy: {Number(item.buyPrice).toLocaleString()} / Sell: {Number(item.sellPrice).toLocaleString()}</div>
                        <div className={`text-xs font-bold flex items-center gap-1 ${up ? 'text-[#00FFA3]' : 'text-[#FF4D4D]'}`}>
                          {up ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                          {Math.abs(item.change).toFixed(2)}%
                        </div>
                      </div>

                      <Link href="/trade">
                        <GlassButton variant="outline" className="px-8 py-3 text-xs group-hover:bg-[#FFD700] group-hover:text-black group-hover:border-[#FFD700] transition-all">
                          معامله سریع
                        </GlassButton>
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8 text-center border-[#FFD700]/20">
              <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] mx-auto mb-6">
                <Activity size={24} />
              </div>
              <h4 className="text-sm text-white/40 mb-2">تعداد دارایی‌های فعال</h4>
              <p className="text-xl font-bold gold-text">{rows.length}</p>
            </GlassCard>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
