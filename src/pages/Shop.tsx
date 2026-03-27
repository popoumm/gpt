import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from '../components/GlassUI';
import Sidebar from '../components/Sidebar';
import { 
  ShoppingBag, 
  TrendingUp, 
  History, 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck,
  ChevronDown,
  LineChart as ChartIcon,
  Search,
  Filter,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'wouter';
import { Plus, X } from 'lucide-react';

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

const initialProducts = [
  { id: 1, name: 'طلای ۱۸ عیار', price: '۲,۴۵۰,۰۰۰', change: '+۱.۲٪', unit: 'گرم', icon: <Coins size={24} className="text-[#FFD700]" /> },
  { id: 2, name: 'طلای آب شده', price: '۲,۴۳۵,۰۰۰', change: '+۱.۵٪', unit: 'گرم', icon: <Coins size={24} className="text-[#FFD700]" /> },
  { id: 3, name: 'سکه تمام بهار آزادی', price: '۳۲,۸۰۰,۰۰۰', change: '+۰.۸٪', unit: 'عدد', icon: <Coins size={24} className="text-[#FFD700]" /> },
  { id: 4, name: 'نیم سکه', price: '۱۸,۵۰۰,۰۰۰', change: '-۰.۳٪', unit: 'عدد', icon: <Coins size={24} className="text-[#FFD700]" /> },
  { id: 5, name: 'ربع سکه', price: '۱۱,۲۰۰,۰۰۰', change: '+۱.۵٪', unit: 'عدد', icon: <Coins size={24} className="text-[#FFD700]" /> },
  { id: 6, name: 'شمش ۱۰ گرمی', price: '۲۵,۲۰۰,۰۰۰', change: '+۰.۵٪', unit: 'عدد', icon: <Coins size={24} className="text-[#FFD700]" /> },
];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', unit: 'گرم' });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const id = products.length + 1;
    setProducts([...products, { ...newProduct, id, change: '۰٪', icon: <Coins size={24} className="text-[#FFD700]" /> }]);
    setIsModalOpen(false);
    setNewProduct({ name: '', price: '', unit: 'گرم' });
  };

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
            <h1 className="text-3xl font-bold mb-2 gold-text">لیست محصولات</h1>
            <p className="text-white/50 text-lg">مدیریت و مشاهده تمامی محصولات طلا و مسکوکات</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <GlassButton onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6">
              <Plus size={20} /> افزودن محصول
            </GlassButton>
            <div className="relative flex-1 md:w-64">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <GlassInput placeholder="جستجوی محصول..." className="pr-12 py-3" />
            </div>
          </div>
        </motion.header>

        {/* Categories */}
        <motion.div variants={itemVariants} className="flex gap-4 mb-12 overflow-x-auto no-scrollbar pb-4">
          {['همه محصولات', 'طلای آب شده', 'سکه و شمش', 'جواهرات', 'سرمایه‌گذاری'].map((cat, i) => (
            <button 
              key={i} 
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-[#FFD700] text-black border-[#FFD700] shadow-lg shadow-[#FFD700]/20' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'}`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <GlassCard className="group h-full relative overflow-hidden">
                <div className="absolute top-4 right-4 z-10">
                  <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/30 hover:text-[#FFD700]">
                    <Star size={18} />
                  </button>
                </div>
                
                <div className="mb-8 flex justify-center">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/5 flex items-center justify-center border border-[#FFD700]/10 group-hover:scale-110 transition-transform duration-500">
                    {product.icon}
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${product.change.startsWith('+') ? 'bg-[#00FFA3]/10 text-[#00FFA3]' : 'bg-[#FF4D4D]/10 text-[#FF4D4D]'}`}>
                      {product.change}
                    </span>
                    <span className="text-[10px] text-white/30">تغییرات ۲۴ساعت</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-right">
                      <span className="text-[10px] text-white/30 block mb-1">قیمت هر {product.unit}</span>
                      <div className="text-left" dir="ltr">
                        <span className="text-xl font-bold">{product.price}</span>
                        <span className="text-[10px] text-white/30 ml-1">تومان</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/trade">
                    <GlassButton className="w-full py-4 text-sm">خرید و فروش</GlassButton>
                  </Link>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Add Product Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md glass-panel p-8"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold gold-text">افزودن محصول جدید</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs text-white/40 px-2">نام محصول</label>
                    <GlassInput 
                      required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="مثلاً: شمش ۵ گرمی" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/40 px-2">قیمت (تومان)</label>
                    <GlassInput 
                      required
                      type="text"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="مثلاً: ۱۲,۰۰۰,۰۰۰" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/40 px-2">واحد اندازه‌گیری</label>
                    <select 
                      className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--gold-primary)]/50 transition-all"
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    >
                      <option value="گرم">گرم</option>
                      <option value="عدد">عدد</option>
                      <option value="مثقال">مثقال</option>
                    </select>
                  </div>
                  <GlassButton type="submit" className="w-full py-4 mt-4">ثبت محصول</GlassButton>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Market Analysis Banner */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-10 relative overflow-hidden bg-gradient-to-r from-[#FFD700]/10 to-transparent border-[#FFD700]/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
              <div className="text-right max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="text-[#FFD700]" size={24} />
                  <span className="text-[#FFD700] font-bold tracking-widest uppercase text-xs">Verified Asset</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">سرمایه‌گذاری هوشمند در طلا</h2>
                <p className="text-white/50 leading-relaxed">
                  با خرید طلای دیجیتال، دارایی خود را در برابر تورم بیمه کنید. ما طلا را با فاکتور رسمی و ضمانت اصالت برای شما نگهداری یا ارسال می‌کنیم.
                </p>
                <div className="mt-8 flex gap-4">
                  <GlassButton className="px-8">مشاهده جزئیات</GlassButton>
                  <GlassButton variant="outline" className="px-8">راهنمای خرید</GlassButton>
                </div>
              </div>
              <div className="w-64 h-64 relative">
                <div className="absolute inset-0 bg-[#FFD700]/20 blur-[60px] rounded-full animate-pulse"></div>
                <Coins size={200} className="text-[#FFD700] relative z-10 rotate-12 drop-shadow-[0_0_30px_rgba(255,215,0,0.3)]" />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.main>
    </div>
  );
}
