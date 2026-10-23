import React from 'react';
import {
  Users,
  Store,
  MapPin,
  ShieldAlert,
  MessageSquare,
  Settings,
} from 'lucide-react';

interface AppQuBottomNavProps {
  activeModule: 'paguyuban' | 'warga' | 'usaha' | 'area' | 'siaga' | 'arsitektur' | 'chat' | 'setting';
  onSelectModule: (module: 'paguyuban' | 'warga' | 'usaha' | 'area' | 'siaga' | 'arsitektur' | 'chat' | 'setting') => void;
  onOpenHierarchy?: () => void;
  onOpenRoleModal?: () => void;
  unreadChatCount?: number;
  pendingApprovalsCount?: number;
  activeEmergencyCount?: number;
  witnessCount?: number;
}

export const AppQuBottomNav: React.FC<AppQuBottomNavProps> = ({
  activeModule,
  onSelectModule,
  unreadChatCount = 0,
  pendingApprovalsCount = 0,
  activeEmergencyCount = 0,
}) => {
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  return (
    <nav
      className="w-full bg-stone-900/98 backdrop-blur-md border-t border-stone-800/90 text-stone-400 px-1 pt-1.5 flex items-center justify-between shrink-0 z-30 shadow-2xl select-none sticky bottom-0 transition-all"
      style={{
        paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 1.25rem) + 0.35rem)',
        minHeight: 'calc(4rem + max(env(safe-area-inset-bottom, 0px), 1.25rem))',
      }}
    >
      {/* 1. PAGUYUBAN (Kas & Agenda Sosial RT) */}
      <button
        onClick={() => {
          triggerHaptic();
          onSelectModule('paguyuban');
        }}
        title="PaguyubanQu (Sosial & Kas RT)"
        aria-label="Paguyuban"
        className={`relative flex-1 flex flex-col items-center justify-center h-full py-1 px-1 rounded-2xl transition-all active:scale-95 cursor-pointer min-w-0 ${
          activeModule === 'paguyuban'
            ? 'text-emerald-400 font-bold bg-stone-800/95 shadow-sm'
            : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
        }`}
      >
        {activeModule === 'paguyuban' && (
          <span className="absolute -top-1 w-6 h-1 bg-emerald-400 rounded-full" />
        )}
        <div className="relative flex items-center justify-center">
          <Users
            className={`w-6 h-6 transition-transform duration-200 ${
              activeModule === 'paguyuban' ? 'scale-110 text-emerald-400' : ''
            }`}
          />
          {pendingApprovalsCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-amber-500 text-stone-950 text-[9px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center ring-2 ring-stone-900 shadow-xs">
              {pendingApprovalsCount}
            </span>
          )}
        </div>
        <span
          className={`text-[10px] font-extrabold uppercase tracking-tight mt-1 leading-none ${
            activeModule === 'paguyuban' ? 'text-emerald-400' : 'text-stone-400'
          }`}
        >
          Paguyuban
        </span>
      </button>

      {/* 2. USAHAQU (Lapak UMKM & POS) */}
      <button
        onClick={() => {
          triggerHaptic();
          onSelectModule('usaha');
        }}
        title="UsahaQu (Lapak UMKM & POS Kasir)"
        aria-label="Usaha"
        className={`relative flex-1 flex flex-col items-center justify-center h-full py-1 px-1 rounded-2xl transition-all active:scale-95 cursor-pointer min-w-0 ${
          activeModule === 'usaha'
            ? 'text-amber-400 font-bold bg-stone-800/95 shadow-sm'
            : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
        }`}
      >
        {activeModule === 'usaha' && (
          <span className="absolute -top-1 w-6 h-1 bg-amber-400 rounded-full" />
        )}
        <div className="relative flex items-center justify-center">
          <Store
            className={`w-6 h-6 transition-transform duration-200 ${
              activeModule === 'usaha' ? 'scale-110 text-amber-400' : ''
            }`}
          />
        </div>
        <span
          className={`text-[10px] font-extrabold uppercase tracking-tight mt-1 leading-none ${
            activeModule === 'usaha' ? 'text-amber-400' : 'text-stone-400'
          }`}
        >
          UsahaQu
        </span>
      </button>

      {/* 3. AREAQU (Peta & Zonasi GPS) */}
      <button
        onClick={() => {
          triggerHaptic();
          onSelectModule('area');
        }}
        title="AreaQu (Peta Wilayah & GPS)"
        aria-label="Area"
        className={`relative flex-1 flex flex-col items-center justify-center h-full py-1 px-1 rounded-2xl transition-all active:scale-95 cursor-pointer min-w-0 ${
          activeModule === 'area'
            ? 'text-teal-400 font-bold bg-stone-800/95 shadow-sm'
            : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
        }`}
      >
        {activeModule === 'area' && (
          <span className="absolute -top-1 w-6 h-1 bg-teal-400 rounded-full" />
        )}
        <div className="relative flex items-center justify-center">
          <MapPin
            className={`w-6 h-6 transition-transform duration-200 ${
              activeModule === 'area' ? 'scale-110 text-teal-400' : ''
            }`}
          />
        </div>
        <span
          className={`text-[10px] font-extrabold uppercase tracking-tight mt-1 leading-none ${
            activeModule === 'area' ? 'text-teal-400' : 'text-stone-400'
          }`}
        >
          AreaQu
        </span>
      </button>

      {/* 4. SIAGAQU (Tombol Darurat SOS & Keamanan) */}
      <button
        onClick={() => {
          triggerHaptic();
          onSelectModule('siaga');
        }}
        title="SiagaQu (Tombol Darurat SOS & Ronda)"
        aria-label="Siaga"
        className={`relative flex-1 flex flex-col items-center justify-center h-full py-1 px-1 rounded-2xl transition-all active:scale-95 cursor-pointer min-w-0 ${
          activeModule === 'siaga'
            ? 'text-red-400 font-bold bg-stone-800/95 shadow-sm'
            : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
        }`}
      >
        {activeModule === 'siaga' && (
          <span className="absolute -top-1 w-6 h-1 bg-red-500 rounded-full" />
        )}
        <div className="relative flex items-center justify-center">
          <ShieldAlert
            className={`w-6 h-6 transition-transform duration-200 ${
              activeModule === 'siaga' || activeEmergencyCount > 0
                ? 'scale-110 text-red-500 animate-pulse'
                : 'text-red-400'
            }`}
          />
          {activeEmergencyCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center ring-2 ring-stone-900 animate-bounce shadow-xs">
              {activeEmergencyCount}
            </span>
          )}
        </div>
        <span
          className={`text-[10px] font-extrabold uppercase tracking-tight mt-1 leading-none ${
            activeModule === 'siaga' || activeEmergencyCount > 0
              ? 'text-red-400 font-black animate-pulse'
              : 'text-stone-400'
          }`}
        >
          SiagaQu
        </span>
      </button>

      {/* 5. CHATQU (Percakapan Warga & Pesan) */}
      <button
        onClick={() => {
          triggerHaptic();
          onSelectModule('chat');
        }}
        title="ChatQu (Percakapan & Notifikasi Warga)"
        aria-label="Chat"
        className={`relative flex-1 flex flex-col items-center justify-center h-full py-1 px-1 rounded-2xl transition-all active:scale-95 cursor-pointer min-w-0 ${
          activeModule === 'chat'
            ? 'text-emerald-400 font-bold bg-stone-800/95 shadow-sm'
            : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
        }`}
      >
        {activeModule === 'chat' && (
          <span className="absolute -top-1 w-6 h-1 bg-emerald-400 rounded-full" />
        )}
        <div className="relative flex items-center justify-center">
          <MessageSquare
            className={`w-6 h-6 transition-transform duration-200 ${
              activeModule === 'chat' ? 'scale-110 text-emerald-400' : ''
            }`}
          />
          {unreadChatCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-emerald-500 text-stone-950 text-[9px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center ring-2 ring-stone-900 shadow-xs">
              {unreadChatCount}
            </span>
          )}
        </div>
        <span
          className={`text-[10px] font-extrabold uppercase tracking-tight mt-1 leading-none ${
            activeModule === 'chat' ? 'text-emerald-400' : 'text-stone-400'
          }`}
        >
          ChatQu
        </span>
      </button>

      {/* 6. OPSI / PENGATURAN (Hub Warga, Skema, Role, 2 Saksi, Printer & Update) */}
      <button
        onClick={() => {
          triggerHaptic();
          onSelectModule('setting');
        }}
        title="Opsi & Pengaturan (Warga, Skema, Role, 2 Saksi & Update)"
        aria-label="Opsi Pengaturan"
        className={`relative flex-1 flex flex-col items-center justify-center h-full py-1 px-1 rounded-2xl transition-all active:scale-95 cursor-pointer min-w-0 ${
          activeModule === 'setting' || activeModule === 'warga' || activeModule === 'arsitektur'
            ? 'text-stone-200 font-bold bg-stone-800/95 shadow-sm'
            : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
        }`}
      >
        {(activeModule === 'setting' || activeModule === 'warga' || activeModule === 'arsitektur') && (
          <span className="absolute -top-1 w-6 h-1 bg-stone-200 rounded-full" />
        )}
        <div className="relative flex items-center justify-center">
          <Settings
            className={`w-6 h-6 transition-transform duration-200 ${
              activeModule === 'setting' || activeModule === 'warga' || activeModule === 'arsitektur'
                ? 'scale-110 text-stone-200'
                : ''
            }`}
          />
        </div>
        <span
          className={`text-[10px] font-extrabold uppercase tracking-tight mt-1 leading-none ${
            activeModule === 'setting' || activeModule === 'warga' || activeModule === 'arsitektur'
              ? 'text-stone-200'
              : 'text-stone-400'
          }`}
        >
          Opsi
        </span>
      </button>
    </nav>
  );
};
