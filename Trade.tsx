import React, { useEffect, useMemo, useState } from 'react';
import { trpc } from './_core/trpc';
import { GlassCard, GlassButton, GlassInput } from './components/GlassUI';
import Sidebar from './components/Sidebar';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from './_core/AuthContext';

export default function Trade() {
  const { user } = useAuth();
  const userId = user?.id;

  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderMode, setOrderMode] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [selectedAsset, setSelectedAsset] = useState('GOLD');
  const [amount, setAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');

  const utils = trpc.useUtils();

  const productsQuery = trpc.getProducts.useQuery();
  const pricesQuery = trpc.getPrices.useQuery(undefined, { refetchInterval: 15000 });
  const orderBookQuery = trpc.getOrderBook.useQuery({ asset: selectedAsset });
  const recentTradesQuery = trpc.getRecentTrades.useQuery(
    { asset: selectedAsset },
    { refetchInterval: 15000 }
  );
  const walletQuery = trpc.getWallet.useQuery(undefined, { enabled: Boolean(userId) });
  const openOrdersQuery = trpc.getMyOpenOrders.useQuery(
    { asset: selectedAsset },
    { enabled: Boolean(userId), refetchInterval: 10000 }
  );
  const [streamBook, setStreamBook] = useState<any | null>(null);
  const [streamTrades, setStreamTrades] = useState<any[] | null>(null);
  const [streamPrices, setStreamPrices] = useState<any | null>(null);

  const instantTrade = trpc.instantTrade.useMutation({
    onSuccess: async () => {
      setAmount('');
      await Promise.all([
        utils.getWallet.invalidate(),
        utils.getRecentTrades.invalidate(),
        utils.getOrderBook.invalidate(),
      ]);
    },
  });
  const createLimitOrder = trpc.createLimitOrder.useMutation({
    onSuccess: async () => {
      setAmount('');
      setLimitPrice('');
      await Promise.all([
        utils.getOrderBook.invalidate(),
        utils.getRecentTrades.invalidate(),
      ]);
    },
  });
  const cancelOrder = trpc.cancelOrder.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.getMyOpenOrders.invalidate(),
        utils.getOrderBook.invalidate(),
        utils.getWallet.invalidate(),
      ]);
    },
  });

  useEffect(() => {
    const stream = new EventSource(`/api/stream/market?asset=${encodeURIComponent(selectedAsset)}`);

    stream.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.orderBook) setStreamBook(payload.orderBook);
        if (payload.recentTrades) setStreamTrades(payload.recentTrades);
        if (payload.prices) setStreamPrices(payload.prices);
      } catch {
        // ignore malformed event payloads
      }
    };

    return () => stream.close();
  }, [selectedAsset]);

  const products = productsQuery.data ?? [];

  const filteredOrderBook = useMemo(
    () => ({
      bids: orderBookQuery.data?.bids ?? [],
      asks: orderBookQuery.data?.asks ?? [],
    }),
    [orderBookQuery.data]
  );

  const currentPrice = streamPrices?.[selectedAsset] ?? pricesQuery.data?.[selectedAsset];
  const recentTrades = streamTrades ?? recentTradesQuery.data ?? [];
  const orderBook = streamBook ?? filteredOrderBook;

  const handleTrade = async () => {
    if (!userId || !amount) return;

    try {
      if (orderMode === 'MARKET') {
        await instantTrade.mutateAsync({
          asset: selectedAsset,
          type: tradeType,
          amount: Number(amount),
        });
      } else {
        await createLimitOrder.mutateAsync({
          asset: selectedAsset,
          type: tradeType,
          amount: Number(amount),
          price: Number(limitPrice),
        });
      }
      alert('معامله با موفقیت ثبت شد');
    } catch (error: any) {
      alert(error?.message || 'خطا در ثبت معامله');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex p-4 lg:p-8 gap-8">
      <Sidebar />

      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GlassCard className="p-6 lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTradeType('BUY')}
                className={`py-3 rounded-xl ${tradeType === 'BUY' ? 'bg-[#00FFA3] text-black' : 'bg-white/10'}`}
              >
                <ArrowUpRight className="inline ml-2" size={18} /> خرید
              </button>
              <button
                onClick={() => setTradeType('SELL')}
                className={`py-3 rounded-xl ${tradeType === 'SELL' ? 'bg-[#FF4D4D] text-black' : 'bg-white/10'}`}
              >
                <ArrowDownLeft className="inline ml-2" size={18} /> فروش
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOrderMode('MARKET')}
                className={`py-2 rounded-xl ${orderMode === 'MARKET' ? 'bg-[#FFD700] text-black' : 'bg-white/10'}`}
              >
                MARKET
              </button>
              <button
                onClick={() => setOrderMode('LIMIT')}
                className={`py-2 rounded-xl ${orderMode === 'LIMIT' ? 'bg-[#FFD700] text-black' : 'bg-white/10'}`}
              >
                LIMIT
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {products.map((product: any) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedAsset(product.name)}
                  className={`p-3 rounded-xl border text-right ${selectedAsset === product.name ? 'border-[#FFD700] text-[#FFD700]' : 'border-white/10'}`}
                >
                  <p className="font-bold text-xs">{product.name}</p>
                  <p className="text-[10px] opacity-60">{product.unit} · {product.category}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="block mb-2 text-xs text-white/40">مقدار</label>
              <GlassInput type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
            {orderMode === 'LIMIT' && (
              <div>
                <label className="block mb-2 text-xs text-white/40">قیمت لیمیت</label>
                <GlassInput type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder="0.00" />
              </div>
            )}

            <div className="text-sm text-white/70 space-y-1">
              <p>Buy: {currentPrice?.buyPrice ?? '-'}</p>
              <p>Sell: {currentPrice?.sellPrice ?? '-'}</p>
            </div>

            <GlassButton className="w-full" disabled={instantTrade.isPending || createLimitOrder.isPending || !amount || (orderMode === 'LIMIT' && !limitPrice) || !userId} onClick={handleTrade}>
              {instantTrade.isPending || createLimitOrder.isPending ? 'در حال انجام...' : orderMode === 'MARKET' ? 'ثبت معامله بازار' : 'ثبت سفارش لیمیت'}
            </GlassButton>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="font-bold mb-3">کیف پول</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(walletQuery.data ?? {}).map(([asset, value]: any) => (
                  <div key={asset} className="flex justify-between">
                    <span>{asset}</span>
                    <span>{Number(value.available).toLocaleString()} / {Number(value.locked).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-bold mb-3">Order Book ({selectedAsset})</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="mb-2 text-[#00FFA3]">Bids</p>
                  {orderBook.bids.slice(0, 8).map((row: any, idx: number) => (
                    <div key={`bid-${row.price}-${idx}`} className="flex justify-between mb-1">
                      <span>{row.amount}</span>
                      <span>{row.price}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="mb-2 text-[#FF4D4D]">Asks</p>
                  {orderBook.asks.slice(0, 8).map((row: any, idx: number) => (
                    <div key={`ask-${row.price}-${idx}`} className="flex justify-between mb-1">
                      <span>{row.amount}</span>
                      <span>{row.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-bold mb-3">معاملات اخیر</h3>
              <div className="space-y-2 text-xs">
                {recentTrades.slice(0, 10).map((trade: any) => (
                  <div key={trade.id} className="grid grid-cols-3 gap-2">
                    <span>{trade.price}</span>
                    <span>{trade.amount}</span>
                    <span>{new Date(trade.executedAt ?? trade.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))}
                {!recentTrades.length && <div className="text-white/50">داده‌ای موجود نیست.</div>}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-bold mb-3">سفارشات باز</h3>
              <div className="space-y-2 text-xs">
                {(openOrdersQuery.data ?? []).map((order: any) => (
                  <div key={order.id} className="grid grid-cols-5 gap-2 items-center">
                    <span>{order.type}</span>
                    <span>{order.price}</span>
                    <span>{order.remainingAmount ?? order.amount}</span>
                    <span>{order.status}</span>
                    <button
                      className="rounded bg-red-500/20 px-2 py-1"
                      disabled={cancelOrder.isPending}
                      onClick={() => cancelOrder.mutate({ orderId: order.id })}
                    >
                      لغو
                    </button>
                  </div>
                ))}
                {!openOrdersQuery.data?.length && <div className="text-white/50">سفارش بازی وجود ندارد.</div>}
              </div>
            </GlassCard>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
