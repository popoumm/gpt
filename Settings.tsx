import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { GlassCard, GlassButton, GlassInput } from '../components/GlassUI';
import Sidebar from '../components/Sidebar';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Globe, 
  CreditCard, 
  ChevronRight,
  Camera,
  CheckCircle2,
  Lock,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  Plus,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

import { useTheme } from '../_core/ThemeContext';
import { UserRole } from '../types';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const backgroundOptions = [
  { id: 'none', label: 'بدون تصویر', url: '' },
  { id: 'gold', label: 'طلای درخشان', url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1920' },
  { id: 'crypto', label: 'ارز دیجیتال', url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1920' },
  { id: 'abstract', label: 'انتزاعی مدرن', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920' },
  { id: 'dark', label: 'بافت تیره', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920' },
];

const accentOptions = [
  { id: 'gold', color: '#FFD700', label: 'طلایی' },
  { id: 'emerald', color: '#10B981', label: 'زمردی' },
  { id: 'violet', color: '#8B5CF6', label: 'بنفش' },
  { id: 'blue', color: '#3B82F6', label: 'آبی' },
  { id: 'rose', color: '#F43F5E', label: 'رز' },
];

export default function Settings() {
  const [location] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const initialSection = queryParams.get('section') || 'profile';
  
  const [activeSection, setActiveSection] = useState(initialSection);
  const [showPassword, setShowPassword] = useState(false);
  const { 
    bgImage, setBgImage, 
    accentColor, setAccentColor, 
    glassOpacity, setGlassOpacity,
    siteName, setSiteName,
    heroTitle, setHeroTitle,
    heroSubtitle, setHeroSubtitle,
    heroDescription, setHeroDescription,
    userRole, setUserRole
  } = useTheme();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sections = [
    { id: 'profile', label: 'پروفایل کاربری', icon: <User size={20} /> },
    { id: 'appearance', label: 'ظاهر وبسایت', icon: <SettingsIcon size={20} /> },
    { id: 'identity', label: 'هویت برند', icon: <Globe size={20} /> },
    { id: 'security', label: 'امنیت و ورود', icon: <Shield size={20} /> },
    { id: 'notifications', label: 'اطلاع‌رسانی‌ها', icon: <Bell size={20} /> },
    { id: 'accounts', label: 'حساب‌های بانکی', icon: <CreditCard size={20} /> },
    { id: 'language', label: 'زبان و منطقه', icon: <Globe size={20} /> },
    { id: 'demo', label: 'تنظیمات دمو (نقش‌ها)', icon: <TrendingUp size={20} /> },
  ];

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
        <motion.header variants={itemVariants} className="mb-12 text-right">
          <h1 className="text-3xl font-bold mb-2 gold-text">تنظیمات حساب کاربری</h1>
          <p className="text-white/50 text-lg">مدیریت اطلاعات شخصی، امنیت و ترجیحات سیستم</p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <GlassCard className="p-4 space-y-2">
              {sections.map((section) => (
                <button 
                  key={section.id} 
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${activeSection === section.id ? 'bg-[#FFD700] text-black font-bold shadow-lg shadow-[#FFD700]/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={activeSection === section.id ? 'text-black' : 'text-white/40 group-hover:text-[#FFD700]'}>
                      {section.icon}
                    </div>
                    <span className="text-sm">{section.label}</span>
                  </div>
                  <ChevronRight size={16} className={activeSection === section.id ? 'text-black' : 'text-white/20'} />
                </button>
              ))}
            </GlassCard>
          </motion.div>

          {/* Content */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <GlassCard className="p-10">
              {activeSection === 'profile' && (
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row items-center gap-10 border-b border-white/5 pb-10">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#FFD700]/30 group-hover:border-[#FFD700] transition-all">
                        <img 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <button className="absolute -bottom-4 -right-4 w-12 h-12 rounded-2xl bg-[#FFD700] text-black flex items-center justify-center shadow-xl shadow-[#FFD700]/20 hover:scale-110 active:scale-95 transition-all">
                        <Camera size={20} />
                      </button>
                    </div>
                    <div className="text-center md:text-right">
                      <h3 className="text-2xl font-bold mb-2">امیرحسین رضایی</h3>
                      <p className="text-white/40 text-sm mb-4">کاربر سطح ۲ - احراز هویت شده</p>
                      <div className="flex items-center justify-center md:justify-end gap-2 text-[#00FFA3] text-xs font-bold">
                        <CheckCircle2 size={16} />
                        <span>هویت شما تایید شده است</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm text-white/40 pr-2">نام و نام خانوادگی</label>
                      <GlassInput defaultValue="امیرحسین رضایی" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm text-white/40 pr-2">شماره موبایل</label>
                      <GlassInput defaultValue="۰۹۱۲۳۴۵۶۷۸۹" readOnly className="bg-white/[0.02] text-white/40" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm text-white/40 pr-2">آدرس ایمیل</label>
                      <GlassInput defaultValue="amir@example.com" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm text-white/40 pr-2">کد ملی</label>
                      <GlassInput defaultValue="۱۲۳۴۵۶۷۸۹۰" readOnly className="bg-white/[0.02] text-white/40" />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                    <GlassButton variant="secondary" className="px-10">انصراف</GlassButton>
                    <GlassButton className="px-10">ذخیره تغییرات</GlassButton>
                  </div>
                </div>
              )}

              {activeSection === 'appearance' && (
                <div className="space-y-12">
                  {/* Background Images */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold flex items-center gap-3">
                        <Globe className="text-[#FFD700]" /> تصویر پس‌زمینه
                      </h3>
                      <label className="cursor-pointer">
                        <GlassButton variant="secondary" className="text-xs py-2">
                          <Camera size={14} className="ml-2" /> آپلود تصویر دلخواه
                        </GlassButton>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {backgroundOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setBgImage(opt.url)}
                          className={`relative aspect-video rounded-2xl overflow-hidden border-2 transition-all group ${bgImage === opt.url ? 'border-[#FFD700] scale-105 shadow-lg shadow-[#FFD700]/20' : 'border-white/5 hover:border-white/20'}`}
                        >
                          {opt.url ? (
                            <img src={opt.url} alt={opt.label} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-[10px] text-white/40">None</div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center p-2">
                            <span className="text-[10px] font-bold">{opt.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Colors */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <TrendingUp className="text-[#FFD700]" /> رنگ اصلی (Accent)
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {accentOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setAccentColor(opt.color)}
                          className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${accentColor === opt.color ? 'border-white/40 bg-white/10' : 'border-white/5 hover:border-white/10'}`}
                        >
                          <div className="w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: opt.color }} />
                          <span className="text-sm font-medium">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Glass Opacity */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <Shield className="text-[#FFD700]" /> شفافیت پنل‌ها (Glassmorphism)
                    </h3>
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/5 space-y-6">
                      <div className="flex justify-between text-sm text-white/40">
                        <span>بسیار شفاف</span>
                        <span>مات</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.01" 
                        max="0.2" 
                        step="0.01" 
                        value={glassOpacity}
                        onChange={(e) => setGlassOpacity(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FFD700]"
                      />
                      <div className="text-center">
                        <span className="text-xs font-bold text-[#FFD700]">{(glassOpacity * 500).toFixed(0)}% شدت شیشه</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'identity' && (
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <Globe className="text-[#FFD700]" /> هویت برند و محتوا
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm text-white/40 mr-2">نام وب‌سایت</label>
                        <GlassInput 
                          value={siteName} 
                          onChange={(e) => setSiteName(e.target.value)} 
                          placeholder="مثلاً: PM Holding" 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm text-white/40 mr-2">عنوان اصلی (Hero Title)</label>
                          <GlassInput 
                            value={heroTitle} 
                            onChange={(e) => setHeroTitle(e.target.value)} 
                            placeholder="مدیریت هوشمند دارایی‌های" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white/40 mr-2">زیرعنوان (Hero Subtitle)</label>
                          <GlassInput 
                            value={heroSubtitle} 
                            onChange={(e) => setHeroSubtitle(e.target.value)} 
                            placeholder="دیجیتال و طلا" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-white/40 mr-2">توضیحات معرفی (Hero Description)</label>
                        <textarea 
                          value={heroDescription}
                          onChange={(e) => setHeroDescription(e.target.value)}
                          className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-[#FFD700]/50 transition-all resize-none"
                          placeholder="توضیحات کوتاه درباره پلتفرم..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                    <GlassButton className="px-10">ذخیره هویت برند</GlassButton>
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <Lock className="text-[#FFD700]" /> تغییر رمز عبور
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-sm text-white/40 pr-2">رمز عبور فعلی</label>
                        <div className="relative">
                          <GlassInput type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
                          <button onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm text-white/40 pr-2">رمز عبور جدید</label>
                        <GlassInput type="password" placeholder="••••••••" />
                      </div>
                    </div>
                    <GlassButton className="px-10">بروزرسانی رمز عبور</GlassButton>
                  </div>

                  <div className="space-y-6 pt-10 border-t border-white/5">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <Smartphone className="text-[#00FFA3]" /> تایید دو مرحله‌ای (2FA)
                    </h3>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-[#00FFA3]/10 flex items-center justify-center text-[#00FFA3]">
                          <Smartphone size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-lg mb-1">پیامک تایید</p>
                          <p className="text-xs text-white/30">ارسال کد تایید به شماره موبایل هنگام ورود</p>
                        </div>
                      </div>
                      <div className="w-14 h-8 rounded-full bg-[#00FFA3] relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-6 h-6 rounded-full bg-white shadow-md" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'accounts' && (
                <div className="space-y-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <CreditCard className="text-[#FFD700]" /> حساب‌های بانکی متصل
                    </h3>
                    <GlassButton className="flex items-center gap-2 text-xs">
                      <Plus size={16} /> افزودن حساب جدید
                    </GlassButton>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full -mr-16 -mt-16" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <CreditCard size={24} />
                          </div>
                          <span className="text-[10px] font-bold text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-0.5 rounded-md uppercase">Verified</span>
                        </div>
                        <p className="text-lg font-bold mb-1 tracking-[0.2em]">**** **** **** ۱۲۳۴</p>
                        <p className="text-xs text-white/40 mb-6">بانک ملت - شعبه مرکزی</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">امیرحسین رضایی</span>
                          <button className="text-xs text-[#FF4D4D] hover:underline">حذف حساب</button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-all cursor-pointer group">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[#FFD700] transition-all">
                        <Plus size={24} />
                      </div>
                      <p className="text-sm text-white/30 group-hover:text-white transition-all">افزودن کارت جدید</p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'demo' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold gold-text">تنظیمات دمو و نقش‌های کاربری</h2>
                  <p className="text-white/50">در این بخش می‌توانید نقش کاربری خود را برای تست سطوح دسترسی مختلف تغییر دهید.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard 
                      className={`cursor-pointer transition-all border-2 ${userRole === UserRole.SUPER_ADMIN ? 'border-[#FFD700] bg-[#FFD700]/5' : 'border-transparent hover:border-white/10'}`}
                      onClick={() => setUserRole(UserRole.SUPER_ADMIN)}
                    >
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <Shield size={32} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">مدیریت کل (Super Admin)</h3>
                          <p className="text-xs text-white/40 mt-2">دسترسی کامل به تمامی بخش‌ها، گزارشات مالی، سود و زیان و تنظیمات سیستمی.</p>
                        </div>
                        <div className={`px-4 py-1 rounded-full text-[10px] font-bold mt-4 ${userRole === UserRole.SUPER_ADMIN ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/40'}`}>
                          {userRole === UserRole.SUPER_ADMIN ? 'فعال' : 'انتخاب'}
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard 
                      className={`cursor-pointer transition-all border-2 ${userRole === UserRole.ADMIN ? 'border-[#FFD700] bg-[#FFD700]/5' : 'border-transparent hover:border-white/10'}`}
                      onClick={() => setUserRole(UserRole.ADMIN)}
                    >
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                          <User size={32} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">مدیر عملیاتی (Admin)</h3>
                          <p className="text-xs text-white/40 mt-2">دسترسی به مدیریت کاربران، نرخ‌ها و تراکنش‌ها. فاقد دسترسی به گزارشات سود و زیان.</p>
                        </div>
                        <div className={`px-4 py-1 rounded-full text-[10px] font-bold mt-4 ${userRole === UserRole.ADMIN ? 'bg-blue-500 text-black' : 'bg-white/10 text-white/40'}`}>
                          {userRole === UserRole.ADMIN ? 'فعال' : 'انتخاب'}
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard 
                      className={`cursor-pointer transition-all border-2 ${userRole === UserRole.TRADER ? 'border-[#FFD700] bg-[#FFD700]/5' : 'border-transparent hover:border-white/10'}`}
                      onClick={() => setUserRole(UserRole.TRADER)}
                    >
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                          <TrendingUp size={32} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">کاربر معامله‌گر (Trader)</h3>
                          <p className="text-xs text-white/40 mt-2">دسترسی به بخش‌های عمومی پلتفرم، کیف پول، خرید و فروش و اخبار. فاقد دسترسی به پنل مدیریت.</p>
                        </div>
                        <div className={`px-4 py-1 rounded-full text-[10px] font-bold mt-4 ${userRole === UserRole.TRADER ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40'}`}>
                          {userRole === UserRole.TRADER ? 'فعال' : 'انتخاب'}
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
