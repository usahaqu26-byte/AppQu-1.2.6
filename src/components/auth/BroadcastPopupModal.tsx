import React from 'react';
import { Radio, X, Bell, AlertTriangle, Info, ShieldAlert, Check } from 'lucide-react';
import { BroadcastAnnouncement, AuthSecurityService } from '../../services/authSecurityService';

interface BroadcastPopupModalProps {
  broadcast: BroadcastAnnouncement | null;
  onClose: () => void;
}

export const BroadcastPopupModal: React.FC<BroadcastPopupModalProps> = ({
  broadcast,
  onClose,
}) => {
  if (!broadcast) return null;

  const handleDismiss = () => {
    AuthSecurityService.markBroadcastSeen(broadcast.id);
    onClose();
  };

  const getUrgencyIcon = () => {
    switch (broadcast.urgency) {
      case 'darurat':
        return <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />;
      case 'penting':
        return <Bell className="w-6 h-6 text-amber-400" />;
      default:
        return <Info className="w-6 h-6 text-teal-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-stone-100 flex flex-col">
        {/* Header with Urgency Color */}
        <div
          className={`p-4 sm:p-5 border-b relative ${
            broadcast.urgency === 'darurat'
              ? 'bg-gradient-to-r from-red-950 via-stone-900 to-stone-950 border-red-800/40'
              : broadcast.urgency === 'penting'
              ? 'bg-gradient-to-r from-amber-950 via-stone-900 to-stone-950 border-amber-800/40'
              : 'bg-gradient-to-r from-teal-950 via-stone-900 to-stone-950 border-teal-800/40'
          }`}
        >
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-stone-300 hover:text-white transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ring-4 ${
                broadcast.urgency === 'darurat'
                  ? 'bg-red-500/20 text-red-400 ring-red-500/20'
                  : broadcast.urgency === 'penting'
                  ? 'bg-amber-500/20 text-amber-400 ring-amber-500/20'
                  : 'bg-teal-500/20 text-teal-400 ring-teal-500/20'
              }`}
            >
              {getUrgencyIcon()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                  Pengumuman Pengurus & Admin
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    broadcast.urgency === 'darurat'
                      ? 'bg-red-900/80 text-red-300'
                      : broadcast.urgency === 'penting'
                      ? 'bg-amber-900/80 text-amber-300'
                      : 'bg-teal-900/80 text-teal-300'
                  }`}
                >
                  {broadcast.urgency}
                </span>
              </div>
              <h3 className="text-base font-black text-white leading-tight mt-0.5">
                {broadcast.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3 text-xs">
          <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 text-stone-200 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
            {broadcast.message}
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400 px-1 font-mono">
            <span>Diterbitkan: {broadcast.createdAt}</span>
            <span>Target: {broadcast.targetRole.toUpperCase()}</span>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>SAYA MENGERTI / SUDAH DIBACA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
