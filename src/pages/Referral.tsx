import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from '../components/GlassUI';
import Sidebar from '../components/Sidebar';
import { 
  Users, 
  Gift, 
  Copy, 
  Share2, 
  TrendingUp, 
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Info,
  Award
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

export default function Referral() {
  const [referralCode] = useState('GOLD-AMIR-882');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralStats = [
    { label: 'تعداد دعوت‌ها', value: '۱۲ نفر', icon: <Users size={20} />, color: 'text-blue-400' },
    { label: 'پورسانت دریافتی', value: '۱,۲۵۰,۰۰۰ تومان', icon: <DollarSign size={20} />, color: 'text-[#00FFA3]' },
    { label: 'پاداش فعال', icon: <Award size={20} />, value: 'سطح طلایی', color: 'text-[#FFD700]' },
  ];

  const referredUsers = [
    { id: 1, name: 'رضا محمدی', date: '۱۴۰۲/۱۲/۰۱', status: 'فعال', commission: '۱۵۰,۰۰۰' },
    { id: 2, name: 'سارا احمدی', date: '۱۴۰۲/۱۱/۲۵', status: 'فعال', commission: '۸۵,۰۰۰' },
    { id: 3, name: 'علی کریمی', date: '۱۴۰۲/۱۱/۲۰', status: 'در انتظار', commission: '۰' },
  ];

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
        <motion.header variants={itemVariants} className="mb-12 text-right">
          <h1 className="text-3xl font-bold mb-2 gold-text">کسب درآمد و دعوت از دوستان</h1>
          <p className="text-white/50 text-lg">با دعوت از دوستان خود، در هر معامله آن‌ها پورسانت دریافت کنید</p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Referral Card */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <GlassCard className="p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-30" />
              
              <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
                <div className="w-32 h-32 rounded-full bg-[#FFD700]/10 flex items-center justify-center border-2 border-[#FFD700]/20 relative">
                  <div className="absolute inset-0 bg-[#FFD700]/5 blur-2xl rounded-full animate-pulse" />
                  <Gift size={60} className="text-[#FFD700] relative z-10" />
                </div>
                <div className="text-right flex-1">
                  <h2 className="text-2xl font-bold mb-4">کد دعوت اختصاصی شما</h2>
                  <p className="text-white/40 text-sm leading-relaxed mb-6">
                    این کد را با دوستان خود به اشتراک بگذارید. آن‌ها با ثبت‌نام از طریق این کد، پاداش خوش‌آمدگویی دریافت می‌کنند و شما در سود معاملات آن‌ها شریک می‌شوید.
                  </p>
                  
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <GlassInput 
                        readOnly 
                        value={referralCode} 
                        className="text-center font-mono tracking-widest text-xl py-4 border-[#FFD700]/30 text-[#FFD700]" 
                      />
                    </div>
                    <GlassButton onClick={handleCopy} className="px-8 flex items-center gap-2">
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.span 
                            key="check" 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            className="flex items-center gap-2 text-[#00FFA3]"
                          >
                            <CheckCircle2 size={20} /> کپی شد
                          </motion.span>
                        ) : (
                          <motion.span 
                            key="copy" 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            className="flex items-center gap-2"
                          >
                            <Copy size={20} /> کپی کد
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </GlassButton>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/5">
                <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[#FFD700] font-bold text-xl mb-1">۱۰٪</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest">پورسانت معاملات</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[#00FFA3] font-bold text-xl mb-1">۵۰,۰۰۰</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest">پاداش ثبت‌نام</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-blue-400 font-bold text-xl mb-1">نامحدود</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest">سقف درآمد</div>
                </div>
              </div>
            </GlassCard>

            <motion.div variants={itemVariants} className="mt-8">
              <GlassCard className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">لیست افراد دعوت شده</h3>
                  <div className="text-[10px] text-white/30 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    آخرین بروزرسانی: امروز
                  </div>
                </div>
                
                <div className="space-y-4">
                  {referredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                          <Users size={20} />
                        </div>
                        <div>
                          <p className="font-bold">{user.name}</p>
                          <p className="text-[10px] text-white/20">{user.date}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className={`text-xs font-bold mb-1 ${user.status === 'فعال' ? 'text-[#00FFA3]' : 'text-white/30'}`}>
                          {user.status}
                        </p>
                        <p className="text-sm font-bold">{user.commission} تومان پورسانت</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>

          {/* Stats Sidebar */}
          <div className="space-y-8">
            <motion.div variants={itemVariants}>
              <GlassCard className="p-8">
                <h3 className="font-bold mb-8 flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#FFD700]" />
                  آمار درآمد شما
                </h3>
                <div className="space-y-8">
                  {referralStats.map((stat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                          {stat.icon}
                        </div>
                        <span className="text-sm text-white/40">{stat.label}</span>
                      </div>
                      <span className="font-bold text-lg">{stat.value}</span>
                    </div>
                  ))}
                </div>
                <GlassButton variant="secondary" className="w-full mt-10 py-4 flex items-center justify-center gap-2">
                  تسویه حساب پورسانت <ArrowRight size={18} />
                </GlassButton>
              </GlassCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                <div className="flex items-center gap-3 mb-4 text-blue-400">
                  <Info size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">قوانین پورسانت</span>
                </div>
                <ul className="text-[10px] text-white/40 space-y-3 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1" />
                    پورسانت به صورت آنی پس از انجام معامله توسط زیرمجموعه واریز می‌شود.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1" />
                    حداقل مبلغ تسویه حساب پورسانت ۱۰۰,۰۰۰ تومان می‌باشد.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1" />
                    دعوت از خود با اکانت‌های دیگر منجر به مسدودی حساب خواهد شد.
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <GlassCard className="p-6 text-center">
                <Share2 size={32} className="mx-auto mb-4 text-white/20" />
                <h4 className="font-bold mb-2">اشتراک‌گذاری سریع</h4>
                <div className="flex justify-center gap-4 mt-6">
                  <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#FFD700]/10 hover:border-[#FFD700]/30 transition-all">
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" className="w-6 h-6 invert opacity-40" alt="Telegram" />
                  </button>
                  <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#FFD700]/10 hover:border-[#FFD700]/30 transition-all">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" className="w-6 h-6 invert opacity-40" alt="WhatsApp" />
                  </button>
                  <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#FFD700]/10 hover:border-[#FFD700]/30 transition-all">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" className="w-6 h-6 invert opacity-40" alt="Instagram" />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
