import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Smartphone,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Hash,
  Copy,
  Check,
  Sparkles,
  UserCheck,
  LogOut,
  ArrowRightLeft,
} from 'lucide-react';
import {
  AuthSecurityService,
  AuthSession,
  ADMIN_MASTER_EMAIL,
  ADMIN_DEFAULT_PIN,
  ADMIN_MASTER_RECOVERY_KEY,
} from '../../services/authSecurityService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AuthSession) => void;
  onLogout: () => void;
  currentSession: AuthSession | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onLogout,
  currentSession,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'recovery' | 'info'>('login');

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Device Transfer & Recovery Form States
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPin, setNewPin] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');

  // Device Fingerprint state
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDeviceFingerprint(AuthSecurityService.getDeviceFingerprint());
      setErrorMessage('');
      setSuccessMessage('');
      setRecoveryError('');
      setRecoverySuccess('');
      if (currentSession) {
        setEmail(currentSession.email);
      }
    }
  }, [isOpen, currentSession]);

  if (!isOpen) return null;

  // Auto-fill Demo Credentials
  const handleFillAdmin = () => {
    setEmail(ADMIN_MASTER_EMAIL);
    setPassword('AdminAppQu2026!');
    setPin(ADMIN_DEFAULT_PIN);
    setErrorMessage('');
  };

  const handleFillWarga = () => {
    setEmail('usahaqu26@gmail.com');
    setPassword('usaha123');
    setPin('123456');
    setErrorMessage('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password || !pin) {
      setErrorMessage('Harap isi Email, Password, dan PIN 6-angka secara lengkap.');
      return;
    }

    if (pin.length !== 6) {
      setErrorMessage('PIN harus berjumlah tepat 6 angka.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await AuthSecurityService.login(email, password, pin);
      if (res.success && res.session) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          onLoginSuccess(res.session!);
          onClose();
        }, 600);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Terjadi kesalahan pada sistem otentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');

    if (!recoveryEmail || !recoveryKey) {
      setRecoveryError('Harap masukkan Email dan Master Recovery Key.');
      return;
    }

    if (newPin && newPin.length !== 6) {
      setRecoveryError('Jika mengisi PIN baru, harus terdiri dari 6 angka.');
      return;
    }

    setRecoveryLoading(true);

    try {
      const res = await AuthSecurityService.recoverDeviceSession(recoveryEmail, recoveryKey, newPin);
      if (res.success && res.session) {
        setRecoverySuccess(res.message);
        setTimeout(() => {
          onLoginSuccess(res.session!);
          onClose();
        }, 800);
      } else {
        setRecoveryError(res.message);
      }
    } catch {
      setRecoveryError('Gagal memulihkan perangkat. Periksa kembali kunci darurat Anda.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard?.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div
      id="modalLoginAppQu"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-stone-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 p-4 sm:p-5 border-b border-emerald-800/40 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-stone-300 hover:text-white transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-stone-950 flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-emerald-400/20">
              <ShieldCheck className="w-6 h-6 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Keamanan Berlapis AppQu
                </span>
                <span className="text-[9px] bg-emerald-900/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700/60 font-bold">
                  SHA-256
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                {currentSession ? 'Status Akun & Sesi Aman' : 'Login & Otorisasi Perangkat'}
              </h2>
            </div>
          </div>

          {/* Device Fingerprint Badge */}
          <div className="mt-3 bg-black/50 border border-emerald-900/70 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-stone-300">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-stone-400">Hidden Device ID:</span>
              <span className="text-[10px] text-emerald-300 font-bold">{deviceFingerprint}</span>
            </div>
            <span className="text-[9px] bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-400 font-sans font-semibold border border-emerald-700/40">
              Terkunci
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-800 bg-stone-950/80 px-2 pt-2 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 text-center rounded-t-xl transition cursor-pointer ${
              activeTab === 'login'
                ? 'bg-stone-900 text-emerald-400 border-t border-x border-stone-800'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {currentSession ? 'Akun Saya' : 'Form Login'}
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`flex-1 py-2 text-center rounded-t-xl transition cursor-pointer ${
              activeTab === 'recovery'
                ? 'bg-stone-900 text-emerald-400 border-t border-x border-stone-800'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Ganti HP / Pulihkan
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 text-center rounded-t-xl transition cursor-pointer ${
              activeTab === 'info'
                ? 'bg-stone-900 text-emerald-400 border-t border-x border-stone-800'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Protokol Keamanan
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* ======================================================== */}
          {/* TAB 1: LOGIN ATAU SESI AKTIF                            */}
          {/* ======================================================== */}
          {activeTab === 'login' && (
            <>
              {currentSession ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider">
                        Sesi Login Aktif
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {currentSession.role}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">{currentSession.name}</p>
                      <p className="text-xs font-mono text-stone-300">{currentSession.email}</p>
                    </div>

                    {/* SHA-256 Lock Info */}
                    <div className="pt-2 border-t border-emerald-900/60 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-stone-400 font-mono">
                        <span>Device ID:</span>
                        <span className="text-emerald-300">{currentSession.deviceFingerprint}</span>
                      </div>
                      <div className="flex items-center justify-between text-stone-400 font-mono">
                        <span>Session Hash:</span>
                        <span className="text-stone-300 truncate max-w-[170px]" title={currentSession.sessionHash}>
                          {currentSession.sessionHash.substring(0, 16)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Master Recovery Key Info */}
                  <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-300 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        Master Recovery Key Anda:
                      </span>
                      <button
                        onClick={() => handleCopyKey(currentSession.recoveryKey)}
                        className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer bg-stone-800 px-2 py-0.5 rounded"
                      >
                        {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey ? 'Tersalin' : 'Salin Kunci'}</span>
                      </button>
                    </div>
                    <p className="font-mono text-xs font-bold text-amber-300 bg-stone-900 p-2 rounded-xl border border-stone-800 break-all select-all">
                      {currentSession.recoveryKey}
                    </p>
                    <p className="text-[10px] text-stone-400 leading-tight">
                      Simpan kunci ini di tempat aman! Digunakan saat Anda ganti HP atau memulihkan akses perangkat baru.
                    </p>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      onLogout();
                      setSuccessMessage('Anda telah keluar dari sesi.');
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-red-400 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-stone-700"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Keluar dari Akun (Logout)</span>
                  </button>
                </div>
              ) : (
                <form id="formLoginQu" onSubmit={handleLoginSubmit} className="space-y-3.5">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-950/80 border border-red-700/60 text-xs text-red-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-200 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Alamat Email Terdaftar</span>
                    </label>
                    <input
                      id="loginEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hendri.bageur20@gmail.com"
                      required
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-emerald-500 transition"
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Kata Sandi (Password)</span>
                    </label>
                    <input
                      id="loginPass"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-emerald-500 transition"
                    />
                  </div>

                  {/* 6-Digit PIN Input */}
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-amber-400" />
                        <span>PIN Keamanan (6 Angka)</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {pin.length}/6 Digit
                      </span>
                    </label>
                    <input
                      id="loginPin"
                      type="password"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPin(val);
                      }}
                      placeholder="123456"
                      required
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-mono tracking-widest text-center placeholder-stone-500 focus:outline-hidden focus:border-emerald-500 transition font-bold"
                    />
                  </div>

                  {/* Quick Preset Login Helpers */}
                  <div className="pt-1 space-y-1.5">
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                      Uji Coba Cepat (Preset Akun):
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleFillAdmin}
                        className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/50 text-[11px] font-bold text-amber-300 text-left transition cursor-pointer flex flex-col"
                      >
                        <span className="flex items-center gap-1 text-[10px] text-amber-400">
                          <Sparkles className="w-3 h-3" /> Admin Utama
                        </span>
                        <span className="text-stone-300 font-mono truncate text-[9px]">hendri.bageur20...</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleFillWarga}
                        className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-600/50 text-[11px] font-bold text-emerald-300 text-left transition cursor-pointer flex flex-col"
                      >
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <UserCheck className="w-3 h-3" /> Mitra UMKM / Warga
                        </span>
                        <span className="text-stone-300 font-mono truncate text-[9px]">usahaqu26...</span>
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mengotentikasi & Mengunci Sesi...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>MASUK & KUNCI SESI PERANGKAT</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* TAB 2: PEMULIHAN PERANGKAT / GANTI HP                     */}
          {/* ======================================================== */}
          {activeTab === 'recovery' && (
            <form onSubmit={handleRecoverySubmit} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200/90 space-y-1">
                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-4 h-4" />
                  Transfer Sesi ke HP Baru (Device Reset)
                </p>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Fitur ini digunakan jika Anda berganti ponsel atau browser. Masukkan Email akun dan <strong>Master Recovery Key</strong> Anda untuk memindahkan ikatan sesi ke ID perangkat ini.
                </p>
              </div>

              {recoveryError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-700/60 text-xs text-red-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{recoveryError}</span>
                </div>
              )}

              {recoverySuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{recoverySuccess}</span>
                </div>
              )}

              {/* Recovery Email */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Email Akun Anda</span>
                </label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="hendri.bageur20@gmail.com"
                  required
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-500 transition"
                />
              </div>

              {/* Master Recovery Key */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Master Recovery Key Darurat</span>
                </label>
                <input
                  type="text"
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value)}
                  placeholder="Contoh: APPQU-RECOVER-BAGEUR-2026-KEY-99X"
                  required
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-mono placeholder-stone-500 focus:outline-hidden focus:border-amber-500 transition"
                />
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryEmail(ADMIN_MASTER_EMAIL);
                    setRecoveryKey(ADMIN_MASTER_RECOVERY_KEY);
                  }}
                  className="mt-1 text-[10px] text-amber-400 hover:underline cursor-pointer"
                >
                  Gunakan Kunci Pemulihan Admin Default
                </button>
              </div>

              {/* Optional New PIN */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-stone-400" />
                    <span>Perbarui PIN 6-Angka (Opsional)</span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">6 Digit</span>
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Biarkan kosong jika tetap memakai PIN lama"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 font-mono tracking-widest text-center placeholder-stone-500 focus:outline-hidden focus:border-stone-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={recoveryLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-black text-xs shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {recoveryLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                    <span>Memverifikasi Kunci & Menautkan ID HP...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4 text-stone-950" />
                    <span>PULIHKAN & IKAT KE HP INI</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 3: PROTOKOL KEAMANAN & ANTI-ABUSE                   */}
          {/* ======================================================== */}
          {activeTab === 'info' && (
            <div className="space-y-3 text-xs text-stone-300">
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl space-y-1.5">
                <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  1. Hidden Device Fingerprint
                </p>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Setiap browser menghasilkan ID unik tersembunyi yang menggabungkan spesifikasi hardware, resolusi, timezone, dan entropy acak.
                </p>
              </div>

              <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl space-y-1.5">
                <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Hash className="w-4 h-4" />
                  2. Session Lock Hash (SHA-256)
                </p>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Sesi login dikunci menggunakan fungsi kriptografi SHA-256 yang menyatukan Email, ID Perangkat, dan Secret Salt. Sesi tidak dapat disalin atau dibajak ke perangkat lain.
                </p>
              </div>

              <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl space-y-1.5">
                <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  3. Mekanisme Anti-Abuse Finansial
                </p>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Setiap transaksi kas dan pesanan diberi checksum tanda tangan digital rahasia. Jika seseorang mengubah nominal atau status transaksi secara manual melalui LocalStorage browser, transaksi otomatis ditandai tidak sah (*Tamper Detected*).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
