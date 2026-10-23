import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Calendar,
  CreditCard,
  Banknote,
  Utensils,
  ChevronRight,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { Order } from '../../types';

interface OmsetDashboardProps {
  history: Order[];
}

export const OmsetDashboard: React.FC<OmsetDashboardProps> = ({ history }) => {
  const [chartPeriod, setChartPeriod] = useState<'harian' | 'bulanan'>('harian');

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter transactions
  const paidOrders = history.filter((o) => o.status === 'paid');

  const todayOrders = paidOrders.filter((o) => o.createdAt.slice(0, 10) === todayStr);
  const thisMonthOrders = paidOrders.filter((o) => {
    const d = new Date(o.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const omsetToday = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const omsetMonth = thisMonthOrders.reduce((sum, o) => sum + o.total, 0);
  const totalTransactionsCount = paidOrders.length;
  const avgOrderValue = paidOrders.length > 0 ? Math.round(paidOrders.reduce((s, o) => s + o.total, 0) / paidOrders.length) : 0;

  // Breakdown Tunai vs QRIS
  const totalTunai = thisMonthOrders.filter((o) => o.paymentMethod === 'tunai').reduce((sum, o) => sum + o.total, 0);
  const totalQris = thisMonthOrders.filter((o) => o.paymentMethod === 'qris').reduce((sum, o) => sum + o.total, 0);
  const tunaiPercent = omsetMonth > 0 ? Math.round((totalTunai / omsetMonth) * 100) : 50;

  // Top Menu Items Sold
  const menuSalesMap: Record<string, { name: string; qty: number; total: number }> = {};
  paidOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!menuSalesMap[item.name]) {
        menuSalesMap[item.name] = { name: item.name, qty: 0, total: 0 };
      }
      menuSalesMap[item.name].qty += item.quantity;
      menuSalesMap[item.name].total += item.price * item.quantity;
    });
  });

  const topMenuItems = Object.values(menuSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Daily Chart Data: Last 7 days
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().slice(0, 10);
    const dayOrders = paidOrders.filter((o) => o.createdAt.slice(0, 10) === dStr);
    const total = dayOrders.reduce((sum, o) => sum + o.total, 0);
    const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
    return { label: dayName, dateStr: dStr, total, count: dayOrders.length };
  });

  // Monthly Chart Data: Last 6 months
  const monthsData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const monthOrders = paidOrders.filter((o) => {
      const ordDate = new Date(o.createdAt);
      return ordDate.getMonth() === m && ordDate.getFullYear() === y;
    });
    const total = monthOrders.reduce((sum, o) => sum + o.total, 0);
    const monthName = d.toLocaleDateString('id-ID', { month: 'short' });
    return { label: monthName, total, count: monthOrders.length };
  });

  const chartData = chartPeriod === 'harian' ? last7DaysData : monthsData;
  const maxChartVal = Math.max(...chartData.map((c) => c.total), 100000);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-3.5 space-y-3 pb-24 text-stone-900">
      {/* Hero Revenue Cards */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-red-950 via-stone-900 to-stone-950 text-white shadow-xl border border-red-900/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold tracking-tight uppercase">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Omset Hari Ini</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/80 text-white border border-red-700 font-medium">
            {todayOrders.length} Transaksi
          </span>
        </div>

        <div className="text-3xl font-black text-amber-400 tracking-tight">
          {formatCurrency(omsetToday)}
        </div>

        {/* 2-column micro sub-stats */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800">
          <div className="p-2 rounded-xl bg-stone-900/90 border border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase font-semibold block">
              Omset Bulan Ini
            </span>
            <span className="text-xs font-bold text-white font-mono">
              {formatCurrency(omsetMonth)}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-stone-900/90 border border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase font-semibold block">
              Rata-rata Order
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono">
              {formatCurrency(avgOrderValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Sales Chart Card */}
      <div className="p-3.5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-stone-900">
              Grafik Penjualan
            </span>
          </div>

          {/* Period Toggle Switch */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setChartPeriod('harian')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                chartPeriod === 'harian'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setChartPeriod('bulanan')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                chartPeriod === 'bulanan'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Bulanan
            </button>
          </div>
        </div>

        {/* Bar Chart Visual */}
        <div className="h-44 pt-4 flex items-end justify-between gap-2 px-1">
          {chartData.map((item, idx) => {
            const heightPercent = Math.max(8, Math.round((item.total / maxChartVal) * 100));
            const isLatest = idx === chartData.length - 1;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                {/* Tooltip on Hover / Tap */}
                <span className="text-[9px] font-mono text-stone-500 opacity-80 group-hover:opacity-100 font-semibold truncate max-w-full">
                  {item.total > 0 ? (item.total >= 1000 ? `${Math.round(item.total / 1000)}k` : item.total) : '0'}
                </span>

                <div className="w-full bg-stone-100 rounded-t-lg h-full flex items-end overflow-hidden max-w-[34px]">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isLatest
                        ? 'bg-gradient-to-t from-red-700 to-amber-500 shadow-sm'
                        : 'bg-stone-400 group-hover:bg-amber-600'
                    }`}
                  />
                </div>

                <span className="text-[10px] font-bold text-stone-600 mt-0.5">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metode Pembayaran (Tunai vs QRIS) Breakdown */}
      <div className="p-3.5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2.5">
        <span className="text-xs font-extrabold text-stone-900 block">
          Distribusi Metode Bayar (Bulan Ini)
        </span>

        {/* Progress bar */}
        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
          <div style={{ width: `${tunaiPercent}%` }} className="bg-amber-500 h-full" />
          <div style={{ width: `${100 - tunaiPercent}%` }} className="bg-red-700 h-full" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/70 border border-amber-200">
            <Banknote className="w-4 h-4 text-amber-700" />
            <div>
              <span className="text-[10px] text-amber-800 font-semibold block">Tunai ({tunaiPercent}%)</span>
              <span className="font-bold text-stone-900">{formatCurrency(totalTunai)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-red-50/70 border border-red-200">
            <CreditCard className="w-4 h-4 text-red-700" />
            <div>
              <span className="text-[10px] text-red-800 font-semibold block">QRIS ({100 - tunaiPercent}%)</span>
              <span className="font-bold text-stone-900">{formatCurrency(totalQris)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Terlaris (Top Selling Items) */}
      <div className="p-3.5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
        <span className="text-xs font-extrabold text-stone-900 block">
          5 Menu Paling Laris
        </span>

        <div className="divide-y divide-stone-100">
          {topMenuItems.map((item, idx) => (
            <div key={idx} className="py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-900 text-amber-400 font-bold text-[10px] flex items-center justify-center font-mono">
                  {idx + 1}
                </span>
                <span className="font-semibold text-stone-800">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-stone-900">{item.qty} Porsi</span>
                <span className="text-[10px] text-stone-400 block font-mono">
                  {formatCurrency(item.total)}
                </span>
              </div>
            </div>
          ))}

          {topMenuItems.length === 0 && (
            <div className="py-4 text-center text-xs text-stone-400">
              Belum ada data penjualan tercatat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
