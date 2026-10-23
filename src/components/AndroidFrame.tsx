import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Maximize2,
  Wifi,
  Battery,
  ChevronLeft,
  Circle,
  Square,
} from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  appLabel?: string;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  appLabel = 'AppQu',
}) => {
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isCapacitorNative = !!(window as any).Capacitor?.isNativePlatform?.();
    return isCapacitorNative || window.innerWidth < 768;
  });

  const [isFramed, setIsFramed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const isCapacitorNative = !!(window as any).Capacitor?.isNativePlatform?.();
    return !isCapacitorNative && window.innerWidth >= 768;
  });

  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const isCapacitorNative = !!(window as any).Capacitor?.isNativePlatform?.();
      const mobile = isCapacitorNative || window.innerWidth < 768;
      setIsMobileScreen(mobile);
      if (mobile) {
        setIsFramed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mode Native Mobile / Layar HP Asli (APK Android)
  if (isMobileScreen || !isFramed) {
    return (
      <div className="w-full h-screen h-[100dvh] max-h-screen bg-stone-100 text-stone-900 flex flex-col relative antialiased selection:bg-emerald-600 selection:text-white overflow-hidden">
        {/* Kontrol Desktop Toggle jika di layar besar */}
        {!isMobileScreen && (
          <div className="hidden sm:flex fixed top-3 right-3 items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-xs text-stone-400 backdrop-blur z-50 shadow-lg">
            <button
              onClick={() => setIsFramed(true)}
              className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Ganti ke Frame HP</span>
            </button>
          </div>
        )}

        <div className="flex-1 w-full max-w-md mx-auto flex flex-col relative overflow-hidden bg-stone-100 h-full">
          {children}
        </div>
      </div>
    );
  }

  // Mode Simulasi Frame HP (Untuk Desktop testing)
  return (
    <div className="min-h-screen w-full bg-stone-950 flex flex-col items-center justify-center p-2 sm:p-4 text-stone-100 antialiased selection:bg-emerald-600 selection:text-white">
      {/* Top Floating Viewport Mode Switcher for Desktop Testing */}
      <div className="hidden sm:flex items-center gap-3 mb-2 px-3 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-xs text-stone-400 backdrop-blur z-50">
        <div className="flex items-center gap-1.5 font-medium text-stone-300">
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Simulasi Android {appLabel}:</span>
        </div>
        <button
          onClick={() => setIsFramed(true)}
          className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all bg-emerald-700 text-white shadow-sm cursor-pointer"
        >
          HP Portrait Frame
        </button>
        <button
          onClick={() => setIsFramed(false)}
          className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 text-stone-400 hover:text-white cursor-pointer"
        >
          <Maximize2 className="w-3 h-3" />
          Full Screen
        </button>
      </div>

      {/* Main HP Frame Container */}
      <div className="w-full max-w-[420px] h-[860px] max-h-[94vh] rounded-[44px] border-[9px] border-stone-900 shadow-2xl ring-1 ring-white/10 flex flex-col bg-stone-100 text-stone-900 overflow-hidden relative">
        {/* Android Status Bar Simulation: Jam, Notch Kamera, 5G, Wifi & Baterai Safe Area */}
        <div className="bg-emerald-950 text-white/95 px-5 pt-2.5 pb-1.5 flex items-center justify-between text-[11px] font-semibold shrink-0 select-none z-40 border-b border-emerald-900/50">
          {/* Jam Kiri */}
          <span className="font-mono font-bold tracking-tight text-[11px] w-12 text-left">
            {currentTime}
          </span>

          {/* Kamera Depan / Punch Hole Notch */}
          <div className="w-4 h-4 rounded-full bg-stone-950 border border-stone-800 shadow-inner flex items-center justify-center -mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-900/80"></div>
          </div>

          {/* Ikon Sinyal, Wifi & Baterai Kanan */}
          <div className="flex items-center gap-1.5 w-16 justify-end">
            <span className="text-[9px] font-bold opacity-80">5G</span>
            <Wifi className="w-3 h-3 opacity-90" />
            <div className="flex items-center gap-0.5 text-[10px] font-mono">
              <Battery className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span className="text-[9px] font-bold">98%</span>
            </div>
          </div>
        </div>

        {/* Children App View */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-stone-100 h-full">
          {children}
        </div>

        {/* Android Navigation Bar Simulation: Tombol Navigasi Bawaan HP (Back, Home, Recents) */}
        <div className="bg-stone-900 text-stone-400 py-2 px-8 flex items-center justify-around shrink-0 z-40 select-none border-t border-stone-800/80">
          {/* Back Triangle / Chevron */}
          <button
            onClick={() => window.history.back()}
            className="p-1.5 hover:text-white transition active:scale-90 cursor-pointer"
            title="Navigasi Bawaan HP: Kembali (Back)"
            aria-label="Kembali"
          >
            <ChevronLeft className="w-5 h-5 text-stone-400 hover:text-white" />
          </button>

          {/* Home Button / Gesture Bar */}
          <div
            className="w-24 h-1.5 bg-stone-500 hover:bg-stone-300 rounded-full cursor-pointer transition active:scale-95"
            title="Navigasi Bawaan HP: Home Pill"
          />

          {/* Recents Button */}
          <button
            onClick={() => {}}
            className="p-1.5 hover:text-white transition active:scale-90 cursor-pointer"
            title="Navigasi Bawaan HP: Recent Apps"
            aria-label="Aplikasi Terakhir"
          >
            <Square className="w-4 h-4 text-stone-400 hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
