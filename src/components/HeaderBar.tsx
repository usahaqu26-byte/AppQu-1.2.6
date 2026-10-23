import React from 'react';
import { Menu, ShoppingBag, Printer, Sparkles } from 'lucide-react';
import { PrinterConfig } from '../types';

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  onOpenDrawer: () => void;
  onTakeawayClick: () => void;
  printerConfig: PrinterConfig;
  onOpenPrinterModal: () => void;
  showTakeawayBtn?: boolean;
  onBackToAppQu?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  onOpenDrawer,
  onTakeawayClick,
  printerConfig,
  onOpenPrinterModal,
  showTakeawayBtn = true,
  onBackToAppQu,
}) => {
  return (
    <header
      className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 px-3 pb-2 flex items-center justify-between shrink-0 select-none shadow-sm transition-all"
      style={{
        paddingTop: 'calc(max(env(safe-area-inset-top, 0px), 1.85rem) + 0.35rem)',
      }}
    >
      {/* Left: Navigation Drawer Toggle & Back to AppQu */}
      <div className="flex items-center gap-2">
        {onBackToAppQu && (
          <button
            onClick={onBackToAppQu}
            className="h-9 px-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white flex items-center gap-1 text-xs font-bold shadow-xs active:scale-95 transition-all"
            title="Kembali ke Ekosistem AppQu"
          >
            <span>◀ AppQu</span>
          </button>
        )}

        <button
          onClick={onOpenDrawer}
          className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-stone-800/90 text-stone-200 hover:text-white hover:bg-stone-700 active:scale-95 transition-all"
          aria-label="Buka Menu Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm font-bold text-white tracking-tight leading-tight flex items-center gap-1.5">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10px] text-stone-400 leading-none mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5">
        {/* Bluetooth Printer Indicator Pill */}
        <button
          onClick={onOpenPrinterModal}
          title="Status Printer Thermal Bluetooth"
          className="h-9 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center gap-1.5 text-xs font-medium border border-stone-700/60 active:scale-95 transition-all"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <Printer className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xs:inline text-[11px] font-mono text-stone-300">
            {printerConfig.paperSize}
          </span>
        </button>

        {/* Quick Bungkus / Takeaway Button */}
        {showTakeawayBtn && (
          <button
            onClick={onTakeawayClick}
            className="h-9 px-3 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white flex items-center gap-1.5 text-xs font-bold shadow-md shadow-red-950/40 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Bungkus</span>
          </button>
        )}
      </div>
    </header>
  );
};
