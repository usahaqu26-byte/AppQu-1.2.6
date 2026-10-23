import React, { useState } from 'react';
import {
  VolumeX,
  Sparkles,
  User,
  Radio,
  Layers,
  Store,
  Bike,
  Shield,
  Info,
  X,
  CheckCircle,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { sireneAudio } from '../../services/sireneAudio';

interface AppQuHeaderProps {
  currentUser: UserProfile;
  activeModuleName: string;
  onCheckUpdate?: () => void;
  // AreaQu Specific Controls
  isAreaQu?: boolean;
  areaRadiusMeters?: number;
  onSelectAreaRadius?: (radius: number) => void;
  areaCategory?: string;
  onSelectAreaCategory?: (category: string) => void;
  onOpenAreaRental?: () => void;
  onOpenAreaNeutrality?: () => void;
}

const RADIUS_OPTIONS = [
  { label: '500m', meters: 500 },
  { label: '1 km', meters: 1000 },
  { label: '3 km', meters: 3000 },
  { label: '5 km', meters: 5000 },
  { label: '10 km', meters: 10000 },
  { label: '25 km', meters: 25000 },
  { label: '50 km', meters: 50000 },
  { label: '100 km', meters: 100000 },
];

const CATEGORY_OPTIONS = [
  { id: 'all', label: 'Semua Titik', icon: Layers },
  { id: 'lapak', label: 'Lapak & Warung', icon: Store },
  { id: 'transportasi', label: 'Kurir 🛵', icon: Bike },
  { id: 'fasum', label: 'Fasum & Ronda', icon: Shield },
  { id: 'titik_netral', label: 'Titik Netral Parpol', icon: Info },
];

export const AppQuHeader: React.FC<AppQuHeaderProps> = ({
  currentUser,
  activeModuleName,
  onCheckUpdate,
  isAreaQu = false,
  areaRadiusMeters = 3000,
  onSelectAreaRadius,
  areaCategory = 'all',
  onSelectAreaCategory,
  onOpenAreaRental,
  onOpenAreaNeutrality,
}) => {
  const isSirenPlaying = sireneAudio.getIsPlaying();
  const [isRadiusOpen, setIsRadiusOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const handleStopSiren = () => {
    sireneAudio.stopSiren();
  };

  const isTier2 =
    currentUser.roleTier === 'tier2_pengurus_rt' ||
    currentUser.roleTier === 'pengurus' ||
    currentUser.roleTier === 'governance';

  const currentRadiusLabel =
    RADIUS_OPTIONS.find((r) => r.meters === areaRadiusMeters)?.label || '3 km';

  return (
    <header
      className="sticky top-0 z-30 bg-emerald-950 text-stone-100 border-b border-emerald-900/70 px-3 pb-2.5 flex items-center justify-between shrink-0 select-none shadow-md transition-all"
      style={{
        paddingTop: 'calc(max(env(safe-area-inset-top, 0px), 1.85rem) + 0.35rem)',
      }}
    >
      {/* Left: Branding & Module Label */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-sm shadow-md ring-1 ring-emerald-400/40 shrink-0">
          AQ
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-black text-white tracking-tight">AppQu</span>
            <span className="text-[10px] font-semibold text-amber-300 shrink-0">
              RT 04 / RW 09
            </span>
            {onCheckUpdate && !isAreaQu && (
              <button
                onClick={onCheckUpdate}
                title="Cek Pembaruan Versi Aplikasi"
                className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-900/90 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/50 flex items-center gap-0.5 cursor-pointer transition-colors"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                <span>v1.2.2</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-emerald-200/90 truncate max-w-[130px] xs:max-w-[170px] sm:max-w-[220px] font-medium leading-none mt-0.5">
            {activeModuleName}
          </p>
        </div>
      </div>

      {/* Right Controls: AreaQu Buttons + Siren + User Badge */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Siren Playing Active Mute Button */}
        {isSirenPlaying && (
          <button
            onClick={handleStopSiren}
            className="h-7.5 px-2 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center gap-1 text-[11px] font-bold animate-bounce shadow-md cursor-pointer shrink-0"
            title="Matikan Suara Sirene"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Mute</span>
          </button>
        )}

        {/* ========================================================= */}
        {/* AREAQU BUTTONS IN TOP HEADER (WARNA EMERALD-950 TETAP)   */}
        {/* ========================================================= */}
        {isAreaQu && (
          <div className="flex items-center gap-1">
            {/* 1. Opsi Radius (Hanya Icon + Dropdown List Tersembunyi) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsRadiusOpen(!isRadiusOpen);
                  setIsCategoryOpen(false);
                }}
                className={`h-7.5 px-2 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer active:scale-95 ${
                  isRadiusOpen || areaRadiusMeters !== 3000
                    ? 'bg-emerald-800 text-amber-300 border border-emerald-600 shadow-xs'
                    : 'bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60'
                }`}
                title={`Filter Radius: ${currentRadiusLabel}`}
                aria-label="Pilih Radius"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-[10px] font-mono font-bold leading-none">
                  {currentRadiusLabel.replace(' ', '')}
                </span>
              </button>

              {/* Hidden Dropdown List for Radius */}
              {isRadiusOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsRadiusOpen(false)} />
                  <div className="absolute right-0 top-9 w-44 bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-700/80 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2 py-1 text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center justify-between border-b border-emerald-800/80 mb-1">
                      <span>Jangkauan Radius</span>
                      <button
                        type="button"
                        onClick={() => setIsRadiusOpen(false)}
                        className="text-emerald-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-0.5 max-h-56 overflow-y-auto">
                      {RADIUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.meters}
                          type="button"
                          onClick={() => {
                            if (onSelectAreaRadius) onSelectAreaRadius(opt.meters);
                            setIsRadiusOpen(false);
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                            areaRadiusMeters === opt.meters
                              ? 'bg-emerald-700 text-white'
                              : 'text-stone-200 hover:bg-emerald-900/80'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {areaRadiusMeters === opt.meters && (
                            <CheckCircle className="w-3.5 h-3.5 text-amber-300" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 2. Opsi Semua Titik / Kategori (Hanya Icon + Dropdown List Tersembunyi) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryOpen(!isCategoryOpen);
                  setIsRadiusOpen(false);
                }}
                className={`h-7.5 w-7.5 rounded-xl text-xs font-bold flex items-center justify-center transition cursor-pointer active:scale-95 relative ${
                  isCategoryOpen || areaCategory !== 'all'
                    ? 'bg-emerald-800 text-amber-300 border border-emerald-600 shadow-xs'
                    : 'bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60'
                }`}
                title={`Filter Titik: ${CATEGORY_OPTIONS.find((c) => c.id === areaCategory)?.label || 'Semua Titik'}`}
                aria-label="Filter Titik"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-300" />
                {areaCategory !== 'all' && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-emerald-950" />
                )}
              </button>

              {/* Hidden Dropdown List for Categories */}
              {isCategoryOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                  <div className="absolute right-0 top-9 w-48 bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-700/80 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2 py-1 text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center justify-between border-b border-emerald-800/80 mb-1">
                      <span>Kategori Titik</span>
                      <button
                        type="button"
                        onClick={() => setIsCategoryOpen(false)}
                        className="text-emerald-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-0.5">
                      {CATEGORY_OPTIONS.map((cat) => {
                        const IconComp = cat.icon;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              if (onSelectAreaCategory) onSelectAreaCategory(cat.id);
                              setIsCategoryOpen(false);
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                              areaCategory === cat.id
                                ? 'bg-emerald-700 text-white'
                                : 'text-stone-200 hover:bg-emerald-900/80'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <IconComp className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{cat.label}</span>
                            </div>
                            {areaCategory === cat.id && (
                              <CheckCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 3. Sewa Lapak (Hanya Ikon) */}
            <button
              type="button"
              onClick={onOpenAreaRental}
              className="h-7.5 w-7.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition shrink-0"
              title="Sewa Lapak Digital Warga"
              aria-label="Sewa Lapak"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-950" />
            </button>

            {/* 4. Kebijakan Netral (Hanya Ikon) */}
            <button
              type="button"
              onClick={onOpenAreaNeutrality}
              className="h-7.5 w-7.5 bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 font-bold rounded-xl border border-emerald-700/60 flex items-center justify-center cursor-pointer active:scale-95 transition shrink-0"
              title="Kebijakan Netralitas Ormas & Parpol"
              aria-label="Kebijakan Netralitas"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-300" />
            </button>
          </div>
        )}

        {/* Current Active Role Pill Badge */}
        <div className="flex items-center gap-1 py-1 px-2 rounded-xl bg-emerald-900/70 border border-emerald-700/50 text-[10px] text-stone-200 shrink-0">
          <User className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="font-bold truncate max-w-[65px] xs:max-w-[85px] hidden xs:inline">
            {currentUser.name.split(' ')[0]}
          </span>
          <span className="font-mono text-[9px] px-1 rounded bg-black/40 text-amber-300 font-bold">
            {isTier2 ? 'T2' : 'T1'}
          </span>
        </div>
      </div>
    </header>
  );
};
