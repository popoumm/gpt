import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from '../components/GlassUI';
import Sidebar from '../components/Sidebar';
import { 
  ArrowDown, 
  RefreshCcw, 
  Info, 
  ChevronDown,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

export default function Exchange() {
  const [fromAsset, setFromAsset] = useState('IRT');
  const [toAsset, setToAsset] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 2000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex p-4 lg:p-8 gap-8">
      <div className="glow-bg" />
      <Sidebar />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 max-w-4xl mx-auto"
      >
        <motion.header variants={itemVariants} className="mb-12 text-right">
          <h1 className="text-3xl font-bold mb-2 gold-text">تبادل آنی دارایی</h1>
          <p className="text-white/50 text-lg">تبدیل سریع و ایمن انواع ارزها با کمترین کارمزد</p>
        </motion.header>

        <motion.div variants={itemVariants} className="max-w-xl mx-auto">
          <GlassCard className="p-8 relative">
            <div className="space-y-6">
              {/* From Asset */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-2">
                  <span className="text-sm text-white/40">پرداخت می‌کنید</span>
                  <span className="text-xs text-white/30">موجودی: ۱۲,۵۰۰,۰۰۰ تومان</span>
                </div>
                <div className="relative group">
                  <GlassInput 
                    type="number" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-2xl font-bold py-6 pr-32" 
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-[10px] font-bold">IRT</div>
                    <span className="font-bold text-sm">تومان</span>
                    <ChevronDown size={16} className="text-white/30" />
                  </div>
                </div>
              </div>

              {/* Swap Icon */}
              <div className="flex justify-center -my-4 relative z-10">
                <button 
                  onClick={() => {
                    const temp = fromAsset;
                    setFromAsset(toAsset);
                    setToAsset(temp);
                  }}
                  className="w-12 h-12 rounded-2xl bg-[#FFD700] text-black flex items-center justify-center shadow-xl shadow-[#FFD700]/20 hover:scale-110 active:scale-95 transition-all"
                >
                  <RefreshCcw size={24} className={isSwapping ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* To Asset */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-2">
                  <span className="text-sm text-white/40">دریافت می‌کنید (تخمینی)</span>
                </div>
                <div className="relative group">
                  <GlassInput 
                    type="number" 
                    placeholder="0.00" 
                    readOnly
                    value={amount ? (Number(amount) / 50000).toFixed(2) : ''}
                    className="text-2xl font-bold py-6 pr-32 bg-white/[0.02]" 
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-[10px] font-bold">USDT</div>
                    <span className="font-bold text-sm">تتر</span>
                    <ChevronDown size={16} className="text-white/30" />
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">نرخ تبدیل</span>
                  <span className="font-medium">۱ تتر = ۵۰,۰۰۰ تومان</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">کارمزد شبکه</span>
                  <span className="font-medium">۰.۰۰۱ تتر</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">زمان تقریبی</span>
                  <span className="font-medium">کمتر از ۱ دقیقه</span>
                </div>
              </div>

              <GlassButton 
                className="w-full py-5 text-xl" 
                onClick={handleSwap}
                disabled={!amount || isSwapping}
              >
                {isSwapping ? 'در حال پردازش...' : 'تایید و تبادل'}
              </GlassButton>
            </div>
          </GlassCard>

          {/* Market Insights */}
          <motion.div variants={itemVariants} className="mt-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/10 flex items-center justify-center text-[#00FFA3]">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-white/30">روند بازار</p>
                  <p className="text-sm font-bold">صعودی (۲.۴٪+)</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-white/30">وضعیت شبکه</p>
                  <p className="text-sm font-bold">پایدار</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.main>
    </div>
  );
}
