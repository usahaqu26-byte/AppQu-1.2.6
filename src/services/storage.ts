import { TableItem, MenuItem, Order, Ingredient, RestaurantProfile, PrinterConfig } from '../types';

import baksoUratImg from '../assets/images/bakso_urat_jumbo_1790260587825.jpg';
import baksoKomplitImg from '../assets/images/bakso_komplit_1790260605375.jpg';
import esTehImg from '../assets/images/es_teh_manis_1790260616776.jpg';
import esJerukImg from '../assets/images/es_jeruk_peras_1790260629539.jpg';

const STORAGE_KEYS = {
  TABLES: 'baksoqu_tables_v1',
  MENU: 'baksoqu_menu_v1',
  ACTIVE_ORDERS: 'baksoqu_active_orders_v1',
  HISTORY_TRANSACTIONS: 'baksoqu_history_v1',
  INGREDIENTS: 'baksoqu_ingredients_v1',
  PROFILE: 'baksoqu_profile_v1',
  PRINTER: 'baksoqu_printer_v1',
};

export const DEFAULT_PROFILE: RestaurantProfile = {
  name: 'Bakso Qu 1.0',
  slogan: 'Spesialis Bakso Urat & Daging Asli Sapi Pilihan',
  address: 'Jl. Malioboro No. 45, Kota Yogyakarta',
  phone: '0812-3456-7890',
  receiptHeader: 'Selamat Menikmati Kelezatan Bakso Qu!',
  receiptFooter: 'Terima kasih atas kunjungan Anda. Kritik & Saran WA: 0812-3456-7890',
  currency: 'Rp',
};

export const DEFAULT_PRINTER: PrinterConfig = {
  paperSize: '58mm',
  autoPrintKitchen: true,
  autoPrintReceipt: true,
  connectedDeviceName: 'POS-58-BT (Thermal)',
  isSimulator: true,
};

export const DEFAULT_TABLES: TableItem[] = [
  { id: 'tbl-1', name: 'Meja 1', number: 1, status: 'kosong', positionIndex: 0 },
  { id: 'tbl-2', name: 'Meja 2', number: 2, status: 'kosong', positionIndex: 1 },
  { id: 'tbl-3', name: 'Meja 3', number: 3, status: 'kosong', positionIndex: 2 },
  { id: 'tbl-4', name: 'Meja 4', number: 4, status: 'kosong', positionIndex: 3 },
];

export const DEFAULT_MENU: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'Bakso Urat Jumbo',
    category: 'bakso_kuah',
    price: 25000,
    description: '1 Bakso urat besar kenyal gurih + 2 bakso halus + mie kuning & bihun dengan kuah kaldu sapi kaya rempah.',
    imageUrl: baksoUratImg,
    isAvailable: true,
  },
  {
    id: 'menu-2',
    name: 'Bakso Komplit Telur',
    category: 'bakso_kuah',
    price: 28000,
    description: '1 Bakso isi telur ayam utuh + bakso kecil + pangsit goreng renyah + tahu bakso lembut.',
    imageUrl: baksoKomplitImg,
    isAvailable: true,
  },
  {
    id: 'menu-3',
    name: 'Bakso Halus Spesial',
    category: 'bakso_kuah',
    price: 22000,
    description: '5 butir bakso halus lembut daging sapi 100% tanpa bahan pengawet + sawi hijau & tetelan sapi.',
    imageUrl: baksoUratImg,
    isAvailable: true,
  },
  {
    id: 'menu-4',
    name: 'Pangsit Goreng Renyah (3 pcs)',
    category: 'pelengkap',
    price: 6000,
    description: 'Pangsit goreng isi olahan ayam udang gurih, renyah dicelup kuah bakso.',
    imageUrl: baksoKomplitImg,
    isAvailable: true,
  },
  {
    id: 'menu-5',
    name: 'Tahu Bakso Kukus (2 pcs)',
    category: 'pelengkap',
    price: 7000,
    description: 'Tahu pong lembut dengan isian adonan bakso sapi berlimpah.',
    imageUrl: baksoUratImg,
    isAvailable: true,
  },
  {
    id: 'menu-6',
    name: 'Es Teh Manis Melati',
    category: 'minuman',
    price: 5000,
    description: 'Teh melati seduh harum khas Solo dengan gula asli dan es batu kristal segar.',
    imageUrl: esTehImg,
    isAvailable: true,
  },
  {
    id: 'menu-7',
    name: 'Es Jeruk Peras Murni',
    category: 'minuman',
    price: 8000,
    description: 'Jeruk peras manis segar kaya vitamin C, disajikan dingin menyegarkan tenggorokan.',
    imageUrl: esJerukImg,
    isAvailable: true,
  },
  {
    id: 'menu-8',
    name: 'Paket Hemat Bakso + Es Teh',
    category: 'paket',
    price: 27000,
    description: '1 Porsi Bakso Urat Jumbo + 1 Gelas Es Teh Manis Segar (Hemat Rp 3.000).',
    imageUrl: baksoUratImg,
    isAvailable: true,
  },
];

export const DEFAULT_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-1',
    name: 'Daging Sapi Segar (Paha Depan)',
    initialQty: 25,
    unit: 'kg',
    unitPrice: 125000,
    currentStock: 18.5,
    minStockAlert: 5,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-2',
    name: 'Urat Sapi / Sengkel',
    initialQty: 10,
    unit: 'kg',
    unitPrice: 95000,
    currentStock: 7.2,
    minStockAlert: 3,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-3',
    name: 'Tepung Tapioka Super',
    initialQty: 20,
    unit: 'kg',
    unitPrice: 15000,
    currentStock: 14,
    minStockAlert: 4,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-4',
    name: 'Bawang Goreng Brebes',
    initialQty: 5,
    unit: 'kg',
    unitPrice: 65000,
    currentStock: 3.5,
    minStockAlert: 1.5,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-5',
    name: 'Mie Kuning & Bihun Kering',
    initialQty: 50,
    unit: 'pack',
    unitPrice: 8000,
    currentStock: 38,
    minStockAlert: 10,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-6',
    name: 'Jeruk Peras Segar',
    initialQty: 15,
    unit: 'kg',
    unitPrice: 18000,
    currentStock: 9.5,
    minStockAlert: 3,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-7',
    name: 'Daun Teh Melati Wangi',
    initialQty: 8,
    unit: 'pack',
    unitPrice: 22000,
    currentStock: 6,
    minStockAlert: 2,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-8',
    name: 'Gula Pasir Tebu',
    initialQty: 25,
    unit: 'kg',
    unitPrice: 17500,
    currentStock: 19,
    minStockAlert: 5,
    updatedAt: new Date().toISOString(),
  },
];

// Seed realistic initial transactions for Omset & Laporan
const createSampleHistory = (): Order[] => {
  const now = new Date();
  const sampleData: Order[] = [];

  const timeOffsets = [
    { hours: 1, amount: 64000, method: 'tunai' as const, type: 'meja' as const, table: 'Meja 2' },
    { hours: 2, amount: 82000, method: 'qris' as const, type: 'meja' as const, table: 'Meja 1' },
    { hours: 3.5, amount: 33000, method: 'tunai' as const, type: 'bungkus' as const, table: undefined },
    { hours: 4.5, amount: 110000, method: 'qris' as const, type: 'meja' as const, table: 'Meja 4' },
    { hours: 5.5, amount: 55000, method: 'tunai' as const, type: 'bungkus' as const, table: undefined },
    { hours: 6.5, amount: 77000, method: 'tunai' as const, type: 'meja' as const, table: 'Meja 3' },
    // Yesterday samples
    { days: 1, hours: 2, amount: 95000, method: 'qris' as const, type: 'meja' as const, table: 'Meja 1' },
    { days: 1, hours: 4, amount: 62000, method: 'tunai' as const, type: 'bungkus' as const, table: undefined },
    { days: 1, hours: 6, amount: 135000, method: 'tunai' as const, type: 'meja' as const, table: 'Meja 2' },
    // 2 days ago
    { days: 2, hours: 3, amount: 89000, method: 'qris' as const, type: 'meja' as const, table: 'Meja 3' },
    { days: 2, hours: 5, amount: 48000, method: 'tunai' as const, type: 'bungkus' as const, table: undefined },
    // 3 days ago
    { days: 3, hours: 4, amount: 120000, method: 'tunai' as const, type: 'meja' as const, table: 'Meja 4' },
    { days: 4, hours: 5, amount: 75000, method: 'qris' as const, type: 'meja' as const, table: 'Meja 1' },
    { days: 5, hours: 6, amount: 104000, method: 'tunai' as const, type: 'meja' as const, table: 'Meja 2' },
  ];

  sampleData.push(
    ...timeOffsets.map((s, idx) => {
      const d = new Date(now);
      if (s.days) d.setDate(d.getDate() - s.days);
      d.setHours(d.getHours() - s.hours);

      const items: Order['items'] = [
        { menuId: 'menu-1', name: 'Bakso Urat Jumbo', price: 25000, quantity: 2 },
        { menuId: 'menu-6', name: 'Es Teh Manis Melati', price: 5000, quantity: 2 },
      ];

      return {
        id: `ord-hist-${idx + 1}`,
        receiptNumber: `BQ-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(100 + idx)}`,
        type: s.type,
        tableName: s.table,
        customerName: s.type === 'meja' ? `Tamu ${s.table}` : `Pelanggan #${10 + idx}`,
        items,
        subtotal: s.amount,
        discount: 0,
        tax: 0,
        total: s.amount,
        status: 'paid' as const,
        createdAt: d.toISOString(),
        paidAt: d.toISOString(),
        paymentMethod: s.method,
        cashAmount: s.method === 'tunai' ? (s.amount <= 50000 ? 50000 : 100000) : s.amount,
        changeAmount: s.method === 'tunai' ? ((s.amount <= 50000 ? 50000 : 100000) - s.amount) : 0,
      };
    })
  );

  return sampleData;
};

export const StorageService = {
  getTables(): TableItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TABLES);
    if (!raw) {
      this.saveTables(DEFAULT_TABLES);
      return DEFAULT_TABLES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_TABLES;
    }
  },

  saveTables(tables: TableItem[]): void {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  },

  getMenu(): MenuItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU);
    if (!raw) {
      this.saveMenu(DEFAULT_MENU);
      return DEFAULT_MENU;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_MENU;
    }
  },

  saveMenu(menu: MenuItem[]): void {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
  },

  getActiveOrders(): Record<string, Order> {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORDERS);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  },

  saveActiveOrders(orders: Record<string, Order>): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDERS, JSON.stringify(orders));
  },

  getHistory(): Order[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY_TRANSACTIONS);
    if (!raw) {
      const seeded = createSampleHistory();
      this.saveHistory(seeded);
      return seeded;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveHistory(history: Order[]): void {
    localStorage.setItem(STORAGE_KEYS.HISTORY_TRANSACTIONS, JSON.stringify(history));
  },

  addTransaction(order: Order): void {
    const history = this.getHistory();
    history.unshift(order);
    this.saveHistory(history);
  },

  getIngredients(): Ingredient[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    if (!raw) {
      this.saveIngredients(DEFAULT_INGREDIENTS);
      return DEFAULT_INGREDIENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_INGREDIENTS;
    }
  },

  saveIngredients(items: Ingredient[]): void {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(items));
  },

  getProfile(): RestaurantProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      this.saveProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: RestaurantProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getPrinterConfig(): PrinterConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.PRINTER);
    if (!raw) {
      this.savePrinterConfig(DEFAULT_PRINTER);
      return DEFAULT_PRINTER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PRINTER;
    }
  },

  savePrinterConfig(cfg: PrinterConfig): void {
    localStorage.setItem(STORAGE_KEYS.PRINTER, JSON.stringify(cfg));
  },
};
