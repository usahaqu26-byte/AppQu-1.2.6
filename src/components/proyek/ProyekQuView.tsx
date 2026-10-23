import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  HardHat,
  Calculator,
  Layers,
  Users,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  Share2,
  FileText,
  Printer,
  ChevronRight,
  TrendingUp,
  Building,
  Check,
  ShieldCheck,
  ExternalLink,
  Info,
  Package,
  Sparkles,
} from 'lucide-react';
import {
  UserProfile,
  ProyekRecord,
  ProyekCategory,
  CalculationUnit,
  ProyekDimension,
  RabCostBreakdown,
  MaterialItem,
  TukangItem,
  TerminStage,
  VendorTukangExpense,
  ProyekProfile,
} from '../../types';
import { AppQuStorageService } from '../../services/storageAppQu';

interface ProyekQuViewProps {
  currentUser: UserProfile;
  onBackToAppQu: () => void;
  onSwitchToRitelQu?: () => void;
  onSwitchToPelayananQu?: () => void;
  showNotification: (msg: string) => void;
}

// 7 Preset Categories with Specific Presets
const KATEGORI_CONFIG: Record<
  ProyekCategory,
  {
    nama: string;
    subtext: string;
    satuanDefault: CalculationUnit;
    bahanPresets: { nama: string; satuan: string; harga: number }[];
    upahPresets: { peran: string; upahHarian: number }[];
  }
> = {
  besi_las: {
    nama: '1. Besi / Las',
    subtext: 'Pager, Kanopi, Teralis, Railing Tangga, Pintu Henderson',
    satuanDefault: 'm2',
    bahanPresets: [
      { nama: 'Besi Holo Galvanis 4x8 tebal 1.4mm', satuan: 'batang', harga: 220000 },
      { nama: 'Besi Holo Galvanis 4x4 tebal 1.4mm', satuan: 'batang', harga: 145000 },
      { nama: 'Atap Alderon RS Single Layer', satuan: 'meter', harga: 85000 },
      { nama: 'Besi Pipa Hitam 1.5 Inch Schedule', satuan: 'batang', harga: 175000 },
      { nama: 'Kawat Las RB-26 & Cat Primer Anti Karat', satuan: 'paket', harga: 350000 },
    ],
    upahPresets: [
      { peran: 'Tukang Las Konstruksi', upahHarian: 180000 },
      { peran: 'Kenek / Asisten Las', upahHarian: 130000 },
    ],
  },
  furniture_kayu: {
    nama: '2. Furniture / Kayu',
    subtext: 'Kitchen Set, Lemari Baju, Meja Partisi, Interior Custom',
    satuanDefault: 'mlari',
    bahanPresets: [
      { nama: 'Multiplek Meranti Super 18mm', satuan: 'lembar', harga: 275000 },
      { nama: 'HPL Taco Pattern / Woodgrain', satuan: 'lembar', harga: 215000 },
      { nama: 'Edging PVC Taco 1mm x 22mm', satuan: 'roll', harga: 180000 },
      { nama: 'Engsel Soft Close Slow-Motion Huben', satuan: 'set', harga: 45000 },
      { nama: 'Lem Kuning Aica Aibon 2.5kg', satuan: 'kaleng', harga: 140000 },
    ],
    upahPresets: [
      { peran: 'Tukang Kayu Interior Ahli', upahHarian: 220000 },
      { peran: 'Tukang Pasang Laminasi HPL', upahHarian: 160000 },
    ],
  },
  aluminium: {
    nama: '3. Aluminium',
    subtext: 'Kusen Pintu, Jendela Sliding, Kaca Mati, Partisi Kantor',
    satuanDefault: 'mlari',
    bahanPresets: [
      { nama: 'Kusen Aluminium 4 Inch Alexindo Coklat/Putih', satuan: "m'", harga: 115000 },
      { nama: 'Kusen Aluminium 3 Inch Dacon / Inkalum', satuan: "m'", harga: 85000 },
      { nama: 'Kaca Polos 5mm Asahimas', satuan: 'm²', harga: 140000 },
      { nama: 'Kunci Pintu Swing & Handle Dekson', satuan: 'set', harga: 280000 },
      { nama: 'Sealant Silicone Neutral & Karet Gasket', satuan: 'tube', harga: 45000 },
    ],
    upahPresets: [
      { peran: 'Tukang Rakit & Pasang Aluminium', upahHarian: 190000 },
      { peran: 'Asisten Pasang Kaca', upahHarian: 130000 },
    ],
  },
  renovasi_sipil: {
    nama: '4. Renovasi & Sipil',
    subtext: 'Rumah, Jalan Warga, Saluran Drainase U-Ditch, Paving, Atap',
    satuanDefault: 'm2',
    bahanPresets: [
      { nama: 'Semen Gresik / Tiga Roda 40kg', satuan: 'sak', harga: 58000 },
      { nama: 'Pasir Muntilan / Hitam Pasang', satuan: 'm3', harga: 320000 },
      { nama: 'Paving Block Press Tebal 6cm K-250', satuan: 'm²', harga: 78000 },
      { nama: 'Batu Bata Ringan Hebel 7.5cm', satuan: 'm3', harga: 680000 },
      { nama: 'Baja Ringan Kanal C75 x 0.75mm', satuan: 'batang', harga: 110000 },
    ],
    upahPresets: [
      { peran: 'Tukang Batu / Sipil Berpengalaman', upahHarian: 175000 },
      { peran: 'Laden / Pekerja Kasar', upahHarian: 120000 },
    ],
  },
  pengeboran_lapangan: {
    nama: '5. Pengeboran & Lapangan',
    subtext: 'Sumur Bor Jetpump, Sedot WC, Traktor Lahan, Cut & Fill',
    satuanDefault: 'mkedalaman',
    bahanPresets: [
      { nama: 'Pipa PVC 4 Inch Rucika AW Casing', satuan: 'batang', harga: 165000 },
      { nama: 'Pipa PVC 1.25 Inch Rucika AW Hisap', satuan: 'batang', harga: 85000 },
      { nama: 'Pasir Silika Gravel Penyaring Pasir Halus', satuan: 'karung', harga: 45000 },
      { nama: 'Tusen Klep Kuningan 1 Inch Anti Bocor', satuan: 'unit', harga: 180000 },
      { nama: 'BBM Solar Genset & Mesin Rig Bor', satuan: 'liter', harga: 15000 },
    ],
    upahPresets: [
      { peran: 'Master Operator Rig Bor Mesin', upahHarian: 220000 },
      { peran: 'Kru Sirkulasi Lumpur & Pompa', upahHarian: 140000 },
    ],
  },
  eo_event_sound: {
    nama: '6. Jasa EO / Event & Sound',
    subtext: 'Pernikahan, Panggung, Tenda Hajatan, Sewa Sound System',
    satuanDefault: 'unit_paket',
    bahanPresets: [
      { nama: 'Kain Dekorasi & Bunga Artificial Pelaminan', satuan: 'paket', harga: 1200000 },
      { nama: 'Sewa Rigging Panggung & Lighting Parled', satuan: 'hari', harga: 1500000 },
      { nama: 'BBM Genset 20 KVA Acara', satuan: 'liter', harga: 250000 },
      { nama: 'Konsumsi Kru & Catering Pendukung', satuan: 'porsi', harga: 25000 },
    ],
    upahPresets: [
      { peran: 'Sound Engineer & Operator Mixer', upahHarian: 250000 },
      { peran: 'Kru Bongkar Muat Tenda & Sound', upahHarian: 150000 },
    ],
  },
  web_percetakan: {
    nama: '7. Web Design & Percetakan',
    subtext: 'Brosur, Spanduk, Offset, Software/Aplikasi Custom',
    satuanDefault: 'unit_paket',
    bahanPresets: [
      { nama: 'Bahan Flexi Korcin 440gr Spanduk Banner', satuan: 'm²', harga: 28000 },
      { nama: 'Kertas Art Paper 150gr Brosur Fullcolor', satuan: 'rim', harga: 185000 },
      { nama: 'Hosting Cloud & Domain .COM / .ID (1 Tahun)', satuan: 'paket', harga: 650000 },
      { nama: 'Tinta Cetak UV & Finishing Laminasi Doff', satuan: 'set', harga: 320000 },
    ],
    upahPresets: [
      { peran: 'Web Developer / Fullstack Engineer', upahHarian: 300000 },
      { peran: 'Desainer Grafis & Pre-Press', upahHarian: 175000 },
    ],
  },
};

const SATUAN_LABELS: Record<CalculationUnit, { label: string; rumusDesc: string }> = {
  m2: { label: 'Meter Persegi (m²)', rumusDesc: 'Panjang × Lebar × Jumlah' },
  mlari: { label: "Meter Lari (m')", rumusDesc: 'Panjang × Jumlah' },
  mkedalaman: { label: 'Meter Kedalaman (m)', rumusDesc: 'Kedalaman × Jumlah' },
  hektar_luas: { label: 'Hektar / Luas (Ha)', rumusDesc: 'Luas Tanah / Bidang' },
  unit_paket: { label: 'Per Unit / Paket', rumusDesc: 'Jumlah Unit / Borongan' },
};

export const ProyekQuView: React.FC<ProyekQuViewProps> = ({
  currentUser,
  onBackToAppQu,
  onSwitchToRitelQu,
  onSwitchToPelayananQu,
  showNotification,
}) => {
  // Navigation tabs in Underline List style
  const [activeTab, setActiveTab] = useState<'proyek' | 'buat_rab' | 'vendor' | 'panduan'>('proyek');

  // Core Data
  const [projects, setProjects] = useState<ProyekRecord[]>(() =>
    AppQuStorageService.getProyekProjects()
  );
  const [expenses, setExpenses] = useState<VendorTukangExpense[]>(() =>
    AppQuStorageService.getProyekExpenses()
  );
  const [profile, setProfile] = useState<ProyekProfile>(() =>
    AppQuStorageService.getProyekProfile()
  );

  // Active Project Detail Modal
  const [selectedProject, setSelectedProject] = useState<ProyekRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Category filter in project list
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // ====================================================
  // FORM STATE: BUAT RAB BARU
  // ====================================================
  const [formNamaProyek, setFormNamaProyek] = useState('');
  const [formKategori, setFormKategori] = useState<ProyekCategory>('besi_las');
  const [formKlienNama, setFormKlienNama] = useState('');
  const [formKlienKontak, setFormKlienKontak] = useState('');
  const [formKlienAlamat, setFormKlienAlamat] = useState('');
  const [formCatatan, setFormCatatan] = useState('');
  const [formTglMulai, setFormTglMulai] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [formTglSelesai, setFormTglSelesai] = useState(
    new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
  );

  // Dimensi & Volume
  const [dimSatuan, setDimSatuan] = useState<CalculationUnit>('m2');
  const [dimPanjang, setDimPanjang] = useState<number>(6);
  const [dimLebar, setDimLebar] = useState<number>(4);
  const [dimKedalaman, setDimKedalaman] = useState<number>(0);
  const [dimJumlah, setDimJumlah] = useState<number>(1);

  // Biaya Modal Utama
  const [rabBahan, setRabBahan] = useState<number>(4500000);
  const [rabAksesoris, setRabAksesoris] = useState<number>(850000);
  const [rabUpah, setRabUpah] = useState<number>(1800000);
  const [rabTransport, setRabTransport] = useState<number>(350000);
  const [rabMarginPercent, setRabMarginPercent] = useState<number>(25);

  // Rincian Dinamis Bahan
  const [rincianBahan, setRincianBahan] = useState<MaterialItem[]>([
    { id: 'b-1', nama: 'Bahan Material Utama', qty: 1, satuan: 'paket', hargaSatuan: 4500000, total: 4500000 },
    { id: 'b-2', nama: 'Aksesoris & Perlengkapan Baut/Las', qty: 1, satuan: 'paket', hargaSatuan: 850000, total: 850000, isAksesoris: true },
  ]);

  // Rincian Dinamis Tukang
  const [rincianTukang, setRincianTukang] = useState<TukangItem[]>([
    { id: 't-1', peran: 'Tukang Ahli', namaPekerja: 'Mandor Supri', jumlahOrang: 2, durasiHari: 5, upahHarian: 180000, total: 1800000 },
  ]);

  // Skema Termin (DP, Termin 1, Termin 2, Pelunasan)
  const [dpPercent, setDpPercent] = useState<number>(35);
  const [t1Percent, setT1Percent] = useState<number>(35);
  const [pelunasanPercent, setPelunasanPercent] = useState<number>(30);

  // Volume Calculation
  const calculatedVolume = useMemo(() => {
    const p = Number(dimPanjang) || 0;
    const l = Number(dimLebar) || 0;
    const k = Number(dimKedalaman) || 0;
    const j = Number(dimJumlah) || 1;

    switch (dimSatuan) {
      case 'm2':
        return Number((p * l * j).toFixed(2));
      case 'mlari':
        return Number((p * j).toFixed(2));
      case 'mkedalaman':
        return Number((k * j).toFixed(2));
      case 'hektar_luas':
        return Number((p * l * j).toFixed(4));
      case 'unit_paket':
      default:
        return j;
    }
  }, [dimSatuan, dimPanjang, dimLebar, dimKedalaman, dimJumlah]);

  // RAB Calculation Formula
  // Total Biaya = (Bahan Baku Main + Aksesoris) + Upah Tukang/Operator + Transport/Mobilisasi + Margin (%)
  const rabCalculations = useMemo(() => {
    const bahan = Number(rabBahan) || 0;
    const akses = Number(rabAksesoris) || 0;
    const upah = Number(rabUpah) || 0;
    const transp = Number(rabTransport) || 0;
    const subtotalModal = bahan + akses + upah + transp;
    const marginPercent = Number(rabMarginPercent) || 0;
    const nominalMargin = Math.round(subtotalModal * (marginPercent / 100));
    const totalPenawaran = subtotalModal + nominalMargin;

    const nominalDp = Math.round(totalPenawaran * (dpPercent / 100));
    const nominalT1 = Math.round(totalPenawaran * (t1Percent / 100));
    const nominalPelunasan = totalPenawaran - nominalDp - nominalT1;

    return {
      subtotalModal,
      nominalMargin,
      totalPenawaran,
      nominalDp,
      nominalT1,
      nominalPelunasan,
      hargaSatuanPerVolume:
        calculatedVolume > 0 ? Math.round(totalPenawaran / calculatedVolume) : 0,
    };
  }, [
    rabBahan,
    rabAksesoris,
    rabUpah,
    rabTransport,
    rabMarginPercent,
    dpPercent,
    t1Percent,
    calculatedVolume,
  ]);

  // Auto-fill presets when Category changes
  const handleSelectCategory = (cat: ProyekCategory) => {
    setFormKategori(cat);
    const cfg = KATEGORI_CONFIG[cat];
    setDimSatuan(cfg.satuanDefault);

    // Apply default materials & wages
    const initialBahan: MaterialItem[] = cfg.bahanPresets.slice(0, 3).map((bp, idx) => ({
      id: `mat-${Date.now()}-${idx}`,
      nama: bp.nama,
      qty: 1,
      satuan: bp.satuan,
      hargaSatuan: bp.harga,
      total: bp.harga,
    }));
    setRincianBahan(initialBahan);
    const totalBahan = initialBahan.reduce((sum, b) => sum + b.total, 0);
    setRabBahan(totalBahan);

    const initialTukang: TukangItem[] = cfg.upahPresets.map((up, idx) => ({
      id: `tuk-${Date.now()}-${idx}`,
      peran: up.peran,
      jumlahOrang: 1,
      durasiHari: 3,
      upahHarian: up.upahHarian,
      total: up.upahHarian * 3,
    }));
    setRincianTukang(initialTukang);
    const totalUpah = initialTukang.reduce((sum, t) => sum + t.total, 0);
    setRabUpah(totalUpah);
  };

  // Add Material Row
  const handleAddMaterial = () => {
    const newItem: MaterialItem = {
      id: `mat-${Date.now()}`,
      nama: 'Bahan Tambahan / Aksesoris',
      qty: 1,
      satuan: 'pcs',
      hargaSatuan: 100000,
      total: 100000,
    };
    const updated = [...rincianBahan, newItem];
    setRincianBahan(updated);
    setRabBahan(updated.reduce((sum, i) => sum + i.total, 0));
  };

  // Remove Material Row
  const handleRemoveMaterial = (id: string) => {
    const updated = rincianBahan.filter((b) => b.id !== id);
    setRincianBahan(updated);
    setRabBahan(updated.reduce((sum, i) => sum + i.total, 0));
  };

  // Update Material Row
  const handleUpdateMaterial = (
    id: string,
    field: keyof MaterialItem,
    val: any
  ) => {
    const updated = rincianBahan.map((item) => {
      if (item.id === id) {
        const next = { ...item, [field]: val };
        if (field === 'qty' || field === 'hargaSatuan') {
          next.total = Number(next.qty || 0) * Number(next.hargaSatuan || 0);
        }
        return next;
      }
      return item;
    });
    setRincianBahan(updated);
    setRabBahan(updated.reduce((sum, i) => sum + i.total, 0));
  };

  // Add Tukang Row
  const handleAddTukang = () => {
    const newItem: TukangItem = {
      id: `tuk-${Date.now()}`,
      peran: 'Tukang / Operator Tambahan',
      jumlahOrang: 1,
      durasiHari: 2,
      upahHarian: 150000,
      total: 300000,
    };
    const updated = [...rincianTukang, newItem];
    setRincianTukang(updated);
    setRabUpah(updated.reduce((sum, i) => sum + i.total, 0));
  };

  // Remove Tukang Row
  const handleRemoveTukang = (id: string) => {
    const updated = rincianTukang.filter((t) => t.id !== id);
    setRincianTukang(updated);
    setRabUpah(updated.reduce((sum, i) => sum + i.total, 0));
  };

  // Update Tukang Row
  const handleUpdateTukang = (
    id: string,
    field: keyof TukangItem,
    val: any
  ) => {
    const updated = rincianTukang.map((item) => {
      if (item.id === id) {
        const next = { ...item, [field]: val };
        if (field === 'jumlahOrang' || field === 'durasiHari' || field === 'upahHarian') {
          next.total =
            Number(next.jumlahOrang || 1) *
            Number(next.durasiHari || 1) *
            Number(next.upahHarian || 0);
        }
        return next;
      }
      return item;
    });
    setRincianTukang(updated);
    setRabUpah(updated.reduce((sum, i) => sum + i.total, 0));
  };

  // Save new Project
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaProyek.trim()) {
      showNotification('Silakan isi nama proyek!');
      return;
    }

    const kode = `PRJ-${new Date().getFullYear().toString().slice(-2)}${(
      new Date().getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${(projects.length + 1).toString().padStart(3, '0')}`;

    const newProject: ProyekRecord = {
      id: `prj-${Date.now()}`,
      kodeProyek: kode,
      namaProyek: formNamaProyek.trim(),
      kategori: formKategori,
      klienNama: formKlienNama.trim() || 'Pelanggan Warga',
      klienKontak: formKlienKontak.trim() || '-',
      klienAlamat: formKlienAlamat.trim() || 'Area RT 04 / Sekitarnya',
      statusProyek: 'penawaran_rab',
      dimensi: {
        unit: dimSatuan,
        panjang: Number(dimPanjang) || 0,
        lebar: Number(dimLebar) || 0,
        kedalaman: Number(dimKedalaman) || 0,
        jumlah: Number(dimJumlah) || 1,
        calculatedVolume,
        unitLabel: SATUAN_LABELS[dimSatuan].label.split(' ')[0],
      },
      rab: {
        bahanBakuUtama: Number(rabBahan) || 0,
        aksesoris: Number(rabAksesoris) || 0,
        upahTukang: Number(rabUpah) || 0,
        transportMobilisasi: Number(rabTransport) || 0,
        subtotalModal: rabCalculations.subtotalModal,
        marginPercent: Number(rabMarginPercent) || 0,
        nominalMargin: rabCalculations.nominalMargin,
        totalBiayaPenawaran: rabCalculations.totalPenawaran,
      },
      rincianBahan,
      rincianTukang,
      terminList: [
        {
          id: `term-${Date.now()}-1`,
          stageType: 'dp',
          stageName: `DP (Uang Muka ${dpPercent}% / Kunci Jadwal)`,
          targetPercent: dpPercent,
          nominalTarget: rabCalculations.nominalDp,
          nominalDibayar: 0,
          status: 'belum',
          catatan: 'Tahap komitmen awal & belanja material utama',
        },
        {
          id: `term-${Date.now()}-2`,
          stageType: 'termin_1',
          stageName: `Termin 1 (Progress ${t1Percent}% Pengerjaan)`,
          targetPercent: t1Percent,
          nominalTarget: rabCalculations.nominalT1,
          nominalDibayar: 0,
          status: 'belum',
          catatan: 'Setelah bahan tiba dan pengerjaan konstruksi berjalan',
        },
        {
          id: `term-${Date.now()}-3`,
          stageType: 'pelunasan',
          stageName: `Pelunasan (Sisa ${pelunasanPercent}% Serah Terima)`,
          targetPercent: pelunasanPercent,
          nominalTarget: rabCalculations.nominalPelunasan,
          nominalDibayar: 0,
          status: 'belum',
          catatan: 'Setelah pekerjaan tuntas 100% dan disetujui klien',
        },
      ],
      catatanSpesifikasi: formCatatan.trim() || 'Sesuai standar mutu pengerjaan workshop.',
      tanggalMulai: formTglMulai,
      targetSelesai: formTglSelesai,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newProject, ...projects];
    setProjects(updated);
    AppQuStorageService.saveProyekProjects(updated);

    showNotification(`RAB Proyek "${newProject.namaProyek}" berhasil disimpan!`);
    setSelectedProject(newProject);
    setActiveTab('proyek');
  };

  // Payment Recording on Termin Stage
  const handleRecordPayment = (
    projectId: string,
    stageId: string,
    amount: number,
    metode: 'tunai' | 'transfer' | 'qris'
  ) => {
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;

      const nextTermin = p.terminList.map((t) => {
        if (t.id === stageId) {
          const totalDibayar = (t.nominalDibayar || 0) + amount;
          const status: 'belum' | 'sebagian' | 'lunas' =
            totalDibayar >= t.nominalTarget ? 'lunas' : 'sebagian';
          return {
            ...t,
            nominalDibayar: totalDibayar,
            status,
            tglBayar: new Date().toISOString().split('T')[0],
            metode,
          };
        }
        return t;
      });

      // Update overall status
      const dpStage = nextTermin.find((t) => t.stageType === 'dp');
      const pelunasanStage = nextTermin.find((t) => t.stageType === 'pelunasan');
      let nextStatus = p.statusProyek;

      if (pelunasanStage && pelunasanStage.status === 'lunas') {
        nextStatus = 'selesai_pelunasan';
      } else if (dpStage && dpStage.status === 'lunas') {
        nextStatus = 'sedang_dikerjakan';
      }

      return {
        ...p,
        terminList: nextTermin,
        statusProyek: nextStatus,
        updatedAt: new Date().toISOString(),
      };
    });

    setProjects(updated);
    AppQuStorageService.saveProyekProjects(updated);

    // Update active project if in modal
    const current = updated.find((p) => p.id === projectId);
    if (current) setSelectedProject(current);

    showNotification(`Pembayaran tahap proyek berhasil dicatat!`);
  };

  // Add Expense to Vendor or Tukang
  const [newExpensePihak, setNewExpensePihak] = useState('');
  const [newExpenseProyekId, setNewExpenseProyekId] = useState(
    projects[0]?.id || ''
  );
  const [newExpenseKategori, setNewExpenseKategori] = useState<
    VendorTukangExpense['kategori']
  >('vendor_material');
  const [newExpenseRincian, setNewExpenseRincian] = useState('');
  const [newExpenseNominal, setNewExpenseNominal] = useState<number>(0);
  const [newExpenseStatus, setNewExpenseStatus] = useState<'lunas' | 'bon_hutang'>('lunas');
  const [newExpenseHp, setNewExpenseHp] = useState('');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpensePihak.trim() || newExpenseNominal <= 0) {
      showNotification('Silakan isi pihak penerima dan nominal!');
      return;
    }

    const prj = projects.find((p) => p.id === newExpenseProyekId);
    const newExp: VendorTukangExpense = {
      id: `exp-${Date.now()}`,
      proyekId: newExpenseProyekId,
      proyekNama: prj ? prj.namaProyek : 'Operasional Workshop',
      kategori: newExpenseKategori,
      namaPihak: newExpensePihak.trim(),
      rincian: newExpenseRincian.trim() || 'Pengeluaran proyek',
      nominal: Number(newExpenseNominal) || 0,
      tglTransaksi: new Date().toISOString().split('T')[0],
      statusBayar: newExpenseStatus,
      noHp: newExpenseHp.trim() || undefined,
    };

    const updated = [newExp, ...expenses];
    setExpenses(updated);
    AppQuStorageService.saveProyekExpenses(updated);

    setNewExpensePihak('');
    setNewExpenseRincian('');
    setNewExpenseNominal(0);
    showNotification('Catatan kas vendor/tukang berhasil disimpan!');
  };

  const handleToggleExpenseStatus = (expId: string) => {
    const updated = expenses.map((exp) => {
      if (exp.id === expId) {
        return {
          ...exp,
          statusBayar: exp.statusBayar === 'lunas' ? 'bon_hutang' : 'lunas',
        } as VendorTukangExpense;
      }
      return exp;
    });
    setExpenses(updated);
    AppQuStorageService.saveProyekExpenses(updated);
    showNotification('Status pembayaran vendor/tukang diperbarui!');
  };

  // WhatsApp Share Formatter for RAB / Penawaran
  const handleShareWhatsApp = (p: ProyekRecord) => {
    const text =
      `*ESTIMASI PENAWARAN & RAB PROYEK BORONGAN*\n` +
      `No. Ref: ${p.kodeProyek}\n` +
      `Workshop: ${profile.namaWorkshop} (${profile.kontak})\n` +
      `--------------------------------\n` +
      `*PROYEK:* ${p.namaProyek.toUpperCase()}\n` +
      `Kategori: ${KATEGORI_CONFIG[p.kategori]?.nama || p.kategori}\n` +
      `Klien: ${p.klienNama} (${p.klienAlamat})\n` +
      `Volume / Dimensi: ${p.dimensi.calculatedVolume} ${p.dimensi.unitLabel}\n` +
      `Waktu Pengerjaan: ${p.tanggalMulai} s/d ${p.targetSelesai}\n` +
      `--------------------------------\n` +
      `*RINCIAN ANGGARAN BIAYA (RAB):*\n` +
      `• Bahan Baku Utama: Rp ${p.rab.bahanBakuUtama.toLocaleString('id-ID')}\n` +
      `• Aksesoris & Pendukung: Rp ${p.rab.aksesoris.toLocaleString('id-ID')}\n` +
      `• Upah Tukang / Operator: Rp ${p.rab.upahTukang.toLocaleString('id-ID')}\n` +
      `• Transport & Mobilisasi: Rp ${p.rab.transportMobilisasi.toLocaleString('id-ID')}\n` +
      `--------------------------------\n` +
      `*TOTAL NILAI PENAWARAN: Rp ${p.rab.totalBiayaPenawaran.toLocaleString('id-ID')}*\n` +
      `--------------------------------\n` +
      `*SKEMA PEMBAYARAN BERTAHAP:*\n` +
      p.terminList
        .map(
          (t, idx) =>
            `${idx + 1}. ${t.stageName}: Rp ${t.nominalTarget.toLocaleString('id-ID')} [${t.status === 'lunas' ? 'LUNAS' : t.status === 'sebagian' ? 'SEBAGIAN' : 'MENUNGGU'}]`
        )
        .join('\n') +
      `\n--------------------------------\n` +
      `Rekening Pembayaran: ${profile.bankRekening}\n` +
      `Catatan: ${p.catatanSpesifikasi}\n` +
      `_Dibuat otomatis via UsahaQu - Modul Proyek & Borongan_`;

    navigator.clipboard?.writeText(text);
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    showNotification('Rincian penawaran disalin ke clipboard & WhatsApp dibuka!');
  };

  // Filtered Projects
  const filteredProjects = projects.filter((p) => {
    if (filterCategory === 'all') return true;
    return p.kategori === filterCategory;
  });

  return (
    <div className="flex-1 flex flex-col bg-stone-950 text-stone-100 overflow-hidden font-sans select-none">
      {/* ========================================================= */}
      {/* 1. TOP HEADER: DARK THEME HIGH CONTRAST (MINIMALIS FLAT)   */}
      {/* ========================================================= */}
      <header className="bg-black border-b border-stone-800 px-3.5 py-3 shrink-0 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToAppQu}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded border border-stone-700 text-xs font-black tracking-wider transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>USAHAQU</span>
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-white uppercase">
                USAHAQU - PROYEK
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                RAB & TERMIN
              </span>
            </div>
            <p className="text-[11px] font-bold text-stone-400 truncate">
              {profile.namaWorkshop} • Borongan & Konstruksi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('buat_rab')}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider rounded flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>RAB BARU</span>
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. SUB-NAV / TABS (UNDERLINE LIST STYLE - NO PILLS)       */}
      {/* ========================================================= */}
      <div className="bg-stone-900 border-b border-stone-800 shrink-0 px-2 flex items-center overflow-x-auto scrollbar-none">
        {[
          { id: 'proyek', label: 'DAFTAR PROYEK', count: projects.length },
          { id: 'buat_rab', label: 'KALKULATOR RAB', count: null },
          { id: 'vendor', label: 'KAS VENDOR & TUKANG', count: expenses.length },
          { id: 'panduan', label: 'BATASAN & PROFIL', count: null },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 text-xs font-black tracking-wider whitespace-nowrap transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                isActive
                  ? 'border-amber-400 text-amber-300 bg-stone-950/60'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                    isActive
                      ? 'bg-amber-400 text-stone-950'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 3. MAIN CONTENT CONTAINER                                 */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto">
        {/* ========================================== */}
        {/* TAB 1: DAFTAR PROYEK (UNDERLINE LIST STYLE)*/}
        {/* ========================================== */}
        {activeTab === 'proyek' && (
          <div className="p-3.5 space-y-3 max-w-4xl mx-auto">
            {/* Category Filter Pills (Minimalist Underline / Flat) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1 border transition whitespace-nowrap uppercase ${
                  filterCategory === 'all'
                    ? 'bg-stone-100 text-stone-950 border-white font-black'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                }`}
              >
                SEMUA KATEGORI ({projects.length})
              </button>
              {Object.entries(KATEGORI_CONFIG).map(([key, cfg]) => {
                const count = projects.filter((p) => p.kategori === key).length;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilterCategory(key)}
                    className={`px-2.5 py-1 border transition whitespace-nowrap uppercase ${
                      filterCategory === key
                        ? 'bg-amber-400 text-stone-950 border-amber-300 font-black'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                    }`}
                  >
                    {cfg.nama} ({count})
                  </button>
                );
              })}
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-stone-800 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Total Nilai Kontrak
                </span>
                <span className="text-sm font-black text-amber-400 font-mono">
                  Rp{' '}
                  {projects
                    .reduce((sum, p) => sum + p.rab.totalBiayaPenawaran, 0)
                    .toLocaleString('id-ID')}
                </span>
              </div>
              <div className="border-x border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Estimasi Margin Laba
                </span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  Rp{' '}
                  {projects
                    .reduce((sum, p) => sum + p.rab.nominalMargin, 0)
                    .toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  DP / Termin Diterima
                </span>
                <span className="text-sm font-black text-cyan-400 font-mono">
                  Rp{' '}
                  {projects
                    .reduce(
                      (sum, p) =>
                        sum +
                        p.terminList.reduce(
                          (tSum, t) => tSum + (t.nominalDibayar || 0),
                          0
                        ),
                      0
                    )
                    .toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Project List (Underline List Style - Flat, Zero Heavy Borders) */}
            <div className="divide-y divide-stone-800 border-b border-stone-800">
              {filteredProjects.length === 0 ? (
                <div className="py-12 text-center text-stone-500 space-y-2">
                  <HardHat className="w-8 h-8 mx-auto text-stone-600" />
                  <p className="font-bold text-xs uppercase tracking-wider">
                    Belum ada data proyek pada kategori ini
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('buat_rab')}
                    className="text-amber-400 font-black text-xs hover:underline uppercase"
                  >
                    + Buat Rencana Anggaran Biaya (RAB) Baru
                  </button>
                </div>
              ) : (
                filteredProjects.map((proj) => {
                  const totalDibayar = proj.terminList.reduce(
                    (sum, t) => sum + (t.nominalDibayar || 0),
                    0
                  );
                  const sisaPelunasan = proj.rab.totalBiayaPenawaran - totalDibayar;
                  const percentPaid = Math.round(
                    (totalDibayar / (proj.rab.totalBiayaPenawaran || 1)) * 100
                  );

                  return (
                    <div
                      key={proj.id}
                      onClick={() => setSelectedProject(proj)}
                      className="py-3 px-2 hover:bg-stone-900/80 transition cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          {/* Code, Category & Status */}
                          <div className="flex items-center gap-2 flex-wrap text-[10px] font-black uppercase mb-1">
                            <span className="text-amber-400 font-mono">
                              {proj.kodeProyek}
                            </span>
                            <span className="text-stone-500">•</span>
                            <span className="text-stone-400">
                              {KATEGORI_CONFIG[proj.kategori]?.nama || proj.kategori}
                            </span>
                            <span className="text-stone-500">•</span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-black ${
                                proj.statusProyek === 'selesai_pelunasan'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : proj.statusProyek === 'sedang_dikerjakan'
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                  : proj.statusProyek === 'dp_terbayar'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-stone-800 text-stone-300'
                              }`}
                            >
                              {proj.statusProyek === 'selesai_pelunasan'
                                ? 'LUNAS & SELESAI'
                                : proj.statusProyek === 'sedang_dikerjakan'
                                ? 'ON PROGRESS'
                                : proj.statusProyek === 'dp_terbayar'
                                ? 'DP MASUK'
                                : 'PENAWARAN RAB'}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors tracking-tight">
                            {proj.namaProyek}
                          </h4>

                          {/* Client & Volume info */}
                          <div className="flex items-center gap-2 text-xs text-stone-400 mt-1 flex-wrap font-medium">
                            <span>
                              Klien: <strong className="text-stone-200">{proj.klienNama}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Volume:{' '}
                              <strong className="text-amber-400 font-mono">
                                {proj.dimensi.calculatedVolume} {proj.dimensi.unitLabel}
                              </strong>
                            </span>
                            <span>•</span>
                            <span className="text-stone-500">
                              Target: {proj.targetSelesai}
                            </span>
                          </div>

                          {/* Phased payment progress bar */}
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 bg-stone-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  percentPaid >= 100
                                    ? 'bg-emerald-400'
                                    : percentPaid > 0
                                    ? 'bg-amber-400'
                                    : 'bg-stone-600'
                                }`}
                                style={{ width: `${Math.min(100, percentPaid)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-stone-400 font-bold">
                              {percentPaid}% Terbayar
                            </span>
                          </div>
                        </div>

                        {/* Financial Right Column */}
                        <div className="text-right shrink-0">
                          <span className="text-[10px] uppercase font-bold text-stone-500 block">
                            Nilai Penawaran
                          </span>
                          <span className="text-sm font-black text-amber-400 font-mono block">
                            Rp {proj.rab.totalBiayaPenawaran.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            Margin: +{proj.rab.marginPercent}% (Rp{' '}
                            {proj.rab.nominalMargin.toLocaleString('id-ID')})
                          </span>
                          {sisaPelunasan > 0 ? (
                            <span className="text-[10px] text-red-400 font-bold block mt-0.5 font-mono">
                              Sisa: Rp {sisaPelunasan.toLocaleString('id-ID')}
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                              Lunas 100%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: SMART KALKULATOR RAB BARU           */}
        {/* ========================================== */}
        {activeTab === 'buat_rab' && (
          <form
            onSubmit={handleSaveProject}
            className="p-3.5 space-y-4 max-w-4xl mx-auto"
          >
            {/* Header info */}
            <div className="border-b border-stone-800 pb-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>Kalkulator & Estimator RAB Borongan</span>
              </h3>
              <p className="text-xs text-stone-400 font-medium mt-0.5">
                Hitung volume, modal bahan, upah tukang, transportasi, dan margin profit.
              </p>
            </div>

            {/* STEP 1: Pilih Kategori Preset Terkunci */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                1. KATEGORI PEKERJAAN (7 PRESET TERKUNCI)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {Object.entries(KATEGORI_CONFIG).map(([key, cfg]) => {
                  const isSelected = formKategori === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectCategory(key as ProyekCategory)}
                      className={`p-2.5 text-left border transition cursor-pointer flex items-start justify-between ${
                        isSelected
                          ? 'bg-amber-950/50 border-amber-400 text-white'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-black block text-white">
                          {cfg.nama}
                        </span>
                        <span className="text-[11px] text-stone-400 font-medium line-clamp-1">
                          {cfg.subtext}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: Input Identitas & Lokasi Proyek */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <label className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                2. DATA PROYEK & KLIEN
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-stone-400 block mb-1">
                    Nama Pekerjaan / Proyek *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Kanopi Carport Holo Galvanis"
                    value={formNamaProyek}
                    onChange={(e) => setFormNamaProyek(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 px-3 py-2 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-400 block mb-1">
                    Nama Klien / Pemilik *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Pak Hendro Wicaksono"
                    value={formKlienNama}
                    onChange={(e) => setFormKlienNama(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 px-3 py-2 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-400 block mb-1">
                    No. HP / WhatsApp Klien
                  </label>
                  <input
                    type="tel"
                    placeholder="0812-xxxx-xxxx"
                    value={formKlienKontak}
                    onChange={(e) => setFormKlienKontak(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 px-3 py-2 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-400 block mb-1">
                    Alamat / Lokasi Pemasangan
                  </label>
                  <input
                    type="text"
                    placeholder="Blok C2 No. 10 / Area RT 04"
                    value={formKlienAlamat}
                    onChange={(e) => setFormKlienAlamat(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 px-3 py-2 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: Input Dimensi & Volume Pengerjaan */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                  3. INPUT DIMENSI & VOLUME PEKERJAAN
                </label>
                <span className="text-[11px] font-black font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 border border-cyan-800">
                  Total Volume: {calculatedVolume} {SATUAN_LABELS[dimSatuan].label.split(' ')[0]}
                </span>
              </div>

              {/* Satuan Hitung Switcher */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 text-[11px]">
                {Object.entries(SATUAN_LABELS).map(([unitKey, s]) => {
                  const isUnitActive = dimSatuan === unitKey;
                  return (
                    <button
                      key={unitKey}
                      type="button"
                      onClick={() => setDimSatuan(unitKey as CalculationUnit)}
                      className={`p-2 text-left border transition cursor-pointer ${
                        isUnitActive
                          ? 'bg-cyan-950 border-cyan-400 text-white font-black'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className="block">{s.label}</span>
                      <span className="text-[9px] text-stone-500 font-mono block">
                        {s.rumusDesc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Dimension Inputs depending on unit */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-900/60 p-2.5 border border-stone-800">
                {dimSatuan !== 'mkedalaman' && dimSatuan !== 'unit_paket' && (
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">
                      Panjang (meter)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={dimPanjang}
                      onChange={(e) => setDimPanjang(parseFloat(e.target.value) || 0)}
                      className="w-full bg-stone-950 border border-stone-700 px-3 py-1.5 text-xs text-white font-mono font-bold focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                )}

                {(dimSatuan === 'm2' || dimSatuan === 'hektar_luas') && (
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">
                      Lebar (meter)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={dimLebar}
                      onChange={(e) => setDimLebar(parseFloat(e.target.value) || 0)}
                      className="w-full bg-stone-950 border border-stone-700 px-3 py-1.5 text-xs text-white font-mono font-bold focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                )}

                {dimSatuan === 'mkedalaman' && (
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">
                      Kedalaman (meter)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={dimKedalaman}
                      onChange={(e) => setDimKedalaman(parseFloat(e.target.value) || 0)}
                      className="w-full bg-stone-950 border border-stone-700 px-3 py-1.5 text-xs text-white font-mono font-bold focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">
                    Jumlah / Pengali Unit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={dimJumlah}
                    onChange={(e) => setDimJumlah(parseInt(e.target.value) || 1)}
                    className="w-full bg-stone-950 border border-stone-700 px-3 py-1.5 text-xs text-white font-mono font-bold focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* STEP 4: Kalkulasi Biaya (RAB) Sesuai Rumus Baku */}
            {/* Total Biaya = (Bahan Baku Main + Aksesoris) + Upah Tukang/Operator + Transport/Mobilisasi + Margin (%) */}
            <div className="space-y-3 pt-2 border-t border-stone-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                  4. KALKULASI STRUKTUR BIAYA RAB
                </label>
                <span className="text-[10px] text-stone-400 font-mono">
                  Rumus: (Bahan + Akses) + Upah + Transport + Margin
                </span>
              </div>

              {/* Rincian Bahan Baku Modal */}
              <div className="space-y-1.5 bg-stone-900/40 p-2.5 border border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-200 uppercase">
                    A. Bahan Baku Utama & Aksesoris
                  </span>
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="text-[10px] font-black text-amber-400 hover:text-amber-300 uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Tambah Bahan
                  </button>
                </div>

                <div className="divide-y divide-stone-800 text-xs">
                  {rincianBahan.map((mat) => (
                    <div
                      key={mat.id}
                      className="py-1.5 grid grid-cols-12 gap-1.5 items-center"
                    >
                      <input
                        type="text"
                        value={mat.nama}
                        onChange={(e) =>
                          handleUpdateMaterial(mat.id, 'nama', e.target.value)
                        }
                        className="col-span-5 bg-stone-950 border border-stone-700 px-2 py-1 text-xs text-white focus:outline-none"
                        placeholder="Nama material/aksesoris"
                      />
                      <input
                        type="number"
                        min="0"
                        value={mat.qty}
                        onChange={(e) =>
                          handleUpdateMaterial(
                            mat.id,
                            'qty',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="col-span-2 bg-stone-950 border border-stone-700 px-1 py-1 text-xs text-center font-mono text-white focus:outline-none"
                        placeholder="Qty"
                      />
                      <input
                        type="text"
                        value={mat.satuan}
                        onChange={(e) =>
                          handleUpdateMaterial(mat.id, 'satuan', e.target.value)
                        }
                        className="col-span-2 bg-stone-950 border border-stone-700 px-1 py-1 text-xs text-center text-stone-300 focus:outline-none"
                        placeholder="Satuan"
                      />
                      <input
                        type="number"
                        min="0"
                        value={mat.hargaSatuan}
                        onChange={(e) =>
                          handleUpdateMaterial(
                            mat.id,
                            'hargaSatuan',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="col-span-2 bg-stone-950 border border-stone-700 px-1 py-1 text-xs font-mono text-right text-amber-400 focus:outline-none"
                        placeholder="Harga"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(mat.id)}
                        className="col-span-1 text-stone-500 hover:text-red-400 flex justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-black border-t border-stone-800">
                  <span className="text-stone-400">Total Biaya Bahan:</span>
                  <span className="text-amber-400 font-mono">
                    Rp {rabBahan.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Rincian Upah Tukang */}
              <div className="space-y-1.5 bg-stone-900/40 p-2.5 border border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-200 uppercase">
                    B. Upah Tukang / Operator & Kenek
                  </span>
                  <button
                    type="button"
                    onClick={handleAddTukang}
                    className="text-[10px] font-black text-amber-400 hover:text-amber-300 uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Tambah Tukang
                  </button>
                </div>

                <div className="divide-y divide-stone-800 text-xs">
                  {rincianTukang.map((tuk) => (
                    <div
                      key={tuk.id}
                      className="py-1.5 grid grid-cols-12 gap-1.5 items-center"
                    >
                      <input
                        type="text"
                        value={tuk.peran}
                        onChange={(e) =>
                          handleUpdateTukang(tuk.id, 'peran', e.target.value)
                        }
                        className="col-span-5 bg-stone-950 border border-stone-700 px-2 py-1 text-xs text-white focus:outline-none"
                        placeholder="Peran (Tukang/Kenek)"
                      />
                      <div className="col-span-2 flex items-center gap-1 text-[10px] text-stone-400">
                        <input
                          type="number"
                          min="1"
                          value={tuk.jumlahOrang}
                          onChange={(e) =>
                            handleUpdateTukang(
                              tuk.id,
                              'jumlahOrang',
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full bg-stone-950 border border-stone-700 px-1 py-1 text-xs text-center font-mono text-white focus:outline-none"
                          title="Jumlah Orang"
                        />
                        <span>org</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1 text-[10px] text-stone-400">
                        <input
                          type="number"
                          min="1"
                          value={tuk.durasiHari}
                          onChange={(e) =>
                            handleUpdateTukang(
                              tuk.id,
                              'durasiHari',
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full bg-stone-950 border border-stone-700 px-1 py-1 text-xs text-center font-mono text-white focus:outline-none"
                          title="Durasi Hari"
                        />
                        <span>hari</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={tuk.upahHarian}
                        onChange={(e) =>
                          handleUpdateTukang(
                            tuk.id,
                            'upahHarian',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="col-span-2 bg-stone-950 border border-stone-700 px-1 py-1 text-xs font-mono text-right text-amber-400 focus:outline-none"
                        placeholder="Upah/hari"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTukang(tuk.id)}
                        className="col-span-1 text-stone-500 hover:text-red-400 flex justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-black border-t border-stone-800">
                  <span className="text-stone-400">Total Upah Tukang:</span>
                  <span className="text-amber-400 font-mono">
                    Rp {rabUpah.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* C. Transport & Margin Profit (%) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-stone-900/40 p-2.5 border border-stone-800">
                  <label className="text-[11px] font-bold text-stone-400 uppercase block mb-1">
                    C. Transport & Mobilisasi Alat (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={rabTransport}
                    onChange={(e) =>
                      setRabTransport(parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-stone-950 border border-stone-700 px-3 py-1.5 text-xs text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    BBM, sewa pickup / dump truck, solar genset
                  </span>
                </div>

                <div className="bg-stone-900/40 p-2.5 border border-stone-800">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-stone-400 uppercase">
                      D. Margin Keuntungan (%)
                    </label>
                    <span className="text-xs font-black text-emerald-400 font-mono">
                      +{rabMarginPercent}% (Rp{' '}
                      {rabCalculations.nominalMargin.toLocaleString('id-ID')})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="1"
                    value={rabMarginPercent}
                    onChange={(e) => setRabMarginPercent(parseInt(e.target.value) || 0)}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
                    <span>5% (Tipis)</span>
                    <span>25% (Standar)</span>
                    <span>40% (Custom)</span>
                    <span>60% (High-End)</span>
                  </div>
                </div>
              </div>

              {/* Live Cost Summary Card */}
              <div className="bg-black p-3.5 border border-amber-400/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-400">
                  <span>Subtotal Modal Bersih:</span>
                  <span className="font-mono text-stone-200">
                    Rp {rabCalculations.subtotalModal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>Margin Profit ({rabMarginPercent}%):</span>
                  <span className="font-mono">
                    + Rp {rabCalculations.nominalMargin.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-white uppercase tracking-wider block">
                      TOTAL NILAI PENAWARAN (RAB)
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400">
                      Rp {rabCalculations.hargaSatuanPerVolume.toLocaleString('id-ID')} /{' '}
                      {SATUAN_LABELS[dimSatuan].label.split(' ')[0]}
                    </span>
                  </div>
                  <span className="text-xl font-black text-amber-400 font-mono">
                    Rp {rabCalculations.totalPenawaran.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* STEP 5: Pembayaran Bertahap (DP -> Termin -> Pelunasan) */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <label className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                5. SKEMA PEMBAYARAN BERTAHAP
              </label>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-stone-900/50 p-2 border border-stone-800 text-center">
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">
                    DP / Uang Muka
                  </span>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={dpPercent}
                    onChange={(e) => setDpPercent(parseInt(e.target.value) || 0)}
                    className="w-14 bg-stone-950 border border-stone-700 px-1 py-0.5 text-center text-xs font-mono text-amber-400 mx-auto my-1 block"
                  />
                  <span className="text-[10px] font-mono text-stone-300 font-bold block">
                    Rp {rabCalculations.nominalDp.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="bg-stone-900/50 p-2 border border-stone-800 text-center">
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">
                    Termin 1 (Progress)
                  </span>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={t1Percent}
                    onChange={(e) => setT1Percent(parseInt(e.target.value) || 0)}
                    className="w-14 bg-stone-950 border border-stone-700 px-1 py-0.5 text-center text-xs font-mono text-cyan-400 mx-auto my-1 block"
                  />
                  <span className="text-[10px] font-mono text-stone-300 font-bold block">
                    Rp {rabCalculations.nominalT1.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="bg-stone-900/50 p-2 border border-stone-800 text-center">
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">
                    Pelunasan (Selesai)
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold my-1 block">
                    {pelunasanPercent}%
                  </span>
                  <span className="text-[10px] font-mono text-stone-300 font-bold block">
                    Rp {rabCalculations.nominalPelunasan.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Catatan Teknis / Spesifikasi */}
            <div className="pt-2 border-t border-stone-800">
              <label className="text-[11px] font-bold text-stone-400 block mb-1">
                Catatan Spesifikasi Mutu & Garansi
              </label>
              <textarea
                rows={2}
                value={formCatatan}
                onChange={(e) => setFormCatatan(e.target.value)}
                placeholder="Rincian ketebalan besi, merek engsel, atau syarat instalasi lapangan..."
                className="w-full bg-stone-900 border border-stone-700 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-stone-950 font-black text-sm uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <SaveIcon />
                <span>SIMPAN ESTIMASI RAB & BUKA PENAWARAN</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================== */}
        {/* TAB 3: BUKU KAS VENDOR & TUKANG            */}
        {/* ========================================== */}
        {activeTab === 'vendor' && (
          <div className="p-3.5 space-y-4 max-w-4xl mx-auto">
            {/* Header info */}
            <div className="border-b border-stone-800 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Rekap Pengeluaran Vendor Material & Upah Tukang</span>
                </h3>
                <p className="text-xs text-stone-400 font-medium mt-0.5">
                  Kontrol arus kas riil keluar, bon toko bangunan/besi, dan upah harian.
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-stone-900 border border-stone-800">
                <span className="text-[10px] font-bold text-stone-400 uppercase block">
                  Total Terbayar Lunas
                </span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  Rp{' '}
                  {expenses
                    .filter((e) => e.statusBayar === 'lunas')
                    .reduce((sum, e) => sum + e.nominal, 0)
                    .toLocaleString('id-ID')}
                </span>
              </div>
              <div className="p-3 bg-stone-900 border border-red-900/40">
                <span className="text-[10px] font-bold text-red-300 uppercase block">
                  Bon Hutang Belum Lunas
                </span>
                <span className="text-base font-black text-red-400 font-mono">
                  Rp{' '}
                  {expenses
                    .filter((e) => e.statusBayar === 'bon_hutang')
                    .reduce((sum, e) => sum + e.nominal, 0)
                    .toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Form Catat Pengeluaran Baru */}
            <form
              onSubmit={handleAddExpense}
              className="p-3 bg-stone-900/60 border border-stone-800 space-y-2.5"
            >
              <span className="text-xs font-black uppercase text-amber-300 tracking-wider block">
                + CATAT PENGELUARAN BARU
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-stone-400 font-bold block mb-1">
                    Terkait Proyek
                  </label>
                  <select
                    value={newExpenseProyekId}
                    onChange={(e) => setNewExpenseProyekId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 px-2.5 py-1.5 text-white font-bold"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.kodeProyek} - {p.namaProyek}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 font-bold block mb-1">
                    Kategori Pengeluaran
                  </label>
                  <select
                    value={newExpenseKategori}
                    onChange={(e) => setNewExpenseKategori(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 px-2.5 py-1.5 text-white font-bold"
                  >
                    <option value="vendor_material">Vendor Toko Material / Bahan</option>
                    <option value="upah_tukang">Upah Tukang / Kru</option>
                    <option value="transport_sewa">Transportasi / Sewa Alat</option>
                    <option value="lainnya">Operasional Lapangan Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 font-bold block mb-1">
                    Nama Pihak (Toko / Tukang)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: TB Sinar Logam / Mas Joko"
                    value={newExpensePihak}
                    onChange={(e) => setNewExpensePihak(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 font-bold block mb-1">
                    Rincian Item / Pekerjaan
                  </label>
                  <input
                    type="text"
                    placeholder="misal: Beli Besi Holo 6 batang"
                    value={newExpenseRincian}
                    onChange={(e) => setNewExpenseRincian(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 font-bold block mb-1">
                    Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    required
                    value={newExpenseNominal || ''}
                    onChange={(e) => setNewExpenseNominal(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-950 border border-stone-700 px-2.5 py-1.5 text-amber-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 font-bold block mb-1">
                    Status Bayar
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewExpenseStatus('lunas')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition ${
                        newExpenseStatus === 'lunas'
                          ? 'bg-emerald-900 text-white border border-emerald-500'
                          : 'bg-stone-950 text-stone-400 border border-stone-800'
                      }`}
                    >
                      Lunas
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewExpenseStatus('bon_hutang')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition ${
                        newExpenseStatus === 'bon_hutang'
                          ? 'bg-red-950 text-red-300 border border-red-500'
                          : 'bg-stone-950 text-stone-400 border border-stone-800'
                      }`}
                    >
                      Bon Hutang
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-right pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-stone-950 font-black text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Simpan Catatan Pengeluaran
                </button>
              </div>
            </form>

            {/* Table of Expenses (Underline List Style) */}
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-stone-400 block px-1">
                RIWAYAT PENGELUARAN ({expenses.length})
              </span>
              <div className="divide-y divide-stone-800 border-y border-stone-800">
                {expenses.length === 0 ? (
                  <div className="py-8 text-center text-stone-500 text-xs">
                    Belum ada catatan pengeluaran
                  </div>
                ) : (
                  expenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="py-2.5 px-2 hover:bg-stone-900/60 transition flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-stone-400 mb-0.5">
                          <span className="text-cyan-400 font-mono">
                            {exp.tglTransaksi}
                          </span>
                          <span>•</span>
                          <span className="text-stone-300 truncate">
                            {exp.proyekNama}
                          </span>
                        </div>
                        <h5 className="font-bold text-white text-xs">
                          {exp.namaPihak}
                        </h5>
                        <p className="text-stone-400 text-[11px] truncate">
                          {exp.rincian}
                        </p>
                      </div>

                      <div className="text-right shrink-0 ml-3">
                        <span className="font-mono font-black text-white text-xs block">
                          Rp {exp.nominal.toLocaleString('id-ID')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleExpenseStatus(exp.id)}
                          className={`mt-1 text-[10px] font-black uppercase px-2 py-0.5 border cursor-pointer transition ${
                            exp.statusBayar === 'lunas'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                              : 'bg-red-950 text-red-300 border-red-800 hover:bg-red-900'
                          }`}
                        >
                          {exp.statusBayar === 'lunas' ? 'Lunas' : 'Bon Hutang'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4: BATASAN SISTEM & PROFIL WORKSHOP    */}
        {/* ========================================== */}
        {activeTab === 'panduan' && (
          <div className="p-3.5 space-y-4 max-w-3xl mx-auto">
            {/* BATASAN SISTEM (ENTITAS DI LUAR PROYEK) */}
            <div className="bg-stone-900/80 border border-stone-800 p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  BATASAN SISTEM (ENTITAS DI LUAR MODUL PROYEK)
                </h4>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                Modul <strong>UsahaQu - Proyek</strong> dikhususkan untuk pekerjaan
                berbasis <strong>RAB, volume pengerjaan, dan pembayaran bertahap</strong>.
                Untuk entitas usaha lain di luar borongan, sistem secara otomatis
                mengalihkan ke modul khusus berikut:
              </p>

              <div className="space-y-2 pt-1">
                {/* 1. Pabrik Tahu / Tempe & Produk Harian */}
                <div className="p-3 bg-stone-950 border border-stone-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-black text-amber-300 block">
                      Pabrik Tahu/Tempe & Produk Harian
                    </span>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Produksi massal harian, penjualan grosir/eceran di pasar & warung.
                    </p>
                  </div>
                  {onSwitchToRitelQu && (
                    <button
                      type="button"
                      onClick={onSwitchToRitelQu}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Buka RitelQu</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* 2. Klinik / Praktik Pijat / Terapi */}
                <div className="p-3 bg-stone-950 border border-stone-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-black text-teal-300 block">
                      Klinik / Praktik Pijat / Terapi Warga
                    </span>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Berbasis sesi perawatan, durasi jam, antrean, & rekam medis ringkas.
                    </p>
                  </div>
                  {onSwitchToPelayananQu && (
                    <button
                      type="button"
                      onClick={onSwitchToPelayananQu}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs uppercase tracking-wider transition shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Buka PelayananQu</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profil Workshop / Penyedia Borongan */}
            <div className="bg-stone-900/60 border border-stone-800 p-3.5 space-y-3">
              <span className="text-xs font-black uppercase text-amber-300 tracking-wider block">
                PROFIL WORKSHOP & KOP SURAT PENAWARAN
              </span>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] text-stone-400 font-bold block mb-1">
                    Nama Workshop / Usaha
                  </label>
                  <input
                    type="text"
                    value={profile.namaWorkshop}
                    onChange={(e) =>
                      setProfile({ ...profile, namaWorkshop: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-700 px-3 py-1.5 text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-stone-400 font-bold block mb-1">
                      Penanggung Jawab / Mandor
                    </label>
                    <input
                      type="text"
                      value={profile.penanggungJawab}
                      onChange={(e) =>
                        setProfile({ ...profile, penanggungJawab: e.target.value })
                      }
                      className="w-full bg-stone-950 border border-stone-700 px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 font-bold block mb-1">
                      No. Kontak / WA
                    </label>
                    <input
                      type="text"
                      value={profile.kontak}
                      onChange={(e) =>
                        setProfile({ ...profile, kontak: e.target.value })
                      }
                      className="w-full bg-stone-950 border border-stone-700 px-3 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 font-bold block mb-1">
                    Rekening Pembayaran Termin
                  </label>
                  <input
                    type="text"
                    value={profile.bankRekening}
                    onChange={(e) =>
                      setProfile({ ...profile, bankRekening: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-700 px-3 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 font-bold block mb-1">
                    Catatan Penutup / Syarat Garansi
                  </label>
                  <textarea
                    rows={2}
                    value={profile.footerSurat}
                    onChange={(e) =>
                      setProfile({ ...profile, footerSurat: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-700 px-3 py-1.5 text-white"
                  />
                </div>

                <div className="pt-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      AppQuStorageService.saveProyekProfile(profile);
                      showNotification('Profil workshop berhasil disimpan!');
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    Simpan Perubahan Profil
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. MODAL DETAIL PROYEK & PEMBAYARAN TERMIN                */}
      {/* ========================================================= */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-stone-900 border border-stone-700 max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden text-stone-100 shadow-2xl">
            {/* Modal Header */}
            <div className="p-3.5 bg-black border-b border-stone-800 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-400 font-mono">
                  <span>{selectedProject.kodeProyek}</span>
                  <span>•</span>
                  <span>{KATEGORI_CONFIG[selectedProject.kategori]?.nama}</span>
                </div>
                <h3 className="text-base font-black text-white tracking-tight mt-0.5">
                  {selectedProject.namaProyek}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="w-8 h-8 rounded bg-stone-800 hover:bg-stone-700 text-white font-bold flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Klien & Volume */}
              <div className="grid grid-cols-2 gap-2 bg-stone-950 p-3 border border-stone-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Klien / Pemesan
                  </span>
                  <span className="text-xs font-black text-white block mt-0.5">
                    {selectedProject.klienNama}
                  </span>
                  <span className="text-[11px] text-stone-400 block">
                    {selectedProject.klienAlamat} ({selectedProject.klienKontak})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Dimensi & Volume
                  </span>
                  <span className="text-xs font-black text-amber-400 font-mono block mt-0.5">
                    {selectedProject.dimensi.calculatedVolume}{' '}
                    {selectedProject.dimensi.unitLabel}
                  </span>
                  <span className="text-[10px] text-stone-500 block">
                    Target: {selectedProject.tanggalMulai} s/d{' '}
                    {selectedProject.targetSelesai}
                  </span>
                </div>
              </div>

              {/* RAB Breakdown Table */}
              <div className="space-y-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                  RINCIAN BIAYA ANGGARAN (RAB)
                </span>
                <div className="bg-stone-950 border border-stone-800 divide-y divide-stone-800 font-mono text-xs">
                  <div className="p-2 flex justify-between">
                    <span className="text-stone-400">Bahan Baku Utama:</span>
                    <span className="text-white">
                      Rp {selectedProject.rab.bahanBakuUtama.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="p-2 flex justify-between">
                    <span className="text-stone-400">Aksesoris & Baut:</span>
                    <span className="text-white">
                      Rp {selectedProject.rab.aksesoris.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="p-2 flex justify-between">
                    <span className="text-stone-400">Upah Tukang & Operator:</span>
                    <span className="text-white">
                      Rp {selectedProject.rab.upahTukang.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="p-2 flex justify-between">
                    <span className="text-stone-400">Transportasi & Mobilisasi:</span>
                    <span className="text-white">
                      Rp{' '}
                      {selectedProject.rab.transportMobilisasi.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="p-2 flex justify-between bg-stone-900/60 font-bold">
                    <span className="text-stone-300">Total Modal Bersih:</span>
                    <span className="text-white">
                      Rp {selectedProject.rab.subtotalModal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="p-2 flex justify-between text-emerald-400 font-bold">
                    <span>
                      Margin Profit (+{selectedProject.rab.marginPercent}%):
                    </span>
                    <span>
                      Rp {selectedProject.rab.nominalMargin.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="p-2.5 flex justify-between bg-black text-amber-400 font-black text-sm">
                    <span>TOTAL PENAWARAN:</span>
                    <span>
                      Rp{' '}
                      {selectedProject.rab.totalBiayaPenawaran.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Phased Payments (Termin) Management */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                  MANAJEMEN PEMBAYARAN BERTAHAP (TERMIN)
                </span>

                <div className="space-y-2">
                  {selectedProject.terminList.map((term, idx) => {
                    const sisa = term.nominalTarget - (term.nominalDibayar || 0);
                    return (
                      <div
                        key={term.id}
                        className="p-3 bg-stone-950 border border-stone-800 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-black text-white block">
                              {term.stageName}
                            </span>
                            <span className="text-[11px] text-stone-400">
                              Target: Rp {term.nominalTarget.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              term.status === 'lunas'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : term.status === 'sebagian'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            {term.status === 'lunas'
                              ? 'LUNAS'
                              : term.status === 'sebagian'
                              ? 'TERBAYAR SEBAGIAN'
                              : 'BELUM BAYAR'}
                          </span>
                        </div>

                        {/* Payment Actions */}
                        {sisa > 0 ? (
                          <div className="flex items-center gap-2 pt-1 border-t border-stone-800/80">
                            <span className="text-[11px] text-red-400 font-mono font-bold">
                              Kurang: Rp {sisa.toLocaleString('id-ID')}
                            </span>
                            <div className="ml-auto flex gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRecordPayment(
                                    selectedProject.id,
                                    term.id,
                                    sisa,
                                    'transfer'
                                  )
                                }
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-[10px] uppercase rounded cursor-pointer"
                              >
                                Lunasi Rp {sisa.toLocaleString('id-ID')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-400 font-mono font-bold pt-1 border-t border-stone-800/80">
                            ✓ Lunas dibayar tgl {term.tglBayar || '-'} via{' '}
                            {term.metode?.toUpperCase() || 'TRANSFER'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-black border-t border-stone-800 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => handleShareWhatsApp(selectedProject)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>BAGIKAN KE WHATSAPP</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-black text-xs uppercase tracking-wider rounded cursor-pointer"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Icon
function SaveIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
  );
}
