import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';

interface PelayananQuViewProps {
  currentUser: UserProfile;
  onBackToAppQu: () => void;
  showNotification: (msg: string) => void;
}

interface PresetItem {
  id: string;
  name: string;
  price: number;
  modal: number;
  unit: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  modal: number;
  unit: string;
  note?: string;
}

interface BonItem {
  id: string;
  customerName: string;
  phone: string;
  amount: number;
  date: string;
  dueDate: string;
  notes: string;
  status: 'belum_lunas' | 'lunas';
  type: string;
}

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  date: string;
  subcat: string;
  customerName: string;
  total: number;
  method: 'tunai' | 'qris' | 'bon';
  items: CartItem[];
  notes?: string;
}

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
  modal: number;
  unit: string;
}

interface SubCatDef {
  id: string;
  name: string;
  color: string;
  glow: string;
  label: string;
  presets: PresetItem[];
  dummyReceiptItems: { name: string; qty: number; price: number; spec?: string }[];
  specialNote: string;
}

const SUBCATEGORIES: Record<string, SubCatDef> = {
  servis: {
    id: 'servis',
    name: 'Servis & Bengkel',
    color: '#ea580c', // Merah Oranye
    glow: '#f97316',
    label: 'SERVIS & BENGKEL',
    presets: [
      { id: 'sv-1', name: 'Jasa Servis Rutin / Ganti Oli', price: 35000, modal: 5000, unit: 'Unit' },
      { id: 'sv-2', name: 'Jasa Tune Up Karburator / Injeksi', price: 50000, modal: 8000, unit: 'Unit' },
      { id: 'sv-3', name: 'Oli Mesin 0.8L MPX / Castrol', price: 52000, modal: 42000, unit: 'Botol' },
      { id: 'sv-4', name: 'Busi Standar Racing NGK/Denso', price: 25000, modal: 18000, unit: 'Pcs' },
      { id: 'sv-5', name: 'Kampas Rem Depan / Belakang', price: 45000, modal: 32000, unit: 'Set' }
    ],
    dummyReceiptItems: [
      { name: 'Jasa Servis Mesin Pompa Air', qty: 1, price: 45000, spec: 'Pengecekan Dinamo & Kapasitor' },
      { name: 'Sparepart: Seal Karet & Kapasitor 12uF', qty: 1, price: 40000, spec: 'Kapasitor Original Shizuki' }
    ],
    specialNote: 'Status Unit: [SELESAI - BISA DIAMBIL]. Garansi Servis 14 Hari (Klaim wajib sertakan struk ini).'
  },
  barber: {
    id: 'barber',
    name: 'Barbershop & Salon',
    color: '#a21caf', // Ungu Magenta
    glow: '#e879f9',
    label: 'BARBERSHOP & SALON',
    presets: [
      { id: 'bb-1', name: 'Potong Rambut Dewasa + Pijat Ringan', price: 25000, modal: 2000, unit: 'Kepala' },
      { id: 'bb-2', name: 'Cukur Anak / Balita', price: 20000, modal: 1000, unit: 'Anak' },
      { id: 'bb-3', name: 'Paket Komplit: Cukur + Wash + Pomade', price: 35000, modal: 5000, unit: 'Paket' },
      { id: 'bb-4', name: 'Semir Hitam / Pewarnaan Rambut', price: 50000, modal: 22000, unit: 'Orang' },
      { id: 'bb-5', name: 'Cukur Jenggot & Kumis (Hot Towel)', price: 15000, modal: 2000, unit: 'Orang' }
    ],
    dummyReceiptItems: [
      { name: 'Paket Komplit: Cukur + Wash + Styling', qty: 1, price: 35000, spec: 'Kapster: Bro Dani | Kursi 2' },
      { name: 'Semir Hitam Uban Natural', qty: 1, price: 50000, spec: 'Cat Rambut Herbal' }
    ],
    specialNote: 'Kapster: Bro Dani (Komisi Tercatat). Terima kasih telah mempercayakan penampilan Anda pada kami!'
  },
  laundry: {
    id: 'laundry',
    name: 'Laundry & Cuci',
    color: '#0284c7', // Biru Laut
    glow: '#38bdf8',
    label: 'LAUNDRY & CUCI',
    presets: [
      { id: 'ld-1', name: 'Cuci Komplit Reguler 2 Hari (Per Kg)', price: 7000, modal: 1500, unit: 'Kg' },
      { id: 'ld-2', name: 'Cuci Komplit Express 1 Hari (Per Kg)', price: 10000, modal: 2000, unit: 'Kg' },
      { id: 'ld-3', name: 'Cuci Kering Lipat Saja (Per Kg)', price: 5000, modal: 1000, unit: 'Kg' },
      { id: 'ld-4', name: 'Cuci Bedcover Besar / Sprei Tebal', price: 25000, modal: 6000, unit: 'Pcs' },
      { id: 'ld-5', name: 'Cuci Sepatu Sneaker Deep Clean', price: 30000, modal: 5000, unit: 'Pasang' }
    ],
    dummyReceiptItems: [
      { name: 'Cuci Komplit Reguler (4.5 Kg)', qty: 1, price: 31500, spec: 'Nomor Rak Cuci: [RAK B-07] | 4.5 Kg x Rp 7.000' },
      { name: 'Cuci Bedcover King Size', qty: 1, price: 25000, spec: 'Parfum Sakura Premium' }
    ],
    specialNote: 'Nomor Rak Cuci: [RAK B-07]. Estimasi Selesai: 2 Hari. Komplain kehilangan maks. 1x24 jam setelah ambil.'
  },
  penjahit: {
    id: 'penjahit',
    name: 'Penjahit & Permak',
    color: '#0f766e', // Teal / Hijau Toska
    glow: '#14b8a6',
    label: 'PENJAHIT & PERMAK',
    presets: [
      { id: 'pj-1', name: 'Potong Celana Jeans / Chino (Kelim)', price: 15000, modal: 1500, unit: 'Pcs' },
      { id: 'pj-2', name: 'Kecilkan Pinggang / Pasang Karet', price: 20000, modal: 2000, unit: 'Pcs' },
      { id: 'pj-3', name: 'Ganti Resleting Jeans Besi YKK', price: 25000, modal: 8000, unit: 'Pcs' },
      { id: 'pj-4', name: 'Jahit Baju Gamis / Kemeja Baru', price: 120000, modal: 25000, unit: 'Potong' },
      { id: 'pj-5', name: 'Permak Jas Formal / Kebaya Pesta', price: 65000, modal: 10000, unit: 'Pcs' }
    ],
    dummyReceiptItems: [
      { name: 'Permak 2 Celana Jeans (Potong + Kecilkan)', qty: 2, price: 70000, spec: 'Ukuran Lingkar 32 -> 30' }
    ],
    specialNote: 'Status: DP Rp 30.000 Masuk. Sisa Pelunasan: Rp 40.000. Estimasi Jadi: 26 Oktober 2026.'
  },
  rental: {
    id: 'rental',
    name: 'Rental & Sewa',
    color: '#d97706', // Kuning Emas / Amber
    glow: '#f59e0b',
    label: 'RENTAL & SEWA',
    presets: [
      { id: 'rt-1', name: 'Sewa Tenda Terop & Kursi (Per Hari)', price: 150000, modal: 20000, unit: 'Set' },
      { id: 'rt-2', name: 'Sewa Sound System Portable + Mic', price: 100000, modal: 15000, unit: 'Hari' },
      { id: 'rt-3', name: 'Sewa Mesin Cuci Steam / Steam Motor', price: 50000, modal: 8000, unit: 'Hari' },
      { id: 'rt-4', name: 'Sewa Proyektor + Layar Screen', price: 120000, modal: 20000, unit: 'Hari' },
      { id: 'rt-5', name: 'Sewa Genset 2000 Watt', price: 175000, modal: 35000, unit: 'Hari' }
    ],
    dummyReceiptItems: [
      { name: 'Sewa Sound System Portable (2 Hari)', qty: 2, price: 200000, spec: 'Jaminan: KTP Asli Pak Supri (RT 04)' }
    ],
    specialNote: 'Jaminan Identitas: KTP Asli Diserahkan. Kerusakan/kehilangan komponen unit ditanggung penyewa.'
  },
  tukang: {
    id: 'tukang',
    name: 'Jasa Panggilan & Tukang',
    color: '#854d0e', // Cokelat Warm
    glow: '#b45309',
    label: 'JASA PANGGILAN & TUKANG',
    presets: [
      { id: 'tk-1', name: 'Cuci AC Split 1/2 PK - 1 PK (Per Unit)', price: 65000, modal: 12000, unit: 'Unit' },
      { id: 'tk-2', name: 'Tambah Freon R32 / R410', price: 120000, modal: 45000, unit: 'Unit' },
      { id: 'tk-3', name: 'Jasa Perbaikan Saluran Kran Bocor / Pipa', price: 75000, modal: 15000, unit: 'Titik' },
      { id: 'tk-4', name: 'Jasa Tukang Bangunan Harian (Borongan)', price: 150000, modal: 0, unit: 'Hari' },
      { id: 'tk-5', name: 'Instalasi Jalur Kelistrikan Baru', price: 85000, modal: 20000, unit: 'Titik' }
    ],
    dummyReceiptItems: [
      { name: 'Cuci AC Split 1 PK (2 Unit)', qty: 2, price: 130000, spec: 'Kamar Utama + Ruang Tamu' },
      { name: 'Isi Ulang Freon R32', qty: 1, price: 120000, spec: 'Outdoor Dingin Optimal' }
    ],
    specialNote: 'Rincian Invoice Kerja Panggilan AC. Garansi dingin 30 hari. Silakan simpan invoice digital ini.'
  }
};

const STORAGE_KEY = 'pelayananqu_6sub_v1';

export const PelayananQuView: React.FC<PelayananQuViewProps> = ({
  currentUser,
  onBackToAppQu,
  showNotification,
}) => {
  // Navigation Tab: 'kasir' | 'bon' | 'rekap' | 'katalog' | 'pengaturan'
  const [activeTab, setActiveTab] = useState<'kasir' | 'bon' | 'rekap' | 'katalog' | 'pengaturan'>('kasir');
  const [activeSubcat, setActiveSubcat] = useState<string>('servis');

  // Business profile
  const [businessProfile, setBusinessProfile] = useState({
    name: 'PelayananQu - Jasa & Servis Warga RT 04',
    address: 'Jl. Swadaya No. 88 Pos RT 04 / RW 02',
    phone: '0813-8899-7711',
    footer: 'Garansi berlaku dengan membawa struk ini. Terima kasih!',
  });

  // Cart & Orders
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [bonList, setBonList] = useState<BonItem[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);

  // Sub-Category Specialized Toolstrip States
  // 1. Servis
  const [servisJasa, setServisJasa] = useState(45000);
  const [servisPart, setServisPart] = useState(40000);
  const [servisStatus, setServisStatus] = useState<'Dalam Proses' | 'Bisa Diambil' | 'Selesai'>('Bisa Diambil');
  const [servisWarranty, setServisWarranty] = useState('Garansi 14 Hari');
  const [servisUnitDesc, setServisUnitDesc] = useState('');

  // 2. Barber
  const [barberKapster, setBarberKapster] = useState('Dani');

  // 3. Laundry
  const [laundryWeight, setLaundryWeight] = useState(4.5);
  const [laundrySpeed, setLaundrySpeed] = useState<'Reguler' | 'Express'>('Reguler');
  const [laundryRack, setLaundryRack] = useState('B-07');

  // 4. Penjahit
  const [penjahitTotalCost, setPenjahitTotalCost] = useState(70000);
  const [penjahitDp, setPenjahitDp] = useState(30000);
  const [penjahitDueDate, setPenjahitDueDate] = useState('');
  const [penjahitNote, setPenjahitNote] = useState('');

  // 5. Rental
  const [rentalDuration, setRentalDuration] = useState(1);
  const [rentalDurationType, setRentalDurationType] = useState<'Hari' | 'Jam'>('Hari');
  const [rentalIdCard, setRentalIdCard] = useState('KTP Asli');
  const [rentalItemName, setRentalItemName] = useState('Sound System Portable');

  // 6. Tukang
  const [tukangJobDesc, setTukangJobDesc] = useState('Cuci AC Split + Freon');
  const [tukangUnitCount, setTukangUnitCount] = useState(2);
  const [tukangUnitRate, setTukangUnitRate] = useState(65000);

  // New Bon Modal
  const [isBonModalOpen, setIsBonModalOpen] = useState(false);
  const [newBonCust, setNewBonCust] = useState('');
  const [newBonPhone, setNewBonPhone] = useState('');
  const [newBonAmount, setNewBonAmount] = useState(50000);
  const [newBonDueDate, setNewBonDueDate] = useState('');
  const [newBonNotes, setNewBonNotes] = useState('');

  // New Catalog Modal
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatPrice, setNewCatPrice] = useState(25000);
  const [newCatModal, setNewCatModal] = useState(5000);
  const [newCatUnit, setNewCatUnit] = useState('Pcs');

  // Initialize and load data from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeSubcat) setActiveSubcat(parsed.activeSubcat);
        if (parsed.cart) setCart(parsed.cart);
        if (parsed.invoices) setInvoices(parsed.invoices);
        if (parsed.bonList) setBonList(parsed.bonList);
        if (parsed.catalog && parsed.catalog.length > 0) setCatalog(parsed.catalog);
        if (parsed.businessProfile) setBusinessProfile(parsed.businessProfile);
      } else {
        // Seed initial catalog
        const initialCat: CatalogItem[] = [];
        Object.keys(SUBCATEGORIES).forEach((k) => {
          SUBCATEGORIES[k].presets.forEach((p) => {
            initialCat.push({
              id: p.id,
              name: p.name,
              category: k,
              price: p.price,
              modal: p.modal,
              unit: p.unit,
            });
          });
        });
        setCatalog(initialCat);

        // Seed initial Bon / DP
        setBonList([
          {
            id: 'bon-1',
            customerName: 'Pak Hadi (RT 04)',
            phone: '081298765432',
            amount: 40000,
            date: '2026-10-22',
            dueDate: '2026-10-29',
            notes: 'Sisa Pelunasan Servis Pompa Air & Ganti Seal',
            status: 'belum_lunas',
            type: 'piutang',
          },
          {
            id: 'bon-2',
            customerName: 'Bu RT Endang',
            phone: '081345678910',
            amount: 40000,
            date: '2026-10-21',
            dueDate: '2026-10-26',
            notes: 'Sisa Pelunasan Permak Gamis Pesta (DP 30k Lunas)',
            status: 'belum_lunas',
            type: 'permak',
          },
        ]);
      }
    } catch (e) {
      console.error('Error loading PelayananQu storage', e);
    }
  }, []);

  // Save to LocalStorage whenever critical states change
  useEffect(() => {
    try {
      const payload = {
        activeSubcat,
        cart,
        invoices,
        bonList,
        catalog,
        businessProfile,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Error saving PelayananQu storage', e);
    }
  }, [activeSubcat, cart, invoices, bonList, catalog, businessProfile]);

  const currentSub = SUBCATEGORIES[activeSubcat] || SUBCATEGORIES.servis;

  // Cart helpers
  const addToCart = (item: { id: string; name: string; price: number; modal: number; unit: string; note?: string }) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.name === item.name && p.note === item.note);
      if (existing) {
        return prev.map((p) =>
          p.id === existing.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [
        ...prev,
        {
          id: `${item.id}-${Date.now()}`,
          name: item.name,
          price: item.price,
          qty: 1,
          modal: item.modal,
          unit: item.unit,
          note: item.note,
        },
      ];
    });
    showNotification(`+ Ditambahkan: ${item.name}`);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Quick Action checkout
  const handleCheckout = (method: 'tunai' | 'qris' | 'bon') => {
    if (cart.length === 0) {
      showNotification('Keranjang kosong! Silakan pilih layanan terlebih dahulu.');
      return;
    }

    const invNo = `INV-PL-${Date.now().toString().slice(-6)}`;
    const cust = customerName.trim() || 'Pelanggan Walk-In';

    const newInvoice: InvoiceItem = {
      id: `inv-${Date.now()}`,
      invoiceNo: invNo,
      date: new Date().toISOString().split('T')[0],
      subcat: activeSubcat,
      customerName: cust,
      total: cartTotal,
      method,
      items: [...cart],
      notes: `Layanan: ${currentSub.name}`,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // If method is BON, automatically register into bonList
    if (method === 'bon') {
      const newBon: BonItem = {
        id: `bon-${Date.now()}`,
        customerName: cust,
        phone: customerPhone.trim(),
        amount: cartTotal,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        notes: `Bon Layanan [${currentSub.label}]: ${cart.map((c) => c.name).join(', ')}`,
        status: 'belum_lunas',
        type: activeSubcat,
      };
      setBonList((prev) => [newBon, ...prev]);
      showNotification(`Transaksi berhasil dicatat ke BON Piutang (${cust})`);
    } else {
      showNotification(`Pembayaran [${method.toUpperCase()}] Rp ${cartTotal.toLocaleString()} berhasil!`);
    }

    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
  };

  // Specialized Toolstrip Actions
  const handleAddServisTicket = () => {
    const total = (servisJasa || 0) + (servisPart || 0);
    addToCart({
      id: 'sv-tkt',
      name: `Servis Unit ${servisUnitDesc ? `(${servisUnitDesc})` : ''}`,
      price: total,
      modal: servisPart || 0,
      unit: 'Tiket',
      note: `Jasa Rp ${(servisJasa || 0).toLocaleString()} + Part Rp ${(servisPart || 0).toLocaleString()} [${servisWarranty}] [STATUS: ${servisStatus.toUpperCase()}]`,
    });
  };

  const handleAddBarberQuick = (name: string, price: number, modal: number) => {
    addToCart({
      id: 'bb-qk',
      name,
      price,
      modal,
      unit: 'Orang',
      note: `Kapster: ${barberKapster} (Komisi Tercatat)`,
    });
  };

  const handleAddLaundryCucian = () => {
    const kg = laundryWeight || 1;
    const rate = laundrySpeed === 'Express' ? 10000 : 7000;
    const total = Math.round(kg * rate);
    const rack = laundryRack || 'A-01';
    addToCart({
      id: 'ld-cuci',
      name: `Laundry Kiloan (${laundrySpeed}) ${kg} Kg`,
      price: total,
      modal: Math.round(total * 0.2),
      unit: 'Nota',
      note: `Nomor Rak Cuci: [RAK ${rack}] | ${kg} Kg @ Rp ${rate.toLocaleString()}`,
    });
  };

  const handleAddPenjahitOrder = () => {
    const sisa = Math.max(0, penjahitTotalCost - penjahitDp);
    addToCart({
      id: 'pj-tkt',
      name: `Permak Pakaian: ${penjahitNote || 'Kelim / Fitting'}`,
      price: penjahitTotalCost,
      modal: Math.round(penjahitTotalCost * 0.15),
      unit: 'Nota',
      note: `DP Rp ${penjahitDp.toLocaleString()} | Sisa Pelunasan: Rp ${sisa.toLocaleString()} | Est. Jadi: ${penjahitDueDate || '3 Hari'}`,
    });
  };

  const handleAddRentalBooking = () => {
    const ratePerUnit = 100000;
    const total = ratePerUnit * (rentalDuration || 1);
    addToCart({
      id: 'rt-tkt',
      name: `Sewa: ${rentalItemName || 'Unit Alat'} (${rentalDuration} ${rentalDurationType})`,
      price: total,
      modal: 10000,
      unit: 'Sewa',
      note: `Jaminan: ${rentalIdCard || 'KTP Asli Diserahkan'} | Cek Fisik Unit Saat Kembali`,
    });
  };

  const handleAddTukangJob = () => {
    const rate = tukangUnitRate || 65000;
    const count = tukangUnitCount || 1;
    const total = rate * count;
    addToCart({
      id: 'tk-tkt',
      name: `Jasa Panggilan: ${tukangJobDesc || 'Perbaikan Unit'} (${count} Titik)`,
      price: total,
      modal: Math.round(total * 0.1),
      unit: 'Pekerjaan',
      note: `${count} Titik/Unit @ Rp ${rate.toLocaleString()} | Rincian Siap Kirim WA`,
    });
  };

  // WhatsApp Billing Handler
  const handleSendWhatsApp = (bon: BonItem) => {
    let rawPhone = bon.phone.replace(/[^0-9]/g, '');
    if (rawPhone.startsWith('0')) {
      rawPhone = '62' + rawPhone.slice(1);
    }
    if (!rawPhone) rawPhone = '628123456789';

    const msg = encodeURIComponent(
      `Halo Kak *${bon.customerName}*,\n\n` +
      `Kami dari *${businessProfile.name}* menginformasikan catatan layanan:\n` +
      `• Keterangan: *${bon.notes}*\n` +
      `• Nominal Tagihan: *Rp ${bon.amount.toLocaleString()}*\n` +
      `• Jatuh Tempo: *${bon.dueDate || 'Segera'}*\n\n` +
      `Silakan konfirmasi jika telah melakukan transfer/pembayaran di kasir. Terima kasih banyak! 🙏`
    );

    window.open(`https://wa.me/${rawPhone}?text=${msg}`, '_blank');
  };

  // Mark Bon Lunas
  const handleMarkBonLunas = (id: string) => {
    setBonList((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'lunas' } : b))
    );
    showNotification('Catatan bon telah ditandai LUNAS!');
  };

  // Rekap Calculations
  const totalTunai = invoices
    .filter((inv) => inv.method === 'tunai')
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalQris = invoices
    .filter((inv) => inv.method === 'qris')
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalBon = bonList
    .filter((b) => b.status === 'belum_lunas')
    .reduce((sum, b) => sum + b.amount, 0);

  const grandTotalOmset = totalTunai + totalQris;

  // Add Item to Catalog
  const handleAddCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newItem: CatalogItem = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      category: activeSubcat,
      price: Number(newCatPrice) || 0,
      modal: Number(newCatModal) || 0,
      unit: newCatUnit.trim() || 'Unit',
    };

    setCatalog((prev) => [newItem, ...prev]);
    setIsCatalogModalOpen(false);
    setNewCatName('');
    showNotification(`Layanan "${newItem.name}" ditambahkan ke katalog.`);
  };

  // Filter Catalog by active sub-category
  const activeCatalog = catalog.filter((c) => c.category === activeSubcat);

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a] text-white min-h-screen relative font-sans overflow-x-hidden pb-20 select-none">
      {/* ============================================================ */}
      {/* COLOR-CODED DYNAMIC HEADER                                  */}
      {/* ============================================================ */}
      <header
        className="sticky top-0 z-40 px-3.5 py-2.5 shadow-md transition-colors duration-300"
        style={{ backgroundColor: currentSub.color }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToAppQu}
              className="px-2 py-1 rounded bg-black/30 hover:bg-black/50 text-white font-black text-xs cursor-pointer tracking-wider"
            >
              [← APPQU]
            </button>
            <span className="font-black text-base tracking-tight text-white uppercase">
              PELAYANANQU
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/40 text-white tracking-widest">
              {currentSub.label}
            </span>
          </div>

          <a
            href="/pelayananqu.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-black uppercase tracking-wider text-black bg-white px-2.5 py-1 rounded hover:bg-stone-200 transition"
          >
            [OFFLINE FILE]
          </a>
        </div>

        {/* 6 Sub-Categories Scrollbar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 pb-0.5">
          {Object.keys(SUBCATEGORIES).map((key) => {
            const sub = SUBCATEGORIES[key];
            const isActive = activeSubcat === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveSubcat(key);
                  showNotification(`Beralih ke: ${sub.name}`);
                }}
                className={`px-2.5 py-1 text-[11px] font-black uppercase whitespace-nowrap rounded border transition cursor-pointer ${
                  isActive
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-black/25 text-white/90 border-white/30 hover:bg-black/40'
                }`}
              >
                [{sub.name.toUpperCase()}]
              </button>
            );
          })}
        </div>
      </header>

      {/* ============================================================ */}
      {/* VIEW: KASIR                                                  */}
      {/* ============================================================ */}
      {activeTab === 'kasir' && (
        <div className="flex-1 flex flex-col">
          {/* Specialized Calculator / Toolstrip according to 6 Sub-Categories */}
          <div className="bg-[#121212] border-b border-[#27272a] p-3 space-y-2">
            {/* 1. SERVIS & BENGKEL */}
            {activeSubcat === 'servis' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black">
                  <span style={{ color: currentSub.glow }}>
                    BIAYA JASA VS SPAREPART & GARANSI
                  </span>
                  <div className="flex items-center gap-1">
                    {(['Dalam Proses', 'Bisa Diambil', 'Selesai'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setServisStatus(st)}
                        className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                          servisStatus === st
                            ? 'bg-[#ea580c] text-white border-[#f97316]'
                            : 'bg-[#18181b] text-stone-400 border-[#27272a]'
                        }`}
                      >
                        [{st.toUpperCase()}]
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 block mb-0.5">
                      BIAYA JASA (RP)
                    </label>
                    <input
                      type="number"
                      value={servisJasa}
                      onChange={(e) => setServisJasa(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 block mb-0.5">
                      SPAREPART (RP)
                    </label>
                    <input
                      type="number"
                      value={servisPart}
                      onChange={(e) => setServisPart(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Deskripsi Unit (Misal: Pompa Air Shimizu / Motor Beat)"
                    value={servisUnitDesc}
                    onChange={(e) => setServisUnitDesc(e.target.value)}
                    className="flex-1 bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
                  />
                  <select
                    value={servisWarranty}
                    onChange={(e) => setServisWarranty(e.target.value)}
                    className="bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
                  >
                    <option value="Garansi 7 Hari">Garansi 7 Hari</option>
                    <option value="Garansi 14 Hari">Garansi 14 Hari</option>
                    <option value="Garansi 1 Bulan">Garansi 1 Bulan</option>
                    <option value="Non Garansi">Non Garansi</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddServisTicket}
                    className="px-3 py-2 rounded bg-[#ea580c] hover:bg-[#c2410c] text-white font-black text-xs whitespace-nowrap cursor-pointer"
                  >
                    [+ TIKET SERVIS]
                  </button>
                </div>
              </div>
            )}

            {/* 2. BARBERSHOP & SALON */}
            {activeSubcat === 'barber' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black">
                  <span style={{ color: currentSub.glow }}>
                    PILIH KAPSTER / TERAPIS (REKAP KOMISI)
                  </span>
                  <div className="flex items-center gap-1">
                    {['Dani', 'Agus', 'Bayu'].map((kp) => (
                      <button
                        key={kp}
                        type="button"
                        onClick={() => setBarberKapster(kp)}
                        className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                          barberKapster === kp
                            ? 'bg-[#a21caf] text-white border-[#e879f9]'
                            : 'bg-[#18181b] text-stone-400 border-[#27272a]'
                        }`}
                      >
                        [KAPSTER: {kp}]
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => handleAddBarberQuick('Cukur Dewasa', 25000, 2000)}
                    className="px-2.5 py-1.5 rounded bg-[#a21caf] text-white font-black text-xs whitespace-nowrap cursor-pointer"
                  >
                    [+ CUKUR DEWASA (25k)]
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBarberQuick('Cukur + Wash + Styling', 35000, 5000)}
                    className="px-2.5 py-1.5 rounded bg-[#27272a] text-white font-black text-xs whitespace-nowrap cursor-pointer hover:bg-stone-700"
                  >
                    [+ KOMPLIT WASH (35k)]
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBarberQuick('Semir Hitam Uban', 50000, 22000)}
                    className="px-2.5 py-1.5 rounded bg-[#27272a] text-white font-black text-xs whitespace-nowrap cursor-pointer hover:bg-stone-700"
                  >
                    [+ SEMIR (50k)]
                  </button>
                </div>
              </div>
            )}

            {/* 3. LAUNDRY & CUCI */}
            {activeSubcat === 'laundry' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black">
                  <span style={{ color: currentSub.glow }}>
                    KALKULATOR KILOAN OTOMATIS & NOMOR RAK
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setLaundrySpeed((prev) => (prev === 'Express' ? 'Reguler' : 'Express'))
                    }
                    className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                      laundrySpeed === 'Express'
                        ? 'bg-[#0284c7] text-white border-[#38bdf8]'
                        : 'bg-[#18181b] text-stone-300 border-[#27272a]'
                    }`}
                  >
                    MODE: [{laundrySpeed === 'Express' ? 'EXPRESS 1 HARI (10k/kg)' : 'REGULER 2 HARI (7k/kg)'}]
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={laundryWeight}
                      onChange={(e) => setLaundryWeight(parseFloat(e.target.value) || 1)}
                      className="w-16 bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-black text-center"
                    />
                    <span className="text-xs font-bold text-stone-300">
                      Kg x Rp {laundrySpeed === 'Express' ? '10.000' : '7.000'} ={' '}
                      <b style={{ color: currentSub.glow }}>
                        Rp {Math.round(laundryWeight * (laundrySpeed === 'Express' ? 10000 : 7000)).toLocaleString()}
                      </b>
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="No. Rak (B-07)"
                    value={laundryRack}
                    onChange={(e) => setLaundryRack(e.target.value)}
                    className="w-24 bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-black text-center"
                  />

                  <button
                    type="button"
                    onClick={handleAddLaundryCucian}
                    className="px-3 py-2 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white font-black text-xs whitespace-nowrap cursor-pointer"
                  >
                    [+ CETAK TIKET]
                  </button>
                </div>
              </div>
            )}

            {/* 4. PENJAHIT & PERMAK */}
            {activeSubcat === 'penjahit' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black">
                  <span style={{ color: currentSub.glow }}>
                    CATAT FITTING / PERMAK & ESTIMASI SELESAI
                  </span>
                  <span className="text-xs font-black text-emerald-400">
                    SISA PELUNASAN: Rp {Math.max(0, penjahitTotalCost - penjahitDp).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Total Biaya (Rp)"
                    value={penjahitTotalCost}
                    onChange={(e) => setPenjahitTotalCost(parseInt(e.target.value) || 0)}
                    className="bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
                  />
                  <input
                    type="number"
                    placeholder="DP Uang Muka (Rp)"
                    value={penjahitDp}
                    onChange={(e) => setPenjahitDp(parseInt(e.target.value) || 0)}
                    className="bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Rincian Permak (Potong Jeans, Kecilkan Pinggang)"
                    value={penjahitNote}
                    onChange={(e) => setPenjahitNote(e.target.value)}
                    className="flex-1 bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
                  />
                  <input
                    type="date"
                    value={penjahitDueDate}
                    onChange={(e) => setPenjahitDueDate(e.target.value)}
                    className="bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold w-32"
                  />
                  <button
                    type="button"
                    onClick={handleAddPenjahitOrder}
                    className="px-3 py-2 rounded bg-[#0f766e] hover:bg-[#115e59] text-white font-black text-xs whitespace-nowrap cursor-pointer"
                  >
                    [+ CATAT JAHIT]
                  </button>
                </div>
              </div>
            )}

            {/* 5. RENTAL & SEWA */}
            {activeSubcat === 'rental' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black">
                  <span style={{ color: currentSub.glow }}>
                    DURASI SEWA & JAMINAN IDENTITAS
                  </span>
                  <div className="flex items-center gap-1">
                    {(['Hari', 'Jam'] as const).map((tp) => (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => setRentalDurationType(tp)}
                        className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                          rentalDurationType === tp
                            ? 'bg-[#d97706] text-white border-[#f59e0b]'
                            : 'bg-[#18181b] text-stone-400 border-[#27272a]'
                        }`}
                      >
                        [PER {tp.toUpperCase()}]
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nama Unit (Tenda, Sound, Genset)"
                    value={rentalItemName}
                    onChange={(e) => setRentalItemName(e.target.value)}
                    className="col-span-2 bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
                  />
                  <input
                    type="number"
                    placeholder={`Durasi (${rentalDurationType})`}
                    value={rentalDuration}
                    onChange={(e) => setRentalDuration(parseInt(e.target.value) || 1)}
                    className="bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold text-center"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Jaminan Identitas (Misal: KTP Asli / SIM A)"
                    value={rentalIdCard}
                    onChange={(e) => setRentalIdCard(e.target.value)}
                    className="flex-1 bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddRentalBooking}
                    className="px-3 py-2 rounded bg-[#d97706] hover:bg-[#b45309] text-white font-black text-xs whitespace-nowrap cursor-pointer"
                  >
                    [+ SEWA UNIT]
                  </button>
                </div>
              </div>
            )}

            {/* 6. JASA PANGGILAN & TUKANG */}
            {activeSubcat === 'tukang' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black">
                  <span style={{ color: currentSub.glow }}>
                    RINCIAN PEKERJAAN PER TITIK / UNIT
                  </span>
                  <span className="text-xs font-black text-emerald-400">
                    EST. TOTAL: Rp {((tukangUnitCount || 1) * (tukangUnitRate || 65000)).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Rincian Kerja (Misal: Cuci AC Split + Freon)"
                    value={tukangJobDesc}
                    onChange={(e) => setTukangJobDesc(e.target.value)}
                    className="flex-1 bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
                  />
                  <input
                    type="number"
                    min="1"
                    value={tukangUnitCount}
                    onChange={(e) => setTukangUnitCount(parseInt(e.target.value) || 1)}
                    className="w-14 bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold text-center"
                  />
                  <span className="text-xs font-bold text-stone-400">Titik</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Tarif per Titik/Unit (Rp)"
                    value={tukangUnitRate}
                    onChange={(e) => setTukangUnitRate(parseInt(e.target.value) || 0)}
                    className="flex-1 bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddTukangJob}
                    className="px-3 py-2 rounded bg-[#854d0e] hover:bg-[#713f12] text-white font-black text-xs whitespace-nowrap cursor-pointer"
                  >
                    [+ INPUT TIKET TUKANG]
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preset Buttons Underline List */}
          <div className="p-3 border-b border-[#27272a]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-stone-400 tracking-wider">
                PRESET LAYANAN ({currentSub.label})
              </span>
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(true)}
                className="text-[11px] font-black text-stone-300 hover:text-white"
              >
                [+ TAMBAH PRESET]
              </button>
            </div>

            <div className="divide-y divide-[#27272a] border-y border-[#27272a]">
              {currentSub.presets.map((preset) => (
                <div
                  key={preset.id}
                  className="py-2.5 px-1 flex items-center justify-between hover:bg-[#18181b] transition"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-black text-white">{preset.name}</p>
                    <p className="text-[11px] font-bold text-stone-400 mt-0.5">
                      Rp {preset.price.toLocaleString()} / {preset.unit}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      addToCart({
                        id: preset.id,
                        name: preset.name,
                        price: preset.price,
                        modal: preset.modal,
                        unit: preset.unit,
                      })
                    }
                    className="px-3 py-1 rounded bg-[#18181b] hover:bg-stone-700 text-white font-black text-xs border border-[#27272a] shrink-0 cursor-pointer"
                  >
                    [+ PILIH]
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Cart (Underline List Style) */}
          <div className="flex-1 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-stone-400 tracking-wider">
                KERANJANG TRANSAKSI ({cart.length} ITEM)
              </span>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] font-black text-red-400 hover:text-red-300 cursor-pointer"
                >
                  [KOSONGKAN]
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-stone-500 border-y border-[#27272a]">
                Keranjang masih kosong. Pilih salah satu preset layanan di atas atau input tiket cepat.
              </div>
            ) : (
              <div className="divide-y divide-[#27272a] border-y border-[#27272a]">
                {cart.map((item) => (
                  <div key={item.id} className="py-2.5 px-1 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-white">{item.name}</p>
                      {item.note && (
                        <p className="text-[10px] font-semibold text-stone-400 truncate mt-0.5">
                          {item.note}
                        </p>
                      )}
                      <p className="text-xs font-black text-emerald-400 mt-0.5">
                        Rp {item.price.toLocaleString()} x {item.qty} = Rp{' '}
                        {(item.price * item.qty).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-[#18181b] text-stone-300 font-black text-sm border border-[#27272a] hover:bg-stone-700 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-black">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-[#18181b] text-stone-300 font-black text-sm border border-[#27272a] hover:bg-stone-700 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Bar */}
          <div className="p-3 bg-[#121212] border-t border-[#27272a] space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Nama Pelanggan (Opsional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
              />
              <input
                type="text"
                placeholder="No. WA Pelanggan (Untuk Tagih)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-stone-400">TOTAL BAYAR:</span>
              <span className="text-lg font-black text-white">
                Rp {cartTotal.toLocaleString()}
              </span>
            </div>

            {/* Direct Tap Payment Buttons (BOLD TEXT, NO ICONIC) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleCheckout('tunai')}
                className="py-3 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs text-center border border-emerald-500 cursor-pointer"
              >
                [BAYAR TUNAI]
              </button>
              <button
                type="button"
                onClick={() => handleCheckout('qris')}
                className="py-3 rounded bg-sky-700 hover:bg-sky-600 text-white font-black text-xs text-center border border-sky-500 cursor-pointer"
              >
                [BAYAR QRIS]
              </button>
              <button
                type="button"
                onClick={() => handleCheckout('bon')}
                className="py-3 rounded bg-amber-700 hover:bg-amber-600 text-white font-black text-xs text-center border border-amber-500 cursor-pointer"
              >
                [CATAT BON / DP]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW: BON (PIUTANG WARGA)                                    */}
      {/* ============================================================ */}
      {activeTab === 'bon' && (
        <div className="flex-1 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase text-white">
                CATATAN BON & PIUTANG WARGA
              </h3>
              <p className="text-[11px] font-semibold text-stone-400">
                Tracking DP, sisa pelunasan & tombol tagih langsung via WhatsApp
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsBonModalOpen(true)}
              className="px-2.5 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white font-black text-xs cursor-pointer"
            >
              [+ CATAT MANUAL]
            </button>
          </div>

          <div className="divide-y divide-[#27272a] border-y border-[#27272a]">
            {bonList.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-stone-500">
                Tidak ada catatan piutang/bon aktif.
              </div>
            ) : (
              bonList.map((bon) => (
                <div key={bon.id} className="py-3 px-1 space-y-1.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-black text-white">
                        {bon.customerName}
                      </span>
                      {bon.phone && (
                        <span className="text-[11px] font-bold text-stone-400 ml-2">
                          ({bon.phone})
                        </span>
                      )}
                      <p className="text-[11px] font-semibold text-stone-300 mt-0.5">
                        {bon.notes}
                      </p>
                      <p className="text-[10px] font-bold text-stone-500">
                        Tanggal: {bon.date} • Jatuh Tempo: {bon.dueDate || 'Segera'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-amber-400 block">
                        Rp {bon.amount.toLocaleString()}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border inline-block mt-0.5 ${
                          bon.status === 'lunas'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-red-950 text-red-400 border-red-800'
                        }`}
                      >
                        [{bon.status === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}]
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(bon)}
                      className="px-2.5 py-1 rounded bg-[#27272a] hover:bg-stone-700 text-white font-black text-[11px] border border-[#3f3f46] cursor-pointer"
                    >
                      [TAGIH VIA WA]
                    </button>
                    {bon.status !== 'lunas' && (
                      <button
                        type="button"
                        onClick={() => handleMarkBonLunas(bon.id)}
                        className="px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-black text-[11px] border border-emerald-600 cursor-pointer"
                      >
                        [LUNASKAN]
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW: REKAP                                                  */}
      {/* ============================================================ */}
      {activeTab === 'rekap' && (
        <div className="flex-1 p-3 space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase text-white">
              REKAP KEUANGAN & ARUS KAS
            </h3>
            <p className="text-[11px] font-semibold text-stone-400">
              Pemisahan otomatis: Tunai Laci, Digital QRIS, dan Piutang Bon Warga
            </p>
          </div>

          {/* Ratio Summary Underline List */}
          <div className="divide-y divide-[#27272a] border-y border-[#27272a]">
            <div className="py-2.5 px-1 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400">TUNAI LACI KASIR:</span>
              <span className="text-sm font-black text-emerald-400">
                Rp {totalTunai.toLocaleString()}
              </span>
            </div>
            <div className="py-2.5 px-1 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400">DIGITAL QRIS / TRANSFER:</span>
              <span className="text-sm font-black text-sky-400">
                Rp {totalQris.toLocaleString()}
              </span>
            </div>
            <div className="py-2.5 px-1 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400">PIUTANG BON (BELUM LUNAS):</span>
              <span className="text-sm font-black text-amber-400">
                Rp {totalBon.toLocaleString()}
              </span>
            </div>
            <div className="py-2.5 px-1 flex items-center justify-between bg-[#121212]">
              <span className="text-xs font-black text-white">TOTAL OMSET DITERIMA:</span>
              <span className="text-base font-black text-white">
                Rp {grandTotalOmset.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Recent Invoices List */}
          <div>
            <span className="text-xs font-black uppercase text-stone-400 tracking-wider block mb-2">
              RIWAYAT TRANSAKSI TERAKHIR ({invoices.length})
            </span>
            <div className="divide-y divide-[#27272a] border-y border-[#27272a]">
              {invoices.length === 0 ? (
                <div className="py-6 text-center text-xs font-bold text-stone-500">
                  Belum ada transaksi terekam hari ini.
                </div>
              ) : (
                invoices.slice(0, 15).map((inv) => (
                  <div key={inv.id} className="py-2 px-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-white">{inv.customerName}</p>
                      <p className="text-[10px] font-bold text-stone-500">
                        {inv.invoiceNo} • {inv.date} • {inv.subcat.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-white block">
                        Rp {inv.total.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-black uppercase text-stone-400">
                        [{inv.method}]
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW: KATALOG                                                */}
      {/* ============================================================ */}
      {activeTab === 'katalog' && (
        <div className="flex-1 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase text-white">
                KATALOG JASA: {currentSub.label}
              </h3>
              <p className="text-[11px] font-semibold text-stone-400">
                Daftar tarif layanan, sparepart/material, modal vs harga jual
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCatalogModalOpen(true)}
              className="px-2.5 py-1.5 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer"
            >
              [+ TAMBAH BARU]
            </button>
          </div>

          <div className="divide-y divide-[#27272a] border-y border-[#27272a]">
            {activeCatalog.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-stone-500">
                Belum ada item khusus untuk kategori {currentSub.name}.
              </div>
            ) : (
              activeCatalog.map((item) => {
                const margin = item.price - item.modal;
                return (
                  <div key={item.id} className="py-2.5 px-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-white">{item.name}</p>
                      <p className="text-[10px] font-bold text-stone-400">
                        Modal: Rp {item.modal.toLocaleString()} • Satuan: {item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-white">
                        Rp {item.price.toLocaleString()}
                      </p>
                      <p className="text-[10px] font-black text-emerald-400">
                        Margin: +Rp {margin.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW: PENGATURAN & PRATINJAU STRUK DUMMY                     */}
      {/* ============================================================ */}
      {activeTab === 'pengaturan' && (
        <div className="flex-1 p-3 space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase text-white">
              PENGATURAN TOKO & PRATINJAU STRUK
            </h3>
            <p className="text-[11px] font-semibold text-stone-400">
              Profil usaha, nota thermal 58mm adaptif per sub-kategori
            </p>
          </div>

          {/* Profile Form */}
          <div className="space-y-2 bg-[#121212] p-3 rounded border border-[#27272a]">
            <span className="text-xs font-black uppercase text-stone-300 block mb-1">
              PROFIL USAHA / UNIT
            </span>
            <div>
              <label className="text-[10px] font-bold text-stone-400 block">NAMA USAHA</label>
              <input
                type="text"
                value={businessProfile.name}
                onChange={(e) =>
                  setBusinessProfile({ ...businessProfile, name: e.target.value })
                }
                className="w-full bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-400 block">ALAMAT / POS</label>
              <input
                type="text"
                value={businessProfile.address}
                onChange={(e) =>
                  setBusinessProfile({ ...businessProfile, address: e.target.value })
                }
                className="w-full bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-400 block">NO. WHATSAPP</label>
              <input
                type="text"
                value={businessProfile.phone}
                onChange={(e) =>
                  setBusinessProfile({ ...businessProfile, phone: e.target.value })
                }
                className="w-full bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
              />
            </div>
          </div>

          {/* THERMAL RECEIPT PREVIEW (58mm SIMULATOR) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-stone-300">
                PRATINJAU STRUK THERMAL (58MM)
              </span>
              <span className="text-[10px] font-bold text-stone-500 uppercase">
                {currentSub.label}
              </span>
            </div>

            <div className="bg-white text-black p-4 rounded-sm font-mono text-xs shadow-md border-dashed border-2 border-stone-300 space-y-2 leading-tight">
              <div className="text-center border-b border-black pb-2 space-y-0.5">
                <p className="font-black text-sm uppercase">{businessProfile.name}</p>
                <p className="text-[10px]">{businessProfile.address}</p>
                <p className="text-[10px]">Telp: {businessProfile.phone}</p>
                <p className="text-[9px] font-bold pt-1">
                  *** NOTA {currentSub.label} ***
                </p>
              </div>

              <div className="text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>No: INV-PL-889021</span>
                  <span>26/10/2026 14:30</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan: Pak Hadi (RT 04)</span>
                  <span>Kasir: Admin</span>
                </div>
              </div>

              <div className="border-t border-b border-black py-2 space-y-1">
                {currentSub.dummyReceiptItems.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-bold">
                      <span>{item.name}</span>
                      <span>Rp {item.price.toLocaleString()}</span>
                    </div>
                    {item.spec && (
                      <p className="text-[9px] text-stone-600 pl-1">{item.spec}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-0.5 pt-1 text-[11px] font-bold">
                <div className="flex justify-between">
                  <span>TOTAL:</span>
                  <span>
                    Rp{' '}
                    {currentSub.dummyReceiptItems
                      .reduce((s, i) => s + i.price, 0)
                      .toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-normal text-[10px]">
                  <span>METODE:</span>
                  <span>TUNAI (PAS)</span>
                </div>
              </div>

              {/* Special Note Specific to Sub-Category */}
              <div className="border-t border-dashed border-black pt-2 text-[10px] italic text-center">
                <p className="font-bold">{currentSub.specialNote}</p>
                <p className="text-[9px] mt-1">{businessProfile.footer}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5 MENU WAJIB (NAVIGATION BOTTOM BAR)                         */}
      {/* ============================================================ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d] border-t border-[#27272a] grid grid-cols-5 safe-bottom">
        {(['kasir', 'bon', 'rekap', 'katalog', 'pengaturan'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`py-3 flex flex-col items-center justify-center font-black transition cursor-pointer ${
                isActive
                  ? 'text-white border-t-2'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
              style={{
                borderColor: isActive ? currentSub.glow : 'transparent',
              }}
            >
              <span className="text-[12px] tracking-wider uppercase font-black">
                [{tab.toUpperCase()}]
              </span>
            </button>
          );
        })}
      </nav>

      {/* Modal: Tambah Bon Baru */}
      {isBonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#27272a] rounded p-4 max-w-sm w-full space-y-3">
            <h4 className="text-sm font-black uppercase text-white">
              [+ CATAT BON / PIUTANG BARU]
            </h4>
            <input
              type="text"
              placeholder="Nama Warga / Pemesan"
              value={newBonCust}
              onChange={(e) => setNewBonCust(e.target.value)}
              className="w-full bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
            />
            <input
              type="text"
              placeholder="No. WhatsApp (08xxx)"
              value={newBonPhone}
              onChange={(e) => setNewBonPhone(e.target.value)}
              className="w-full bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
            />
            <input
              type="number"
              placeholder="Nominal Piutang (Rp)"
              value={newBonAmount}
              onChange={(e) => setNewBonAmount(parseInt(e.target.value) || 0)}
              className="w-full bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
            />
            <input
              type="date"
              value={newBonDueDate}
              onChange={(e) => setNewBonDueDate(e.target.value)}
              className="w-full bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
            />
            <input
              type="text"
              placeholder="Keterangan / Rincian Layanan"
              value={newBonNotes}
              onChange={(e) => setNewBonNotes(e.target.value)}
              className="w-full bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
            />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBonModalOpen(false)}
                className="py-2 rounded bg-[#27272a] text-white font-black text-xs cursor-pointer"
              >
                [BATAL]
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newBonCust.trim()) return;
                  const item: BonItem = {
                    id: `bon-${Date.now()}`,
                    customerName: newBonCust.trim(),
                    phone: newBonPhone.trim(),
                    amount: newBonAmount || 0,
                    date: new Date().toISOString().split('T')[0],
                    dueDate: newBonDueDate || 'Segera',
                    notes: newBonNotes || 'Bon Layanan Jasa Warga',
                    status: 'belum_lunas',
                    type: activeSubcat,
                  };
                  setBonList((prev) => [item, ...prev]);
                  setIsBonModalOpen(false);
                  setNewBonCust('');
                  setNewBonPhone('');
                  showNotification('Catatan bon baru disimpan.');
                }}
                className="py-2 rounded bg-amber-700 hover:bg-amber-600 text-white font-black text-xs cursor-pointer"
              >
                [SIMPAN BON]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Item Katalog Baru */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddCatalogItem}
            className="bg-[#121212] border border-[#27272a] rounded p-4 max-w-sm w-full space-y-3"
          >
            <h4 className="text-sm font-black uppercase text-white">
              [+ TAMBAH LAYANAN ({currentSub.label})]
            </h4>
            <input
              type="text"
              placeholder="Nama Layanan / Sparepart"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Harga Jual (Rp)"
                value={newCatPrice}
                onChange={(e) => setNewCatPrice(parseInt(e.target.value) || 0)}
                className="bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
                required
              />
              <input
                type="number"
                placeholder="Harga Modal (Rp)"
                value={newCatModal}
                onChange={(e) => setNewCatModal(parseInt(e.target.value) || 0)}
                className="bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
              />
            </div>
            <input
              type="text"
              placeholder="Satuan (Unit, Orang, Kg, Pcs, dsb)"
              value={newCatUnit}
              onChange={(e) => setNewCatUnit(e.target.value)}
              className="w-full bg-[#18181b] text-white border border-[#27272a] rounded p-2 text-xs font-bold"
            />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="py-2 rounded bg-[#27272a] text-white font-black text-xs cursor-pointer"
              >
                [BATAL]
              </button>
              <button
                type="submit"
                className="py-2 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer"
              >
                [SIMPAN KATALOG]
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
