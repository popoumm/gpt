import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export default function Markets() {
  const [tab, setTab] = useState<'gold' | 'fiat' | 'crypto'>('gold');
  const [marketData, setMarketData] = useState<any>({
    gold: [],
    fiat: [],
    crypto: [],
  });

  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState<'price' | 'change'>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // 💰 اسپرد (سود)
  const applySpread = (price: number) => {
    const spread = 0.015; // 1.5%
    return {
      buy: price * (1 - spread),
      sell: price * (1 + spread),
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Crypto API
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await res.json();

        // FX API
        const fxRes = await fetch('https://open.er-api.com/v6/latest/USD');
        const fxData = await fxRes.json();

        setMarketData({
          gold: [
            {
              name: 'طلای جهانی (اونس)',
              price: 2150,
              change: '+0.3%',
            },
            {
              name: 'طلای 18 عیار',
              price: fxData.rates.IRR * 0.025,
              change: '+0.5%',
            },
          ],
          fiat: [
            {
              name: 'USD',
              price: fxData.rates.IRR,
              change: '+0.0%',
            },
            {
              name: 'AED',
              price: fxData.rates.IRR / fxData.rates.AED,
              change: '+0.0%',
            },
          ],
          crypto: [
            {
              name: 'BTC',
              price: data.bitcoin.usd,
              change: data.bitcoin.usd_24h_change.toFixed(2) + '%',
            },
            {
              name: 'ETH',
              price: data.ethereum.usd,
              change: data.ethereum.usd_24h_change.toFixed(2) + '%',
            },
            {
              name: 'USDT',
              price: data.tether.usd,
              change: data.tether.usd_24h_change.toFixed(2) + '%',
            },
          ],
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);

  const sortedData = [...marketData[tab]]
    .filter((item: any) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: any, b: any) => {
      if (sortType === 'price') {
        return sortDirection === 'asc'
          ? a.price - b.price
          : b.price - a.price;
      }

      const aChange = parseFloat(a.change);
      const bChange = parseFloat(b.change);

      return sortDirection === 'asc'
        ? aChange - bChange
        : bChange - aChange;
    });

  return (
    <div className="min-h-screen px-6 py-32 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-center">بازارها</h1>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-12">
        {[
          { key: 'gold', label: 'طلا' },
          { key: 'fiat', label: 'ارز فیزیکی' },
          { key: 'crypto', label: 'کریپتو' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key as any)}
            className={`px-6 py-2 rounded-full border ${
              tab === item.key
                ? 'bg-[#FFD700] text-black'
                : 'border-white/20 text-white/70'
            } transition-all`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        placeholder="جستجوی دارایی..."
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
      />

      {/* Sort */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setSortType('price')}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
        >
          مرتب‌سازی قیمت
        </button>

        <button
          onClick={() => setSortType('change')}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
        >
          مرتب‌سازی تغییر
        </button>

        <button
          onClick={() =>
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
          }
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
        >
          جهت: {sortDirection === 'asc' ? 'صعودی' : 'نزولی'}
        </button>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        <div className="grid grid-cols-3 px-6 py-4 text-white/40 text-sm border-b border-white/10">
          <div>دارایی</div>
          <div className="text-center">قیمت</div>
          <div className="text-left">تغییرات</div>
        </div>

        {sortedData.map((item: any, index: number) => {
          const spread = applySpread(Number(item.price));

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.01 }}
              className="grid grid-cols-3 px-6 py-4 border-b border-white/5 items-center"
            >
              <div className="font-semibold">{item.name}</div>

              <div className="flex flex-col text-center">
                <span className="text-green-400 text-sm">
                  خرید: {spread.buy.toLocaleString()}
                </span>
                <span className="text-red-400 text-sm">
                  فروش: {spread.sell.toLocaleString()}
                </span>
              </div>

              <div
                className={`text-left ${
                  parseFloat(item.change) > 0
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {item.change}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}