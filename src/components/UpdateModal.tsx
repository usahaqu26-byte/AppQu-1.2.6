import React from 'react';
import {
  Download,
  Sparkles,
  ExternalLink,
  X,
  FileCheck2,
  Clock,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { UpdateInfo, UpdateService } from '../services/updateService';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
}) => {
  if (!isOpen || !updateInfo) return null;

  const handleDownload = () => {
    if (updateInfo.apkDownloadUrl) {
      UpdateService.startDownload(updateInfo.apkDownloadUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-stone-100 flex flex-col max-h-[90vh]">
        {/* Header with Emerald Gradient */}
        <div className="bg-gradient-to-r from-emerald-900/80 via-emerald-800/80 to-teal-900/80 p-5 border-b border-emerald-700/30 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-stone-300 hover:text-white transition-all cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 mb-1">
                <span>Versi Baru Tersedia</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {updateInfo.releaseTitle || `Update v${updateInfo.latestVersion}`}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Version Comparison Card */}
          <div className="grid grid-cols-2 gap-2 bg-stone-950/70 p-3 rounded-xl border border-stone-800/80">
            <div>
              <p className="text-[11px] text-stone-400 mb-0.5">Versi Anda Saat Ini</p>
              <p className="font-mono font-semibold text-stone-300 text-sm">
                v{updateInfo.currentVersion}
              </p>
            </div>
            <div className="border-l border-stone-800 pl-3">
              <p className="text-[11px] text-emerald-400 mb-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Versi Rilis Terbaru</span>
              </p>
              <p className="font-mono font-bold text-emerald-400 text-sm">
                v{updateInfo.latestVersion}
              </p>
            </div>
          </div>

          {/* APK Details if available */}
          {updateInfo.apkFileName && (
            <div className="bg-stone-800/50 p-3 rounded-xl border border-stone-700/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate max-w-[200px]">
                  <p className="font-medium text-stone-200 truncate">{updateInfo.apkFileName}</p>
                  <p className="text-[10px] text-stone-400">{updateInfo.publishedAt}</p>
                </div>
              </div>
              {updateInfo.apkSizeMb && (
                <span className="px-2 py-1 rounded bg-stone-700/60 font-mono text-[11px] text-stone-300 font-semibold">
                  {updateInfo.apkSizeMb}
                </span>
              )}
            </div>
          )}

          {/* Release Notes */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 mb-2">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Catatan Rilis / Changelog:</span>
            </div>
            <div className="bg-stone-950/80 rounded-xl p-3 border border-stone-800 text-xs text-stone-300 max-h-40 overflow-y-auto leading-relaxed whitespace-pre-line font-sans">
              {updateInfo.releaseNotes}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-stone-950/90 border-t border-stone-800 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh APK Sekarang</span>
          </button>

          <a
            href={updateInfo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-1.5 border border-stone-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
};
