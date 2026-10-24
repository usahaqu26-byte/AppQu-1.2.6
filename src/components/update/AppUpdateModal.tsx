import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  X,
  Clock,
  FileCheck2,
  AlertCircle,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { AppUpdateInfo } from '../../types';
import { APP_CURRENT_VERSION, UpdateService } from '../../services/updateService';

interface AppUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: AppUpdateInfo | null;
  onDismissVersion?: (version: string) => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
  onDismissVersion,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen || !updateInfo) return null;

  const handleStartDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    setInstallProgress(15);
    setStatusMessage('Memulai pengunduhan paket APK...');

    try {
      await UpdateService.installApkDirectly(
        updateInfo.apkDownloadUrl,
        updateInfo.apkName,
        (progress, msg) => {
          setInstallProgress(progress);
          setStatusMessage(msg);
        }
      );
      setDownloadSuccess(true);
    } catch {
      // Fallback to trigger download
      UpdateService.triggerDownload(updateInfo.apkDownloadUrl, updateInfo.apkName);
      setDownloadSuccess(true);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDismissLater = () => {
    if (onDismissVersion && updateInfo.version) {
      onDismissVersion(updateInfo.version);
    }
    onClose();
  };

  const formattedDate = () => {
    try {
      return new Date(updateInfo.releaseDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Terbaru';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Visual */}
        <div className="relative p-5 bg-gradient-to-br from-emerald-900 via-teal-950 to-stone-900 border-b border-emerald-800/40">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-white bg-black/30 hover:bg-black/50 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-stone-950 flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-emerald-400/20">
              <Sparkles className="w-6 h-6 text-stone-950" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Auto Update AppQu & BaksoQu
              </span>
              <h2 className="text-lg font-extrabold text-white leading-tight">
                Pembaruan Versi Tersedia!
              </h2>
            </div>
          </div>

          {/* Version Transition Badges */}
          <div className="mt-3.5 flex items-center gap-2 bg-stone-950/60 p-2 rounded-xl border border-emerald-900/60 text-xs">
            <div className="flex-1 text-center py-1 px-2 rounded-lg bg-stone-800/80 text-stone-300">
              <span className="text-[10px] block text-stone-400">Versi Saat Ini</span>
              <span className="font-mono font-bold text-stone-200">v{APP_CURRENT_VERSION}</span>
            </div>
            <div className="text-emerald-400 font-bold text-base">➔</div>
            <div className="flex-1 text-center py-1 px-2 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-300">
              <span className="text-[10px] block text-emerald-400">Versi Baru</span>
              <span className="font-mono font-bold text-white">v{updateInfo.version}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1">
          {/* Metadata Bar */}
          <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800 pb-2.5">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Rilis: {formattedDate()}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ukuran: ~{updateInfo.fileSizeMb || 16.5} MB</span>
            </div>
          </div>

          {/* Release Notes / Changelog */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-300 mb-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Catatan Pembaruan & Peningkatan:</span>
            </div>
            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3 text-xs text-stone-300 font-sans leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line select-text">
              {updateInfo.changelog || 'Perbaikan bug, peningkatan kestabilan, dan sinkronisasi ekosistem terbaru.'}
            </div>
          </div>

          {/* Download Success Notice */}
          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">File APK Sedang Diunduh!</p>
                <p className="text-[11px] text-emerald-300/90 mt-0.5">
                  Buka bilah notifikasi HP Anda lalu ketuk file <span className="font-mono font-bold">{updateInfo.apkName}</span> untuk memasang pembaruan.
                </p>
              </div>
            </div>
          )}

          {/* Direct Link Fallback */}
          <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1">
            <span>Unduh via browser alternatif?</span>
            <a
              href={updateInfo.apkDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1 font-medium"
            >
              <span>Link Langsung APK</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex flex-col xs:flex-row gap-2.5">
          <button
            onClick={handleDismissLater}
            disabled={isDownloading}
            className="flex-1 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>Nanti Saja</span>
          </button>

          <button
            onClick={handleStartDownload}
            disabled={isDownloading}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Memasang: {installProgress}% {statusMessage ? `(${statusMessage})` : ''}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>⚡ Langsung Install / Pasang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
