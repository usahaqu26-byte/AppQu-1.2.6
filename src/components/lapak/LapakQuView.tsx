import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';

interface LapakQuViewProps {
  currentUser: UserProfile;
  onBackToAppQu: () => void;
  showNotification: (msg: string) => void;
}

export type SubcatKey = 'kios' | 'kost' | 'garasi' | 'gedung' | 'tenda';

interface SubcatMeta {
  key: SubcatKey;
  title: string;
  shortName: string;
  headerColor: string; // Dynamic header color
  glowColor: string;
  badgeBg: string;
  defaultTarif: number;
  durasiLabel: string;
}

const SUBCAT_DEFS: Record<SubcatKey, SubcatMeta> = {
  kios: {
    key: 'kios',
    title: 'Kios & Lapak Pedagang',
    shortName: 'KIOS & LAPAK',
    headerColor: '#556B2F', // Hijau Olive
    glowColor: '#6B8E23',
    badgeBg: 'bg-[#556B2F]',
    defaultTarif: 25000,
    durasiLabel: 'Harian / Mingguan / Bulanan',
  },
  kost: {
    key: 'kost',
    title: 'Kontrakan & Kost',
    shortName: 'KONTRAKAN & KOST',
    headerColor: '#0D7377', // Biru Teal
    glowColor: '#14B8A6',
    badgeBg: 'bg-[#0D7377]',
    defaultTarif: 650000,
    durasiLabel: 'Bulanan / Tahunan',
  },
  garasi: {
    key: 'garasi',
    title: 'Garasi & Lahan Parkir',
    shortName: 'GARASI & PARKIR',
    headerColor: '#4A2E18', // Cokelat Tua
    glowColor: '#78350F',
    badgeBg: 'bg-[#4A2E18]',
    defaultTarif: 25000,
    durasiLabel: 'Harian / Bulanan',
  },
  gedung: {
    key: 'gedung',
    title: 'Gedung & Area Acara',
    shortName: 'GEDUNG & ACARA',
    headerColor: '#800020', // Merah Marun
    glowColor: '#9F1239',
    badgeBg: 'bg-[#800020]',
    defaultTarif: 1500000,
    durasiLabel: 'Sesi / Jam Pemakaian',
  },
  tenda: {
    key: 'tenda',
    title: 'Tenda & Alat Event',
    shortName: 'TENDA & EVENT',
    headerColor: '#B84A39', // Oranye Bata
    glowColor: '#EA580C',
    badgeBg: 'bg-[#B84A39]',
    defaultTarif: 50000,
    durasiLabel: 'Paket / Harian',
  },
};

interface CatalogUnit {
  id: string;
  name: string;
  subcat: SubcatKey;
  tarif: number;
  periode: string;
  status: 'Tersedia' | 'Terisi';
  desc?: string;
}

interface RentalTransaction {
  id: string;
  invoiceNo: string;
  date: string;
  timestamp: number;
  subcat: SubcatKey;
  subcatName: string;
  namaPenyewa: string;
  noWa: string;
  namaUnit: string;
  total: number;
  method: 'tunai' | 'qris' | 'transfer' | 'bon';
  isBon: boolean;
  bonStatus?: 'belum_lunas' | 'lunas';
  bonDueDate?: string;
  catatan?: string;
  details: Record<string, any>;
}

interface BonRecord {
  id: string;
  txId: string;
  invoiceNo: string;
  namaPenyewa: string;
  noWa: string;
  namaUnit: string;
  subcat: SubcatKey;
  subcatName: string;
  amount: number;
  date: string;
  dueDate: string;
  details: Record<string, any>;
}

interface TendaItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

const STORAGE_KEY_SUBCAT = 'lapakqu_active_subcat';
const STORAGE_KEY_PROFILE = 'lapakqu_profile';
const STORAGE_KEY_RECEIPT = 'lapakqu_receipt_config';
const STORAGE_KEY_CATALOG = 'lapakqu_catalog';
const STORAGE_KEY_TX = 'lapakqu_transactions';
const STORAGE_KEY_BON = 'lapakqu_bon';

export const LapakQuView: React.FC<LapakQuViewProps> = ({
  currentUser,
  onBackToAppQu,
  showNotification,
}) => {
  // Navigation: 5 menus
  const [activeTab, setActiveTab] = useState<'kasir' | 'bon' | 'rekap' | 'katalog' | 'pengaturan'>('kasir');

  // Sub-category state
  const [activeSubcat, setActiveSubcat] = useState<SubcatKey>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SUBCAT) as SubcatKey;
    return saved && SUBCAT_DEFS[saved] ? saved : 'kios';
  });

  // Profile state
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      namaUsaha: 'LapakQu Properti Warga RT 04',
      namaPemilik: currentUser.name || 'Bpk. Hendro & Paguyuban RT 04',
      alamat: 'Jl. Swadaya No. 12, RT 04 / RW 02',
      noWa: currentUser.phone || '081298765432',
      rekening: 'BCA 5410928172 a.n Paguyuban RT 04 / QRIS LapakQu',
    };
  });

  // Receipt Config state
  const [receiptConfig, setReceiptConfig] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RECEIPT);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      header: '*** KUITANSI RESMI SEWA PROPERTI WARGA ***',
      footer: 'Terima kasih telah membayar tepat waktu. Kunci & fasilitas properti wajib dijaga bersama demi kenyamanan lingkungan.',
    };
  });

  // Catalog state
  const [catalog, setCatalog] = useState<CatalogUnit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CATALOG);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'u-1', name: 'Kios Depan Pujasera No. 01', subcat: 'kios', tarif: 25000, periode: 'Harian', status: 'Terisi', desc: 'Ukuran 2x3m, iuran kebersihan aktif' },
      { id: 'u-2', name: 'Lapak Kopi & Gorengan No. 04', subcat: 'kios', tarif: 20000, periode: 'Harian', status: 'Tersedia', desc: 'Ukuran 2x2m, dekat gerbang RT' },
      { id: 'u-3', name: 'Kamar Kost No. 2A (Lantai 2)', subcat: 'kost', tarif: 650000, periode: 'Bulanan', status: 'Terisi', desc: 'Kamar mandi dalam, meteran listrik mandiri' },
      { id: 'u-4', name: 'Kontrakan Pintu #3 Warga', subcat: 'kost', tarif: 1200000, periode: 'Bulanan', status: 'Tersedia', desc: '2 petak, ruang tamu + dapur, PAM terpisah' },
      { id: 'u-5', name: 'Slot Parkir Mobil A-01', subcat: 'garasi', tarif: 250000, periode: 'Bulanan', status: 'Terisi', desc: 'Kanopi baja ringan, gerbang digembok jam 23' },
      { id: 'u-6', name: 'Slot Parkir Motor #07', subcat: 'garasi', tarif: 50000, periode: 'Bulanan', status: 'Tersedia', desc: 'Area teduh dekat pos ronda' },
      { id: 'u-7', name: 'Balai Warga & Aula Serbaguna RT 04', subcat: 'gedung', tarif: 1500000, periode: 'Sesi Acara', status: 'Tersedia', desc: 'Kapasitas 150 orang, include sound & 50 kursi' },
      { id: 'u-8', name: 'Set Tenda Terop 4x6m + 50 Kursi', subcat: 'tenda', tarif: 250000, periode: 'Harian', status: 'Tersedia', desc: 'Lengkap plafon putih & kain penutup samping' },
    ];
  });

  // Transactions & Bon records
  const [transactions, setTransactions] = useState<RentalTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TX);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [bonList, setBonList] = useState<BonRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BON);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Modal states
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [currentReceiptData, setCurrentReceiptData] = useState<RentalTransaction | null>(null);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);

  // Form Inputs in Kasir (Universal & Sub-category Specific)
  const [namaPenyewa, setNamaPenyewa] = useState('');
  const [noWa, setNoWa] = useState('');
  const [namaUnit, setNamaUnit] = useState('');
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [payMethod, setPayMethod] = useState<'tunai' | 'qris' | 'transfer' | 'bon'>('tunai');
  const [bonDueDate, setBonDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [catatanKhusus, setCatatanKhusus] = useState('');

  // 1. Kios Inputs
  const [kiosDurasi, setKiosDurasi] = useState<'harian' | 'mingguan' | 'bulanan'>('harian');
  const [kiosQty, setKiosQty] = useState(1);
  const [kiosTarif, setKiosTarif] = useState(25000);
  const [iuranKebersihan, setIuranKebersihan] = useState(false);
  const [iuranKeamanan, setIuranKeamanan] = useState(false);
  const [iuranListrikKios, setIuranListrikKios] = useState(false);
  const [kiosJenisUsaha, setKiosJenisUsaha] = useState('');

  // 2. Kost Inputs
  const [kostDurasi, setKostDurasi] = useState<'bulanan' | 'tahunan'>('bulanan');
  const [kostQty, setKostQty] = useState(1);
  const [kostTarif, setKostTarif] = useState(650000);
  const [meterLalu, setMeterLalu] = useState(1420);
  const [meterIni, setMeterIni] = useState(1465);
  const [tarifKwh, setTarifKwh] = useState(2000);
  const [kostDeposit, setKostDeposit] = useState(0);

  // 3. Garasi Inputs
  const [garasiSlotNo, setGarasiSlotNo] = useState('');
  const [garasiPlatNo, setGarasiPlatNo] = useState('');
  const [garasiDurasi, setGarasiDurasi] = useState<'harian' | 'bulanan'>('harian');
  const [garasiQty, setGarasiQty] = useState(1);
  const [garasiTarif, setGarasiTarif] = useState(25000);

  // 4. Gedung Inputs
  const [gedungTanggal, setGedungTanggal] = useState(() => new Date().toISOString().split('T')[0]);
  const [gedungSesi, setGedungSesi] = useState('Sesi Pagi (08:00 - 13:00)');
  const [gedungTotalTarif, setGedungTotalTarif] = useState(1500000);
  const [gedungDp, setGedungDp] = useState(500000);
  const [gedungTglPelunasan, setGedungTglPelunasan] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  // 5. Tenda Inputs
  const [tendaStatus, setTendaStatus] = useState('Sedang Disewa (Di Lapangan)');
  const [tendaHari, setTendaHari] = useState(1);
  const [tendaItems, setTendaItems] = useState<TendaItem[]>([
    { id: 't-1', name: 'Tenda Terop 4x6 Meter', qty: 1, price: 150000 },
    { id: 't-2', name: 'Kursi Plastik Napolly', qty: 40, price: 2000 },
  ]);
  const [newTendaName, setNewTendaName] = useState('');
  const [newTendaQty, setNewTendaQty] = useState(1);
  const [newTendaPrice, setNewTendaPrice] = useState(50000);
  const [tendaDendaDesc, setTendaDendaDesc] = useState('');
  const [tendaDendaNominal, setTendaDendaNominal] = useState(0);

  // Unit Form Modal States
  const [unitFormName, setUnitFormName] = useState('');
  const [unitFormSubcat, setUnitFormSubcat] = useState<SubcatKey>('kios');
  const [unitFormTarif, setUnitFormTarif] = useState(25000);
  const [unitFormPeriode, setUnitFormPeriode] = useState('Per Hari');
  const [unitFormStatus, setUnitFormStatus] = useState<'Tersedia' | 'Terisi'>('Tersedia');
  const [unitFormDesc, setUnitFormDesc] = useState('');

  // Persist State to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SUBCAT, activeSubcat);
  }, [activeSubcat]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECEIPT, JSON.stringify(receiptConfig));
  }, [receiptConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(catalog));
  }, [catalog]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BON, JSON.stringify(bonList));
  }, [bonList]);

  // Handle Switching Sub-Category
  const handleSelectSubcat = (key: SubcatKey) => {
    setActiveSubcat(key);
    showNotification(`Sub-kategori beralih: ${SUBCAT_DEFS[key].title}`);
  };

  // Kalkulasi Total Kasir
  const calculateTotal = (): number => {
    if (activeSubcat === 'kios') {
      const sub = kiosQty * kiosTarif;
      const keb = iuranKebersihan ? 2000 * kiosQty : 0;
      const kea = iuranKeamanan ? 2000 * kiosQty : 0;
      const lis = iuranListrikKios ? 5000 * kiosQty : 0;
      return sub + keb + kea + lis;
    }
    if (activeSubcat === 'kost') {
      const sewa = kostQty * kostTarif;
      const kwhUsed = Math.max(0, meterIni - meterLalu);
      const listrik = Math.round(kwhUsed * tarifKwh);
      return sewa + listrik + Number(kostDeposit || 0);
    }
    if (activeSubcat === 'garasi') {
      return garasiQty * garasiTarif;
    }
    if (activeSubcat === 'gedung') {
      return gedungTotalTarif;
    }
    if (activeSubcat === 'tenda') {
      const itemsSum = tendaItems.reduce((acc, it) => acc + it.qty * it.price, 0);
      return itemsSum * tendaHari + Number(tendaDendaNominal || 0);
    }
    return 0;
  };

  const grandTotal = calculateTotal();

  // Reset Kasir Form
  const resetKasir = () => {
    setNamaPenyewa('');
    setNoWa('');
    setNamaUnit('');
    setSelectedCatalogId('');
    setCatatanKhusus('');
    setIuranKebersihan(false);
    setIuranKeamanan(false);
    setIuranListrikKios(false);
    setKiosJenisUsaha('');
    setKostDeposit(0);
    setGarasiPlatNo('');
    setTendaDendaDesc('');
    setTendaDendaNominal(0);
    showNotification('Form input sewa berhasil direset.');
  };

  // Handle Pilih Unit Katalog di Kasir
  const handleSelectCatalogUnit = (unitId: string) => {
    setSelectedCatalogId(unitId);
    if (!unitId) return;
    const unit = catalog.find((u) => u.id === unitId);
    if (!unit) return;

    setNamaUnit(unit.name);
    if (activeSubcat === 'kios') setKiosTarif(unit.tarif);
    if (activeSubcat === 'kost') setKostTarif(unit.tarif);
    if (activeSubcat === 'garasi') {
      setGarasiTarif(unit.tarif);
      setGarasiSlotNo(unit.name);
    }
    if (activeSubcat === 'gedung') setGedungTotalTarif(unit.tarif);
  };

  // Add Item Tenda
  const handleAddTendaItem = () => {
    if (!newTendaName.trim()) {
      showNotification('Mohon tuliskan nama alat / tenda!');
      return;
    }
    setTendaItems([
      ...tendaItems,
      {
        id: `t-${Date.now()}`,
        name: newTendaName.trim(),
        qty: Number(newTendaQty) || 1,
        price: Number(newTendaPrice) || 0,
      },
    ]);
    setNewTendaName('');
    setNewTendaQty(1);
    setNewTendaPrice(50000);
    showNotification('Item alat sewa ditambahkan.');
  };

  const handleRemoveTendaItem = (id: string) => {
    setTendaItems(tendaItems.filter((i) => i.id !== id));
  };

  // Simpan Transaksi Sewa
  const handleSaveTransaction = () => {
    if (!namaPenyewa.trim()) {
      showNotification('Nama Penyewa wajib diisi!');
      return;
    }
    if (grandTotal <= 0) {
      showNotification('Total biaya sewa harus lebih dari Rp 0!');
      return;
    }

    const invoiceNo = `LPQ-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let details: Record<string, any> = {};
    if (activeSubcat === 'kios') {
      details = {
        durasiType: kiosDurasi,
        qtyPeriod: kiosQty,
        tarif: kiosTarif,
        kebersihan: iuranKebersihan,
        keamanan: iuranKeamanan,
        listrik: iuranListrikKios,
        jenisUsaha: kiosJenisUsaha || 'Perdagangan Umum',
      };
    } else if (activeSubcat === 'kost') {
      const kwhUsed = Math.max(0, meterIni - meterLalu);
      details = {
        durasiType: kostDurasi,
        qtyPeriod: kostQty,
        tarif: kostTarif,
        meterLalu,
        meterIni,
        kwhUsed,
        tarifKwh,
        subtotalListrik: Math.round(kwhUsed * tarifKwh),
        deposit: kostDeposit,
      };
    } else if (activeSubcat === 'garasi') {
      details = {
        slotNo: garasiSlotNo || namaUnit,
        platNo: garasiPlatNo || 'Plat Belum Diisi',
        durasiType: garasiDurasi,
        qtyPeriod: garasiQty,
        tarif: garasiTarif,
      };
    } else if (activeSubcat === 'gedung') {
      details = {
        tanggalAcara: gedungTanggal,
        sesi: gedungSesi,
        totalTarif: gedungTotalTarif,
        dpBooking: gedungDp,
        sisaPelunasan: Math.max(0, gedungTotalTarif - gedungDp),
        tglPelunasan: gedungTglPelunasan,
      };
    } else if (activeSubcat === 'tenda') {
      details = {
        statusAlat: tendaStatus,
        items: [...tendaItems],
        hari: tendaHari,
        dendaNominal: tendaDendaNominal,
        dendaDesc: tendaDendaDesc,
      };
    }

    const tx: RentalTransaction = {
      id: `tx-${Date.now()}`,
      invoiceNo,
      date: dateStr,
      timestamp: Date.now(),
      subcat: activeSubcat,
      subcatName: SUBCAT_DEFS[activeSubcat].shortName,
      namaPenyewa: namaPenyewa.trim(),
      noWa: noWa.trim(),
      namaUnit: namaUnit.trim() || `Unit ${SUBCAT_DEFS[activeSubcat].shortName}`,
      total: grandTotal,
      method: payMethod,
      isBon: payMethod === 'bon',
      bonStatus: payMethod === 'bon' ? 'belum_lunas' : 'lunas',
      bonDueDate: payMethod === 'bon' ? bonDueDate : undefined,
      catatan: catatanKhusus.trim() || undefined,
      details,
    };

    setTransactions([tx, ...transactions]);

    if (payMethod === 'bon') {
      const bonItem: BonRecord = {
        id: `bon-${tx.id}`,
        txId: tx.id,
        invoiceNo,
        namaPenyewa: tx.namaPenyewa,
        noWa: tx.noWa,
        namaUnit: tx.namaUnit,
        subcat: activeSubcat,
        subcatName: SUBCAT_DEFS[activeSubcat].shortName,
        amount: grandTotal,
        date: dateStr,
        dueDate: bonDueDate,
        details,
      };
      setBonList([bonItem, ...bonList]);
    }

    setCurrentReceiptData(tx);
    setIsReceiptModalOpen(true);
    showNotification(`Transaksi ${invoiceNo} berhasil dicatat!`);
  };

  // WhatsApp Tagih Bon
  const handleTagihWa = (b: BonRecord) => {
    const cleanWa = (b.noWa || '').replace(/[^0-9]/g, '');
    const waNumber = cleanWa.startsWith('0') ? `62${cleanWa.slice(1)}` : cleanWa;

    const msg = `*PEMBERITAHUAN JATUH TEMPO SEWA LAPAKQU*
----------------------------------------
Yth. Bpk/Ibu *${b.namaPenyewa}*,
Kami dari pengelola *${profile.namaUsaha}* menginformasikan sewa properti:

• Objek: *${b.namaUnit}* (${b.subcatName})
• No. Bukti: *${b.invoiceNo}*
• Tanggal Transaksi: ${b.date}
• Batas Jatuh Tempo: *${b.dueDate || 'Segera'}*
----------------------------------------
*TOTAL TAGIHAN: Rp ${b.amount.toLocaleString('id-ID')}*
----------------------------------------
Pembayaran melalui:
*${profile.rekening}*

Mohon konfirmasi bukti transfer bila sudah mengirimkan dana. Terima kasih banyak atas kerja sama yang baik!`;

    const url = waNumber
      ? `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Lunasi Bon
  const handleLunasiBon = (bonId: string) => {
    const b = bonList.find((x) => x.id === bonId);
    if (!b) return;

    setBonList(bonList.filter((x) => x.id !== bonId));
    setTransactions(
      transactions.map((t) =>
        t.id === b.txId ? { ...t, isBon: false, bonStatus: 'lunas', method: 'transfer' } : t
      )
    );
    showNotification(`Tunggakan sewa ${b.namaPenyewa} berhasil DILUNASI!`);
  };

  // Hapus Bon
  const handleHapusBon = (bonId: string) => {
    setBonList(bonList.filter((x) => x.id !== bonId));
    showNotification('Catatan bon dihapus.');
  };

  // Hapus Transaksi
  const handleHapusTx = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    showNotification('Catatan transaksi dihapus.');
  };

  // Tambah Unit Katalog
  const handleSaveCatalogUnit = () => {
    if (!unitFormName.trim()) {
      showNotification('Nama unit tidak boleh kosong!');
      return;
    }
    const newUnit: CatalogUnit = {
      id: `u-${Date.now()}`,
      name: unitFormName.trim(),
      subcat: unitFormSubcat,
      tarif: Number(unitFormTarif) || 0,
      periode: unitFormPeriode,
      status: unitFormStatus,
      desc: unitFormDesc.trim() || undefined,
    };
    setCatalog([newUnit, ...catalog]);
    setIsAddUnitModalOpen(false);
    setUnitFormName('');
    setUnitFormDesc('');
    showNotification(`Unit ${newUnit.name} ditambahkan ke katalog.`);
  };

  const handleToggleUnitStatus = (id: string) => {
    setCatalog(
      catalog.map((u) =>
        u.id === id ? { ...u, status: u.status === 'Tersedia' ? 'Terisi' : 'Tersedia' } : u
      )
    );
  };

  const handleHapusUnit = (id: string) => {
    setCatalog(catalog.filter((u) => u.id !== id));
    showNotification('Unit properti dihapus dari katalog.');
  };

  const handleUseCatalogInKasir = (u: CatalogUnit) => {
    setActiveSubcat(u.subcat);
    setActiveTab('kasir');
    setNamaUnit(u.name);
    setSelectedCatalogId(u.id);

    if (u.subcat === 'kios') setKiosTarif(u.tarif);
    if (u.subcat === 'kost') setKostTarif(u.tarif);
    if (u.subcat === 'garasi') {
      setGarasiTarif(u.tarif);
      setGarasiSlotNo(u.name);
    }
    if (u.subcat === 'gedung') setGedungTotalTarif(u.tarif);

    showNotification(`Unit ${u.name} siap di kasir.`);
  };

  // Bagikan Rekap WA
  const handleShareRekapWa = () => {
    const lunasTx = transactions.filter((t) => !t.isBon || t.bonStatus === 'lunas');
    const totalPemasukan = lunasTx.reduce((acc, t) => acc + t.total, 0);
    const dateStr = new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const msg = `*LAPORAN REKAP PEMASUKAN LAPAKQU*
----------------------------------------
Usaha: *${profile.namaUsaha}*
Pengelola: *${profile.namaPemilik}*
Tanggal: ${dateStr}
----------------------------------------
• Transaksi Sewa Lunas: ${lunasTx.length}
• Total Piutang (Bon Aktif): ${bonList.length} orang
----------------------------------------
*TOTAL PEMASUKAN BERSIH: Rp ${totalPemasukan.toLocaleString('id-ID')}*
----------------------------------------
_Dicatat otomatis via LapakQu (Sewa Properti Akar Rumput Offline-First)_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Render Subcat Detail Rincian for Receipt
  const renderReceiptSubcatDetails = (tx: RentalTransaction) => {
    const d = tx.details || {};
    if (tx.subcat === 'kios') {
      return (
        <div className="space-y-1 my-2 text-xs border-y border-dashed border-stone-400 py-1.5 font-mono">
          <div className="flex justify-between">
            <span>Unit Lapak:</span>
            <strong className="font-bold">{tx.namaUnit}</strong>
          </div>
          <div className="flex justify-between">
            <span>Jenis Usaha:</span>
            <span>{d.jenisUsaha || 'Umum'}</span>
          </div>
          <div className="flex justify-between">
            <span>Durasi:</span>
            <span>{d.qtyPeriod} {d.durasiType}</span>
          </div>
          <div className="flex justify-between">
            <span>Tarif Pokok:</span>
            <span>Rp {(d.tarif || 0).toLocaleString('id-ID')}</span>
          </div>
          {d.kebersihan && (
            <div className="flex justify-between">
              <span>+ Iuran Kebersihan:</span>
              <span>Rp 2.000</span>
            </div>
          )}
          {d.keamanan && (
            <div className="flex justify-between">
              <span>+ Iuran Keamanan:</span>
              <span>Rp 2.000</span>
            </div>
          )}
          {d.listrik && (
            <div className="flex justify-between">
              <span>+ Iuran Listrik:</span>
              <span>Rp 5.000</span>
            </div>
          )}
        </div>
      );
    }
    if (tx.subcat === 'kost') {
      return (
        <div className="space-y-1 my-2 text-xs border-y border-dashed border-stone-400 py-1.5 font-mono">
          <div className="flex justify-between">
            <span>Unit Kamar:</span>
            <strong className="font-bold">{tx.namaUnit}</strong>
          </div>
          <div className="flex justify-between">
            <span>Durasi Sewa:</span>
            <span>{d.qtyPeriod} {d.durasiType}</span>
          </div>
          <div className="flex justify-between">
            <span>Tarif Pokok:</span>
            <span>Rp {(d.tarif || 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="border-t border-dotted border-stone-300 pt-1 mt-1 text-[11px]">
            <div className="font-bold">[METERAN LISTRIK]</div>
            <div className="flex justify-between">
              <span>Meter Lalu - Ini:</span>
              <span>{d.meterLalu} - {d.meterIni} kWh</span>
            </div>
            <div className="flex justify-between">
              <span>Pakai ({d.kwhUsed} kWh x {d.tarifKwh}):</span>
              <span>Rp {(d.subtotalListrik || 0).toLocaleString('id-ID')}</span>
            </div>
          </div>
          {Number(d.deposit || 0) > 0 && (
            <div className="flex justify-between text-emerald-800 font-bold">
              <span>Uang Deposit Kunci:</span>
              <span>Rp {Number(d.deposit).toLocaleString('id-ID')} (Ditahan)</span>
            </div>
          )}
        </div>
      );
    }
    if (tx.subcat === 'garasi') {
      return (
        <div className="space-y-1 my-2 text-xs border-y border-dashed border-stone-400 py-1.5 font-mono">
          <div className="flex justify-between">
            <span>Nomor Slot:</span>
            <strong className="font-bold">{d.slotNo || tx.namaUnit}</strong>
          </div>
          <div className="flex justify-between">
            <span>Plat Nomor:</span>
            <strong className="font-bold">{d.platNo || '-'}</strong>
          </div>
          <div className="flex justify-between">
            <span>Durasi Parkir:</span>
            <span>{d.qtyPeriod} {d.durasiType}</span>
          </div>
          <div className="flex justify-between">
            <span>Tarif Sewa:</span>
            <span>Rp {(d.tarif || 0).toLocaleString('id-ID')}</span>
          </div>
        </div>
      );
    }
    if (tx.subcat === 'gedung') {
      return (
        <div className="space-y-1 my-2 text-xs border-y border-dashed border-stone-400 py-1.5 font-mono">
          <div className="flex justify-between">
            <span>Gedung / Aula:</span>
            <strong className="font-bold">{tx.namaUnit}</strong>
          </div>
          <div className="flex justify-between">
            <span>Tgl Pemakaian:</span>
            <span>{d.tanggalAcara}</span>
          </div>
          <div className="flex justify-between">
            <span>Sesi Pemakaian:</span>
            <span>{d.sesi}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Tarif:</span>
            <span>Rp {(d.totalTarif || tx.total).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-emerald-800 font-bold border-t border-dotted border-stone-300 pt-1">
            <span>DP Booking Masuk:</span>
            <span>Rp {(d.dpBooking || 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-red-700 font-bold">
            <span>Sisa Pelunasan:</span>
            <span>Rp {(d.sisaPelunasan || 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-[11px] text-stone-600">
            <span>Jatuh Tempo Lunas:</span>
            <span>{d.tglPelunasan || '-'}</span>
          </div>
        </div>
      );
    }
    if (tx.subcat === 'tenda') {
      return (
        <div className="space-y-1 my-2 text-xs border-y border-dashed border-stone-400 py-1.5 font-mono">
          <div className="flex justify-between">
            <span>Unit Paket:</span>
            <strong className="font-bold">{tx.namaUnit}</strong>
          </div>
          <div className="flex justify-between">
            <span>Status Lapangan:</span>
            <span>{d.statusAlat}</span>
          </div>
          <div className="flex justify-between">
            <span>Durasi:</span>
            <span>{d.hari} Hari</span>
          </div>
          <div className="border-t border-dotted border-stone-300 pt-1 text-[11px]">
            <div className="font-bold mb-0.5">[RINCIAN ALAT DISEWA]</div>
            {(d.items || []).map((it: TendaItem, idx: number) => (
              <div key={idx} className="flex justify-between">
                <span>- {it.name} ({it.qty}x)</span>
                <span>Rp {(it.qty * it.price).toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
          {Number(d.dendaNominal || 0) > 0 && (
            <div className="flex justify-between text-red-700 font-bold border-t border-dotted border-stone-300 pt-1">
              <span>Denda: {d.dendaDesc || 'Kerusakan'}</span>
              <span>Rp {Number(d.dendaNominal).toLocaleString('id-ID')}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Active theme color definition
  const activeSubcatDef = SUBCAT_DEFS[activeSubcat];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0f12] text-slate-100 overflow-hidden font-sans">
      {/* ======================================================== */}
      {/* DYNAMIC COLOR-CODED HEADER (FLAT MINIMALIST)             */}
      {/* ======================================================== */}
      <header
        style={{ backgroundColor: activeSubcatDef.headerColor }}
        className="px-4 py-3 shrink-0 text-white transition-colors duration-300 border-b-2 border-black/30 shadow-xs"
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-extrabold tracking-wider opacity-90 uppercase">
              USAHAQU • PROPERTI WARGA RT 04
            </div>
            <h1 className="text-base font-black tracking-tight uppercase">
              LAPAKQU • {activeSubcatDef.shortName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToAppQu}
              className="px-2.5 py-1 text-xs font-black uppercase bg-black/40 hover:bg-black/60 rounded border border-white/30 text-white cursor-pointer active:scale-95 transition-all"
            >
              [KE APPQU]
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* SUB-CATEGORY SELECTOR BAR (5 SUB-KATEGORI SEWA LAPAK)    */}
      {/* ======================================================== */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#0f131a] border-b border-[#232a36] overflow-x-auto shrink-0 scrollbar-none">
        {(Object.keys(SUBCAT_DEFS) as SubcatKey[]).map((key, idx) => {
          const item = SUBCAT_DEFS[key];
          const isActive = activeSubcat === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectSubcat(key)}
              style={isActive ? { backgroundColor: item.headerColor, borderColor: '#ffffff', color: '#ffffff' } : {}}
              className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-xs border cursor-pointer whitespace-nowrap transition-all ${
                isActive
                  ? 'shadow-sm text-white'
                  : 'bg-[#18202c] text-slate-400 border-[#283344] hover:text-white'
              }`}
            >
              [{idx + 1}] {item.shortName}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* MAIN VIEW CONTAINER (SCROLLABLE CONTENT)                 */}
      {/* ======================================================== */}
      <main className="flex-1 overflow-y-auto pb-20 p-3.5 space-y-4">
        {/* ====================================================== */}
        {/* 1. MENU: [KASIR] - SMART KALKULATOR DINAMIS            */}
        {/* ====================================================== */}
        {activeTab === 'kasir' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#232a36] pb-2">
              <span className="text-sm font-black uppercase text-slate-100">
                FORM INPUT SEWA {activeSubcatDef.shortName}
              </span>
              <button
                type="button"
                onClick={resetKasir}
                className="px-2.5 py-1 text-xs font-black uppercase bg-[#1e293b] text-slate-300 border border-[#334155] rounded-xs cursor-pointer hover:bg-[#334155]"
              >
                [RESET]
              </button>
            </div>

            {/* Pilihan Unit Katalog */}
            <div className="border-b border-[#232a36] pb-3">
              <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                PILIH DARI KATALOG UNIT (ATAU KETIK MANUAL)
              </label>
              <select
                value={selectedCatalogId}
                onChange={(e) => handleSelectCatalogUnit(e.target.value)}
                className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- PILIH UNIT TERDAFTAR (OPSIONAL) --</option>
                {catalog
                  .filter((u) => u.subcat === activeSubcat)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} - Rp {u.tarif.toLocaleString('id-ID')} ({u.periode}) [{u.status}]
                    </option>
                  ))}
              </select>
            </div>

            {/* ATRIBUT UMUM (UNDERLINE LIST STYLE) */}
            <div className="border-t border-b border-[#232a36] divide-y divide-[#232a36]">
              <div className="py-2.5">
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                  NAMA PENYEWA / WARGA
                </label>
                <input
                  type="text"
                  value={namaPenyewa}
                  onChange={(e) => setNamaPenyewa(e.target.value)}
                  placeholder="Contoh: Pak Budi / Bu Titik"
                  className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="py-2.5">
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                  NO. WHATSAPP PENYEWA
                </label>
                <input
                  type="tel"
                  value={noWa}
                  onChange={(e) => setNoWa(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="py-2.5">
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                  NAMA UNIT / IDENTITAS LOKASI
                </label>
                <input
                  type="text"
                  value={namaUnit}
                  onChange={(e) => setNamaUnit(e.target.value)}
                  placeholder="Contoh: Kios Pujasera No. 03 / Kamar 2B"
                  className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* ==================================================== */}
            {/* KALKULATOR DINAMIS 1: KIOS & LAPAK PEDAGANG          */}
            {/* ==================================================== */}
            {activeSubcat === 'kios' && (
              <div className="border-t border-b border-[#232a36] divide-y divide-[#232a36] bg-[#11151c]/60">
                <div className="py-2.5">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1.5">
                    DURASI SEWA
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['harian', 'mingguan', 'bulanan'] as const).map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => {
                          setKiosDurasi(dur);
                          if (dur === 'harian') setKiosTarif(25000);
                          else if (dur === 'mingguan') setKiosTarif(150000);
                          else if (dur === 'bulanan') setKiosTarif(500000);
                        }}
                        className={`py-2 text-xs font-black uppercase rounded-xs border cursor-pointer transition-all ${
                          kiosDurasi === dur
                            ? 'bg-[#556B2F] border-white text-white'
                            : 'bg-[#18202c] text-slate-400 border-[#283344]'
                        }`}
                      >
                        [{dur}]
                      </button>
                    ))}
                  </div>
                </div>

                <div className="py-2.5 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                      JUMLAH PERIODE
                    </label>
                    <input
                      type="number"
                      value={kiosQty}
                      min={1}
                      onChange={(e) => setKiosQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                      TARIF DASAR (RP)
                    </label>
                    <input
                      type="number"
                      value={kiosTarif}
                      min={0}
                      onChange={(e) => setKiosTarif(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>
                </div>

                <div className="py-2.5 space-y-2">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    TOGGLE BIAYA IURAN TAMBAHAN (OPERASIONAL LAPAK)
                  </label>
                  <div className="flex items-center justify-between py-1 border-b border-dashed border-[#232a36]">
                    <span className="text-xs font-bold text-slate-300">
                      Iuran Kebersihan Lapak (Rp 2.000 / Periode)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIuranKebersihan(!iuranKebersihan)}
                      className={`px-3 py-1 text-xs font-black uppercase rounded-xs border cursor-pointer ${
                        iuranKebersihan
                          ? 'bg-emerald-700 text-white border-emerald-400'
                          : 'bg-[#1e293b] text-slate-400 border-[#334155]'
                      }`}
                    >
                      {iuranKebersihan ? '[AKTIF]' : '[MATI]'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-dashed border-[#232a36]">
                    <span className="text-xs font-bold text-slate-300">
                      Iuran Keamanan Pasar/Malam (Rp 2.000 / Periode)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIuranKeamanan(!iuranKeamanan)}
                      className={`px-3 py-1 text-xs font-black uppercase rounded-xs border cursor-pointer ${
                        iuranKeamanan
                          ? 'bg-emerald-700 text-white border-emerald-400'
                          : 'bg-[#1e293b] text-slate-400 border-[#334155]'
                      }`}
                    >
                      {iuranKeamanan ? '[AKTIF]' : '[MATI]'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs font-bold text-slate-300">
                      Iuran Listrik Penerangan (Rp 5.000 / Periode)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIuranListrikKios(!iuranListrikKios)}
                      className={`px-3 py-1 text-xs font-black uppercase rounded-xs border cursor-pointer ${
                        iuranListrikKios
                          ? 'bg-emerald-700 text-white border-emerald-400'
                          : 'bg-[#1e293b] text-slate-400 border-[#334155]'
                      }`}
                    >
                      {iuranListrikKios ? '[AKTIF]' : '[MATI]'}
                    </button>
                  </div>
                </div>

                <div className="py-2.5">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    CATATAN JENIS USAHA PENYEWA
                  </label>
                  <input
                    type="text"
                    value={kiosJenisUsaha}
                    onChange={(e) => setKiosJenisUsaha(e.target.value)}
                    placeholder="Contoh: Gorengan, Warung Kopi & Indomie, Sayur, Jahit"
                    className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* KALKULATOR DINAMIS 2: KONTRAKAN & KOST               */}
            {/* ==================================================== */}
            {activeSubcat === 'kost' && (
              <div className="border-t border-b border-[#232a36] divide-y divide-[#232a36] bg-[#11151c]/60">
                <div className="py-2.5">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1.5">
                    DURASI SEWA
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['bulanan', 'tahunan'] as const).map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => {
                          setKostDurasi(dur);
                          if (dur === 'bulanan') setKostTarif(650000);
                          else if (dur === 'tahunan') setKostTarif(7500000);
                        }}
                        className={`py-2 text-xs font-black uppercase rounded-xs border cursor-pointer transition-all ${
                          kostDurasi === dur
                            ? 'bg-[#0D7377] border-white text-white'
                            : 'bg-[#18202c] text-slate-400 border-[#283344]'
                        }`}
                      >
                        [{dur}]
                      </button>
                    ))}
                  </div>
                </div>

                <div className="py-2.5 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                      JUMLAH BULAN/THN
                    </label>
                    <input
                      type="number"
                      value={kostQty}
                      min={1}
                      onChange={(e) => setKostQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                      TARIF KAMAR (RP)
                    </label>
                    <input
                      type="number"
                      value={kostTarif}
                      min={0}
                      onChange={(e) => setKostTarif(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>
                </div>

                <div className="py-2.5 space-y-2">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    KALKULATOR METERAN LISTRIK & AIR (METER INI - LALU x TARIF)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">METER LALU</span>
                      <input
                        type="number"
                        value={meterLalu}
                        onChange={(e) => setMeterLalu(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">METER INI</span>
                      <input
                        type="number"
                        value={meterIni}
                        onChange={(e) => setMeterIni(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">TARIF/KWH</span>
                      <input
                        type="number"
                        value={tarifKwh}
                        onChange={(e) => setTarifKwh(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-2.5 py-1.5 text-xs text-white font-bold"
                      />
                    </div>
                  </div>
                  <div className="text-xs font-black text-emerald-400 pt-1">
                    Pemakaian: ({meterIni} - {meterLalu}) = {Math.max(0, meterIni - meterLalu)} kWh x Rp {tarifKwh.toLocaleString('id-ID')} = Rp {Math.round(Math.max(0, meterIni - meterLalu) * tarifKwh).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="py-2.5">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    UANG DEPOSIT JAMINAN KUNCI / KERUSAKAN (RP)
                  </label>
                  <input
                    type="number"
                    value={kostDeposit}
                    min={0}
                    onChange={(e) => setKostDeposit(parseInt(e.target.value) || 0)}
                    placeholder="Rp 0 jika tidak ada deposit"
                    className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white"
                  />
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Deposit dicatat pada kuitansi sebagai jaminan yang dapat dikembalikan saat masa sewa selesai.
                  </span>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* KALKULATOR DINAMIS 3: GARASI & LAHAN PARKIR          */}
            {/* ==================================================== */}
            {activeSubcat === 'garasi' && (
              <div className="border-t border-b border-[#232a36] divide-y divide-[#232a36] bg-[#11151c]/60">
                <div className="py-2.5">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    NOMOR SLOT / GUDANG / TEMPAT PARKIR
                  </label>
                  <input
                    type="text"
                    value={garasiSlotNo}
                    onChange={(e) => setGarasiSlotNo(e.target.value)}
                    placeholder="Contoh: Slot Mobil A-02 / Slot Motor #08"
                    className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="py-2.5">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    PLAT NOMOR KENDARAAN
                  </label>
                  <input
                    type="text"
                    value={garasiPlatNo}
                    onChange={(e) => setGarasiPlatNo(e.target.value)}
                    placeholder="Contoh: B 1234 XYZ (Mobil / Motor)"
                    className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white font-mono font-bold"
                  />
                </div>

                <div className="py-2.5">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1.5">
                    PILIHAN DURASI SEWA
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['harian', 'bulanan'] as const).map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => {
                          setGarasiDurasi(dur);
                          if (dur === 'harian') setGarasiTarif(25000);
                          else if (dur === 'bulanan') setGarasiTarif(250000);
                        }}
                        className={`py-2 text-xs font-black uppercase rounded-xs border cursor-pointer transition-all ${
                          garasiDurasi === dur
                            ? 'bg-[#4A2E18] border-white text-white'
                            : 'bg-[#18202c] text-slate-400 border-[#283344]'
                        }`}
                      >
                        [{dur}]
                      </button>
                    ))}
                  </div>
                </div>

                <div className="py-2.5 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                      DURASI (HARI/BULAN)
                    </label>
                    <input
                      type="number"
                      value={garasiQty}
                      min={1}
                      onChange={(e) => setGarasiQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                      TARIF PARKIR (RP)
                    </label>
                    <input
                      type="number"
                      value={garasiTarif}
                      min={0}
                      onChange={(e) => setGarasiTarif(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* KALKULATOR DINAMIS 4: GEDUNG & AREA ACARA            */}
            {/* ==================================================== */}
            {activeSubcat === 'gedung' && (
              <div className="border-t border-b border-[#232a36] divide-y divide-[#232a36] bg-[#11151c]/60">
                <div className="py-2.5">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    TANGGAL PEMAKAIAN ACARA
                  </label>
                  <input
                    type="date"
                    value={gedungTanggal}
                    onChange={(e) => setGedungTanggal(e.target.value)}
                    className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="py-2.5">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    SESI & JAM PEMAKAIAN
                  </label>
                  <select
                    value={gedungSesi}
                    onChange={(e) => setGedungSesi(e.target.value)}
                    className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white font-medium"
                  >
                    <option value="Sesi Pagi (08:00 - 13:00)">Sesi Pagi (08:00 - 13:00)</option>
                    <option value="Sesi Siang (13:00 - 18:00)">Sesi Siang (13:00 - 18:00)</option>
                    <option value="Sesi Malam (18:00 - 23:00)">Sesi Malam (18:00 - 23:00)</option>
                    <option value="Seharian Penuh (08:00 - 22:00)">Seharian Penuh (08:00 - 22:00)</option>
                    <option value="Custom Jam">Custom Jam Sesuai Kesepakatan</option>
                  </select>
                </div>

                <div className="py-2.5">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    TOTAL TARIF SEWA GEDUNG (RP)
                  </label>
                  <input
                    type="number"
                    value={gedungTotalTarif}
                    min={0}
                    onChange={(e) => setGedungTotalTarif(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white font-bold"
                  />
                </div>

                <div className="py-2.5 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                      DP BOOKING (UANG MUKA RP)
                    </label>
                    <input
                      type="number"
                      value={gedungDp}
                      min={0}
                      onChange={(e) => setGedungDp(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                      BATAS JATUH TEMPO LUNAS
                    </label>
                    <input
                      type="date"
                      value={gedungTglPelunasan}
                      onChange={(e) => setGedungTglPelunasan(e.target.value)}
                      className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="py-2 text-xs font-black text-amber-400">
                  Sisa Pelunasan: Rp {Math.max(0, gedungTotalTarif - gedungDp).toLocaleString('id-ID')} (DP Masuk: Rp {gedungDp.toLocaleString('id-ID')})
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* KALKULATOR DINAMIS 5: TENDA & ALAT EVENT             */}
            {/* ==================================================== */}
            {activeSubcat === 'tenda' && (
              <div className="border-t border-b border-[#232a36] divide-y divide-[#232a36] bg-[#11151c]/60">
                <div className="py-2.5">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    STATUS BARANG DI LAPANGAN
                  </label>
                  <select
                    value={tendaStatus}
                    onChange={(e) => setTendaStatus(e.target.value)}
                    className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white"
                  >
                    <option value="Sedang Disewa (Di Lapangan)">Sedang Disewa (Di Lapangan)</option>
                    <option value="Sebagian Sudah Kembali">Sebagian Sudah Kembali</option>
                    <option value="Lengkap & Selesai">Lengkap & Selesai</option>
                  </select>
                </div>

                <div className="py-2.5 space-y-2">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    DAFTAR ITEM ALAT DISEWA
                  </label>
                  <div className="space-y-1.5">
                    {tendaItems.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between py-1 border-b border-dashed border-[#232a36]"
                      >
                        <div>
                          <span className="font-extrabold text-xs text-white">{it.name}</span>
                          <span className="text-[11px] text-slate-400 ml-2">
                            ({it.qty} unit x Rp {it.price.toLocaleString('id-ID')})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-emerald-400">
                            Rp {(it.qty * it.price).toLocaleString('id-ID')}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTendaItem(it.id)}
                            className="px-2 py-0.5 text-[10px] font-black uppercase bg-red-900 text-red-200 rounded-xs"
                          >
                            [X]
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Tenda Item Form */}
                  <div className="grid grid-cols-12 gap-1.5 pt-2">
                    <input
                      type="text"
                      placeholder="Nama alat"
                      value={newTendaName}
                      onChange={(e) => setNewTendaName(e.target.value)}
                      className="col-span-5 bg-[#11151c] border border-[#28303f] rounded-xs px-2 py-1.5 text-xs text-white"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      min={1}
                      value={newTendaQty}
                      onChange={(e) => setNewTendaQty(parseInt(e.target.value) || 1)}
                      className="col-span-2 bg-[#11151c] border border-[#28303f] rounded-xs px-2 py-1.5 text-xs text-white"
                    />
                    <input
                      type="number"
                      placeholder="Harga"
                      min={0}
                      value={newTendaPrice}
                      onChange={(e) => setNewTendaPrice(parseInt(e.target.value) || 0)}
                      className="col-span-3 bg-[#11151c] border border-[#28303f] rounded-xs px-2 py-1.5 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddTendaItem}
                      className="col-span-2 py-1.5 text-[10px] font-black uppercase bg-emerald-700 hover:bg-emerald-600 text-white rounded-xs cursor-pointer"
                    >
                      [+ITEM]
                    </button>
                  </div>
                </div>

                <div className="py-2.5">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    DURASI SEWA (HARI)
                  </label>
                  <input
                    type="number"
                    value={tendaHari}
                    min={1}
                    onChange={(e) => setTendaHari(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-sm text-white font-bold"
                  />
                </div>

                <div className="py-2.5">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                    CATATAN DENDA KERUSAKAN / KEHILANGAN (RP)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Deskripsi (misal: Kursi patah 1)"
                      value={tendaDendaDesc}
                      onChange={(e) => setTendaDendaDesc(e.target.value)}
                      className="col-span-2 bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="number"
                      placeholder="Rp Nominal"
                      value={tendaDendaNominal}
                      onChange={(e) => setTendaDendaNominal(parseInt(e.target.value) || 0)}
                      className="col-span-1 bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* RINGKASAN TOTAL & METODE BAYAR */}
            <div className="border border-[#283344] bg-[#141a24] p-3 rounded-xs space-y-3">
              <div className="flex items-baseline justify-between border-b border-[#283344] pb-2">
                <span className="text-xs font-extrabold uppercase text-slate-400">TOTAL TAGIHAN</span>
                <span className="text-xl font-black text-white">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1.5">
                  METODE PEMBAYARAN
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['tunai', 'qris', 'transfer', 'bon'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`py-2 text-xs font-black uppercase rounded-xs border cursor-pointer transition-all ${
                        payMethod === m
                          ? m === 'bon'
                            ? 'bg-red-800 border-red-500 text-white'
                            : 'bg-emerald-700 border-white text-white'
                          : 'bg-[#18202c] text-slate-400 border-[#283344]'
                      }`}
                    >
                      [{m}]
                    </button>
                  ))}
                </div>
              </div>

              {payMethod === 'bon' && (
                <div className="pt-2 border-t border-[#283344]">
                  <label className="block text-[11px] font-extrabold uppercase text-amber-400 mb-1">
                    TANGGAL JATUH TEMPO PEMBAYARAN BON
                  </label>
                  <input
                    type="date"
                    value={bonDueDate}
                    onChange={(e) => setBonDueDate(e.target.value)}
                    className="w-full bg-[#11151c] border border-amber-600/50 rounded-xs px-3 py-2 text-sm text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                  CATATAN KHUSUS PADA NOTA
                </label>
                <input
                  type="text"
                  value={catatanKhusus}
                  onChange={(e) => setCatatanKhusus(e.target.value)}
                  placeholder="Catatan opsional (misal: Diskon warga RT 04 / Titip kunci)"
                  className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              type="button"
              onClick={handleSaveTransaction}
              style={{ backgroundColor: activeSubcatDef.headerColor }}
              className="w-full py-3.5 px-4 text-sm font-black uppercase tracking-wider text-white border border-white/20 rounded-xs cursor-pointer shadow-md hover:opacity-90 active:scale-[0.99] transition-all"
            >
              [SIMPAN TRANSAKSI SEWA PROPERTI]
            </button>
          </div>
        )}

        {/* ====================================================== */}
        {/* 2. MENU: [BON] - CATATAN TUNGGAKAN & TAGIH WA          */}
        {/* ====================================================== */}
        {activeTab === 'bon' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#232a36] pb-2">
              <div>
                <h2 className="text-sm font-black uppercase text-slate-100">
                  CATATAN BON & TUNGGAKAN SEWA
                </h2>
                <p className="text-[11px] text-slate-400">
                  Pantau jatuh tempo & tagih langsung via WhatsApp
                </p>
              </div>
              <span className="px-2 py-0.5 text-xs font-black uppercase bg-red-900/60 text-red-200 border border-red-700 rounded-xs">
                {bonList.length} Penunggak
              </span>
            </div>

            <div className="flex items-baseline justify-between py-2 border-b border-[#232a36]">
              <span className="text-xs font-bold text-slate-400">TOTAL PIUTANG SEWA:</span>
              <span className="text-base font-black text-red-400">
                Rp {bonList.reduce((acc, b) => acc + b.amount, 0).toLocaleString('id-ID')}
              </span>
            </div>

            {bonList.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-dashed border-[#232a36] rounded-xs">
                <div className="text-sm font-black text-emerald-400 mb-1">
                  SEMUA TUNGGAKAN SEWA LUNAS!
                </div>
                <div className="text-xs">
                  Tidak ada catatan bon atau piutang aktif saat ini.
                </div>
              </div>
            ) : (
              <div className="border-t border-b border-[#232a36] divide-y divide-[#232a36]">
                {bonList.map((b) => (
                  <div key={b.id} className="py-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-black text-white">{b.namaPenyewa}</div>
                        <div className="text-xs text-slate-400 font-bold">
                          {b.namaUnit} • <span className="text-amber-400 font-mono">[{b.subcatName}]</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Tgl: {b.date} • Jatuh Tempo: <strong className="text-amber-300">{b.dueDate || '-'}</strong>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-red-400">
                          Rp {b.amount.toLocaleString('id-ID')}
                        </div>
                        <span className="px-1.5 py-0.5 text-[10px] font-black uppercase bg-red-950 text-red-300 border border-red-800 rounded-xs">
                          BELUM LUNAS
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleTagihWa(b)}
                        className="flex-1 py-1.5 px-3 text-xs font-black uppercase bg-emerald-800 hover:bg-emerald-700 text-white rounded-xs border border-emerald-600 cursor-pointer text-center"
                      >
                        [TAGIH WHATSAPP]
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLunasiBon(b.id)}
                        className="py-1.5 px-3 text-xs font-black uppercase bg-[#18202c] hover:bg-[#283344] text-emerald-400 rounded-xs border border-[#334155] cursor-pointer"
                      >
                        [LUNASI]
                      </button>
                      <button
                        type="button"
                        onClick={() => handleHapusBon(b.id)}
                        className="py-1.5 px-2 text-xs font-black uppercase bg-red-950 hover:bg-red-900 text-red-300 rounded-xs border border-red-800 cursor-pointer"
                      >
                        [X]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====================================================== */}
        {/* 3. MENU: [REKAP] - LAPORAN PEMASUKAN SEWA              */}
        {/* ====================================================== */}
        {activeTab === 'rekap' && (
          <div className="space-y-4">
            <div className="border-b border-[#232a36] pb-2">
              <h2 className="text-sm font-black uppercase text-slate-100">
                REKAP PEMASUKAN SEWA LAPAKQU
              </h2>
              <p className="text-[11px] text-slate-400">
                Laporan pendapatan terbagi Tunai, QRIS, & Transfer
              </p>
            </div>

            {/* Total Cards (Minimalist Flat Underline) */}
            <div className="border-t border-b border-[#232a36] divide-y divide-[#232a36]">
              {(() => {
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                const todayStr = now.toISOString().split('T')[0];

                let sumHariIni = 0;
                let sumBulanIni = 0;
                let sumTotal = 0;
                let sumTunai = 0;
                let sumQris = 0;
                let sumTransfer = 0;

                transactions.forEach((t) => {
                  if (t.isBon && t.bonStatus === 'belum_lunas') return;
                  sumTotal += t.total;

                  const tDate = new Date(t.timestamp || Date.now());
                  if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
                    sumBulanIni += t.total;
                  }
                  if (tDate.toISOString().split('T')[0] === todayStr) {
                    sumHariIni += t.total;
                  }

                  if (t.method === 'tunai') sumTunai += t.total;
                  else if (t.method === 'qris') sumQris += t.total;
                  else sumTransfer += t.total;
                });

                return (
                  <>
                    <div className="flex justify-between items-baseline py-2.5">
                      <span className="text-xs font-bold text-slate-400">PEMASUKAN HARI INI:</span>
                      <span className="text-base font-black text-emerald-400">
                        Rp {sumHariIni.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline py-2.5">
                      <span className="text-xs font-bold text-slate-400">PEMASUKAN BULAN INI:</span>
                      <span className="text-base font-black text-cyan-400">
                        Rp {sumBulanIni.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline py-2.5">
                      <span className="text-xs font-bold text-slate-400">TOTAL AKUMULASI BERSIH:</span>
                      <span className="text-lg font-black text-white">
                        Rp {sumTotal.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3">
                      <div className="p-2 bg-[#141a24] border-b-2 border-emerald-500 rounded-xs">
                        <div className="text-[10px] font-black text-emerald-400">TUNAI</div>
                        <div className="text-xs font-black text-white mt-0.5">
                          Rp {sumTunai.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="p-2 bg-[#141a24] border-b-2 border-cyan-500 rounded-xs">
                        <div className="text-[10px] font-black text-cyan-400">QRIS</div>
                        <div className="text-xs font-black text-white mt-0.5">
                          Rp {sumQris.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="p-2 bg-[#141a24] border-b-2 border-purple-500 rounded-xs">
                        <div className="text-[10px] font-black text-purple-400">TRANSFER</div>
                        <div className="text-xs font-black text-white mt-0.5">
                          Rp {sumTransfer.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShareRekapWa}
                className="flex-1 py-2 px-3 text-xs font-black uppercase bg-[#18202c] hover:bg-[#283344] text-slate-200 border border-[#334155] rounded-xs cursor-pointer text-center"
              >
                [BAGIKAN LAPORAN KE WHATSAPP]
              </button>
            </div>

            {/* Riwayat Transaksi Terakhir */}
            <div className="pt-2">
              <span className="text-xs font-black uppercase text-slate-300 block mb-2">
                RIWAYAT TRANSAKSI SEWA TERAKHIR
              </span>
              {transactions.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-[#232a36]">
                  Belum ada transaksi sewa. Input transaksi di menu [KASIR].
                </div>
              ) : (
                <div className="border-t border-b border-[#232a36] divide-y divide-[#232a36]">
                  {transactions.slice(0, 25).map((t) => {
                    const isUnpaidBon = t.isBon && t.bonStatus === 'belum_lunas';
                    return (
                      <div key={t.id} className="py-2.5 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-xs font-black text-white">{t.namaPenyewa}</div>
                            <div className="text-[11px] text-slate-400 font-semibold">
                              {t.namaUnit} • <span className="font-mono text-amber-400">[{t.subcatName}]</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {t.date} • No. {t.invoiceNo}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs font-black ${isUnpaidBon ? 'text-red-400' : 'text-emerald-400'}`}>
                              Rp {t.total.toLocaleString('id-ID')}
                            </div>
                            <span
                              className={`px-1.5 py-0.2 text-[9px] font-black uppercase rounded-xs border ${
                                isUnpaidBon
                                  ? 'bg-red-950 text-red-300 border-red-800'
                                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              }`}
                            >
                              {isUnpaidBon ? 'BON' : t.method.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentReceiptData(t);
                              setIsReceiptModalOpen(true);
                            }}
                            className="py-1 px-2.5 text-[10px] font-black uppercase bg-[#1e293b] text-slate-300 rounded-xs border border-[#334155] cursor-pointer"
                          >
                            [LIHAT STRUK]
                          </button>
                          <button
                            type="button"
                            onClick={() => handleHapusTx(t.id)}
                            className="py-1 px-2 text-[10px] font-black uppercase bg-red-950 text-red-300 rounded-xs border border-red-800 cursor-pointer ml-auto"
                          >
                            [HAPUS]
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* 4. MENU: [KATALOG] - KELOLA DAFTAR UNIT PROPERTI       */}
        {/* ====================================================== */}
        {activeTab === 'katalog' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#232a36] pb-2">
              <div>
                <h2 className="text-sm font-black uppercase text-slate-100">
                  KATALOG UNIT & PROPERTI SEWA
                </h2>
                <p className="text-[11px] text-slate-400">
                  Kelola tarif, ketersediaan unit, & rincian sewa
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUnitFormSubcat(activeSubcat);
                  setUnitFormTarif(SUBCAT_DEFS[activeSubcat].defaultTarif);
                  setIsAddUnitModalOpen(true);
                }}
                className="py-1.5 px-3 text-xs font-black uppercase bg-emerald-700 hover:bg-emerald-600 text-white rounded-xs border border-emerald-500 cursor-pointer"
              >
                [+ TAMBAH UNIT]
              </button>
            </div>

            {catalog.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-[#232a36]">
                Belum ada unit sewa terdaftar. Klik [+ TAMBAH UNIT] di atas.
              </div>
            ) : (
              <div className="border-t border-b border-[#232a36] divide-y divide-[#232a36]">
                {catalog.map((u) => {
                  const subDef = SUBCAT_DEFS[u.subcat] || SUBCAT_DEFS.kios;
                  const isTersedia = u.status === 'Tersedia';
                  return (
                    <div key={u.id} className="py-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-black text-white">{u.name}</div>
                          <div className="text-xs text-slate-400 font-bold">
                            <span className="font-mono text-amber-400">[{subDef.shortName}]</span> • {u.periode}
                          </div>
                          {u.desc && <div className="text-[11px] text-slate-500 mt-0.5">{u.desc}</div>}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-white">
                            Rp {u.tarif.toLocaleString('id-ID')}
                          </div>
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-black uppercase rounded-xs border ${
                              isTersedia
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : 'bg-amber-950 text-amber-300 border-amber-800'
                            }`}
                          >
                            {u.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleUseCatalogInKasir(u)}
                          className="flex-1 py-1.5 px-3 text-xs font-black uppercase bg-[#1e293b] hover:bg-[#334155] text-emerald-300 rounded-xs border border-[#334155] cursor-pointer text-center"
                        >
                          [PAKAI KE KASIR]
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleUnitStatus(u.id)}
                          className="py-1.5 px-3 text-xs font-black uppercase bg-[#18202c] hover:bg-[#283344] text-slate-300 rounded-xs border border-[#334155] cursor-pointer"
                        >
                          [UBAH STATUS]
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHapusUnit(u.id)}
                          className="py-1.5 px-2 text-xs font-black uppercase bg-red-950 hover:bg-red-900 text-red-300 rounded-xs border border-red-800 cursor-pointer"
                        >
                          [X]
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ====================================================== */}
        {/* 5. MENU: [PENGATURAN] - SWITCH SUBCAT, PROFIL & STRUK  */}
        {/* ====================================================== */}
        {activeTab === 'pengaturan' && (
          <div className="space-y-5">
            <div className="border-b border-[#232a36] pb-2">
              <h2 className="text-sm font-black uppercase text-slate-100">
                PENGATURAN LAPAKQU
              </h2>
              <p className="text-[11px] text-slate-400">
                Switch 5 sub-kategori, profil properti, & pratinjau struk dummy
              </p>
            </div>

            {/* SWITCH 5 SUB-KATEGORI */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold uppercase text-slate-400">
                PILIH SUB-KATEGORI SEWA PROPERTI AKTIF
              </label>
              <div className="flex flex-col gap-1.5">
                {(Object.keys(SUBCAT_DEFS) as SubcatKey[]).map((key, idx) => {
                  const item = SUBCAT_DEFS[key];
                  const isActive = activeSubcat === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectSubcat(key)}
                      style={{ backgroundColor: item.headerColor }}
                      className={`w-full py-2.5 px-3 text-xs font-black uppercase tracking-wider text-white border text-left flex justify-between items-center rounded-xs cursor-pointer ${
                        isActive ? 'border-white ring-2 ring-white/30' : 'border-black/30 opacity-80'
                      }`}
                    >
                      <span>[{idx + 1}] {item.title}</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-black/40 rounded">
                        {isActive ? 'AKTIF' : 'PILIH'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PROFIL USAHA / PENGELOLA */}
            <div className="space-y-2.5 border-t border-b border-[#232a36] py-3">
              <span className="text-xs font-black uppercase text-slate-300 block">
                PROFIL PEMILIK & REKENING PEMBAYARAN
              </span>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                  NAMA USAHA / PROPERTI SEWA
                </label>
                <input
                  type="text"
                  value={profile.namaUsaha}
                  onChange={(e) => setProfile({ ...profile, namaUsaha: e.target.value })}
                  className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                  NAMA PEMILIK / PENGELOLA
                </label>
                <input
                  type="text"
                  value={profile.namaPemilik}
                  onChange={(e) => setProfile({ ...profile, namaPemilik: e.target.value })}
                  className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                  ALAMAT PROPERTI
                </label>
                <input
                  type="text"
                  value={profile.alamat}
                  onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                  className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                  NO. WHATSAPP PENGELOLA
                </label>
                <input
                  type="tel"
                  value={profile.noWa}
                  onChange={(e) => setProfile({ ...profile, noWa: e.target.value })}
                  className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                  INFO REKENING BANK & QRIS
                </label>
                <input
                  type="text"
                  value={profile.rekening}
                  onChange={(e) => setProfile({ ...profile, rekening: e.target.value })}
                  className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            {/* ==================================================== */}
            {/* FITUR PRATINJAU STRUK CETAK DUMMY INTERAKTIF         */}
            {/* ==================================================== */}
            <div className="space-y-3 pt-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-200">
                    PRATINJAU STRUK / KUITANSI SEWA DUMMY
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Menyesuaikan atribut khas sub-kategori: {activeSubcatDef.title}
                  </p>
                </div>
                <span
                  style={{ backgroundColor: activeSubcatDef.headerColor }}
                  className="px-2 py-0.5 text-[10px] font-black uppercase text-white rounded-xs"
                >
                  {activeSubcatDef.shortName}
                </span>
              </div>

              {/* Form Edit Header & Footer Struk */}
              <div className="bg-[#141a24] p-2.5 rounded-xs space-y-2 border border-[#283344]">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-0.5">
                    HEADER KUITANSI (PESAN ATAS)
                  </label>
                  <input
                    type="text"
                    value={receiptConfig.header}
                    onChange={(e) => setReceiptConfig({ ...receiptConfig, header: e.target.value })}
                    className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-0.5">
                    FOOTER KUITANSI (PESAN PENUTUP & ATURAN SEWA)
                  </label>
                  <textarea
                    rows={2}
                    value={receiptConfig.footer}
                    onChange={(e) => setReceiptConfig({ ...receiptConfig, footer: e.target.value })}
                    className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Thermal Paper Simulation Box (Monospace 58mm/80mm style) */}
              <div className="bg-white text-stone-900 font-mono p-4 rounded-xs shadow-md text-xs space-y-2">
                <div className="text-center pb-2 border-b border-dashed border-stone-400">
                  <div className="font-extrabold text-sm">{profile.namaUsaha}</div>
                  <div className="text-[11px] text-stone-600">{profile.alamat}</div>
                  <div className="text-[11px] text-stone-600">WA: {profile.noWa}</div>
                  <div className="text-[10px] font-bold border-y border-dashed border-stone-400 py-0.5 my-1 text-stone-800">
                    {receiptConfig.header}
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>No. Bukti:</span>
                    <span>LPQ-DUMMY88</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>23 Okt 2026, 14:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sub-Kategori:</span>
                    <strong className="font-bold">{activeSubcatDef.title}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Penyewa:</span>
                    <strong className="font-bold">Pak H. Wahyudi (Warga RT 04)</strong>
                  </div>
                </div>

                {/* Subcategory specific dummy details */}
                {renderReceiptSubcatDetails({
                  id: 'dummy',
                  invoiceNo: 'LPQ-DUMMY88',
                  date: '23 Okt 2026',
                  timestamp: Date.now(),
                  subcat: activeSubcat,
                  subcatName: activeSubcatDef.shortName,
                  namaPenyewa: 'Pak H. Wahyudi',
                  noWa: '081234567890',
                  namaUnit:
                    activeSubcat === 'kios'
                      ? 'Kios Pujasera No. 02'
                      : activeSubcat === 'kost'
                      ? 'Kamar Kost 2B'
                      : activeSubcat === 'garasi'
                      ? 'Slot Mobil A-02'
                      : activeSubcat === 'gedung'
                      ? 'Aula Serbaguna RT 04'
                      : 'Paket Tenda & 50 Kursi',
                  total:
                    activeSubcat === 'kios'
                      ? 509000
                      : activeSubcat === 'kost'
                      ? 940000
                      : activeSubcat === 'garasi'
                      ? 250000
                      : activeSubcat === 'gedung'
                      ? 1500000
                      : 350000,
                  method: 'transfer',
                  isBon: false,
                  details: {
                    durasiType: 'Bulanan',
                    qtyPeriod: 1,
                    tarif: activeSubcatDef.defaultTarif,
                    kebersihan: true,
                    keamanan: true,
                    listrik: true,
                    jenisUsaha: 'Warung Nasi Uduk & Kopi',
                    meterLalu: 1420,
                    meterIni: 1465,
                    tarifKwh: 2000,
                    kwhUsed: 45,
                    subtotalListrik: 90000,
                    deposit: 200000,
                    slotNo: 'Slot Mobil A-02',
                    platNo: 'B 1234 SAK',
                    tanggalAcara: '28 Okt 2026',
                    sesi: 'Sesi Siang (13:00 - 18:00)',
                    totalTarif: 1500000,
                    dpBooking: 500000,
                    sisaPelunasan: 1000000,
                    tglPelunasan: '26 Okt 2026',
                    statusAlat: 'Sedang Disewa (Di Lapangan)',
                    hari: 1,
                    items: tendaItems,
                    dendaNominal: 0,
                  },
                })}

                <div className="pt-2 border-t border-dashed border-stone-400 space-y-1 text-xs font-bold">
                  <div className="flex justify-between text-sm">
                    <span>TOTAL:</span>
                    <span>
                      Rp{' '}
                      {(activeSubcat === 'kios'
                        ? 509000
                        : activeSubcat === 'kost'
                        ? 940000
                        : activeSubcat === 'garasi'
                        ? 250000
                        : activeSubcat === 'gedung'
                        ? 1500000
                        : 350000
                      ).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-800">
                    <span>STATUS:</span>
                    <span>[LUNAS - TRANSFER]</span>
                  </div>
                </div>

                <div className="text-center pt-2 border-t border-dashed border-stone-400 text-[10px] text-stone-600">
                  <div>Info Rek: {profile.rekening}</div>
                  <div className="mt-1 whitespace-pre-line">{receiptConfig.footer}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2 text-xs font-black uppercase bg-[#18202c] hover:bg-[#283344] text-white rounded-xs border border-[#334155] cursor-pointer text-center"
                >
                  [SIMULASI CETAK STRUK]
                </button>
                <a
                  href="/lapakqu.html"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 text-xs font-black uppercase bg-emerald-800 hover:bg-emerald-700 text-white rounded-xs border border-emerald-600 text-center"
                >
                  [BUKA STANDALONE HTML ↗]
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* 5 MENU WAJIB (NAVIGATION BOTTOM BAR)                     */}
      {/* ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-[#0d1117] border-t border-[#232a36] flex items-stretch z-40 max-w-md mx-auto">
        {([
          { id: 'kasir' as const, label: '[KASIR]' },
          { id: 'bon' as const, label: '[BON]', badge: bonList.length },
          { id: 'rekap' as const, label: '[REKAP]' },
          { id: 'katalog' as const, label: '[KATALOG]' },
          { id: 'pengaturan' as const, label: '[PENGATURAN]' },
        ] as { id: 'kasir' | 'bon' | 'rekap' | 'katalog' | 'pengaturan'; label: string; badge?: number }[]).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center relative cursor-pointer font-black text-[11px] uppercase tracking-wider transition-colors ${
                isActive ? 'text-white bg-white/5' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <div
                  style={{ backgroundColor: activeSubcatDef.headerColor }}
                  className="absolute top-0 left-2 right-2 h-0.5"
                />
              )}
              <span>{item.label}</span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="absolute top-1.5 right-2 px-1 py-0.2 text-[9px] font-black bg-red-600 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ======================================================== */}
      {/* MODAL: STRUK TRANSAKSI SUKSES                            */}
      {/* ======================================================== */}
      {isReceiptModalOpen && currentReceiptData && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-[#141820] border border-[#2d3748] rounded-xs max-w-md w-full max-h-[90vh] flex flex-col p-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#28303f] pb-2 mb-3">
              <span className="text-xs font-black uppercase text-white">
                BUKTI KUITANSI SEWA LAPAKQU
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsReceiptModalOpen(false);
                  resetKasir();
                }}
                className="px-2 py-0.5 text-xs font-black uppercase bg-[#1e293b] text-slate-300 rounded-xs"
              >
                [TUTUP]
              </button>
            </div>

            {/* Receipt Thermal Paper */}
            <div className="bg-white text-stone-900 font-mono p-4 rounded-xs text-xs space-y-2 mb-3">
              <div className="text-center pb-2 border-b border-dashed border-stone-400">
                <div className="font-extrabold text-sm">{profile.namaUsaha}</div>
                <div className="text-[11px] text-stone-600">{profile.alamat}</div>
                <div className="text-[11px] text-stone-600">WA: {profile.noWa}</div>
                <div className="text-[10px] font-bold border-y border-dashed border-stone-400 py-0.5 my-1 text-stone-800">
                  {receiptConfig.header}
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>No. Bukti:</span>
                  <span>{currentReceiptData.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{currentReceiptData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sub-Kategori:</span>
                  <strong>{currentReceiptData.subcatName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Penyewa:</span>
                  <strong className="font-bold">{currentReceiptData.namaPenyewa}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Kontak WA:</span>
                  <span>{currentReceiptData.noWa || '-'}</span>
                </div>
              </div>

              {renderReceiptSubcatDetails(currentReceiptData)}

              <div className="pt-2 border-t border-dashed border-stone-400 space-y-1 text-xs font-bold">
                <div className="flex justify-between text-sm">
                  <span>TOTAL:</span>
                  <span>Rp {currentReceiptData.total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>STATUS:</span>
                  <span className={currentReceiptData.isBon ? 'text-red-700' : 'text-emerald-800'}>
                    {currentReceiptData.isBon
                      ? `[BON - JATUH TEMPO ${currentReceiptData.bonDueDate || '-'}]`
                      : `[LUNAS - ${currentReceiptData.method.toUpperCase()}]`}
                  </span>
                </div>
              </div>

              {currentReceiptData.catatan && (
                <div className="text-[11px] italic text-stone-600 pt-1">
                  Catatan: {currentReceiptData.catatan}
                </div>
              )}

              <div className="text-center pt-2 border-t border-dashed border-stone-400 text-[10px] text-stone-600">
                <div>Info Rek: {profile.rekening}</div>
                <div className="mt-1 whitespace-pre-line">{receiptConfig.footer}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 text-xs font-black uppercase bg-[#18202c] hover:bg-[#283344] text-white rounded-xs border border-[#334155]"
              >
                [CETAK STRUK]
              </button>
              <button
                type="button"
                onClick={() => {
                  const cleanWa = (currentReceiptData.noWa || '').replace(/[^0-9]/g, '');
                  const waNumber = cleanWa.startsWith('0') ? `62${cleanWa.slice(1)}` : cleanWa;
                  const msg = `*BUKTI PEMBAYARAN SEWA PROPERTI LAPAKQU*
----------------------------------------
Pengelola: *${profile.namaUsaha}*
No. Bukti: *${currentReceiptData.invoiceNo}*
Tanggal: ${currentReceiptData.date}
Penyewa: *${currentReceiptData.namaPenyewa}*
Unit: *${currentReceiptData.namaUnit}* (${currentReceiptData.subcatName})
Metode Bayar: *${currentReceiptData.method.toUpperCase()}*
----------------------------------------
*TOTAL BAYAR: Rp ${currentReceiptData.total.toLocaleString('id-ID')}*
Status: *${currentReceiptData.isBon ? 'HUTANG TEMPO' : 'LUNAS'}*
----------------------------------------
Info Rekening: ${profile.rekening}
_${receiptConfig.footer}_`;
                  const url = waNumber
                    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`
                    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
                  window.open(url, '_blank');
                }}
                className="flex-1 py-2 text-xs font-black uppercase bg-emerald-700 hover:bg-emerald-600 text-white rounded-xs border border-emerald-500"
              >
                [KIRIM KE WA]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH UNIT KATALOG                               */}
      {/* ======================================================== */}
      {isAddUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-[#141820] border border-[#2d3748] rounded-xs max-w-md w-full max-h-[90vh] flex flex-col p-4 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between border-b border-[#28303f] pb-2">
              <span className="text-xs font-black uppercase text-white">
                TAMBAH UNIT SEWA PROPERTI
              </span>
              <button
                type="button"
                onClick={() => setIsAddUnitModalOpen(false)}
                className="px-2 py-0.5 text-xs font-black uppercase bg-[#1e293b] text-slate-300 rounded-xs"
              >
                [BATAL]
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                NAMA UNIT / KAMAR / SLOT / ALAT
              </label>
              <input
                type="text"
                value={unitFormName}
                onChange={(e) => setUnitFormName(e.target.value)}
                placeholder="Contoh: Kios Pujasera No. 05 / Kamar 3B / Slot Mobil 03"
                className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                SUB-KATEGORI PROPERTI
              </label>
              <select
                value={unitFormSubcat}
                onChange={(e) => setUnitFormSubcat(e.target.value as SubcatKey)}
                className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-xs text-white"
              >
                {(Object.keys(SUBCAT_DEFS) as SubcatKey[]).map((k) => (
                  <option key={k} value={k}>
                    {SUBCAT_DEFS[k].title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                  TARIF DASAR (RP)
                </label>
                <input
                  type="number"
                  value={unitFormTarif}
                  min={0}
                  onChange={(e) => setUnitFormTarif(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-xs text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                  PERIODE SEWA
                </label>
                <select
                  value={unitFormPeriode}
                  onChange={(e) => setUnitFormPeriode(e.target.value)}
                  className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-xs text-white"
                >
                  <option value="Per Hari">Per Hari</option>
                  <option value="Per Minggu">Per Minggu</option>
                  <option value="Per Bulan">Per Bulan</option>
                  <option value="Per Tahun">Per Tahun</option>
                  <option value="Per Sesi Acara">Per Sesi Acara</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                STATUS UNIT
              </label>
              <select
                value={unitFormStatus}
                onChange={(e) => setUnitFormStatus(e.target.value as any)}
                className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-xs text-white font-bold"
              >
                <option value="Tersedia">TERSEDIA (KOSONG)</option>
                <option value="Terisi">TERISI (DISEWA)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
                KETERANGAN / FASILITAS
              </label>
              <input
                type="text"
                value={unitFormDesc}
                onChange={(e) => setUnitFormDesc(e.target.value)}
                placeholder="Contoh: Listrik token mandiri, air PDAM, ada rolling door"
                className="w-full bg-[#11151c] border border-[#28303f] rounded-xs px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveCatalogUnit}
                className="flex-1 py-2 text-xs font-black uppercase bg-emerald-700 hover:bg-emerald-600 text-white rounded-xs border border-emerald-500 cursor-pointer"
              >
                [SIMPAN UNIT]
              </button>
              <button
                type="button"
                onClick={() => setIsAddUnitModalOpen(false)}
                className="py-2 px-4 text-xs font-black uppercase bg-[#18202c] text-slate-300 rounded-xs border border-[#334155] cursor-pointer"
              >
                [BATAL]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
