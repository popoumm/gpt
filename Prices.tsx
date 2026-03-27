import React from 'react';
import { GlassCard, GlassButton, GlassInput } from '../components/GlassUI';
import Sidebar from '../components/Sidebar';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock,
  RefreshCcw,
  Coins,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'wouter';

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

const priceData = [
  { id: 1, name: 'طلای ۱۸ عیار', price: 2450000, change: 1.2, unit: 'گرم', trend: 'up' },
  { id: 2, name: 'طلای آب شده', price: 2435000, change: 1.5, unit: 'گرم', trend: 'up' },
  { id: 3, name: 'سکه تمام بهار', price: 32800000, change: 0.8, unit: 'عدد', trend: 'up' },
  { id: 4, name: 'نیم سکه', price: 18500000, change: -0.3, unit: 'عدد', trend: 'down' },
  { id: 5, name: 'ربع سکه', price: 11200000, change: 1.5, unit: 'عدد', trend: 'up' },
  { id: 6, name: 'شمش ۱۰ گرمی', price: 25200000, change: 0.5, unit: 'عدد', trend: 'up' },
  { id: 7, name: 'طلای ۲۴ عیار', price: 3266000, change: 1.1, unit: 'گرم', trend: 'up' },
  { id: 8, name: 'انس جهانی طلا', price: 2154.20, change: 0.4, unit: 'دلار', trend: 'up' },
  { id: 9, name: 'دلار (بازار آزاد)', price: 60200, change: 0.2, unit: 'تومان', trend: 'up' },
  { id: 10, name: 'یورو', price: 65400, change: -0.1, unit: 'تومان', trend: 'down' },
];

export default function Prices() {
  return (
    <div className="min-h-screen relative overflow-hidden flex p-4 lg:p-8 gap-8">
      <div className="glow-bg" />
      <Sidebar />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 max-w-5xl mx-auto"
      >
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-right">
            <h1 className="text-3xl font-bold mb-2 gold-text">قیمت لحظه‌ای بازار</h1>
            <p className="text-white/50 text-lg">نرخ‌های زنده طلا، سکه و ارزهای رایج</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <GlassInput placeholder="جستجوی نرخ..." className="pr-12 py-3" />
            </div>
            <GlassButton variant="secondary" className="px-5"><RefreshCcw size={20} /></GlassButton>
          </div>
        </motion.header>

        <div className="space-y-6">
          {priceData.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <GlassCard className="p-6 hover:bg-white/[0.03] transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${item.trend === 'up' ? 'bg-[#00FFA3]/10 border-[#00FFA3]/20 text-[#00FFA3]' : 'bg-[#FF4D4D]/10 border-[#FF4D4D]/20 text-[#FF4D4D]'}`}>
                      {item.trend === 'up' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </div>
                    <div className="text-right">
                      <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-white/30">
                        <Clock size={12} /> بروزرسانی: همین الان
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                    <div className="text-left" dir="ltr">
                      <div className="text-2xl font-bold mb-1">
                        {item.price.toLocaleString()}
                        <span className="text-[10px] text-white/30 ml-2">{item.unit}</span>
                      </div>
                      <div className={`text-xs font-bold flex items-center gap-1 ${item.trend === 'up' ? 'text-[#00FFA3]' : 'text-[#FF4D4D]'}`}>
                        {item.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        {Math.abs(item.change)}٪
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
          ))}
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8 text-center border-[#00FFA3]/20">
              <div className="w-12 h-12 rounded-2xl bg-[#00FFA3]/10 flex items-center justify-center text-[#00FFA3] mx-auto mb-6">
                <TrendingUp size={24} />
              </div>
              <h4 className="text-sm text-white/40 mb-2">بیشترین رشد</h4>
              <p className="text-xl font-bold text-[#00FFA3]">طلای آب شده (+۱.۵٪)</p>
            </GlassCard>
          </motion.div>
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8 text-center border-[#FF4D4D]/20">
              <div className="w-12 h-12 rounded-2xl bg-[#FF4D4D]/10 flex items-center justify-center text-[#FF4D4D] mx-auto mb-6">
                <TrendingDown size={24} />
              </div>
              <h4 className="text-sm text-white/40 mb-2">بیشترین کاهش</h4>
              <p className="text-xl font-bold text-[#FF4D4D]">نیم سکه (-۰.۳٪)</p>
            </GlassCard>
          </motion.div>
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8 text-center border-[#FFD700]/20">
              <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] mx-auto mb-6">
                <Activity size={24} />
              </div>
              <h4 className="text-sm text-white/40 mb-2">حجم معاملات</h4>
              <p className="text-xl font-bold gold-text">۱۲.۵ کیلوگرم</p>
            </GlassCard>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
