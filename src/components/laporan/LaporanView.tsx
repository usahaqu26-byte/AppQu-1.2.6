import React, { useState } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Printer,
  Search,
  Calendar,
  Filter,
  ChevronRight,
  Receipt,
  Utensils,
  ShoppingBag
} from 'lucide-react';
import { Order, RestaurantProfile } from '../../types';
import { ExportService } from '../../services/export';

interface LaporanViewProps {
  history: Order[];
  profile: RestaurantProfile;
  onOpenReceipt: (order: Order) => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  history,
  profile,
  onOpenReceipt,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'today' | '7days' | 'month' | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'meja' | 'bungkus'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Filter logic
  const filteredOrders = history.filter((ord) => {
    // Period filter
    const ordDate = new Date(ord.createdAt);
    if (filterPeriod === 'today') {
      if (ord.createdAt.slice(0, 10) !== todayStr) return false;
    } else if (filterPeriod === '7days') {
      const diffDays = (now.getTime() - ordDate.getTime()) / (1000 * 3600 * 24);
      if (diffDays > 7) return false;
    } else if (filterPeriod === 'month') {
      if (ordDate.getMonth() !== now.getMonth() || ordDate.getFullYear() !== now.getFullYear()) {
        return false;
      }
    }

    // Type filter
    if (filterType !== 'all' && ord.type !== filterType) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchReceipt = ord.receiptNumber.toLowerCase().includes(q);
      const matchCustomer = ord.customerName.toLowerCase().includes(q);
      const matchTable = ord.tableName?.toLowerCase().includes(q) || false;
      const matchItems = ord.items.some((i) => i.name.toLowerCase().includes(q));
      if (!matchReceipt && !matchCustomer && !matchTable && !matchItems) return false;
    }

    return true;
  });

  const totalFilteredRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);

  const getPeriodLabel = () => {
    switch (filterPeriod) {
      case 'today':
        return 'Hari Ini';
      case '7days':
        return '7 Hari Terakhir';
      case 'month':
        return 'Bulan Ini';
      default:
        return 'Semua Waktu';
    }
  };

  const handleExportCSV = () => {
    ExportService.exportToCSV(filteredOrders, profile);
  };

  const handleExportPDF = () => {
    ExportService.exportReportPDF(filteredOrders, profile, getPeriodLabel());
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-3.5 space-y-3 pb-24 text-stone-900">
      {/* Top Filter & Export Actions Card */}
      <div className="p-3.5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-900">
              Laporan Penjualan ({filteredOrders.length} Trx)
            </span>
            <div className="text-sm font-extrabold text-amber-700">
              {formatCurrency(totalFilteredRevenue)}
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportPDF}
              className="px-2.5 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs active:scale-95 transition-all"
              title="Export Laporan PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs active:scale-95 transition-all"
              title="Export Laporan Excel/CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel/CSV</span>
            </button>
          </div>
        </div>

        {/* Period Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          {[
            { id: 'today', label: 'Hari Ini' },
            { id: '7days', label: '7 Hari' },
            { id: 'month', label: 'Bulan Ini' },
            { id: 'all', label: 'Semua' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterPeriod(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-colors ${
                filterPeriod === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Service Type Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari No. Nota atau nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 font-semibold focus:outline-hidden"
          >
            <option value="all">Semua Tipe</option>
            <option value="meja">Makan di Tempat</option>
            <option value="bungkus">Bungkus</option>
          </select>
        </div>
      </div>

      {/* Transactions Scrollable List */}
      <div className="space-y-2">
        {filteredOrders.map((ord) => {
          const d = new Date(ord.createdAt);
          const timeFormatted = d.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const dateFormatted = d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
          });

          return (
            <div
              key={ord.id}
              onClick={() => onOpenReceipt(ord)}
              className="p-3 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-stone-300 active:scale-98 transition-all cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    ord.type === 'meja'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {ord.type === 'meja' ? (
                    <Utensils className="w-5 h-5" />
                  ) : (
                    <ShoppingBag className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-stone-900 truncate">
                      {ord.receiptNumber}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-stone-100 text-stone-600">
                      {ord.type === 'meja' ? ord.tableName || 'Meja' : 'Bungkus'}
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-500 truncate mt-0.5">
                    {dateFormatted} · {timeFormatted} · {ord.items.length} Macam Menu
                  </div>
                </div>
              </div>

              {/* Amount & Method */}
              <div className="text-right shrink-0 flex items-center gap-2">
                <div>
                  <div className="font-black text-xs text-stone-900 font-mono">
                    {formatCurrency(ord.total)}
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      ord.paymentMethod === 'tunai'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {ord.paymentMethod || 'Lunas'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="py-12 text-center text-xs text-stone-400">
            Tidak ada riwayat transaksi pada filter ini.
          </div>
        )}
      </div>
    </div>
  );
};
