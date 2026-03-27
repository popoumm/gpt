import React from 'react';
import { GlassCard, GlassButton, GlassInput } from './components/GlassUI';
import Sidebar from './components/Sidebar';
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { trpc } from './_core/trpc';
import { useAuth } from './_core/AuthContext';

const ASSETS = ['GOLD', 'USD', 'AED', 'USDT', 'TRX'] as const;

export default function Wallet() {
  const { user } = useAuth();
  const userId = user?.id;

  const [asset, setAsset] = React.useState<(typeof ASSETS)[number]>('USDT');
  const [depositAmount, setDepositAmount] = React.useState('');
  const [withdrawAmount, setWithdrawAmount] = React.useState('');
  const [address, setAddress] = React.useState('');

  const utils = trpc.useUtils();

  const walletQuery = trpc.getWallet.useQuery(undefined, { enabled: Boolean(userId) });
  const pricesQuery = trpc.getPrices.useQuery(undefined, { refetchInterval: 5000 });
  const depositsQuery = trpc.getDepositRequests.useQuery(undefined, { enabled: Boolean(userId) });
  const withdrawsQuery = trpc.getWithdrawRequests.useQuery(undefined, { enabled: Boolean(userId) });
  const myTransactionsQuery = trpc.getMyTransactions.useQuery(undefined, { enabled: Boolean(userId) });

  const createDepositMutation = trpc.createDeposit.useMutation({
    onSuccess: async () => {
      setDepositAmount('');
      await Promise.all([
        utils.getDepositRequests.invalidate(),
        utils.getWallet.invalidate(),
      ]);
    },
  });

  const createWithdrawMutation = trpc.createWithdraw.useMutation({
    onSuccess: async () => {
      setWithdrawAmount('');
      setAddress('');
      await Promise.all([
        utils.getWithdrawRequests.invalidate(),
        utils.getWallet.invalidate(),
      ]);
    },
  });

  const balances = walletQuery.data ?? {};

  const totalUsdtValue = Object.entries(balances).reduce((sum, [walletAsset, balance]) => {
    const n = Number((balance as any).total ?? 0);
    if (walletAsset === 'USDT') return sum + n;

    const sell = pricesQuery.data?.[walletAsset]?.sellPrice;
    if (!sell) return sum;

    return sum + n * Number(sell);
  }, 0);

  const handleDeposit = async () => {
    if (!userId) return;

    try {
      await createDepositMutation.mutateAsync({
        asset,
        amount: Number(depositAmount),
      });
      alert('درخواست واریز ثبت شد (PENDING)');
    } catch (error: any) {
      alert(error?.message || 'خطا در ثبت واریز');
    }
  };

  const handleWithdraw = async () => {
    if (!userId) return;

    try {
      await createWithdrawMutation.mutateAsync({
        asset,
        amount: Number(withdrawAmount),
        address: address || undefined,
      });
      alert('درخواست برداشت ثبت شد (PENDING)');
    } catch (error: any) {
      alert(error?.message || 'خطا در ثبت برداشت');
    }
  };

  const pendingDeposits = (depositsQuery.data ?? []).filter((d: any) => d.status === 'PENDING');
  const pendingWithdraws = (withdrawsQuery.data ?? []).filter((w: any) => w.status === 'PENDING');

  return (
    <div className="min-h-screen relative overflow-hidden flex p-4 lg:p-8 gap-8">
      <Sidebar />

      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 max-w-6xl mx-auto space-y-8">
        <GlassCard className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
              <WalletIcon size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold gold-text">کیف پول من</h1>
              <p className="text-white/50">سیستم واقعی درخواست واریز / برداشت</p>
            </div>
          </div>

          <p className="text-sm text-white/60">ارزش تقریبی (USDT): {totalUsdtValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-6 space-y-4">
            <h2 className="font-bold flex items-center gap-2"><ArrowUpRight size={18} /> درخواست واریز</h2>

            <select value={asset} onChange={(e) => setAsset(e.target.value as any)} className="w-full rounded-2xl bg-white/10 border border-white/20 p-3">
              {ASSETS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <GlassInput
              type="number"
              min="0"
              placeholder="مبلغ (حداقل 10)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />

            <GlassButton
              className="w-full"
              disabled={createDepositMutation.isPending || !depositAmount}
              onClick={handleDeposit}
            >
              {createDepositMutation.isPending ? 'در حال ثبت...' : 'ثبت درخواست واریز'}
            </GlassButton>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h2 className="font-bold flex items-center gap-2"><ArrowDownLeft size={18} /> درخواست برداشت</h2>

            <select value={asset} onChange={(e) => setAsset(e.target.value as any)} className="w-full rounded-2xl bg-white/10 border border-white/20 p-3">
              {ASSETS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <GlassInput
              type="number"
              min="0"
              placeholder="مبلغ (حداقل 10)"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />

            <GlassInput
              placeholder="آدرس برداشت (اختیاری)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <GlassButton
              className="w-full"
              variant="secondary"
              disabled={createWithdrawMutation.isPending || !withdrawAmount}
              onClick={handleWithdraw}
            >
              {createWithdrawMutation.isPending ? 'در حال ثبت...' : 'ثبت درخواست برداشت'}
            </GlassButton>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-6">
            <h3 className="font-bold mb-4">واریزهای در انتظار</h3>
            <div className="space-y-2 text-sm">
              {pendingDeposits.map((row: any) => (
                <div key={row.id} className="flex justify-between rounded-xl bg-white/5 p-3 border border-white/10">
                  <span>{row.asset}</span>
                  <span>{row.amount}</span>
                  <span>{row.status}</span>
                </div>
              ))}
              {!pendingDeposits.length && <p className="text-white/40">موردی وجود ندارد.</p>}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-bold mb-4">برداشت‌های در انتظار</h3>
            <div className="space-y-2 text-sm">
              {pendingWithdraws.map((row: any) => (
                <div key={row.id} className="flex justify-between rounded-xl bg-white/5 p-3 border border-white/10">
                  <span>{row.asset}</span>
                  <span>{row.amount}</span>
                  <span>{row.status}</span>
                </div>
              ))}
              {!pendingWithdraws.length && <p className="text-white/40">موردی وجود ندارد.</p>}
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-8">
          <h2 className="font-bold mb-4">موجودی دارایی‌ها</h2>
          <div className="space-y-3">
            {Object.entries(balances).map(([walletAsset, balance]: any) => (
              <div key={walletAsset} className="grid grid-cols-4 gap-2 rounded-xl bg-white/5 border border-white/10 p-4 text-sm">
                <span>{walletAsset}</span>
                <span>Avail: {Number(balance.available).toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
                <span>Locked: {Number(balance.locked).toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
                <span>Total: {Number(balance.total).toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-8">
          <h2 className="font-bold mb-4">تاریخچه تراکنش</h2>
          <div className="space-y-3 text-sm">
            {(myTransactionsQuery.data ?? []).map((row: any) => (
              <div key={row.id} className="grid grid-cols-5 gap-2 rounded-xl bg-white/5 border border-white/10 p-4">
                <span>{row.type}</span>
                <span>{row.asset}</span>
                <span>{row.amount}</span>
                <span>{row.status}</span>
                <span>{new Date(row.createdAt).toLocaleString()}</span>
              </div>
            ))}
            {!myTransactionsQuery.data?.length && <p className="text-white/40">تراکنشی ثبت نشده است.</p>}
          </div>
        </GlassCard>
      </motion.main>
    </div>
  );
}
