import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  ArrowLeft,
  Store,
  Truck,
  MapPin,
  Mic,
  MicOff,
  Clock,
  Printer,
  FileText,
  DollarSign,
  TrendingUp,
  Package,
  Settings,
  Plus,
  Minus,
  CheckCircle2,
  Trash2,
  Share2,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  Phone,
  Flame,
  MessageCircle,
  HelpCircle,
  X,
  CreditCard,
  QrCode,
  User,
  AlertCircle
} from 'lucide-react';
import {
  KulinerSubCategory,
  KulinerMenuItem,
  KulinerCartItem,
  KulinerOrder,
  KulinerProfile,
  UserProfile
} from '../../types';
import {
  KulinerStorage,
  KulinerAppData,
  DEFAULT_KULINER_MENU,
  DEFAULT_KULINER_PROFILE
} from '../../services/storageKuliner';

interface KulinerQuViewProps {
  currentUser?: UserProfile;
  onBackToAppQu: () => void;
  showNotification: (msg: string) => void;
}

export const KulinerQuView: React.FC<KulinerQuViewProps> = ({
  currentUser,
  onBackToAppQu,
  showNotification,
}) => {
  // Master state
  const [data, setData] = useState<KulinerAppData>(() => KulinerStorage.loadData());
  const [activeTab, setActiveTab] = useState<'kasir' | 'bon' | 'rekap' | 'stok' | 'setting'>('kasir');

  // Active Order / Cart State
  const [cart, setCart] = useState<KulinerCartItem[]>([]);
  const [orderType, setOrderType] = useState<'dine_in' | 'bungkus'>('dine_in');
  const [tableOrCustomer, setTableOrCustomer] = useState('');
  const [kitchenNotes, setKitchenNotes] = useState('');
  const [cashGiven, setCashGiven] = useState<number>(0);

  // Modals
  const [isBonModalOpen, setIsBonModalOpen] = useState(false);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [isKitchenSlipModalOpen, setIsKitchenSlipModalOpen] = useState(false);
  const [isPortionModalOpen, setIsPortionModalOpen] = useState(false);
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<KulinerOrder | null>(null);

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);

  // Form states for Bon
  const [bonName, setBonName] = useState('');
  const [bonPhone, setBonPhone] = useState('');
  const [bonAddress, setBonAddress] = useState('');
  const [bonDueDate, setBonDueDate] = useState(() => {
    return new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
  });

  // Form states for Portions
  const [newPortionTarget, setNewPortionTarget] = useState(data.profile.dailyPortionTarget || 80);

  // Form states for New Menu
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuCat, setNewMenuCat] = useState<'makanan' | 'minuman' | 'porsi_preset' | 'ekstra'>('porsi_preset');
  const [newMenuPrice, setNewMenuPrice] = useState('');
  const [newMenuCogs, setNewMenuCogs] = useState('');

  // Form states for Profile
  const [profStoreName, setProfStoreName] = useState(data.profile.storeName);
  const [profOwnerName, setProfOwnerName] = useState(data.profile.ownerName);
  const [profPhone, setProfPhone] = useState(data.profile.phone);
  const [profAddress, setProfAddress] = useState(data.profile.address);

  // Reload data on mount
  useEffect(() => {
    const loaded = KulinerStorage.loadData();
    setData(loaded);
  }, []);

  const totalBill = cart.reduce((sum, it) => sum + it.price * it.qty, 0);
  const totalCogs = cart.reduce((sum, it) => sum + it.cogs * it.qty, 0);
  const totalItemsCount = cart.reduce((sum, it) => sum + it.qty, 0);
  const changeAmount = cashGiven > totalBill ? cashGiven - totalBill : 0;

  // Sub-Category Switcher
  const handleSwitchSubCategory = (subCat: KulinerSubCategory) => {
    KulinerStorage.playBeep('tap');
    const updated = KulinerStorage.updateProfile({ subCategory: subCat });
    setData(updated);
    showNotification(
      subCat === 'kios_ruko'
        ? 'Mode Kios/Ruko Aktif (Hold Bill & Meja)'
        : subCat === 'mangkal_gerobak'
        ? 'Mode Mangkal Aktif (Porsi Cepat & Uang Pas)'
        : 'Mode Keliling Aktif (Hands-Free & Stok Berangkat)'
    );
  };

  // Preset Addition
  const handleAddPreset = (menuItem: KulinerMenuItem) => {
    KulinerStorage.playBeep('tap');
    const existing = cart.find((it) => it.menuId === menuItem.id);
    if (existing) {
      setCart(
        cart.map((it) => (it.menuId === menuItem.id ? { ...it, qty: it.qty + 1 } : it))
      );
    } else {
      setCart([
        ...cart,
        {
          id: `c-${Date.now()}-${Math.random()}`,
          menuId: menuItem.id,
          name: menuItem.name,
          portionType: menuItem.portionType || 'custom',
          price: menuItem.price,
          cogs: menuItem.cogs,
          qty: 1,
        },
      ]);
    }
  };

  const handleUpdateQty = (cartId: string, delta: number) => {
    KulinerStorage.playBeep('tap');
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.id === cartId) {
            const next = it.qty + delta;
            return next > 0 ? { ...it, qty: next } : null;
          }
          return it;
        })
        .filter(Boolean) as KulinerCartItem[]
    );
  };

  const handleClearCart = () => {
    KulinerStorage.playBeep('tap');
    setCart([]);
    setCashGiven(0);
    setKitchenNotes('');
    setTableOrCustomer('');
  };

  const handleSetQuickCash = (val: 'pas' | number) => {
    KulinerStorage.playBeep('tap');
    if (val === 'pas') {
      setCashGiven(totalBill);
    } else {
      setCashGiven(val);
    }
  };

  // Direct Checkout Execution: CASH, QRIS
  const handleExecuteCheckout = (method: 'cash' | 'qris') => {
    if (totalBill <= 0) {
      showNotification('Pilih item porsi terlebih dahulu!');
      return;
    }

    KulinerStorage.playBeep('cash');
    const orderNumber = `KUL-${(data.orders.length + 1).toString().padStart(3, '0')}`;
    const defaultLabel =
      tableOrCustomer.trim() ||
      (orderType === 'dine_in' ? 'Makan di Tempat' : 'Bungkus / Takeaway');

    const newOrder: KulinerOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      subCategory: data.profile.subCategory,
      orderType,
      tableOrCustomer: defaultLabel,
      items: [...cart],
      subtotal: totalBill,
      discount: 0,
      total: totalBill,
      cogsTotal: totalCogs,
      paymentMethod: method,
      cashGiven: method === 'cash' ? (cashGiven >= totalBill ? cashGiven : totalBill) : totalBill,
      change: method === 'cash' ? (cashGiven > totalBill ? cashGiven - totalBill : 0) : 0,
      status: 'paid',
      kitchenNotes,
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
    };

    const updated = KulinerStorage.addOrder(newOrder);
    setData(updated);
    setLastCompletedOrder(newOrder);
    setIsKitchenSlipModalOpen(true);
    handleClearCart();
    showNotification(`Pembayaran ${method.toUpperCase()} LUNAS! Transaksi ${orderNumber} berhasil dicatat.`);
  };

  // Hold Order (Kios / Ruko)
  const handleExecuteHoldOrder = () => {
    if (totalBill <= 0) {
      showNotification('Pilih item terlebih dahulu sebelum menahan pesanan!');
      return;
    }

    const label = tableOrCustomer.trim() || `Meja ${data.openBills.length + 1}`;
    KulinerStorage.playBeep('tap');

    const openBill: KulinerOrder = {
      id: `hld-${Date.now()}`,
      orderNumber: `HLD-${data.openBills.length + 1}`,
      subCategory: 'kios_ruko',
      orderType,
      tableOrCustomer: label,
      items: [...cart],
      subtotal: totalBill,
      discount: 0,
      total: totalBill,
      cogsTotal: totalCogs,
      paymentMethod: 'cash',
      status: 'open_bill',
      kitchenNotes,
      createdAt: new Date().toISOString(),
    };

    const updated = KulinerStorage.saveOpenBill(openBill);
    setData(updated);
    handleClearCart();
    showNotification(`Pesanan ${label} berhasil disimpan di Hold Bill.`);
  };

  const handleResumeHoldOrder = (bill: KulinerOrder) => {
    KulinerStorage.playBeep('tap');
    setCart([...bill.items]);
    setOrderType(bill.orderType);
    setTableOrCustomer(bill.tableOrCustomer);
    setKitchenNotes(bill.kitchenNotes || '');
    const updated = KulinerStorage.removeOpenBill(bill.id);
    setData(updated);
    setIsHoldModalOpen(false);
    showNotification(`Pesanan ${bill.tableOrCustomer} dimuat kembali ke kasir.`);
  };

  // Catat Bon Warga Modal & Action
  const handleOpenBonModal = () => {
    if (totalBill <= 0) {
      showNotification('Pilih item porsi terlebih dahulu!');
      return;
    }
    KulinerStorage.playBeep('alert');
    setIsBonModalOpen(true);
  };

  const handleSaveBonOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonName.trim()) {
      showNotification('Harap masukkan nama warga pemutang!');
      return;
    }

    KulinerStorage.playBeep('cash');
    const orderNumber = `BON-${(data.orders.length + 1).toString().padStart(3, '0')}`;

    const newOrder: KulinerOrder = {
      id: `bon-${Date.now()}`,
      orderNumber,
      subCategory: data.profile.subCategory,
      orderType,
      tableOrCustomer: bonName,
      items: [...cart],
      subtotal: totalBill,
      discount: 0,
      total: totalBill,
      cogsTotal: totalCogs,
      paymentMethod: 'bon',
      status: 'bon_unpaid',
      bonCustomerName: bonName,
      bonCustomerPhone: bonPhone,
      bonCustomerAddress: bonAddress,
      bonDueDate: bonDueDate,
      bonPaidAmount: 0,
      kitchenNotes,
      createdAt: new Date().toISOString(),
    };

    const updated = KulinerStorage.addOrder(newOrder);
    setData(updated);
    setIsBonModalOpen(false);
    handleClearCart();
    setBonName('');
    setBonPhone('');
    setBonAddress('');
    setActiveTab('bon');
    showNotification(`Catatan Bon Rp ${totalBill.toLocaleString('id-ID')} untuk ${bonName} berhasil disimpan.`);
  };

  // Settle Bon
  const handleSettleBon = (order: KulinerOrder) => {
    const remaining = order.total - (order.bonPaidAmount || 0);
    if (window.confirm(`Konfirmasi pelunasan bon Rp ${remaining.toLocaleString('id-ID')} oleh ${order.bonCustomerName}?`)) {
      KulinerStorage.playBeep('cash');
      const updated = KulinerStorage.settleBon(order.id, 'cash');
      setData(updated);
      showNotification(`Bon atas nama ${order.bonCustomerName} dinyatakan LUNAS!`);
    }
  };

  const handleSendWhatsAppReminder = (order: KulinerOrder) => {
    if (!order.bonCustomerPhone) {
      showNotification('Nomor WhatsApp belum terdaftar di bon ini.');
      return;
    }

    const sisa = order.total - (order.bonPaidAmount || 0);
    const itemDesc = order.items.map((it) => `${it.qty}x ${it.name}`).join(', ');
    let cleanPhone = order.bonCustomerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.substring(1);

    const msg = encodeURIComponent(
      `Halo ${order.bonCustomerName}, salam hangat dari ${data.profile.storeName}. 🙏\n\n` +
      `Sekadar catatan ramah mengenai pesanan (${itemDesc}) dengan sisa tagihan sebesar *Rp ${sisa.toLocaleString('id-ID')}* (Jatuh tempo: ${order.bonDueDate || '-'}).\n\n` +
      `Bisa ditransfer melalui QRIS atau dititipkan saat kami lewat/mangkal. Terima kasih banyak atas rezeki dan kerjasamanya! 😊`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  // Voice Simulation & Speech API
  const handleSimulateVoice = (phrase: string) => {
    KulinerStorage.playBeep('tap');
    showNotification(`Suara terdeteksi: "${phrase}". Menambahkan ke pesanan...`);
    const lower = phrase.toLowerCase();

    let qty = 1;
    if (lower.includes('dua') || lower.includes('2')) qty = 2;
    else if (lower.includes('tiga') || lower.includes('3')) qty = 3;
    else if (lower.includes('empat') || lower.includes('4')) qty = 4;

    if (lower.includes('jumbo')) {
      const item = data.menu.find((m) => m.portionType === 'jumbo');
      if (item) {
        for (let i = 0; i < qty; i++) handleAddPreset(item);
      }
    } else if (lower.includes('setengah')) {
      const item = data.menu.find((m) => m.portionType === 'setengah');
      if (item) {
        for (let i = 0; i < qty; i++) handleAddPreset(item);
      }
    } else {
      const item = data.menu.find((m) => m.portionType === 'biasa');
      if (item) {
        for (let i = 0; i < qty; i++) handleAddPreset(item);
      }
    }

    if (lower.includes('es teh') || lower.includes('teh')) {
      const drink = data.menu.find((m) => m.name.toLowerCase().includes('es teh'));
      if (drink) handleAddPreset(drink);
    }

    if (lower.includes('bungkus')) setOrderType('bungkus');
    else if (lower.includes('meja') || lower.includes('tempat')) setOrderType('dine_in');

    if (lower.includes('pedas')) setKitchenNotes((prev) => (prev ? `${prev}, Pedas` : 'Pedas'));
  };

  const handleToggleVoiceRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showNotification('Web Speech API tidak didukung di browser ini. Gunakan tombol simulasi suara di bawah.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        KulinerStorage.playBeep('voice');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSimulateVoice(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Target Porsi Setting
  const handleSavePortionTarget = () => {
    if (newPortionTarget > 0) {
      const updated = KulinerStorage.updateProfile({
        dailyPortionTarget: newPortionTarget,
        dailyPortionRemaining: newPortionTarget,
      });
      setData(updated);
      setIsPortionModalOpen(false);
      showNotification(`Target kuota berangkat berhasil diatur: ${newPortionTarget} Porsi.`);
    }
  };

  // New Menu Item
  const handleSaveNewMenu = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(newMenuPrice);
    const cogsNum = parseInt(newMenuCogs) || Math.round(priceNum * 0.5);

    if (!newMenuName.trim() || isNaN(priceNum)) {
      showNotification('Nama menu dan harga jual wajib diisi!');
      return;
    }

    const newItem: KulinerMenuItem = {
      id: `k-${Date.now()}`,
      name: newMenuName,
      category: newMenuCat,
      portionType: newMenuCat === 'porsi_preset' ? 'custom' : undefined,
      price: priceNum,
      cogs: cogsNum,
      isPreset: newMenuCat === 'porsi_preset',
      icon: newMenuCat === 'minuman' ? '🥤' : '🍜',
    };

    const updated = KulinerStorage.updateMenu([...data.menu, newItem]);
    setData(updated);
    setIsAddMenuModalOpen(false);
    setNewMenuName('');
    setNewMenuPrice('');
    setNewMenuCogs('');
    showNotification(`Menu baru "${newMenuName}" berhasil ditambahkan.`);
  };

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = KulinerStorage.updateProfile({
      storeName: profStoreName,
      ownerName: profOwnerName,
      phone: profPhone,
      address: profAddress,
    });
    setData(updated);
    setIsProfileModalOpen(false);
    showNotification('Profil lapak kuliner berhasil diperbarui.');
  };

  // Export / Import JSON
  const handleExportJSON = () => {
    const jsonStr = KulinerStorage.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kulinerqu_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Data cadangan berhasil diunduh ke perangkat.');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = KulinerStorage.importJSON(content);
      if (success) {
        setData(KulinerStorage.loadData());
        showNotification('Data cadangan berhasil dipulihkan!');
      } else {
        showNotification('Gagal memulihkan data: Format tidak sesuai.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSampleData = () => {
    if (window.confirm('Yakin ingin mereset data KulinerQu kembali ke preset sampel awal?')) {
      const fresh = KulinerStorage.resetSampleData();
      setData(fresh);
      showNotification('Data telah direset ke setelan sampel awal.');
    }
  };

  // Calculation for Rekap & Cash Flow
  let rekapCash = 0;
  let rekapQris = 0;
  let rekapBon = 0;
  data.orders.forEach((o) => {
    if (o.status === 'paid') {
      if (o.paymentMethod === 'cash') rekapCash += o.total;
      else if (o.paymentMethod === 'qris') rekapQris += o.total;
      else if (o.paymentMethod === 'bon') rekapCash += o.total;
    } else if (o.paymentMethod === 'bon') {
      rekapBon += o.total - (o.bonPaidAmount || 0);
      if (o.bonPaidAmount) rekapCash += o.bonPaidAmount;
    }
  });

  const unpaidBonOrders = data.orders.filter(
    (o) => o.paymentMethod === 'bon' && o.status !== 'paid'
  );
  const totalUnpaidBon = unpaidBonOrders.reduce(
    (sum, o) => sum + (o.total - (o.bonPaidAmount || 0)),
    0
  );

  const remainingPortions = data.profile.dailyPortionRemaining || 0;
  const targetPortions = data.profile.dailyPortionTarget || 80;
  const portionPct = Math.max(0, Math.min(100, Math.round((remainingPortions / targetPortions) * 100)));

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-white select-none overflow-hidden font-sans">
      {/* ========================================================= */}
      {/* 1. TOP HEADER BAR WITH BOLD OUTDOOR BRANDING              */}
      {/* ========================================================= */}
      <header className="bg-zinc-900/95 border-b border-zinc-800/90 px-3.5 py-2.5 shrink-0 z-20 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToAppQu}
              className="p-1.5 -ml-1 text-zinc-400 hover:text-white active:scale-95 transition-all cursor-pointer rounded-lg bg-zinc-800/70 border border-zinc-700/60"
              title="Kembali ke UsahaQu"
            >
              <ArrowLeft className="w-5 h-5 text-amber-400" />
            </button>
            <div className="flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
              <h1 className="text-lg font-black tracking-tight text-white">
                Kuliner<span className="text-amber-400">Qu</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Standalone HTML Shortcut */}
            <a
              href="/kulinerqu.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-extrabold bg-zinc-800 text-cyan-400 border border-cyan-500/40 px-2 py-1 rounded-full flex items-center gap-1 hover:bg-zinc-700 active:scale-95 transition-all"
              title="Buka Single-File Offline HTML"
            >
              <ExternalLink className="w-3 h-3" />
              <span>HTML Offline</span>
            </a>

            {/* Sub-Category Indicator Badge */}
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                data.profile.subCategory === 'kios_ruko'
                  ? 'bg-cyan-950/70 text-cyan-400 border-cyan-500/50'
                  : data.profile.subCategory === 'mangkal_gerobak'
                  ? 'bg-amber-950/70 text-amber-300 border-amber-500/50'
                  : 'bg-emerald-950/70 text-emerald-400 border-emerald-500/50'
              }`}
            >
              {data.profile.subCategory === 'kios_ruko'
                ? 'Kios / Ruko'
                : data.profile.subCategory === 'mangkal_gerobak'
                ? 'Mangkal'
                : 'Keliling'}
            </span>
          </div>
        </div>

        {/* Real-Time Countdown Sisa Porsi Bawaan (Stok Berangkat) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-extrabold uppercase tracking-wider text-[10px]">
                Stok Berangkat (Hari Ini):
              </span>
              <span className="font-black text-amber-400 text-sm">
                {remainingPortions} / {targetPortions} Porsi
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  portionPct < 20
                    ? 'bg-red-500'
                    : 'bg-gradient-to-r from-amber-400 to-emerald-400'
                }`}
                style={{ width: `${portionPct}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => {
              setNewPortionTarget(data.profile.dailyPortionTarget || 80);
              setIsPortionModalOpen(true);
            }}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-xs font-bold rounded-lg border border-zinc-700 text-zinc-200 cursor-pointer shrink-0"
          >
            Atur
          </button>
        </div>

        {/* 1-Tap Sub-Category Switcher Header Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          {[
            { id: 'kios_ruko', label: '🏢 Kios / Ruko', sub: 'Makan di Tempat & Antrean' },
            { id: 'mangkal_gerobak', label: '🛒 Mangkal / Gerobak', sub: 'Porsi Cepat & Uang Pas' },
            { id: 'keliling_asongan', label: '🛵 Keliling / Asongan', sub: 'Voice & Sisa Porsi' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSwitchSubCategory(cat.id as KulinerSubCategory)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide whitespace-nowrap transition-all border cursor-pointer ${
                data.profile.subCategory === cat.id
                  ? 'bg-white text-zinc-950 border-white shadow-md scale-102'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. BODY CONTENT (BASED ON ACTIVE NAVIGATION TAB)          */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* ======================================================= */}
        {/* TAB 1: KASIR & DYNAMIC SMART CALCULATOR                */}
        {/* ======================================================= */}
        {activeTab === 'kasir' && (
          <div className="flex flex-col">
            {/* KIOS SPECIAL: Open Bill / Hold Orders & Dine-In Toggle */}
            {data.profile.subCategory === 'kios_ruko' && (
              <div className="bg-zinc-900 border-b border-zinc-800 px-3.5 py-2.5 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 flex-1">
                  <button
                    onClick={() => {
                      KulinerStorage.playBeep('tap');
                      setOrderType('dine_in');
                    }}
                    className={`flex-1 py-2 px-2 text-xs font-black rounded-lg border transition-all text-center cursor-pointer ${
                      orderType === 'dine_in'
                        ? 'bg-cyan-500 text-zinc-950 border-cyan-400'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    🍽️ Makan di Tempat
                  </button>
                  <button
                    onClick={() => {
                      KulinerStorage.playBeep('tap');
                      setOrderType('bungkus');
                    }}
                    className={`flex-1 py-2 px-2 text-xs font-black rounded-lg border transition-all text-center cursor-pointer ${
                      orderType === 'bungkus'
                        ? 'bg-cyan-500 text-zinc-950 border-cyan-400'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    🥡 Bungkus
                  </button>
                </div>

                <button
                  onClick={() => setIsHoldModalOpen(true)}
                  className="bg-zinc-800 border border-cyan-500/40 text-cyan-400 px-3 py-2 rounded-lg text-xs font-black whitespace-nowrap active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Hold Bill ({data.openBills.length})</span>
                </button>
              </div>
            )}

            {/* KELILING SPECIAL: Voice Command Banner & Simulation */}
            {data.profile.subCategory === 'keliling_asongan' && (
              <div className="p-3 bg-zinc-900 border-b border-zinc-800 space-y-2">
                <div className="border border-dashed border-emerald-500/60 rounded-xl p-3 flex items-center justify-between gap-3 bg-emerald-950/20">
                  <div className="flex-1">
                    <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5" />
                      <span>Pesan Hands-Free (Suara)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Ucapkan pesanan saat tangan sibuk mengolah porsi.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleVoiceRecognition}
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-black transition-all cursor-pointer ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-emerald-500 text-zinc-950 active:scale-95'
                    }`}
                    title="Mulai Rekam Suara"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>

                {/* Simulated Voice Quick Chips for instant mobile testing */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                  <button
                    onClick={() => handleSimulateVoice('2 Porsi Biasa Bungkus, 1 Es Teh')}
                    className="px-2.5 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full font-bold whitespace-nowrap hover:bg-zinc-700 cursor-pointer"
                  >
                    🗣️ "2 Porsi Bungkus + 1 Es Teh"
                  </button>
                  <button
                    onClick={() => handleSimulateVoice('1 Porsi Jumbo Meja 2 Pedas')}
                    className="px-2.5 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full font-bold whitespace-nowrap hover:bg-zinc-700 cursor-pointer"
                  >
                    🗣️ "1 Porsi Jumbo Pedas"
                  </button>
                  <button
                    onClick={() => handleSimulateVoice('3 Porsi Biasa Kuah Pisah')}
                    className="px-2.5 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full font-bold whitespace-nowrap hover:bg-zinc-700 cursor-pointer"
                  >
                    🗣️ "3 Porsi Kuah Pisah"
                  </button>
                </div>
              </div>
            )}

            {/* PRESET PORSI CEPAT GRID (HIGH VELOCITY) */}
            <div className="p-3.5 bg-zinc-950 border-b border-zinc-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                  ⚡ Preset Porsi Cepat (1-Tap Masuk Bill)
                </span>
                <span className="text-[10px] font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                  High Velocity
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {data.menu
                  .filter((m) => m.isPreset || m.category === 'porsi_preset' || m.category === 'ekstra')
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAddPreset(item)}
                      className="bg-zinc-900 border border-zinc-800 hover:border-amber-400/80 active:scale-97 transition-all p-3 rounded-xl flex flex-col justify-between text-left cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xl">{item.icon || '🍜'}</span>
                        <span className="text-[10px] font-black text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                          +1 Tap
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                          {item.name}
                        </div>
                        <div className="text-sm font-black text-amber-400 mt-0.5">
                          Rp {item.price.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* MINIMALIST LIST OF CART ITEMS (NO BOXES, ONLY THIN DIVIDER LINES) */}
            <div className="px-3.5 pt-3 pb-1 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <span>🧾 Rincian Pesanan</span>
                <span className="bg-amber-400 text-zinc-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {totalItemsCount}
                </span>
              </span>
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-xs font-bold text-red-400 hover:text-red-300 active:scale-95 transition-all cursor-pointer"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            {/* List Minimalis Tanpa Kotak */}
            <div className="divide-y divide-zinc-800/80 border-y border-zinc-800/80 mt-1">
              {cart.length === 0 ? (
                <div className="py-8 px-4 text-center text-zinc-500 text-xs font-semibold">
                  Belum ada porsi dipilih. Ketuk preset di atas atau pesan lewat suara.
                </div>
              ) : (
                cart.map((it) => {
                  const lineTotal = it.price * it.qty;
                  return (
                    <div
                      key={it.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex-1 pr-3">
                        <div className="text-sm font-extrabold text-white">{it.name}</div>
                        <div className="text-xs text-zinc-400 font-bold mt-0.5">
                          Rp {it.price.toLocaleString('id-ID')} × {it.qty} ={' '}
                          <span className="text-amber-400 font-black">
                            Rp {lineTotal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleUpdateQty(it.id, -1)}
                          className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-white font-black flex items-center justify-center active:scale-95 cursor-pointer text-sm"
                        >
                          -
                        </button>
                        <span className="text-base font-black text-white min-w-6 text-center">
                          {it.qty}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(it.id, 1)}
                          className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-white font-black flex items-center justify-center active:scale-95 cursor-pointer text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* REQUEST DAPUR & CATATAN RINGKAS */}
            <div className="p-3.5 bg-zinc-950 border-b border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                  Catatan Dapur / Meja / Selera:
                </span>
                <span className="text-[10px] text-zinc-500">Ketuk tag cepat</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['🔥 Pedas', '🌱 Gak Pedas', '🧅 Tanpa Bawang', '🥣 Kuah Pisah', '🥬 Banyak Sayur', '🍚 Nasi Sedikit'].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        KulinerStorage.playBeep('tap');
                        setKitchenNotes((prev) => (prev ? `${prev}, ${tag}` : tag));
                      }}
                      className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-300 hover:bg-zinc-800 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>

              <input
                type="text"
                value={kitchenNotes}
                onChange={(e) => setKitchenNotes(e.target.value)}
                placeholder="Catatan khusus (misal: Meja 02, Kuah Kaldu Banyak)..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* TOTAL TAGIHAN & UANG PAS CALCULATOR */}
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Total Tagihan:
                </span>
                <span className="text-2xl font-black text-amber-400 tracking-tight">
                  Rp {totalBill.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Quick Nominal Buttons */}
              <div>
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5">
                  Uang Tunai Diterima:
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  <button
                    onClick={() => handleSetQuickCash('pas')}
                    className="py-2 px-1 bg-zinc-800 border border-amber-400/60 text-amber-300 text-xs font-black rounded-lg active:scale-95 transition-all cursor-pointer text-center"
                  >
                    UANG PAS
                  </button>
                  {[10000, 20000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleSetQuickCash(amt)}
                      className="py-2 px-1 bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-white text-xs font-black rounded-lg active:scale-95 transition-all cursor-pointer text-center"
                    >
                      {amt / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Kembalian Display Box */}
              <div className="bg-black/60 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-bold">Kembalian Otomatis:</span>
                <div className="text-right">
                  <span className="text-emerald-400 font-black text-base">
                    Rp {changeAmount.toLocaleString('id-ID')}
                  </span>
                  <div className="text-[10px] text-zinc-500 font-semibold">
                    Diterima: Rp {cashGiven.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>

            {/* 3 DIRECT ACTION BUTTONS (CASH, QRIS, CATAT BON) */}
            <div className="p-3.5 bg-zinc-950 grid grid-cols-3 gap-2">
              <button
                onClick={() => handleExecuteCheckout('cash')}
                className="py-3.5 px-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                <span>💵 CASH</span>
                <span className="text-[9px] font-bold opacity-80 uppercase">Bayar Tunai</span>
              </button>

              <button
                onClick={() => handleExecuteCheckout('qris')}
                className="py-3.5 px-2 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black text-sm rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                <span>📱 QRIS</span>
                <span className="text-[9px] font-bold opacity-80 uppercase">Non-Tunai</span>
              </button>

              <button
                onClick={handleOpenBonModal}
                className="py-3.5 px-2 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                <span>📝 CATAT BON</span>
                <span className="text-[9px] font-bold opacity-80 uppercase">Utang Warga</span>
              </button>
            </div>

            {/* KIOS ONLY: SIMPAN PESANAN SEMENTARA */}
            {data.profile.subCategory === 'kios_ruko' && (
              <div className="px-3.5 pb-4">
                <button
                  onClick={handleExecuteHoldOrder}
                  className="w-full py-2.5 bg-zinc-900 border border-dashed border-cyan-500/60 text-cyan-400 font-extrabold text-xs rounded-xl hover:bg-zinc-800 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-4 h-4" />
                  <span>Simpan Pesanan Sementara (Hold Order Meja)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 2: CATATAN BON / PIUTANG WARGA                    */}
        {/* ======================================================= */}
        {activeTab === 'bon' && (
          <div className="flex flex-col">
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-red-400">📝 Buku Catatan Bon Warga</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Pantau utang, pelunasan instan, dan pengingat sopan via WhatsApp.
                </p>
              </div>
              <span className="text-xs font-black bg-red-950/80 text-red-400 border border-red-500/40 px-3 py-1 rounded-full">
                Rp {totalUnpaidBon.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Minimalist List of Bon (No boxes, clean thin dividing lines) */}
            <div className="divide-y divide-zinc-800/80">
              {unpaidBonOrders.length === 0 ? (
                <div className="py-12 px-4 text-center text-zinc-500">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
                  <p className="text-sm font-extrabold text-zinc-300">
                    Tidak ada catatan bon/piutang yang tertunggak.
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Semua transaksi lunas rapi!</p>
                </div>
              ) : (
                unpaidBonOrders.map((b) => {
                  const sisa = b.total - (b.bonPaidAmount || 0);
                  const itemSummary = b.items.map((it) => `${it.qty}x ${it.name}`).join(', ');
                  const dateStr = new Date(b.createdAt).toLocaleDateString('id-ID');

                  return (
                    <div
                      key={b.id}
                      className="px-4 py-3.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-white">
                            {b.bonCustomerName || 'Warga Tanpa Nama'}
                          </span>
                          <span className="text-base font-black text-red-400">
                            Rp {sisa.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 font-semibold mt-0.5">
                          {itemSummary}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-medium mt-1">
                          {b.bonCustomerAddress || 'Warga RT 04'} • Tgl: {dateStr} • Jatuh Tempo:{' '}
                          <span className="text-amber-400 font-bold">{b.bonDueDate || '-'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => handleSettleBon(b)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-lg active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                        >
                          ✓ Lunasi
                        </button>
                        <button
                          onClick={() => handleSendWhatsAppReminder(b)}
                          className="px-2.5 py-1 bg-[#25D366]/20 border border-[#25D366]/50 text-[#25D366] font-extrabold text-[11px] rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WA</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 3: RIWAYAT & REKAP KAS (CASH FLOW RATIO)           */}
        {/* ======================================================= */}
        {activeTab === 'rekap' && (
          <div className="flex flex-col">
            <div className="p-4 bg-zinc-900 border-b border-zinc-800">
              <h2 className="text-base font-black text-white">📊 Rasio Arus Kas (Cash Flow)</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Rekapitulasi penjualan tunai laci, digital QRIS, dan bon warga.
              </p>
            </div>

            {/* 3 Rasio Arus Kas Cards */}
            <div className="p-3.5 grid grid-cols-3 gap-2 border-b border-zinc-800/80 bg-zinc-950">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                <span className="text-[10px] font-black uppercase text-zinc-400">Tunai Laci</span>
                <div className="text-sm font-black text-emerald-400 mt-1">
                  Rp {rekapCash.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                <span className="text-[10px] font-black uppercase text-zinc-400">Digital QRIS</span>
                <div className="text-sm font-black text-sky-400 mt-1">
                  Rp {rekapQris.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                <span className="text-[10px] font-black uppercase text-zinc-400">Belum Lunas</span>
                <div className="text-sm font-black text-red-400 mt-1">
                  Rp {rekapBon.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Riwayat Transaksi List Minimalis */}
            <div className="px-4 py-2.5 flex items-center justify-between text-xs text-zinc-400 font-extrabold uppercase tracking-wider">
              <span>Riwayat Transaksi Terakhir</span>
              <span>{data.orders.length} Transaksi</span>
            </div>

            <div className="divide-y divide-zinc-800/80 border-t border-zinc-800/80">
              {data.orders.length === 0 ? (
                <div className="py-8 px-4 text-center text-zinc-500 text-xs">
                  Belum ada transaksi tersimpan.
                </div>
              ) : (
                data.orders.slice(0, 30).map((ord) => {
                  const isPaid = ord.status === 'paid';
                  const timeStr = new Date(ord.createdAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={ord.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex-1 pr-3">
                        <div className="text-sm font-extrabold text-white">
                          {ord.orderNumber} • {ord.tableOrCustomer}
                        </div>
                        <div className="text-xs text-zinc-400 font-medium mt-0.5">
                          {ord.items.map((it) => `${it.qty}x ${it.name}`).join(', ')}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-semibold mt-1">
                          {timeStr} • {ord.paymentMethod.toUpperCase()}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`text-sm font-black ${
                            isPaid ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          Rp {ord.total.toLocaleString('id-ID')}
                        </div>
                        <span
                          className={`text-[10px] font-extrabold uppercase ${
                            isPaid ? 'text-emerald-500' : 'text-red-500'
                          }`}
                        >
                          {isPaid ? 'LUNAS' : 'BON'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 4: STOK & KATALOG MENU                            */}
        {/* ======================================================= */}
        {activeTab === 'stok' && (
          <div className="flex flex-col">
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white">🍲 Stok & Preset Porsi</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Atur harga modal (COGS), harga jual, dan margin per porsi.
                </p>
              </div>
              <button
                onClick={() => setIsAddMenuModalOpen(true)}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs rounded-xl active:scale-95 transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Menu Baru</span>
              </button>
            </div>

            {/* List Menu Minimalis */}
            <div className="divide-y divide-zinc-800/80">
              {data.menu.map((item) => {
                const margin = item.price - (item.cogs || 0);
                const marginPct = item.price > 0 ? Math.round((margin / item.price) * 100) : 0;

                return (
                  <div
                    key={item.id}
                    className="px-4 py-3 flex items-center justify-between hover:bg-zinc-900/40 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                        <span>{item.icon || '🍲'}</span>
                        <span>{item.name}</span>
                      </div>
                      <div className="text-xs text-zinc-400 font-bold mt-0.5">
                        Modal: Rp {item.cogs.toLocaleString('id-ID')} • Jual:{' '}
                        <span className="text-amber-400">Rp {item.price.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-400">
                        +Rp {margin.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-bold">Margin: {marginPct}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 5: PENGATURAN & SYNC DATA LOCALSTORAGE             */}
        {/* ======================================================= */}
        {activeTab === 'setting' && (
          <div className="flex flex-col">
            <div className="p-4 bg-zinc-900 border-b border-zinc-800">
              <h2 className="text-base font-black text-white">⚙️ Pengaturan KulinerQu</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Konfigurasi profil usaha, target kuota harian, ekspor dan impor cadangan.
              </p>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {/* Profil Lapak */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-zinc-900/40 cursor-pointer"
              >
                <div>
                  <div className="text-sm font-extrabold text-white">{data.profile.storeName}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Pemilik: {data.profile.ownerName} • HP: {data.profile.phone}
                  </div>
                </div>
                <span className="text-xs text-amber-400 font-bold">Ubah ›</span>
              </button>

              {/* Target Porsi */}
              <button
                onClick={() => setIsPortionModalOpen(true)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-zinc-900/40 cursor-pointer"
              >
                <div>
                  <div className="text-sm font-extrabold text-white">Target Porsi Berangkat Harian</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Reset otomatis setiap hari / kuota porsi keliling
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-black">
                  {data.profile.dailyPortionTarget} Porsi ›
                </span>
              </button>

              {/* Ekspor JSON */}
              <button
                onClick={handleExportJSON}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-zinc-900/40 cursor-pointer"
              >
                <div>
                  <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Backup Data (Ekspor JSON)</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Simpan seluruh data transaksi dan katalog ke file lokal
                  </div>
                </div>
                <span className="text-xs text-cyan-400 font-bold">Unduh ›</span>
              </button>

              {/* Impor JSON */}
              <label className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-zinc-900/40 cursor-pointer">
                <div>
                  <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Restore Data (Impor JSON)</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Pulihkan data riwayat dari file JSON cadangan
                  </div>
                </div>
                <span className="text-xs text-amber-400 font-bold">Pilih File ›</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>

              {/* Buka Single-File Standalone HTML */}
              <a
                href="/kulinerqu.html"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-zinc-900/40 cursor-pointer"
              >
                <div>
                  <div className="text-sm font-extrabold text-emerald-400 flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka Single-File HTML Standalone</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Aplikasi web murni 1 file (HTML+CSS+JS) tanpa internet
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-bold">Buka Tab Baru ›</span>
              </a>

              {/* Reset ke Data Sampel */}
              <button
                onClick={handleResetSampleData}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-zinc-900/40 cursor-pointer"
              >
                <div>
                  <div className="text-sm font-extrabold text-red-400 flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset ke Data Sampel</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Kembalikan ke demonstrasi awal KulinerQu
                  </div>
                </div>
                <span className="text-xs text-red-400 font-bold">Reset ›</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. FLOATING BOTTOM NAVIGATION BAR (5 CORE MENUS)          */}
      {/* ========================================================= */}
      <nav
        className="fixed bottom-0 left-0 right-0 h-18 bg-zinc-950/98 backdrop-blur-md border-t border-zinc-800 text-zinc-400 px-2 flex items-center justify-between z-30 shadow-2xl select-none"
        style={{
          paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 1rem) + 0.2rem)',
        }}
      >
        {[
          { id: 'kasir', label: 'Kasir', icon: UtensilsCrossed },
          { id: 'bon', label: 'Catat Bon', icon: FileText, badge: unpaidBonOrders.length },
          { id: 'rekap', label: 'Rekap', icon: TrendingUp },
          { id: 'stok', label: 'Stok', icon: Package },
          { id: 'setting', label: 'Opsi', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                KulinerStorage.playBeep('tap');
                setActiveTab(tab.id as any);
              }}
              className={`relative flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer ${
                isActive ? 'text-amber-400 font-extrabold' : 'hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5.5 h-5.5 ${isActive ? 'scale-110 text-amber-400' : 'text-zinc-400'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-bold mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ========================================================= */}
      {/* 4. MODALS (BON, HOLD, KITCHEN SLIP, PORTION, MENU, PROFIL)*/}
      {/* ========================================================= */}

      {/* MODAL: CATAT BON WARGA */}
      {isBonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-4.5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-base font-black text-red-400">
                📝 Catat Bon / Piutang Warga
              </span>
              <button
                onClick={() => setIsBonModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBonOrder} className="space-y-3">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Nama Warga / Pemesan:
                </label>
                <input
                  type="text"
                  required
                  value={bonName}
                  onChange={(e) => setBonName(e.target.value)}
                  placeholder="Misal: Bu Siti (Blok B4)"
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Nomor WhatsApp (Untuk Reminder):
                </label>
                <input
                  type="tel"
                  value={bonPhone}
                  onChange={(e) => setBonPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Alamat / Blok Rumah:
                </label>
                <input
                  type="text"
                  value={bonAddress}
                  onChange={(e) => setBonAddress(e.target.value)}
                  placeholder="Misal: Blok B4 No 12"
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Jatuh Tempo:
                </label>
                <input
                  type="date"
                  value={bonDueDate}
                  onChange={(e) => setBonDueDate(e.target.value)}
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="bg-black/60 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400">Total Utang:</span>
                <span className="text-xl font-black text-red-400">
                  Rp {totalBill.toLocaleString('id-ID')}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-xl active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                Simpan Catatan Bon
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DAFTAR HOLD ORDER (KIOS) */}
      {isHoldModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-4.5 space-y-3 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-base font-black text-cyan-400">
                ⏳ Daftar Pesanan Ditahan (Open Bill)
              </span>
              <button
                onClick={() => setIsHoldModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-zinc-800">
              {data.openBills.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs font-semibold">
                  Tidak ada pesanan meja yang sedang ditahan.
                </div>
              ) : (
                data.openBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="py-3 flex items-center justify-between hover:bg-zinc-800/40 px-2 rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-extrabold text-cyan-300">
                        {bill.tableOrCustomer}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {bill.items.map((it) => `${it.qty}x ${it.name}`).join(', ')}
                      </div>
                      <div className="text-xs font-black text-amber-400 mt-1">
                        Rp {bill.total.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleResumeHoldOrder(bill)}
                        className="px-3 py-1.5 bg-cyan-500 text-zinc-950 font-black text-xs rounded-lg active:scale-95 cursor-pointer"
                      >
                        Buka
                      </button>
                      <button
                        onClick={() => {
                          const updated = KulinerStorage.removeOpenBill(bill.id);
                          setData(updated);
                        }}
                        className="p-1.5 text-zinc-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KITCHEN SLIP / NOTA DAPUR PREVIEW */}
      {isKitchenSlipModalOpen && lastCompletedOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white text-zinc-950 rounded-2xl p-5 space-y-3 font-mono shadow-2xl">
            <div className="text-center pb-2 border-b border-dashed border-zinc-400">
              <h3 className="text-base font-black uppercase tracking-tight">
                {data.profile.storeName}
              </h3>
              <p className="text-[11px] text-zinc-600">{data.profile.address}</p>
            </div>

            <div className="text-xs flex items-center justify-between">
              <span>No: {lastCompletedOrder.orderNumber}</span>
              <span>
                {new Date(lastCompletedOrder.createdAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="text-xs font-bold bg-zinc-100 p-1.5 rounded">
              Tipe:{' '}
              {lastCompletedOrder.orderType === 'dine_in'
                ? 'MAKAN DI TEMPAT'
                : 'BUNGKUS / TAKEAWAY'}
            </div>

            {lastCompletedOrder.kitchenNotes && (
              <div className="text-xs font-bold text-red-700 bg-red-50 p-1.5 rounded">
                Catatan: {lastCompletedOrder.kitchenNotes}
              </div>
            )}

            <div className="py-2 border-y border-dashed border-zinc-400 space-y-1 text-xs">
              {lastCompletedOrder.items.map((it) => (
                <div key={it.id} className="flex justify-between font-bold">
                  <span>
                    {it.qty}x {it.name}
                  </span>
                  <span>Rp {(it.price * it.qty).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-base font-black">
              <span>TOTAL:</span>
              <span>Rp {lastCompletedOrder.total.toLocaleString('id-ID')}</span>
            </div>

            <div className="flex justify-between text-xs text-zinc-600">
              <span>Metode:</span>
              <span className="font-bold">{lastCompletedOrder.paymentMethod.toUpperCase()}</span>
            </div>

            <div className="flex justify-between text-xs text-zinc-600">
              <span>Kembalian:</span>
              <span className="font-bold">
                Rp {(lastCompletedOrder.change || 0).toLocaleString('id-ID')}
              </span>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Nota</span>
              </button>
              <button
                onClick={() => setIsKitchenSlipModalOpen(false)}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TARGET PORSI */}
      {isPortionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <span className="text-sm font-black text-amber-400">Target Porsi Berangkat</span>
              <button onClick={() => setIsPortionModalOpen(false)} className="text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Atur kuota porsi harian yang dibawa saat mangkal atau keliling:
            </p>
            <input
              type="number"
              value={newPortionTarget}
              onChange={(e) => setNewPortionTarget(parseInt(e.target.value) || 0)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-base font-black text-white text-center focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleSavePortionTarget}
              className="w-full py-2.5 bg-amber-400 text-zinc-950 font-black text-xs rounded-xl active:scale-95 transition-all cursor-pointer"
            >
              Simpan Target
            </button>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH MENU BARU */}
      {isAddMenuModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <span className="text-sm font-black text-white">+ Tambah Menu Kuliner</span>
              <button onClick={() => setIsAddMenuModalOpen(false)} className="text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewMenu} className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold uppercase text-zinc-400 text-[10px]">
                  Nama Menu:
                </label>
                <input
                  type="text"
                  required
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  placeholder="Misal: Porsi Dobel Tetelan"
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-extrabold uppercase text-zinc-400 text-[10px]">
                  Kategori:
                </label>
                <select
                  value={newMenuCat}
                  onChange={(e) => setNewMenuCat(e.target.value as any)}
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="porsi_preset">Porsi Utama (Preset Cepat)</option>
                  <option value="makanan">Makanan Lain</option>
                  <option value="minuman">Minuman</option>
                  <option value="ekstra">Ekstra / Toping</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-extrabold uppercase text-zinc-400 text-[10px]">
                    Harga Jual (Rp):
                  </label>
                  <input
                    type="number"
                    required
                    value={newMenuPrice}
                    onChange={(e) => setNewMenuPrice(e.target.value)}
                    placeholder="15000"
                    className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="font-extrabold uppercase text-zinc-400 text-[10px]">
                    Modal COGS (Rp):
                  </label>
                  <input
                    type="number"
                    value={newMenuCogs}
                    onChange={(e) => setNewMenuCogs(e.target.value)}
                    placeholder="8000"
                    className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 text-zinc-950 font-black text-xs rounded-xl active:scale-95 transition-all cursor-pointer mt-2"
              >
                Simpan Menu Baru
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROFIL LAPAK */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <span className="text-sm font-black text-amber-400">🏪 Ubah Profil Lapak</span>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold uppercase text-zinc-400 text-[10px]">
                  Nama Usaha / Gerobak:
                </label>
                <input
                  type="text"
                  required
                  value={profStoreName}
                  onChange={(e) => setProfStoreName(e.target.value)}
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-extrabold uppercase text-zinc-400 text-[10px]">
                  Nama Pemilik:
                </label>
                <input
                  type="text"
                  required
                  value={profOwnerName}
                  onChange={(e) => setProfOwnerName(e.target.value)}
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-extrabold uppercase text-zinc-400 text-[10px]">
                  Nomor HP / WhatsApp:
                </label>
                <input
                  type="tel"
                  value={profPhone}
                  onChange={(e) => setProfPhone(e.target.value)}
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-extrabold uppercase text-zinc-400 text-[10px]">
                  Alamat / Lokasi Mangkal:
                </label>
                <input
                  type="text"
                  value={profAddress}
                  onChange={(e) => setProfAddress(e.target.value)}
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-400 text-zinc-950 font-black text-xs rounded-xl active:scale-95 transition-all cursor-pointer mt-2"
              >
                Simpan Profil
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
