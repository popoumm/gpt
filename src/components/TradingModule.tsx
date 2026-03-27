import React, { useMemo, useState } from 'react';
import { trpc } from '../_core/trpc';
import { GlassCard, GlassButton, GlassInput } from './GlassUI';
import { useAuth } from '../_core/AuthContext';

export default function TradingModule({ isPublic = false }: { isPublic?: boolean }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [asset, setAsset] = useState('GOLD');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [mode, setMode] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState('');

  const utils = trpc.useUtils();

  const productsQuery = trpc.getProducts.useQuery();
  const pricesQuery = trpc.getPrices.useQuery(undefined, { refetchInterval: 5000 });
  const orderBookQuery = trpc.getOrderBook.useQuery({ asset });
  const recentTradesQuery = trpc.getRecentTrades.useQuery({ asset }, { refetchInterval: 3000 });
  const walletQuery = trpc.getWallet.useQuery(undefined, { enabled: Boolean(userId) });

  const instantTrade = trpc.instantTrade.useMutation({
    onSuccess: async () => {
      setAmount('');
      await Promise.all([
        utils.getWallet.invalidate(),
        utils.getOrderBook.invalidate(),
        utils.getRecentTrades.invalidate(),
      ]);
    },
  });
  const createLimitOrder = trpc.createLimitOrder.useMutation({
    onSuccess: async () => {
      setAmount('');
      setLimitPrice('');
      await Promise.all([utils.getOrderBook.invalidate(), utils.getRecentTrades.invalidate()]);
    },
  });

  const orderBook = useMemo(() => {
    return {
      bids: orderBookQuery.data?.bids ?? [],
      asks: orderBookQuery.data?.asks ?? [],
    };
  }, [orderBookQuery.data]);

  const onTrade = async () => {
    if (!userId || !amount) return;

    try {
      if (mode === 'MARKET') {
        await instantTrade.mutateAsync({ asset, type, amount: Number(amount) });
      } else {
        await createLimitOrder.mutateAsync({
          asset,
          type,
          amount: Number(amount),
          price: Number(limitPrice),
        });
      }
    } catch (error: any) {
      alert(error?.message || 'Trade failed');
    }
  };

  return (
    <GlassCard className="p-6 space-y-4">
      <div className="flex gap-2">
        {(productsQuery.data ?? []).map((product: any) => (
          <button
            key={product.id}
            onClick={() => setAsset(product.name)}
            className={`px-3 py-1 rounded-lg ${asset === product.name ? 'bg-[#FFD700] text-black' : 'bg-white/10'}`}
          >
            {product.name}
          </button>
        ))}
      </div>

      <div className="text-xs text-white/70">
        <p>Buy: {pricesQuery.data?.[asset]?.buyPrice ?? '-'}</p>
        <p>Sell: {pricesQuery.data?.[asset]?.sellPrice ?? '-'}</p>
      </div>

      {!isPublic && (
        <>
          <div className="flex gap-2">
            <button onClick={() => setType('BUY')} className={`flex-1 rounded-lg py-2 ${type === 'BUY' ? 'bg-[#00FFA3] text-black' : 'bg-white/10'}`}>
              BUY
            </button>
            <button onClick={() => setType('SELL')} className={`flex-1 rounded-lg py-2 ${type === 'SELL' ? 'bg-[#FF4D4D] text-black' : 'bg-white/10'}`}>
              SELL
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMode('MARKET')} className={`flex-1 rounded-lg py-2 ${mode === 'MARKET' ? 'bg-[#FFD700] text-black' : 'bg-white/10'}`}>MARKET</button>
            <button onClick={() => setMode('LIMIT')} className={`flex-1 rounded-lg py-2 ${mode === 'LIMIT' ? 'bg-[#FFD700] text-black' : 'bg-white/10'}`}>LIMIT</button>
          </div>

          <GlassInput type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          {mode === 'LIMIT' && <GlassInput type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder="Limit price" />}
          <GlassButton className="w-full" disabled={instantTrade.isPending || createLimitOrder.isPending || !userId || (mode === 'LIMIT' && !limitPrice)} onClick={onTrade}>
            {instantTrade.isPending || createLimitOrder.isPending ? 'Submitting...' : mode === 'MARKET' ? 'instantTrade' : 'createLimitOrder'}
          </GlassButton>
        </>
      )}

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="mb-1">Bids</p>
          {orderBook.bids.slice(0, 5).map((row: any, idx: number) => (
            <div key={`bid-${row.price}-${idx}`} className="flex justify-between"><span>{row.amount}</span><span>{row.price}</span></div>
          ))}
        </div>
        <div>
          <p className="mb-1">Asks</p>
          {orderBook.asks.slice(0, 5).map((row: any, idx: number) => (
            <div key={`ask-${row.price}-${idx}`} className="flex justify-between"><span>{row.amount}</span><span>{row.price}</span></div>
          ))}
        </div>
      </div>

      <div className="text-xs">
        <p className="mb-1">Recent Trades</p>
        {(recentTradesQuery.data ?? []).slice(0, 5).map((trade: any) => (
          <div key={trade.id} className="grid grid-cols-3 gap-2">
            <span>{trade.price}</span>
            <span>{trade.amount}</span>
            <span>{new Date(trade.executedAt ?? trade.createdAt).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>

      {!isPublic && walletQuery.data && (
        <div className="text-xs text-white/60">
          {Object.entries(walletQuery.data).map(([walletAsset, value]: any) => (
            <p key={walletAsset}>
              {walletAsset}: {Number(value.available).toLocaleString()} (locked {Number(value.locked).toLocaleString()})
            </p>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
