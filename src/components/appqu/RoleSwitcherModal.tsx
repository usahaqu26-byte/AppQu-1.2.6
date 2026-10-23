import React from 'react';
import {
  UserCheck,
  X,
  Store,
  FileCode,
  Shield,
  CheckCircle2,
  Users,
  Building2,
  Wrench,
  Stethoscope,
  ShoppingBag,
  Sparkles,
  Scissors,
  Flame,
  Truck,
  HardHat,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { PRESET_USERS } from '../../services/storageAppQu';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onChangeUser: (user: UserProfile) => void;
  onSwitchToBaksoQu: () => void;
  onSwitchToBengkelQu?: () => void;
  onSwitchToKlinikQu?: () => void;
  onSwitchToRitelQu?: () => void;
  onSwitchToKulinerQu?: () => void;
  onSwitchToTransportasiQu?: () => void;
  onSwitchToPelayananQu?: () => void;
  onSwitchToProyekQu?: () => void;
  onOpenArsitektur: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onChangeUser,
  onSwitchToBaksoQu,
  onSwitchToBengkelQu,
  onSwitchToKlinikQu,
  onSwitchToRitelQu,
  onSwitchToKulinerQu,
  onSwitchToTransportasiQu,
  onSwitchToPelayananQu,
  onSwitchToProyekQu,
  onOpenArsitektur,
}) => {
  if (!isOpen) return null;

  // Filter preset users to strictly Tier 1 & Tier 2
  const tier1Users = Object.entries(PRESET_USERS).filter(
    ([_, u]) =>
      u.roleTier === 'tier1_akar_rumput' ||
      u.roleTier === 'warga' ||
      u.roleDetail === 'warga' ||
      u.roleDetail === 'relawan' ||
      u.roleDetail === 'keamanan_hansip'
  );

  const tier2Users = Object.entries(PRESET_USERS).filter(
    ([_, u]) =>
      u.roleTier === 'tier2_pengurus_rt' ||
      u.roleTier === 'pengurus' ||
      u.roleTier === 'governance' ||
      u.roleDetail === 'ketua_rt' ||
      u.roleDetail === 'sekretaris' ||
      u.roleDetail === 'bendahara' ||
      u.roleDetail === 'koordinator' ||
      u.roleDetail === 'wakil_rt'
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border-b border-emerald-800/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white leading-tight">
                Pilih Role Interaktif (RBAC)
              </h3>
              <p className="text-[11px] text-emerald-200/90 font-medium">
                Hirarki Validasi Berantai: Tier 1 & Tier 2 Saja
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active User Banner */}
        <div className="bg-stone-950 px-4 py-2.5 border-b border-stone-800/80 flex items-center justify-between text-xs shrink-0">
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
              Peran Anda Saat Ini:
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-extrabold text-white text-sm">{currentUser.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 font-semibold">
                {currentUser.roleTier === 'tier2_pengurus_rt' || currentUser.roleTier === 'pengurus' || currentUser.roleTier === 'governance'
                  ? 'Tier 2 (Pengurus RT)'
                  : 'Tier 1 (Akar Rumput)'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-amber-300 font-bold block">{currentUser.blockNumber}</span>
            <span className="text-[10px] text-stone-400">{currentUser.roleTitle}</span>
          </div>
        </div>

        {/* Scrollable Role List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TIER 2 SECTION: PENGURUS RT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-teal-300 uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>Tier 2: Pengurus RT & Paguyuban</span>
              </div>
              <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800/60 px-2 py-0.5 rounded-full font-bold">
                Otoritas & Approver
              </span>
            </div>

            <div className="space-y-1.5">
              {tier2Users.map(([key, user]) => {
                const isSelected = currentUser.id === user.id;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      onChangeUser(user);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-900/60 border-emerald-500 shadow-md ring-1 ring-emerald-400/30'
                        : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 hover:bg-stone-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-white">{user.name}</span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-stone-950 text-[9px] font-black">
                            AKTIF
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">{user.roleTitle}</p>
                    </div>
                    <span className="text-[10px] font-mono text-teal-300 bg-stone-900 px-2 py-1 rounded-xl border border-stone-800">
                      Tier 2
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TIER 1 SECTION: AKAR RUMPUT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-300 uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                <span>Tier 1: Akar Rumput & Warga</span>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
                Warga & Keamanan
              </span>
            </div>

            <div className="space-y-1.5">
              {tier1Users.map(([key, user]) => {
                const isSelected = currentUser.id === user.id;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      onChangeUser(user);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-900/60 border-emerald-500 shadow-md ring-1 ring-emerald-400/30'
                        : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 hover:bg-stone-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-white">{user.name}</span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-stone-950 text-[9px] font-black">
                            AKTIF
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">{user.roleTitle}</p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300 bg-stone-900 px-2 py-1 rounded-xl border border-stone-800">
                      Tier 1
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MASTER SWITCH POS MODUL USAHAQU */}
          <div className="space-y-2 pt-2 border-t border-stone-800">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>Buka Modul UsahaQu & POS Kasir:</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToBaksoQu();
                }}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Store className="w-4 h-4 text-white shrink-0" />
                <span className="truncate">POS BaksoQu</span>
              </button>

              {onSwitchToBengkelQu && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToBengkelQu();
                  }}
                  className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">BengkelQu</span>
                </button>
              )}

              {onSwitchToKlinikQu && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToKlinikQu();
                  }}
                  className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">KlinikQu</span>
                </button>
              )}

              {onSwitchToPelayananQu && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToPelayananQu();
                  }}
                  className="p-2.5 rounded-xl bg-orange-950/80 hover:bg-orange-900 text-orange-200 font-bold border border-orange-500/40 flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <Scissors className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="truncate">PelayananQu</span>
                </button>
              )}

              {onSwitchToTransportasiQu && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToTransportasiQu();
                  }}
                  className="p-2.5 rounded-xl bg-teal-950/80 hover:bg-teal-900 text-teal-200 font-bold border border-teal-500/40 flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="truncate">TransportasiQu</span>
                </button>
              )}

              {onSwitchToKulinerQu && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToKulinerQu();
                  }}
                  className="p-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 font-bold border border-amber-500/40 flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">KulinerQu</span>
                </button>
              )}

              {onSwitchToRitelQu && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToRitelQu();
                  }}
                  className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-blue-300 font-bold border border-blue-500/30 flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate">RitelQu</span>
                </button>
              )}

              {onSwitchToProyekQu && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToProyekQu();
                  }}
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <HardHat className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">ProyekQu</span>
                </button>
              )}
            </div>
          </div>

          {/* Architecture Document link */}
          <div className="pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenArsitektur();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 border border-stone-700/60 cursor-pointer"
            >
              <FileCode className="w-4 h-4" />
              <span>Lihat Dokumen Arsitektur & Skema DB</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-stone-400">
            RBAC Berantai: <strong className="text-emerald-400">Tier 1 & Tier 2</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
