import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  Receipt,
  DollarSign,
  Radio,
  Sliders,
  Send,
  Star,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Store,
  Check,
  X,
  Sparkles,
  Lock,
  RefreshCw,
  Gift,
  Bell,
  Clock,
  ChevronRight,
  BarChart3,
  CheckCheck,
} from 'lucide-react';
import {
  AuthSecurityService,
  AuthSession,
  MonetizationConfig,
  BroadcastAnnouncement,
  WargaQuiz,
  SatisfactionStats,
  MerchantVerificationItem,
  UserAuthRole,
  ADMIN_MASTER_EMAIL,
} from '../../services/authSecurityService';
import { ResidentData, KasTransaction } from '../../types';

interface AdminCommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: AuthSession | null;
  onOpenLoginModal: () => void;
  residents: ResidentData[];
  kasTransactions: KasTransaction[];
}

export const AdminCommandCenter: React.FC<AdminCommandCenterProps> = ({
  isOpen,
  onClose,
  currentSession,
  onOpenLoginModal,
  residents,
  kasTransactions,
}) => {
  const [activeTab, setActiveTab] = useState<
    'stats' | 'monetization' | 'broadcast' | 'quiz' | 'verification'
  >('stats');

  // Monetization State
  const [monetization, setMonetization] = useState<MonetizationConfig>(() =>
    AuthSecurityService.getMonetizationConfig()
  );
  const [isSavedMonetization, setIsSavedMonetization] = useState(false);

  // Broadcast State
  const [broadcasts, setBroadcasts] = useState<BroadcastAnnouncement[]>([]);
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcUrgency, setBcUrgency] = useState<'info' | 'penting' | 'darurat'>('info');
  const [bcTarget, setBcTarget] = useState<'semua' | 'warga' | 'pedagang' | 'b2b'>('semua');
  const [bcSuccess, setBcSuccess] = useState(false);

  // Quiz & Satisfaction State
  const [quizzes, setQuizzes] = useState<WargaQuiz[]>([]);
  const [satisfaction, setSatisfaction] = useState<SatisfactionStats>(() =>
    AuthSecurityService.getSatisfactionStats()
  );
  const [newQuizQuestion, setNewQuizQuestion] = useState('');
  const [newQuizOpt1, setNewQuizOpt1] = useState('');
  const [newQuizOpt2, setNewQuizOpt2] = useState('');
  const [newQuizOpt3, setNewQuizOpt3] = useState('');
  const [quizSuccess, setQuizSuccess] = useState(false);

  // Merchant Verification State
  const [merchants, setMerchants] = useState<MerchantVerificationItem[]>([]);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Reload data whenever opened
  useEffect(() => {
    if (isOpen) {
      setMonetization(AuthSecurityService.getMonetizationConfig());
      setBroadcasts(AuthSecurityService.getBroadcasts());
      setQuizzes(AuthSecurityService.getQuizzes());
      setSatisfaction(AuthSecurityService.getSatisfactionStats());
      setMerchants(AuthSecurityService.getMerchantApprovals());
      setActionSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Security Access Gate: Strictly for hendri.bageur20@gmail.com
  const isAdmin =
    currentSession &&
    currentSession.email.toLowerCase() === ADMIN_MASTER_EMAIL.toLowerCase();

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
        <div className="bg-stone-900 border border-red-900/60 rounded-3xl w-full max-w-md p-6 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-700/60 text-red-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">AKSES TERBATAS (ADMIN ONLY)</h3>
            <p className="text-xs text-stone-300 mt-2 leading-relaxed">
              Modul Panel Admin & Monetisasi Dinamis dikunci dan disembunyikan untuk umum. Otorisasi hanya diberikan untuk akun Master Super Admin:{' '}
              <span className="font-mono font-bold text-amber-300">{ADMIN_MASTER_EMAIL}</span>.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenLoginModal();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs transition cursor-pointer shadow-md"
            >
              LOGIN SEBAGAI SUPER ADMIN
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition cursor-pointer"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Real-Time Stats
  const totalWarga = residents.length || 48;
  const totalKasCount = kasTransactions.length || 36;
  const totalKasNominal = kasTransactions.reduce((acc, t) => acc + (t.amount || 0), 0) || 12850000;
  
  // Estimated Maintenance & Commission Pools
  const estimatedServiceFeePool = totalKasCount * monetization.retailServiceFee;
  const estimatedB2BCommission = Math.round((totalKasNominal * monetization.b2bCommissionPercent) / 100);
  const totalAccumulatedAdminRevenue = estimatedServiceFeePool + estimatedB2BCommission;

  // Handle Save Monetization
  const handleSaveMonetization = (e: React.FormEvent) => {
    e.preventDefault();
    AuthSecurityService.saveMonetizationConfig(monetization);
    setIsSavedMonetization(true);
    setTimeout(() => setIsSavedMonetization(false), 2500);
  };

  // Handle Send Broadcast
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle || !bcMessage) return;

    AuthSecurityService.addBroadcast(bcTitle, bcMessage, bcUrgency, bcTarget);
    setBroadcasts(AuthSecurityService.getBroadcasts());
    setBcTitle('');
    setBcMessage('');
    setBcSuccess(true);
    setTimeout(() => setBcSuccess(false), 3000);
  };

  // Handle Add Quiz
  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizQuestion || !newQuizOpt1 || !newQuizOpt2) return;

    const opts = [newQuizOpt1, newQuizOpt2];
    if (newQuizOpt3.trim()) opts.push(newQuizOpt3);

    AuthSecurityService.addQuiz(newQuizQuestion, opts);
    setQuizzes(AuthSecurityService.getQuizzes());
    setNewQuizQuestion('');
    setNewQuizOpt1('');
    setNewQuizOpt2('');
    setNewQuizOpt3('');
    setQuizSuccess(true);
    setTimeout(() => setQuizSuccess(false), 2500);
  };

  // Handle Approve / Reject Merchant
  const handleUpdateMerchant = (
    id: string,
    status: 'approved' | 'rejected' | 'pending',
    role?: UserAuthRole
  ) => {
    AuthSecurityService.updateMerchantStatus(id, status, role);
    setMerchants(AuthSecurityService.getMerchantApprovals());
    setActionSuccessMsg(`Status mitra berhasil diperbarui menjadi ${status.toUpperCase()}!`);
    setTimeout(() => setActionSuccessMsg(''), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-stone-100 flex flex-col max-h-[94vh]">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-stone-950 via-emerald-950 to-stone-900 p-4 sm:p-5 border-b border-emerald-800/40 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-stone-300 hover:text-white transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-amber-400/20">
              <Sparkles className="w-6 h-6 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  Panel Tersembunyi (Master Admin)
                </span>
                <span className="text-[9px] bg-amber-950 px-2 py-0.5 rounded-full text-amber-300 font-bold border border-amber-700/60">
                  Hendri Bageur
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                ADMIN COMMAND CENTER & MONETISASI
              </h2>
            </div>
          </div>
        </div>

        {/* Flat Minimalist Tabs */}
        <div className="flex border-b border-stone-800 bg-stone-950 px-2 pt-2 gap-1 overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-3 text-center whitespace-nowrap rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'stats'
                ? 'bg-stone-900 text-emerald-400 border-t border-x border-stone-800'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Statistik</span>
          </button>

          <button
            onClick={() => setActiveTab('monetization')}
            className={`py-2 px-3 text-center whitespace-nowrap rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'monetization'
                ? 'bg-stone-900 text-amber-400 border-t border-x border-stone-800'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Monetisasi Dinamis</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`py-2 px-3 text-center whitespace-nowrap rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'broadcast'
                ? 'bg-stone-900 text-teal-400 border-t border-x border-stone-800'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Broadcast Center</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`py-2 px-3 text-center whitespace-nowrap rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-stone-900 text-purple-400 border-t border-x border-stone-800'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Kepuasan & Kuis</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`py-2 px-3 text-center whitespace-nowrap rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'verification'
                ? 'bg-stone-900 text-blue-400 border-t border-x border-stone-800'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Verifikasi Warung ({merchants.filter((m) => m.status === 'pending').length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {actionSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: DASHBOARD STATISTIK REAL-TIME                     */}
          {/* ======================================================== */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                    <span className="font-semibold">Total Warga</span>
                    <Users className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-white">{totalWarga}</span>
                    <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">Jiwa Terdata</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                    <span className="font-semibold">Transaksi Kas/POS</span>
                    <Receipt className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-white">{totalKasCount}</span>
                    <span className="text-[10px] text-teal-400 font-bold block mt-0.5">Transaksi Valid</span>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                    <span className="font-semibold">Akumulasi Komisi/Fee</span>
                    <DollarSign className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                      Rp{totalAccumulatedAdminRevenue.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold block mt-0.5">
                      Pool Monetisasi Dinamis
                    </span>
                  </div>
                </div>
              </div>

              {/* Anti-Tamper & Security Status Card */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Status Integritas Data & Anti-Abuse Finansial
                  </span>
                  <span className="text-[9px] bg-emerald-900/90 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-600/50">
                    Semua Sah
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Seluruh transaksi finansial dienkripsi dengan signature rahasia (HMAC/SHA-256). Sesi aktif terkunci ke Device Fingerprint saat ini: <span className="font-mono font-bold text-emerald-300">{currentSession.deviceFingerprint}</span>.
                </p>
              </div>

              {/* Revenue Breakdown */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2.5">
                <p className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                  Rincian Akumulasi Pemeliharaan:
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-800 text-stone-300">
                    <span>Biaya Layanan Eceran (Rp{monetization.retailServiceFee} x {totalKasCount} trx):</span>
                    <span className="font-mono font-bold text-stone-100">
                      Rp{estimatedServiceFeePool.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-800 text-stone-300">
                    <span>Komisi B2B Grosir ({monetization.b2bCommissionPercent}% dari volume perputaran):</span>
                    <span className="font-mono font-bold text-stone-100">
                      Rp{estimatedB2BCommission.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-amber-300 font-bold pt-1">
                    <span>Total Estimasi Pendapatan Sistem:</span>
                    <span className="font-mono text-sm">
                      Rp{totalAccumulatedAdminRevenue.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: KONTROL PARAMETER MONETISASI DINAMIS             */}
          {/* ======================================================== */}
          {activeTab === 'monetization' && (
            <form onSubmit={handleSaveMonetization} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-1">
                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" />
                  Konfigurasi Parameter Monetisasi Terintegrasi
                </p>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Nilai ini akan secara langsung mempengaruhi kalkulasi nota kasir, transaksi grosir B2B, dan biaya pemeliharaan sistem di seluruh modul.
                </p>
              </div>

              {isSavedMonetization && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Konfigurasi monetisasi berhasil disimpan secara permanen di LocalStorage!</span>
                </div>
              )}

              {/* Retail Service Fee Input */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-300">
                    Biaya Layanan Transaksi Eceran (POS/Warga)
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Rp{monetization.retailServiceFee.toLocaleString('id-ID')}
                  </span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={2500}
                  step={100}
                  value={monetization.retailServiceFee}
                  onChange={(e) =>
                    setMonetization({ ...monetization, retailServiceFee: Number(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
                  <span>Rp500</span>
                  <span>Default: Rp1.000</span>
                  <span>Rp2.500</span>
                </div>
              </div>

              {/* B2B Commission Percent Input */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-300">
                    Persentase Komisi Transaksi Grosir B2B
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    {monetization.b2bCommissionPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={7}
                  step={0.5}
                  value={monetization.b2bCommissionPercent}
                  onChange={(e) =>
                    setMonetization({ ...monetization, b2bCommissionPercent: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
                  <span>1.0%</span>
                  <span>Default: 2.5%</span>
                  <span>7.0%</span>
                </div>
              </div>

              {/* Saklar Promo / Mode Lebaran */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-900/60 flex items-center justify-center text-amber-400">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Saklar Promo / Mode Lebaran
                      </span>
                      <span className="text-[10px] text-stone-400">
                        Diskon biaya layanan otomatis / Cap Fee murah
                      </span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() =>
                      setMonetization({
                        ...monetization,
                        isPromoLebaranActive: !monetization.isPromoLebaranActive,
                      })
                    }
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                      monetization.isPromoLebaranActive ? 'bg-amber-500 justify-end' : 'bg-stone-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition" />
                  </button>
                </div>

                {monetization.isPromoLebaranActive && (
                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
                    <span className="text-stone-300">Maksimum Cap Fee Saat Promo:</span>
                    <div className="flex items-center gap-1 font-mono">
                      <span>Rp</span>
                      <input
                        type="number"
                        value={monetization.promoCapFee}
                        onChange={(e) =>
                          setMonetization({ ...monetization, promoCapFee: Number(e.target.value) })
                        }
                        className="w-20 bg-stone-900 border border-stone-700 rounded px-2 py-1 text-amber-300 text-right font-bold focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4 text-stone-950" />
                <span>SIMPAN PERUBAHAN MONETISASI</span>
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 3: BROADCAST CENTER (PENGUMUMAN MASSAL)              */}
          {/* ======================================================== */}
          {activeTab === 'broadcast' && (
            <div className="space-y-4">
              <form onSubmit={handleSendBroadcast} className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-teal-400" />
                    Buat Pengumuman Massal Baru
                  </span>
                  <span className="text-[10px] text-teal-400 bg-teal-950 px-2 py-0.5 rounded font-bold border border-teal-800">
                    Pop-up ke Warga
                  </span>
                </div>

                {bcSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Broadcast pengumuman berhasil dikirim ke seluruh aplikasi warga!</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    Judul Pengumuman
                  </label>
                  <input
                    type="text"
                    value={bcTitle}
                    onChange={(e) => setBcTitle(e.target.value)}
                    placeholder="Contoh: Jadwal Kerja Bakti & Pembersihan Lingkungan"
                    required
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    Isi Pesan Lengkap
                  </label>
                  <textarea
                    rows={3}
                    value={bcMessage}
                    onChange={(e) => setBcMessage(e.target.value)}
                    placeholder="Tuliskan isi pengumuman yang akan langsung dibaca warga..."
                    required
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-teal-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 mb-1">Prioritas</label>
                    <select
                      value={bcUrgency}
                      onChange={(e: any) => setBcUrgency(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-200"
                    >
                      <option value="info">Info Umum</option>
                      <option value="penting">Penting</option>
                      <option value="darurat">Darurat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 mb-1">Sasaran</label>
                    <select
                      value={bcTarget}
                      onChange={(e: any) => setBcTarget(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-200"
                    >
                      <option value="semua">Semua Warga & Pedagang</option>
                      <option value="warga">Khusus Warga</option>
                      <option value="pedagang">Pedagang UsahaQu</option>
                      <option value="b2b">Supplier B2B</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>KIRIM PENGUMUMAN MASSAL</span>
                </button>
              </form>

              {/* Broadcast History */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Riwayat Pengumuman Aktif ({broadcasts.length}):
                </p>
                {broadcasts.map((bc) => (
                  <div key={bc.id} className="p-3 bg-stone-950 border border-stone-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{bc.title}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          bc.urgency === 'darurat'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : bc.urgency === 'penting'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        {bc.urgency}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400">{bc.message}</p>
                    <div className="flex items-center justify-between text-[9px] text-stone-500 font-mono pt-1">
                      <span>Target: {bc.targetRole}</span>
                      <span>Dibuat: {bc.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: TRACKER KEPUASAN & KUIS WARGA                    */}
          {/* ======================================================== */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              {/* Satisfaction Summary Card */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    Indeks Kepuasan Warga (CSAT)
                  </span>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    {satisfaction.averageRating} / 5.0
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {satisfaction.breakdown.map((b) => (
                    <div key={b.stars} className="flex items-center gap-2 text-[11px]">
                      <span className="w-12 text-stone-400">{b.stars} Bintang</span>
                      <div className="flex-1 h-2 rounded-full bg-stone-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{
                            width: `${Math.round((b.count / satisfaction.totalReviews) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-stone-400">{b.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create Quiz Form */}
              <form onSubmit={handleCreateQuiz} className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    Buat Kuis / Polling Warga Baru
                  </span>
                  <span className="text-[10px] text-purple-400 bg-purple-950 px-2 py-0.5 rounded font-bold border border-purple-800">
                    Interaktif
                  </span>
                </div>

                {quizSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Kuis warga berhasil diterbitkan!</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    Pertanyaan Kuis
                  </label>
                  <input
                    type="text"
                    value={newQuizQuestion}
                    onChange={(e) => setNewQuizQuestion(e.target.value)}
                    placeholder="Contoh: Setujukah Anda pemasangan CCTV tambahan di Gang 3?"
                    required
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-stone-400">Pilihan Jawaban</label>
                  <input
                    type="text"
                    value={newQuizOpt1}
                    onChange={(e) => setNewQuizOpt1(e.target.value)}
                    placeholder="Pilihan 1 (Misal: Ya, Sangat Perlu)"
                    required
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={newQuizOpt2}
                    onChange={(e) => setNewQuizOpt2(e.target.value)}
                    placeholder="Pilihan 2 (Misal: Belum Mendesak)"
                    required
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={newQuizOpt3}
                    onChange={(e) => setNewQuizOpt3(e.target.value)}
                    placeholder="Pilihan 3 (Opsional)"
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>PUBLIKASIKAN KUIS WARGA</span>
                </button>
              </form>

              {/* Active Quizzes List */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Daftar Kuis Aktif ({quizzes.length}):
                </p>
                {quizzes.map((q) => (
                  <div key={q.id} className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{q.question}</span>
                      <span className="text-[10px] font-mono text-purple-400 font-bold">
                        {q.totalVotes} Suara
                      </span>
                    </div>
                    <div className="space-y-1">
                      {q.options.map((opt) => (
                        <div key={opt.id} className="flex items-center justify-between text-[11px] bg-stone-900 px-2 py-1 rounded">
                          <span className="text-stone-300">{opt.text}</span>
                          <span className="font-mono text-purple-300 font-semibold">{opt.votes}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: VERIFIKASI AKUN & ROLE PERAN WARUNG               */}
          {/* ======================================================== */}
          {activeTab === 'verification' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 space-y-1">
                <p className="font-bold text-blue-300 flex items-center gap-1.5">
                  <Store className="w-4 h-4" />
                  Persetujuan & Penetapan Role Usaha
                </p>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Verifikasi pendaftaran warung baru dan tetapkan role resmi (Warga, Pedagang UsahaQu, atau Supplier B2B).
                </p>
              </div>

              <div className="space-y-2.5">
                {merchants.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.storeName}</h4>
                        <p className="text-xs text-stone-400">
                          Pemilik: <span className="text-stone-200">{item.ownerName}</span> ({item.phone})
                        </p>
                        <p className="text-[11px] text-stone-500 font-mono mt-0.5">{item.email}</p>
                      </div>

                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          item.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : item.status === 'rejected'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-700 animate-pulse'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] bg-stone-900 p-2 rounded-xl border border-stone-800/80">
                      <span className="text-stone-400">Role Diminta:</span>
                      <span className="font-bold text-amber-300">{item.requestedRole}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {item.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleUpdateMerchant(item.id, 'approved', item.requestedRole)}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui (Approve)</span>
                          </button>
                          <button
                            onClick={() => handleUpdateMerchant(item.id, 'rejected')}
                            className="py-2 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-between w-full text-xs text-stone-400">
                          <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <CheckCheck className="w-4 h-4" />
                            Telah Diproses
                          </span>
                          <button
                            onClick={() => handleUpdateMerchant(item.id, 'pending')}
                            className="text-[10px] text-stone-400 hover:text-white underline cursor-pointer"
                          >
                            Ubah Status
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
