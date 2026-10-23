import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  RitelProduct,
  RitelCartItem,
  RitelInvoice,
  RitelSubCategory,
} from '../../types';

interface RitelQuViewProps {
  currentUser: UserProfile;
  onBackToAppQu: () => void;
  showNotification: (msg: string) => void;
}

interface BonRecord {
  id: string;
  customerName: string;
  phone: string;
  amount: number;
  buyTotal?: number;
  date: string;
  dueDate: string;
  notes: string;
  status: 'belum_lunas' | 'lunas';
  itemsSummary?: string;
}

interface SubCatMeta {
  id: RitelSubCategory;
  name: string;
  label: string;
  color: string;
  glow: string;
  presets: { id: string; name: string; price: number; buyPrice: number; unit: string }[];
  dummyItems: { name: string; qty: number; price: number; spec?: string }[];
  specialNote: string;
}

const SUBCATEGORIES: Record<RitelSubCategory, SubCatMeta> = {
  sembako: {
    id: 'sembako',
    name: 'Sembako & Kelontong',
    label: 'SEMBAKO & KELONTONG',
    color: '#059669',
    glow: '#10b981',
    presets: [
      { id: 'sb-1', name: 'Gas LPG 3kg', price: 22000, buyPrice: 19000, unit: 'Tabung' },
      { id: 'sb-2', name: 'Galon Air Minum 19L', price: 19000, buyPrice: 15500, unit: 'Galon' },
      { id: 'sb-3', name: 'Minyak Goreng 2L Pouch', price: 34000, buyPrice: 30500, unit: 'Pcs' },
      { id: 'sb-4', name: 'Beras Premium 5kg', price: 72000, buyPrice: 66000, unit: 'Sak' },
      { id: 'sb-5', name: 'Gula Pasir 1kg', price: 17500, buyPrice: 15500, unit: 'Kg' },
      { id: 'sb-6', name: 'Rokok Surya 16', price: 34000, buyPrice: 31000, unit: 'Bks' },
    ],
    dummyItems: [
      { name: 'Beras Premium 5kg', qty: 1, price: 72000, spec: 'Eceran Sak' },
      { name: 'Minyak Goreng 2L Pouch', qty: 1, price: 34000, spec: 'Pcs' },
      { name: 'Gas LPG 3kg', qty: 1, price: 22000, spec: 'Tukar Tabung' },
    ],
    specialNote: 'Nota Resmi Toko Kelontong Warga. Bon Warga otomatis tercatat di buku piutang RT.',
  },
  fashion: {
    id: 'fashion',
    name: 'Fashion & Style / Baju & Sepatu',
    label: 'FASHION & SEPATU',
    color: '#dc2626',
    glow: '#e11d48',
    presets: [
      { id: 'fs-1', name: 'Kaos Polos Cotton 30s', price: 45000, buyPrice: 28000, unit: 'Pcs' },
      { id: 'fs-2', name: 'Kemeja Flanel Casual', price: 85000, buyPrice: 55000, unit: 'Pcs' },
      { id: 'fs-3', name: 'Celana Chino Slimfit', price: 110000, buyPrice: 75000, unit: 'Pcs' },
      { id: 'fs-4', name: 'Sepatu Sneakers Canvas', price: 135000, buyPrice: 90000, unit: 'Pasang' },
      { id: 'fs-5', name: 'Sandal Slop Warga', price: 25000, buyPrice: 14000, unit: 'Pasang' },
    ],
    dummyItems: [
      { name: 'Kemeja Flanel Casual', qty: 1, price: 75000, spec: 'Size: XL | Navy (Obral Rp 10k)' },
      { name: 'Sepatu Sneakers Canvas', qty: 1, price: 135000, spec: 'Size Sepatu: 42 | Hitam' },
    ],
    specialNote: 'Ketentuan Retur: Tukar ukuran dapat dilakukan maks. 3 hari dengan menyertakan struk ini.',
  },
  apotek: {
    id: 'apotek',
    name: 'Apotek, Obat & Herbal',
    label: 'APOTEK & HERBAL',
    color: '#0891b2',
    glow: '#06b6d4',
    presets: [
      { id: 'ap-1', name: 'Paracetamol 500mg Strip', price: 6500, buyPrice: 4000, unit: 'Strip' },
      { id: 'ap-2', name: 'Amoxicillin 500mg Strip', price: 9000, buyPrice: 6000, unit: 'Strip' },
      { id: 'ap-3', name: 'Madu Herbal Murni 250ml', price: 45000, buyPrice: 32000, unit: 'Botol' },
      { id: 'ap-4', name: 'Minyak Kayu Putih 120ml', price: 28000, buyPrice: 22000, unit: 'Botol' },
      { id: 'ap-5', name: 'Vitamin C 500mg Botol', price: 35000, buyPrice: 24000, unit: 'Botol' },
    ],
    dummyItems: [
      { name: 'Paracetamol 500mg Strip', qty: 2, price: 13000, spec: '[Aturan Pakai: 3x1 Sesudah Makan]' },
      { name: 'Vitamin C 500mg Botol', qty: 1, price: 35000, spec: '[Aturan Pakai: 1x1 Pagi Hari]' },
    ],
    specialNote: 'Aturan Pakai Obat Wajib Diperhatikan. Simpan di tempat sejuk & jauhkan dari jangkauan anak-anak.',
  },
  elektronik: {
    id: 'elektronik',
    name: 'Elektronik & Listrik',
    label: 'ELEKTRONIK & LISTRIK',
    color: '#d97706',
    glow: '#f59e0b',
    presets: [
      { id: 'el-1', name: 'Lampu LED 12W Putih', price: 25000, buyPrice: 17000, unit: 'Pcs' },
      { id: 'el-2', name: 'Kabel Listrik NYM 2x1.5', price: 9000, buyPrice: 6500, unit: 'Meter' },
      { id: 'el-3', name: 'Steker Arde Kuningan', price: 8500, buyPrice: 5000, unit: 'Pcs' },
      { id: 'el-4', name: 'Stop Kontak 4 Lubang Kabel', price: 38000, buyPrice: 26000, unit: 'Pcs' },
      { id: 'el-5', name: 'Saklar Ganda Outbow', price: 14000, buyPrice: 9000, unit: 'Pcs' },
    ],
    dummyItems: [
      { name: 'Lampu LED 12W Putih', qty: 2, price: 50000, spec: '[Garansi Toko 1 Bulan] [QC: TES NYALA OK]' },
      { name: 'Kabel Listrik NYM 2x1.5', qty: 10, price: 90000, spec: 'Panjang 10 Meter' },
    ],
    specialNote: 'Struk adalah bukti klaim garansi. Kerusakan akibat korsleting listrik luar / petir tidak digaransi.',
  },
  furniture: {
    id: 'furniture',
    name: 'Furniture & Mebel',
    label: 'FURNITURE & MEBEL',
    color: '#854d0e',
    glow: '#92400e',
    presets: [
      { id: 'fn-1', name: 'Kursi Plastik Sandaran', price: 65000, buyPrice: 48000, unit: 'Pcs' },
      { id: 'fn-2', name: 'Meja Makan Kayu Jati Set', price: 1450000, buyPrice: 1050000, unit: 'Set' },
      { id: 'fn-3', name: 'Lemari Pakaian 3 Pintu', price: 850000, buyPrice: 620000, unit: 'Unit' },
      { id: 'fn-4', name: 'Kasur Busa Super 120x200', price: 520000, buyPrice: 380000, unit: 'Unit' },
      { id: 'fn-5', name: 'Rak Piring Alumunium 3 Susun', price: 235000, buyPrice: 170000, unit: 'Unit' },
    ],
    dummyItems: [
      { name: 'Meja Makan Kayu Jati Set', qty: 1, price: 1450000, spec: 'Set 1 Meja + 4 Kursi Jati' },
    ],
    specialNote: 'Status: DP Rp 500.000 Diterima. Sisa Pelunasan COD Rp 950.000 Saat Pengantaran Armada Toko ke Alamat.',
  },
  plastik: {
    id: 'plastik',
    name: 'Plastik & Bahan Packing',
    label: 'PLASTIK & PACKING',
    color: '#ea580c',
    glow: '#f97316',
    presets: [
      { id: 'pl-1', name: 'Thinwall 650ml Persegi', price: 18000, buyPrice: 14000, unit: 'Pack (25pcs)' },
      { id: 'pl-2', name: 'Kantong Kresek 24 Hitam', price: 9500, buyPrice: 7000, unit: 'Pack' },
      { id: 'pl-3', name: 'Kantong Kresek 15 Putih', price: 6000, buyPrice: 4200, unit: 'Pack' },
      { id: 'pl-4', name: 'Paper Bowl 650ml + Tutup', price: 28000, buyPrice: 22000, unit: 'Pack (25pcs)' },
      { id: 'pl-5', name: 'Gelas Cup Kopi 16oz', price: 16500, buyPrice: 12000, unit: 'Pack (50pcs)' },
      { id: 'pl-6', name: 'Lakban Bening 2 Inch 100M', price: 12000, buyPrice: 8500, unit: 'Roll' },
    ],
    dummyItems: [
      { name: 'Thinwall 650ml Persegi', qty: 4, price: 72000, spec: '4 Pack (Total 100 Pcs)' },
      { name: 'Kantong Kresek 24 Hitam', qty: 1, price: 90000, spec: 'Harga Grosir 1 Ikat (10 Pack)' },
    ],
    specialNote: 'Spesialis Bahan Packing Kuliner & Online Shop. Melayani Pembelian Partai Bal/Ikat UMKM.',
  },
  atk: {
    id: 'atk',
    name: 'ATK & Fotocopy',
    label: 'ATK & FOTOCOPY',
    color: '#4f46e5',
    glow: '#6366f1',
    presets: [
      { id: 'at-1', name: 'Fotocopy Hitam Putih A4', price: 300, buyPrice: 100, unit: 'Lembar' },
      { id: 'at-2', name: 'Fotocopy F4 (Folio)', price: 350, buyPrice: 120, unit: 'Lembar' },
      { id: 'at-3', name: 'Print Warna Dokumen A4', price: 1500, buyPrice: 500, unit: 'Lembar' },
      { id: 'at-4', name: 'Jilid Lakban Mika Bening', price: 3500, buyPrice: 1000, unit: 'Buku' },
      { id: 'at-5', name: 'Kertas HVS A4 75gr Rim', price: 48000, buyPrice: 41000, unit: 'Rim' },
      { id: 'at-6', name: 'Pulpen Standard Hitam', price: 3000, buyPrice: 1800, unit: 'Pcs' },
    ],
    dummyItems: [
      { name: 'Fotocopy F4 (Folio)', qty: 50, price: 17500, spec: '50 Lembar x Rp 350' },
      { name: 'Jilid Lakban Mika Bening', qty: 1, price: 3500, spec: 'Finishing Jilid Depan Belakang' },
    ],
    specialNote: 'Nota Pembayaran ATK & Percetakan. Harap periksa hasil cetak sebelum meninggalkan gerai.',
  },
};

const STORAGE_KEY = 'ritelqu_7sub_v1';

export const RitelQuView: React.FC<RitelQuViewProps> = ({
  currentUser,
  onBackToAppQu,
  showNotification,
}) => {
  // Navigation 5 core tabs: 'kasir' | 'bon' | 'rekap' | 'katalog' | 'pengaturan'
  const [activeTab, setActiveTab] = useState<'kasir' | 'bon' | 'rekap' | 'katalog' | 'pengaturan'>('kasir');
  const [activeSubcat, setActiveSubcat] = useState<RitelSubCategory>('sembako');

  // Shared Data States
  const [cart, setCart] = useState<RitelCartItem[]>([]);
  const [invoices, setInvoices] = useState<RitelInvoice[]>([]);
  const [bonList, setBonList] = useState<BonRecord[]>([]);
  const [catalog, setCatalog] = useState<RitelProduct[]>([]);
  const [storeProfile, setStoreProfile] = useState({
    name: 'Toko Berkah Warga RT 04',
    address: 'Jl. Swadaya No. 12 RT 04 / RW 02',
    phone: '0812-3456-7890',
    footer: 'Barang yang dibeli dapat ditukar jika rusak. Terima Kasih!',
  });

  // Transient calculator parameters
  const [cashGiven, setCashGiven] = useState<string>('');
  const [fashionSize, setFashionSize] = useState<string>('M');
  const [apotekDosage, setApotekDosage] = useState<string>('3x1 Sesudah Makan');
  const [elektronikWarranty, setElektronikWarranty] = useState<string>('Garansi 7 Hari');
  const [elektronikQc, setElektronikQc] = useState<boolean>(true);
  const [furnitureMode, setFurnitureMode] = useState<'Lunas' | 'DP'>('Lunas');
  const [furnitureAddress, setFurnitureAddress] = useState<string>('');
  const [plastikWholesale, setPlastikWholesale] = useState<boolean>(false);
  const [atkSheets, setAtkSheets] = useState<number>(10);
  const [atkType, setAtkType] = useState<string>('fc_a4');

  // Modals
  const [isBonModalOpen, setIsBonModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isAddCatalogModalOpen, setIsAddCatalogModalOpen] = useState(false);
  const [isReturModalOpen, setIsReturModalOpen] = useState(false);

  // Form states
  const [bonName, setBonName] = useState('');
  const [bonPhone, setBonPhone] = useState('');
  const [bonDueDate, setBonDueDate] = useState('');
  const [bonNotes, setBonNotes] = useState('');

  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customQty, setCustomQty] = useState('1');
  const [customNote, setCustomNote] = useState('');

  const [catName, setCatName] = useState('');
  const [catPrice, setCatPrice] = useState('');
  const [catBuyPrice, setCatBuyPrice] = useState('');
  const [catStock, setCatStock] = useState('20');
  const [catUnit, setCatUnit] = useState('Pcs');
  const [catSubcat, setCatSubcat] = useState<RitelSubCategory>('sembako');

  const [returOldItem, setReturOldItem] = useState('');
  const [returNewSize, setReturNewSize] = useState('');
  const [returBuyer, setReturBuyer] = useState('');

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
        if (parsed.storeProfile) setStoreProfile(parsed.storeProfile);
      } catch (err) {
        console.error('Error loading ritelqu data', err);
      }
    } else {
      // Seed initial catalog
      const initialCat: RitelProduct[] = [];
      Object.keys(SUBCATEGORIES).forEach((key) => {
        const k = key as RitelSubCategory;
        SUBCATEGORIES[k].presets.forEach((p) => {
          initialCat.push({
            id: p.id,
            sku: p.id,
            name: p.name,
            category: k,
            price: p.price,
            buyPrice: p.buyPrice,
            stock: 30,
            unit: p.unit,
          });
        });
      });
      setCatalog(initialCat);

      // Seed initial bon
      const initialBon: BonRecord[] = [
        {
          id: 'bon-1',
          customerName: 'Pak Hadi (RT 04)',
          phone: '081298765432',
          amount: 72000,
          date: '2026-10-22',
          dueDate: '2026-10-30',
          notes: 'Beras 5kg & Telur 1/2kg',
          status: 'belum_lunas',
        },
        {
          id: 'bon-2',
          customerName: 'Bu RT Endang',
          phone: '081345678910',
          amount: 45000,
          date: '2026-10-21',
          dueDate: '2026-10-28',
          notes: 'Gas 3kg & Minyak 1L',
          status: 'belum_lunas',
        },
      ];
      setBonList(initialBon);
    }
  }, []);

  // Save changes
  const persistState = (
    newInvoices = invoices,
    newBon = bonList,
    newCat = catalog,
    newProfile = storeProfile,
    newSubcat = activeSubcat
  ) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        activeSubcat: newSubcat,
        invoices: newInvoices,
        bonList: newBon,
        catalog: newCat,
        storeProfile: newProfile,
      })
    );
  };

  const currentMeta = SUBCATEGORIES[activeSubcat];

  // Cart operations
  const totalCart = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalBuyPrice = cart.reduce((sum, item) => sum + (item.buyPrice || 0) * item.qty, 0);

  const handleAddToCart = (item: {
    id: string;
    name: string;
    price: number;
    buyPrice?: number;
    qty?: number;
    unit?: string;
    note?: string;
  }) => {
    let extraNote = item.note || '';
    if (!extraNote) {
      if (activeSubcat === 'fashion') extraNote = `Size: ${fashionSize}`;
      else if (activeSubcat === 'apotek') extraNote = `[${apotekDosage}]`;
      else if (activeSubcat === 'elektronik') {
        extraNote = `[${elektronikWarranty}] ${elektronikQc ? '[QC: OK]' : ''}`;
      }
    }

    setCart((prev) => {
      const idx = prev.findIndex((p) => p.name === item.name && p.note === extraNote);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].qty += item.qty || 1;
        return copy;
      }
      return [
        ...prev,
        {
          id: `${item.id}-${Date.now()}`,
          productId: item.id,
          sku: item.id,
          name: item.name,
          price: item.price,
          buyPrice: item.buyPrice || Math.round(item.price * 0.75),
          qty: item.qty || 1,
          unit: item.unit || 'Pcs',
          note: extraNote,
        },
      ];
    });
    showNotification(`+ ${item.name} dimasukkan ke keranjang`);
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
    showNotification('Keranjang dikosongkan');
  };

  // Payment Execution: [TUNAI] & [QRIS]
  const handleExecutePayment = (method: 'tunai' | 'qris') => {
    if (cart.length === 0) {
      showNotification('Keranjang transaksi masih kosong!');
      return;
    }
    const cashNum = parseInt(cashGiven) || totalCart;
    const change = Math.max(0, cashNum - totalCart);

    const newInvoice: RitelInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      cashierName: currentUser.name,
      subCategory: activeSubcat,
      items: [...cart],
      total: totalCart,
      buyTotal: totalBuyPrice,
      paymentMethod: method,
      cashGiven: method === 'tunai' ? cashNum : totalCart,
      change: method === 'tunai' ? change : 0,
      status: 'lunas',
      createdAt: new Date().toISOString(),
      notes: activeSubcat === 'furniture' && furnitureAddress ? `Kirim ke: ${furnitureAddress}` : undefined,
    };

    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    setCart([]);
    setCashGiven('');
    persistState(updated);
    showNotification(
      `Pembayaran [${method.toUpperCase()}] Sukses! ${method === 'tunai' ? `Kembalian: Rp ${change.toLocaleString('id-ID')}` : ''}`
    );
  };

  // Execute Catat Bon
  const handleConfirmCatatBon = () => {
    if (!bonName.trim()) {
      showNotification('Harap masukkan nama warga peminjam!');
      return;
    }
    const due = bonDueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const newBon: BonRecord = {
      id: `bon-${Date.now()}`,
      customerName: bonName.trim(),
      phone: bonPhone.trim() || '0812-xxxx-xxxx',
      amount: totalCart,
      buyTotal: totalBuyPrice,
      date: new Date().toISOString().split('T')[0],
      dueDate: due,
      notes: bonNotes.trim() || `Bon belanja ${cart.map((c) => c.name).join(', ')}`,
      status: 'belum_lunas',
      itemsSummary: cart.map((c) => `${c.name} (${c.qty})`).join(', '),
    };

    const updatedBon = [newBon, ...bonList];
    setBonList(updatedBon);

    const newInv: RitelInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-BON-${Date.now().toString().slice(-5)}`,
      cashierName: currentUser.name,
      customerName: bonName.trim(),
      customerPhone: bonPhone.trim(),
      subCategory: activeSubcat,
      items: [...cart],
      total: totalCart,
      buyTotal: totalBuyPrice,
      paymentMethod: 'bon_warga',
      status: 'bon',
      createdAt: new Date().toISOString(),
      notes: bonNotes.trim(),
    };
    const updatedInvoices = [newInv, ...invoices];
    setInvoices(updatedInvoices);

    setCart([]);
    setIsBonModalOpen(false);
    setBonName('');
    setBonPhone('');
    setBonNotes('');
    persistState(updatedInvoices, updatedBon);
    showNotification(`Bon atas nama ${newBon.customerName} berhasil dicatat.`);
  };

  const handleMarkBonLunas = (index: number) => {
    const updated = [...bonList];
    updated[index].status = 'lunas';
    setBonList(updated);
    persistState(invoices, updated);
    showNotification('Catatan bon warga ditandai LUNAS!');
  };

  const handleDeleteBon = (index: number) => {
    const updated = bonList.filter((_, i) => i !== index);
    setBonList(updated);
    persistState(invoices, updated);
    showNotification('Catatan bon warga dihapus.');
  };

  const handleSendWhatsAppBilling = (bon: BonRecord) => {
    const phoneClean = bon.phone.replace(/[^0-9]/g, '');
    const text = `Halo Yth. ${bon.customerName}, kami dari ${storeProfile.name} menginfokan catatan bon belanja sebesar Rp ${bon.amount.toLocaleString('id-ID')} dengan jatuh tempo tgl ${bon.dueDate}. Rincian: ${bon.notes || '-'}. Terima kasih atas kerja samanya!`;
    const target = phoneClean.startsWith('0') ? '62' + phoneClean.slice(1) : phoneClean;
    window.open(`https://wa.me/${target}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Add Custom Item to Cart
  const handleConfirmCustomItem = () => {
    const priceNum = parseInt(customPrice) || 0;
    const qtyNum = parseInt(customQty) || 1;
    if (!customName.trim() || priceNum <= 0) {
      showNotification('Nama barang dan harga harus diisi valid!');
      return;
    }
    handleAddToCart({
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      price: priceNum,
      buyPrice: Math.round(priceNum * 0.75),
      qty: qtyNum,
      note: customNote.trim(),
    });
    setIsCustomModalOpen(false);
    setCustomName('');
    setCustomPrice('');
    setCustomQty('1');
    setCustomNote('');
  };

  // Add Item to Catalog
  const handleConfirmAddCatalog = () => {
    const priceNum = parseInt(catPrice) || 0;
    if (!catName.trim() || priceNum <= 0) {
      showNotification('Nama barang dan harga jual harus diisi!');
      return;
    }
    const buyNum = parseInt(catBuyPrice) || Math.round(priceNum * 0.75);
    const stockNum = parseInt(catStock) || 10;

    const newItem: RitelProduct = {
      id: `cat-${Date.now()}`,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      name: catName.trim(),
      category: catSubcat,
      price: priceNum,
      buyPrice: buyNum,
      stock: stockNum,
      unit: catUnit.trim() || 'Pcs',
    };

    const updated = [...catalog, newItem];
    setCatalog(updated);
    setIsAddCatalogModalOpen(false);
    setCatName('');
    setCatPrice('');
    setCatBuyPrice('');
    persistState(invoices, bonList, updated);
    showNotification(`${newItem.name} ditambahkan ke katalog`);
  };

  // Retur Size Handling
  const handleConfirmReturSize = () => {
    if (!returOldItem.trim() || !returNewSize.trim()) {
      showNotification('Harap isi barang lama dan ukuran baru!');
      return;
    }
    handleAddToCart({
      id: `retur-${Date.now()}`,
      name: `[RETUR SIZE] ${returOldItem.trim()}`,
      price: 0,
      buyPrice: 0,
      qty: 1,
      unit: 'Pcs',
      note: `Ditukar ke: ${returNewSize.trim()} (Pembeli: ${returBuyer.trim() || 'Warga'})`,
    });
    setIsReturModalOpen(false);
    setReturOldItem('');
    setReturNewSize('');
    setReturBuyer('');
    showNotification('Retur ukuran dicatat ke keranjang');
  };

  // Fashion Discount Helper
  const handleApplyFashionDiscount = (val: number, isPercent = false) => {
    if (cart.length === 0) {
      showNotification('Keranjang masih kosong!');
      return;
    }
    setCart((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (isPercent) {
        const disc = Math.round(last.price * val);
        last.price = Math.max(0, last.price - disc);
        last.note = `${last.note ? last.note + ' ' : ''}(Diskon 10% -Rp ${disc.toLocaleString()})`;
      } else {
        last.price = Math.max(0, last.price - val);
        last.note = `${last.note ? last.note + ' ' : ''}(Potongan Obral Rp ${val.toLocaleString()})`;
      }
      return copy;
    });
    showNotification('Potongan obral berhasil diterapkan!');
  };

  // ATK Sheets Helper
  const handleAddAtkSheets = () => {
    const sheets = atkSheets || 1;
    let pricePerSheet = 300;
    let title = 'Fotocopy Hitam Putih A4';
    if (atkType === 'fc_f4') {
      pricePerSheet = 350;
      title = 'Fotocopy F4 Folio';
    } else if (atkType === 'print_warna') {
      pricePerSheet = 1500;
      title = 'Print Warna Dokumen';
    } else if (atkType === 'print_full') {
      pricePerSheet = 3000;
      title = 'Print Foto / Brosur Full';
    }

    handleAddToCart({
      id: `atk-sheet-${Date.now()}`,
      name: `${title} (${sheets} Lbr)`,
      price: pricePerSheet * sheets,
      buyPrice: Math.round(pricePerSheet * sheets * 0.3),
      unit: 'Lembar',
      qty: 1,
      note: `${sheets} lembar @ Rp ${pricePerSheet}`,
    });
  };

  // Rekap Stats
  const totalOmset = invoices.reduce((s, i) => s + i.total, 0);
  const totalModal = invoices.reduce((s, i) => s + (i.buyTotal || Math.round(i.total * 0.75)), 0);
  const totalProfit = Math.max(0, totalOmset - totalModal);
  const tunaiOmset = invoices.filter((i) => i.paymentMethod === 'tunai').reduce((s, i) => s + i.total, 0);
  const qrisOmset = invoices.filter((i) => i.paymentMethod === 'qris').reduce((s, i) => s + i.total, 0);
  const bonOmset = invoices.filter((i) => i.paymentMethod === 'bon_warga').reduce((s, i) => s + i.total, 0);
  const totalUnpaidBon = bonList.filter((b) => b.status === 'belum_lunas').reduce((s, b) => s + b.amount, 0);

  return (
    <div className="flex-1 flex flex-col bg-stone-950 text-white min-h-screen overflow-x-hidden select-none pb-20">
      {/* ========================================================= */}
      {/* DYNAMIC COLOR-CODED HEADER (7 SUB-KATEGORI ECERAN)        */}
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
              <span className="font-black text-lg tracking-tight block truncate">RITELQU</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded text-white inline-block">
                {currentMeta.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href="/ritelqu.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-black/40 hover:bg-black/60 text-white text-[11px] font-black rounded border border-white/40 tracking-wider inline-flex items-center gap-1"
            >
              [BUKA OFFLINE .HTML]
            </a>
          </div>
        </div>

        {/* 7 Sub-Kategori Quick Scroll Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
          {(Object.keys(SUBCATEGORIES) as RitelSubCategory[]).map((key, idx) => {
            const sub = SUBCATEGORIES[key];
            const isActive = activeSubcat === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveSubcat(key);
                  persistState(invoices, bonList, catalog, storeProfile, key);
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
      {/* 1. TAB KASIR                                              */}
      {/* ========================================================= */}
      {activeTab === 'kasir' && (
        <div className="flex-1 flex flex-col">
          {/* Sub-Category Specialized Toolstrip */}
          <div className="bg-stone-900 border-b border-stone-800 p-3 space-y-2">
            {activeSubcat === 'sembako' && (
              <div>
                <div className="flex justify-between items-center text-xs font-black text-stone-400 mb-1">
                  <span style={{ color: currentMeta.glow }}>OPSI SATUAN CEPAT</span>
                  <span>FAST-MOVING WARGA</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="px-2.5 py-1 text-xs font-black rounded bg-emerald-700 text-white">
                    [ECERAN PCS]
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddToCart({
                        id: 'sb-renceng',
                        name: 'Kopi / Minuman 1 Renceng (10 Sachet)',
                        price: 15000,
                        buyPrice: 12500,
                        unit: 'Renceng',
                        note: 'Harga Lusin/Renceng',
                      })
                    }
                    className="px-2.5 py-1 text-xs font-black rounded bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700 shrink-0"
                  >
                    [+ RENCENG (15k)]
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddToCart({
                        id: 'sb-dus',
                        name: 'Mie Instan 1 Dus / Karton (40 Pcs)',
                        price: 118000,
                        buyPrice: 106000,
                        unit: 'Karton',
                        note: 'Harga Karton',
                      })
                    }
                    className="px-2.5 py-1 text-xs font-black rounded bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700 shrink-0"
                  >
                    [+ DUS MIE (118k)]
                  </button>
                </div>
              </div>
            )}

            {activeSubcat === 'fashion' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black text-stone-400">
                  <span style={{ color: currentMeta.glow }}>PILIH UKURAN & PROMO</span>
                  <button
                    type="button"
                    onClick={() => setIsReturModalOpen(true)}
                    className="px-2 py-0.5 bg-red-700 text-white text-[11px] font-black rounded"
                  >
                    [TUKAR UKURAN / RETUR]
                  </button>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-xs font-black text-stone-400">SIZE:</span>
                  {['S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFashionSize(s)}
                      className={`px-2 py-0.5 rounded text-xs font-black shrink-0 ${
                        fashionSize === s
                          ? 'bg-red-600 text-white'
                          : 'bg-stone-800 text-stone-400 border border-stone-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApplyFashionDiscount(10000)}
                    className="flex-1 py-1 bg-stone-800 text-stone-200 text-xs font-black rounded border border-stone-700"
                  >
                    [OBRAL -10k]
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyFashionDiscount(20000)}
                    className="flex-1 py-1 bg-stone-800 text-stone-200 text-xs font-black rounded border border-stone-700"
                  >
                    [OBRAL -20k]
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyFashionDiscount(0.1, true)}
                    className="flex-1 py-1 bg-red-600 text-white text-xs font-black rounded"
                  >
                    [DISKON 10%]
                  </button>
                </div>
              </div>
            )}

            {activeSubcat === 'apotek' && (
              <div>
                <div className="flex justify-between items-center text-xs font-black text-stone-400 mb-1">
                  <span style={{ color: currentMeta.glow }}>INJEKSI ATURAN PAKAI STRUK</span>
                  <span className="text-emerald-400">TERCETAK DI STRUK</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    '3x1 Sesudah Makan',
                    '2x1 Sebelum Makan',
                    '1x1 Malam Hari',
                    'Bila Perlu / Nyeri',
                    'Oles Luar 2x',
                  ].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setApotekDosage(a)}
                      className={`px-2.5 py-1 rounded text-xs font-black shrink-0 ${
                        apotekDosage === a
                          ? 'bg-cyan-600 text-white'
                          : 'bg-stone-800 text-stone-400 border border-stone-700'
                      }`}
                    >
                      [{a}]
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeSubcat === 'elektronik' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black text-stone-400">
                  <span style={{ color: currentMeta.glow }}>JAMINAN GARANSI STRUK</span>
                  <label className="flex items-center gap-1.5 text-xs font-black text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={elektronikQc}
                      onChange={(e) => setElektronikQc(e.target.checked)}
                      className="accent-emerald-500"
                    />
                    [✓ TES NYALA OK]
                  </label>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    'Garansi 7 Hari',
                    'Garansi 14 Hari',
                    'Garansi Toko 1 Bulan',
                    'Garansi Resmi 1 Tahun',
                  ].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setElektronikWarranty(w)}
                      className={`px-2.5 py-1 rounded text-xs font-black shrink-0 ${
                        elektronikWarranty === w
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-800 text-stone-400 border border-stone-700'
                      }`}
                    >
                      [{w}]
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeSubcat === 'furniture' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black text-stone-400">
                  <span style={{ color: currentMeta.glow }}>SKEMA BAYAR & ARMADA TOKO</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setFurnitureMode('Lunas')}
                      className={`px-2 py-0.5 text-xs font-black rounded ${
                        furnitureMode === 'Lunas' ? 'bg-amber-800 text-white' : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      [LUNAS]
                    </button>
                    <button
                      type="button"
                      onClick={() => setFurnitureMode('DP')}
                      className={`px-2 py-0.5 text-xs font-black rounded ${
                        furnitureMode === 'DP' ? 'bg-amber-800 text-white' : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      [DP / COD]
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={furnitureAddress}
                  onChange={(e) => setFurnitureAddress(e.target.value)}
                  placeholder="Alamat Pengiriman Armada Toko & No HP Penerima"
                  className="w-full bg-stone-950 text-white text-xs font-bold px-2.5 py-1.5 rounded border border-stone-800"
                />
              </div>
            )}

            {activeSubcat === 'plastik' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black text-stone-400">
                  <span style={{ color: currentMeta.glow }}>HARGA PACK VS GROSIR BAL</span>
                  <button
                    type="button"
                    onClick={() => setPlastikWholesale(!plastikWholesale)}
                    className={`px-2.5 py-0.5 text-xs font-black rounded ${
                      plastikWholesale ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {plastikWholesale ? '[GROSIR BAL AKTIF]' : '[ECERAN PACK AKTIF]'}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {['Thinwall 500ml', 'Thinwall 650ml', 'Thinwall 750ml', 'Kresek 15', 'Kresek 24', 'Kresek 28'].map(
                    (p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() =>
                          handleAddToCart({
                            id: `pl-${Date.now()}`,
                            name: p,
                            price: plastikWholesale ? 85000 : 18000,
                            buyPrice: plastikWholesale ? 65000 : 13000,
                            unit: plastikWholesale ? 'Ikat (10 Pack)' : 'Pack',
                            note: plastikWholesale ? 'Grosir Bal/Ikat' : 'Eceran Pack',
                          })
                        }
                        className="px-2.5 py-1 bg-stone-800 text-stone-300 text-xs font-black rounded border border-stone-700 shrink-0"
                      >
                        [+ {p}]
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {activeSubcat === 'atk' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black text-stone-400">
                  <span style={{ color: currentMeta.glow }}>KALKULATOR LEMBARAN OTOMATIS</span>
                  <span>TARIF PER LEMBAR</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={atkSheets}
                    onChange={(e) => setAtkSheets(parseInt(e.target.value) || 1)}
                    min={1}
                    className="w-16 bg-stone-950 text-white text-xs font-black text-center py-1 rounded border border-stone-700"
                  />
                  <span className="text-xs font-black text-stone-400">Lbr x</span>
                  <select
                    value={atkType}
                    onChange={(e) => setAtkType(e.target.value)}
                    className="flex-1 bg-stone-950 text-white text-xs font-black py-1 px-2 rounded border border-stone-700"
                  >
                    <option value="fc_a4">FC Hitam Putih A4 (Rp 300)</option>
                    <option value="fc_f4">FC F4 Folio (Rp 350)</option>
                    <option value="print_warna">Print Warna Dokumen (Rp 1.500)</option>
                    <option value="print_full">Print Foto/Brosur Full (Rp 3.000)</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddAtkSheets}
                    className="px-3 py-1 bg-indigo-600 text-white text-xs font-black rounded hover:bg-indigo-500 shrink-0"
                  >
                    [+ HITUNG]
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preset Fast-Moving Underline List */}
          <div className="px-3.5 py-2 flex justify-between items-center text-xs font-black text-stone-400">
            <span>PRESET CEPAT ({currentMeta.label})</span>
            <button
              type="button"
              onClick={() => setIsCustomModalOpen(true)}
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
                    Rp {preset.price.toLocaleString('id-ID')} / {preset.unit}
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
              KERANJANG TRANSAKSI ({cart.length} ITEM)
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
                Keranjang kosong. Tekan tombol [+ TAMBAH] pada barang di atas.
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

          {/* Sticky Calculation & Checkout Panel */}
          <div className="p-3.5 bg-stone-900 border-t border-stone-800 space-y-2.5 mt-auto">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider block">
                  TOTAL TAGIHAN
                </span>
                <span className="text-2xl font-black" style={{ color: currentMeta.glow }}>
                  Rp {totalCart.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
                  STATUS
                </span>
                <span className="text-xs font-black text-stone-200">
                  {activeSubcat === 'furniture'
                    ? furnitureMode === 'DP'
                      ? 'DP / COD PENGANTARAN'
                      : 'LUNAS DI TOKO'
                    : currentMeta.label}
                </span>
              </div>
            </div>

            {/* Quick Cash Presets */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setCashGiven(totalCart.toString())}
                className="py-1.5 bg-stone-800 text-white text-xs font-black rounded border border-stone-700"
              >
                [UANG PAS]
              </button>
              <button
                type="button"
                onClick={() => setCashGiven('20000')}
                className="py-1.5 bg-stone-800 text-white text-xs font-black rounded border border-stone-700"
              >
                [20.000]
              </button>
              <button
                type="button"
                onClick={() => setCashGiven('50000')}
                className="py-1.5 bg-stone-800 text-white text-xs font-black rounded border border-stone-700"
              >
                [50.000]
              </button>
              <button
                type="button"
                onClick={() => setCashGiven('100000')}
                className="py-1.5 bg-stone-800 text-white text-xs font-black rounded border border-stone-700"
              >
                [100.000]
              </button>
            </div>

            {/* Cash Input & Change Calculation */}
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
                    showNotification('Keranjang kosong!');
                    return;
                  }
                  setIsBonModalOpen(true);
                }}
                className="py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-sm uppercase tracking-wider rounded border border-amber-400 active:scale-95 transition-transform"
              >
                [CATAT BON]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TAB BON WARGA                                          */}
      {/* ========================================================= */}
      {activeTab === 'bon' && (
        <div className="flex-1 flex flex-col">
          <div className="p-4 bg-stone-900 border-b border-stone-800 flex justify-between items-center">
            <div>
              <span className="text-xs font-black text-stone-400 uppercase tracking-wider block">
                TOTAL PIUTANG WARGA
              </span>
              <span className="text-2xl font-black text-amber-400">
                Rp {totalUnpaidBon.toLocaleString('id-ID')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setBonName('');
                setBonPhone('');
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
                Tidak ada catatan piutang / bon warga.
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
                      </div>
                      <div className="text-sm font-black text-amber-400 mt-1">
                        Rp {bon.amount.toLocaleString('id-ID')}
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5 font-semibold">
                        Tgl: {bon.date} | Jatuh Tempo: <b className="text-white">{bon.dueDate}</b>
                      </div>
                      {bon.notes && <div className="text-xs text-stone-300 mt-0.5">Ket: {bon.notes}</div>}
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
      {/* 3. TAB REKAP PENJUALAN                                    */}
      {/* ========================================================= */}
      {activeTab === 'rekap' && (
        <div className="flex-1 flex flex-col">
          <div className="p-4 bg-stone-900 border-b border-stone-800">
            <span className="text-xs font-black text-stone-400 uppercase tracking-wider block">
              TOTAL OMSET PENJUALAN
            </span>
            <span className="text-2xl font-black" style={{ color: currentMeta.glow }}>
              Rp {totalOmset.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-bold text-stone-300 block mt-1">
              Estimasi Laba Bersih: Rp {totalProfit.toLocaleString('id-ID')} ({invoices.length} Transaksi)
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
              <span className="text-[11px] font-black text-amber-400 block">BON PIUTANG</span>
              <span className="text-sm font-black text-white mt-1 block">
                Rp {bonOmset.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="p-3 bg-stone-900 border-b border-stone-800 flex justify-between items-center text-xs font-black text-stone-400">
            <span>RIWAYAT TRANSAKSI TERAKHIR</span>
            <button
              type="button"
              onClick={() => {
                if (confirm('Hapus semua riwayat transaksi rekap?')) {
                  setInvoices([]);
                  persistState([]);
                  showNotification('Riwayat rekap dihapus');
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
                Belum ada riwayat transaksi tercatat.
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
      {/* 4. TAB KATALOG                                            */}
      {/* ========================================================= */}
      {activeTab === 'katalog' && (
        <div className="flex-1 flex flex-col">
          <div className="p-3.5 bg-stone-900 border-b border-stone-800 flex justify-between items-center">
            <span className="text-xs font-black uppercase text-stone-400">
              KATALOG: <b style={{ color: currentMeta.glow }}>{currentMeta.label}</b>
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
              + [TAMBAH BARANG]
            </button>
          </div>

          <div className="divide-y divide-stone-800 border-b border-stone-800 bg-stone-950">
            {catalog.filter((c) => c.category === activeSubcat).length === 0 ? (
              <div className="py-12 text-center text-sm font-bold text-stone-500">
                Belum ada produk di katalog sub-kategori ini.
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
                          Jual: Rp {item.price.toLocaleString('id-ID')}
                        </span>
                        <span>Modal: Rp {(item.buyPrice || 0).toLocaleString('id-ID')}</span>
                        <span className="text-stone-300">
                          Stok: {item.stock} {item.unit}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-black rounded border border-stone-700"
                      >
                        [+ KERANJANG]
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = catalog.filter((c) => c.id !== item.id);
                          setCatalog(updated);
                          persistState(invoices, bonList, updated);
                          showNotification('Barang dihapus dari katalog');
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
              {(Object.keys(SUBCATEGORIES) as RitelSubCategory[]).map((key) => {
                const sub = SUBCATEGORIES[key];
                const isActive = activeSubcat === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActiveSubcat(key);
                      persistState(invoices, bonList, catalog, storeProfile, key);
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
              PROFIL TOKO & STRUK NOTA
            </span>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400">NAMA TOKO</label>
              <input
                type="text"
                value={storeProfile.name}
                onChange={(e) => setStoreProfile({ ...storeProfile, name: e.target.value })}
                onBlur={() => persistState(invoices, bonList, catalog, storeProfile)}
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400">ALAMAT TOKO</label>
              <input
                type="text"
                value={storeProfile.address}
                onChange={(e) => setStoreProfile({ ...storeProfile, address: e.target.value })}
                onBlur={() => persistState(invoices, bonList, catalog, storeProfile)}
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400">NO. HP / WHATSAPP</label>
              <input
                type="text"
                value={storeProfile.phone}
                onChange={(e) => setStoreProfile({ ...storeProfile, phone: e.target.value })}
                onBlur={() => persistState(invoices, bonList, catalog, storeProfile)}
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400">FOOTER / PESAN GARANSI</label>
              <input
                type="text"
                value={storeProfile.footer}
                onChange={(e) => setStoreProfile({ ...storeProfile, footer: e.target.value })}
                onBlur={() => persistState(invoices, bonList, catalog, storeProfile)}
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>
          </div>

          {/* INTERACTIVE THERMAL RECEIPT PREVIEW (PRATINJAU STRUK CETAK DUMMY) */}
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

            {/* Thermal Slip */}
            <div
              className="bg-white text-black p-4 rounded shadow font-mono text-xs max-w-sm mx-auto"
              style={{ lineHeight: 1.4 }}
            >
              <div className="text-center pb-2 border-b border-dashed border-stone-600 mb-2">
                <div className="font-black text-sm">{storeProfile.name.toUpperCase()}</div>
                <div className="text-[11px]">{storeProfile.address}</div>
                <div className="text-[11px]">WA: {storeProfile.phone}</div>
                <div className="text-[10px] mt-1 font-bold">*** {currentMeta.label} ***</div>
              </div>

              <div className="flex justify-between text-[11px] mb-1">
                <span>No: #INV-DEMO-001</span>
                <span>23/10 14:30</span>
              </div>
              <div className="flex justify-between text-[11px] pb-1.5 border-b border-dashed border-stone-600">
                <span>Kasir: {currentUser.name}</span>
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
                      currentMeta.dummyItems.reduce((s, it) => s + it.price, 0) + 10000
                    ).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>KEMBALI:</span>
                  <span>Rp 10.000</span>
                </div>
              </div>

              {/* Sub-category specialized note on receipt */}
              <div className="mt-2 pt-1.5 border-t border-dotted border-stone-400 text-[11px]">
                <div className="font-bold text-[10px] uppercase">
                  CATATAN KHUSUS {currentMeta.label}:
                </div>
                <div>{currentMeta.specialNote}</div>
              </div>

              <div className="text-center pt-2 mt-2 border-t border-dashed border-stone-600 text-[11px]">
                <div>{storeProfile.footer}</div>
                <div className="text-[10px] text-stone-500 mt-1">
                  Powered by RitelQu 7 Sub-Kategori Offline
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

      {/* Modal 1: Catat Bon Warga */}
      {isBonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full max-w-md bg-stone-900 border-t-2 border-amber-500 p-4 space-y-3 rounded-t-lg">
            <div className="flex justify-between items-center">
              <span className="font-black text-base text-amber-400 uppercase">
                CATAT BON / PIUTANG WARGA
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
                NAMA WARGA / PEMINJAM
              </label>
              <input
                type="text"
                value={bonName}
                onChange={(e) => setBonName(e.target.value)}
                placeholder="Contoh: Pak Budi RT 04"
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">
                NO. WHATSAPP (PENAGIHAN)
              </label>
              <input
                type="tel"
                value={bonPhone}
                onChange={(e) => setBonPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">
                TANGGAL JATUH TEMPO
              </label>
              <input
                type="date"
                value={bonDueDate}
                onChange={(e) => setBonDueDate(e.target.value)}
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">CATATAN KHUSUS</label>
              <input
                type="text"
                value={bonNotes}
                onChange={(e) => setBonNotes(e.target.value)}
                placeholder="Janji bayar setelah gajian"
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-black text-stone-300">TOTAL BON:</span>
              <span className="text-xl font-black text-amber-400">
                Rp {totalCart.toLocaleString('id-ID')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleConfirmCatatBon}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-sm uppercase rounded tracking-wider"
            >
              [SIMPAN BON WARGA]
            </button>
          </div>
        </div>
      )}

      {/* Modal 2: Input Manual Item */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end justify-center">
          <div
            className="w-full max-w-md bg-stone-900 border-t-2 p-4 space-y-3 rounded-t-lg"
            style={{ borderColor: currentMeta.glow }}
          >
            <div className="flex justify-between items-center">
              <span className="font-black text-base text-white uppercase">INPUT BARANG MANUAL</span>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="text-xs font-black text-stone-400 hover:text-white"
              >
                [BATAL]
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">NAMA BARANG</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nama barang"
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-stone-400 uppercase">
                  HARGA JUAL (RP)
                </label>
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
                placeholder="Misal: Size L, Tes Nyala OK"
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirmCustomItem}
              className="w-full py-2.5 text-white font-black text-sm uppercase rounded tracking-wider"
              style={{ backgroundColor: currentMeta.color }}
            >
              [MASUKKAN KE TRANSAKSI]
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
              <span className="font-black text-base text-white uppercase">TAMBAH KE KATALOG</span>
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
                onChange={(e) => setCatSubcat(e.target.value as RitelSubCategory)}
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              >
                {(Object.keys(SUBCATEGORIES) as RitelSubCategory[]).map((k) => (
                  <option key={k} value={k}>
                    {SUBCATEGORIES[k].name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">NAMA BARANG</label>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Nama barang"
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-stone-400 uppercase">
                  HARGA JUAL (RP)
                </label>
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
                  HARGA MODAL (RP)
                </label>
                <input
                  type="number"
                  value={catBuyPrice}
                  onChange={(e) => setCatBuyPrice(e.target.value)}
                  placeholder="0"
                  className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-stone-400 uppercase">STOK</label>
                <input
                  type="number"
                  value={catStock}
                  onChange={(e) => setCatStock(e.target.value)}
                  className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
                />
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
            </div>

            <button
              type="button"
              onClick={handleConfirmAddCatalog}
              className="w-full py-2.5 text-white font-black text-sm uppercase rounded tracking-wider"
              style={{ backgroundColor: currentMeta.color }}
            >
              [SIMPAN KE KATALOG]
            </button>
          </div>
        </div>
      )}

      {/* Modal 4: Retur Size */}
      {isReturModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full max-w-md bg-stone-900 border-t-2 border-red-500 p-4 space-y-3 rounded-t-lg">
            <div className="flex justify-between items-center">
              <span className="font-black text-base text-red-400 uppercase">
                TUKAR UKURAN / RETUR SIZE
              </span>
              <button
                type="button"
                onClick={() => setIsReturModalOpen(false)}
                className="text-xs font-black text-stone-400 hover:text-white"
              >
                [BATAL]
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">
                BARANG YANG DIKEMBALIKAN
              </label>
              <input
                type="text"
                value={returOldItem}
                onChange={(e) => setReturOldItem(e.target.value)}
                placeholder="Contoh: Kemeja Flanel M"
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">
                UKURAN PENGGANTI BARU
              </label>
              <input
                type="text"
                value={returNewSize}
                onChange={(e) => setReturNewSize(e.target.value)}
                placeholder="Contoh: Tukar ke Size XL"
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-stone-400 uppercase">
                NAMA PEMBELI & WA
              </label>
              <input
                type="text"
                value={returBuyer}
                onChange={(e) => setReturBuyer(e.target.value)}
                placeholder="Mbak Rini (0812...)"
                className="w-full bg-stone-950 text-white font-bold text-xs p-2 rounded border border-stone-800"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirmReturSize}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase rounded tracking-wider"
            >
              [BUKUKAN RETUR UKURAN]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
