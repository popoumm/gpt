import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from './components/GlassUI';
import { motion } from 'motion/react';
import { useLocation } from 'wouter';
import { trpc } from './_core/trpc';
import { useAuth } from './_core/AuthContext';

type AuthMode = 'login' | 'register';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [, setLocation] = useLocation();
  const { setAuth } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const registerMutation = trpc.register.useMutation();
  const loginMutation = trpc.login.useMutation();

  const isSubmitting = registerMutation.isPending || loginMutation.isPending;

  const onSubmit = async () => {
    try {
      if (mode === 'register') {
        await registerMutation.mutateAsync({
          firstName,
          lastName,
          phone,
          password,
          referralCode: referralCode || undefined,
        });

        setMode('login');
      }

      const result = await loginMutation.mutateAsync({ phone, password });
      setAuth(result.token, result.user);
      setLocation('/dashboard');
    } catch (error: any) {
      alert(error?.message || 'خطا در عملیات احراز هویت');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,215,0,0.05)_0%,_transparent_50%)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold gold-text mb-2">PM Holding</h1>
          <p className="text-white/50">{mode === 'login' ? 'ورود به حساب کاربری' : 'ایجاد حساب کاربری جدید'}</p>
        </div>

        <GlassCard className="p-8">
          <div className="space-y-6">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm text-white/50 mb-2">نام</label>
                  <GlassInput value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm text-white/50 mb-2">نام خانوادگی</label>
                  <GlassInput value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm text-white/50 mb-2">شماره موبایل</label>
              <GlassInput
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                type="tel"
                className="text-center tracking-[0.2em]"
              />
            </div>

            <div>
              <label className="block text-sm text-white/50 mb-2">رمز عبور</label>
              <GlassInput value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm text-white/50 mb-2">کد معرف (اختیاری)</label>
                <GlassInput value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />
              </div>
            )}

            <GlassButton className="w-full" disabled={isSubmitting || !phone || !password} onClick={onSubmit}>
              {isSubmitting ? 'در حال پردازش...' : mode === 'login' ? 'ورود' : 'ثبت‌نام و ورود'}
            </GlassButton>

            <button
              className="w-full text-sm text-white/50 hover:text-[#FFD700] transition-colors"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              disabled={isSubmitting}
            >
              {mode === 'login' ? 'حساب ندارید؟ ثبت‌نام کنید' : 'قبلا ثبت‌نام کردید؟ وارد شوید'}
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
