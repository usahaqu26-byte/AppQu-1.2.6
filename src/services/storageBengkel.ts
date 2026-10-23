import { BengkelPart, ServiceWorkOrder } from '../types';

const STORAGE_KEYS = {
  PARTS: 'bengkelqu_parts_v1',
  WORK_ORDERS: 'bengkelqu_orders_v1',
};

export const DEFAULT_PARTS: BengkelPart[] = [
  {
    id: 'part-1',
    code: 'OLI-MPX2-08',
    name: 'AHM Oil MPX2 0.8L (Matic Honda)',
    category: 'oli',
    stock: 14,
    minStock: 5,
    costPrice: 42000,
    sellPrice: 52000,
    unit: 'botol',
    suitableFor: 'Beat, Vario 110/125, Scoopy, Genio',
  },
  {
    id: 'part-2',
    code: 'OLI-SPX2-08',
    name: 'AHM Oil SPX2 Fully Synthetic 0.8L',
    category: 'oli',
    stock: 6,
    minStock: 4,
    costPrice: 54000,
    sellPrice: 68000,
    unit: 'botol',
    suitableFor: 'Vario 150/160, PCX 150/160, ADV 150/160',
  },
  {
    id: 'part-3',
    code: 'OLI-GDN-120',
    name: 'Oli Gardan / Transmisi Matic 120ml',
    category: 'oli',
    stock: 18,
    minStock: 6,
    costPrice: 13000,
    sellPrice: 18000,
    unit: 'botol',
    suitableFor: 'Semua Motor Matic Honda & Yamaha',
  },
  {
    id: 'part-4',
    code: 'YAM-SUPER-MATIC',
    name: 'Yamalube Super Matic 1.0L',
    category: 'oli',
    stock: 8,
    minStock: 4,
    costPrice: 58000,
    sellPrice: 72000,
    unit: 'botol',
    suitableFor: 'NMAX, Aerox 155, Lexi 125/155',
  },
  {
    id: 'part-5',
    code: 'REM-DPN-HONDA',
    name: 'Kampas Rem Depan Cakram (Nissin)',
    category: 'rem',
    stock: 9,
    minStock: 3,
    costPrice: 28000,
    sellPrice: 42000,
    unit: 'set',
    suitableFor: 'Beat FI, Vario 125/150, Scoopy',
  },
  {
    id: 'part-6',
    code: 'REM-BLK-TROMOL',
    name: 'Kampas Rem Belakang Tromol Non-Asbes',
    category: 'rem',
    stock: 2, // Low stock alert!
    minStock: 4,
    costPrice: 32000,
    sellPrice: 48000,
    unit: 'set',
    suitableFor: 'Matic Honda & Bebek',
  },
  {
    id: 'part-7',
    code: 'CVT-BELT-K35',
    name: 'V-Belt Set + Roller K35 Original',
    category: 'cvt',
    stock: 4,
    minStock: 2,
    costPrice: 115000,
    sellPrice: 155000,
    unit: 'set',
    suitableFor: 'Vario 125 eSP / LED',
  },
  {
    id: 'part-8',
    code: 'BUSI-CPR9-NGK',
    name: 'Busi Nikel NGK CPR9EA-9',
    category: 'busi',
    stock: 12,
    minStock: 5,
    costPrice: 18000,
    sellPrice: 28000,
    unit: 'pcs',
    suitableFor: 'Vario 125/150/160, Beat FI, NMAX, Sonic',
  },
  {
    id: 'part-9',
    code: 'FLT-UDR-VARIO',
    name: 'Filter Udara Viscous Element',
    category: 'filter',
    stock: 5,
    minStock: 3,
    costPrice: 38000,
    sellPrice: 55000,
    unit: 'pcs',
    suitableFor: 'Vario 125 / 150',
  },
  {
    id: 'part-10',
    code: 'CLR-INJECTOR',
    name: 'Cairan Pembersih Injector Cleaner 60ml',
    category: 'cairan',
    stock: 15,
    minStock: 5,
    costPrice: 19000,
    sellPrice: 30000,
    unit: 'botol',
    suitableFor: 'Semua Motor Injeksi PGM-FI / BlueCore',
  },
  {
    id: 'part-11',
    code: 'GRS-CVT-HITEMP',
    name: 'Grease CVT Hi-Temp Pelumas Roller & Pulley',
    category: 'cairan',
    stock: 20,
    minStock: 6,
    costPrice: 8000,
    sellPrice: 15000,
    unit: 'tube',
    suitableFor: 'Pulley Depan & Belakang CVT',
  },
  {
    id: 'part-12',
    code: 'JSA-SERVIS-RINGAN',
    name: 'Jasa Servis Ringan & Tune Up Injeksi',
    category: 'jasa',
    stock: 999,
    minStock: 0,
    costPrice: 0,
    sellPrice: 45000,
    unit: 'jasa',
    suitableFor: 'Semua Motor',
  },
  {
    id: 'part-13',
    code: 'JSA-SERVIS-CVT',
    name: 'Jasa Bongkar Bersih & Greasing CVT',
    category: 'jasa',
    stock: 999,
    minStock: 0,
    costPrice: 0,
    sellPrice: 35000,
    unit: 'jasa',
    suitableFor: 'Semua Motor Matic',
  },
];

export const DEFAULT_WORK_ORDERS: ServiceWorkOrder[] = [
  {
    id: 'spk-1',
    spkNumber: 'SPK-20261019-01',
    customerName: 'Budi Santoso',
    customerPhone: '081288776655',
    customerBlock: 'Blok C3 No. 12',
    plateNumber: 'B 4821 KCA',
    vehicleBrand: 'Honda',
    vehicleModel: 'Vario 125 eSP (2022)',
    currentKm: 14200,
    complaintNotes: 'Tarikan awal gredek saat tanjakan, rem belakang terasa dalam.',
    checklist: {
      bodiLecet: false,
      lampuUtama: true,
      remDepanBelakang: true,
      indikatorBensin: '1/2',
      klakson: true,
      tekananBan: true,
    },
    items: [
      { id: 'it-1', partId: 'part-12', name: 'Jasa Servis Ringan & Tune Up', category: 'jasa', price: 45000, qty: 1 },
      { id: 'it-2', partId: 'part-13', name: 'Jasa Servis CVT & Greasing', category: 'jasa', price: 35000, qty: 1 },
      { id: 'it-3', partId: 'part-1', name: 'AHM Oil MPX2 0.8L', category: 'sparepart', price: 52000, qty: 1 },
      { id: 'it-4', partId: 'part-3', name: 'Oli Gardan Transmisi 120ml', category: 'upsell', price: 18000, qty: 1 },
    ],
    upSellingOffered: [
      { id: 'up-1', name: 'Oli Gardan Matic', price: 18000, reason: 'Penggantian oli transmisi tiap 2x ganti oli mesin', accepted: true },
      { id: 'up-2', name: 'Injector Cleaner', price: 30000, reason: 'Membersihkan kerak nozzle injektor bahan bakar', accepted: false },
    ],
    total: 150000,
    status: 'dikerjakan',
    mechanicName: 'Mas Yanto (Mekanik 1)',
    createdAt: '2026-10-19T09:30:00Z',
    nextOilChangeKm: 16200,
  },
  {
    id: 'spk-2',
    spkNumber: 'SPK-20261019-02',
    customerName: 'Pak Hendra Gunawan',
    customerPhone: '081122334455',
    customerBlock: 'Blok A1 No. 01',
    plateNumber: 'B 3012 RT',
    vehicleBrand: 'Yamaha',
    vehicleModel: 'NMAX 155 Connected',
    currentKm: 8500,
    complaintNotes: 'Ganti oli rutin berkala & cek rem.',
    checklist: {
      bodiLecet: false,
      lampuUtama: true,
      remDepanBelakang: true,
      indikatorBensin: '3/4',
      klakson: true,
      tekananBan: true,
    },
    items: [
      { id: 'it-5', partId: 'part-4', name: 'Yamalube Super Matic 1.0L', category: 'sparepart', price: 72000, qty: 1 },
      { id: 'it-6', partId: 'part-3', name: 'Oli Gardan Transmisi 120ml', category: 'sparepart', price: 18000, qty: 1 },
      { id: 'it-7', partId: 'part-8', name: 'Busi NGK CPR9EA-9', category: 'sparepart', price: 28000, qty: 1 },
    ],
    upSellingOffered: [
      { id: 'up-3', name: 'Busi Baru NGK', price: 28000, reason: 'KM sudah mencapai 8.500 km (anjuran pabrik ganti per 8.000 km)', accepted: true },
    ],
    total: 118000,
    status: 'selesai',
    mechanicName: 'Mas Dedi (Mekanik 2)',
    createdAt: '2026-10-19T08:15:00Z',
    finishedAt: '2026-10-19T09:10:00Z',
    nextOilChangeKm: 10500,
  },
];

export const BengkelStorageService = {
  getParts(): BengkelPart[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTS);
    if (!raw) {
      this.saveParts(DEFAULT_PARTS);
      return DEFAULT_PARTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PARTS;
    }
  },

  saveParts(parts: BengkelPart[]): void {
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(parts));
  },

  getWorkOrders(): ServiceWorkOrder[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WORK_ORDERS);
    if (!raw) {
      this.saveWorkOrders(DEFAULT_WORK_ORDERS);
      return DEFAULT_WORK_ORDERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_WORK_ORDERS;
    }
  },

  saveWorkOrders(orders: ServiceWorkOrder[]): void {
    localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(orders));
  },

  // Smart Service Estimator Logic
  getServiceRecommendationsByKm(km: number, model: string): {
    recommendedServices: string[];
    suggestedParts: string[];
    priorityNote: string;
  } {
    const isMatic =
      model.toLowerCase().includes('vario') ||
      model.toLowerCase().includes('beat') ||
      model.toLowerCase().includes('scoopy') ||
      model.toLowerCase().includes('nmax') ||
      model.toLowerCase().includes('aerox') ||
      model.toLowerCase().includes('pcx') ||
      model.toLowerCase().includes('genio');

    if (km < 4000) {
      return {
        recommendedServices: ['Servis Ringan / Cek Rutin', 'Ganti Oli Mesin Berkala'],
        suggestedParts: ['AHM Oil MPX2 / Yamalube Matic'],
        priorityNote: 'Kendaraan dalam masa pemakaian awal. Cukup ganti oli mesin dan periksa kekencangan baut bodi.',
      };
    } else if (km >= 4000 && km < 9000) {
      return {
        recommendedServices: ['Servis Ringan + Reset ECM', 'Ganti Oli Mesin & Oli Gardan'],
        suggestedParts: ['Oli Mesin', 'Oli Gardan Transmisi', 'Busi NGK'],
        priorityNote: 'KM 4.000–8.000: Waktunya ganti oli gardan (tiap 2x ganti oli mesin) dan pemeriksaan kondisi celah elektroda busi.',
      };
    } else if (km >= 9000 && km < 16000) {
      return {
        recommendedServices: ['Servis CVT Komplit (Bongkar, Cuci & Greasing)', 'Ganti Filter Udara', 'Cek Kampas Rem Depan & Belakang'],
        suggestedParts: ['Oli Mesin', 'Filter Udara Viscous Element', 'Grease CVT Hi-Temp', 'Kampas Rem Belakang Tromol'],
        priorityNote: isMatic
          ? 'KM 10.000–15.000: Wajib servis CVT menyeluruh untuk mencegah gredek dan cek ketebalan v-belt!'
          : 'Pembersihan rantai, filter udara, dan penyetelan celah klep.',
      };
    } else {
      return {
        recommendedServices: ['Servis Besar / Tune Up Injeksi', 'Ganti V-Belt Set + Roller', 'Kuras Minyak Rem & Air Radiator (Coolant)'],
        suggestedParts: ['V-Belt Set + Roller K35', 'Radiator Coolant', 'Kampas Rem Depan & Belakang', 'Busi Baru'],
        priorityNote: 'KM > 16.000: Komponen aus transmisi (v-belt, roller) sudah mendekati batas toleransi pemakaian pabrik (24.000 km). Sangat disarankan peremajaan komponen.',
      };
    }
  },

  // Smart Up-Selling Generator
  getUpSellingSuggestions(selectedItems: string[]): { name: string; price: number; reason: string }[] {
    const suggestions: { name: string; price: number; reason: string }[] = [];
    const joined = selectedItems.join(' ').toLowerCase();

    if (joined.includes('oli') && !joined.includes('gardan')) {
      suggestions.push({
        name: 'Oli Gardan Matic 120ml',
        price: 18000,
        reason: 'Paket Bundling Oli Mesin + Gardan menjaga gir rasio transmisi tetap awet dan hening.',
      });
    }

    if (joined.includes('cvt') && !joined.includes('grease')) {
      suggestions.push({
        name: 'Cairan Injector Cleaner 60ml',
        price: 30000,
        reason: 'Membersihkan deposit karbon di ruang bakar sekaligus tarikan jadi enteng seketika.',
      });
    }

    if (joined.includes('rem') && !joined.includes('minyak')) {
      suggestions.push({
        name: 'Kuras Minyak Rem DOT 4',
        price: 25000,
        reason: 'Minyak rem yang teroksidasi dapat menyebabkan pengereman bagel / blong saat jalan menurun.',
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        name: 'Busi NGK CPR9EA-9',
        price: 28000,
        reason: 'Menjaga percikan api pengapian optimal dan konsumsi BBM lebih irit.',
      });
    }

    return suggestions;
  },

  // Smart WhatsApp Template Generator
  generateWaUrl(
    order: ServiceWorkOrder,
    templateType: 'selesai' | 'nota' | 'reminder_oli'
  ): string {
    const phone = order.customerPhone.replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('0') ? '62' + phone.substring(1) : phone;

    let text = '';

    if (templateType === 'selesai') {
      text =
        `*BENGKELQU — BENGKEL RESMI WARGA RT 04*\n` +
        `Halo Kak *${order.customerName}*,\n\n` +
        `Kabar baik! Pengerjaan servis motor Anda sudah selesai dan siap diambil:\n` +
        `🏍️ Kendaraan: *${order.vehicleBrand} ${order.vehicleModel}* (${order.plateNumber})\n` +
        `📋 No. SPK: *${order.spkNumber}*\n` +
        `👨‍🔧 Mekanik: ${order.mechanicName}\n` +
        `💵 Total Estimasi Biaya: *Rp ${order.total.toLocaleString('id-ID')}*\n\n` +
        `*Rincian Pengerjaan:*\n` +
        order.items.map((i) => `• ${i.name} (${i.qty}x) = Rp ${(i.price * i.qty).toLocaleString('id-ID')}`).join('\n') +
        `\n\n🛡️ *Garansi Servis:* 7 Hari pengerjaan.\n` +
        `Silakan konfirmasi jam pengambilan. Terima kasih telah mempercayakan kendaraan Anda di BengkelQu!\n\n` +
        `_Powered by AppQu — Solusi Manajemen Bengkel & Usaha_`;
    } else if (templateType === 'nota') {
      text =
        `*KWITANSI DIGITAL BENGKELQU*\n` +
        `No. SPK: *${order.spkNumber}*\n` +
        `Pelanggan: ${order.customerName} (${order.customerBlock || 'Warga'})\n` +
        `Motor: ${order.vehicleBrand} ${order.vehicleModel} (${order.plateNumber})\n` +
        `Kilometer: ${order.currentKm.toLocaleString('id-ID')} KM\n\n` +
        `*Detail Transaksi:*\n` +
        order.items.map((i) => `- ${i.name} (${i.qty}x): Rp ${(i.price * i.qty).toLocaleString('id-ID')}`).join('\n') +
        `\n-----------------------------\n` +
        `*TOTAL PEMBAYARAN: Rp ${order.total.toLocaleString('id-ID')}*\n` +
        `Status: LUNAS\n\n` +
        `Simpan nota ini sebagai bukti garansi pengerjaan selama 7 hari.\n` +
        `_Powered by AppQu — Solusi Manajemen Bengkel & Usaha_`;
    } else {
      text =
        `*PENGINGAT GANTI OLI BERKALA — BENGKELQU*\n` +
        `Halo Kak *${order.customerName}*,\n\n` +
        `Berdasarkan catatan servis terakhir di KM ${order.currentKm.toLocaleString('id-ID')}, motor *${order.vehicleBrand} ${order.vehicleModel}* (${order.plateNumber}) Anda diperkirakan sudah mendekati KM *${(order.nextOilChangeKm || order.currentKm + 2000).toLocaleString('id-ID')}*.\n\n` +
        `Ganti oli mesin secara tepat waktu sangat penting untuk mencegah keausan piston & dinding silinder.\n\n` +
        `Yuk mampir ke BengkelQu untuk cek gratis tekanan angin ban dan ganti oli tanpa antre!\n\n` +
        `_Powered by AppQu — Solusi Manajemen Bengkel & Usaha_`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  },

  // Generator File katalog.html (List Minimalis Border-Bottom, No Box, Clear Typo)
  generateKatalogHtml(parts: BengkelPart[]): string {
    const rows = parts
      .filter((p) => p.category !== 'jasa')
      .map(
        (p) => `
        <tr style="border-bottom: 1px solid #e7e5e4;">
          <td style="padding: 14px 12px; font-weight: 600; color: #1c1917; font-size: 15px;">
            ${p.name}
            <div style="font-size: 12px; color: #78716c; font-weight: 400; margin-top: 2px;">
              Kode: ${p.code} · Cocok: ${p.suitableFor}
            </div>
          </td>
          <td style="padding: 14px 12px; font-size: 13px; color: #44403c;">${p.category.toUpperCase()}</td>
          <td style="padding: 14px 12px; text-align: center; font-size: 14px; font-weight: 600; color: ${p.stock <= p.minStock ? '#dc2626' : '#047857'};">
            ${p.stock} ${p.unit}
          </td>
          <td style="padding: 14px 12px; text-align: right; font-size: 16px; font-weight: 700; color: #047857; font-family: monospace;">
            Rp ${p.sellPrice.toLocaleString('id-ID')}
          </td>
        </tr>
      `
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Katalog Sparepart & Servis — BengkelQu</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #fafaf9;
      color: #1c1917;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 32px;
      border-radius: 16px;
    }
    h1 {
      font-size: 24px;
      margin: 0 0 6px 0;
      color: #047857;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .subtitle {
      font-size: 14px;
      color: #78716c;
      margin-bottom: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      padding: 12px;
      border-bottom: 2px solid #047857;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #047857;
      font-weight: 700;
    }
    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e7e5e4;
      text-align: center;
      font-size: 13px;
      color: #78716c;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 11px;
      border-radius: 6px;
      background: #ecfdf5;
      color: #047857;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>BengkelQu — Katalog Suku Cadang & Pelumas Resmi</h1>
    <div class="subtitle">Unit Layanan Otomotif Warga Terpercaya · Garansi Asli 100% · Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</div>

    <table>
      <thead>
        <tr>
          <th>Nama Komponen / Sparepart</th>
          <th>Kategori</th>
          <th style="text-align: center;">Ketersediaan</th>
          <th style="text-align: right;">Harga Satuan</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <footer>
      <strong>Powered by AppQu — Solusi Manajemen Bengkel & Usaha</strong><br>
      Untuk konsultasi servis & booking waktu pengerjaan: hubungi montir BengkelQu RT 04.
    </footer>
  </div>
</body>
</html>`;
  },
};
