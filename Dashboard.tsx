import React from 'react';
import { trpc } from '../_core/trpc';
import { GlassCard, GlassButton } from '../components/GlassUI';
import Sidebar from '../components/Sidebar';
import { 
  TrendingUp, 
  Bell, 
  ChevronDown,
  Globe,
  LineChart as ChartIcon,
  Newspaper,
  History,
  Coins,
  ArrowUp,
  ShoppingBag,
  ArrowUpRight,
  Plus,
  ArrowDownLeft,
  Wallet,
  Gift
} from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'wouter';

import TradingModule from '../components/TradingModule';

const portfolioData = [
  { name: '1', value: 4000 },
  { name: '2', value: 4500 },
  { name: '3', value: 4200 },
  { name: '4', value: 5250 },
  { name: '5', value: 6000 },
  { name: '6', value: 8670 },
  { name: '7', value: 9500 },
  { name: '8', value: 12820 },
  { name: '9', value: 12000 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const [activeTimeframe, setActiveTimeframe] = React.useState('ماهانه');
  const rates = trpc.getRates.useQuery();
  const wallet = trpc.getWallet.useQuery();
  const transactions = trpc.getTransactions.useQuery();

  return (
    <div className="min-h-screen relative overflow-hidden flex p-4 lg:p-8 gap-8">
      <div className="glow-bg" />
      
      <Sidebar />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.header variants={itemVariants} className="flex items-center justify-between mb-12">
          <div className="text-right">
            <h1 className="text-3xl font-bold mb-2 gold-text">خوش آمدید!</h1>
            <p className="text-white/50 text-lg">مدیریت مالی حرفه‌ای در دستان شما</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3">
              <Link href="/exchange">
                <GlassButton className="flex items-center gap-2 text-xs py-2 px-4">
                  <Plus size={16} /> واریز سریع
                </GlassButton>
              </Link>
              <Link href="/shop">
                <GlassButton variant="secondary" className="flex items-center gap-2 text-xs py-2 px-4">
                  <ShoppingBag size={16} /> خرید طلا
                </GlassButton>
              </Link>
            </div>

            <button className="relative p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
              <Bell size={24} className="text-white/70 group-hover:text-white" />
              <span className="absolute top-2 right-2 w-3 h-3 bg-[#FF4D4D] rounded-full border-2 border-[#0A0A0A]"></span>
            </button>
            
            <Link href="/settings">
              <div className="flex items-center gap-4 p-2 pr-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
                <div className="text-left">
                  <p className="text-sm font-bold">امیرحسین عزیز</p>
                  <p className="text-[10px] text-white/40">کاربر ویژه</p>
                </div>
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#FFD700]/30 group-hover:border-[#FFD700] transition-all">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <ChevronDown size={20} className="text-white/30 group-hover:text-white/60 transition-colors" />
              </div>
            </Link>
          </div>
        </motion.header>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Gold Price */}
          <motion.div variants={itemVariants}>
            <GlassCard className="relative group h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 flex items-center justify-center">
                  <Coins size={24} className="text-[#FFD700]" />
                </div>
                <span className="text-white/60 font-bold">قیمت طلا</span>
              </div>
              <div className="mb-4">
                <h2 className="text-4xl font-bold tracking-tight">2,450,000 <span className="text-sm font-normal text-white/30">تومان</span></h2>
              </div>
              <div className="flex items-center gap-2 text-[#00FFA3] font-bold text-lg">
                <TrendingUp size={20} />
                <span>1.2% +</span>
              </div>
              <Coins size={100} className="absolute -bottom-6 -right-6 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
            </GlassCard>
          </motion.div>

          {/* Exchange Rates */}
          <motion.div variants={itemVariants}>
            <GlassCard className="h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#A855F7]/10 flex items-center justify-center">
                    <Globe size={24} className="text-[#A855F7]" />
                  </div>
                  <span className="text-white/60 font-bold">نرخ ارزهای اصلی</span>
                </div>
                <Link href="/prices">
                  <GlassButton variant="secondary" className="text-[10px] px-3 py-1">مشاهده همه</GlassButton>
                </Link>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-5 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[8px] font-bold">USD</div>
                    <span className="text-sm font-medium">دلار آمریکا</span>
                  </div>
                  <div className="text-left" dir="ltr">
                    <span className="font-bold text-xl">282,500</span>
                    <span className="text-[10px] text-white/30 ml-1">تومان</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-5 rounded bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-[8px] font-bold text-yellow-500">EUR</div>
                    <span className="text-sm font-medium">یورو ریال</span>
                  </div>
                  <div className="text-left" dir="ltr">
                    <span className="font-bold text-xl">305,700</span>
                    <span className="text-[10px] text-white/30 ml-1">تومان</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Account Balance */}
          <motion.div variants={itemVariants}>
            <GlassCard className="h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#00FFA3]/10 flex items-center justify-center">
                  <ChartIcon size={24} className="text-[#00FFA3]" />
                </div>
                <span className="text-white/60 font-bold">موجودی حساب</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-bold mb-2 tracking-tight" dir="ltr">$12,850.75</h2>
                  <p className="text-white/40 text-sm">حساب کارگزاری</p>
                </div>
                <div className="h-16 w-24">
                  <div className="flex items-end gap-1 h-full">
                    {[4, 7, 5, 8, 6, 10, 9].map((h, i) => (
                      <div 
                        key={i} 
                        className={`w-2 rounded-full ${i > 4 ? 'candle-up' : 'candle-down'}`} 
                        style={{ height: `${h * 10}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Portfolio Overview Chart */}
        <motion.div variants={itemVariants} className="mb-12">
          <GlassCard className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
              <h3 className="text-2xl font-bold gold-text">بررسی سبد دارایی</h3>
              <div className="flex gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                {['روزانه', 'هفتگی', 'ماهانه', 'سالانه'].map(t => (
                  <button 
                    key={t} 
                    onClick={() => setActiveTimeframe(t)}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTimeframe === t ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20' : 'text-white/30 hover:text-white/60'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-[400px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioData}>
                  <defs>
                    <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD700" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-black/80 backdrop-blur-xl border border-[#FFD700]/30 p-4 rounded-2xl shadow-2xl">
                            <p className="text-[#FFD700] font-bold text-lg" dir="ltr">${payload[0].value?.toLocaleString()}</p>
                            <p className="text-white/40 text-[10px]">ارزش کل دارایی</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#FFD700" 
                    strokeWidth={5} 
                    fillOpacity={1} 
                    fill="url(#colorGold)" 
                    animationDuration={2500}
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              {/* Candlestick Overlay Simulation */}
              <div className="absolute bottom-12 left-0 w-full h-20 flex items-end justify-around px-12 pointer-events-none opacity-30">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-0.5 h-3 ${i % 4 === 0 ? 'bg-[#FF4D4D]' : 'bg-[#00FFA3]'}`}></div>
                    <div className={`w-2.5 h-8 rounded-sm ${i % 4 === 0 ? 'bg-[#FF4D4D]' : 'bg-[#00FFA3]'}`}></div>
                    <div className={`w-0.5 h-3 ${i % 4 === 0 ? 'bg-[#FF4D4D]' : 'bg-[#00FFA3]'}`}></div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Trading Activity Module */}
        <motion.div variants={itemVariants} className="mb-12">
          <TradingModule />
        </motion.div>

        {/* Referral Banner */}
        <motion.div variants={itemVariants} className="mb-12">
          <Link href="/referral">
            <GlassCard className="p-6 bg-gradient-to-r from-[#FFD700]/10 to-transparent border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] group-hover:scale-110 transition-transform">
                    <Gift size={28} />
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold mb-1">کسب درآمد با دعوت از دوستان</h3>
                    <p className="text-sm text-white/40">با اشتراک‌گذاری کد دعوت خود، در سود معاملات دوستانتان شریک شوید</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[#FFD700] font-bold">
                  مشاهده جزئیات <ArrowUpRight size={20} />
                </div>
              </div>
            </GlassCard>
          </Link>
        </motion.div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <motion.div variants={itemVariants}>
            <GlassCard className="h-full">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 flex items-center justify-center">
                    <History size={24} className="text-[#FFD700]" />
                  </div>
                  <h3 className="text-2xl font-bold">تراکنش‌های اخیر</h3>
                </div>
                <Link href="/wallet">
                  <GlassButton variant="secondary" className="text-xs">مشاهده همه</GlassButton>
                </Link>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between group cursor-pointer p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[#FFD700]/30 transition-all">
                      <ShoppingBag size={24} className="text-[#FFD700]" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">خرید طلا</p>
                      <p className="text-xs text-white/30">۲ ساعت پیش</p>
                    </div>
                  </div>
                  <div className="text-left" dir="ltr">
                    <p className="text-[#FF4D4D] font-bold text-xl">7,500,000 -</p>
                    <p className="text-[10px] text-white/30">تومان</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between group cursor-pointer p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[#00FFA3]/30 transition-all">
                      <ArrowUpRight size={24} className="text-[#00FFA3]" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">واریز وجه</p>
                      <p className="text-xs text-white/30">دیروز، ۱۸:۳۰</p>
                    </div>
                  </div>
                  <div className="text-left" dir="ltr">
                    <p className="text-[#00FFA3] font-bold text-xl">5,000,000 +</p>
                    <p className="text-[10px] text-white/30">تومان</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Market News */}
          <motion.div variants={itemVariants}>
            <GlassCard className="h-full">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 flex items-center justify-center">
                    <Newspaper size={24} className="text-[#FFD700]" />
                  </div>
                  <h3 className="text-2xl font-bold">اخبار بازار</h3>
                </div>
                <Link href="/news">
                  <GlassButton variant="secondary" className="text-xs">مشاهده همه</GlassButton>
                </Link>
              </div>
              
              <div className="space-y-6">
                {[
                  { title: "تحلیل هفتگی بازار طلا و ارز", icon: <TrendingUp size={24} className="text-[#A855F7]" />, value: "5,000,000" },
                  { title: "پیش‌بینی نرخ دلار و یورو در سال جدید", icon: <ChartIcon size={24} className="text-blue-400" />, value: "3,200,000" },
                  { title: "تاثیر انس جهانی بر بازار داخلی", icon: <Globe size={24} className="text-[#FFD700]" />, value: "1,800,000" }
                ].map((news, i) => (
                  <div key={i} className="flex items-center gap-5 group cursor-pointer p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[#FFD700]/30 transition-all">
                      {news.icon}
                    </div>
                    <div className="flex-1 border-b border-white/5 pb-4 group-hover:border-white/10 transition-all">
                      <p className="font-bold text-lg mb-2">{news.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-md" dir="ltr">{news.value} تومان</span>
                        <span className="text-[10px] text-white/20">خبر ویژه</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Dot Indicator */}
              <div className="mt-8 flex justify-center gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === 1 ? 'bg-[#FFD700] w-6' : 'bg-white/10'}`} />
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
