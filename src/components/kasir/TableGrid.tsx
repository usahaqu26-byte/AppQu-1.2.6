import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Plus,
  Users,
  Clock,
  Receipt,
  Utensils,
  CreditCard,
  Trash2,
  Move,
  GripVertical
} from 'lucide-react';
import { TableItem, Order } from '../../types';

interface TableGridProps {
  tables: TableItem[];
  activeOrders: Record<string, Order>;
  onSelectTable: (table: TableItem) => void;
  onAddTable: () => void;
  onReorderTables: (newTables: TableItem[]) => void;
  onDeleteTable: (tableId: string) => void;
}

export const TableGrid: React.FC<TableGridProps> = ({
  tables,
  activeOrders,
  onSelectTable,
  onAddTable,
  onReorderTables,
  onDeleteTable,
}) => {
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    if (isLocked) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (isLocked || draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...tables];
    const item = updated.splice(draggedIndex, 1)[0];
    updated.splice(targetIndex, 0, item);
    // Update positionIndex
    const reindexed = updated.map((t, idx) => ({ ...t, positionIndex: idx }));
    setDraggedIndex(targetIndex);
    onReorderTables(reindexed);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Status badge styling helper
  const getStatusInfo = (table: TableItem) => {
    const activeOrder = table.orderId ? activeOrders[table.orderId] : undefined;

    if (table.status === 'kosong') {
      return {
        label: 'Kosong',
        cardBg: 'bg-white border-emerald-200 hover:border-emerald-400',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotColor: 'bg-emerald-500',
        accentBar: 'bg-emerald-500',
      };
    }

    if (table.status === 'menunggu_bayar') {
      return {
        label: 'Menunggu Bayar',
        cardBg: 'bg-amber-50/70 border-amber-300 hover:border-amber-400',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        dotColor: 'bg-amber-500',
        accentBar: 'bg-amber-500',
      };
    }

    // Terisi
    return {
      label: 'Terisi',
      cardBg: 'bg-rose-50/60 border-rose-300 hover:border-rose-400',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
      dotColor: 'bg-rose-500',
      accentBar: 'bg-rose-600',
    };
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-3.5 space-y-3 pb-24">
      {/* Control Bar: Mode Denah, Total Meja & Lock/Unlock Switch */}
      <div className="flex items-center justify-between bg-stone-900 text-stone-200 p-2.5 rounded-2xl shadow-sm border border-stone-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-100">Denah Meja Resto</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-800 text-amber-400 font-mono font-medium">
            {tables.length} Meja
          </span>
        </div>

        {/* Toggle Switch Lock / Unlock */}
        <button
          onClick={() => {
            setIsLocked(!isLocked);
            if (navigator.vibrate) {
              try {
                navigator.vibrate(30);
              } catch {}
            }
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isLocked
              ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              : 'bg-amber-500 text-stone-950 font-bold shadow-md ring-2 ring-amber-400/40 animate-pulse'
          }`}
        >
          {isLocked ? (
            <>
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span>Posisi Terkunci</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-stone-950" />
              <span>Geser Meja (Bebas)</span>
            </>
          )}
        </button>
      </div>

      {/* Notice Banner when Unlocked */}
      {!isLocked && (
        <div className="bg-amber-100 text-amber-900 border border-amber-300 p-2.5 rounded-xl text-xs flex items-center gap-2">
          <Move className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Sentuh tahan & seret (drag) kartu meja untuk mengubah tata letak denah.</span>
        </div>
      )}

      {/* Grid Layout of Tables (Responsive Mobile 2-column or 3-column) */}
      <div className="grid grid-cols-2 gap-3">
        {tables.map((table, index) => {
          const statusInfo = getStatusInfo(table);
          const activeOrder = table.orderId ? activeOrders[table.orderId] : undefined;
          const isDragging = draggedIndex === index;

          return (
            <div
              key={table.id}
              draggable={!isLocked}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => {
                if (isLocked) {
                  onSelectTable(table);
                }
              }}
              className={`relative rounded-2xl border-2 transition-all duration-200 overflow-hidden shadow-sm select-none ${
                statusInfo.cardBg
              } ${isDragging ? 'opacity-40 scale-95 ring-2 ring-amber-500' : ''} ${
                isLocked ? 'cursor-pointer active:scale-98 hover:shadow-md' : 'cursor-grab active:cursor-grabbing'
              }`}
            >
              {/* Top Accent Bar */}
              <div className={`h-1.5 w-full ${statusInfo.accentBar}`} />

              <div className="p-3">
                {/* Header: Table Name + Move Icon / Status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {!isLocked && <GripVertical className="w-4 h-4 text-stone-400" />}
                    <span className="font-extrabold text-base text-stone-900 tracking-tight">
                      {table.name}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor} animate-pulse`} />
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${statusInfo.badgeBg}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                {table.status === 'kosong' ? (
                  <div className="py-3 flex flex-col items-center justify-center text-stone-400">
                    <Utensils className="w-6 h-6 stroke-[1.5] text-emerald-600/70 mb-1" />
                    <span className="text-xs font-semibold text-emerald-800">Ketuk untuk Order</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-1">
                    <div className="flex items-center justify-between text-xs text-stone-600">
                      <span className="flex items-center gap-1">
                        <Receipt className="w-3.5 h-3.5 text-stone-400" />
                        <span className="font-medium">
                          {activeOrder ? `${activeOrder.items.reduce((s, i) => s + i.quantity, 0)} Item` : `${table.itemsCount || 0} Item`}
                        </span>
                      </span>
                      {table.openedAt && (
                        <span className="text-[10px] text-stone-400 font-mono">
                          {table.openedAt}
                        </span>
                      )}
                    </div>

                    {/* Total Tagihan */}
                    <div className="pt-1 border-t border-stone-200/80 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-stone-500">Tagihan:</span>
                      <span className="text-sm font-extrabold text-rose-700">
                        {formatCurrency(activeOrder?.total || table.totalAmount || 0)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Footer Action Hint */}
                {table.status !== 'kosong' && (
                  <div className="mt-2 pt-1.5 border-t border-stone-200/60 flex items-center justify-between text-[11px] font-semibold text-stone-700">
                    <span className="text-amber-700">+ Tambah</span>
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] shadow-xs">
                      Bayar
                    </span>
                  </div>
                )}
              </div>

              {/* Delete Table Action (Only in Unlock Mode and if empty) */}
              {!isLocked && table.status === 'kosong' && tables.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTable(table.id);
                  }}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                  title="Hapus Meja Ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Action Button (FAB) "(+) Meja Baru" */}
      <div className="sticky bottom-2 flex justify-end pointer-events-none">
        <button
          onClick={onAddTable}
          className="pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-xs shadow-xl shadow-red-950/40 border border-amber-400/30 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>(+) Meja Baru</span>
        </button>
      </div>
    </div>
  );
};
