import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';

interface TransportasiQuViewProps {
  currentUser: UserProfile;
  onBackToAppQu: () => void;
  showNotification: (msg: string) => void;
}

export type TransportasiSubCategory =
  | 'ojek'
  | 'angkot'
  | 'angkut'
  | 'travel'
  | 'towing'
  | 'jastip';

interface TransportasiItem {
  id: string;
  name: string;
  price: number;
  operasional?: number;
  qty: number;
  unit: string;
  note?: string;
}

interface BonTransportasi {
  id: string;
  customerName: string;
  phone: string;
  amount: number;
  operasional?: number;
  date: string;
  dueDate: string;
  type: 'piutang' | 'dp_booking' | 'talangan';
  notes: string;
  status: 'belum_lunas' | 'lunas';
}

interface TripInvoice {
  id: string;
  invoiceNumber: string;
  subCategory: TransportasiSubCategory;
  driverName: string;
  customerName?: string;
  items: TransportasiItem[];
  total: number;
  operasional: number;
  paymentMethod: 'tunai' | 'qris' | 'bon_warga';
  status: 'lunas' | 'bon';
  date: string;
  notes?: string;
}

interface SubCatMeta {
  id: TransportasiSubCategory;
  name: string;
  label: string;
  color: string;
  glow: string;
  presets: { id: string; name: string; price: number; operasional: number; unit: string }[];
  dummyItems: { name: string; qty: number; price: number; spec?: string }[];
  specialNote: string;
}

const SUBCATEGORIES: Record<TransportasiSubCategory, SubCatMeta> = {
  ojek: {
    id: 'ojek',
    name: 'Ojek & Penumpang',
    label: 'OJEK & PENUMPANG',
    color: '#0d9488', // Hijau Teal
    glow: '#14b8a6',
    presets: [
      { id: 'oj-1', name: 'Zona 1: Dekat (Dalam RT / RW)', price: 8000, operasional: 2000, unit: 'Trip' },
      { id: 'oj-2', name: 'Zona 2: Sedang (Pasar / Stasiun)', price: 15000, operasional: 4000, unit: 'Trip' },
      { id: 'oj-3', name: 'Zona 3: Jauh (Terminal / Luar Kec.)', price: 25000, operasional: 8000, unit: 'Trip' },
      { id: 'oj-4', name: 'Paket Langganan Sekolah (1 Minggu)', price: 75000, operasional: 20000, unit: 'Minggu' },
      { id: 'oj-5', name: 'Paket Langganan Kerja (1 Bulan PP)', price: 350000, operasional: 100000, unit: 'Bulan' },
    ],
    dummyItems: [
      { name: 'Ojek Zona 2: Ke Stasiun KRL', qty: 1, price: 15000, spec: 'Jemput: Blok B3 / RT 04' },
      { name: 'Titip Bawa Barang Tambahan', qty: 1, price: 5000, spec: 'Kardus Besar' },
    ],
    specialNote: 'Helm SNI Disediakan. Mohon patuhi tata tertib lalu lintas demi keselamatan bersama.',
  },
  angkot: {
    id: 'angkot',
    name: 'Angkot & Bus Kota',
    label: 'ANGKOT & BUS KOTA',
    color: '#ca8a04', // Kuning Angkot / Mustard
    glow: '#eab308',
    presets: [
      { id: 'ak-1', name: 'Ongkos Penumpang Umum Trayek', price: 5000, operasional: 1000, unit: 'Orang' },
      { id: 'ak-2', name: 'Ongkos Pelajar / Anak Sekolah', price: 3000, operasional: 500, unit: 'Orang' },
      { id: 'ak-3', name: 'Borongan Angkot 1 Hari (Ziarah/Wisata)', price: 350000, operasional: 120000, unit: 'Hari' },
      { id: 'ak-4', name: 'Sewa Drop Rombongan Hajatan', price: 200000, operasional: 70000, unit: 'Trip' },
    ],
    dummyItems: [
      { name: 'Setoran Trayek 4 Rit Seharian', qty: 1, price: 240000, spec: 'Kotor Rp 420.000 - BBM 120k - Makan 40k - Kas 20k' },
    ],
    specialNote: 'Rincian Setoran Bersih Juragan Angkot Trayek 04. Telah dipotong BBM, Uang Makan & Kas Paguyuban.',
  },
  angkut: {
    id: 'angkut',
    name: 'Angkut Barang & Kurir',
    label: 'ANGKUT BARANG & KURIR',
    color: '#c2410c', // Oranye Karamel
    glow: '#ea580c',
    presets: [
      { id: 'ab-1', name: 'Sewa Pick-Up Bak (Pindahan Dalam Kota)', price: 150000, operasional: 50000, unit: 'Trip' },
      { id: 'ab-2', name: 'Jasa Kuli Bongkar-Muat (1 Orang)', price: 50000, operasional: 0, unit: 'Orang' },
      { id: 'ab-3', name: 'Kurir Kilat Dokumen / Paket Express', price: 15000, operasional: 3000, unit: 'Paket' },
      { id: 'ab-4', name: 'Sewa Pick-up Luar Kota (<50km)', price: 350000, operasional: 150000, unit: 'Trip' },
    ],
    dummyItems: [
      { name: 'Sewa Pick-Up Bak Pindahan', qty: 1, price: 150000, spec: 'Muat: RT 04 -> Bongkar: Perum Asri' },
      { name: 'Jasa Kuli Bongkar-Muat', qty: 2, price: 100000, spec: '2 Orang Tenaga Angkut' },
    ],
    specialNote: 'Status: Bayar di Tujuan (COD Penerima). Muatan diikat terpal rapi & aman dari hujan.',
  },
  travel: {
    id: 'travel',
    name: 'Travel & Carter Armada',
    label: 'TRAVEL & CARTER ARMADA',
    color: '#1e3a8a', // Biru Navy
    glow: '#2563eb',
    presets: [
      { id: 'tr-1', name: 'Carter Avanza / Xenia (12 Jam)', price: 450000, operasional: 150000, unit: 'Hari' },
      { id: 'tr-2', name: 'Carter Toyota Hiace 14 Seat (1 Hari)', price: 1100000, operasional: 400000, unit: 'Hari' },
      { id: 'tr-3', name: 'Tiket Travel Jurusan Bandung (Per Seat)', price: 120000, operasional: 40000, unit: 'Seat' },
      { id: 'tr-4', name: 'Carter Isuzu Elf 19 Seat (Ziarah/Wisata)', price: 1400000, operasional: 500000, unit: 'Hari' },
    ],
    dummyItems: [
      { name: 'Carter Hiace 14 Seat 1 Hari', qty: 1, price: 1100000, spec: 'Termasuk Sopir | Exclude Tol & Parkir' },
    ],
    specialNote: 'Status: DP Booking Rp 300.000 Masuk. Sisa Pelunasan Rp 800.000 Wajib Dilunasi Sebelum Berangkat.',
  },
  towing: {
    id: 'towing',
    name: 'Towing & Storing',
    label: 'TOWING & STORING',
    color: '#881337', // Merah Marun
    glow: '#be123c',
    presets: [
      { id: 'tw-1', name: 'Evakuasi Mobil Dalam Kota (Flat)', price: 350000, operasional: 100000, unit: 'Trip' },
      { id: 'tw-2', name: 'Storing Motor Gede / Moge Mogok', price: 200000, operasional: 50000, unit: 'Trip' },
      { id: 'tw-3', name: 'Extra Winch / Tarik Parit / Selip Lumpur', price: 150000, operasional: 30000, unit: 'Job' },
      { id: 'tw-4', name: 'Towing Luar Kota (Tarif per KM)', price: 15000, operasional: 6000, unit: 'KM' },
    ],
    dummyItems: [
      { name: 'Evakuasi Mobil Derek Gendong', qty: 1, price: 350000, spec: 'Avanza B 2841 SKG | Gigi Netral' },
      { name: 'Extra Winch Parit', qty: 1, price: 150000, spec: 'Roda Selip Masuk Selokan' },
    ],
    specialNote: 'Struk Derek Evakuasi Resmi 24 Jam. Kendaraan dijamin aman diatas hidrolik gendong.',
  },
  jastip: {
    id: 'jastip',
    name: 'Jastip Belanja',
    label: 'JASTIP BELANJA',
    color: '#d97706', // Kuning Kunyit
    glow: '#f59e0b',
    presets: [
      { id: 'js-1', name: 'Jasa Titip Pasar Subuh (Sayur / Lauk)', price: 10000, operasional: 2000, unit: 'Trip' },
      { id: 'js-2', name: 'Jasa Titip Apotek / Beli Obat Urgent', price: 15000, operasional: 3000, unit: 'Trip' },
      { id: 'js-3', name: 'Jasa Titip Kue Basah / Kuliner Kota', price: 12000, operasional: 2500, unit: 'Titipan' },
      { id: 'js-4', name: 'Jasa Titip Bahan Kue & Sembako Grosir', price: 20000, operasional: 5000, unit: 'Trip' },
    ],
    dummyItems: [
      { name: 'Uang Talangan Belanjaan Pasar', qty: 1, price: 85000, spec: 'Ayam 1kg, Sayur Sop, Tempe 2 papan' },
      { name: 'Tarif Jasa Jastip Pengantaran', qty: 1, price: 10000, spec: 'Ongkos Jasa Titip Antar Rumah' },
    ],
    specialNote: 'Rincian Nota Belanja Pasar Asli Dilampirkan. Mohon pelunasan uang talangan belanjaan.',
  },
};

const STORAGE_KEY = 'transportasiqu_6sub_v1';

export const TransportasiQuView: React.FC<TransportasiQuViewProps> = ({
  currentUser,
  onBackToAppQu,
  showNotification,
}) => {
  // Navigation 5 core tabs
  const [activeTab, setActiveTab] = useState<'kasir' | 'bon' | 'rekap' | 'katalog' | 'pengaturan'>('kasir');
  const [activeSubcat, setActiveSubcat] = useState<TransportasiSubCategory>('ojek');

  // Shared Data States
  const [cart, setCart] = useState<TransportasiItem[]>([]);
  const [invoices, setInvoices] = useState<TripInvoice[]>([]);
  const [bonList, setBonList] = useState<BonTransportasi[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [armadaProfile, setArmadaProfile] = useState({
    name: 'Transportasi Warga Berkah RT 04',
    address: 'Pangkalan Utama Pos RW 02 / RT 04',
    phone: '0812-7777-8899',
    footer: 'Keselamatan & Ketepatan Waktu adalah Prioritas Kami. Terima Kasih!',
  });

  // Transient calculator parameters
  const [cashGiven, setCashGiven] = useState<string>('');

  // 1. Ojek
  const [ojekKm, setOjekKm] = useState<number>(5);
  const [ojekIsLangganan, setOjekIsLangganan] = useState<boolean>(false);
  const [ojekRoute, setOjekRoute] = useState<string>('');

  // 2. Angkot
  const [angkotKotor, setAngkotKotor] = useState<number>(400000);
  const [angkotBbm, setAngkotBbm] = useState<number>(120000);
  const [angkotMakan, setAngkotMakan] = useState<number>(40000);
  const [angkotKas, setAngkotKas] = useState<number>(20000);

  // 3. Angkut Barang
  const [angkutArmadaCost, setAngkutArmadaCost] = useState<number>(150000);
  const [angkutKuliCost, setAngkutKuliCost] = useState<number>(50000);
  const [angkutCodStatus, setAngkutCodStatus] = useState<'Penerima' | 'Pengirim'>('Penerima');
  const [angkutAddress, setAngkutAddress] = useState<string>('');

  // 4. Travel
  const [travelTotal, setTravelTotal] = useState<number>(1100000);
  const [travelDp, setTravelDp] = useState<number>(300000);
  const [travelIncBbm, setTravelIncBbm] = useState<boolean>(true);
  const [travelIncSopir, setTravelIncSopir] = useState<boolean>(true);
  const [travelIncTol, setTravelIncTol] = useState<boolean>(false);

  // 5. Towing
  const [towingDasar, setTowingDasar] = useState<number>(350000);
  const [towingExtraKm, setTowingExtraKm] = useState<number>(0);
  const [towingWinch, setTowingWinch] = useState<boolean>(false);
  const [towingPlatNo, setTowingPlatNo] = useState<string>('');

  // 6. Jastip
  const [jastipTalangan, setJastipTalangan] = useState<number>(75000);
  const [jastipFee, setJastipFee] = useState<number>(15000);
  const [jastipItemsText, setJastipItemsText] = useState<string>('');

  // Modals
  const [isBonModalOpen, setIsBonModalOpen] = useState(false);
  const [isCustomOrderModalOpen, setIsCustomOrderModalOpen] = useState(false);
  const [isAddCatalogModalOpen, setIsAddCatalogModalOpen] = useState(false);

  // Bon Form State
  const [bonCustName, setBonCustName] = useState('');
  const [bonCustPhone, setBonCustPhone] = useState('');
  const [bonDueDate, setBonDueDate] = useState('');
  const [bonType, setBonType] = useState<'piutang' | 'dp_booking' | 'talangan'>('piutang');
  const [bonNotes, setBonNotes] = useState('');

  // Custom Order Form State
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customQty, setCustomQty] = useState('1');
  const [customNote, setCustomNote] = useState('');

  // Add Catalog Form State
  const [catName, setCatName] = useState('');
  const [catPrice, setCatPrice] = useState('');
  const [catBbm, setCatBbm] = useState('');
  const [catUnit, setCatUnit] = useState('Trip');
  const [catSubcat, setCatSubcat] = useState<TransportasiSubCategory>('ojek');

  // Initial load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.activeSubcat) setActiveSubcat(parsed.activeSubcat);
        if (parsed.invoices) setInvoices(parsed.invoices);
        if (parsed.bonList) setBonList(parsed.bonList);
        if (parsed.catalog) setCatalog(parsed.catalog);
        if (parsed.armadaProfile) setArmadaProfile(parsed.armadaProfile);
      } catch (e) {
        console.error('Error loading transportasiqu data', e);
      }
    } else {
      const initialCat: any[] = [];
      Object.keys(SUBCATEGORIES).forEach((key) => {
        const k = key as TransportasiSubCategory;
        SUBCATEGORIES[k].presets.forEach((p) => {
          initialCat.push({
            id: p.id,
            name: p.name,
            category: k,
            price: p.price,
            operasional: p.operasional,
            unit: p.unit,
          });
        });
      });
      setCatalog(initialCat);

      const initialBon: BonTransportasi[] = [
        {
          id: 'bon-1',
          customerName: 'Bu RT Endang',
          phone: '081345678910',
          amount: 75000,
          date: '2026-10-22',
          dueDate: '2026-10-29',
          type: 'piutang',
          notes: 'Langganan Ojek Antar-Jemput Anak Sekolah 1 Minggu',
          status: 'belum_lunas',
        },
        {
          id: 'bon-2',
          customerName: 'Pak Dedi (Rombongan Ziarah)',
          phone: '081298765432',
          amount: 800000,
          date: '2026-10-21',
          dueDate: '2026-10-31',
          type: 'dp_booking',
          notes: 'Sisa Pelunasan Carter Hiace ke Cirebon (DP 300k Masuk)',
          status: 'belum_lunas',
        },
      ];
      setBonList(initialBon);
    }
  }, []);

  const persistState = (
    newInvoices = invoices,
    newBon = bonList,
    newCat = catalog,
    newProfile = armadaProfile,
    newSubcat = activeSubcat
  ) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        activeSubcat: newSubcat,
        invoices: newInvoices,
        bonList: newBon,
        catalog: newCat,
        armadaProfile: newProfile,
      })
    );
  };

  const currentMeta = SUBCATEGORIES[activeSubcat];

  const totalCart = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalOperasional = cart.reduce((sum, item) => sum + (item.operasional || 0) * item.qty, 0);

  const handleAddToCart = (item: {
    id: string;
    name: string;
    price: number;
    operasional?: number;
    qty?: number;
    unit?: string;
    note?: string;
  }) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.name === item.name && p.note === item.note);
      if (existing) {
        return prev.map((p) =>
          p.id === existing.id ? { ...p, qty: p.qty + (item.qty || 1) } : p
        );
      }
      return [
        ...prev,
        {
          id: `${item.id}-${Date.now()}`,
          name: item.name,
          price: item.price,
          operasional: item.operasional || Math.round(item.price * 0.3),
          qty: item.qty || 1,
          unit: item.unit || 'Trip',
          note: item.note || '',
        },
      ];
    });
    showNotification(`+ ${item.name} dimasukkan ke rincian order`);
  };

  const handleUpdateQty = (index: number, delta: number) => {
    setCart((prev) => {
      const copy = [...prev];
      copy[index].qty += delta;
      if (copy[index].qty <= 0) copy.splice(index, 1);
      return copy;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    showNotification('Rincian order dikosongkan');
  };

  // Payment Execution: [TUNAI] & [QRIS]
  const handleExecutePayment = (method: 'tunai' | 'qris') => {
    if (cart.length === 0) {
      showNotification('Rincian order masih kosong!');
      return;
    }
    const cashNum = parseInt(cashGiven) || totalCart;
    const change = Math.max(0, cashNum - totalCart);

    const newInvoice: TripInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `TRIP-${Date.now().toString().slice(-6)}`,
      subCategory: activeSubcat,
      driverName: currentUser.name,
      items: [...cart],
      total: totalCart,
      operasional: totalOperasional,
      paymentMethod: method,
      status: 'lunas',
      date: new Date().toISOString(),
      notes: activeSubcat === 'angkot' ? 'Setoran Trayek Harian' : undefined,
    };

    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    setCart([]);
    setCashGiven('');
    persistState(updated);
    showNotification(
      `Pembayaran [${method.toUpperCase()}] Sukses! ${
        method === 'tunai' ? `Kembalian: Rp ${change.toLocaleString('id-ID')}` : ''
      }`
    );
  };

  // Execute Catat Bon
  const handleConfirmCatatBon = () => {
    if (!bonCustName.trim()) {
      showNotification('Harap masukkan nama pelanggan!');
      return;
    }
    const due = bonDueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const newBon: BonTransportasi = {
      id: `bon-${Date.now()}`,
      customerName: bonCustName.trim(),
      phone: bonCustPhone.trim() || '0812-xxxx-xxxx',
      amount: totalCart,
      operasional: totalOperasional,
      date: new Date().toISOString().split('T')[0],
      dueDate: due,
      type: bonType,
      notes: bonNotes.trim() || `Order ${cart.map((c) => c.name).join(', ')}`,
      status: 'belum_lunas',
    };

    const updatedBon = [newBon, ...bonList];
    setBonList(updatedBon);

    const newInv: TripInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `TRIP-BON-${Date.now().toString().slice(-5)}`,
      subCategory: activeSubcat,
      driverName: currentUser.name,
      customerName: bonCustName.trim(),
      items: [...cart],
      total: totalCart,
      operasional: totalOperasional,
      paymentMethod: 'bon_warga',
      status: 'bon',
      date: new Date().toISOString(),
      notes: bonNotes.trim(),
    };
    const updatedInvoices = [newInv, ...invoices];
    setInvoices(updatedInvoices);

    setCart([]);
    setIsBonModalOpen(false);
    setBonCustName('');
    setBonCustPhone('');
    setBonNotes('');
    persistState(updatedInvoices, updatedBon);
    showNotification(`Catatan Bon / Booking atas nama ${newBon.customerName} disimpan.`);
  };

  const handleMarkBonLunas = (index: number) => {
    const updated = [...bonList];
    updated[index].status = 'lunas';
    setBonList(updated);
    persistState(invoices, updated);
    showNotification('Tagihan ditandai LUNAS!');
  };

  const handleDeleteBon = (index: number) => {
    const updated = bonList.filter((_, i) => i !== index);
    setBonList(updated);
    persistState(invoices, updated);
    showNotification('Catatan tagihan dihapus.');
  };

  const handleSendWhatsAppBilling = (bon: BonTransportasi) => {
    const phoneClean = bon.phone.replace(/[^0-9]/g, '');
    const text = `Halo Yth. ${bon.customerName}, kami dari ${armadaProfile.name} menginfokan rincian tagihan jasa transportasi sebesar Rp ${bon.amount.toLocaleString('id-ID')} dengan jatuh tempo tgl ${bon.dueDate}. Rincian: ${bon.notes || '-'}. Terima kasih atas kerja samanya!`;
    const target = phoneClean.startsWith('0') ? '62' + phoneClean.slice(1) : phoneClean;
    window.open(`https://wa.me/${target}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Custom Order
  const handleConfirmCustomOrder = () => {
    const priceNum = parseInt(customPrice) || 0;
    const qtyNum = parseInt(customQty) || 1;
    if (!customName.trim() || priceNum <= 0) {
      showNotification('Nama layanan dan tarif harus diisi valid!');
      return;
    }
    handleAddToCart({
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      price: priceNum,
      operasional: Math.round(priceNum * 0.3),
      qty: qtyNum,
      note: customNote.trim(),
    });
    setIsCustomOrderModalOpen(false);
    setCustomName('');
    setCustomPrice('');
    setCustomQty('1');
    setCustomNote('');
  };

  // Add Catalog
  const handleConfirmAddCatalog = () => {
    const priceNum = parseInt(catPrice) || 0;
    if (!catName.trim() || priceNum <= 0) {
      showNotification('Nama layanan dan tarif harus diisi!');
      return;
    }
    const bbmNum = parseInt(catBbm) || Math.round(priceNum * 0.3);

    const newItem = {
      id: `cat-${Date.now()}`,
      name: catName.trim(),
      category: catSubcat,
      price: priceNum,
      operasional: bbmNum,
      unit: catUnit.trim() || 'Trip',
    };

    const updated = [...catalog, newItem];
    setCatalog(updated);
    setIsAddCatalogModalOpen(false);
    setCatName('');
    setCatPrice('');
    setCatBbm('');
    persistState(invoices, bonList, updated);
    showNotification(`${newItem.name} ditambahkan ke daftar tarif.`);
  };

  // Stats
  const totalOmset = invoices.reduce((s, i) => s + i.total, 0);
  const totalOps = invoices.reduce((s, i) => s + (i.operasional || Math.round(i.total * 0.35)), 0);
  const netIncome = Math.max(0, totalOmset - totalOps);
  const tunaiOmset = invoices.filter((i) => i.paymentMethod === 'tunai').reduce((s, i) => s + i.total, 0);
  const qrisOmset = invoices.filter((i) => i.paymentMethod === 'qris').reduce((s, i) => s + i.total, 0);
  const totalUnpaidBon = bonList.filter((b) => b.status === 'belum_lunas').reduce((s, b) => s + b.amount, 0);

  return (
    <div className="flex-1 flex flex-col bg-stone-950 text-white min-h-screen overflow-x-hidden select-none pb-20">
      {/* ========================================================= */}
      {/* DYNAMIC COLOR-CODED HEADER (6 SUB-KATEGORI TRANSPORTASI)  */}
      {/* ========================================================= */}
      <header
        className="sticky top-0 z-40 text-white p-3.5 shadow-md transition-colors duration-200"
        style={{ backgroundColor: currentMeta.color }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBackToAppQu}
              className="px-2.5 py-1 bg-black/30 hover:bg-black/50 text-white text-xs font-black rounded border border-white/30 tracking-wider cursor-pointer"
            >
              [KEMBALI]
            </button>
            <div className="min-w-0">
              <span className="font-black text-lg tracking-tight block truncate">TRANSPORTASIQU</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded text-white inline-block">
                {currentMeta.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href="/transportasiqu.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-black/40 hover:bg-black/60 text-white text-[11px] font-black rounded border border-white/40 tracking-wider inline-flex items-center gap-1"
            >
              [BUKA OFFLINE .HTML]
            </a>
          </div>
        </div>

        {/* 6 Sub-Kategori Quick Scroll Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
          {(Object.keys(SUBCATEGORIES) as TransportasiSubCategory[]).map((key, idx) => {
            const sub = SUBCATEGORIES[key];
            const isActive = activeSubcat === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveSubcat(key);
                  persistState(invoices, bonList, catalog, armadaProfile, key);
                  showNotification(`Beralih ke: ${sub.name}`);
                }}
                className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-black shadow-md border-white'
                    : 'bg-black/25 text-white/90 border border-white/20 hover:bg-black/40'
                }`}
              >
                {idx + 1}. {sub.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </header>

      {/* ========================================================= */}
      {/* 1. TAB KASIR / SMART KALKULATOR                           */}
      {/* ========================================================= */}
      {activeTab === 'kasir' && (
        <div className="flex-1 flex flex-col">
          {/* Sub-Category Specialized Toolstrip */}
          <div className="bg-stone-900 border-b border-stone-800 p-3 space-y-2">
            {activeSubcat === 'ojek' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black text-stone-400">
                  <span style={{ color: currentMeta.glow }}>TARIF JARAK KM & LANGGANAN</span>
                  <button
                    type="button"
                    onClick={() => {
                      setOjekIsLangganan(!ojekIsLangganan);
                      showNotification(
                        !ojekIsLangganan ? 'Mode Langganan PP Diaktifkan' : 'Mode Reguler'
                      );
                    }}
                    className={`px-2 py-0.5 text-xs font-black rounded ${
                      ojekIsLangganan ? 'bg-teal-600 text-white' : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {ojekIsLangganan ? '[LANGGANAN PP]' : '[REGULER 1X JALAN]'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={ojekKm}
                    onChange={(e) => setOjekKm(parseFloat(e.target.value) || 1)}
                    min={1}
                    className="w-16 bg-stone-950 text-white text-xs font-black text-center py-1 rounded border border-stone-700"
                  />
                  <span className="text-xs font-black text-stone-400">KM x Rp 3.000</span>
                  <button
                    type="button"
                    onClick={() => {
                      const total = Math.max(8000, ojekKm * 3000);
                      handleAddToCart({
                        id: `oj-km-${Date.now()}`,
                        name: `Ojek Penumpang (${ojekKm} KM)`,
                        price: total,
                        operasional: Math.round(total * 0.3),
                        unit: 'Trip',
                        note: `Jarak ${ojekKm} KM @ Rp 3.000 ${ojekRoute ? `(${ojekRoute})` : ''}`,
                      });
                    }}
                    className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black rounded shrink-0"
                  >
                    [+ HITUNG TRIP]
                  </button>
                </div>
                <input
                  type="text"
                  value={ojekRoute}
                  onChange={(e) => setOjekRoute(e.target.value)}
                  placeholder="Titik Jemput -> Titik Antar Penumpang"
                  className="w-full bg-stone-950 text-white text-xs font-bold px-2.5 py-1.5 rounded border border-stone-800"
                />
              </div>
            )}

            {activeSubcat === 'angkot' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black text-stone-400">
                  <span style={{ color: currentMeta.glow }}>SETORAN BERSIH JURAGAN</span>
                  <span className="text-emerald-400">
                    BERSIH: Rp{' '}
                    {Math.max(
                      0,
                      angkotKotor - angkotBbm - angkotMakan - angkotKas
                    ).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={angkotKotor}
                    onChange={(e) => setAngkotKotor(parseInt(e.target.value) || 0)}
                    placeholder="Kotor (Rp)"
                    className="bg-stone-950 text-white text-xs font-bold px-2 py-1 rounded border border-stone-800"
                  />
                  <input
                    type="number"
                    value={angkotBbm}
                    onChange={(e) => setAngkotBbm(parseInt(e.target.value) || 0)}
                    placeholder="BBM (Rp)"
                    className="bg-stone-950 text-white text-xs font-bold px-2 py-1 rounded border border-stone-800"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={angkotMakan}
                    onChange={(e) => setAngkotMakan(parseInt(e.target.value) || 0)}
                    placeholder="Makan (Rp)"
                    className="bg-stone-950 text-white text-xs font-bold px-2 py-1 rounded border border-stone-800"
                  />
                  <input
                    type="number"
                    value={angkotKas}
                    onChange={(e) => setAngkotKas(parseInt(e.target.value) || 0)}
                    placeholder="Kas (Rp)"
                    className="bg-stone-950 text-white text-xs font-bold px-2 py-1 rounded border border-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const bersih = Math.max(0, angkotKotor - angkotBbm - angkotMakan - angkotKas);
                      handleAddToCart({
                        id: `ak-set-${Date.now()}`,
                        name: 'Setoran Bersih Juragan Angkot',
                        price: bersih,
                        operasional: angkotBbm + angkotMakan + angkotKas,
                        unit: 'Setoran',
                        note: `Kotor Rp ${angkotKotor.toLocaleString()} - Potongan BBM/Makan/Kas Rp ${(
                          angkotBbm +
                          angkotMakan +
                          angkotKas
                        ).toLocaleString()}`,
                      });
                    }}
                    className="py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-black rounded"
                  >
                    [+ SETORAN]
                  </button>
                </div>
              </div>
            )}

            {activeSubcat === 'angkut' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black text-stone-400">
                  <span style={{ color: currentMeta.glow }}>SEWA PICK-UP & KULI BONGKAR</span>
                  <button
                    type="button"
                    onClick={() =>
                      setAngkutCodStatus(angkutCodStatus === 'Penerima' ? 'Pengirim' : 'Penerima')
                    }
                    className="px-2 py-0.5 text-xs font-black rounded bg-stone-800 text-orange-400 border border-stone-700"
                  >
                    COD: [BAYAR DI {angkutCodStatus.toUpperCase()}]
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={angkutArmadaCost}
                    onChange={(e) => setAngkutArmadaCost(parseInt(e.target.value) || 0)}
                    placeholder="Sewa Pick-Up (Rp)"
                    className="bg-stone-950 text-white text-xs font-bold px-2 py-1 rounded border border-stone-800"
                  />
                  <input
                    type="number"
                    value={angkutKuliCost}
                    onChange={(e) => setAngkutKuliCost(parseInt(e.target.value) || 0)}
                    placeholder="Ongkos Kuli (Rp)"
                    className="bg-stone-950 text-white text-xs font-bold px-2 py-1 rounded border border-stone-800"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={angkutAddress}
                    onChange={(e) => setAngkutAddress(e.target.value)}
                    placeholder="Alamat Muat -> Alamat Bongkar"
                    className="flex-1 bg-stone-950 text-white text-xs font-bold px-2 py-1 rounded border border-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const total = angkutArmadaCost + angkutKuliCost;
                      handleAddToCart({
                        id: `ab-pkg-${Date.now()}`,
                        name: 'Angkut Barang Pick-Up & Kuli',
                        price: total,
                        operasional: Math.round(angkutArmadaCost * 0.35),
                        unit: 'Order',
                        note: `Sewa Pick-Up Rp ${angkutArmadaCost.toLocaleString()} + Kuli Rp ${angkutKuliCost.toLocaleString()} (COD: ${angkutCodStatus}) ${
                          angkutAddress ? `[${angkutAddress}]` : ''
                        }`,
                      });
                    }}
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded shrink-0"
                  >
                    [+ AMBIL ORDER]
                  </button>
                </div>
              </div>
            )}

            {activeSubcat === 'travel' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black text-stone-400">
                  <span style={{ color: currentMeta.glow }}>CARTER ARMADA & CHECKLIST BIAYA</span>
                  <span className="text-stone-300">HIACE / ELF / AVANZA</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={travelTotal}
                    onChange={(e) => setTravelTotal(parseInt(e.target.value) || 0)}
                    placeholder="Total Tarif Sewa (Rp)"
                    className="bg-stone-950 text-white text-xs font-bold px-2 py-1 rounded border border-stone-800"
                  />
                  <input
                    type="number"
                    value={travelDp}
                    onChange={(e) => setTravelDp(parseInt(e.target.value) || 0)}
                    placeholder="DP Uang Muka (Rp)"
                    className="bg-stone-950 text-white text-xs font-bold px-2 py-1 rounded border border-stone-800"
                  />
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={travelIncBbm}
                      onChange={(e) => setTravelIncBbm(e.target.checked)}
                      className="accent-blue-500"
                    />
                    [BBM]
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={travelIncSopir}
                      onChange={(e) => setTravelIncSopir(e.target.checked)}
                      className="accent-blue-500"
                    />
                    [SOPIR]
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={travelIncTol}
                      onChange={(e) => setTravelIncTol(e.target.checked)}
                      className="accent-blue-500"
                    />
                    [TOL & PARKIR]
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const sisa = Math.max(0, travelTotal - travelDp);
                      const incs: string[] = [];
                      if (travelIncBbm) incs.push('Inc BBM');
                      if (travelIncSopir) incs.push('Inc Sopir');
                      if (travelIncTol) incs.push('Inc Tol');
                      else incs.push('Exc Tol/Parkir');

                      handleAddToCart({
                        id: `tr-book-${Date.now()}`,
                        name: 'Carter Armada Perjalanan',
                        price: travelTotal,
                        operasional: Math.round(travelTotal * 0.4),
                        unit: 'Booking',
                        note: `DP: Rp ${travelDp.toLocaleString()} | Sisa: Rp ${sisa.toLocaleString()} [${incs.join(
                          ', '
                        )}]`,
                      });
                    }}
                    className="ml-auto px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded"
                  >
                    [+ BOOKING]
                  </button>
                </div>
              </div>
            )}

            {activeSubcat === 'towing' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black text-stone-400">
                  <span style={{ color: currentMeta.glow }}>TARIF DASAR + KM + EXTRA WINCH</span>
                  <label className="flex items-center gap-1 text-red-400 text-xs font-black cursor-pointer">
                    <input
                      type="checkbox"
                      checked={towingWinch}
                      onChange={(e) => setTowingWinch(e.target.checked)}
                      className="accent-red-500"
                    />
                    [+ WINCH PARIT 150k]
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={towingPlatNo}
                    onChange={(e) => setTowingPlatNo(e.target.value)}
                    placeholder="Mobil & Plat No (Misal: Innova B 1234 CD)"
                    className="bg-stone-950 text-white text-xs font-bold px-2 py-1 rounded border border-stone-800"
                  />
                  <input
                    type="number"
                    value={towingExtraKm}
                    onChange={(e) => setTowingExtraKm(parseInt(e.target.value) || 0)}
                    placeholder="KM Luar Kota (0 = dlm kota)"
                    className="bg-stone-950 text-white text-xs font-bold px-2 py-1 rounded border border-stone-800"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const dasar = towingDasar || 350000;
                    const kmCost = towingExtraKm * 15000;
                    const winchCost = towingWinch ? 150000 : 0;
                    const total = dasar + kmCost + winchCost;

                    handleAddToCart({
                      id: `tw-job-${Date.now()}`,
                      name: `Towing Evakuasi Kendaraan ${towingPlatNo ? `(${towingPlatNo})` : ''}`,
                      price: total,
                      operasional: Math.round(total * 0.3),
                      unit: 'Evakuasi',
                      note: `Dasar Rp ${dasar.toLocaleString()} ${
                        towingExtraKm > 0 ? `+ Luar Kota (${towingExtraKm}km Rp ${kmCost.toLocaleString()})` : ''
                      } ${towingWinch ? '+ Extra Winch Parit' : ''}`,
                    });
                  }}
                  className="w-full py-1.5 bg-rose-800 hover:bg-rose-700 text-white text-xs font-black rounded"
                >
                  [+ HITUNG TIKET TOWING]
                </button>
              </div>
            )}

            {activeSubcat === 'jastip' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black text-stone-400">
                  <span style={{ color: currentMeta.glow }}>TALANGAN BELANJA VS JASA JASTIP</span>
                  <span className="text-emerald-400">TOTAL = TALANGAN + JASA</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={jastipTalangan}
                    onChange={(e) => setJastipTalangan(parseInt(e.target.value) || 0)}
                    placeholder="Uang Talangan (Rp)"
                    className="bg-stone-950 text-white text-xs font-bold px-2 py-1 rounded border border-stone-800"
                  />
                  <input
                    type="number"
                    value={jastipFee}
                    onChange={(e) => setJastipFee(parseInt(e.target.value) || 0)}
                    placeholder="Tarif Jasa (Rp)"
                    className="bg-stone-950 text-white text-xs font-bold px-2 py-1 rounded border border-stone-800"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={jastipItemsText}
                    onChange={(e) => setJastipItemsText(e.target.value)}
                    placeholder="Rincian Belanjaan (Sayur/Obat/Kue)"
                    className="flex-1 bg-stone-950 text-white text-xs font-bold px-2 py-1 rounded border border-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const total = jastipTalangan + jastipFee;
                      handleAddToCart({
                        id: `js-ord-${Date.now()}`,
                        name: 'Jastip: Talangan + Ongkos Jasa',
                        price: total,
                        operasional: Math.round(jastipFee * 0.2),
                        unit: 'Titipan',
                        note: `Talangan Rp ${jastipTalangan.toLocaleString()} + Jasa Rp ${jastipFee.toLocaleString()} ${
                          jastipItemsText ? `(${jastipItemsText})` : ''
                        }`,
                      });
                    }}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded shrink-0"
                  >
                    [+ CATAT JASTIP]
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preset Fast-Moving Underline List */}
          <div className="px-3.5 py-2 flex justify-between items-center text-xs font-black text-stone-400">
            <span>PRESET TARIF & LAYANAN ({currentMeta.label})</span>
            <button
              type="button"
              onClick={() => setIsCustomOrderModalOpen(true)}
              className="text-xs font-black hover:underline"
              style={{ color: currentMeta.glow }}
            >
              + [INPUT MANUAL]
            </button>
          </div>

          <div className="divide-y divide-stone-800 border-y border-stone-800 bg-stone-950">
            {currentMeta.presets.map((preset) => (
              <div
                key={preset.id}
                className="px-4 py-3 flex items-center justify-between hover:bg-stone-900 transition-colors"
              >
                <div>
                  <div className="font-extrabold text-sm text-stone-100">{preset.name}</div>
                  <div className="text-xs font-bold text-stone-400">
                    Tarif: Rp {preset.price.toLocaleString('id-ID')} / {preset.unit}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddToCart(preset)}
                  className="px-3.5 py-1.5 text-xs font-black rounded text-white tracking-wider cursor-pointer active:scale-95 transition-transform"
                  style={{ backgroundColor: currentMeta.color }}
                >
                  [+ TAMBAH]
                </button>
              </div>
            ))}
          </div>

          {/* Cart Header */}
          <div className="px-3.5 py-2.5 mt-2 flex justify-between items-center bg-stone-900 border-t border-stone-800">
            <span className="text-xs font-black tracking-wider" style={{ color: currentMeta.glow }}>
              RINCIAN ORDER / TRIP ({cart.length} ITEM)
            </span>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="text-xs font-black text-red-400 hover:text-red-300"
              >
                [KOSONGKAN]
              </button>
            )}
          </div>

          {/* Cart Items Underline List */}
          <div className="divide-y divide-stone-800/80 border-b border-stone-800 bg-stone-950">
            {cart.length === 0 ? (
              <div className="py-6 text-center text-xs font-bold text-stone-500">
                Belum ada order jasa. Tekan tombol [+ TAMBAH] pada layanan di atas.
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-sm text-white truncate">{item.name}</div>
                    <div className="text-xs font-bold text-stone-400 flex items-center gap-2 mt-0.5">
                      <span>
                        {item.qty} {item.unit} x Rp {item.price.toLocaleString('id-ID')}
                      </span>
                      <span className="font-black" style={{ color: currentMeta.glow }}>
                        = Rp {(item.price * item.qty).toLocaleString('id-ID')}
                      </span>
                    </div>
                    {item.note && (
                      <div className="text-[11px] font-black text-amber-400 mt-0.5">{item.note}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(idx, -1)}
                      className="w-7 h-7 flex items-center justify-center bg-stone-800 text-white font-black text-xs rounded border border-stone-700"
                    >
                      -
                    </button>
                    <span className="font-black text-sm w-5 text-center">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(idx, 1)}
                      className="w-7 h-7 flex items-center justify-center bg-stone-800 text-white font-black text-xs rounded border border-stone-700"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCartItem(idx)}
                      className="px-2 py-1 bg-red-950 text-red-400 hover:bg-red-900 text-[10px] font-black rounded border border-red-800 ml-1"
                    >
                      [HAPUS]
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sticky Summary & Action Panel */}
          <div className="p-3.5 bg-stone-900 border-t border-stone-800 space-y-2.5 mt-auto">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider block">
                  TOTAL TARIF / TAGIHAN
                </span>
                <span className="text-2xl font-black" style={{ color: currentMeta.glow }}>
                  Rp {totalCart.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
                  STATUS
                </span>
                <span className="text-xs font-black text-stone-200">{currentMeta.label}</span>
              </div>
            </div>

            {/* Cash Input */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={cashGiven}
                onChange={(e) => setCashGiven(e.target.value)}
                placeholder="Uang diterima (Rp)"
                className="flex-1 bg-stone-950 text-white font-black text-base px-3 py-2 rounded border border-stone-700"
              />
              <div className="text-right min-w-[120px]">
                <span className="text-[10px] font-black text-stone-400 uppercase block">KEMBALIAN</span>
                <span
                  className={`text-sm font-black ${
                    parseInt(cashGiven) >= totalCart ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  Rp {Math.max(0, (parseInt(cashGiven) || 0) - totalCart).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* 3 Main Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleExecutePayment('tunai')}
                className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider rounded border border-emerald-400 active:scale-95 transition-transform"
              >
                [TUNAI]
              </button>
              <button
                type="button"
                onClick={() => handleExecutePayment('qris')}
                className="py-3 bg-sky-600 hover:bg-sky-500 text-white font-black text-sm uppercase tracking-wider rounded border border-sky-400 active:scale-95 transition-transform"
              >
                [QRIS]
              </button>
              <button
                type="button"
                onClick={() => {
                  if (cart.length === 0) {
                    showNotification('Keranjang order kosong!');
                    return;
                  }
                  setIsBonModalOpen(true);
                }}
                className="py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-sm uppercase tracking-wider rounded border border-amber-400 active:scale-95 transition-transform"
              >
                [CATAT BON / DP]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TAB BON WARGA & DP BOOKING                             */}
      {/* ========================================================= */}
      {activeTab === 'bon' && (
        <div className="flex-1 flex flex-col">
          <div className="p-4 bg-stone-900 border-b border-stone-800 flex justify-between items-center">
            <div>
              <span className="text-xs font-black text-stone-400 uppercase tracking-wider block">
                TOTAL PIUTANG & SISA DP BELUM LUNAS
              </span>
              <span className="text-2xl font-black text-amber-400">
                Rp {totalUnpaidBon.toLocaleString('id-ID')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setBonCustName('');
                setBonCustPhone('');
                setBonNotes('');
                setIsBonModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-black rounded text-white border"
              style={{ backgroundColor: currentMeta.color, borderColor: currentMeta.glow }}
            >
              + [CATAT BON BARU]
            </button>
          </div>

          <div className="divide-y divide-stone-800 border-b border-stone-800 bg-stone-950">
            {bonList.length === 0 ? (
              <div className="py-12 text-center text-sm font-bold text-stone-500">
                Tidak ada catatan piutang langganan atau sisa DP carter.
              </div>
            ) : (
              bonList.map((bon, idx) => {
                const isLunas = bon.status === 'lunas';
                return (
                  <div
                    key={bon.id}
                    className={`p-4 flex items-center justify-between ${isLunas ? 'opacity-60' : ''}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-white">{bon.customerName}</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            isLunas
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {isLunas ? 'LUNAS' : 'BELUM LUNAS'}
                        </span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                          {bon.type ? bon.type.toUpperCase() : 'PIUTANG'}
                        </span>
                      </div>
                      <div className="text-sm font-black text-amber-400 mt-1">
                        Rp {bon.amount.toLocaleString('id-ID')}
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5 font-semibold">
                        Tgl: {bon.date} | Jatuh Tempo: <b className="text-white">{bon.dueDate}</b>
                      </div>
                      {bon.notes && <div className="text-xs text-stone-300 mt-0.5">Rincian: {bon.notes}</div>}
                    </div>
                    <div className="flex flex-col gap-1.5 items-end ml-3">
                      {!isLunas ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleMarkBonLunas(idx)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded"
                          >
                            [LUNAS INSTAN]
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppBilling(bon)}
                            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-black rounded border border-stone-700"
                          >
                            [TAGIH WA]
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-black text-emerald-400">TERSELESAIKAN</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteBon(idx)}
                        className="text-[11px] font-black text-red-400 hover:underline mt-1"
                      >
                        [HAPUS]
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TAB REKAP & SETORAN BERSIH JURAGAN                     */}
      {/* ========================================================= */}
      {activeTab === 'rekap' && (
        <div className="flex-1 flex flex-col">
          <div className="p-4 bg-stone-900 border-b border-stone-800">
            <span className="text-xs font-black text-stone-400 uppercase tracking-wider block">
              TOTAL OMSET JASA TRANSPORTASI
            </span>
            <span className="text-2xl font-black" style={{ color: currentMeta.glow }}>
              Rp {totalOmset.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-bold text-stone-300 block mt-1">
              Estimasi Bersih Sopir / Juragan: Rp {netIncome.toLocaleString('id-ID')} ({invoices.length} Order)
            </span>
          </div>

          {/* 3 Rasio Arus Kas */}
          <div className="grid grid-cols-3 bg-stone-950 border-b border-stone-800 text-center divide-x divide-stone-800">
            <div className="p-3">
              <span className="text-[11px] font-black text-emerald-400 block">TUNAI LACI</span>
              <span className="text-sm font-black text-white mt-1 block">
                Rp {tunaiOmset.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-3">
              <span className="text-[11px] font-black text-sky-400 block">DIGITAL QRIS</span>
              <span className="text-sm font-black text-white mt-1 block">
                Rp {qrisOmset.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-3">
              <span className="text-[11px] font-black text-amber-400 block">SETORAN JURAGAN</span>
              <span className="text-sm font-black text-white mt-1 block">
                Rp {netIncome.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="p-3 bg-stone-900 border-b border-stone-800 flex justify-between items-center text-xs font-black text-stone-400">
            <span>RIWAYAT TRANSAKSI / ORDER TERAKHIR</span>
            <button
              type="button"
              onClick={() => {
                if (confirm('Hapus semua riwayat transaksi rekap?')) {
                  setInvoices([]);
                  persistState([]);
                  showNotification('Riwayat rekap armada di-reset');
                }
              }}
              className="text-red-400 hover:underline"
            >
              [RESET REKAP]
            </button>
          </div>

          <div className="divide-y divide-stone-800 border-b border-stone-800 bg-stone-950">
            {invoices.length === 0 ? (
              <div className="py-12 text-center text-sm font-bold text-stone-500">
                Belum ada riwayat transaksi transportasi hari ini.
              </div>
            ) : (
              invoices.map((inv) => (
                <div key={inv.id} className="p-3.5 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{inv.invoiceNumber}</span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                        {inv.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-1 truncate">
                      {inv.items.map((i) => `${i.name} (x${i.qty})`).join(', ')}
                    </div>
                    {inv.notes && <div className="text-[11px] text-amber-400 mt-0.5">{inv.notes}</div>}
                  </div>
                  <div className="text-right ml-2">
                    <span className="font-black text-sm text-stone-100 block">
                      Rp {inv.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TAB KATALOG TARIF                                      */}
      {/* ========================================================= */}
      {activeTab === 'katalog' && (
        <div className="flex-1 flex flex-col">
          <div className="p-3.5 bg-stone-900 border-b border-stone-800 flex justify-between items-center">
            <span className="text-xs font-black uppercase text-stone-400">
              TARIF: <b style={{ color: currentMeta.glow }}>{currentMeta.label}</b>
            </span>
            <button
              type="button"
              onClick={() => {
                setCatSubcat(activeSubcat);
                setIsAddCatalogModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-black rounded text-white tracking-wider"
              style={{ backgroundColor: currentMeta.color }}
            >
              + [TAMBAH TARIF/PAKET]
            </button>
          </div>

          <div className="divide-y divide-stone-800 border-b border-stone-800 bg-stone-950">
            {catalog.filter((c) => c.category === activeSubcat).length === 0 ? (
              <div className="py-12 text-center text-sm font-bold text-stone-500">
                Belum ada tarif/layanan di sub-kategori ini.
              </div>
            ) : (
              catalog
                .filter((c) => c.category === activeSubcat)
                .map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-sm text-white">{item.name}</div>
                      <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5 font-bold">
                        <span style={{ color: currentMeta.glow }}>
                          Tarif: Rp {item.price.toLocaleString('id-ID')} / {item.unit}
                        </span>
                        <span>Est. Ops/BBM: Rp {(item.operasional || 0).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-black rounded border border-stone-700"
                      >
                        [+ AMBIL]
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = catalog.filter((c) => c.id !== item.id);
                          setCatalog(updated);
                          persistState(invoices, bonList, updated);
                          showNotification('Tarif dihapus dari katalog');
                        }}
                        className="text-xs font-black text-red-400 hover:underline ml-1"
                      >
                        [HAPUS]
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. TAB PENGATURAN & PRATINJAU STRUK DUMMY                 */}
      {/* ========================================================= */}
      {activeTab === 'pengaturan' && (
        <div className="flex-1 flex flex-col space-y-4 p-4">
          <div className="bg-stone-900 border border-stone-800 p-3.5 rounded space-y-3">
            <span className="text-xs font-black text-stone-400 uppercase tracking-wider block">
              PILIH SUB-KATEGORI AKTIF:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(SUBCATEGORIES) as TransportasiSubCategory[]).map((key) => {
                const sub = SUBCATEGORIES[key];
                const isActive = activeSubcat === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActiveSubcat(key);
                      persistState(invoices, bonList, catalog, armadaProfile, key);
                      showNotification(`Beralih ke: ${sub.name}`);
                    }}
                    className={`p-2.5 text-xs font-black uppercase rounded text-left border tracking-wider transition-all ${
                      isActive
                        ? 'text-white shadow-md'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:bg-stone-900'
                    }`}
                    style={isActive ? { backgroundColor: sub.color, borderColor: sub.glow } : {}}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-stone-900 border border-stone-800 p-3.5 rounded space-y-3">
            <span className="text-xs font-black text-stone-400 uppercase tracking-wider block">
              PROFIL ARMADA & HEADER STRUK
            </span>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400">NAMA USAHA / POOL ARMADA</label>
              <input
                type="text"
                value={armadaProfile.name}
                onChange={(e) => setArmadaProfile({ ...armadaProfile, name: e.target.value })}
                onBlur={() => persistState(invoices, bonList, catalog, armadaProfile)}
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400">ALAMAT PANGKALAN / POOL</label>
              <input
                type="text"
                value={armadaProfile.address}
                onChange={(e) => setArmadaProfile({ ...armadaProfile, address: e.target.value })}
                onBlur={() => persistState(invoices, bonList, catalog, armadaProfile)}
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400">NO. WHATSAPP DISPATCHER</label>
              <input
                type="text"
                value={armadaProfile.phone}
                onChange={(e) => setArmadaProfile({ ...armadaProfile, phone: e.target.value })}
                onBlur={() => persistState(invoices, bonList, catalog, armadaProfile)}
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400">FOOTER / PESAN KETENTUAN</label>
              <input
                type="text"
                value={armadaProfile.footer}
                onChange={(e) => setArmadaProfile({ ...armadaProfile, footer: e.target.value })}
                onBlur={() => persistState(invoices, bonList, catalog, armadaProfile)}
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>
          </div>

          {/* THERMAL RECEIPT PREVIEW (PRATINJAU STRUK CETAK DUMMY) */}
          <div className="bg-black border border-stone-800 p-4 rounded space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-stone-400">
                PRATINJAU STRUK NOTA ({currentMeta.label})
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-2.5 py-1 text-xs font-black rounded text-white"
                style={{ backgroundColor: currentMeta.color }}
              >
                [CETAK NOTA]
              </button>
            </div>

            <div
              className="bg-white text-black p-4 rounded shadow font-mono text-xs max-w-sm mx-auto"
              style={{ lineHeight: 1.4 }}
            >
              <div className="text-center pb-2 border-b border-dashed border-stone-600 mb-2">
                <div className="font-black text-sm">{armadaProfile.name.toUpperCase()}</div>
                <div className="text-[11px]">{armadaProfile.address}</div>
                <div className="text-[11px]">WA: {armadaProfile.phone}</div>
                <div className="text-[10px] mt-1 font-bold">*** {currentMeta.label} ***</div>
              </div>

              <div className="flex justify-between text-[11px] mb-1">
                <span>No: #TRIP-DEMO-001</span>
                <span>23/10 14:30</span>
              </div>
              <div className="flex justify-between text-[11px] pb-1.5 border-b border-dashed border-stone-600">
                <span>Driver: {currentUser.name}</span>
                <span>Pelanggan: Warga RT</span>
              </div>

              <div className="py-2 space-y-1.5">
                {currentMeta.dummyItems.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between font-bold">
                      <span>{item.name}</span>
                      <span>Rp {item.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="text-[11px] text-stone-600">
                      x{item.qty} {item.spec ? `| ${item.spec}` : ''}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-stone-600 pt-1.5 space-y-0.5">
                <div className="flex justify-between font-black text-sm">
                  <span>TOTAL:</span>
                  <span>
                    Rp{' '}
                    {currentMeta.dummyItems
                      .reduce((s, it) => s + it.price, 0)
                      .toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>BAYAR (TUNAI):</span>
                  <span>
                    Rp{' '}
                    {(
                      currentMeta.dummyItems.reduce((s, it) => s + it.price, 0) + 25000
                    ).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>KEMBALI:</span>
                  <span>Rp 25.000</span>
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-dotted border-stone-400 text-[11px]">
                <div className="font-bold text-[10px] uppercase">
                  KETENTUAN KHUSUS {currentMeta.label}:
                </div>
                <div>{currentMeta.specialNote}</div>
              </div>

              <div className="text-center pt-2 mt-2 border-t border-dashed border-stone-600 text-[11px]">
                <div>{armadaProfile.footer}</div>
                <div className="text-[10px] text-stone-500 mt-1">
                  Powered by TransportasiQu Offline-First
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5 BOTTOM NAVIGATION BAR                                   */}
      {/* ========================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-stone-950 border-t border-stone-800 grid grid-cols-5 text-center">
        {(
          [
            { id: 'kasir', label: '[KASIR]' },
            { id: 'bon', label: '[BON]' },
            { id: 'rekap', label: '[REKAP]' },
            { id: 'katalog', label: '[KATALOG]' },
            { id: 'pengaturan', label: '[PENGATURAN]' },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                isActive
                  ? 'text-white bg-stone-900 border-t-2'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              style={isActive ? { borderTopColor: currentMeta.color } : {}}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ========================================================= */}
      {/* MODALS                                                    */}
      {/* ========================================================= */}

      {/* Modal 1: Catat Bon / DP Booking */}
      {isBonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full max-w-md bg-stone-900 border-t-2 border-amber-500 p-4 space-y-3 rounded-t-lg">
            <div className="flex justify-between items-center">
              <span className="font-black text-base text-amber-400 uppercase">
                CATAT PIUTANG / DP BOOKING
              </span>
              <button
                type="button"
                onClick={() => setIsBonModalOpen(false)}
                className="text-xs font-black text-stone-400 hover:text-white"
              >
                [TUTUP]
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">
                NAMA PENUMPANG / PEMESAN
              </label>
              <input
                type="text"
                value={bonCustName}
                onChange={(e) => setBonCustName(e.target.value)}
                placeholder="Contoh: Pak RT / Bu Dewi"
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">
                NO. WHATSAPP (PENAGIHAN)
              </label>
              <input
                type="tel"
                value={bonCustPhone}
                onChange={(e) => setBonCustPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">
                TANGGAL JATUH TEMPO / BERANGKAT
              </label>
              <input
                type="date"
                value={bonDueDate}
                onChange={(e) => setBonDueDate(e.target.value)}
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">
                STATUS CATATAN
              </label>
              <select
                value={bonType}
                onChange={(e) => setBonType(e.target.value as any)}
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              >
                <option value="piutang">Piutang Langganan (Bayar Nanti)</option>
                <option value="dp_booking">DP / Uang Muka Booking Carter</option>
                <option value="talangan">Talangan Belanja Jastip</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">CATATAN KHUSUS</label>
              <input
                type="text"
                value={bonNotes}
                onChange={(e) => setBonNotes(e.target.value)}
                placeholder="Rute atau sisa pelunasan"
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-black text-stone-300">TOTAL NOMINAL:</span>
              <span className="text-xl font-black text-amber-400">
                Rp {totalCart.toLocaleString('id-ID')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleConfirmCatatBon}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-sm uppercase rounded tracking-wider"
            >
              [SIMPAN BON / BOOKING]
            </button>
          </div>
        </div>
      )}

      {/* Modal 2: Input Manual Order */}
      {isCustomOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end justify-center">
          <div
            className="w-full max-w-md bg-stone-900 border-t-2 p-4 space-y-3 rounded-t-lg"
            style={{ borderColor: currentMeta.glow }}
          >
            <div className="flex justify-between items-center">
              <span className="font-black text-base text-white uppercase">INPUT ORDER MANUAL</span>
              <button
                type="button"
                onClick={() => setIsCustomOrderModalOpen(false)}
                className="text-xs font-black text-stone-400 hover:text-white"
              >
                [BATAL]
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">
                NAMA LAYANAN / RUTE
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nama order"
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-stone-400 uppercase">TARIF (RP)</label>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="0"
                  className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-stone-400 uppercase">JUMLAH (QTY)</label>
                <input
                  type="number"
                  value={customQty}
                  onChange={(e) => setCustomQty(e.target.value)}
                  className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">CATATAN KHUSUS</label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Titik jemput, nama rombongan, dsb"
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirmCustomOrder}
              className="w-full py-2.5 text-white font-black text-sm uppercase rounded tracking-wider"
              style={{ backgroundColor: currentMeta.color }}
            >
              [MASUKKAN KE ORDER]
            </button>
          </div>
        </div>
      )}

      {/* Modal 3: Add Catalog Item */}
      {isAddCatalogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end justify-center">
          <div
            className="w-full max-w-md bg-stone-900 border-t-2 p-4 space-y-3 rounded-t-lg"
            style={{ borderColor: currentMeta.glow }}
          >
            <div className="flex justify-between items-center">
              <span className="font-black text-base text-white uppercase">TAMBAH KE DAFTAR TARIF</span>
              <button
                type="button"
                onClick={() => setIsAddCatalogModalOpen(false)}
                className="text-xs font-black text-stone-400 hover:text-white"
              >
                [BATAL]
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">SUB-KATEGORI</label>
              <select
                value={catSubcat}
                onChange={(e) => setCatSubcat(e.target.value as TransportasiSubCategory)}
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              >
                {(Object.keys(SUBCATEGORIES) as TransportasiSubCategory[]).map((k) => (
                  <option key={k} value={k}>
                    {SUBCATEGORIES[k].name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">NAMA LAYANAN</label>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Misal: Trayek Stasiun"
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-stone-400 uppercase">TARIF (RP)</label>
                <input
                  type="number"
                  value={catPrice}
                  onChange={(e) => setCatPrice(e.target.value)}
                  placeholder="0"
                  className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-stone-400 uppercase">
                  EST. OPERASIONAL/BBM
                </label>
                <input
                  type="number"
                  value={catBbm}
                  onChange={(e) => setCatBbm(e.target.value)}
                  placeholder="0"
                  className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">SATUAN</label>
              <input
                type="text"
                value={catUnit}
                onChange={(e) => setCatUnit(e.target.value)}
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirmAddCatalog}
              className="w-full py-2.5 text-white font-black text-sm uppercase rounded tracking-wider"
              style={{ backgroundColor: currentMeta.color }}
            >
              [SIMPAN KE DAFTAR TARIF]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
