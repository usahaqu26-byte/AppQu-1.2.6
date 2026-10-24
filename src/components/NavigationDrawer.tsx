import React from 'react';
import {
  UtensilsCrossed,
  Boxes,
  TrendingUp,
  FileText,
  Settings,
  Printer,
  X,
  ChevronRight,
  Store,
  Receipt,
  Sparkles
} from 'lucide-react';
import { RestaurantProfile, PrinterConfig } from '../types';
import { UpdateService } from '../services/updateService';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  profile: RestaurantProfile;
  printerConfig: PrinterConfig;
  occupiedTablesCount: number;
  onBackToAppQu?: () => void;
  onCheckUpdate?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  profile,
  printerConfig,
  occupiedTablesCount,
  onBackToAppQu,
  onCheckUpdate,
}) => {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'kasir', label: '1. Kasir (Halaman Utama)', icon: UtensilsCrossed, badge: occupiedTablesCount > 0 ? `${occupiedTablesCount} Meja Aktif` : undefined },
    { id: 'bahan', label: '2. Modal & Bahan', icon: Boxes, badge: 'Stok' },
    { id: 'omset', label: '3. Omset (Pendapatan)', icon: TrendingUp, badge: 'Grafik' },
    { id: 'laporan', label: '4. Laporan Transaksi', icon: FileText, badge: 'PDF/XLS' },
    { id: 'setting', label: '5. Setting Aplikasi', icon: Settings, badge: undefined },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-[82%] max-w-[320px] h-full bg-stone-900 text-stone-100 flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-250 ease-out border-r border-stone-800">
        {/* Header Branding */}
        <div className="p-5 bg-gradient-to-br from-red-900 via-red-950 to-stone-900 border-b border-red-800/40 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-300 hover:text-white bg-black/20 hover:bg-black/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xl shadow-lg mb-3 ring-2 ring-amber-400/30">
            BQ
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            {profile.name}
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              v1.0
            </span>
          </h2>
          <p className="text-xs text-stone-300 line-clamp-1 mt-0.5">{profile.slogan}</p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-stone-300">
            <Store className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{profile.address}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {onBackToAppQu && (
            <button
              onClick={() => {
                onBackToAppQu();
                onClose();
              }}
              className="w-full mb-2 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm transition-all"
            >
              <Store className="w-4 h-4 text-amber-300" />
              <span>◀ Kembali ke Ekosistem AppQu</span>
            </button>
          )}

          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Navigasi Kasir BaksoQu
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-red-800/90 text-white shadow-md border border-red-700/50'
                    : 'text-stone-300 hover:bg-stone-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-amber-400 text-stone-950' : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-[13px]">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-red-950 text-amber-300'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Printer & Quick Status Card */}
        <div className="p-3.5 m-3 rounded-2xl bg-stone-800/80 border border-stone-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-200">
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Printer Thermal</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {printerConfig.paperSize}
            </span>
          </div>
          <div className="text-[11px] text-stone-400 truncate">
            {printerConfig.connectedDeviceName || 'Siap Terkoneksi'}
          </div>
          <button
            onClick={() => {
              onSelectTab('setting');
              onClose();
            }}
            className="w-full py-1.5 px-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <span>Atur Printer & Menu</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Auto Update Quick Trigger */}
        <div className="p-3 mx-3 mb-2 rounded-2xl bg-stone-800/80 border border-stone-700/60 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-200">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Versi Aplikasi</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              v{UpdateService.getCurrentVersion()}
            </span>
          </div>
          <button
            onClick={() => {
              if (onCheckUpdate) onCheckUpdate();
              onClose();
            }}
            className="w-full py-1.5 px-2 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Cek Pembaruan Versi</span>
          </button>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 text-center border-t border-stone-800 text-[10px] text-stone-400">
          Bakso Qu 1.0 · Android Native POS
        </div>
      </div>
    </div>
  );
};
