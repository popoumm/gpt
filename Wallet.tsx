import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from '../components/GlassUI';
import Sidebar from '../components/Sidebar';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Coins, 
  Globe, 
  TrendingUp, 
  ChevronDown,
  Plus,
  ArrowRight,
  ShieldCheck,
  Activity,
  ChartBar,
  CreditCard,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

const assetDistribution = [
  { name: 'طلا', value: 45, color: '#FFD700' },
  { name: 'تتر', value: 30, color: '#00FFA3' },
  { name: 'ریال', value: 25, color: '#7C3AED' },
];

export default function Wallet() {
  const [activeTab, setActiveTab] = useState('all');
  const [showDeposit, setShowDeposit] = useState(false);

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
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-right">
            <h1 className="text-3xl font-bold mb-2 gold-text">کیف پول من</h1>
            <p className="text-white/50 text-lg">مدیریت و نظارت بر تمامی دارایی‌های شما در یک نگاه</p>
          </div>
          
          <div className="flex gap-4">
            <GlassButton className="flex items-center gap-2 px-8" onClick={() => setShowDeposit(true)}>
              <Plus size={20} /> واریز وجه
            </GlassButton>
            <GlassButton variant="secondary" className="flex items-center gap-2 px-8">
              <ArrowDownLeft size={20} /> برداشت
            </GlassButton>
          </div>
        </motion.header>

        {/* Deposit Modal Simulation */}
        <AnimatePresence>
          {showDeposit && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeposit(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg"
              >
                <GlassCard className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold gold-text">واریز وجه به حساب</h3>
                    <button onClick={() => setShowDeposit(false)} className="text-white/30 hover:text-white transition-colors">
                      <ArrowRight size={24} />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm text-white/40 pr-2">مبلغ واریزی (تومان)</label>
                      <GlassInput placeholder="مثلا ۵,۰۰۰,۰۰۰" type="number" className="text-xl font-bold" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm text-white/40 pr-2">انتخاب حساب بانکی</label>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <CreditCard size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-sm">بانک ملت - ۱۲۳۴</p>
                            <p className="text-[10px] text-white/30">امیرحسین رضایی</p>
                          </div>
                        </div>
                        <ChevronDown size={18} className="text-white/30" />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FFD700]/5 border border-[#FFD700]/10 flex items-start gap-3">
                      <Info size={18} className="text-[#FFD700] shrink-0 mt-0.5" />
                      <p className="text-[10px] text-white/50 leading-relaxed">
                        پس از کلیک بر روی دکمه پرداخت، به درگاه بانکی منتقل خواهید شد. لطفا فیلترشکن خود را خاموش کنید.
                      </p>
                    </div>

                    <GlassButton className="w-full py-4 text-lg" onClick={() => setShowDeposit(false)}>انتقال به درگاه پرداخت</GlassButton>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <GlassCard className="h-full relative overflow-hidden bg-gradient-to-br from-white/[0.05] to-transparent">
              <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="text-right">
                  <p className="text-white/40 mb-4 font-bold tracking-widest uppercase text-xs">Total Balance</p>
                  <h2 className="text-5xl font-bold mb-4 tracking-tight" dir="ltr">$12,850.75</h2>
                  <p className="text-lg text-[#00FFA3] font-bold flex items-center gap-2">
                    <TrendingUp size={20} />
                    <span>+۱۲.۵٪ سود کل</span>
                  </p>
                </div>
                
                <div className="w-64 h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetDistribution}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {assetDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
                                <p className="text-xs font-bold" style={{ color: payload[0].payload.color }}>
                                  {payload[0].name}: {payload[0].value}%
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <ChartBar size={40} className="text-white/10" />
                  </div>
                </div>
              </div>
              
              <div className="mt-12 grid grid-cols-3 gap-4">
                {assetDistribution.map((asset, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: asset.color }} />
                    <span className="text-xs text-white/40">{asset.name}</span>
                    <span className="font-bold">{asset.value}%</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard className="h-full flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 flex items-center justify-center">
                  <ShieldCheck size={24} className="text-[#FFD700]" />
                </div>
                <h3 className="text-xl font-bold">امنیت حساب</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#00FFA3]" />
                    <span className="text-sm font-medium">تایید دو مرحله‌ای</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-0.5 rounded-md uppercase">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#00FFA3]" />
                    <span className="text-sm font-medium">احراز هویت</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-0.5 rounded-md uppercase">Verified</span>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-[#FFD700]/5 border border-[#FFD700]/10">
                <p className="text-[10px] text-[#FFD700] font-bold mb-2 uppercase tracking-widest">Security Tip</p>
                <p className="text-xs text-white/50 leading-relaxed">
                  هرگز رمز عبور یا کد تایید خود را در اختیار دیگران قرار ندهید. تیم پشتیبانی هرگز از شما درخواست رمز عبور نمی‌کند.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Assets List */}
        <motion.div variants={itemVariants}>
          <GlassCard>
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-bold">لیست دارایی‌ها</h3>
              <div className="flex gap-2">
                {['همه', 'طلا', 'ارز دیجیتال', 'ریال'].map(t => (
                  <button 
                    key={t} 
                    onClick={() => setActiveTab(t)}
                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === t ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {[
                { name: 'طلای ۱۸ عیار', balance: '۱۲.۵ گرم', value: '۳۰,۶۲۵,۰۰۰ تومان', icon: <Coins size={24} className="text-[#FFD700]" />, color: '#FFD700' },
                { name: 'تتر (USDT)', balance: '۲۵۰.۰۰ تتر', value: '۱۲,۵۰۰,۰۰۰ تومان', icon: <Globe size={24} className="text-[#00FFA3]" />, color: '#00FFA3' },
                { name: 'ریال ایران', balance: '۵,۰۰۰,۰۰۰ ریال', value: '۵۰۰,۰۰۰ تومان', icon: <Activity size={24} className="text-[#7C3AED]" />, color: '#7C3AED' },
              ].map((asset, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all" style={{ color: asset.color }}>
                      {asset.icon}
                    </div>
                    <div>
                      <p className="font-bold text-xl mb-1">{asset.name}</p>
                      <p className="text-sm text-white/30">{asset.balance}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-2xl mb-1 tracking-tight">{asset.value}</p>
                    <div className="flex items-center justify-end gap-2 text-[#00FFA3] text-xs font-bold">
                      <TrendingUp size={14} />
                      <span>+۲.۴٪</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </motion.main>
    </div>
  );
}
