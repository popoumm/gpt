import React, { useState } from 'react';
import { trpc } from '../_core/trpc';
import { GlassCard, GlassButton, GlassInput } from '../components/GlassUI';
import Sidebar from '../components/Sidebar';
import { 
  Users, 
  Settings, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  Globe,
  DollarSign,
  ShoppingBag,
  RefreshCw,
  Zap,
  CreditCard
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../_core/ThemeContext';
import { UserRole } from '../types';

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

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'rates' | 'transactions' | 'market'>('users');
  const { userRole, setUserRole } = useTheme();
  const rates = trpc.getRates.useQuery();
  
  // Mock data for admin view
  const platformStats = [
    { label: 'کل کاربران', value: '۱,۲۴۰', icon: <Users size={20} />, color: 'text-blue-400' },
    { label: 'حجم معاملات ۲۴ساعت', value: '۴۵۰,۰۰۰,۰۰۰ تومان', icon: <Activity size={20} />, color: 'text-[#00FFA3]' },
    { label: 'تراکنش‌های در انتظار', value: '۱۲', icon: <Clock size={20} />, color: 'text-yellow-400' },
    { label: 'ضریب امنیت سیستم', value: '۹۹.۹٪', icon: <ShieldCheck size={20} />, color: 'text-[#FFD700]' },
  ];

  // Only SUPER_ADMIN sees Profit/Loss
  if (userRole === UserRole.SUPER_ADMIN) {
    platformStats.push({ label: 'سود خالص پلتفرم', value: '۸۵,۲۰۰,۰۰۰ تومان', icon: <DollarSign size={20} />, color: 'text-emerald-400' });
    platformStats.push({ label: 'مجموع کارمزدها', value: '۱۲,۸۰۰,۰۰۰ تومان', icon: <TrendingUp size={20} />, color: 'text-indigo-400' });
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex p-4 lg:p-8 gap-8">
      <div className="glow-bg" />
      
      <Sidebar />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 max-w-7xl mx-auto glass-panel p-6 lg:p-10 min-h-[90vh]"
      >
        {/* Header */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-right">
            <h1 className="text-3xl font-bold mb-2 gold-text">
              {userRole === UserRole.SUPER_ADMIN ? "مدیریت کل سیستم" : "پنل مدیریت عملیاتی"}
            </h1>
            <p className="text-white/50 text-lg">
              {userRole === UserRole.SUPER_ADMIN 
                ? "نظارت کامل بر تمامی تراکنش‌ها، سود و زیان و کاربران" 
                : "مدیریت نرخ‌ها، تایید کاربران و نظارت بر تراکنش‌ها"}
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20' : 'text-white/30 hover:text-white/60'}`}
              >
                <Users size={18} /> کاربران
              </button>
              <button 
                onClick={() => setActiveTab('rates')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'rates' ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20' : 'text-white/30 hover:text-white/60'}`}
              >
                <TrendingUp size={18} /> نرخ‌ها
              </button>
              <button 
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'transactions' ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20' : 'text-white/30 hover:text-white/60'}`}
              >
                <Activity size={18} /> تراکنش‌ها
              </button>
              <button 
                onClick={() => setActiveTab('market')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'market' ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20' : 'text-white/30 hover:text-white/60'}`}
              >
                <RefreshCw size={18} /> تنظیمات بازار
              </button>
            </div>
            
            {/* Role Switcher for Demo */}
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setUserRole(UserRole.SUPER_ADMIN)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${userRole === UserRole.SUPER_ADMIN ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-white/30'}`}
              >
                مدیریت کل
              </button>
              <button 
                onClick={() => setUserRole(UserRole.ADMIN)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${userRole === UserRole.ADMIN ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-white/30'}`}
              >
                مدیر عملیاتی
              </button>
              <button 
                onClick={() => setUserRole(UserRole.TRADER)}
                className="px-3 py-1 rounded-lg text-[10px] font-bold border bg-white/5 border-white/10 text-white/30 hover:bg-white/10"
              >
                خروج به پنل کاربر
              </button>
            </div>
          </div>
        </motion.header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {platformStats.map((stat, i) => (
            <motion.div key={i} variants={itemVariants}>
              <GlassCard className="flex items-center gap-4 h-full">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <motion.div variants={itemVariants}>
        {activeTab === 'users' && <UserManagement userRole={userRole} />}
        {activeTab === 'rates' && <RateManagement rates={rates.data} />}
        {activeTab === 'transactions' && <TransactionManagement userRole={userRole} />}
        {activeTab === 'market' && <MarketManagement />}
        </motion.div>
      </motion.main>
    </div>
  );
}

function UserManagement({ userRole }: { userRole: UserRole }) {
  const usersQuery = trpc.getUsers.useQuery();
  const updateCredit = trpc.updateUserCredit.useMutation();
  const utils = trpc.useUtils();
  const [editingUser, setEditingUser] = useState<any>(null);

  const handleUpdateCredit = async () => {
    if (!editingUser) return;
    await updateCredit.mutateAsync({
      userId: editingUser.id,
      creditLimitIrr: editingUser.creditLimitIrr || 0,
      creditLimitGold: editingUser.creditLimitGold || 0,
      creditLimitUsdt: editingUser.creditLimitUsdt || 0,
    });
    setEditingUser(null);
    utils.getUsers.invalidate();
    alert('محدودیت‌های اعتباری با موفقیت بروزرسانی شد');
  };

  return (
    <div className="space-y-8">
      <GlassCard className="overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h3 className="text-xl font-bold">مدیریت کاربران و اعتبارات</h3>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <GlassInput placeholder="جستجوی کاربر..." className="pr-12 py-2.5 text-sm" />
            </div>
            <GlassButton variant="secondary" className="px-4"><Filter size={18} /></GlassButton>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right">
            <thead>
              <tr className="text-white/40 text-sm border-b border-white/5">
                <th className="pb-4 font-medium">نام کاربر</th>
                <th className="pb-4 font-medium">وضعیت احراز</th>
                <th className="pb-4 font-medium">اعتبار ریالی</th>
                <th className="pb-4 font-medium">اعتبار طلا/تتر</th>
                <th className="pb-4 font-medium">تاریخ عضویت</th>
                <th className="pb-4 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {usersQuery.data?.map((user) => (
                <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/5 flex items-center justify-center font-bold text-[#FFD700]">
                        {user.fullName?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-bold">{user.fullName || 'کاربر جدید'}</p>
                        <p className="text-[10px] text-white/30">{user.mobile || user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold bg-[#00FFA3]/10 text-[#00FFA3]">
                      <CheckCircle2 size={12} /> تایید شده
                    </span>
                  </td>
                  <td className="py-5 font-bold text-sm">
                    {user.creditLimitIrr?.toLocaleString() || 0} ریال
                  </td>
                  <td className="py-5 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#FFD700]">{user.creditLimitGold || 0} گرم طلا</span>
                      <span className="text-blue-400">{user.creditLimitUsdt || 0} تتر</span>
                    </div>
                  </td>
                  <td className="py-5 text-white/40 text-sm">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fa-IR') : '-'}
                  </td>
                  <td className="py-5">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-[#FFD700]"
                        title="مدیریت اعتبار"
                      >
                        <CreditCard size={18} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Credit Management Modal (Simplified as a card below) */}
      {editingUser && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <GlassCard className="w-full max-w-lg space-y-8 relative">
            <button 
              onClick={() => setEditingUser(null)}
              className="absolute left-6 top-6 text-white/30 hover:text-white"
            >
              <XCircle size={24} />
            </button>

            <div className="text-right">
              <h3 className="text-2xl font-bold gold-text mb-2">مدیریت اعتبار معاملاتی</h3>
              <p className="text-white/50 text-sm">تنظیم محدودیت برای: {editingUser.fullName}</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-white/40 pr-2">سقف اعتبار ریالی (ریال)</label>
                <GlassInput 
                  type="number"
                  value={editingUser.creditLimitIrr}
                  onChange={(e) => setEditingUser({ ...editingUser, creditLimitIrr: parseFloat(e.target.value) })}
                  placeholder="مثلاً: ۵۰۰,۰۰۰,۰۰۰"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-white/40 pr-2">سقف اعتبار طلا (گرم)</label>
                  <GlassInput 
                    type="number"
                    value={editingUser.creditLimitGold}
                    onChange={(e) => setEditingUser({ ...editingUser, creditLimitGold: parseFloat(e.target.value) })}
                    placeholder="مثلاً: ۵۰"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/40 pr-2">سقف اعتبار تتر (واحد)</label>
                  <GlassInput 
                    type="number"
                    value={editingUser.creditLimitUsdt}
                    onChange={(e) => setEditingUser({ ...editingUser, creditLimitUsdt: parseFloat(e.target.value) })}
                    placeholder="مثلاً: ۱۰۰۰"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-4">
                <ShieldCheck className="text-yellow-400 shrink-0 mt-1" size={20} />
                <div className="space-y-2">
                  <p className="text-xs text-yellow-100/70 leading-relaxed">
                    با تعیین اعتبار، کاربر می‌تواند تا سقف مشخص شده بدون داشتن موجودی (به صورت منفی) معامله انجام دهد.
                  </p>
                  <div className="p-3 rounded-xl bg-black/20 text-[10px] text-yellow-200/50 leading-relaxed">
                    <span className="font-bold text-yellow-400">مثال:</span> اگر کاربر ۱۰۰ میلیون تومان موجودی دارد و شما ۵۰ میلیون تومان اعتبار به او می‌دهید، او می‌تواند تا سقف ۱۵۰ میلیون تومان خرید انجام دهد.
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <GlassButton 
                  onClick={handleUpdateCredit}
                  className="flex-1 py-4"
                  disabled={updateCredit.isPending}
                >
                  {updateCredit.isPending ? 'در حال ذخیره...' : 'بروزرسانی اعتبار'}
                </GlassButton>
                <GlassButton 
                  variant="secondary" 
                  onClick={() => setEditingUser(null)}
                  className="px-8"
                >
                  انصراف
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}

function RateManagement({ rates }: { rates: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <GlassCard>
        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
          <Coins className="text-[#FFD700]" /> تنظیم نرخ طلا و جواهرات
        </h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-white/40 pr-2">طلای ۱۸ عیار (هر گرم)</label>
            <div className="flex gap-4">
              <GlassInput defaultValue="2,450,000" className="text-lg font-bold" />
              <GlassButton className="whitespace-nowrap">بروزرسانی</GlassButton>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/40 pr-2">سکه تمام بهار آزادی</label>
            <div className="flex gap-4">
              <GlassInput defaultValue="32,800,000" className="text-lg font-bold" />
              <GlassButton className="whitespace-nowrap">بروزرسانی</GlassButton>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
          <Globe className="text-blue-400" /> تنظیم نرخ ارزهای بین‌المللی
        </h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-white/40 pr-2">دلار آمریکا (فروش)</label>
            <div className="flex gap-4">
              <GlassInput defaultValue="282,500" className="text-lg font-bold" />
              <GlassButton className="whitespace-nowrap">بروزرسانی</GlassButton>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/40 pr-2">یورو (فروش)</label>
            <div className="flex gap-4">
              <GlassInput defaultValue="305,700" className="text-lg font-bold" />
              <GlassButton className="whitespace-nowrap">بروزرسانی</GlassButton>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function MarketManagement() {
  const wholesalers = trpc.getWholesalers.useQuery();
  const productSettings = trpc.getProductSettings.useQuery();
  
  const addWholesaler = trpc.addWholesaler.useMutation();
  const updateWholesaler = trpc.updateWholesaler.useMutation();
  const deleteWholesaler = trpc.deleteWholesaler.useMutation();
  const updateProduct = trpc.updateProductSettings.useMutation();

  const [newWholesaler, setNewWholesaler] = useState({ name: '', apiUrl: '', apiKey: '' });
  const [editingWholesaler, setEditingWholesaler] = useState<any>(null);

  const utils = trpc.useUtils();

  const handleAddWholesaler = async () => {
    await addWholesaler.mutateAsync(newWholesaler);
    setNewWholesaler({ name: '', apiUrl: '', apiKey: '' });
    utils.getWholesalers.invalidate();
  };

  const handleUpdateProduct = async (id: number, data: any) => {
    await updateProduct.mutateAsync({ id, ...data });
    utils.getProductSettings.invalidate();
    utils.getRates.invalidate();
  };

  return (
    <div className="space-y-12">
      {/* Wholesalers List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <Globe className="text-blue-400" /> لیست بنکداران (Wholesalers)
            </h3>
          </div>
          
          <div className="space-y-4">
            {wholesalers.data?.map((w) => (
              <div key={w.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                <div>
                  <p className="font-bold">{w.name}</p>
                  <p className="text-[10px] text-white/30">{w.apiUrl}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => deleteWholesaler.mutateAsync({ id: w.id }).then(() => utils.getWholesalers.invalidate())}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            ))}
            {!wholesalers.data?.length && <p className="text-center text-white/20 py-8">هیچ بنکداری تعریف نشده است</p>}
          </div>
        </GlassCard>

        <GlassCard className="space-y-6">
          <h3 className="text-lg font-bold">افزودن بنکدار جدید</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-white/40 pr-2">نام بنکدار</label>
              <GlassInput 
                value={newWholesaler.name} 
                onChange={(e) => setNewWholesaler({ ...newWholesaler, name: e.target.value })}
                placeholder="مثلاً: بنکداری مرکزی" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/40 pr-2">آدرس API</label>
              <GlassInput 
                value={newWholesaler.apiUrl} 
                onChange={(e) => setNewWholesaler({ ...newWholesaler, apiUrl: e.target.value })}
                placeholder="https://api.provider.com" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/40 pr-2">API Key</label>
              <GlassInput 
                type="password"
                value={newWholesaler.apiKey} 
                onChange={(e) => setNewWholesaler({ ...newWholesaler, apiKey: e.target.value })}
                placeholder="••••••••" 
              />
            </div>
            <GlassButton 
              onClick={handleAddWholesaler}
              className="w-full"
              disabled={addWholesaler.isPending}
            >
              {addWholesaler.isPending ? 'در حال ثبت...' : 'ثبت بنکدار'}
            </GlassButton>
          </div>
        </GlassCard>
      </div>

      {/* Product Settings */}
      <GlassCard className="space-y-8">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <Zap className="text-[#FFD700]" /> تنظیمات اختصاصی محصولات
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="text-white/40 text-sm border-b border-white/5">
                <th className="pb-4 font-medium">نام محصول</th>
                <th className="pb-4 font-medium">انتخاب بنکدار (API)</th>
                <th className="pb-4 font-medium">اسپرد (درصد)</th>
                <th className="pb-4 font-medium">معامله خودکار</th>
                <th className="pb-4 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {productSettings.data?.map((ps) => (
                <tr key={ps.id} className="group">
                  <td className="py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] font-bold text-xs">
                        {ps.asset[0]}
                      </div>
                      <span className="font-bold">{ps.asset}</span>
                    </div>
                  </td>
                  <td className="py-6">
                    <select 
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFD700]/50 w-48"
                      value={ps.wholesalerId || ''}
                      onChange={(e) => handleUpdateProduct(ps.id, { wholesalerId: e.target.value ? parseInt(e.target.value) : null })}
                    >
                      <option value="" className="bg-[#1a1a1a]">انتخاب نشده</option>
                      {wholesalers.data?.map(w => (
                        <option key={w.id} value={w.id} className="bg-[#1a1a1a]">{w.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-2 w-24">
                      <input 
                        type="number" 
                        step="0.01"
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFD700]/50 w-full"
                        defaultValue={ps.spreadPercent}
                        onBlur={(e) => handleUpdateProduct(ps.id, { spreadPercent: parseFloat(e.target.value) })}
                      />
                      <span className="text-xs text-white/30">%</span>
                    </div>
                  </td>
                  <td className="py-6">
                    <button 
                      onClick={() => handleUpdateProduct(ps.id, { autoHedgeEnabled: !ps.autoHedgeEnabled })}
                      className={`w-10 h-6 rounded-full transition-all relative ${ps.autoHedgeEnabled ? 'bg-[#00FFA3]' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${ps.autoHedgeEnabled ? 'right-5' : 'right-1'}`} />
                    </button>
                  </td>
                  <td className="py-6">
                    <span className="text-[10px] text-white/20">بروزرسانی خودکار</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function TransactionManagement({ userRole }: { userRole: UserRole }) {
  const transactions = [
    { id: 1, user: 'امیرحسین رضایی', type: 'deposit', amount: '۵,۰۰۰,۰۰۰ تومان', status: 'success', date: '۱۰:۳۰ - ۱۴۰۲/۱۲/۲۱' },
    { id: 2, user: 'سارا محمدی', type: 'withdraw', amount: '۲,۳۰۰,۰۰۰ تومان', status: 'pending', date: '۰۹:۱۵ - ۱۴۰۲/۱۲/۲۱' },
    { id: 3, user: 'محمد کریمی', type: 'buy_gold', amount: '۱۲,۴۰۰,۰۰۰ تومان', status: 'success', date: '۱۸:۴۵ - ۱۴۰۲/۱۲/۲۰' },
    { id: 4, user: 'ناشناس', type: 'deposit', amount: '۱,۰۰۰,۰۰۰ تومان', status: 'failed', date: '۱۴:۲۰ - ۱۴۰۲/۱۲/۲۰' },
  ];

  return (
    <GlassCard>
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold">گزارش تمامی تراکنش‌ها</h3>
        {userRole === UserRole.SUPER_ADMIN && <GlassButton variant="secondary" className="text-xs">خروجی اکسل</GlassButton>}
      </div>

      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 transition-all ${
                tx.type === 'deposit' ? 'bg-[#00FFA3]/10 text-[#00FFA3] group-hover:border-[#00FFA3]/30' :
                tx.type === 'withdraw' ? 'bg-[#FF4D4D]/10 text-[#FF4D4D] group-hover:border-[#FF4D4D]/30' :
                'bg-[#FFD700]/10 text-[#FFD700] group-hover:border-[#FFD700]/30'
              }`}>
                {tx.type === 'deposit' ? <ArrowUpRight size={20} /> : 
                 tx.type === 'withdraw' ? <ArrowDownLeft size={20} /> : 
                 <ShoppingBag size={20} />}
              </div>
              <div>
                <p className="font-bold">{tx.user}</p>
                <p className="text-[10px] text-white/30">{tx.date}</p>
              </div>
            </div>
            <div className="text-left">
              <p className={`font-bold text-lg ${
                tx.type === 'deposit' ? 'text-[#00FFA3]' :
                tx.type === 'withdraw' ? 'text-[#FF4D4D]' :
                'text-white'
              }`}>{tx.amount}</p>
              <p className={`text-[10px] font-bold ${
                tx.status === 'success' ? 'text-[#00FFA3]' :
                tx.status === 'pending' ? 'text-yellow-400' :
                'text-[#FF4D4D]'
              }`}>
                {tx.status === 'success' ? 'موفق' : tx.status === 'pending' ? 'در حال بررسی' : 'ناموفق'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
