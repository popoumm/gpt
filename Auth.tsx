import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from '../components/GlassUI';
import { motion } from 'motion/react';
import { useLocation } from 'wouter';

export default function Auth() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,215,0,0.05)_0%,_transparent_50%)]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold gold-text mb-2">PM Holding</h1>
          <p className="text-white/50">ورود به دنیای سرمایه‌گذاری هوشمند</p>
        </div>

        <GlassCard className="p-8">
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-white/50 mb-2">شماره موبایل</label>
                <GlassInput placeholder="09123456789" type="tel" className="text-center tracking-[0.2em]" />
              </div>
              <GlassButton className="w-full" onClick={() => setStep(2)}>دریافت کد تایید</GlassButton>
              <div className="text-center">
                <p className="text-xs text-white/30">با ورود به سامانه، شرایط و قوانین را می‌پذیرم.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-white/50 mb-2">کد تایید پیامک شده</label>
                <GlassInput placeholder="----" type="text" className="text-center text-2xl tracking-[0.5em]" maxLength={4} />
              </div>
              <GlassButton className="w-full" onClick={() => setLocation('/dashboard')}>تایید و ورود</GlassButton>
              <button className="w-full text-sm text-white/50 hover:text-[#FFD700] transition-colors" onClick={() => setStep(1)}>
                ویرایش شماره موبایل
              </button>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
