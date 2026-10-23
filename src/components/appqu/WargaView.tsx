import React, { useState } from 'react';
import {
  Search,
  Filter,
  UserCheck,
  QrCode,
  ShieldCheck,
  Phone,
  Home,
  Briefcase,
  Users,
  Plus,
  X,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { ResidentData, UserProfile } from '../../types';

interface WargaViewProps {
  currentUser: UserProfile;
  residents: ResidentData[];
  onUpdateResidents: (residents: ResidentData[]) => void;
  showNotification: (msg: string) => void;
}

export const WargaView: React.FC<WargaViewProps> = ({
  currentUser,
  residents,
  onUpdateResidents,
  showNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBlock, setFilterBlock] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedResident, setSelectedResident] = useState<ResidentData | null>(null);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [isAddResidentModalOpen, setIsAddResidentModalOpen] = useState(false);

  // New Resident Form
  const [newName, setNewName] = useState('');
  const [newNik, setNewNik] = useState('');
  const [newKk, setNewKk] = useState('');
  const [newBlock, setNewBlock] = useState('Blok A');
  const [newPhone, setNewPhone] = useState('');
  const [newOccupation, setNewOccupation] = useState('');
  const [newStatus, setNewStatus] = useState<'tetap' | 'kontrak' | 'kos'>('tetap');

  const isSecretaryOrAdmin =
    currentUser.roleTier === 'pengurus' ||
    currentUser.roleTier === 'governance' ||
    currentUser.roleDetail === 'sekretaris' ||
    currentUser.roleDetail === 'ketua_rt';

  const filteredResidents = residents.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nik.includes(searchQuery) ||
      r.blockNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.occupation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBlock =
      filterBlock === 'all' || r.blockNumber.toLowerCase().includes(filterBlock.toLowerCase());

    const matchesStatus = filterStatus === 'all' || r.residentStatus === filterStatus;

    return matchesSearch && matchesBlock && matchesStatus;
  });

  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newNik.trim()) return;

    const newRes: ResidentData = {
      id: `res-${Date.now()}`,
      nik: newNik,
      noKk: newKk || '3201123456780099',
      name: newName,
      roleTier: 'warga',
      roleDetail: 'warga',
      roleTitle: 'Warga RT 04',
      blockNumber: newBlock,
      phone: newPhone || '0812-0000-0000',
      emergencyContact: '0812-0000-0001 (Keluarga)',
      isVerified: true,
      residentStatus: newStatus,
      occupation: newOccupation || 'Wiraswasta',
      joinedAt: new Date().toISOString().split('T')[0],
      familyMembersCount: 3,
      gender: 'L',
      birthDate: '1990-01-01',
      religion: 'Islam',
      bloodType: 'O',
    };

    onUpdateResidents([newRes, ...residents]);
    setIsAddResidentModalOpen(false);
    setNewName('');
    setNewNik('');
    showNotification('Data warga baru berhasil didaftarkan ke Buku Induk.');
  };

  return (
    <div className="flex-1 flex flex-col bg-stone-100 overflow-hidden">
      {/* Top Banner: Digital ID Card Preview */}
      <div className="p-3 bg-white border-b border-stone-200 shadow-2xs shrink-0">
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-teal-300" />
              <span>Kartu Identitas Digital WargaQu</span>
            </div>
            <span className="text-[9px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full font-mono">
              RT 04 / RW 09
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">{currentUser.name}</h2>
              <div className="text-[11px] font-mono text-emerald-200 mt-0.5">
                NIK: {currentUser.nik}
              </div>
              <div className="text-[10px] text-stone-300 mt-1 flex items-center gap-2">
                <span>{currentUser.blockNumber}</span>
                <span>·</span>
                <span className="capitalize">{currentUser.residentStatus}</span>
              </div>
            </div>

            <button
              onClick={() => setShowIdCardModal(true)}
              className="px-3 py-2 bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-emerald-400/30 transition-all active:scale-95"
            >
              <QrCode className="w-4 h-4 text-amber-300" />
              <span>QR Kartu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-3 space-y-2.5 bg-stone-50 border-b border-stone-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NIK, blok rumah, profesi..."
              className="w-full bg-white pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>

          {isSecretaryOrAdmin && (
            <button
              onClick={() => setIsAddResidentModalOpen(true)}
              className="p-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
              title="Tambah Warga Baru"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setFilterBlock('all')}
            className={`px-2.5 py-1 rounded-lg font-medium shrink-0 ${
              filterBlock === 'all'
                ? 'bg-emerald-800 text-white'
                : 'bg-white text-stone-600 border border-stone-200'
            }`}
          >
            Semua Blok
          </button>
          {['Blok A', 'Blok B', 'Blok C', 'Blok D'].map((b) => (
            <button
              key={b}
              onClick={() => setFilterBlock(b)}
              className={`px-2.5 py-1 rounded-lg font-medium shrink-0 ${
                filterBlock === b
                  ? 'bg-emerald-800 text-white'
                  : 'bg-white text-stone-600 border border-stone-200'
              }`}
            >
              {b}
            </button>
          ))}
          <button
            onClick={() => setFilterStatus(filterStatus === 'tetap' ? 'all' : 'tetap')}
            className={`px-2.5 py-1 rounded-lg font-medium shrink-0 ${
              filterStatus === 'tetap'
                ? 'bg-emerald-800 text-white'
                : 'bg-white text-stone-600 border border-stone-200'
            }`}
          >
            Warga Tetap
          </button>
        </div>
      </div>

      {/* Residents List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="flex items-center justify-between px-1 text-xs text-stone-500 font-medium">
          <span>Buku Induk Warga ({filteredResidents.length} Jiwa Terdaftar)</span>
          <span>RT 04 / RW 09</span>
        </div>

        {filteredResidents.map((res) => (
          <div
            key={res.id}
            onClick={() => setSelectedResident(res)}
            className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center shrink-0">
                {res.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-stone-900">{res.name}</h4>
                  {res.isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </div>
                <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                  <span>{res.blockNumber}</span>
                  <span>·</span>
                  <span>{res.occupation}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium capitalize">
                {res.residentStatus}
              </span>
              <div className="text-[10px] text-stone-400 mt-1 font-mono">
                {res.familyMembersCount} Anggota KK
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: FULL KARTU IDENTITAS DIGITAL WARGA */}
      {/* ---------------------------------------------------- */}
      {showIdCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 animate-in fade-in zoom-in-95 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold text-stone-900">Kartu Warga Digital Resmi</h3>
              <button
                onClick={() => setShowIdCardModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual KTP Digital */}
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 p-4 rounded-2xl text-white shadow-lg space-y-3 border border-emerald-500/30">
              <div className="flex items-center justify-between border-b border-emerald-700/50 pb-2">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-amber-300 font-bold">
                    Pemerintah RT 04 / RW 09
                  </div>
                  <div className="text-xs font-black">KARTU TANDA WARGA DIGITAL</div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/30 flex items-center justify-center font-bold text-xs">
                  AQ
                </div>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-[9px] text-emerald-300 block">Nama Lengkap</span>
                    <span className="font-bold">{currentUser.name}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-300 block">Nomor Induk Kependudukan (NIK)</span>
                    <span className="font-mono text-[11px]">{currentUser.nik}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-300 block">Alamat Rumah</span>
                    <span className="font-medium">{currentUser.blockNumber}</span>
                  </div>
                </div>

                <div className="bg-white p-2 rounded-xl shrink-0 flex flex-col items-center">
                  <QrCode className="w-16 h-16 text-emerald-950" />
                  <span className="text-[7px] text-stone-700 font-mono mt-0.5">TERVERIFIKASI</span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-700/50 flex justify-between text-[9px] text-emerald-200">
                <span>Status: Warga Tetap Aktif</span>
                <span>Berlaku s/d: Seumur Hidup</span>
              </div>
            </div>

            <button
              onClick={() => setShowIdCardModal(false)}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold"
            >
              Tutup Kartu
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: DETAIL RESIDENT MODAL */}
      {/* ---------------------------------------------------- */}
      {selectedResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold text-stone-900">Buku Induk Kependudukan</h3>
              <button
                onClick={() => setSelectedResident(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-lg flex items-center justify-center">
                {selectedResident.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">{selectedResident.name}</h4>
                <div className="text-xs text-stone-500 font-mono">NIK: {selectedResident.nik}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-stone-50 p-3 rounded-2xl border border-stone-200">
              <div className="flex justify-between">
                <span className="text-stone-500">Nomor KK:</span>
                <span className="font-mono text-stone-800">{selectedResident.noKk}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Alamat Rumah:</span>
                <span className="font-medium text-stone-800">{selectedResident.blockNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Profesi / Pekerjaan:</span>
                <span className="font-medium text-stone-800">{selectedResident.occupation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Status Tinggal:</span>
                <span className="font-bold text-emerald-800 capitalize">{selectedResident.residentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Kontak Darurat:</span>
                <span className="font-medium text-stone-800">{selectedResident.emergencyContact}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${selectedResident.phone}`}
                className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Hubungi Telepon</span>
              </a>
              <button
                onClick={() => setSelectedResident(null)}
                className="py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: TAMBAH WARGA BARU (PENGURUS) */}
      {/* ---------------------------------------------------- */}
      {isAddResidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-md p-4 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold text-stone-900">Registrasi Warga Baru RT 04</h3>
              <button
                onClick={() => setIsAddResidentModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddResident} className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold text-stone-700">Nama Lengkap</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nama sesuai KTP..."
                  className="w-full mt-1 p-2 rounded-xl border border-stone-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700">NIK (16 Digit)</label>
                  <input
                    type="text"
                    value={newNik}
                    onChange={(e) => setNewNik(e.target.value)}
                    placeholder="3201..."
                    className="w-full mt-1 p-2 rounded-xl border border-stone-300 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700">No. Kartu Keluarga</label>
                  <input
                    type="text"
                    value={newKk}
                    onChange={(e) => setNewKk(e.target.value)}
                    placeholder="3201..."
                    className="w-full mt-1 p-2 rounded-xl border border-stone-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700">Blok Rumah</label>
                  <input
                    type="text"
                    value={newBlock}
                    onChange={(e) => setNewBlock(e.target.value)}
                    placeholder="Blok C2 No. 05"
                    className="w-full mt-1 p-2 rounded-xl border border-stone-300"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700">No. Handphone (WA)</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0812..."
                    className="w-full mt-1 p-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700">Status Kependudukan</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-xl border border-stone-300"
                  >
                    <option value="tetap">Warga Tetap</option>
                    <option value="kontrak">Kontrak</option>
                    <option value="kos">Kos / Singgah</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700">Profesi / Pekerjaan</label>
                  <input
                    type="text"
                    value={newOccupation}
                    onChange={(e) => setNewOccupation(e.target.value)}
                    placeholder="Contoh: Karyawan"
                    className="w-full mt-1 p-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
              >
                Simpan ke Buku Induk Warga
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
