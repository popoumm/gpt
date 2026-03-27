import React from 'react';
import { Link, useLocation } from 'wouter';

const items = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/trade', label: 'Trade' },
  { href: '/wallet', label: 'Wallet' },
  { href: '/prices', label: 'Prices' },
  { href: '/admin', label: 'Admin' },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-52 shrink-0 hidden lg:block">
      <div className="sticky top-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 space-y-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={`block rounded-xl px-3 py-2 text-sm ${
                location === item.href ? 'bg-[#FFD700] text-black font-bold' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              {item.label}
            </a>
          </Link>
        ))}
      </div>
    </aside>
  );
}
