import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Printer,
  FileDown,
  Sparkles,
  Check,
  Search,
  MessageSquare
} from 'lucide-react';
import { MenuItem, OrderItem, MenuCategory, Order, OrderType } from '../../types';

interface OrderBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  orderType: OrderType;
  tableName?: string;
  tableId?: string;
  existingOrder?: Order | null;
  menuList: MenuItem[];
  onSaveAndPrint: (
    items: OrderItem[],
    type: OrderType,
    tableId?: string,
    tableName?: string,
    customerName?: string,
    printOption?: 'bluetooth' | 'pdf' | 'none'
  ) => void;
}

export const OrderBottomSheet: React.FC<OrderBottomSheetProps> = ({
  isOpen,
  onClose,
  orderType,
  tableName,
  tableId,
  existingOrder,
  menuList,
  onSaveAndPrint,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Record<string, { qty: number; notes: string }>>({});
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);

  useEffect(() => {
    if (existingOrder && isOpen) {
      const map: Record<string, { qty: number; notes: string }> = {};
      existingOrder.items.forEach((item) => {
        map[item.menuId] = { qty: item.quantity, notes: item.notes || '' };
      });
      setSelectedItems(map);
      setCustomerName(existingOrder.customerName || '');
    } else if (isOpen) {
      setSelectedItems({});
      setCustomerName(orderType === 'meja' ? (tableName ? `Tamu ${tableName}` : 'Tamu Meja') : 'Pelanggan Bungkus');
    }
  }, [existingOrder, isOpen, orderType, tableName]);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Semua Menu' },
    { id: 'bakso_kuah', label: 'Bakso Kuah' },
    { id: 'pelengkap', label: 'Pelengkap' },
    { id: 'minuman', label: 'Minuman Segar' },
    { id: 'paket', label: 'Paket Hemat' },
  ];

  const filteredMenu = menuList.filter((m) => {
    const matchCat = activeCategory === 'all' || m.category === activeCategory;
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch && m.isAvailable;
  });

  const handleUpdateQty = (menuId: string, delta: number) => {
    setSelectedItems((prev) => {
      const current = prev[menuId]?.qty || 0;
      const notes = prev[menuId]?.notes || '';
      const newQty = Math.max(0, current + delta);

      if (newQty === 0) {
        const copy = { ...prev };
        delete copy[menuId];
        return copy;
      }
      return {
        ...prev,
        [menuId]: { qty: newQty, notes },
      };
    });

    if (navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  const handleUpdateNotes = (menuId: string, notes: string) => {
    setSelectedItems((prev) => {
      if (!prev[menuId]) return prev;
      return {
        ...prev,
        [menuId]: { ...prev[menuId], notes },
      };
    });
  };

  // Convert selected items map to OrderItem array
  const orderItemsList: OrderItem[] = Object.entries(selectedItems)
    .filter(([_, data]) => data.qty > 0)
    .map(([menuId, data]) => {
      const itemDef = menuList.find((m) => m.id === menuId);
      return {
        menuId,
        name: itemDef?.name || 'Item',
        price: itemDef?.price || 0,
        quantity: data.qty,
        notes: data.notes || undefined,
      };
    });

  const totalItemCount = orderItemsList.reduce((sum, i) => sum + i.quantity, 0);
  const totalBill = orderItemsList.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const handleConfirmOrder = (printOption: 'bluetooth' | 'pdf' | 'none') => {
    if (orderItemsList.length === 0) {
      return;
    }
    onSaveAndPrint(
      orderItemsList,
      orderType,
      tableId,
      tableName,
      customerName.trim() || (orderType === 'meja' ? tableName || 'Meja' : 'Pelanggan'),
      printOption
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div className="relative w-full max-h-[88vh] bg-stone-900 text-stone-100 rounded-t-3xl shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-300 border-t border-stone-800">
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-stone-700 rounded-full mx-auto my-2.5 shrink-0" />

        {/* Sheet Header */}
        <div className="px-4 pb-3 flex items-center justify-between border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-white tracking-tight">
                {orderType === 'meja' ? `Pesanan: ${tableName || 'Meja'}` : 'Pesanan Bungkus (Takeaway)'}
              </span>
              {existingOrder && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Update Pesanan
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-0.5">Pilih menu, tentukan porsi & cetak struk dapur</p>
          </div>

          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-stone-800 text-stone-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="p-3 border-b border-stone-800 space-y-2 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari bakso, pelengkap, atau minuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-800/80 border border-stone-700 text-stone-200 text-xs focus:outline-hidden focus:border-amber-500 placeholder:text-stone-500"
            />
          </div>

          {/* Categories Tab Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-semibold transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items List (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredMenu.map((menu) => {
            const currentQty = selectedItems[menu.id]?.qty || 0;
            const currentNotes = selectedItems[menu.id]?.notes || '';
            const isEditingNote = editingNotesId === menu.id;

            return (
              <div
                key={menu.id}
                className={`p-2.5 rounded-2xl border transition-all ${
                  currentQty > 0
                    ? 'bg-stone-800/90 border-amber-500/60 shadow-md'
                    : 'bg-stone-800/40 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Food Thumbnail */}
                  <img
                    src={menu.imageUrl}
                    alt={menu.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-700/80 bg-stone-700"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-stone-100 truncate">{menu.name}</h3>
                    <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">{menu.description}</p>
                    <div className="text-xs font-extrabold text-amber-400 mt-1">
                      {formatCurrency(menu.price)}
                    </div>
                  </div>

                  {/* Counter (+/-) */}
                  <div className="flex items-center gap-2 shrink-0 bg-stone-900/90 p-1 rounded-xl border border-stone-700">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(menu.id, -1)}
                      disabled={currentQty === 0}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-stone-800 text-stone-300 disabled:opacity-30 active:scale-90 transition-transform"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-6 text-center font-mono font-bold text-xs text-white">
                      {currentQty}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleUpdateQty(menu.id, 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500 text-stone-950 font-bold active:scale-90 transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Optional Note Row if Selected */}
                {currentQty > 0 && (
                  <div className="mt-2 pt-2 border-t border-stone-700/60">
                    {isEditingNote ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Contoh: Tanpa daun bawang, kuah banyak..."
                          value={currentNotes}
                          onChange={(e) => handleUpdateNotes(menu.id, e.target.value)}
                          className="flex-1 px-2.5 py-1 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder:text-stone-500 focus:outline-hidden focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingNotesId(null)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingNotesId(menu.id)}
                        className="text-[11px] text-stone-400 hover:text-amber-400 flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3 h-3 text-amber-500" />
                        <span>{currentNotes ? `Catatan: ${currentNotes}` : '+ Tambah Catatan (Opsional)'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Order Summary & Action Footer */}
        <div className="p-3.5 bg-stone-950 border-t border-stone-800 shrink-0 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-400">
              Total: <strong className="text-stone-200">{totalItemCount} Menu</strong>
            </span>
            <span className="text-base font-black text-amber-400">
              {formatCurrency(totalBill)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Action 1: Simpan Saja */}
            <button
              onClick={() => handleConfirmOrder('none')}
              disabled={totalItemCount === 0}
              className="py-3 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 active:scale-98 transition-all"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Simpan Saja</span>
            </button>

            {/* Action 2: Simpan & Cetak Struk Dapur (Bluetooth Thermal) */}
            <button
              onClick={() => handleConfirmOrder('bluetooth')}
              disabled={totalItemCount === 0}
              className="py-3 px-3 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/50 disabled:opacity-40 active:scale-98 transition-all"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Simpan & Struk Dapur</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
