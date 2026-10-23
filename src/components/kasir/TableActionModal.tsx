import React from 'react';
import {
  X,
  CreditCard,
  PlusCircle,
  Printer,
  Trash2,
  Receipt,
  UtensilsCrossed,
  Clock
} from 'lucide-react';
import { TableItem, Order } from '../../types';

interface TableActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableItem | null;
  activeOrder: Order | null;
  onPay: () => void;
  onAddMoreMenu: () => void;
  onViewReceipt: () => void;
  onClearTable: () => void;
}

export const TableActionModal: React.FC<TableActionModalProps> = ({
  isOpen,
  onClose,
  table,
  activeOrder,
  onPay,
  onAddMoreMenu,
  onViewReceipt,
  onClearTable,
}) => {
  if (!isOpen || !table) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const totalItems = activeOrder?.items.reduce((s, i) => s + i.quantity, 0) || 0;
  const totalBill = activeOrder?.total || table.totalAmount || 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div className="relative w-full max-h-[80vh] bg-stone-900 text-stone-100 rounded-t-3xl shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-250 border-t border-stone-800 p-4 space-y-3.5">
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-stone-700 rounded-full mx-auto -mt-1.5 mb-1 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">{table.name}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-900 text-rose-300 border border-rose-700">
                Terisi ({totalItems} Porsi)
              </span>
            </div>
            {activeOrder && (
              <p className="text-xs text-stone-400 mt-0.5 font-mono">
                {activeOrder.receiptNumber} · {activeOrder.customerName}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Bill summary card */}
        <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between">
          <div className="text-xs text-stone-400">
            <span>Total Tagihan Saat Ini:</span>
            <div className="text-[11px] text-stone-500 font-mono">
              {activeOrder?.items.map((i) => `${i.quantity}x ${i.name}`).slice(0, 2).join(', ')}
              {activeOrder && activeOrder.items.length > 2 ? ' ...' : ''}
            </div>
          </div>
          <div className="text-lg font-black text-amber-400 font-mono">
            {formatCurrency(totalBill)}
          </div>
        </div>

        {/* Primary Action 1: BAYAR / CHECKOUT */}
        <button
          onClick={() => {
            onClose();
            onPay();
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 active:scale-98 transition-all"
        >
          <CreditCard className="w-5 h-5 text-amber-300" />
          <span>Bayar & Selesaikan Transaksi</span>
        </button>

        {/* Action 2: TAMBAH MENU */}
        <button
          onClick={() => {
            onClose();
            onAddMoreMenu();
          }}
          className="w-full py-3 px-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-xs flex items-center justify-center gap-2 border border-stone-700 active:scale-98 transition-all"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>+ Tambah Menu Baru ke Meja Ini</span>
        </button>

        {/* Action 3 & 4 Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Lihat / Cetak Struk Dapur */}
          <button
            onClick={() => {
              onClose();
              onViewReceipt();
            }}
            className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-stone-700"
          >
            <Printer className="w-3.5 h-3.5 text-stone-400" />
            <span>Struk Dapur</span>
          </button>

          {/* Kosongkan / Batalkan Meja */}
          <button
            onClick={() => {
              if (confirm(`Batalkan pesanan dan kosongkan ${table.name}?`)) {
                onClose();
                onClearTable();
              }
            }}
            className="py-2.5 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-rose-900"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan Meja</span>
          </button>
        </div>
      </div>
    </div>
  );
};
