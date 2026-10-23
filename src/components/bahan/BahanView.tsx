import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  X,
  Check
} from 'lucide-react';
import { Ingredient } from '../../types';

interface BahanViewProps {
  ingredients: Ingredient[];
  onSaveIngredients: (items: Ingredient[]) => void;
}

export const BahanView: React.FC<BahanViewProps> = ({
  ingredients,
  onSaveIngredients,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);

  // Quick adjust stock modal state
  const [stockAdjustItem, setStockAdjustItem] = useState<Ingredient | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<'tambah' | 'kurang'>('tambah');

  // Form state for add/edit
  const [formName, setFormName] = useState('');
  const [formInitialQty, setFormInitialQty] = useState<number>(10);
  const [formUnit, setFormUnit] = useState<'kg' | 'gr' | 'pcs' | 'liter' | 'ikat' | 'pack'>('kg');
  const [formUnitPrice, setFormUnitPrice] = useState<number>(20000);
  const [formCurrentStock, setFormCurrentStock] = useState<number>(10);
  const [formMinAlert, setFormMinAlert] = useState<number>(3);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const filteredItems = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalInventoryValuation = ingredients.reduce(
    (sum, ing) => sum + ing.currentStock * ing.unitPrice,
    0
  );

  const lowStockCount = ingredients.filter(
    (ing) => ing.currentStock <= ing.minStockAlert
  ).length;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormInitialQty(10);
    setFormUnit('kg');
    setFormUnitPrice(25000);
    setFormCurrentStock(10);
    setFormMinAlert(3);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Ingredient) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormInitialQty(item.initialQty);
    setFormUnit(item.unit);
    setFormUnitPrice(item.unitPrice);
    setFormCurrentStock(item.currentStock);
    setFormMinAlert(item.minStockAlert);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Nama bahan wajib diisi!');
      return;
    }

    if (editingItem) {
      const updated = ingredients.map((ing) =>
        ing.id === editingItem.id
          ? {
              ...ing,
              name: formName.trim(),
              initialQty: formInitialQty,
              unit: formUnit,
              unitPrice: formUnitPrice,
              currentStock: formCurrentStock,
              minStockAlert: formMinAlert,
              updatedAt: new Date().toISOString(),
            }
          : ing
      );
      onSaveIngredients(updated);
    } else {
      const newItem: Ingredient = {
        id: `ing-${Date.now()}`,
        name: formName.trim(),
        initialQty: formInitialQty,
        unit: formUnit,
        unitPrice: formUnitPrice,
        currentStock: formCurrentStock,
        minStockAlert: formMinAlert,
        updatedAt: new Date().toISOString(),
      };
      onSaveIngredients([newItem, ...ingredients]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus bahan "${name}"?`)) {
      const updated = ingredients.filter((i) => i.id !== id);
      onSaveIngredients(updated);
    }
  };

  const handleSaveStockAdjust = () => {
    if (!stockAdjustItem || adjustAmount <= 0) return;

    const delta = adjustType === 'tambah' ? adjustAmount : -adjustAmount;
    const newStock = Math.max(0, stockAdjustItem.currentStock + delta);

    const updated = ingredients.map((ing) =>
      ing.id === stockAdjustItem.id
        ? {
            ...ing,
            currentStock: Number(newStock.toFixed(2)),
            updatedAt: new Date().toISOString(),
          }
        : ing
    );

    onSaveIngredients(updated);
    setStockAdjustItem(null);
    setAdjustAmount(0);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-3.5 space-y-3 pb-24 text-stone-900">
      {/* Top Valuation & Summary Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white shadow-lg border border-stone-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-stone-300">
              Total Nilai Stok Bahan
            </span>
          </div>
          {lowStockCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              {lowStockCount} Menipis
            </span>
          )}
        </div>

        <div className="text-2xl font-black text-amber-400 tracking-tight">
          {formatCurrency(totalInventoryValuation)}
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-800">
          <span>{ingredients.length} Jenis Bahan Baku</span>
          <span className="text-emerald-400 font-medium">Kalkulasi Otomatis (Qty x Harga)</span>
        </div>
      </div>

      {/* Action & Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari bahan (daging, tapioka...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 shadow-xs focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="h-9 px-3 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah</span>
        </button>
      </div>

      {/* List View / Card List */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => {
          const totalValue = item.currentStock * item.unitPrice;
          const isLowStock = item.currentStock <= item.minStockAlert;

          return (
            <div
              key={item.id}
              className={`p-3 rounded-2xl bg-white border transition-all shadow-xs ${
                isLowStock ? 'border-rose-300 bg-rose-50/20' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-extrabold text-stone-900 truncate">
                      {item.name}
                    </h3>
                    {isLowStock && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
                        Habis!
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Harga: <strong className="text-stone-700">{formatCurrency(item.unitPrice)}</strong> / {item.unit}
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                    title="Edit Bahan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                    title="Hapus Bahan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Data Grid: Qty Awal, Sisa Stok, Total Nilai */}
              <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-stone-100 text-center">
                <div className="p-1.5 rounded-xl bg-stone-50">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">
                    Qty Awal
                  </span>
                  <span className="text-xs font-bold text-stone-700 font-mono">
                    {item.initialQty} {item.unit}
                  </span>
                </div>

                <div className="p-1.5 rounded-xl bg-amber-50/60 border border-amber-200/50">
                  <span className="text-[9px] uppercase font-bold text-amber-700 block">
                    Sisa Stok
                  </span>
                  <span className="text-xs font-black text-amber-900 font-mono">
                    {item.currentStock} {item.unit}
                  </span>
                </div>

                <div className="p-1.5 rounded-xl bg-stone-50">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">
                    Total Nilai
                  </span>
                  <span className="text-xs font-extrabold text-stone-900 font-mono">
                    {formatCurrency(totalValue)}
                  </span>
                </div>
              </div>

              {/* Quick Restock / Pemakaian Button */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-stone-400">
                  Alert jika &le; {item.minStockAlert} {item.unit}
                </span>
                <button
                  onClick={() => {
                    setStockAdjustItem(item);
                    setAdjustType('tambah');
                    setAdjustAmount(5);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-bold flex items-center gap-1 active:scale-95 shadow-xs"
                >
                  <span>Update Stok</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-10 text-stone-400 text-xs">
            Tidak ada bahan ditemukan. Ketuk "(+) Tambah" untuk menambah bahan baku baru.
          </div>
        )}
      </div>

      {/* Modal Dialog: Tambah / Edit Bahan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-stone-900 text-stone-100 rounded-3xl p-4 shadow-2xl border border-stone-800 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-sm font-bold text-white">
                {editingItem ? 'Edit Bahan Baku' : 'Tambah Bahan Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Nama Bahan Baku:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Daging Sapi Paha"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Satuan:</label>
                  <select
                    value={formUnit}
                    onChange={(e: any) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="gr">gr (Gram)</option>
                    <option value="pcs">pcs (Buah/Butir)</option>
                    <option value="liter">liter</option>
                    <option value="pack">pack</option>
                    <option value="ikat">ikat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Harga Satuan (Rp):</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formUnitPrice}
                    onChange={(e) => setFormUnitPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Qty Awal:</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min={0}
                    value={formInitialQty}
                    onChange={(e) => setFormInitialQty(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Sisa Stok Sekarang:</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min={0}
                    value={formCurrentStock}
                    onChange={(e) => setFormCurrentStock(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Batas Peringatan Stok Menipis:
                </label>
                <input
                  type="number"
                  step="any"
                  min={0}
                  value={formMinAlert}
                  onChange={(e) => setFormMinAlert(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-[11px] flex justify-between items-center text-stone-300">
                <span>Estimasi Nilai Bahan:</span>
                <span className="font-extrabold text-amber-400 font-mono text-xs">
                  {formatCurrency(formCurrentStock * formUnitPrice)}
                </span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 text-white font-bold shadow-md"
                >
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog: Quick Stock Adjust */}
      {stockAdjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setStockAdjustItem(null)} />
          <div className="relative w-full max-w-sm bg-stone-900 text-stone-100 rounded-3xl p-4 shadow-2xl border border-stone-800 z-10 animate-in zoom-in-95 duration-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h3 className="text-sm font-bold text-white">Update Stok: {stockAdjustItem.name}</h3>
              <button onClick={() => setStockAdjustItem(null)} className="p-1 text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-300 p-2.5 bg-stone-800/80 rounded-xl">
              <span>Stok Saat Ini:</span>
              <span className="font-black text-amber-400 text-sm font-mono">
                {stockAdjustItem.currentStock} {stockAdjustItem.unit}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('tambah')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 ${
                  adjustType === 'tambah'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>+ Masuk (Restock)</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustType('kurang')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 ${
                  adjustType === 'kurang'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>- Terpakai (Masak)</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Jumlah ({stockAdjustItem.unit}):
              </label>
              <input
                type="number"
                step="any"
                min={0}
                value={adjustAmount || ''}
                onChange={(e) => setAdjustAmount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono text-base font-bold focus:outline-hidden focus:border-amber-500"
                placeholder="0"
              />
            </div>

            <div className="p-2.5 bg-stone-950 rounded-xl text-xs flex justify-between items-center text-stone-300">
              <span>Stok Akhir Nanti:</span>
              <span className="font-black text-white font-mono">
                {Math.max(
                  0,
                  adjustType === 'tambah'
                    ? stockAdjustItem.currentStock + adjustAmount
                    : stockAdjustItem.currentStock - adjustAmount
                ).toFixed(2)}{' '}
                {stockAdjustItem.unit}
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStockAdjustItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveStockAdjust}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 text-white font-bold text-xs shadow-md"
              >
                Konfirmasi Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
