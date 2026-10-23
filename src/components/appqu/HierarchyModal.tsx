import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Smartphone,
  Check,
  X,
  Search,
  Building,
  Info,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import { UserProfile, RoleTier } from '../../types';
import { PendingVerificationItem } from '../../services/storageAppQu';

interface HierarchyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  pendingList: PendingVerificationItem[];
  onApproveResident: (id: string) => void;
  onRejectResident: (id: string) => void;
  onRequestWitness: (neighborName: string) => void;
  showNotification: (msg: string) => void;
}

export const HierarchyModal: React.FC<HierarchyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  pendingList,
  onApproveResident,
  onRejectResident,
  onRequestWitness,
  showNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'status_saya' | 'approval_rt' | 'hirarki_peran'>('status_saya');
  const [searchNeighbor, setSearchNeighbor] = useState('');

  if (!isOpen) return null;

  const isPengurusOrGovernance =
    currentUser.roleTier === 'tier2_pengurus_rt' ||
    currentUser.roleTier === 'pengurus' ||
    currentUser.roleTier === 'governance';

  // Neighbor candidates for witnesses
  const neighborCandidates = [
    { name: 'Pak Agus Suparman (Hansip)', block: 'Pos Keamanan', verified: true, kuotaLeft: 4 },
    { name: 'Siti Rahmawati', block: 'Blok B3 No. 16', verified: true, kuotaLeft: 8 },
    { name: 'H. Sutisna (BaksoQu)', block: 'Blok C1 No. 04', verified: true, kuotaLeft: 6 },
    { name: 'Dra. Hj. Nuraini (Bendahara)', block: 'Blok B2 No. 05', verified: true, kuotaLeft: 6 },
    { name: 'Ahmad Fauzi (Sekretaris)', block: 'Blok B1 No. 08', verified: true, kuotaLeft: 5 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden text-stone-900">
        {/* Modal Header */}
        <div className="p-4 bg-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700/80 border border-emerald-500/40 flex items-center justify-center text-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                Validasi Berantai & Hirarki AppQu
              </h3>
              <p className="text-xs text-emerald-200/80">
                Sistem Saksi Tetangga & Hirarki Otoritas (Tier 1 & Tier 2 Saja)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-stone-200 bg-stone-100 p-1 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('status_saya')}
            className={`flex-1 py-2 font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'status_saya'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Status Saksi Saya
          </button>
          {isPengurusOrGovernance && (
            <button
              onClick={() => setActiveTab('approval_rt')}
              className={`flex-1 py-2 font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'approval_rt'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Antrean RT</span>
              {pendingList.filter((p) => p.status === 'pending_approval').length > 0 && (
                <span className="w-5 h-5 bg-amber-500 text-stone-950 font-black rounded-full text-[10px] flex items-center justify-center">
                  {pendingList.filter((p) => p.status === 'pending_approval').length}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTab('hirarki_peran')}
            className={`flex-1 py-2 font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'hirarki_peran'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Hirarki (Tier 1 & 2)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: STATUS SAKSI SAYA */}
          {activeTab === 'status_saya' && (
            <div className="space-y-4">
              {/* Card Ringkasan Status Akun */}
              <div
                className={`p-4 rounded-2xl border ${
                  currentUser.verificationStatus === 'permanent_verified'
                    ? 'bg-emerald-50 border-emerald-200'
                    : currentUser.verificationStatus === 'temporary_active'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-rose-50 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Status Identitas Warga
                      </span>
                      {currentUser.verificationStatus === 'permanent_verified' ? (
                        <span className="text-xs bg-emerald-700 text-white font-extrabold px-2 py-0.5 rounded-full">
                          Permanent Verified
                        </span>
                      ) : currentUser.verificationStatus === 'temporary_active' ? (
                        <span className="text-xs bg-amber-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                          Temporary Active
                        </span>
                      ) : (
                        <span className="text-xs bg-rose-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                          Unverified (Terkunci)
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-black text-stone-900 mt-1">
                      {currentUser.name}
                    </h4>
                    <p className="text-xs text-stone-600">
                      {currentUser.blockNumber} • {currentUser.roleTitle}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-2xl bg-white shadow-xs border border-stone-200 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5 text-emerald-800" />
                  </div>
                </div>

                {/* Device Lock Info */}
                <div className="mt-3 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-600">
                  <span className="font-medium">Device Lock (1 HP = 1 Akun):</span>
                  <span className="font-mono text-stone-800 bg-white px-2 py-0.5 rounded border border-stone-200">
                    {currentUser.deviceFingerprint || 'DEV-ANDROID-047A'}
                  </span>
                </div>
              </div>

              {/* Progress 2 Saksi Tetangga */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-stone-900">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span>Saksi & Penjamin Tetangga RT 04</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      (currentUser.witnessCount || 0) >= 2
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {currentUser.witnessCount || 0}/2 Saksi Terverifikasi
                  </span>
                </div>

                {/* Status Bar */}
                <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      (currentUser.witnessCount || 0) >= 2 ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                    style={{
                      width: `${Math.min(100, ((currentUser.witnessCount || 0) / 2) * 100)}%`,
                    }}
                  />
                </div>

                {/* Status Penjelasan Panic Button */}
                <div className="text-xs p-2.5 rounded-xl bg-white border border-stone-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-stone-700 leading-relaxed">
                    <strong>Syarat Buka Kunci Panic Button RT:</strong> Wajib memiliki minimal{' '}
                    <span className="font-bold text-stone-900">2 Saksi Tetangga Valid</span> dan berada
                    di radius geofencing RT 04.
                    {(currentUser.witnessCount || 0) >= 2 ? (
                      <span className="block mt-1 text-emerald-700 font-bold">
                        ✓ Kunci Panic Button terbuka (Dapat Digunakan).
                      </span>
                    ) : (
                      <span className="block mt-1 text-rose-700 font-bold">
                        ✕ Panic Button masih terkunci hingga 2 saksi mengkonfirmasi.
                      </span>
                    )}
                  </div>
                </div>

                {/* Saksi Terdaftar */}
                {currentUser.witnesses && currentUser.witnesses.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs font-bold text-stone-700">Daftar Saksi Penjamin Anda:</p>
                    {currentUser.witnesses.map((w, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <div>
                            <span className="font-bold text-stone-900">{w.name}</span>
                            <span className="text-stone-500 block text-[11px]">{w.blockNumber}</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-stone-500">{w.confirmedAt}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 italic">Belum ada saksi tetangga yang terhubung.</p>
                )}

                {/* Tombol Cari Saksi Tetangga jika < 2 saksi */}
                {(currentUser.witnessCount || 0) < 2 && (
                  <div className="pt-2 border-t border-stone-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                      <span>Cari Tetangga Penjamin di RT 04:</span>
                      <span className="text-[11px] text-stone-500 font-normal">Kuota jamin maks 10/bln</span>
                    </div>

                    <div className="space-y-1.5">
                      {neighborCandidates.map((cand, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between hover:border-emerald-300 transition"
                        >
                          <div>
                            <div className="font-bold text-xs text-stone-900">{cand.name}</div>
                            <div className="text-[11px] text-stone-500">
                              {cand.block} • Sisa Kuota Jamin: {cand.kuotaLeft}/10
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onRequestWitness(cand.name);
                              showNotification(`Permintaan saksi dikirim ke ${cand.name}.`);
                            }}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Minta Saksi</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Temporary 30 Hari Card */}
              {currentUser.verificationStatus === 'temporary_active' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Tenggat Validasi Pengurus RT (30 Hari)</span>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed">
                    Akun Anda saat ini berstatus <strong>Temporary Active</strong>. Wajib disetujui
                    penuh oleh Ketua/Pengurus RT dalam tenggat:{' '}
                    <span className="font-black text-amber-950 underline">
                      Sisa {currentUser.temporaryDaysLeft ?? 18} Hari
                    </span>
                    . Jika melewati 30 hari tanpa approval, akses sistem akan otomatis dibatasi.
                  </p>
                </div>
              )}

              {/* Kuota Penjamin Pengguna */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-800 block">Kuota Anda Menjamin Tetangga:</span>
                  <span className="text-stone-500">Maksimal 10 warga per bulan per akun/HP</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-800">
                    {currentUser.guarantorUsedCount || 0} / {currentUser.guarantorMonthlyQuota || 10}
                  </span>
                  <span className="block text-[10px] text-stone-500">Tersedia {10 - (currentUser.guarantorUsedCount || 0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANTREAN PERSETUJUAN PENGURUS RT */}
          {activeTab === 'approval_rt' && isPengurusOrGovernance && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Daftar Warga Baru Menunggu Persetujuan RT:</span>
                <span className="font-bold text-stone-900">
                  {pendingList.filter((p) => p.status === 'pending_approval').length} Pengajuan
                </span>
              </div>

              {pendingList.filter((p) => p.status === 'pending_approval').length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-xs text-stone-500">
                  Semua pengajuan verifikasi warga baru telah diproses (Kosong).
                </div>
              ) : (
                pendingList
                  .filter((p) => p.status === 'pending_approval')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-stone-900">{item.name}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                              Sisa {item.temporaryDaysLeft} Hari
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 mt-0.5">
                            {item.blockNumber} • Telp: {item.phone}
                          </p>
                          <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                            NIK: {item.nik} • Device: {item.deviceFingerprint}
                          </p>
                        </div>
                      </div>

                      {/* 2 Saksi Penjamin */}
                      <div className="p-2 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                        <span className="font-bold text-stone-700 block text-[11px]">
                          2 Saksi Penjamin Tetangga:
                        </span>
                        {item.witnesses.map((w, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] text-stone-600">
                            <span>✓ {w.name} ({w.blockNumber})</span>
                            <span className="text-stone-400">{w.confirmedAt}</span>
                          </div>
                        ))}
                      </div>

                      {item.notes && (
                        <p className="text-[11px] text-stone-600 italic bg-amber-50/60 p-2 rounded-lg border border-amber-200/50">
                          Catatan: {item.notes}
                        </p>
                      )}

                      {/* Action Buttons: 1-Klik Setujui / Tolak */}
                      <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => onApproveResident(item.id)}
                          className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Setujui Permanen</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onRejectResident(item.id)}
                          className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* TAB 3: 15 KATEGORI PERAN DALAM 4 TIER */}
          {/* TAB 3: HIRARKI PERAN HANYA TIER 1 & TIER 2 */}
          {activeTab === 'hirarki_peran' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 leading-relaxed">
                <strong>Struktur Chain of Trust AppQu (Tier 1 & Tier 2 Saja):</strong> Validasi berantai
                berjenjang berfokus penuh pada kerukunan warga lokal di tingkat RT 04, dari akar rumput
                (warga & keamanan) hingga pengurus pengambil keputusan (Ketua RT, Sekretaris & Bendahara).
              </div>

              {[
                {
                  tier: 'Tier 1: Akar Rumput & Warga',
                  desc: 'Masyarakat langsung, warga tetap/baru, relawan duka, dan pos keamanan ronda.',
                  roles: [
                    { title: 'Warga Tetap & Kontrak', desc: 'Pengguna utama, buku induk digital, SOS darurat, dan iuran kas' },
                    { title: 'Warga Baru (Unverified)', desc: 'Membutuhkan minimal 2 saksi tetangga valid sebelum status aktif' },
                    { title: 'Relawan Tanggap Musibah', desc: 'Koordinator musibah, rukun kematian, takziah, dan logistik duka' },
                    { title: 'Keamanan (Hansip / Pos Ronda)', desc: 'Patroli QR checkpoint ronda malam dan respon awal sirene darurat' },
                  ],
                  bg: 'bg-stone-50 border-stone-200',
                  badge: 'bg-emerald-700 text-white',
                },
                {
                  tier: 'Tier 2: Pengurus RT & Paguyuban',
                  desc: 'Struktur kepengurusan mikro verifikator warga & keuangan RT 04.',
                  roles: [
                    { title: 'Koordinator Lingkungan', desc: 'Pemantauan kebersihan, fasum, dan jadwal ronda warga' },
                    { title: 'Sekretaris RT', desc: 'Verifikasi surat pengantar online & antrean pendaftaran warga baru' },
                    { title: 'Bendahara Paguyuban', desc: 'Pengelolaan kas paguyuban, validasi transfer iuran, & buku kas transparan' },
                    { title: 'Wakil Ketua RT', desc: 'Pengganti wewenang & penanganan musibah warga' },
                    { title: 'Ketua RT / Paguyuban', desc: 'Primary Approver warga permanent, komando keamanan & penandatangan QR resmi' },
                  ],
                  bg: 'bg-emerald-50/60 border-emerald-200',
                  badge: 'bg-teal-700 text-white',
                },
              ].map((tierItem, tIdx) => (
                <div key={tIdx} className={`p-3.5 rounded-2xl border ${tierItem.bg} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${tierItem.badge}`}>
                      {tierItem.tier}
                    </span>
                  </div>
                  <p className="text-stone-600 text-[11px]">{tierItem.desc}</p>

                  <div className="space-y-1.5 pt-1">
                    {tierItem.roles.map((r, rIdx) => (
                      <div key={rIdx} className="p-2.5 bg-white rounded-xl border border-stone-200/80 flex flex-col">
                        <span className="font-bold text-stone-900">{r.title}</span>
                        <span className="text-[11px] text-stone-500 mt-0.5">{r.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500">
            Peran Aktif: <strong className="text-stone-800">{currentUser.name}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
