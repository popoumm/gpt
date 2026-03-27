import React from 'react';
import { GlassCard, GlassButton } from '../components/GlassUI';
import Sidebar from '../components/Sidebar';
import { 
  Newspaper, 
  TrendingUp, 
  Clock, 
  ChevronLeft,
  Share2,
  Bookmark
} from 'lucide-react';
import { motion } from 'motion/react';

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

const newsItems = [
  {
    id: 1,
    title: 'پیش‌بینی قیمت طلا در هفته آینده: آیا روند صعودی ادامه دارد؟',
    summary: 'تحلیل‌گران بازار معتقدند با توجه به تنش‌های سیاسی اخیر، قیمت انس جهانی طلا ممکن است رکورد جدیدی را ثبت کند...',
    date: '۲ ساعت پیش',
    category: 'تحلیل بازار',
    image: 'https://picsum.photos/seed/gold1/800/400'
  },
  {
    id: 2,
    title: 'تغییرات جدید در قوانین مالیاتی خرید و فروش طلا',
    summary: 'اتحادیه طلا و جواهر بخشنامه جدیدی در خصوص نحوه محاسبه مالیات بر ارزش افزوده در معاملات آنلاین صادر کرد...',
    date: '۵ ساعت پیش',
    category: 'اخبار رسمی',
    image: 'https://picsum.photos/seed/gold2/800/400'
  },
  {
    id: 3,
    title: 'افزایش تقاضا برای طلای آب شده در بازارهای داخلی',
    summary: 'گزارش‌ها حاکی از آن است که سرمایه‌گذاران خرد به سمت خرید طلای آب شده به عنوان یک دارایی امن متمایل شده‌اند...',
    date: 'دیروز',
    category: 'گزارش ویژه',
    image: 'https://picsum.photos/seed/gold3/800/400'
  },
  {
    id: 4,
    title: 'تاثیر نرخ بهره فدرال رزرو بر قیمت طلا و دلار',
    summary: 'نشست اخیر فدرال رزرو و تصمیمات اتخاذ شده در مورد نرخ بهره، نوسانات شدیدی را در بازار طلا ایجاد کرده است...',
    date: '۲ روز پیش',
    category: 'اقتصاد جهانی',
    image: 'https://picsum.photos/seed/gold4/800/400'
  }
];

export default function News() {
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
          <h1 className="text-3xl font-bold mb-2 gold-text">اخبار و تحلیل بازار</h1>
          <p className="text-white/50 text-lg">آخرین رویدادها و تحلیل‌های تخصصی بازار طلا و ارز</p>
        </motion.header>

        <div className="space-y-8">
          {newsItems.map((news) => (
            <motion.div key={news.id} variants={itemVariants}>
              <GlassCard className="overflow-hidden group">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden rounded-2xl">
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-[#FFD700] border border-[#FFD700]/20">
                      {news.category}
                    </div>
                  </div>
                  
                  <div className="flex-1 p-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 text-white/30 text-[10px] mb-4">
                        <span className="flex items-center gap-1"><Clock size={12} /> {news.date}</span>
                        <span className="flex items-center gap-1"><Newspaper size={12} /> منبع: خبرگذاری طلا</span>
                      </div>
                      <h2 className="text-xl font-bold mb-4 group-hover:text-[#FFD700] transition-colors leading-relaxed">
                        {news.title}
                      </h2>
                      <p className="text-white/50 text-sm leading-loose mb-6">
                        {news.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex gap-2">
                        <button className="p-2 rounded-xl bg-white/5 text-white/30 hover:text-white transition-all">
                          <Share2 size={18} />
                        </button>
                        <button className="p-2 rounded-xl bg-white/5 text-white/30 hover:text-white transition-all">
                          <Bookmark size={18} />
                        </button>
                      </div>
                      <GlassButton variant="outline" className="px-6 py-2 text-xs flex items-center gap-2">
                        ادامه مطلب <ChevronLeft size={14} />
                      </GlassButton>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Newsletter */}
        <motion.div variants={itemVariants} className="mt-16">
          <GlassCard className="p-10 bg-gradient-to-br from-[#FFD700]/10 to-transparent border-[#FFD700]/20 text-center">
            <h3 className="text-2xl font-bold mb-4">عضویت در خبرنامه تخصصی</h3>
            <p className="text-white/50 mb-8 max-w-lg mx-auto">
              با عضویت در خبرنامه، تحلیل‌های روزانه و سیگنال‌های مهم بازار را مستقیماً در ایمیل خود دریافت کنید.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="آدرس ایمیل شما"
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-6 py-3 text-white focus:outline-none focus:border-[#FFD700]/50"
              />
              <GlassButton className="px-8">عضویت</GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      </motion.main>
    </div>
  );
}
