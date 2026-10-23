import {
  RitelProduct,
  RitelInvoice,
  RitelCustomer,
  RitelEmployee,
  RitelAttendanceRecord,
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'ritelqu_products_v1',
  INVOICES: 'ritelqu_invoices_v1',
  CUSTOMERS: 'ritelqu_customers_v1',
  EMPLOYEES: 'ritelqu_employees_v1',
  ATTENDANCE: 'ritelqu_attendance_v1',
  DEVICE_ID: 'ritelqu_device_id',
  STORE_NAME: 'ritelqu_store_name',
  STORE_PHONE: 'ritelqu_store_phone',
  OWNER_NAME: 'ritelqu_owner_name',
  ADDRESS: 'ritelqu_address',
  SHARELOC: 'ritelqu_shareloc',
  HEADER_PHOTO: 'ritelqu_header_photo',
};

export interface RitelStoreProfile {
  storeName: string;
  ownerName: string;
  phone: string;
  address: string;
  shareloc: string;
  headerPhoto: string;
}

export const compressImage = (
  file: File,
  maxWidth = 800,
  maxHeight = 400,
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
};

export const DEFAULT_RITEL_PRODUCTS: RitelProduct[] = [
  {
    id: 'rit-1',
    sku: '89910012001',
    name: 'Minyak Goreng 2L Pouch',
    category: 'sembako',
    price: 34000,
    buyPrice: 30500,
    stock: 48,
    unit: 'Pcs',
    minStock: 10,
    expiryDate: '2027-06-15',
  },
  {
    id: 'rit-2',
    sku: '89910012002',
    name: 'Beras Premium 5KG',
    category: 'sembako',
    price: 72500,
    buyPrice: 65000,
    stock: 20,
    unit: 'Sak',
    minStock: 5,
    expiryDate: '2026-12-30',
  },
  {
    id: 'rit-3',
    sku: '89910012003',
    name: 'Gula Pasir 1KG',
    category: 'sembako',
    price: 17000,
    buyPrice: 15200,
    stock: 35,
    unit: 'Pcs',
    minStock: 8,
    expiryDate: '2027-03-20',
  },
  {
    id: 'rit-4',
    sku: '89910012004',
    name: 'Mie Instan Goreng (Karton)',
    category: 'makanan',
    price: 112000,
    buyPrice: 102000,
    stock: 12,
    unit: 'Dus',
    minStock: 3,
    expiryDate: '2026-11-10',
  },
  {
    id: 'rit-5',
    sku: '89910012005',
    name: 'Telur Ayam Segar 1KG',
    category: 'sembako',
    price: 28000,
    buyPrice: 25000,
    stock: 25,
    unit: 'Kg',
    minStock: 6,
    expiryDate: '2026-11-05',
  },
  {
    id: 'rit-6',
    sku: '89910012006',
    name: 'Kopi Kapal Api Spesial Mix 10s',
    category: 'minuman',
    price: 15000,
    buyPrice: 13200,
    stock: 30,
    unit: 'Renteng',
    minStock: 5,
    expiryDate: '2027-04-18',
  },
  {
    id: 'rit-7',
    sku: '89910012007',
    name: 'Gas Elpiji 3KG (Tukar Tabung)',
    category: 'sembako',
    price: 22000,
    buyPrice: 19500,
    stock: 9,
    unit: 'Tabung',
    minStock: 4,
  },
  {
    id: 'rit-8',
    sku: '89910012008',
    name: 'Air Galon Aqua 19L (Refill Resmi)',
    category: 'minuman',
    price: 20000,
    buyPrice: 17500,
    stock: 16,
    unit: 'Galon',
    minStock: 5,
  },
  {
    id: 'rit-9',
    sku: '89910012009',
    name: 'Sabun Cuci Piring Jeruk Nipis 780ml',
    category: 'kebersihan',
    price: 14500,
    buyPrice: 12800,
    stock: 24,
    unit: 'Pouch',
    minStock: 5,
    expiryDate: '2027-08-01',
  },
  {
    id: 'rit-10',
    sku: '89910012010',
    name: 'Kecap Manis Bango 520ml',
    category: 'bumbu',
    price: 23000,
    buyPrice: 20500,
    stock: 18,
    unit: 'Pouch',
    minStock: 4,
    expiryDate: '2027-05-12',
  },
];

export const DEFAULT_RITEL_EMPLOYEES: RitelEmployee[] = [
  {
    id: 'emp-1',
    name: 'Hendra Saputra',
    email: 'hendra.kasir@ritelqu.id',
    phone: '081234567811',
    role: 'spv',
    status: 'aktif',
    joinedDate: '2025-01-10',
    notes: 'Supervisor Operasional & Inventaris Toko',
  },
  {
    id: 'emp-2',
    name: 'Dewi Lestari',
    email: 'dewi.kasir@ritelqu.id',
    phone: '081298765422',
    role: 'kasir',
    status: 'aktif',
    joinedDate: '2025-03-01',
    notes: 'Kasir Shift Pagi - Terbiasa scan barcode & QRIS',
  },
  {
    id: 'emp-3',
    name: 'Ahmad Fauzi',
    email: 'fauzi.kasir@ritelqu.id',
    phone: '081311223344',
    role: 'kasir',
    status: 'aktif',
    joinedDate: '2025-05-15',
    notes: 'Kasir Shift Sore & Pembukuan Kas Harian',
  },
  {
    id: 'emp-4',
    name: 'Ibu Sri Wahyuni',
    email: 'sri.wahyuni@ritelqu.id',
    phone: '081234567890',
    role: 'admin',
    status: 'aktif',
    joinedDate: '2024-01-01',
    notes: 'Pemilik Usaha / Admin Utama Toko',
  },
];

export const DEFAULT_RITEL_ATTENDANCE: RitelAttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'emp-1',
    employeeName: 'Hendra Saputra',
    employeeRole: 'spv',
    date: '2026-10-20',
    checkInTime: '07:30',
    checkOutTime: '16:00',
    status: 'hadir',
    shift: 'Pagi',
    notes: 'Cek stok awal pagi & terima pasokan beras',
  },
  {
    id: 'att-2',
    employeeId: 'emp-2',
    employeeName: 'Dewi Lestari',
    employeeRole: 'kasir',
    date: '2026-10-20',
    checkInTime: '07:45',
    checkOutTime: '15:30',
    status: 'hadir',
    shift: 'Pagi',
    notes: 'Standby meja kasir pagi',
  },
  {
    id: 'att-3',
    employeeId: 'emp-3',
    employeeName: 'Ahmad Fauzi',
    employeeRole: 'kasir',
    date: '2026-10-20',
    checkInTime: '14:55',
    status: 'hadir',
    shift: 'Siang',
    notes: 'Shift siang sampai toko tutup',
  },
];

export const DEFAULT_RITEL_CUSTOMERS: RitelCustomer[] = [
  {
    id: 'cust-1',
    name: 'Budi Santoso',
    phone: '081234567891',
    blockNumber: 'Blok C3 No. 04',
    points: 120,
    totalDebt: 34000,
    notes: 'Langganan beras & gas elpiji',
  },
  {
    id: 'cust-2',
    name: 'Siti Rahmawati',
    phone: '081298765432',
    blockNumber: 'Blok B3 No. 12',
    points: 85,
    totalDebt: 0,
    notes: 'Member setia bayar selalu QRIS',
  },
  {
    id: 'cust-3',
    name: 'Pak RT Bambang',
    phone: '081377889900',
    blockNumber: 'Blok A1 No. 01',
    points: 250,
    totalDebt: 0,
    notes: 'Ketua RT 04 - Belanja kas RT',
  },
];

export const DEFAULT_RITEL_INVOICES: RitelInvoice[] = [
  {
    id: 'inv-rit-1',
    invoiceNumber: 'INV-RIT-20261019-01',
    cashierName: 'Bu RT / Hendra',
    customerName: 'Budi Santoso',
    customerPhone: '081234567891',
    items: [
      { id: 'ci-1', productId: 'rit-1', sku: '89910012001', name: 'Minyak Goreng 2L Pouch', price: 34000, qty: 1, unit: 'Pcs' },
      { id: 'ci-2', productId: 'rit-3', sku: '89910012003', name: 'Gula Pasir 1KG', price: 17000, qty: 2, unit: 'Pcs' },
    ],
    total: 68000,
    cashGiven: 70000,
    change: 2000,
    paymentMethod: 'tunai',
    status: 'lunas',
    createdAt: '2026-10-19T08:30:00Z',
    notes: 'Belanja harian warga',
  },
  {
    id: 'inv-rit-2',
    invoiceNumber: 'INV-RIT-20261019-02',
    cashierName: 'Bu RT / Hendra',
    customerName: 'Siti Rahmawati',
    customerPhone: '081298765432',
    items: [
      { id: 'ci-3', productId: 'rit-2', sku: '89910012002', name: 'Beras Premium 5KG', price: 72500, qty: 1, unit: 'Sak' },
      { id: 'ci-4', productId: 'rit-5', sku: '89910012005', name: 'Telur Ayam Segar 1KG', price: 28000, qty: 1, unit: 'Kg' },
    ],
    total: 100500,
    cashGiven: 100500,
    change: 0,
    paymentMethod: 'qris',
    status: 'lunas',
    createdAt: '2026-10-19T11:15:00Z',
    notes: 'QRIS Pembayaran Warga',
  },
];

export const RitelStorageService = {
  getDeviceId(): string {
    let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!id) {
      id = 'RITEL-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
    }
    return id;
  },

  getStoreName(): string {
    return localStorage.getItem(STORAGE_KEYS.STORE_NAME) || 'Toko Kelontong Berkah RT 04';
  },

  setStoreName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.STORE_NAME, name);
  },

  getStorePhone(): string {
    return localStorage.getItem(STORAGE_KEYS.STORE_PHONE) || '081234567890';
  },

  setStorePhone(phone: string): void {
    localStorage.setItem(STORAGE_KEYS.STORE_PHONE, phone);
  },

  getOwnerName(): string {
    return localStorage.getItem(STORAGE_KEYS.OWNER_NAME) || 'Ibu Sri Wahyuni / Pak RT Bambang';
  },

  setOwnerName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.OWNER_NAME, name);
  },

  getAddress(): string {
    return (
      localStorage.getItem(STORAGE_KEYS.ADDRESS) ||
      'Jl. Graha Kencana Raya No. 04, RT 04 / RW 02'
    );
  },

  setAddress(addr: string): void {
    localStorage.setItem(STORAGE_KEYS.ADDRESS, addr);
  },

  getShareloc(): string {
    return (
      localStorage.getItem(STORAGE_KEYS.SHARELOC) ||
      'https://maps.google.com/?q=-6.200000,106.816666'
    );
  },

  setShareloc(url: string): void {
    localStorage.setItem(STORAGE_KEYS.SHARELOC, url);
  },

  getHeaderPhoto(): string {
    return localStorage.getItem(STORAGE_KEYS.HEADER_PHOTO) || '';
  },

  setHeaderPhoto(dataUrl: string): void {
    localStorage.setItem(STORAGE_KEYS.HEADER_PHOTO, dataUrl);
  },

  getStoreProfile(): RitelStoreProfile {
    return {
      storeName: this.getStoreName(),
      ownerName: this.getOwnerName(),
      phone: this.getStorePhone(),
      address: this.getAddress(),
      shareloc: this.getShareloc(),
      headerPhoto: this.getHeaderPhoto(),
    };
  },

  setStoreProfile(profile: Partial<RitelStoreProfile>): void {
    if (profile.storeName !== undefined) this.setStoreName(profile.storeName);
    if (profile.ownerName !== undefined) this.setOwnerName(profile.ownerName);
    if (profile.phone !== undefined) this.setStorePhone(profile.phone);
    if (profile.address !== undefined) this.setAddress(profile.address);
    if (profile.shareloc !== undefined) this.setShareloc(profile.shareloc);
    if (profile.headerPhoto !== undefined) this.setHeaderPhoto(profile.headerPhoto);
  },

  // Products
  getProducts(): RitelProduct[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      this.saveProducts(DEFAULT_RITEL_PRODUCTS);
      return DEFAULT_RITEL_PRODUCTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_RITEL_PRODUCTS;
    }
  },

  saveProducts(products: RitelProduct[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Invoices
  getInvoices(): RitelInvoice[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) {
      this.saveInvoices(DEFAULT_RITEL_INVOICES);
      return DEFAULT_RITEL_INVOICES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_RITEL_INVOICES;
    }
  },

  saveInvoices(invoices: RitelInvoice[]): void {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  },

  addInvoice(invoice: RitelInvoice): void {
    const list = this.getInvoices();
    list.unshift(invoice);
    this.saveInvoices(list);

    // Deduct stock
    const products = this.getProducts();
    for (const item of invoice.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.qty);
      }
    }
    this.saveProducts(products);

    // Update Customer points & debt if applicable
    if (invoice.customerName) {
      const customers = this.getCustomers();
      const match = customers.find(
        (c) =>
          c.name.toLowerCase() === invoice.customerName?.toLowerCase() ||
          (invoice.customerPhone && c.phone === invoice.customerPhone)
      );

      if (match) {
        // 1 point per Rp 10.000
        match.points += Math.floor(invoice.total / 10000);
        if (invoice.paymentMethod === 'bon_warga') {
          match.totalDebt = (match.totalDebt || 0) + invoice.total;
        }
        this.saveCustomers(customers);
      }
    }
  },

  // Customers
  getCustomers(): RitelCustomer[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) {
      this.saveCustomers(DEFAULT_RITEL_CUSTOMERS);
      return DEFAULT_RITEL_CUSTOMERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_RITEL_CUSTOMERS;
    }
  },

  saveCustomers(customers: RitelCustomer[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  payCustomerDebt(customerId: string, amount: number): void {
    const customers = this.getCustomers();
    const cust = customers.find((c) => c.id === customerId);
    if (cust) {
      cust.totalDebt = Math.max(0, cust.totalDebt - amount);
      this.saveCustomers(customers);
    }
  },

  // Employees Management
  getEmployees(): RitelEmployee[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!raw) {
      this.saveEmployees(DEFAULT_RITEL_EMPLOYEES);
      return DEFAULT_RITEL_EMPLOYEES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_RITEL_EMPLOYEES;
    }
  },

  saveEmployees(employees: RitelEmployee[]): void {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  },

  addEmployee(empData: Omit<RitelEmployee, 'id' | 'joinedDate'>): RitelEmployee {
    const employees = this.getEmployees();
    const newEmp: RitelEmployee = {
      ...empData,
      id: `emp-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    employees.unshift(newEmp);
    this.saveEmployees(employees);
    return newEmp;
  },

  updateEmployee(updatedEmp: RitelEmployee): void {
    const employees = this.getEmployees().map((e) => (e.id === updatedEmp.id ? updatedEmp : e));
    this.saveEmployees(employees);
  },

  deleteEmployee(id: string): void {
    const employees = this.getEmployees().filter((e) => e.id !== id);
    this.saveEmployees(employees);
  },

  // Attendance Management
  getAttendance(): RitelAttendanceRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) {
      this.saveAttendance(DEFAULT_RITEL_ATTENDANCE);
      return DEFAULT_RITEL_ATTENDANCE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_RITEL_ATTENDANCE;
    }
  },

  saveAttendance(records: RitelAttendanceRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  },

  recordAttendance(recordData: Omit<RitelAttendanceRecord, 'id'>): RitelAttendanceRecord {
    const records = this.getAttendance();
    const newRecord: RitelAttendanceRecord = {
      ...recordData,
      id: `att-${Date.now()}`,
    };
    records.unshift(newRecord);
    this.saveAttendance(records);
    return newRecord;
  },

  checkOutAttendance(attendanceId: string, checkOutTime: string): void {
    const records = this.getAttendance().map((r) =>
      r.id === attendanceId ? { ...r, checkOutTime } : r
    );
    this.saveAttendance(records);
  },

  // Data Management: Backup, Restore, Reset
  exportBackupJson(): string {
    const data = {
      storeProfile: this.getStoreProfile(),
      deviceId: this.getDeviceId(),
      products: this.getProducts(),
      invoices: this.getInvoices(),
      customers: this.getCustomers(),
      employees: this.getEmployees(),
      attendance: this.getAttendance(),
      exportedAt: new Date().toISOString(),
      app: 'RitelQu - AppQu System',
      version: '2.2.0',
    };
    return JSON.stringify(data, null, 2);
  },

  restoreBackupJson(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products && Array.isArray(data.products)) {
        this.saveProducts(data.products);
      }
      if (data.invoices && Array.isArray(data.invoices)) {
        this.saveInvoices(data.invoices);
      }
      if (data.customers && Array.isArray(data.customers)) {
        this.saveCustomers(data.customers);
      }
      if (data.employees && Array.isArray(data.employees)) {
        this.saveEmployees(data.employees);
      }
      if (data.attendance && Array.isArray(data.attendance)) {
        this.saveAttendance(data.attendance);
      }
      if (data.storeProfile) {
        this.setStoreProfile(data.storeProfile);
      } else {
        if (data.storeName) this.setStoreName(data.storeName);
        if (data.storePhone) this.setStorePhone(data.storePhone);
      }
      return true;
    } catch (e) {
      console.error('Failed to restore RitelQu backup:', e);
      return false;
    }
  },

  resetDatabase(): void {
    this.saveProducts(DEFAULT_RITEL_PRODUCTS);
    this.saveInvoices(DEFAULT_RITEL_INVOICES);
    this.saveCustomers(DEFAULT_RITEL_CUSTOMERS);
    this.saveEmployees(DEFAULT_RITEL_EMPLOYEES);
    this.saveAttendance(DEFAULT_RITEL_ATTENDANCE);
  },

  // Standalone HTML Generator: katalog.html
  generateKatalogHtml(storeName: string, products: RitelProduct[], phone: string): string {
    const itemsHtml = products
      .map(
        (p) => `
        <div style="padding:14px 0; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:700; font-size:16px; color:#0f172a; text-transform:uppercase;">${p.name}</div>
            <div style="font-size:13px; color:#64748b; margin-top:2px;">SKU: ${p.sku} • Stok: ${p.stock} ${p.unit}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:900; font-size:17px; color:#2563eb; font-family:monospace;">RP ${p.price.toLocaleString('id-ID')}</div>
            <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(storeName)},%20saya%20mau%20pesan%20${encodeURIComponent(p.name)}" 
               target="_blank" 
               style="display:inline-block; margin-top:4px; font-size:12px; background:#2563eb; color:white; padding:4px 10px; border-radius:6px; text-decoration:none; font-weight:bold;">
               Pesan WA
            </a>
          </div>
        </div>
      `
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Katalog Produk - ${storeName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#f8fafc; margin:0; padding:16px; color:#1e293b; }
    .container { max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.05); overflow:hidden; }
    .header { background:#2563eb; color:#ffffff; padding:20px; text-align:center; }
    .header h1 { margin:0; font-size:20px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; }
    .header p { margin:4px 0 0 0; font-size:13px; opacity:0.9; }
    .list { padding:0 20px; }
    .footer { text-align:center; padding:16px; font-size:12px; color:#94a3b8; border-top:1px solid #f1f5f9; background:#fafafa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${storeName}</h1>
      <p>Katalog Belanja Sembako & Kebutuhan Harian Warga RT 04</p>
    </div>
    <div class="list">
      ${itemsHtml}
    </div>
    <div class="footer">
      Dihasilkan secara instan oleh RitelQu • Sistem Manajemen Usaha Warga AppQu
    </div>
  </div>
</body>
</html>`;
  },

  // Standalone HTML Generator: kasir.html
  generateKasirHtml(storeName: string, products: RitelProduct[], cashierName: string): string {
    const productsJson = JSON.stringify(products);
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Kasir Mandiri - ${storeName}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-white text-slate-800 antialiased h-screen flex flex-col overflow-hidden">
  <header class="bg-blue-600 text-white px-5 py-3.5 shadow-sm flex justify-between items-center z-10 shrink-0">
    <div>
      <h1 class="font-bold text-lg tracking-wide uppercase">${storeName}</h1>
      <p class="text-xs text-blue-100">Kasir Mandiri Mobile • ${cashierName}</p>
    </div>
    <span class="text-xs bg-blue-700 px-3 py-1 rounded-full font-bold">Offline-First</span>
  </header>
  <main class="flex-1 overflow-y-auto px-5 py-3 divide-y divide-slate-100" id="item-list"></main>
  <section class="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex justify-between items-center shrink-0">
    <div>
      <p class="text-xs text-slate-500 uppercase font-semibold">Total Tagihan</p>
      <p class="font-black text-2xl text-slate-900 font-mono" id="total-val">RP 0</p>
    </div>
    <button onclick="prosesBayar()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-base uppercase px-6 py-3 rounded-xl shadow-sm cursor-pointer">
      Bayar
    </button>
  </section>
  <script>
    const products = ${productsJson};
    let cart = {};
    function render() {
      const container = document.getElementById('item-list');
      container.innerHTML = products.map(p => {
        const qty = cart[p.id] || 0;
        return \`
          <div onclick="add('\${p.id}')" class="py-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition">
            <div>
              <div class="font-bold text-base text-slate-900 uppercase">\${p.name} \${qty > 0 ? '<span class="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full ml-1">x'+qty+'</span>' : ''}</div>
              <p class="text-xs text-slate-500">Stok: \${p.stock} \${p.unit} • SKU: \${p.sku}</p>
            </div>
            <div class="font-black text-lg text-blue-600 font-mono">RP \${p.price.toLocaleString('id-ID')}</div>
          </div>
        \`;
      }).join('');
      let total = 0;
      for (const id in cart) {
        const prod = products.find(p => p.id === id);
        if (prod) total += prod.price * cart[id];
      }
      document.getElementById('total-val').innerText = 'RP ' + total.toLocaleString('id-ID');
    }
    function add(id) {
      cart[id] = (cart[id] || 0) + 1;
      render();
    }
    function prosesBayar() {
      alert('Pembayaran sukses! Struk tercatat di perangkat kasir mandiri.');
      cart = {};
      render();
    }
    render();
  </script>
</body>
</html>`;
  },

  // Standalone HTML Generator: cabang_modul.html
  generateCabangModulHtml(storeName: string, branchName: string, products: RitelProduct[]): string {
    const productsJson = JSON.stringify(products);
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modul Cabang - ${branchName}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-slate-50 text-slate-800 p-5 font-sans">
  <div class="max-w-xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
    <div class="border-b border-slate-100 pb-4 mb-4">
      <span class="text-xs font-bold text-blue-600 uppercase tracking-widest">${storeName}</span>
      <h1 class="text-xl font-black text-slate-900 mt-1">Replikasi Modul Cabang: ${branchName}</h1>
      <p class="text-sm text-slate-500 mt-1">Sistem ini siap dioperasikan di lokasi cabang baru dengan sinkronisasi inventaris lokal.</p>
    </div>
    <div class="space-y-3">
      <div class="p-3.5 bg-blue-50 rounded-xl text-sm text-blue-900 font-medium">
        Katalog produk bawaan cabang terisi: <strong>${products.length} SKU</strong> aktif.
      </div>
      <button onclick="alert('Cabang berhasil diinisialisasi!')" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl uppercase tracking-wider text-sm cursor-pointer shadow-sm">
        Mulai Operasional Cabang
      </button>
    </div>
  </div>
</body>
</html>`;
  },
};
