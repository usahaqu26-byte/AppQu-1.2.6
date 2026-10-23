import { KlinikServiceItem, KlinikPatientRecord, KlinikInvoice } from '../types';

const STORAGE_KEYS = {
  SERVICES: 'klinikqu_services_v1',
  PATIENTS: 'klinikqu_patients_v1',
  INVOICES: 'klinikqu_invoices_v1',
  DEVICE_ID: 'klinikqu_device_id',
};

export const DEFAULT_KLINIK_SERVICES: KlinikServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Pemeriksaan Dokter Umum',
    description: 'Konsultasi dan diagnosa awal pasien',
    category: 'konsultasi',
    price: 75000,
  },
  {
    id: 'srv-2',
    name: 'Tindakan Injeksi / Suntik',
    description: 'Pemberian obat injeksi medis',
    category: 'tindakan',
    price: 35000,
  },
  {
    id: 'srv-3',
    name: 'Pemasangan Infus',
    description: 'Terapi hidrasi cairan infus',
    category: 'tindakan',
    price: 120000,
  },
  {
    id: 'srv-4',
    name: 'Cek Kolesterol',
    description: 'Pemeriksaan darah kapiler stik',
    category: 'laboratorium',
    price: 30000,
  },
  {
    id: 'srv-5',
    name: 'Cek Gula Darah',
    description: 'Tes kadar glukosa darah instan',
    category: 'laboratorium',
    price: 20000,
  },
  {
    id: 'srv-6',
    name: 'Nebulizer (Uap)',
    description: 'Terapi melegakan pernafasan',
    category: 'tindakan',
    price: 65000,
  },
  {
    id: 'srv-8',
    name: 'Perawatan & Jahit Luka (Hecting)',
    description: 'Pembersihan luka steril, anestesi lokal, dan penjahitan 1-3 simpul',
    category: 'tindakan',
    price: 85000,
  },
  {
    id: 'srv-9',
    name: 'Paket Obat Resep Standar (3 Hari)',
    description: 'Kombinasi antibiotik, antipiretik/analgesik, & multivitamin',
    category: 'obat',
    price: 45000,
  },
  {
    id: 'srv-10',
    name: 'Surat Keterangan Sehat Fisik',
    description: 'Pemeriksaan tanda vital (tensi, TB, BB, buta warna) resmi',
    category: 'konsultasi',
    price: 25000,
  },
];

export const DEFAULT_KLINIK_PATIENTS: KlinikPatientRecord[] = [
  {
    id: 'pat-1',
    name: 'Budi Santoso',
    nik: '3201123456780001',
    blockNumber: 'Blok C3 No. 12',
    gender: 'L',
    age: 41,
    phone: '0812-8877-6655',
    bloodType: 'O',
    allergies: 'Tidak ada alergi obat',
    lastVisit: '2026-10-18',
    totalVisits: 4,
  },
  {
    id: 'pat-2',
    name: 'Siti Rahmawati',
    nik: '3201123456780011',
    blockNumber: 'Blok B3 No. 16',
    gender: 'P',
    age: 31,
    phone: '0819-0987-6543',
    bloodType: 'B',
    allergies: 'Alergi Penisilin (Ampisilin)',
    lastVisit: '2026-10-15',
    totalVisits: 2,
  },
  {
    id: 'pat-3',
    name: 'Ir. H. Hendra Gunawan',
    nik: '3201123456780002',
    blockNumber: 'Blok A1 No. 01',
    gender: 'L',
    age: 52,
    phone: '0811-2233-4455',
    bloodType: 'A',
    allergies: 'Tidak ada',
    lastVisit: '2026-10-10',
    totalVisits: 6,
  },
  {
    id: 'pat-4',
    name: 'Joko Prabowo',
    nik: '3201123456780012',
    blockNumber: 'Blok D2 No. 09',
    gender: 'L',
    age: 38,
    phone: '0852-4455-6677',
    bloodType: 'A',
    allergies: 'Tidak ada',
    lastVisit: '2026-10-02',
    totalVisits: 1,
  },
];

export const DEFAULT_KLINIK_INVOICES: KlinikInvoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-MED-20261018-01',
    patientName: 'Budi Santoso',
    patientNik: '3201123456780001',
    patientBlock: 'Blok C3 No. 12',
    doctorName: 'dr. Farhan Malik, Sp.PD (Dokter Jaga)',
    items: [
      { id: 'bi-1', serviceId: 'srv-1', name: 'Pemeriksaan Dokter Umum', price: 75000, qty: 1 },
      { id: 'bi-2', serviceId: 'srv-4', name: 'Cek Kolesterol Total', price: 30000, qty: 1 },
      { id: 'bi-3', serviceId: 'srv-9', name: 'Paket Obat Resep Standar', price: 45000, qty: 1 },
    ],
    total: 150000,
    paymentMethod: 'qris',
    status: 'lunas',
    createdAt: '2026-10-18T10:15:00Z',
    notes: 'Keluhan pusing dan tengkuk berat. Disarankan diet rendah lemak.',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-MED-20261019-02',
    patientName: 'Siti Rahmawati',
    patientNik: '3201123456780011',
    patientBlock: 'Blok B3 No. 16',
    doctorName: 'dr. Anisa Rahmi (Dokter Umum)',
    items: [
      { id: 'bi-4', serviceId: 'srv-1', name: 'Pemeriksaan Dokter Umum', price: 75000, qty: 1 },
      { id: 'bi-5', serviceId: 'srv-2', name: 'Tindakan Injeksi / Suntik', price: 35000, qty: 1 },
    ],
    total: 110000,
    paymentMethod: 'tunai',
    status: 'lunas',
    createdAt: '2026-10-19T14:30:00Z',
    notes: 'Injeksi vitamin neurotropik & antispasmodik.',
  },
];

export const KlinikStorageService = {
  getDeviceId(): string {
    let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!id) {
      id = 'KLINIK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
    }
    return id;
  },

  getServices(): KlinikServiceItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (!raw) {
      this.saveServices(DEFAULT_KLINIK_SERVICES);
      return DEFAULT_KLINIK_SERVICES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_KLINIK_SERVICES;
    }
  },

  saveServices(services: KlinikServiceItem[]): void {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  },

  getPatients(): KlinikPatientRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (!raw) {
      this.savePatients(DEFAULT_KLINIK_PATIENTS);
      return DEFAULT_KLINIK_PATIENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_KLINIK_PATIENTS;
    }
  },

  savePatients(patients: KlinikPatientRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  },

  getInvoices(): KlinikInvoice[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) {
      this.saveInvoices(DEFAULT_KLINIK_INVOICES);
      return DEFAULT_KLINIK_INVOICES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_KLINIK_INVOICES;
    }
  },

  saveInvoices(invoices: KlinikInvoice[]): void {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  },

  addInvoice(invoice: KlinikInvoice): void {
    const list = this.getInvoices();
    list.unshift(invoice);
    this.saveInvoices(list);
  },
};
