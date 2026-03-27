import React from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'outline';

export function GlassCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl', className)}
      {...props}
    />
  );
}

export function GlassButton({
  className,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        'rounded-2xl px-4 py-2 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-[#FFD700] text-black hover:brightness-110',
        variant === 'secondary' && 'bg-white/10 text-white border border-white/15 hover:bg-white/20',
        variant === 'outline' && 'bg-transparent text-white border border-white/20 hover:bg-white/10',
        className
      )}
      {...props}
    />
  );
}

export function GlassInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#FFD700]/40',
        className
      )}
      {...props}
    />
  );
}
