import React, { useState } from 'react';
import {
  Download,
  Sparkles,
  ExternalLink,
  X,
  FileCheck2,
  Clock,
  Layers,
  CheckCircle2,
  Zap,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FolderOpen
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
  const [directInstallEnabled, setDirectInstallEnabled] = useState<boolean>(() =>
    UpdateService.isDirectInstallEnabled()
  );
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'ready' | 'error'>('idle');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showAndroidGuide, setShowAndroidGuide] = useState<boolean>(false);
  const [isWebUpdating, setIsWebUpdating] = useState<boolean>(false);

  if (!isOpen || !updateInfo) return null;

  // Toggle Direct Install Setting
  const handleToggleDirectInstall = () => {
    const next = !directInstallEnabled;
    setDirectInstallEnabled(next);
    UpdateService.setDirectInstallEnabled(next);
  };

  // 1-Tap Direct Install
  const handleDirectInstall = async () => {
    if (!updateInfo.apkDownloadUrl) return;

    setInstallStatus('installing');
    setProgressPercent(10);
    setStatusMessage('Menyiapkan paket instalasi...');

    try {
      const res = await UpdateService.installApkDirectly(
        updateInfo.apkDownloadUrl,
        updateInfo.apkFileName,
        (percent, msg) => {
          setProgressPercent(percent);
          setStatusMessage(msg);
        }
      );

      setInstallStatus('ready');
      setStatusMessage(res.message);
    } catch (err: any) {
      setInstallStatus('error');
      setStatusMessage(err.message || 'Gagal memulai instalasi.');
    }
  };

  // Instant Web Update (PWA/Browser Refresh)
  const handleInstantWebUpdate = async () => {
    setIsWebUpdating(true);
    setStatusMessage('Membersihkan cache lama & memuat rilis terbaru...');
    await new Promise((r) => setTimeout(r, 600));
    await UpdateService.instantWebUpdate();
  };

  // Manual Download Only
  const handleManualDownload = () => {
    if (updateInfo.apkDownloadUrl) {
      UpdateService.startDownload(updateInfo.apkDownloadUrl);
    }
  };

  const isAndroid = UpdateService.isAndroidDevice();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-stone-100 flex flex-col max-h-[92vh]">
        {/* Header with Emerald Gradient */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 p-4 sm:p-5 border-b border-emerald-700/30 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-stone-300 hover:text-white transition-all cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-md">
              <Zap className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Update Siap Pasang</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                {updateInfo.releaseTitle || `AppQu v${updateInfo.latestVersion}`}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs flex-1">
          {/* Version Comparison Card */}
          <div className="grid grid-cols-2 gap-2 bg-stone-950/80 p-3 rounded-2xl border border-stone-800">
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase mb-0.5">Versi Terpasang</p>
              <p className="font-mono font-bold text-stone-300 text-sm">
                v{updateInfo.currentVersion}
              </p>
            </div>
            <div className="border-l border-stone-800 pl-3">
              <p className="text-[10px] text-emerald-400 font-bold uppercase mb-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Versi Rilis Baru</span>
              </p>
              <p className="font-mono font-black text-emerald-400 text-sm">
                v{updateInfo.latestVersion}
              </p>
            </div>
          </div>

          {/* OPSI LANGSUNG PASANG (AUTO-INSTALLER) BANNER */}
          <div className="bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border border-emerald-600/40 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-black text-white text-xs">
                  Opsi: Langsung Install Otomatis
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleDirectInstall}
                className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                  directInstallEnabled ? 'bg-emerald-600 justify-end' : 'bg-stone-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </button>
            </div>
            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              {directInstallEnabled
                ? 'Aktif: Paket APK diunduh dan otomatis memicu jendela Package Installer Android untuk pasang tumpuk tanpa hapus data.'
                : 'Nonaktif: Paket APK hanya diunduh ke folder berkas tanpa otomatis memicu installer.'}
            </p>
          </div>

          {/* LIVE INSTALLING PROGRESS BAR */}
          {installStatus === 'installing' && (
            <div className="bg-stone-950 p-3.5 rounded-2xl border border-emerald-500/50 space-y-2 animate-in fade-in">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Proses Menyiapkan Instalasi...</span>
                </span>
                <span className="font-mono font-black text-amber-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-300 italic">{statusMessage}</p>
            </div>
          )}

          {/* READY TO INSTALL NOTICE */}
          {installStatus === 'ready' && (
            <div className="bg-emerald-950/80 p-3.5 rounded-2xl border border-emerald-500/60 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-300 font-black text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Paket APK Siap Dipasang!</span>
              </div>
              <p className="text-[11px] text-stone-200 leading-relaxed">
                {statusMessage}
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDirectInstall}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Buka Ulang Installer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAndroidGuide(!showAndroidGuide)}
                  className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs"
                >
                  Panduan
                </button>
              </div>
            </div>
          )}

          {/* APK File Details */}
          {updateInfo.apkFileName && (
            <div className="bg-stone-950/60 p-3 rounded-2xl border border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <p className="font-bold text-stone-200 truncate">{updateInfo.apkFileName}</p>
                  <p className="text-[10px] text-stone-400">{updateInfo.publishedAt}</p>
                </div>
              </div>
              {updateInfo.apkSizeMb && (
                <span className="px-2 py-0.5 rounded bg-stone-800 font-mono text-[11px] text-stone-300 font-bold shrink-0 ml-2">
                  {updateInfo.apkSizeMb}
                </span>
              )}
            </div>
          )}

          {/* Release Notes */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-300 mb-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Catatan Pembaruan & Fitur Baru:</span>
            </div>
            <div className="bg-stone-950/80 rounded-2xl p-3 border border-stone-800 text-[11px] text-stone-300 max-h-32 overflow-y-auto leading-relaxed whitespace-pre-line font-sans">
              {updateInfo.releaseNotes}
            </div>
          </div>

          {/* Collapsible Android Installation Guide */}
          <div className="border border-stone-800 rounded-2xl overflow-hidden bg-stone-950/40">
            <button
              type="button"
              onClick={() => setShowAndroidGuide(!showAndroidGuide)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-[11px] font-bold text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Panduan Izin Pasang APK di HP Android</span>
              </div>
              {showAndroidGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showAndroidGuide && (
              <div className="px-3.5 pb-3 text-[11px] text-stone-400 space-y-2 border-t border-stone-800/60 pt-2.5 leading-relaxed">
                <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-600/30 text-emerald-200">
                  <p className="font-bold text-white mb-0.5">✅ Update Timpa Tanpa Hapus Data:</p>
                  <p>Paket pembaruan ini menggunakan tanda tangan digital (keystore) konsisten. Anda dapat langsung memasang versi baru di atas versi lama tanpa uninstall. Seluruh data kasir, buku warga, dan login PIN tetap utuh 100%.</p>
                </div>
                <p>1. Jika muncul peringatan keamanan <strong>"Izinkan dari sumber ini"</strong>, ketuk <strong>Setelan</strong> lalu aktifkan izin instalasi.</p>
                <p>2. Ketuk tombol <strong>"Update / Pasang"</strong> pada jendela Android untuk langsung menimpa versi sebelumnya.</p>
                <p>3. Jika muncul pesan <em>"Aplikasi tidak terpasang / Paket bentrok"</em>, itu menandakan APK lama Anda ditandatangani dengan kunci lama yang berbeda. Copot (uninstall) versi lama sekali saja untuk beralih ke kunci permanen ini — pembaruan-pembaruan berikutnya akan selalu bisa ditimpa langsung tanpa uninstall!</p>
              </div>
            )}
          </div>

          {/* Instant Web Reload Option (Alternative) */}
          <div className="pt-1 flex items-center justify-between text-[11px] text-stone-400">
            <span>Pakai via Web Browser / PWA?</span>
            <button
              type="button"
              onClick={handleInstantWebUpdate}
              disabled={isWebUpdating}
              className="text-emerald-400 hover:text-emerald-300 underline font-bold cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isWebUpdating ? 'animate-spin' : ''}`} />
              <span>Update Versi Web Instan</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row gap-2">
          {/* PRIMARY BUTTON: DIRECT INSTALL */}
          <button
            type="button"
            onClick={handleDirectInstall}
            disabled={installStatus === 'installing'}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {installStatus === 'installing' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyiapkan Pasang...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Langsung Install / Pasang</span>
              </>
            )}
          </button>

          {/* SECONDARY BUTTONS */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleManualDownload}
              title="Unduh Berkas APK ke Penyimpanan HP"
              className="py-3 px-3.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-stone-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Unduh Saja</span>
            </button>

            <a
              href={updateInfo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Buka Catatan Rilis di GitHub"
              className="py-3 px-3.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-stone-700 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
