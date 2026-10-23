import { Order, RestaurantProfile } from '../types';

export const ExportService = {
  // Export transactions list to CSV / Excel compatible file
  exportToCSV(orders: Order[], profile: RestaurantProfile): void {
    const headers = [
      'No. Nota',
      'Tanggal',
      'Waktu',
      'Tipe Layanan',
      'Meja / Pelanggan',
      'Daftar Menu',
      'Jumlah Item',
      'Subtotal (Rp)',
      'Diskon (Rp)',
      'Total (Rp)',
      'Metode Bayar',
      'Status',
    ];

    const rows = orders.map((ord) => {
      const d = new Date(ord.createdAt);
      const dateStr = d.toLocaleDateString('id-ID');
      const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const menuSummary = ord.items.map((i) => `${i.name} (${i.quantity}x)`).join('; ');
      const totalQty = ord.items.reduce((s, i) => s + i.quantity, 0);

      return [
        `"${ord.receiptNumber}"`,
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${ord.type === 'meja' ? 'Makan di Tempat' : 'Bungkus / Takeaway'}"`,
        `"${ord.tableName || ord.customerName || '-'}"`,
        `"${menuSummary.replace(/"/g, '""')}"`,
        totalQty,
        ord.subtotal,
        ord.discount,
        ord.total,
        `"${ord.paymentMethod?.toUpperCase() || '-'}"`,
        `"${ord.status === 'paid' ? 'LUNAS' : ord.status}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `Laporan_Transaksi_${profile.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Export printable report document / Trigger PDF generation
  exportReportPDF(orders: Order[], profile: RestaurantProfile, filterLabel: string = 'Semua Periode'): void {
    const totalOmset = orders.reduce((sum, o) => sum + o.total, 0);
    const totalTunai = orders.filter((o) => o.paymentMethod === 'tunai').reduce((sum, o) => sum + o.total, 0);
    const totalQris = orders.filter((o) => o.paymentMethod === 'qris').reduce((sum, o) => sum + o.total, 0);
    const totalItemTerjual = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

    const formatIdr = (val: number) =>
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Izinkan pop-up untuk mencetak/export PDF laporan.');
      return;
    }

    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan Transaksi - ${profile.name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1c1917;
      padding: 24px;
      margin: 0;
    }
    .header {
      border-bottom: 2px solid #b91c1c;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .title {
      font-size: 20px;
      font-weight: 800;
      color: #991b1b;
      margin: 0;
    }
    .subtitle {
      font-size: 13px;
      color: #78716c;
      margin: 4px 0 0 0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .meta-card {
      background: #f5f5f4;
      padding: 10px;
      border-radius: 8px;
    }
    .meta-label {
      font-size: 11px;
      color: #78716c;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .meta-val {
      font-size: 16px;
      font-weight: 700;
      color: #1c1917;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 20px;
    }
    th {
      background: #fafaf9;
      border-bottom: 2px solid #e7e5e4;
      text-align: left;
      padding: 8px;
      font-weight: 700;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #f5f5f4;
    }
    .text-right { text-align: right; }
    .footer {
      font-size: 11px;
      color: #a8a29e;
      text-align: center;
      margin-top: 30px;
      border-top: 1px solid #e7e5e4;
      padding-top: 10px;
    }
    @media print {
      body { padding: 0; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">${profile.name} — Laporan Penjualan</h1>
    <p class="subtitle">${profile.address} · Telp: ${profile.phone}</p>
    <p class="subtitle" style="font-weight: 600; color: #44403c; margin-top: 6px;">Periode: ${filterLabel} (Dicetak: ${new Date().toLocaleString('id-ID')})</p>
  </div>

  <div class="meta-grid">
    <div class="meta-card">
      <div class="meta-label">Total Omset</div>
      <div class="meta-val" style="color: #991b1b;">${formatIdr(totalOmset)}</div>
    </div>
    <div class="meta-card">
      <div class="meta-label">Total Transaksi</div>
      <div class="meta-val">${orders.length} Trx</div>
    </div>
    <div class="meta-card">
      <div class="meta-label">Tunai / QRIS</div>
      <div class="meta-val" style="font-size: 13px;">${formatIdr(totalTunai)} / ${formatIdr(totalQris)}</div>
    </div>
    <div class="meta-card">
      <div class="meta-label">Porsi Terjual</div>
      <div class="meta-val">${totalItemTerjual} Porsi</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>No. Nota</th>
        <th>Waktu</th>
        <th>Layanan</th>
        <th>Rincian Menu</th>
        <th class="text-right">Metode</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${orders
        .map(
          (ord) => `
        <tr>
          <td style="font-weight:600; font-family:monospace;">${ord.receiptNumber}</td>
          <td>${new Date(ord.createdAt).toLocaleDateString('id-ID')} ${new Date(ord.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
          <td>${ord.type === 'meja' ? ord.tableName || 'Meja' : 'Bungkus'}</td>
          <td>${ord.items.map((i) => `${i.name} (${i.quantity}x)`).join(', ')}</td>
          <td class="text-right" style="text-transform:uppercase;">${ord.paymentMethod || '-'}</td>
          <td class="text-right" style="font-weight:700;">${formatIdr(ord.total)}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    Dicetak otomatis melalui Aplikasi Android Kasir Bakso Qu 1.0 · Laporan Resmi Keuangan Restoran
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  },
};
