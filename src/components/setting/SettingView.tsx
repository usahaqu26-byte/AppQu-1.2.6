import React, { useState } from 'react';
import {
  Settings,
  Store,
  Printer,
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Bluetooth,
  CheckCircle2,
  RefreshCw,
  X,
  Check,
  Smartphone,
  Info,
  Download,
  GitBranch,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Globe,
  HelpCircle,
  Users,
  Contact,
  FileCode,
  UserCheck,
  ChevronRight,
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import { RestaurantProfile, PrinterConfig, MenuItem, MenuCategory, ResidentData, UserProfile } from '../../types';
import { PrinterService } from '../../services/printer';
import { UpdateService, UpdateInfo, APP_CURRENT_VERSION, APP_BUILD_NUMBER } from '../../services/updateService';
import { UpdateModal } from '../UpdateModal';
import { WargaView } from '../appqu/WargaView';
import { ArsitekturView } from '../appqu/ArsitekturView';

interface SettingViewProps {
  profile: RestaurantProfile;
  onSaveProfile: (profile: RestaurantProfile) => void;
  printerConfig: PrinterConfig;
  onSavePrinterConfig: (config: PrinterConfig) => void;
  menuList: MenuItem[];
  onSaveMenu: (menu: MenuItem[]) => void;
  // AppQu Governance & Community Integration
  currentUser?: UserProfile;
  residents?: ResidentData[];
  onUpdateResidents?: (residents: ResidentData[]) => void;
  onOpenRoleModal?: () => void;
  onOpenHierarchy?: () => void;
  witnessCount?: number;
  onNavigateToModule?: (module: 'paguyuban' | 'warga' | 'usaha' | 'area' | 'siaga' | 'chat' | 'arsitektur') => void;
  showNotification?: (msg: string) => void;
  initialSubTab?: 'komunitas' | 'warga' | 'skema' | 'toko' | 'menu' | 'printer' | 'update';
}

export const SettingView: React.FC<SettingViewProps> = ({
  profile,
  onSaveProfile,
  printerConfig,
  onSavePrinterConfig,
  menuList,
  onSaveMenu,
  currentUser,
  residents,
  onUpdateResidents,
  onOpenRoleModal,
  onOpenHierarchy,
  witnessCount = 2,
  onNavigateToModule,
  showNotification,
  initialSubTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'komunitas' | 'warga' | 'skema' | 'toko' | 'menu' | 'printer' | 'update'
  >(() => initialSubTab || (currentUser ? 'komunitas' : 'toko'));

  // Update & Auto-Release states
  const [repoInput, setRepoInput] = useState<string>(UpdateService.getGitHubRepo());
  const [knownRepos, setKnownRepos] = useState<string[]>(UpdateService.getKnownRepos());
  const [isCustomRepo, setIsCustomRepo] = useState<boolean>(UpdateService.isCustomRepoSet());
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateInfo | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [repoSavedMsg, setRepoSavedMsg] = useState(false);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(UpdateService.isAutoCheckEnabled());

  // Profile Form state
  const [name, setName] = useState(profile.name);
  const [slogan, setSlogan] = useState(profile.slogan);
  const [address, setAddress] = useState(profile.address);
  const [phone, setPhone] = useState(profile.phone);
  const [receiptHeader, setReceiptHeader] = useState(profile.receiptHeader);
  const [receiptFooter, setReceiptFooter] = useState(profile.receiptFooter);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Bluetooth scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [printerStatusMsg, setPrinterStatusMsg] = useState<string | null>(null);

  // Menu modal state
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuName, setMenuName] = useState('');
  const [menuCat, setMenuCat] = useState<MenuCategory>('bakso_kuah');
  const [menuPrice, setMenuPrice] = useState<number>(20000);
  const [menuDesc, setMenuDesc] = useState('');

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      name: name.trim(),
      slogan: slogan.trim(),
      address: address.trim(),
      phone: phone.trim(),
      receiptHeader: receiptHeader.trim(),
      receiptFooter: receiptFooter.trim(),
    });
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 2500);
  };

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateError(null);
    setUpdateResult(null);
    try {
      const res = await UpdateService.checkForUpdates(repoInput);
      setUpdateResult(res);
      if (res.hasUpdate) {
        setIsUpdateModalOpen(true);
      }
    } catch (err: any) {
      setUpdateError(err.message || 'Gagal memeriksa pembaruan.');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleSaveRepo = (e: React.FormEvent) => {
    e.preventDefault();
    UpdateService.setGitHubRepo(repoInput, true);
    setIsCustomRepo(true);
    setKnownRepos(UpdateService.getKnownRepos());
    setRepoSavedMsg(true);
    setTimeout(() => setRepoSavedMsg(false), 2000);
  };

  const handleSelectQuickRepo = (repo: string) => {
    setRepoInput(repo);
    UpdateService.setGitHubRepo(repo, true);
    setIsCustomRepo(true);
    setKnownRepos(UpdateService.getKnownRepos());
    setRepoSavedMsg(true);
    setTimeout(() => setRepoSavedMsg(false), 2000);
  };

  const handleResetToBundled = async () => {
    const detected = await UpdateService.resetToAutoRepo();
    setRepoInput(detected);
    setIsCustomRepo(false);
    setKnownRepos(UpdateService.getKnownRepos());
    setRepoSavedMsg(true);
    setTimeout(() => setRepoSavedMsg(false), 2000);
  };

  const handleToggleAutoCheck = () => {
    const next = !autoCheckEnabled;
    setAutoCheckEnabled(next);
    UpdateService.setAutoCheckEnabled(next);
  };

  const handleScanBluetooth = async () => {
    setIsScanning(true);
    setPrinterStatusMsg('Mencari printer thermal bluetooth terdekat...');
    try {
      const res = await PrinterService.scanAndConnectBluetooth();
      setPrinterStatusMsg(res.message);
      if (res.success && res.deviceName) {
        onSavePrinterConfig({
          ...printerConfig,
          connectedDeviceName: res.deviceName,
        });
      }
    } catch (e: any) {
      setPrinterStatusMsg('Gagal menyambungkan printer: ' + e.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleTestPrint = async () => {
    setPrinterStatusMsg('Mengirim sinyal tes cetak ke printer...');
    const dummyOrder: any = {
      id: 'test-print',
      receiptNumber: 'TEST-PRINT-001',
      type: 'meja',
      tableName: 'Meja Tes',
      customerName: 'Uji Coba Printer',
      items: [
        { menuId: '1', name: 'Bakso Urat Jumbo (Tes)', price: 25000, quantity: 1 },
        { menuId: '2', name: 'Es Teh Manis (Tes)', price: 5000, quantity: 1 },
      ],
      subtotal: 30000,
      discount: 0,
      tax: 0,
      total: 30000,
      status: 'paid',
      createdAt: new Date().toISOString(),
      paymentMethod: 'tunai',
      cashAmount: 50000,
      changeAmount: 20000,
    };

    const res = await PrinterService.printOrder(dummyOrder, profile, printerConfig, false);
    setPrinterStatusMsg(res.message);
    setTimeout(() => setPrinterStatusMsg(null), 3500);
  };

  // Menu Handlers
  const handleOpenAddMenu = () => {
    setEditingMenuItem(null);
    setMenuName('');
    setMenuCat('bakso_kuah');
    setMenuPrice(20000);
    setMenuDesc('');
    setIsMenuModalOpen(true);
  };

  const handleOpenEditMenu = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuName(item.name);
    setMenuCat(item.category);
    setMenuPrice(item.price);
    setMenuDesc(item.description);
    setIsMenuModalOpen(true);
  };

  const handleSaveMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuName.trim()) return;

    if (editingMenuItem) {
      const updated = menuList.map((m) =>
        m.id === editingMenuItem.id
          ? {
              ...m,
              name: menuName.trim(),
              category: menuCat,
              price: menuPrice,
              description: menuDesc.trim(),
            }
          : m
      );
      onSaveMenu(updated);
    } else {
      const newItem: MenuItem = {
        id: `menu-${Date.now()}`,
        name: menuName.trim(),
        category: menuCat,
        price: menuPrice,
        description: menuDesc.trim(),
        imageUrl: menuList[0]?.imageUrl || '',
        isAvailable: true,
      };
      onSaveMenu([...menuList, newItem]);
    }
    setIsMenuModalOpen(false);
  };

  const handleDeleteMenu = (id: string, name: string) => {
    if (confirm(`Yakin hapus menu "${name}"?`)) {
      onSaveMenu(menuList.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-3.5 space-y-3 pb-24 text-stone-900">
      {/* Sub-Tabs Switcher */}
      {currentUser ? (
        <div className="flex gap-1.5 bg-stone-200/90 p-1.5 rounded-2xl shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveSubTab('komunitas')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'komunitas'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-300/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Opsi Komunitas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('warga')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'warga'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-300/60'
            }`}
          >
            <Contact className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Buku Warga</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('skema')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'skema'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-300/60'
            }`}
          >
            <FileCode className="w-4 h-4 text-indigo-300 shrink-0" />
            <span>Skema DB</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('printer')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'printer'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-300/60'
            }`}
          >
            <Printer className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Printer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('update')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer relative ${
              activeSubTab === 'update'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-300/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-teal-300 shrink-0" />
            <span>Update APK</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('toko')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'toko'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-300/60'
            }`}
          >
            <Store className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Profil Unit</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1 bg-stone-200/80 p-1 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('toko')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeSubTab === 'toko'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">Profil</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('menu')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeSubTab === 'menu'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">Menu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('printer')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeSubTab === 'printer'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Printer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('update')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeSubTab === 'update'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">Update APK</span>
          </button>
        </div>
      )}

      {/* TAB 0: OPSI KOMUNITAS (WARGA, ROLE, 2 SAKSI, SKEMA) */}
      {activeSubTab === 'komunitas' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* Header Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950 via-stone-900 to-teal-950 text-white shadow-md border border-emerald-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
                Pusat Tata Kelola & Opsi
              </span>
              <span className="text-[11px] font-mono text-emerald-300">RT 04 / RW 09</span>
            </div>
            <h2 className="text-base font-black text-white leading-tight">
              Tata Kelola Komunitas & Pengaturan
            </h2>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Manajemen buku induk warga, ganti peran (role switcher), validasi 2 saksi tetangga, arsitektur sistem, printer struk, dan pembaruan aplikasi.
            </p>
          </div>

          {/* 4 Interactive Hub Cards for Warga, Role, 2 Saksi, Skema */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Card 1: Buku Induk WargaQu */}
            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    <Contact className="w-5 h-5 text-sky-700" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 font-bold text-[10px] border border-sky-200">
                    {residents?.length || 48} Warga Terdaftar
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-stone-900">
                  Buku Induk WargaQu
                </h3>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Direktori kependudukan warga RT 04: NIK, nomor KK, alamat rumah, status domisili (tetap/kontrak/kos), dan kartu tanda warga digital ber-QR.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('warga')}
                className="w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-500 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Buka Buku Induk Warga</span>
              </button>
            </div>

            {/* Card 2: Ganti Peran (Role Switcher) */}
            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5 text-teal-700" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold text-[10px] border border-teal-200">
                    {currentUser?.roleTier === 'tier2_pengurus_rt' ? 'Tier 2: Pengurus' : 'Tier 1: Warga'}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-stone-900">
                  Ganti Peran Pengguna (Role)
                </h3>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Peran aktif: <strong className="text-stone-900">{currentUser?.roleTitle || currentUser?.name || 'Warga RT 04'}</strong>. Beralih peran antara Warga Biasa, Ketua RT, Hansip, Relawan, dan Pedagang Lapak.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenRoleModal) onOpenRoleModal();
                }}
                className="w-full py-2.5 px-3 bg-teal-700 hover:bg-teal-600 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Ganti Peran Pengguna (Role)</span>
              </button>
            </div>

            {/* Card 3: Validasi Berantai (2 Saksi) */}
            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5 text-purple-700" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 font-bold text-[10px] border border-purple-200">
                    {witnessCount >= 2 ? '2/2 Saksi Lengkap' : '0/2 Saksi (Menunggu)'}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-stone-900">
                  Validasi 2 Saksi (Chain of Trust)
                </h3>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Rantai kepercayaan warga lokal tanpa pihak ketiga: Setiap akun baru divalidasi oleh 2 tetangga berstatus tetap dan disahkan oleh pengurus RT.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenHierarchy) onOpenHierarchy();
                }}
                className="w-full py-2.5 px-3 bg-purple-700 hover:bg-purple-600 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Buka Skema 2 Saksi & Hierarki</span>
              </button>
            </div>

            {/* Card 4: Skema & Arsitektur Sistem */}
            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <FileCode className="w-5 h-5 text-indigo-700" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 font-bold text-[10px] border border-indigo-200">
                    Offline-First & P2P
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-stone-900">
                  Skema & Arsitektur Sistem
                </h3>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Dokumentasi teknis bagan arsitektur modular, skema penyimpanan IndexedDB lokal di HP, dan protokol real-time tanpa biaya server.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('skema')}
                className="w-full py-2.5 px-3 bg-indigo-700 hover:bg-indigo-600 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Lihat Dokumen Skema Sistem</span>
              </button>
            </div>
          </div>

          {/* Quick Hardware & Update Tools */}
          <div className="p-4 rounded-3xl bg-stone-50 border border-stone-200 space-y-2">
            <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
              Perangkat Keras & Pembaruan
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('printer')}
                className="p-3 bg-white hover:bg-stone-100 border border-stone-200 rounded-2xl text-left flex items-center gap-2.5 cursor-pointer transition-all"
              >
                <Printer className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-stone-900">Printer Thermal</p>
                  <p className="text-[10px] text-stone-500">Cetak Bluetooth 58/80mm</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('update')}
                className="p-3 bg-white hover:bg-stone-100 border border-stone-200 rounded-2xl text-left flex items-center gap-2.5 cursor-pointer transition-all"
              >
                <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-stone-900">Update APK</p>
                  <p className="text-[10px] text-stone-500">Auto-Release & Multi-Akun</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: BUKU INDUK WARGAQU */}
      {activeSubTab === 'warga' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between p-2.5 bg-white rounded-2xl border border-stone-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('komunitas')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Opsi</span>
            </button>
            <span className="text-xs font-bold text-stone-700">Buku Induk WargaQu</span>
          </div>

          {currentUser && residents ? (
            <WargaView
              currentUser={currentUser}
              residents={residents}
              onUpdateResidents={onUpdateResidents || (() => {})}
              showNotification={showNotification || (() => {})}
            />
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-stone-200">
              <Contact className="w-10 h-10 text-sky-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-800">Data Warga Belum Tersedia</p>
            </div>
          )}
        </div>
      )}

      {/* TAB: DOKUMEN ARSITEKTUR & SKEMA */}
      {activeSubTab === 'skema' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between p-2.5 bg-white rounded-2xl border border-stone-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('komunitas')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Opsi</span>
            </button>
            <span className="text-xs font-bold text-stone-700">Skema & Arsitektur Sistem</span>
          </div>
          <ArsitekturView />
        </div>
      )}

      {/* TAB 1: PROFIL RESTO */}
      {activeSubTab === 'toko' && (
        <form onSubmit={handleSaveProfileSubmit} className="space-y-3">
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
              Identitas Restoran & Struk
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Toko / Resto:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Slogan / Deskripsi:
              </label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nomor Telepon:
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mata Uang:
                </label>
                <input
                  type="text"
                  disabled
                  value="Rp (IDR)"
                  className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Alamat Lengkap:
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Pesan Header Struk (Atas):
              </label>
              <input
                type="text"
                value={receiptHeader}
                onChange={(e) => setReceiptHeader(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Pesan Footer Struk (Bawah):
              </label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {profileSavedMsg && (
            <div className="p-3 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profil berhasil disimpan dan diperbarui!</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-700 to-amber-600 text-white font-bold text-xs shadow-md active:scale-98 transition-all"
          >
            Simpan Perubahan Profil
          </button>
        </form>
      )}

      {/* TAB 2: KELOLA MENU */}
      {activeSubTab === 'menu' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-stone-800">
              Daftar Menu ({menuList.length} Item)
            </span>
            <button
              onClick={handleOpenAddMenu}
              className="px-3 py-1.5 rounded-xl bg-red-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Menu Baru</span>
            </button>
          </div>

          <div className="space-y-2">
            {menuList.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-3"
              >
                <img
                  src={m.imageUrl}
                  alt={m.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs text-stone-900 truncate">{m.name}</h4>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 uppercase font-semibold">
                      {m.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="font-extrabold text-amber-700 text-xs mt-0.5">
                    {formatCurrency(m.price)}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEditMenu(m)}
                    className="p-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMenu(m.id, m.name)}
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BLUETOOTH THERMAL PRINTER */}
      {activeSubTab === 'printer' && (
        <div className="space-y-3">
          {/* Status Box */}
          <div className="p-4 rounded-3xl bg-stone-900 text-stone-100 border border-stone-800 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Bluetooth className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Printer Thermal Bluetooth</h4>
                  <p className="text-[10px] text-stone-400">Koneksi printer mobile kasir</p>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                Terkoneksi
              </span>
            </div>

            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
              <div className="text-[11px] text-stone-400">Nama Perangkat:</div>
              <div className="font-bold text-sm text-amber-400 font-mono">
                {printerConfig.connectedDeviceName || 'POS-58-BT (Thermal)'}
              </div>
            </div>

            {/* Scan & Connect Button */}
            <button
              onClick={handleScanBluetooth}
              disabled={isScanning}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-2 border border-stone-700 active:scale-98 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Memindai Bluetooth...' : 'Pindai & Hubungkan Printer'}</span>
            </button>
          </div>

          {printerStatusMsg && (
            <div className="p-3 bg-stone-800 text-amber-300 border border-amber-500/30 rounded-2xl text-xs font-medium flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{printerStatusMsg}</span>
            </div>
          )}

          {/* Paper Size Setting */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Ukuran Kertas Thermal
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSavePrinterConfig({ ...printerConfig, paperSize: '58mm' })}
                className={`p-3 rounded-2xl border-2 text-center transition-all ${
                  printerConfig.paperSize === '58mm'
                    ? 'border-amber-500 bg-amber-50/50 text-stone-950 font-bold'
                    : 'border-stone-200 text-stone-500 hover:border-stone-300'
                }`}
              >
                <div className="text-sm font-extrabold">58 mm</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Standar Mini POS (32 Kolom)</div>
              </button>

              <button
                type="button"
                onClick={() => onSavePrinterConfig({ ...printerConfig, paperSize: '80mm' })}
                className={`p-3 rounded-2xl border-2 text-center transition-all ${
                  printerConfig.paperSize === '80mm'
                    ? 'border-amber-500 bg-amber-50/50 text-stone-950 font-bold'
                    : 'border-stone-200 text-stone-500 hover:border-stone-300'
                }`}
              >
                <div className="text-sm font-extrabold">80 mm</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Lebar Resto (48 Kolom)</div>
              </button>
            </div>

            {/* Test Print Button */}
            <div className="pt-2">
              <button
                onClick={handleTestPrint}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-700 to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Uji Coba Tes Cetak Struk (Test Print)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: UPDATE APK & VERSI (AUTO-RELEASE CI/CD) */}
      {activeSubTab === 'update' && (
        <div className="space-y-3">
          {/* Version Header Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-900/90 via-emerald-800/90 to-teal-900/90 text-white shadow-md border border-emerald-700/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">AppQu & BaksoQu POS</h3>
                  <p className="text-[11px] text-emerald-200">Kompilasi Otomatis GitHub Actions CI/CD</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-bold">
                v{APP_CURRENT_VERSION}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-700/50 text-[11px]">
              <div className="bg-emerald-950/40 p-2 rounded-xl">
                <span className="text-emerald-300 block text-[10px]">Build Number:</span>
                <span className="font-mono font-bold text-white">#{APP_BUILD_NUMBER}</span>
              </div>
              <div className="bg-emerald-950/40 p-2 rounded-xl">
                <span className="text-emerald-300 block text-[10px]">Target Platform:</span>
                <span className="font-bold text-white">Android APK / Web</span>
              </div>
            </div>

            {/* Check Updates Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleCheckUpdate}
                disabled={isCheckingUpdate}
                className="w-full py-3 rounded-2xl bg-white text-emerald-900 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all hover:bg-emerald-50 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 text-emerald-700 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                <span>{isCheckingUpdate ? 'Memeriksa ke GitHub Releases...' : 'Periksa Pembaruan Sekarang'}</span>
              </button>
            </div>
          </div>

          {/* Update Check Result Status Message */}
          {updateError && (
            <div className="p-3.5 bg-red-950/80 border border-red-800/80 rounded-2xl text-xs text-red-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold mb-0.5">Pemeriksaan Tidak Dapat Dilakukan</p>
                <p className="text-[11px] text-red-300 leading-relaxed">{updateError}</p>
              </div>
            </div>
          )}

          {updateResult && !updateResult.hasUpdate && (
            <div className="p-3.5 bg-emerald-950/70 border border-emerald-800/70 rounded-2xl text-xs text-emerald-200 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold">Aplikasi Anda Sudah Versi Terbaru!</p>
                <p className="text-[11px] text-emerald-300">v{APP_CURRENT_VERSION} adalah versi rilis termutakhir.</p>
              </div>
            </div>
          )}

          {updateResult && updateResult.hasUpdate && (
            <div className="p-3.5 bg-amber-950/80 border border-amber-700/80 rounded-2xl text-xs text-amber-200 flex items-center justify-between gap-2 shadow-md">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
                <div>
                  <p className="font-bold text-white">Versi Baru v{updateResult.latestVersion} Tersedia!</p>
                  <p className="text-[11px] text-amber-300">Siap diunduh dan dipasang langsung.</p>
                </div>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm cursor-pointer"
              >
                Lihat & Unduh
              </button>
            </div>
          )}

          {/* Configuration GitHub Repository */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-emerald-700" />
                <span>Target Repositori GitHub & Auto-Update</span>
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isCustomRepo
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {isCustomRepo ? 'Kustom Manual' : 'Auto-Deteksi Bawaan APK'}
              </span>
            </div>

            <form onSubmit={handleSaveRepo} className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Nama Akun & Repository (contoh: <code className="text-stone-800">akun-anda/appqu-pos</code>):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={repoInput}
                    onChange={(e) => setRepoInput(e.target.value)}
                    placeholder="smbsyariah/baksoqu-pos"
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:outline-hidden focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer shrink-0"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToBundled}
                    className="py-2 px-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs cursor-pointer shrink-0"
                    title="Deteksi nama repo bawaan dari version.json APK ini"
                  >
                    Auto-Deteksi
                  </button>
                </div>
                {repoSavedMsg && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    ✓ Repositori target berhasil diperbarui & disimpan!
                  </p>
                )}
              </div>
            </form>

            {/* Quick Account Switcher Chips */}
            {knownRepos.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] text-stone-500 font-medium block mb-1">
                  Pindah Cepat Akun / Repositori Tersimpan:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {knownRepos.map((kr) => (
                    <button
                      key={kr}
                      type="button"
                      onClick={() => handleSelectQuickRepo(kr)}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                        repoInput === kr
                          ? 'bg-emerald-800 text-white border-emerald-900 font-bold shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                      }`}
                    >
                      {repoInput === kr && <Check className="w-3 h-3 text-emerald-300" />}
                      <span>{kr}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-stone-800">Pemeriksaan Otomatis saat Buka App</p>
                <p className="text-[10px] text-stone-500">Cek rilis APK baru di latar belakang</p>
              </div>
              <button
                type="button"
                onClick={handleToggleAutoCheck}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                  autoCheckEnabled ? 'bg-emerald-600 justify-end' : 'bg-stone-300 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
              </button>
            </div>
          </div>

          {/* Multi-Account & Ganti Akun Guide Box */}
          <div className="p-4 rounded-3xl bg-emerald-950 text-white shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white">
                  Bisa Auto-Update Walaupun Ganti Akun di GitHub?
                </h4>
                <p className="text-[10px] text-emerald-300">
                  Jawaban: <span className="font-bold underline">YA, SANGAT BISA!</span> Sudah didukung penuh & fleksibel.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-[11px] leading-relaxed text-emerald-100/90 bg-emerald-900/40 p-3 rounded-2xl border border-emerald-700/40">
              <p>
                <strong>1. CI/CD Otomatis Adaptif:</strong> Skrip GitHub Actions menggunakan variabel otomatis <code className="font-mono bg-black/40 px-1 py-0.5 rounded text-emerald-300">${'{'}github.repository{'}'}</code>. Jadi akun GitHub mana pun yang Anda pakai (misal: fork/push ke akun baru), rilis APK akan langsung terbit di akun baru tersebut.
              </p>
              <p>
                <strong>2. Keystore Konsisten (Tanpa Error Bentrok Kunci):</strong> Kunci tanda tangan digital APK (<code className="font-mono bg-black/40 px-1 py-0.5 rounded text-emerald-300">debug.keystore</code>) tersimpan permanen di proyek. Meskipun Anda ganti akun GitHub, sertifikat APK tetap sama sehingga HP Android mengizinkan instalasi tumpuk (update langsung tanpa hapus data).
              </p>
              <p>
                <strong>3. Ganti Sumber Update Kapan Saja:</strong> Jika HP Anda saat ini terpasang APK dari akun lama dan ingin menarik update dari akun baru, cukup ketik nama <code className="font-mono bg-black/40 px-1 py-0.5 rounded text-emerald-300">akun-baru/nama-repo</code> pada kolom di atas lalu simpan!
              </p>
            </div>

            <div className="pt-1">
              <a
                href={`https://github.com/${repoInput}/releases`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Rilis GitHub ({repoInput})</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        updateInfo={updateResult}
      />

      {/* Menu Modal (Add / Edit) */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsMenuModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-stone-900 text-stone-100 rounded-3xl p-4 shadow-2xl border border-stone-800 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-sm font-bold text-white">
                {editingMenuItem ? 'Edit Menu' : 'Tambah Menu Baru'}
              </h3>
              <button onClick={() => setIsMenuModalOpen(false)} className="p-1 rounded-full text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenuSubmit} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Nama Menu:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bakso Urat Keju"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Kategori:</label>
                  <select
                    value={menuCat}
                    onChange={(e: any) => setMenuCat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="bakso_kuah">Bakso Kuah</option>
                    <option value="pelengkap">Pelengkap</option>
                    <option value="minuman">Minuman Segar</option>
                    <option value="paket">Paket Hemat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Harga (Rp):</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={menuPrice}
                    onChange={(e) => setMenuPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Deskripsi Porsi:</label>
                <textarea
                  rows={2}
                  placeholder="Isi dan kelengkapan mangkuk..."
                  value={menuDesc}
                  onChange={(e) => setMenuDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 text-white font-bold shadow-md"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
