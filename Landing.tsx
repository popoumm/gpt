import React, { useEffect, useRef, useState } from 'react';
import { GlassButton } from './components/GlassUI';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'wouter';
import { Shield, Zap, Globe, ArrowLeft, User } from 'lucide-react';
import { useTheme } from './_core/ThemeContext';
import TradingModule from './components/TradingModule';

const tickerItems = [
  { name: 'طلا', price: '۳,۴۵۰,۰۰۰', change: '+1.24%' },
  { name: 'بیت‌کوین', price: '84,250', change: '+2.11%' },
  { name: 'اتریوم', price: '2,180', change: '-0.86%' },
  { name: 'دلار', price: '92,100', change: '+0.42%' },
  { name: 'یورو', price: '99,400', change: '-0.21%' },
];

const newsItems = [
  {
    title: 'افزایش تقاضا برای طلا با رشد نااطمینانی در بازارهای جهانی',
    time: '۲ ساعت پیش',
    source: 'PM News',
  },
  {
    title: 'تتر و ترون همچنان در صدر تراکنش‌های روزانه کاربران ایرانی',
    time: '۴ ساعت پیش',
    source: 'Market Watch',
  },
  {
    title: 'دلار و درهم در معاملات امروز با نوسان محدود همراه بودند',
    time: 'امروز',
    source: 'Exchange Desk',
  },
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const { siteName, heroTitle, heroSubtitle, heroDescription } = useTheme();

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 20);

      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    const onScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FFD700]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#7C3AED]/10 blur-[100px] rounded-full pointer-events-none"></div>

      <AnimatePresence>
        {isHeaderVisible && (
          <motion.header
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -120, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed top-0 left-0 right-0 z-50"
          >
            <div
              className={`mx-auto max-w-7xl px-4 md:px-6 transition-all duration-300 ${
                isScrolled ? 'pt-3' : 'pt-5'
              }`}
            >
              <nav
                className={`flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 backdrop-blur-xl transition-all duration-300 ${
                  isScrolled
                    ? 'px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.35)]'
                    : 'px-5 py-4'
                }`}
              >
                <button
                  onClick={() => setLocation('/')}
                  className="text-xl md:text-2xl font-bold gold-text"
                >
                  {siteName}
                </button>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/75">
                  <button
                    onClick={() => setLocation('/')}
                    className="hover:text-[#FFD700] transition-colors"
                  >
                    صفحه اصلی
                  </button>
                  <button
                    onClick={() => setLocation('/markets')}
                    className="hover:text-[#FFD700] transition-colors"
                  >
                    بازارها
                  </button>
                  <button
                    onClick={() => setLocation('/news')}
                    className="hover:text-[#FFD700] transition-colors"
                  >
                    اخبار
                  </button>
                  <button
                    onClick={() => setLocation('/about')}
                    className="hover:text-[#FFD700] transition-colors"
                  >
                    درباره ما
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setLocation('/auth')}
                    className="w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center hover:border-[#FFD700]/40 transition-all"
                  >
                    <User size={18} />
                  </button>

                  <GlassButton
                    variant="outline"
                    className="text-sm hover:scale-[1.04] active:scale-[0.97] transition-all"
                    onClick={() => setLocation('/auth')}
                  >
                    ورود / ثبت‌نام
                  </GlassButton>
                </div>
              </nav>

              <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-black/25 backdrop-blur-xl">
                <div className="ticker-wrap">
                  <div className="ticker-track">
                    {[...tickerItems, ...tickerItems].map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="flex items-center gap-3 px-6 py-3 whitespace-nowrap text-sm hover:scale-105 transition-transform"
                      >
                        <span className="text-white/75">{item.name}</span>
                        <span className="font-semibold text-white">{item.price}</span>
                        <span
                          className={
                            item.change.startsWith('+')
                              ? 'text-green-400'
                              : 'text-red-400'
                          }
                        >
                          {item.change}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <section className="relative z-10 pt-44 md:pt-48 pb-20 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <span className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-[#FFD700] mb-6 tracking-widest">
            اکوسیستم مالی هوشمند PM
          </span>

          <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            {heroTitle} <br />
            <span className="gold-text">{heroSubtitle}</span>
          </h2>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
            {heroDescription}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/70 backdrop-blur-xl">
              خرید و فروش طلا
            </div>
            <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/70 backdrop-blur-xl">
              ارزهای فیزیکی
            </div>
            <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/70 backdrop-blur-xl">
              ارزهای دیجیتال
            </div>
            <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/70 backdrop-blur-xl">
              کیف پول یکپارچه
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <GlassButton
              className="px-10 py-4 text-lg hover:scale-[1.04] active:scale-[0.97] transition-all"
              onClick={() => setLocation('/auth')}
            >
              شروع سرمایه‌گذاری
            </GlassButton>

            <GlassButton
              variant="secondary"
              className="px-10 py-4 text-lg flex items-center gap-2 hover:scale-[1.04] active:scale-[0.97] transition-all"
              onClick={() => setLocation('/markets')}
            >
              مشاهده قیمت‌ها <ArrowLeft size={20} />
            </GlassButton>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 px-6 max-w-7xl mx-auto pb-32">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">فعالیت لحظه‌ای بازار</h3>
          <p className="text-white/40 max-w-2xl mx-auto leading-8">
            مشاهده سفارش‌ها، معاملات لحظه‌ای و جریان بازار برای ایجاد حس اعتماد، شفافیت و پویایی واقعی در پلتفرم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <p className="text-white/40 text-sm mb-2">حجم معاملات امروز</p>
            <h4 className="text-2xl font-bold gold-text">12.8B+</h4>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <p className="text-white/40 text-sm mb-2">کاربران فعال</p>
            <h4 className="text-2xl font-bold text-white">24,580</h4>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <p className="text-white/40 text-sm mb-2">میانگین زمان تسویه</p>
            <h4 className="text-2xl font-bold text-white">60s</h4>
          </div>
        </div>

        <TradingModule isPublic={true} />
      </section>

      <section className="relative z-10 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-32">
        <FeatureCard
          icon={<Shield className="text-[#FFD700]" size={32} />}
          title="امنیت تضمین شده"
          desc="استفاده از کیف پول‌های سرد و پروتکل‌های امنیتی چندلایه برای محافظت از دارایی شما."
        />
        <FeatureCard
          icon={<Zap className="text-[#00FFA3]" size={32} />}
          title="تبادل آنی"
          desc="خرید و فروش طلا و تتر در کمتر از چند ثانیه با بهترین نرخ بازار."
        />
        <FeatureCard
          icon={<Globe className="text-[#7C3AED]" size={32} />}
          title="دسترسی جهانی"
          desc="مدیریت سبد دارایی‌های خود در هر زمان و هر مکان با اپلیکیشن پیشرفته."
        />
      </section>

      <section className="relative z-10 px-6 max-w-7xl mx-auto pb-32">
        <div className="flex items-center justify-between gap-4 mb-10">
          <div>
            <h3 className="text-3xl font-bold mb-3">آخرین اخبار بازار</h3>
            <p className="text-white/40">
              تازه‌ترین اخبار و تحولات بازارهای مالی، طلا، ارز و کریپتو
            </p>
          </div>

          <GlassButton
            variant="secondary"
            className="hover:scale-[1.04] active:scale-[0.97] transition-all"
            onClick={() => setLocation('/news')}
          >
            مشاهده همه اخبار
          </GlassButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -6 }}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
            >
              <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
                <span>{item.source}</span>
                <span>•</span>
                <span>{item.time}</span>
              </div>

              <h4 className="text-lg font-bold leading-8 mb-5">
                {item.title}
              </h4>

              <button
                onClick={() => setLocation('/news')}
                className="text-sm text-[#FFD700] hover:text-[#ffe55c] transition-colors"
              >
                ادامه خبر
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 px-6 pb-14">
        <div className="max-w-7xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold gold-text mb-4">{siteName}</h3>
              <p className="text-white/50 leading-8 text-sm md:text-base max-w-xl">
                پلتفرم یکپارچه مدیریت و معامله طلا، ارزهای فیزیکی و ارزهای دیجیتال
                با تجربه‌ای مدرن، سریع و امن برای کاربران حرفه‌ای.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">دسترسی سریع</h4>
              <div className="flex flex-col gap-3 text-white/60 text-sm">
                <button
                  onClick={() => setLocation('/')}
                  className="text-right hover:text-[#FFD700] transition-colors"
                >
                  صفحه اصلی
                </button>
                <button
                  onClick={() => setLocation('/markets')}
                  className="text-right hover:text-[#FFD700] transition-colors"
                >
                  بازارها
                </button>
                <button
                  onClick={() => setLocation('/news')}
                  className="text-right hover:text-[#FFD700] transition-colors"
                >
                  اخبار
                </button>
                <button
                  onClick={() => setLocation('/auth')}
                  className="text-right hover:text-[#FFD700] transition-colors"
                >
                  ورود / ثبت‌نام
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">ارتباط با ما</h4>
              <div className="flex flex-col gap-3 text-white/60 text-sm leading-7">
                <p>دبی، بیزینس بی، PM Holding</p>
                <p>Instagram / Telegram / WhatsApp / X</p>
                <p>info@pmholding.com</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .ticker-wrap {
          width: 100%;
          overflow: hidden;
        }

        .ticker-track {
          display: flex;
          width: max-content;
          animation: tickerMove 22s linear infinite;
          will-change: transform;
        }

        .ticker-wrap:hover .ticker-track {
          animation-play-state: paused;
        }

        @keyframes tickerMove {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
    >
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}