import React, { useState, useEffect } from 'react';
import { trpc } from '../_core/trpc';
import { GlassCard, GlassButton, GlassInput } from '../components/GlassUI';
import Sidebar from '../components/Sidebar';
import { 
  TrendingUp, 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Zap,
  Info,
  Scale,
  Hash,
  Wallet,
  ChevronDown,
  Activity
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

const products = [
  { id: 'gold-18', name: 'طلای ۱۸ عیار', price: 2450000, unit: 'گرم', type: 'weight' },
  { id: 'gold-melted', name: 'طلای آب شده', price: 2435000, unit: 'گرم', type: 'weight' },
  { id: 'coin-full', name: 'سکه تمام بهار', price: 32800000, unit: 'عدد', type: 'quantity' },
  { id: 'coin-half', name: 'نیم سکه', price: 18500000, unit: 'عدد', type: 'quantity' },
  { id: 'coin-quarter', name: 'ربع سکه', price: 11200000, unit: 'عدد', type: 'quantity' },
];

export default function Trade() {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [inputMode, setInputMode] = useState<'amount' | 'total'>('amount');
  const [amount, setAmount] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  
  const walletQuery = trpc.getWallet.useQuery();
  const usersQuery = trpc.getUsers.useQuery(); // In a real app, we'd have a getMe or similar
  const placeOrder = trpc.placeOrder.useMutation();
  const utils = trpc.useUtils();

  // For demo, we'll assume the first user is the current user
  const currentUser = usersQuery.data?.[0];

  // Sync amount and total price
  useEffect(() => {
    if (inputMode === 'amount') {
      if (amount) {
        setTotalPrice((Number(amount) * selectedProduct.price).toString());
      } else {
        setTotalPrice('');
      }
    }
  }, [amount, selectedProduct, inputMode]);

  useEffect(() => {
    if (inputMode === 'total') {
      if (totalPrice) {
        setAmount((Number(totalPrice) / selectedProduct.price).toFixed(3));
      } else {
        setAmount('');
      }
    }
  }, [totalPrice, selectedProduct, inputMode]);

  const handleTrade = async () => {
    if (!currentUser) return;
    
    try {
      await placeOrder.mutateAsync({
        userId: currentUser.id,
        asset: selectedProduct.id.includes('gold') ? 'GOLD' : 'USDT',
        type: tradeType,
        amount: Number(amount),
        rate: selectedProduct.price,
      });
      
      setAmount('');
      setTotalPrice('');
      utils.getWallet.invalidate();
      alert('معامله با موفقیت ثبت شد');
    } catch (error: any) {
      alert(error.message || 'خطا در ثبت معامله');
    }
  };

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
          <h1 className="text-3xl font-bold mb-2 gold-text">ترمینال معاملاتی</h1>
          <p className="text-white/50 text-lg">خرید و فروش حرفه‌ای طلا و مسکوکات با قیمت لحظه‌ای</p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trade Form */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <GlassCard className="p-8">
              <div className="flex gap-4 mb-8">
                <button 
                  onClick={() => setTradeType('buy')}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${tradeType === 'buy' ? 'bg-[#00FFA3] text-black shadow-lg shadow-[#00FFA3]/20' : 'bg-white/5 text-white/40 border border-white/10'}`}
                >
                  <ArrowUpRight size={20} />
                  خرید
                </button>
                <button 
                  onClick={() => setTradeType('sell')}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${tradeType === 'sell' ? 'bg-[#FF4D4D] text-black shadow-lg shadow-[#FF4D4D]/20' : 'bg-white/5 text-white/40 border border-white/10'}`}
                >
                  <ArrowDownLeft size={20} />
                  فروش
                </button>
              </div>

              <div className="space-y-8">
                {/* Product Selection */}
                <div className="space-y-3">
                  <label className="text-xs text-white/30 font-bold uppercase tracking-widest px-2">انتخاب محصول</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProduct(p)}
                        className={`p-4 rounded-2xl border transition-all text-right group ${selectedProduct.id === p.id ? 'bg-[#FFD700]/10 border-[#FFD700] text-[#FFD700]' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                      >
                        <p className="text-xs font-bold mb-1">{p.name}</p>
                        <p className="text-[10px] opacity-60">{p.price.toLocaleString()} تومان</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Mode Toggle */}
                <div className="flex justify-center">
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button 
                      onClick={() => setInputMode('amount')}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${inputMode === 'amount' ? 'bg-white/10 text-white' : 'text-white/30'}`}
                    >
                      بر اساس {selectedProduct.unit}
                    </button>
                    <button 
                      onClick={() => setInputMode('total')}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${inputMode === 'total' ? 'bg-white/10 text-white' : 'text-white/30'}`}
                    >
                      بر اساس مبلغ (تومان)
                    </button>
                  </div>
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between px-2">
                      <label className="text-xs text-white/30 font-bold uppercase tracking-widest">مقدار ({selectedProduct.unit})</label>
                      {selectedProduct.type === 'weight' ? <Scale size={14} className="text-white/20" /> : <Hash size={14} className="text-white/20" />}
                    </div>
                    <GlassInput 
                      type="number" 
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => {
                        setInputMode('amount');
                        setAmount(e.target.value);
                      }}
                      className="text-xl font-bold py-5"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between px-2">
                      <label className="text-xs text-white/30 font-bold uppercase tracking-widest">مبلغ کل (تومان)</label>
                      <Coins size={14} className="text-white/20" />
                    </div>
                    <GlassInput 
                      type="number" 
                      placeholder="0"
                      value={totalPrice}
                      onChange={(e) => {
                        setInputMode('total');
                        setTotalPrice(e.target.value);
                      }}
                      className="text-xl font-bold py-5"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/40">قیمت واحد</span>
                    <span className="font-bold">{selectedProduct.price.toLocaleString()} تومان</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/40">کارمزد معامله (۰.۱٪)</span>
                    <span className="font-bold text-[#FFD700]">{(Number(totalPrice || 0) * 0.001).toLocaleString()} تومان</span>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-lg font-bold">مبلغ نهایی</span>
                    <span className="text-2xl font-bold gold-text">{(Number(totalPrice || 0) * (tradeType === 'buy' ? 1.001 : 0.999)).toLocaleString()} تومان</span>
                  </div>
                </div>

                <GlassButton 
                  className={`w-full py-6 text-xl ${tradeType === 'buy' ? 'bg-[#00FFA3] shadow-[#00FFA3]/20' : 'bg-[#FF4D4D] shadow-[#FF4D4D]/20'}`}
                  onClick={handleTrade}
                  disabled={!amount || placeOrder.isPending}
                >
                  {placeOrder.isPending ? 'در حال ثبت سفارش...' : `تایید نهایی ${tradeType === 'buy' ? 'خرید' : 'فروش'}`}
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <motion.div variants={itemVariants}>
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/10 flex items-center justify-center text-[#00FFA3]">
                    <Wallet size={20} />
                  </div>
                  <h3 className="font-bold">موجودی و اعتبار</h3>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/40">تومان</span>
                      <span className="font-bold">{(walletQuery.data?.irr || 0).toLocaleString()}</span>
                    </div>
                    {currentUser?.creditLimitIrr > 0 && (
                      <div className="flex justify-between items-center text-[10px] text-yellow-400/60">
                        <span>اعتبار ریالی</span>
                        <span>{currentUser.creditLimitIrr.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/40">طلای ۱۸ عیار</span>
                      <span className="font-bold">{walletQuery.data?.gold || 0} گرم</span>
                    </div>
                    {currentUser?.creditLimitGold > 0 && (
                      <div className="flex justify-between items-center text-[10px] text-yellow-400/60">
                        <span>اعتبار طلا</span>
                        <span>{currentUser.creditLimitGold} گرم</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/40">تتر (USDT)</span>
                      <span className="font-bold">{walletQuery.data?.usdt || 0} واحد</span>
                    </div>
                    {currentUser?.creditLimitUsdt > 0 && (
                      <div className="flex justify-between items-center text-[10px] text-yellow-400/60">
                        <span>اعتبار تتر</span>
                        <span>{currentUser.creditLimitUsdt} واحد</span>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
                    <Activity size={20} />
                  </div>
                  <h3 className="font-bold">وضعیت بازار</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40">انس جهانی</span>
                    <span className="font-bold text-[#00FFA3]">$2,154.20</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40">دلار (بازار آزاد)</span>
                    <span className="font-bold">۶۰,۲۰۰ تومان</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="p-6 rounded-3xl bg-[#FFD700]/5 border border-[#FFD700]/10">
                <div className="flex items-center gap-3 mb-4 text-[#FFD700]">
                  <Zap size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">نکته معاملاتی</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  شما می‌توانید با وارد کردن مبلغ کل (مثلاً ۲۰۰ میلیون تومان)، مقدار دقیق طلا را بر اساس قیمت لحظه‌ای دریافت کنید. سیستم به صورت خودکار محاسبات را انجام می‌دهد.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
