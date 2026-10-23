import React, { useState, useEffect } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { HeaderBar } from './components/HeaderBar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { BottomNavBar } from './components/BottomNavBar';
import { TableGrid } from './components/kasir/TableGrid';
import { OrderBottomSheet } from './components/kasir/OrderBottomSheet';
import { TableActionModal } from './components/kasir/TableActionModal';
import { CheckoutModal } from './components/kasir/CheckoutModal';
import { ReceiptModal } from './components/kasir/ReceiptModal';
import { BahanView } from './components/bahan/BahanView';
import { OmsetDashboard } from './components/omset/OmsetDashboard';
import { LaporanView } from './components/laporan/LaporanView';
import { SettingView } from './components/setting/SettingView';
import { BluetoothModal } from './components/BluetoothModal';

// AppQu Ecosystem Components
import { AppQuHeader } from './components/appqu/AppQuHeader';
import { AppQuBottomNav } from './components/appqu/AppQuBottomNav';
import { PaguyubanView } from './components/appqu/PaguyubanView';
import { WargaView } from './components/appqu/WargaView';
import { UsahaQuView } from './components/appqu/UsahaQuView';
import { AreaQuView } from './components/appqu/AreaQuView';
import { SiagaQuView } from './components/appqu/SiagaQuView';
import { ArsitekturView } from './components/appqu/ArsitekturView';
import { HierarchyModal } from './components/appqu/HierarchyModal';
import { RoleSwitcherModal } from './components/appqu/RoleSwitcherModal';
import { ChatQuView } from './components/appqu/ChatQuView';
import { BengkelQuView } from './components/bengkel/BengkelQuView';
import { KlinikQuView } from './components/klinik/KlinikQuView';
import { RitelQuView } from './components/ritel/RitelQuView';
import { KulinerQuView } from './components/kuliner/KulinerQuView';
import { TransportasiQuView } from './components/transportasi/TransportasiQuView';
import { PelayananQuView } from './components/pelayanan/PelayananQuView';
import { ProyekQuView } from './components/proyek/ProyekQuView';

import {
  TableItem,
  MenuItem,
  Order,
  OrderItem,
  OrderType,
  Ingredient,
  RestaurantProfile,
  PrinterConfig,
  UserProfile,
  ResidentData,
  FeedPost,
  AgendaEvent,
  KasTransaction,
  SuratPengantar,
  LocalBusiness,
  PatrolCheckpoint,
  PatrolLog,
  MusibahItem,
  PiketTask,
  AreaPoint,
  TransportasiCourier,
} from './types';

import { StorageService } from './services/storage';
import { AppQuStorageService, PRESET_USERS, PendingVerificationItem } from './services/storageAppQu';
import { PrinterService } from './services/printer';
import { UpdateService, UpdateInfo } from './services/updateService';
import { UpdateModal } from './components/UpdateModal';
import { Sparkles } from 'lucide-react';

export default function App() {
  // ====================================================
  // MASTER APPLICATION MODE: 'appqu' | 'baksoqu' | 'bengkelqu' | 'klinikqu' | 'ritelqu' | 'kulinerqu' | 'transportasiqu' | 'pelayananqu' | 'proyekqu'
  // ====================================================
  const [appMode, setAppMode] = useState<
    'appqu' | 'baksoqu' | 'bengkelqu' | 'klinikqu' | 'ritelqu' | 'kulinerqu' | 'transportasiqu' | 'pelayananqu' | 'proyekqu'
  >('appqu');

  // AppQu Active Module (With AreaQu, ChatQu, and Setting)
  const [activeAppQuModule, setActiveAppQuModule] = useState<
    'paguyuban' | 'warga' | 'usaha' | 'area' | 'siaga' | 'arsitektur' | 'chat' | 'setting'
  >('paguyuban');

  const [selectedChatThreadId, setSelectedChatThreadId] = useState<string | null>(null);

  // AppQu Current User (RBAC Role Switcher)
  const [currentUser, setCurrentUser] = useState<UserProfile>(
    AppQuStorageService.getCurrentUser()
  );

  // AppQu Ecosystem Core Data
  const [residents, setResidents] = useState<ResidentData[]>([]);
  const [feeds, setFeeds] = useState<FeedPost[]>([]);
  const [agenda, setAgenda] = useState<AgendaEvent[]>([]);
  const [kas, setKas] = useState<KasTransaction[]>([]);
  const [letters, setLetters] = useState<SuratPengantar[]>([]);
  const [businesses, setBusinesses] = useState<LocalBusiness[]>([]);
  const [checkpoints, setCheckpoints] = useState<PatrolCheckpoint[]>([]);
  const [patrolLogs, setPatrolLogs] = useState<PatrolLog[]>([]);
  const [musibahList, setMusibahList] = useState<MusibahItem[]>([]);
  const [piketTasks, setPiketTasks] = useState<PiketTask[]>([]);

  // AreaQu & Chain of Trust Data States
  const [areaPoints, setAreaPoints] = useState<AreaPoint[]>([]);
  const [couriers, setCouriers] = useState<TransportasiCourier[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerificationItem[]>([]);
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // AreaQu Header Filter & Modal States
  const [areaRadiusMeters, setAreaRadiusMeters] = useState<number>(3000);
  const [areaCategory, setAreaCategory] = useState<string>('all');
  const [isAreaRentalModalOpen, setIsAreaRentalModalOpen] = useState<boolean>(false);
  const [isAreaNeutralityModalOpen, setIsAreaNeutralityModalOpen] = useState<boolean>(false);

  // ====================================================
  // BAKSOQU 1.0 POS DATA STATES
  // ====================================================
  const [activeBaksoTab, setActiveBaksoTab] = useState<string>('kasir');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState<boolean>(false);

  const [tables, setTables] = useState<TableItem[]>([]);
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Record<string, Order>>({});
  const [profile, setProfile] = useState<RestaurantProfile>(StorageService.getProfile());
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(
    StorageService.getPrinterConfig()
  );

  // BaksoQu POS Interactive Flow States
  const [selectedTableForAction, setSelectedTableForAction] = useState<TableItem | null>(null);
  const [orderSheetState, setOrderSheetState] = useState<{
    isOpen: boolean;
    orderType: OrderType;
    tableId?: string;
    tableName?: string;
    existingOrder?: Order | null;
  }>({
    isOpen: false,
    orderType: 'meja',
  });

  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
  const [receiptModalState, setReceiptModalState] = useState<{
    isOpen: boolean;
    order: Order | null;
    isKitchenSlip?: boolean;
  }>({
    isOpen: false,
    order: null,
    isKitchenSlip: false,
  });

  // Global Notification Toast
  const [notification, setNotification] = useState<string | null>(null);

  // Auto-Update States
  const [availableUpdate, setAvailableUpdate] = useState<UpdateInfo | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check for updates in background (auto-check)
    const runUpdateCheck = async () => {
      if (!UpdateService.isAutoCheckEnabled()) return;
      try {
        const info = await UpdateService.checkForUpdates();
        if (info.hasUpdate) {
          setAvailableUpdate(info);
          showNotification(`🚀 Pembaruan Tersedia: AppQu v${info.latestVersion}!`);
        }
      } catch (e) {
        // Silent catch for background check
      }
    };
    const timer = setTimeout(runUpdateCheck, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Initial Load for both AppQu and BaksoQu
  useEffect(() => {
    // Load AppQu data
    setResidents(AppQuStorageService.getResidents());
    setFeeds(AppQuStorageService.getFeeds());
    setAgenda(AppQuStorageService.getAgenda());
    setKas(AppQuStorageService.getKas());
    setLetters(AppQuStorageService.getLetters());
    setBusinesses(AppQuStorageService.getBusinesses());
    setCheckpoints(AppQuStorageService.getCheckpoints());
    setPatrolLogs(AppQuStorageService.getPatrolLogs());
    setMusibahList(AppQuStorageService.getMusibah());
    setPiketTasks(AppQuStorageService.getPiket());

    // Load AreaQu & Chain of Trust Data
    setAreaPoints(AppQuStorageService.getAreaPoints());
    setCouriers(AppQuStorageService.getCouriers());
    setPendingVerifications(AppQuStorageService.getPendingVerifications());

    // Load BaksoQu POS data
    setTables(StorageService.getTables());
    setMenuList(StorageService.getMenu());
    setIngredients(StorageService.getIngredients());
    setHistory(StorageService.getHistory());
    setActiveOrders(StorageService.getActiveOrders());
    setProfile(StorageService.getProfile());
    setPrinterConfig(StorageService.getPrinterConfig());
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Chain of Trust Handlers: Approve & Reject Resident
  const handleApproveResident = (id: string) => {
    const updated = pendingVerifications.map((p) =>
      p.id === id ? { ...p, status: 'approved' as const } : p
    );
    setPendingVerifications(updated);
    AppQuStorageService.savePendingVerifications(updated);
    showNotification('Warga baru telah disetujui penuh menjadi Permanent Verified!');
  };

  const handleRejectResident = (id: string) => {
    const updated = pendingVerifications.map((p) =>
      p.id === id ? { ...p, status: 'rejected' as const } : p
    );
    setPendingVerifications(updated);
    AppQuStorageService.savePendingVerifications(updated);
    showNotification('Pengajuan warga ditolak.');
  };

  // Chain of Trust: Request Neighbor Witness
  const handleRequestWitness = (neighborName: string) => {
    const newCount = Math.min(2, (currentUser.witnessCount || 0) + 1);
    const updatedUser: UserProfile = {
      ...currentUser,
      witnessCount: newCount,
      verificationStatus: newCount >= 2 ? 'temporary_active' : 'unverified',
      temporaryDaysLeft: newCount >= 2 ? 30 : 0,
      witnesses: [
        ...(currentUser.witnesses || []),
        {
          id: `w-${Date.now()}`,
          name: neighborName,
          blockNumber: 'RT 04',
          phone: '0812-xxxx-xxxx',
          confirmedAt: new Date().toISOString().split('T')[0],
        },
      ],
    };
    setCurrentUser(updatedUser);
    AppQuStorageService.saveCurrentUser(updatedUser);
    showNotification(
      newCount >= 2
        ? 'Selamat! 2 Saksi Tetangga lengkap. Status Anda kini Temporary Active (30 Hari) & Panic Button Terbuka!'
        : `Saksi dari ${neighborName} berhasil dikonfirmasi (1/2 Saksi).`
    );
  };

  // Change Active RBAC User
  const handleChangeUser = (newUser: UserProfile) => {
    setCurrentUser(newUser);
    AppQuStorageService.saveCurrentUser(newUser);
    showNotification(`Peran aktif beralih ke: ${newUser.name} (${newUser.roleTitle})`);
  };

  // Switch to BaksoQu POS Workstation
  const handleSwitchToBaksoQu = () => {
    setAppMode('baksoqu');
    setActiveBaksoTab('kasir');
    showNotification('Beralih ke UsahaQu: Bakso Qu 1.0 (POS Restoran)');
  };

  // Switch to BengkelQu Smart Workshop System
  const handleSwitchToBengkelQu = () => {
    setAppMode('bengkelqu');
    showNotification('Beralih ke BengkelQu: Asisten Pintar & Bengkel Warga RT 04 (100% Gratis)');
  };

  // Switch to KlinikQu Medical POS & Clinic System
  const handleSwitchToKlinikQu = () => {
    setAppMode('klinikqu');
    showNotification('Beralih ke KlinikQu: Kasir & Layanan Medis Faskes Warga RT 04');
  };

  // Switch to RitelQu Grocery & Retail POS System
  const handleSwitchToRitelQu = () => {
    setAppMode('ritelqu');
    showNotification('Beralih ke RitelQu: Kasir & Toko Kelontong Warga RT 04');
  };

  // Switch to KulinerQu Offline POS Workstation
  const handleSwitchToKulinerQu = () => {
    setAppMode('kulinerqu');
    showNotification('Beralih ke KulinerQu: POS Kuliner Offline (Kios, Mangkal & Keliling)');
  };

  // Switch to TransportasiQu 6 Sub-Kategori Angkutan & Logistik
  const handleSwitchToTransportasiQu = () => {
    setAppMode('transportasiqu');
    showNotification('Beralih ke TransportasiQu: 6 Sub-Kategori Jasa Angkutan & Logistik');
  };

  // Switch to PelayananQu 6 Sub-Kategori Layanan & Jasa Akar Rumput
  const handleSwitchToPelayananQu = () => {
    setAppMode('pelayananqu');
    showNotification('Beralih ke PelayananQu: 6 Sub-Kategori Jasa & Layanan Warga');
  };

  // Switch to ProyekQu (UsahaQu - Proyek)
  const handleSwitchToProyekQu = () => {
    setAppMode('proyekqu');
    showNotification('Beralih ke UsahaQu - Proyek: Estimator & RAB Borongan');
  };

  // Return to AppQu Ecosystem
  const handleReturnToAppQu = () => {
    setAppMode('appqu');
    setActiveAppQuModule('usaha');
    showNotification('Kembali ke Ekosistem Utama AppQu');
  };

  // ----------------------------------------------------
  // BAKSOQU TABLE MANAGEMENT
  // ----------------------------------------------------
  const handleAddTable = () => {
    const nextNumber = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1;
    const newTable: TableItem = {
      id: `tbl-${Date.now()}`,
      name: `Meja ${nextNumber}`,
      number: nextNumber,
      status: 'kosong',
      positionIndex: tables.length,
    };
    const updated = [...tables, newTable];
    setTables(updated);
    StorageService.saveTables(updated);
    showNotification(`Meja ${nextNumber} berhasil ditambahkan ke denah.`);
  };

  const handleReorderTables = (newTables: TableItem[]) => {
    setTables(newTables);
    StorageService.saveTables(newTables);
  };

  const handleDeleteTable = (tableId: string) => {
    const updated = tables.filter((t) => t.id !== tableId);
    setTables(updated);
    StorageService.saveTables(updated);
    showNotification('Meja dihapus dari denah.');
  };

  const handleSelectTable = (table: TableItem) => {
    if (table.status === 'kosong') {
      setOrderSheetState({
        isOpen: true,
        orderType: 'meja',
        tableId: table.id,
        tableName: table.name,
        existingOrder: null,
      });
    } else {
      setSelectedTableForAction(table);
    }
  };

  const handleOpenBungkus = () => {
    setOrderSheetState({
      isOpen: true,
      orderType: 'bungkus',
      existingOrder: null,
    });
  };

  // ----------------------------------------------------
  // BAKSOQU ORDER & PAYMENT FLOW
  // ----------------------------------------------------
  const handleSaveAndPrintOrder = async (
    items: OrderItem[],
    type: OrderType,
    tableId?: string,
    tableName?: string,
    customerName?: string,
    printOption?: 'bluetooth' | 'pdf' | 'none'
  ) => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const date = new Date();
    const dateKey = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

    let orderToSave: Order;

    if (orderSheetState.existingOrder) {
      orderToSave = {
        ...orderSheetState.existingOrder,
        items,
        subtotal,
        total: subtotal,
        customerName: customerName || orderSheetState.existingOrder.customerName,
      };
    } else {
      const newReceiptNumber = `BQ-${dateKey}-${String(Math.floor(100 + Math.random() * 900))}`;
      orderToSave = {
        id: `ord-${Date.now()}`,
        receiptNumber: newReceiptNumber,
        type,
        tableId,
        tableName,
        customerName: customerName || (type === 'meja' ? tableName || 'Meja' : 'Bungkus'),
        items,
        subtotal,
        discount: 0,
        tax: 0,
        total: subtotal,
        status: 'saved',
        createdAt: date.toISOString(),
      };
    }

    if (type === 'bungkus') {
      setOrderSheetState({ isOpen: false, orderType: 'bungkus' });
      setCheckoutOrder(orderToSave);
      showNotification('Pesanan bungkus tersimpan. Lanjutkan pembayaran.');
      return;
    }

    // Dine-in table order
    const updatedActiveOrders = { ...activeOrders, [orderToSave.id]: orderToSave };
    setActiveOrders(updatedActiveOrders);
    StorageService.saveActiveOrders(updatedActiveOrders);

    if (tableId) {
      const updatedTables = tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'terisi' as const,
              orderId: orderToSave.id,
              totalAmount: orderToSave.total,
              itemsCount: orderToSave.items.reduce((s, i) => s + i.quantity, 0),
              openedAt: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            }
          : t
      );
      setTables(updatedTables);
      StorageService.saveTables(updatedTables);
    }

    setOrderSheetState({ isOpen: false, orderType: 'meja' });

    if (printOption === 'bluetooth') {
      await PrinterService.printOrder(orderToSave, profile, printerConfig, true);
      setReceiptModalState({
        isOpen: true,
        order: orderToSave,
        isKitchenSlip: true,
      });
      showNotification(`Pesanan ${tableName} tersimpan & Struk Dapur dicetak.`);
    } else {
      showNotification(`Pesanan ${tableName} berhasil disimpan.`);
    }
  };

  const handleProceedToPay = (table: TableItem) => {
    if (!table.orderId || !activeOrders[table.orderId]) {
      alert('Data pesanan meja tidak ditemukan.');
      return;
    }
    setCheckoutOrder(activeOrders[table.orderId]);
  };

  const handleCompletePayment = async (
    completedOrder: Order,
    printOption: 'bluetooth' | 'pdf' | 'both' | 'none'
  ) => {
    StorageService.addTransaction(completedOrder);
    setHistory([completedOrder, ...history]);

    const copyActive = { ...activeOrders };
    delete copyActive[completedOrder.id];
    setActiveOrders(copyActive);
    StorageService.saveActiveOrders(copyActive);

    if (completedOrder.tableId) {
      const updatedTables = tables.map((t) =>
        t.id === completedOrder.tableId
          ? {
              ...t,
              status: 'kosong' as const,
              orderId: undefined,
              totalAmount: undefined,
              itemsCount: undefined,
              openedAt: undefined,
            }
          : t
      );
      setTables(updatedTables);
      StorageService.saveTables(updatedTables);
    }

    setCheckoutOrder(null);

    if (printOption === 'bluetooth' || printOption === 'both') {
      await PrinterService.printOrder(completedOrder, profile, printerConfig, false);
      setReceiptModalState({
        isOpen: true,
        order: completedOrder,
        isKitchenSlip: false,
      });
      showNotification('Pembayaran LUNAS! Struk nota dicetak ke printer.');
    } else if (printOption === 'pdf') {
      setReceiptModalState({
        isOpen: true,
        order: completedOrder,
        isKitchenSlip: false,
      });
      showNotification('Pembayaran LUNAS! Pratinjau struk PDF siap disimpan.');
    } else {
      showNotification('Pembayaran LUNAS! Transaksi tersimpan rapi.');
    }
  };

  const handleClearTable = (table: TableItem) => {
    if (table.orderId) {
      const copy = { ...activeOrders };
      delete copy[table.orderId];
      setActiveOrders(copy);
      StorageService.saveActiveOrders(copy);
    }
    const updated = tables.map((t) =>
      t.id === table.id
        ? {
            ...t,
            status: 'kosong' as const,
            orderId: undefined,
            totalAmount: undefined,
            itemsCount: undefined,
            openedAt: undefined,
          }
        : t
    );
    setTables(updated);
    StorageService.saveTables(updated);
    showNotification(`${table.name} berhasil dikosongkan.`);
  };

  // Helper counts
  const occupiedTablesCount = tables.filter((t) => t.status !== 'kosong').length;
  const pendingApprovalsCount = letters.filter((l) => l.status.startsWith('pending')).length;

  const getBaksoPageTitle = () => {
    switch (activeBaksoTab) {
      case 'kasir':
        return { title: 'Bakso Qu 1.0', subtitle: 'Kasir & Denah Meja' };
      case 'bahan':
        return { title: 'Modal & Bahan', subtitle: 'Manajemen Stok Gudang' };
      case 'omset':
        return { title: 'Omset & Pendapatan', subtitle: 'Ringkasan Keuangan' };
      case 'laporan':
        return { title: 'Laporan Transaksi', subtitle: 'Riwayat Penjualan & Ekspor' };
      case 'setting':
        return { title: 'Pengaturan Aplikasi', subtitle: 'Profil Usaha & Bluetooth' };
      default:
        return { title: 'Bakso Qu 1.0', subtitle: 'POS Restoran' };
    }
  };

  const baksoPageInfo = getBaksoPageTitle();

  const getAppQuModuleName = () => {
    switch (activeAppQuModule) {
      case 'paguyuban':
        return 'PaguyubanQu (Sosial & Kas)';
      case 'warga':
        return 'WargaQu (Buku Induk Warga)';
      case 'usaha':
        return 'UsahaQu (Lapak & Switch POS)';
      case 'area':
        return 'AreaQu (Peta & Sewa Lapak)';
      case 'siaga':
        return 'SiagaQu (Tombol Darurat & Ronda)';
      case 'chat':
        return 'ChatQu (Percakapan & Notifikasi)';
      case 'setting':
        return 'Pengaturan & Auto-Update';
      case 'arsitektur':
        return 'Dokumen Arsitektur & DB';
      default:
        return 'AppQu Ecosystem';
    }
  };

  return (
    <AndroidFrame
      appLabel={
        appMode === 'appqu'
          ? 'AppQu'
          : appMode === 'baksoqu'
          ? 'BaksoQu'
          : appMode === 'bengkelqu'
          ? 'BengkelQu'
          : appMode === 'klinikqu'
          ? 'KlinikQu'
          : appMode === 'ritelqu'
          ? 'RitelQu'
          : appMode === 'kulinerqu'
          ? 'KulinerQu'
          : appMode === 'transportasiqu'
          ? 'TransportasiQu'
          : 'PelayananQu'
      }
    >
      {/* Toast Notification Banner */}
      {notification && (
        <div className="absolute top-14 left-4 right-4 z-50 bg-stone-900 text-amber-300 px-3.5 py-2 rounded-2xl shadow-xl border border-amber-500/40 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
          <span>{notification}</span>
        </div>
      )}

      {/* Top Floating Auto-Update Notification Banner */}
      {availableUpdate && availableUpdate.hasUpdate && (
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white px-3.5 py-2 flex items-center justify-between text-xs font-semibold shadow-md shrink-0 z-40 border-b border-emerald-500/30">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
            <span className="truncate">Rilis Baru: AppQu v{availableUpdate.latestVersion}</span>
          </div>
          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="px-2.5 py-1 rounded-full bg-white text-emerald-900 text-[11px] font-extrabold shadow-sm hover:bg-emerald-50 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            Lihat & Pasang
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. APPQU ECOSYSTEM WORKSPACE */}
      {/* ========================================================= */}
      {appMode === 'appqu' && (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-stone-100">
          {/* AppQu Top Header (Static at top) */}
          <AppQuHeader
            currentUser={currentUser}
            activeModuleName={getAppQuModuleName()}
            onCheckUpdate={() => setIsUpdateModalOpen(true)}
            isAreaQu={activeAppQuModule === 'area'}
            areaRadiusMeters={areaRadiusMeters}
            onSelectAreaRadius={(radius) => {
              setAreaRadiusMeters(radius);
              const label = radius >= 1000 ? `${radius / 1000} km` : `${radius}m`;
              showNotification(`Radius filter diubah ke: ${label}`);
            }}
            areaCategory={areaCategory}
            onSelectAreaCategory={(cat) => {
              setAreaCategory(cat);
              const catLabels: Record<string, string> = {
                all: 'Semua Titik',
                lapak: 'Lapak & Warung',
                transportasi: 'Kurir 🛵',
                fasum: 'Fasum & Ronda',
                titik_netral: 'Titik Netral Parpol',
              };
              showNotification(`Filter titik: ${catLabels[cat] || cat}`);
            }}
            onOpenAreaRental={() => setIsAreaRentalModalOpen(true)}
            onOpenAreaNeutrality={() => setIsAreaNeutralityModalOpen(true)}
          />

          {/* Module View Renderer */}
          <main className="flex-1 flex flex-col relative overflow-hidden">
            {activeAppQuModule === 'paguyuban' && (
              <PaguyubanView
                currentUser={currentUser}
                feeds={feeds}
                agenda={agenda}
                kas={kas}
                letters={letters}
                onUpdateFeeds={(newF) => {
                  setFeeds(newF);
                  AppQuStorageService.saveFeeds(newF);
                }}
                onUpdateAgenda={(newA) => {
                  setAgenda(newA);
                  AppQuStorageService.saveAgenda(newA);
                }}
                onUpdateKas={(newK) => {
                  setKas(newK);
                  AppQuStorageService.saveKas(newK);
                }}
                onUpdateLetters={(newL) => {
                  setLetters(newL);
                  AppQuStorageService.saveLetters(newL);
                }}
                showNotification={showNotification}
              />
            )}

            {activeAppQuModule === 'warga' && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="bg-stone-900 border-b border-stone-800 px-3.5 py-2 flex items-center justify-between shrink-0">
                  <button
                    onClick={() => setActiveAppQuModule('setting')}
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                  >
                    ← Kembali ke Opsi / Pengaturan
                  </button>
                  <span className="text-[11px] text-stone-400">Buku Induk WargaQu</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <WargaView
                    currentUser={currentUser}
                    residents={residents}
                    onUpdateResidents={(newR) => {
                      setResidents(newR);
                      AppQuStorageService.saveResidents(newR);
                    }}
                    showNotification={showNotification}
                  />
                </div>
              </div>
            )}

            {activeAppQuModule === 'usaha' && (
              <UsahaQuView
                currentUser={currentUser}
                businesses={businesses}
                onSwitchToBaksoQu={handleSwitchToBaksoQu}
                onSwitchToBengkelQu={handleSwitchToBengkelQu}
                onSwitchToKlinikQu={handleSwitchToKlinikQu}
                onSwitchToRitelQu={handleSwitchToRitelQu}
                onSwitchToKulinerQu={handleSwitchToKulinerQu}
                onSwitchToTransportasiQu={handleSwitchToTransportasiQu}
                onSwitchToPelayananQu={handleSwitchToPelayananQu}
                onSwitchToProyekQu={handleSwitchToProyekQu}
                onOpenAreaQu={() => setActiveAppQuModule('area')}
                onOpenChat={(threadId) => {
                  setSelectedChatThreadId(threadId || null);
                  setActiveAppQuModule('chat');
                }}
                onUpdateBusinesses={(newB) => {
                  setBusinesses(newB);
                  AppQuStorageService.saveBusinesses(newB);
                }}
                showNotification={showNotification}
              />
            )}

            {activeAppQuModule === 'area' && (
              <AreaQuView
                currentUser={currentUser}
                areaPoints={areaPoints}
                couriers={couriers}
                selectedRadiusMeters={areaRadiusMeters}
                onSelectRadius={setAreaRadiusMeters}
                selectedCategory={areaCategory}
                onSelectCategory={setAreaCategory}
                isRentalModalOpen={isAreaRentalModalOpen}
                onCloseRentalModal={() => setIsAreaRentalModalOpen(false)}
                isNeutralityModalOpen={isAreaNeutralityModalOpen}
                onCloseNeutralityModal={() => setIsAreaNeutralityModalOpen(false)}
                onOpenUsaha={() => setActiveAppQuModule('usaha')}
                onOpenChat={(threadId) => {
                  setSelectedChatThreadId(threadId || null);
                  setActiveAppQuModule('chat');
                }}
                showNotification={showNotification}
              />
            )}

            {activeAppQuModule === 'siaga' && (
              <SiagaQuView
                currentUser={currentUser}
                checkpoints={checkpoints}
                patrolLogs={patrolLogs}
                musibahList={musibahList}
                piketTasks={piketTasks}
                onUpdateCheckpoints={(newCp) => {
                  setCheckpoints(newCp);
                  AppQuStorageService.saveCheckpoints(newCp);
                }}
                onUpdatePatrolLogs={(newLogs) => {
                  setPatrolLogs(newLogs);
                  AppQuStorageService.savePatrolLogs(newLogs);
                }}
                onUpdateMusibah={(newM) => {
                  setMusibahList(newM);
                  AppQuStorageService.saveMusibah(newM);
                }}
                onUpdatePiket={(newP) => {
                  setPiketTasks(newP);
                  AppQuStorageService.savePiket(newP);
                }}
                showNotification={showNotification}
              />
            )}

            {activeAppQuModule === 'chat' && (
              <ChatQuView
                currentUser={currentUser}
                initialThreadId={selectedChatThreadId}
                onOpenPanic={() => setActiveAppQuModule('siaga')}
                showNotification={showNotification}
              />
            )}

            {activeAppQuModule === 'setting' && (
              <SettingView
                profile={profile}
                onSaveProfile={(newProf) => {
                  setProfile(newProf);
                  StorageService.saveProfile(newProf);
                  showNotification('Profil unit berhasil disimpan.');
                }}
                printerConfig={printerConfig}
                onSavePrinterConfig={(newCfg) => {
                  setPrinterConfig(newCfg);
                  StorageService.savePrinterConfig(newCfg);
                  showNotification('Konfigurasi printer berhasil disimpan.');
                }}
                menuList={menuList}
                onSaveMenu={(newMenu) => {
                  setMenuList(newMenu);
                  StorageService.saveMenu(newMenu);
                  showNotification('Daftar menu berhasil diperbarui.');
                }}
                currentUser={currentUser}
                residents={residents}
                onUpdateResidents={(newR) => {
                  setResidents(newR);
                  AppQuStorageService.saveResidents(newR);
                }}
                onOpenRoleModal={() => setIsRoleModalOpen(true)}
                onOpenHierarchy={() => setIsHierarchyModalOpen(true)}
                witnessCount={currentUser.witnessCount}
                onNavigateToModule={(mod) => setActiveAppQuModule(mod as any)}
                showNotification={showNotification}
                initialSubTab="komunitas"
              />
            )}

            {activeAppQuModule === 'arsitektur' && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="bg-stone-900 border-b border-stone-800 px-3.5 py-2 flex items-center justify-between shrink-0">
                  <button
                    onClick={() => setActiveAppQuModule('setting')}
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                  >
                    ← Kembali ke Opsi / Pengaturan
                  </button>
                  <span className="text-[11px] text-stone-400">Skema & Arsitektur</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <ArsitekturView />
                </div>
              </div>
            )}
          </main>

          {/* AppQu Bottom Navigation Bar (Static at bottom, No Duplication) */}
          <AppQuBottomNav
            activeModule={activeAppQuModule}
            onSelectModule={(mod) => {
              if (mod === 'chat') setSelectedChatThreadId(null);
              setActiveAppQuModule(mod);
            }}
            onOpenHierarchy={() => setIsHierarchyModalOpen(true)}
            onOpenRoleModal={() => setIsRoleModalOpen(true)}
            unreadChatCount={1}
            pendingApprovalsCount={
              currentUser.roleTier === 'pengurus' || currentUser.roleTier === 'governance' || currentUser.roleTier === 'tier2_pengurus_rt'
                ? pendingApprovalsCount
                : 0
            }
            witnessCount={currentUser.witnessCount || 0}
          />

          {/* Hierarchy & Chain of Trust Modal Dialog (Strictly Tier 1 & 2 Saja) */}
          <HierarchyModal
            isOpen={isHierarchyModalOpen}
            onClose={() => setIsHierarchyModalOpen(false)}
            currentUser={currentUser}
            pendingList={pendingVerifications}
            onApproveResident={handleApproveResident}
            onRejectResident={handleRejectResident}
            onRequestWitness={handleRequestWitness}
            showNotification={showNotification}
          />

          {/* Interactive Role Switcher Modal (Tier 1 & 2 RBAC + POS Switch) */}
          <RoleSwitcherModal
            isOpen={isRoleModalOpen}
            onClose={() => setIsRoleModalOpen(false)}
            currentUser={currentUser}
            onChangeUser={handleChangeUser}
            onSwitchToBaksoQu={handleSwitchToBaksoQu}
            onSwitchToBengkelQu={handleSwitchToBengkelQu}
            onSwitchToKlinikQu={handleSwitchToKlinikQu}
            onSwitchToRitelQu={handleSwitchToRitelQu}
            onSwitchToKulinerQu={handleSwitchToKulinerQu}
            onSwitchToTransportasiQu={handleSwitchToTransportasiQu}
            onSwitchToPelayananQu={handleSwitchToPelayananQu}
            onSwitchToProyekQu={handleSwitchToProyekQu}
            onOpenArsitektur={() => setActiveAppQuModule('arsitektur')}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. BAKSOQU 1.0 POS WORKSTATION (SWITCH MASTER USAHAQU) */}
      {/* ========================================================= */}
      {appMode === 'baksoqu' && (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-stone-100">
          {/* BaksoQu Top Header with Back to AppQu Button */}
          <HeaderBar
            title={baksoPageInfo.title}
            subtitle={baksoPageInfo.subtitle}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onTakeawayClick={handleOpenBungkus}
            printerConfig={printerConfig}
            onOpenPrinterModal={() => setIsBluetoothModalOpen(true)}
            showTakeawayBtn={activeBaksoTab === 'kasir'}
            onBackToAppQu={handleReturnToAppQu}
          />

          {/* Quick Notice Banner */}
          <div className="bg-amber-500 text-stone-950 px-3 py-1 text-[11px] font-bold flex items-center justify-between shadow-2xs">
            <span>Mode POS UsahaQu: Bakso Qu 1.0 (Aktif)</span>
            <button
              onClick={handleReturnToAppQu}
              className="text-[10px] font-black underline hover:text-white"
            >
              Kembali ke AppQu ➔
            </button>
          </div>

          {/* Main Content Area Based on Active Bakso Tab */}
          <main className="flex-1 flex flex-col relative overflow-hidden bg-stone-100">
            {activeBaksoTab === 'kasir' && (
              <TableGrid
                tables={tables}
                activeOrders={activeOrders}
                onSelectTable={handleSelectTable}
                onAddTable={handleAddTable}
                onReorderTables={handleReorderTables}
                onDeleteTable={handleDeleteTable}
              />
            )}

            {activeBaksoTab === 'bahan' && (
              <BahanView
                ingredients={ingredients}
                onSaveIngredients={(newItems) => {
                  setIngredients(newItems);
                  StorageService.saveIngredients(newItems);
                  showNotification('Data bahan baku diperbarui.');
                }}
              />
            )}

            {activeBaksoTab === 'omset' && <OmsetDashboard history={history} />}

            {activeBaksoTab === 'laporan' && (
              <LaporanView
                history={history}
                profile={profile}
                onOpenReceipt={(ord) =>
                  setReceiptModalState({ isOpen: true, order: ord, isKitchenSlip: false })
                }
              />
            )}

            {activeBaksoTab === 'setting' && (
              <SettingView
                profile={profile}
                onSaveProfile={(newProf) => {
                  setProfile(newProf);
                  StorageService.saveProfile(newProf);
                }}
                printerConfig={printerConfig}
                onSavePrinterConfig={(newCfg) => {
                  setPrinterConfig(newCfg);
                  StorageService.savePrinterConfig(newCfg);
                }}
                menuList={menuList}
                onSaveMenu={(newMenu) => {
                  setMenuList(newMenu);
                  StorageService.saveMenu(newMenu);
                  showNotification('Daftar menu berhasil diperbarui.');
                }}
                currentUser={currentUser}
                residents={residents}
                onUpdateResidents={(newR) => {
                  setResidents(newR);
                  AppQuStorageService.saveResidents(newR);
                }}
                onOpenRoleModal={() => setIsRoleModalOpen(true)}
                onOpenHierarchy={() => setIsHierarchyModalOpen(true)}
                witnessCount={currentUser.witnessCount}
                showNotification={showNotification}
                initialSubTab="toko"
              />
            )}
          </main>

          {/* Fixed Bottom Navigation Bar for BaksoQu */}
          <BottomNavBar
            activeTab={activeBaksoTab}
            onSelectTab={setActiveBaksoTab}
            occupiedCount={occupiedTablesCount}
          />

          {/* Navigation Drawer (Sidebar) */}
          <NavigationDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            activeTab={activeBaksoTab}
            onSelectTab={setActiveBaksoTab}
            profile={profile}
            printerConfig={printerConfig}
            occupiedTablesCount={occupiedTablesCount}
            onBackToAppQu={handleReturnToAppQu}
          />

          {/* Quick Bluetooth Status Modal */}
          <BluetoothModal
            isOpen={isBluetoothModalOpen}
            onClose={() => setIsBluetoothModalOpen(false)}
            printerConfig={printerConfig}
            onSavePrinterConfig={(cfg) => {
              setPrinterConfig(cfg);
              StorageService.savePrinterConfig(cfg);
            }}
            profile={profile}
          />

          {/* Order Bottom Sheet */}
          <OrderBottomSheet
            isOpen={orderSheetState.isOpen}
            onClose={() => setOrderSheetState({ isOpen: false, orderType: 'meja' })}
            orderType={orderSheetState.orderType}
            tableName={orderSheetState.tableName}
            tableId={orderSheetState.tableId}
            existingOrder={orderSheetState.existingOrder}
            menuList={menuList}
            onSaveAndPrint={handleSaveAndPrintOrder}
          />

          {/* Table Action Sheet */}
          <TableActionModal
            isOpen={selectedTableForAction !== null}
            onClose={() => setSelectedTableForAction(null)}
            table={selectedTableForAction}
            activeOrder={
              selectedTableForAction?.orderId
                ? activeOrders[selectedTableForAction.orderId] || null
                : null
            }
            onPay={() => {
              if (selectedTableForAction) handleProceedToPay(selectedTableForAction);
            }}
            onAddMoreMenu={() => {
              if (selectedTableForAction) {
                const existing = selectedTableForAction.orderId
                  ? activeOrders[selectedTableForAction.orderId]
                  : null;
                setOrderSheetState({
                  isOpen: true,
                  orderType: 'meja',
                  tableId: selectedTableForAction.id,
                  tableName: selectedTableForAction.name,
                  existingOrder: existing,
                });
              }
            }}
            onViewReceipt={() => {
              if (selectedTableForAction?.orderId && activeOrders[selectedTableForAction.orderId]) {
                setReceiptModalState({
                  isOpen: true,
                  order: activeOrders[selectedTableForAction.orderId],
                  isKitchenSlip: true,
                });
              }
            }}
            onClearTable={() => {
              if (selectedTableForAction) handleClearTable(selectedTableForAction);
            }}
          />

          {/* Checkout Screen Sheet */}
          <CheckoutModal
            isOpen={checkoutOrder !== null}
            onClose={() => setCheckoutOrder(null)}
            order={checkoutOrder}
            printerConfig={printerConfig}
            onCompletePayment={handleCompletePayment}
          />

          {/* Thermal Receipt Preview Modal */}
          <ReceiptModal
            isOpen={receiptModalState.isOpen}
            onClose={() => setReceiptModalState({ isOpen: false, order: null })}
            order={receiptModalState.order}
            profile={profile}
            printerConfig={printerConfig}
            isKitchenSlip={receiptModalState.isKitchenSlip}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. BENGKELQU SMART WORKSHOP (SWITCH MASTER USAHAQU)       */}
      {/* ========================================================= */}
      {appMode === 'bengkelqu' && (
        <BengkelQuView
          currentUser={currentUser}
          onBackToAppQu={handleReturnToAppQu}
          showNotification={showNotification}
        />
      )}

      {/* ========================================================= */}
      {/* 4. KLINIKQU MEDICAL CLINIC (SWITCH MASTER USAHAQU)        */}
      {/* ========================================================= */}
      {appMode === 'klinikqu' && (
        <KlinikQuView
          currentUser={currentUser}
          onBackToAppQu={handleReturnToAppQu}
          showNotification={showNotification}
        />
      )}

      {/* ========================================================= */}
      {/* 5. RITELQU TOKO KELONTONG (SWITCH MASTER USAHAQU)         */}
      {/* ========================================================= */}
      {appMode === 'ritelqu' && (
        <RitelQuView
          currentUser={currentUser}
          onBackToAppQu={handleReturnToAppQu}
          showNotification={showNotification}
        />
      )}

      {/* ========================================================= */}
      {/* 6. KULINERQU POS KULINER (KIOS, MANGKAL & KELILING)       */}
      {/* ========================================================= */}
      {appMode === 'kulinerqu' && (
        <KulinerQuView
          currentUser={currentUser}
          onBackToAppQu={handleReturnToAppQu}
          showNotification={showNotification}
        />
      )}

      {/* ========================================================= */}
      {/* 7. TRANSPORTASIQU (6 SUB-KATEGORI ANGKUTAN & LOGISTIK)     */}
      {/* ========================================================= */}
      {appMode === 'transportasiqu' && (
        <TransportasiQuView
          currentUser={currentUser}
          onBackToAppQu={handleReturnToAppQu}
          showNotification={showNotification}
        />
      )}

      {/* ========================================================= */}
      {/* 8. PELAYANANQU (6 SUB-KATEGORI JASA & LAYANAN WARGA)       */}
      {/* ========================================================= */}
      {appMode === 'pelayananqu' && (
        <PelayananQuView
          currentUser={currentUser}
          onBackToAppQu={handleReturnToAppQu}
          showNotification={showNotification}
        />
      )}

      {/* ========================================================= */}
      {/* 9. USAHAQU - PROYEK (RAB, VOLUME & PEMBAYARAN TERMIN)     */}
      {/* ========================================================= */}
      {appMode === 'proyekqu' && (
        <ProyekQuView
          currentUser={currentUser}
          onBackToAppQu={handleReturnToAppQu}
          onSwitchToRitelQu={handleSwitchToRitelQu}
          onSwitchToPelayananQu={handleSwitchToPelayananQu}
          showNotification={showNotification}
        />
      )}

      {/* Global In-App Update Modal */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        updateInfo={availableUpdate}
      />
    </AndroidFrame>
  );
}
