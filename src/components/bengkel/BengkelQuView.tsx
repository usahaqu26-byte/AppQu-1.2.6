import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Package,
  FileText,
  MessageSquare,
  Sparkles,
  Bot,
  Plus,
  Search,
  Check,
  X,
  Send,
  Download,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Bike,
  Shield,
  HelpCircle,
  Copy,
  CheckCircle2,
  Phone,
  ChevronRight,
  Gauge,
  Sliders,
  DollarSign,
  Printer,
} from 'lucide-react';

import {
  BengkelPart,
  ServiceWorkOrder,
  VehicleChecklist,
  UserProfile,
} from '../../types';
import { BengkelStorageService } from '../../services/storageBengkel';

interface BengkelQuViewProps {
  currentUser: UserProfile;
  onBackToAppQu: () => void;
  showNotification: (msg: string) => void;
}

export const BengkelQuView: React.FC<BengkelQuViewProps> = ({
  currentUser,
  onBackToAppQu,
  showNotification,
}) => {
  // Navigation Sub-tab: Minimalist Icon-First Layout
  const [activeTab, setActiveTab] = useState<'antrean' | 'spk_baru' | 'stok' | 'katalog' | 'ai_care'>('antrean');

  // Core Bengkel State
  const [parts, setParts] = useState<BengkelPart[]>([]);
  const [workOrders, setWorkOrders] = useState<ServiceWorkOrder[]>([]);

  // Selected Order for detail / WA modal
  const [selectedOrder, setSelectedOrder] = useState<ServiceWorkOrder | null>(null);
  const [waModalOrder, setWaModalOrder] = useState<ServiceWorkOrder | null>(null);

  // Form State: SPK Baru & Smart Estimator
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerBlock, setCustomerBlock] = useState('Blok C3');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('Honda');
  const [vehicleModel, setVehicleModel] = useState('Vario 125 eSP');
  const [currentKm, setCurrentKm] = useState<number>(12500);
  const [complaintNotes, setComplaintNotes] = useState('');
  const [mechanicName, setMechanicName] = useState('Mas Yanto (Mekanik 1)');

  // Checklist Fisik
  const [checklist, setChecklist] = useState<VehicleChecklist>({
    bodiLecet: false,
    lampuUtama: true,
    remDepanBelakang: true,
    indikatorBensin: '1/2',
    klakson: true,
    tekananBan: true,
  });

  // Selected Items in Work Order
  const [selectedItems, setSelectedItems] = useState<{
    id: string;
    partId?: string;
    name: string;
    category: 'jasa' | 'sparepart' | 'upsell';
    price: number;
    qty: number;
  }[]>([
    { id: 'init-1', partId: 'part-12', name: 'Jasa Servis Ringan & Tune Up', category: 'jasa', price: 45000, qty: 1 },
    { id: 'init-2', partId: 'part-1', name: 'AHM Oil MPX2 0.8L', category: 'sparepart', price: 52000, qty: 1 },
  ]);

  // Stock Filter & Search
  const [stockSearch, setStockSearch] = useState('');
  const [stockCategory, setStockCategory] = useState<string>('all');

  // AI Customer Care & Troubleshooting State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<{
    topic: string;
    content: string;
    practicalAdvice: string;
  } | null>(null);

  // Initial Load
  useEffect(() => {
    setParts(BengkelStorageService.getParts());
    setWorkOrders(BengkelStorageService.getWorkOrders());
  }, []);

  // KM-based Service Recommendation
  const recommendation = BengkelStorageService.getServiceRecommendationsByKm(currentKm, vehicleModel);

  // Dynamic Up-Selling Suggestions
  const upSellingSuggestions = BengkelStorageService.getUpSellingSuggestions(
    selectedItems.map((i) => i.name)
  );

  // Total Calculation
  const currentTotal = selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  // ----------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------
  const handleAddItemToSpk = (part: BengkelPart, isUpsell: boolean = false) => {
    const existing = selectedItems.find((i) => i.partId === part.id);
    if (existing) {
      setSelectedItems(
        selectedItems.map((i) => (i.partId === part.id ? { ...i, qty: i.qty + 1 } : i))
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          id: `item-${Date.now()}-${Math.random()}`,
          partId: part.id,
          name: part.name,
          category: isUpsell ? 'upsell' : part.category === 'jasa' ? 'jasa' : 'sparepart',
          price: part.sellPrice,
          qty: 1,
        },
      ]);
    }
    showNotification(`Ditambahkan: ${part.name}`);
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== itemId));
  };

  const handleCreateSpk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !plateNumber.trim()) {
      showNotification('Mohon isi nama pelanggan dan plat nomor.');
      return;
    }

    const count = workOrders.length + 1;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const newSpkNum = `SPK-${dateStr}-${String(count).padStart(2, '0')}`;

    const newOrder: ServiceWorkOrder = {
      id: `spk-${Date.now()}`,
      spkNumber: newSpkNum,
      customerName,
      customerPhone: customerPhone || '081200000000',
      customerBlock,
      plateNumber: plateNumber.toUpperCase(),
      vehicleBrand,
      vehicleModel,
      currentKm,
      complaintNotes: complaintNotes || 'Servis berkala & pengecekan umum.',
      checklist,
      items: selectedItems,
      upSellingOffered: upSellingSuggestions.map((s) => ({
        id: `up-${Date.now()}`,
        name: s.name,
        price: s.price,
        reason: s.reason,
        accepted: selectedItems.some((i) => i.name === s.name),
      })),
      total: currentTotal,
      status: 'antre',
      mechanicName,
      createdAt: new Date().toISOString(),
      nextOilChangeKm: currentKm + 2000,
    };

    const updated = [newOrder, ...workOrders];
    setWorkOrders(updated);
    BengkelStorageService.saveWorkOrders(updated);

    // Reset Form
    setCustomerName('');
    setPlateNumber('');
    setComplaintNotes('');
    setActiveTab('antrean');
    showNotification(`SPK ${newSpkNum} berhasil dibuat & masuk antrean servis.`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: ServiceWorkOrder['status']) => {
    const updated = workOrders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          finishedAt: newStatus === 'selesai' ? new Date().toISOString() : o.finishedAt,
        };
      }
      return o;
    });
    setWorkOrders(updated);
    BengkelStorageService.saveWorkOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    showNotification(`Status SPK diperbarui menjadi: ${newStatus.toUpperCase()}`);
  };

  const handleRestockPart = (partId: string, addQty: number = 5) => {
    const updated = parts.map((p) => (p.id === partId ? { ...p, stock: p.stock + addQty } : p));
    setParts(updated);
    BengkelStorageService.saveParts(updated);
    showNotification(`Stok berhasil ditambah +${addQty} unit.`);
  };

  const handleDownloadKatalog = () => {
    const htmlContent = BengkelStorageService.generateKatalogHtml(parts);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `katalog-bengkelqu-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('File katalog.html berhasil di-generate & diunduh!');
  };

  // AI Knowledge Base Questions
  const handleAskAi = (topicKey: string) => {
    if (topicKey === 'torsi') {
      setAiAnswer({
        topic: 'Spesifikasi Torsi Pengencangan Baut CVT Motor Matic',
        content:
          '• Mur Pulley Depan (Drive Face): 108 Nm (Kunci Sok 22mm).\n• Mur Mangkok Kampas Ganda Belakang: 49 Nm (Kunci Sok 19mm).\n• Mur Kampas Kopling Ganda (Internal Clutch): 75 Nm (Kunci Tipis 39mm/41mm).\n• Baut Cover Tutup CVT: 10 Nm (Kunci T 8mm, pola silang bertahap).',
        practicalAdvice:
          'Gunakan selalu kunci torsi (torque wrench). Pengencangan berlebih dengan impact wrench tanpa torsi dapat merusak ulir kruk as yang sangat mahal perbaikannya.',
      });
    } else if (topicKey === 'oli') {
      setAiAnswer({
        topic: 'Takaran Kapasitas Volume Oli Mesin Honda & Yamaha',
        content:
          '• Honda Beat / Scoopy / Genio eSP (Mesin K0J): 0.65 Liter (650 ml).\n• Honda Vario 125 / 150: 0.80 Liter (800 ml).\n• Honda Vario 160 / PCX 160: 0.80 Liter (800 ml).\n• Yamaha NMAX 155 / Aerox 155: 0.90 - 1.00 Liter (900-1000 ml).\n• Oli Gardan Matic (Semua): 120 ml per penggantian berkala.',
        practicalAdvice:
          'Hati-hati: Beat ESP terbaru hanya membutuhkan 650ml. Mengisi 800ml penuh akan membuat tarikan berat dan oli naik ke box filter udara.',
      });
    } else if (topicKey === 'mil') {
      setAiAnswer({
        topic: 'Daftar Kode Kedipan Kerusakan Injeksi (MIL PGM-FI)',
        content:
          '• 1 Kedipan: Sensor MAP (Manifold Absolute Pressure)\n• 7 Kedipan: Sensor EOT / ECT (Suhu Mesin / Oli)\n• 8 Kedipan: Sensor TP (Throttle Position)\n• 9 Kedipan: Sensor IAT (Intake Air Temperature)\n• 12 Kedipan: Rangkaian Injektor BBM\n• 21 Kedipan: Sensor Oksigen (O2 Sensor)\n• 54 Kedipan: Bank Angle Sensor (Sensor Kemiringan)',
        practicalAdvice:
          'Setelah memperbaiki soket atau mengganti sensor, lakukan jumper kabel DLC (Diagnostic Link Connector) dan reset ECM agar lampu MIL kembali normal.',
      });
    } else if (topicKey === 'printer') {
      setAiAnswer({
        topic: 'Panduan Koneksi Printer Thermal Bluetooth 58mm/80mm',
        content:
          '1. Pastikan Bluetooth di HP aktif dan printer dalam kondisi ON dengan kertas thermal terpasang rapi.\n2. Pairing perangkat di menu Bluetooth HP dengan PIN default: 0000 atau 1234.\n3. Di aplikasi AppQu, buka Setting > Status Printer Bluetooth dan pilih printer "POS-58-BT".\n4. Lakukan Test Print struk untuk memastikan feed kertas normal.',
        practicalAdvice:
          'Jika printer tidak merespons, matikan printer selama 5 detik, lalu hidupkan kembali dan refresh aplikasi AppQu.',
      });
    }
  };

  const filteredParts = parts.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(stockSearch.toLowerCase()) ||
      p.suitableFor.toLowerCase().includes(stockSearch.toLowerCase());
    const matchCat = stockCategory === 'all' || p.category === stockCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden text-stone-900 select-none">
      {/* ========================================================= */}
      {/* TOP HEADER: BENGKELQU WITH APPQU GREEN ACCENT */}
      {/* ========================================================= */}
      <header
        className="sticky top-0 z-30 bg-emerald-900 text-white px-4 pb-3 flex items-center justify-between shrink-0 shadow-sm border-b border-emerald-800 transition-all"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToAppQu}
            className="h-9 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-sm font-bold transition-all active:scale-95"
            title="Kembali ke AppQu"
          >
            <span>◀ AppQu</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center font-bold text-amber-300">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 leading-none">
                <span className="text-xl font-black text-white tracking-tight">BengkelQu</span>
                <span className="text-xs bg-amber-400 text-stone-950 font-extrabold px-2 py-0.5 rounded-full">
                  100% Gratis
                </span>
              </div>
              <p className="text-sm text-emerald-200 mt-1">
                Sistem Operasional & Asisten Pintar Bengkel Warga RT 04
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('spk_baru')}
          className="h-9 px-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl font-extrabold text-sm flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
          title="Buat SPK Servis Baru"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">SPK Baru</span>
        </button>
      </header>

      {/* ========================================================= */}
      {/* MINIMALIST SUB-MENU (CLEAN BORDER-BOTTOM, NO HEAVY BOXES) */}
      {/* ========================================================= */}
      <div className="bg-white border-b border-stone-200 px-3 py-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full py-1">
          {[
            { id: 'antrean', label: 'Antrean Servis', icon: Wrench, count: workOrders.filter((o) => o.status !== 'diambil').length },
            { id: 'spk_baru', label: 'Input SPK & Estimator', icon: Plus },
            { id: 'stok', label: 'Stok Sparepart', icon: Package, alert: parts.some((p) => p.stock <= p.minStock && p.category !== 'jasa') },
            { id: 'katalog', label: 'Katalog HTML', icon: Download },
            { id: 'ai_care', label: 'AI Troubleshooting', icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3.5 rounded-xl text-sm font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'text-emerald-900 border-b-2 border-emerald-700 bg-emerald-50/70 font-extrabold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
                {tab.alert && (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================= */}
      <main className="flex-1 overflow-y-auto bg-stone-50 p-3 sm:p-4">
        {/* ------------------------------------------------------- */}
        {/* TAB 1: ANTREAN SERVIS (CLEAN BORDER-B MINIMALIST LIST)  */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'antrean' && (
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="flex items-center justify-between px-1 text-xs text-stone-500">
              <span className="font-semibold text-stone-700">
                Daftar SPK Berjalan ({workOrders.length} Kendaraan Terdata)
              </span>
              <span>BengkelQu RT 04 Graha Kencana</span>
            </div>

            {/* Clean Minimalist List (No Card Overflow, Thin Border-Bottom) */}
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs divide-y divide-stone-200/80">
              {workOrders.map((order) => {
                const isFinished = order.status === 'selesai' || order.status === 'diambil';
                const isWorking = order.status === 'dikerjakan';

                return (
                  <div
                    key={order.id}
                    className="p-4 hover:bg-stone-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-stone-500">
                          {order.spkNumber}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                            isFinished
                              ? 'bg-emerald-100 text-emerald-800'
                              : isWorking
                              ? 'bg-amber-100 text-amber-900 animate-pulse'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                        <span className="text-sm font-mono font-black text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded">
                          {order.plateNumber}
                        </span>
                      </div>

                      <div className="text-lg font-bold text-stone-900">
                        {order.customerName}{' '}
                        <span className="text-sm font-normal text-stone-500">
                          ({order.customerBlock || 'Warga'}) · {order.vehicleBrand} {order.vehicleModel}
                        </span>
                      </div>

                      <div className="text-base text-stone-600 flex items-center gap-3">
                        <span className="font-mono text-sm">
                          KM: {order.currentKm.toLocaleString('id-ID')}
                        </span>
                        <span>·</span>
                        <span className="text-stone-600 font-medium">Montir: {order.mechanicName}</span>
                      </div>

                      <p className="text-base text-stone-600 italic line-clamp-1">
                        "{order.complaintNotes}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-2 sm:pt-0 border-t sm:border-0 border-stone-100">
                      <div className="text-left sm:text-right">
                        <div className="text-xs uppercase tracking-wider font-semibold text-stone-400">Total Biaya</div>
                        <div className="text-xl sm:text-2xl font-black font-mono text-emerald-850">
                          Rp {order.total.toLocaleString('id-ID')}
                        </div>
                      </div>

                      {/* Icon-Based Action Buttons (Minimalist Rules) */}
                      <div className="flex items-center gap-1">
                        {/* Status Toggle Button */}
                        {order.status === 'antre' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'dikerjakan')}
                            className="p-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold transition-transform active:scale-95"
                            title="Mulai Pengerjaan"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                        )}

                        {order.status === 'dikerjakan' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'selesai')}
                            className="p-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-transform active:scale-95"
                            title="Tandai Selesai"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {/* WhatsApp Generator Modal Trigger */}
                        <button
                          onClick={() => setWaModalOrder(order)}
                          className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl transition-transform active:scale-95"
                          title="Kirim Notifikasi WhatsApp (wa.me)"
                        >
                          <Phone className="w-4 h-4" />
                        </button>

                        {/* View Detail Modal */}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-transform active:scale-95"
                          title="Lihat Detail SPK & Ceklis"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 2: INPUT SPK & SMART ESTIMATOR                     */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'spk_baru' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                Smart Service Estimator & SPK
              </span>
              <h2 className="text-sm font-bold">Input Penerimaan Kendaraan Servis</h2>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Rekomendasi komponen dan ceklis fisik kendaraan terisi otomatis berdasarkan KM pemakaian.
              </p>
            </div>

            <form onSubmit={handleCreateSpk} className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-4">
              {/* Customer & Vehicle Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700">Nama Pelanggan (Warga)</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Pak Budi Santoso"
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700">No. WhatsApp Pelanggan</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="081288776655"
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 font-mono focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700">Nomor Polisi (Plat Motor/Mobil)</label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="Contoh: B 4821 KCA"
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 uppercase font-mono font-bold focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700">Merk & Tipe Kendaraan</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <select
                      value={vehicleBrand}
                      onChange={(e) => setVehicleBrand(e.target.value)}
                      className="p-2.5 rounded-xl border border-stone-300 font-medium"
                    >
                      <option value="Honda">Honda</option>
                      <option value="Yamaha">Yamaha</option>
                      <option value="Suzuki">Suzuki</option>
                      <option value="Kawasaki">Kawasaki</option>
                      <option value="Mobil">Mobil (Toyota/Daihatsu)</option>
                    </select>

                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="Tipe: Vario 125, NMAX"
                      className="p-2.5 rounded-xl border border-stone-300 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700">Kilometer (KM) Saat Ini</label>
                  <div className="relative mt-1">
                    <Gauge className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      value={currentKm}
                      onChange={(e) => setCurrentKm(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700">Mekanik Penanggung Jawab</label>
                  <select
                    value={mechanicName}
                    onChange={(e) => setMechanicName(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300"
                  >
                    <option value="Mas Yanto (Mekanik 1)">Mas Yanto (Mekanik 1)</option>
                    <option value="Mas Dedi (Mekanik 2)">Mas Dedi (Mekanik 2)</option>
                    <option value="Pak Joko (Kepala Bengkel)">Pak Joko (Kepala Bengkel)</option>
                  </select>
                </div>
              </div>

              {/* Smart Recommendation Banner Based on KM */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Rekomendasi Servis Otomatis (KM {currentKm.toLocaleString('id-ID')}):</span>
                </div>
                <div className="text-emerald-800 font-medium">
                  {recommendation.recommendedServices.join(' · ')}
                </div>
                <p className="text-[11px] text-stone-600 italic">{recommendation.priorityNote}</p>
              </div>

              {/* Ceklis Fisik Kendaraan Masuk (Clean Border-Bottom Style) */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-stone-800">
                  Ceklis Fisik Masuk Kendaraan:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.bodiLecet}
                      onChange={(e) => setChecklist({ ...checklist, bodiLecet: e.target.checked })}
                      className="rounded text-emerald-700"
                    />
                    <span>Ada Bodi Lecet / Baret</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.lampuUtama}
                      onChange={(e) => setChecklist({ ...checklist, lampuUtama: e.target.checked })}
                      className="rounded text-emerald-700"
                    />
                    <span>Lampu Utama Normal</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.remDepanBelakang}
                      onChange={(e) => setChecklist({ ...checklist, remDepanBelakang: e.target.checked })}
                      className="rounded text-emerald-700"
                    />
                    <span>Fungsi Rem Baik</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.klakson}
                      onChange={(e) => setChecklist({ ...checklist, klakson: e.target.checked })}
                      className="rounded text-emerald-700"
                    />
                    <span>Klakson Bunyi</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.tekananBan}
                      onChange={(e) => setChecklist({ ...checklist, tekananBan: e.target.checked })}
                      className="rounded text-emerald-700"
                    />
                    <span>Tekanan Angin Cukup</span>
                  </label>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                    <span className="text-stone-500">Bensin:</span>
                    <select
                      value={checklist.indikatorBensin}
                      onChange={(e) => setChecklist({ ...checklist, indikatorBensin: e.target.value as any })}
                      className="bg-transparent font-bold text-stone-800"
                    >
                      <option value="E">E (Kosong)</option>
                      <option value="1/4">1/4 Tangki</option>
                      <option value="1/2">1/2 Tangki</option>
                      <option value="3/4">3/4 Tangki</option>
                      <option value="F">F (Penuh)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Rincian Jasa & Sparepart SPK (Clean Minimalist Table) */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">
                    Rincian Item Servis & Sparepart:
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 font-mono">
                    Total: Rp {currentTotal.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-200 text-xs">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="p-2.5 flex items-center justify-between bg-white">
                      <div>
                        <div className="font-semibold text-stone-900">{item.name}</div>
                        <span className="text-[10px] text-stone-400 capitalize">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-emerald-800 font-bold">
                          Rp {(item.price * item.qty).toLocaleString('id-ID')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 rounded text-red-500 hover:bg-red-50"
                          title="Hapus Item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Add Sparepart Chips */}
                <div className="pt-1">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block mb-1">
                    Tambah Cepat dari Stok Bengkel:
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                    {parts.slice(0, 5).map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => handleAddItemToSpk(p)}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 border border-stone-200 shrink-0 transition-colors"
                      >
                        + {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smart Up-Selling Section */}
                {upSellingSuggestions.length > 0 && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <TrendingUp className="w-4 h-4 text-amber-700" />
                      <span>Rekomendasi Up-Selling Kasir / Montir:</span>
                    </div>
                    {upSellingSuggestions.map((up, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] pt-1">
                        <div>
                          <strong>{up.name}</strong> (Rp {up.price.toLocaleString('id-ID')})
                          <p className="text-stone-500">{up.reason}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const found = parts.find((p) => p.name.includes(up.name.split(' ')[0]));
                            if (found) {
                              handleAddItemToSpk(found, true);
                            } else {
                              setSelectedItems([
                                ...selectedItems,
                                {
                                  id: `up-${Date.now()}`,
                                  name: up.name,
                                  category: 'upsell',
                                  price: up.price,
                                  qty: 1,
                                },
                              ]);
                            }
                          }}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg font-bold shrink-0 shadow-2xs"
                        >
                          + Tambah
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">Keluhan Pelanggan / Catatan Servis</label>
                <textarea
                  value={complaintNotes}
                  onChange={(e) => setComplaintNotes(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Tarikan awal gredek, suara berdecit di rem belakang..."
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Simpan SPK & Terbitkan Nomor Antrean</span>
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 3: MANAJEMEN STOK & SMART RE-ORDER POINT           */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'stok' && (
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="bg-white rounded-2xl p-3 border border-stone-200/90 shadow-2xs flex items-center justify-between gap-3">
              <div className="relative flex-1 text-xs">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  placeholder="Cari kode suku cadang, pelumas, tipe motor..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200"
                />
              </div>

              <select
                value={stockCategory}
                onChange={(e) => setStockCategory(e.target.value)}
                className="text-xs p-2 rounded-xl border border-stone-200 font-medium"
              >
                <option value="all">Semua Kategori</option>
                <option value="oli">Oli & Pelumas</option>
                <option value="cvt">Komponen CVT</option>
                <option value="rem">Pengereman</option>
                <option value="busi">Busi & Pengapian</option>
                <option value="cairan">Cairan & Kimia</option>
                <option value="jasa">Tarif Jasa</option>
              </select>
            </div>

            {/* List Sparepart (Strictly Border-Bottom, No Box Clutter) */}
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs divide-y divide-stone-200/80">
              {filteredParts.map((part) => {
                const isLowStock = part.stock <= part.minStock && part.category !== 'jasa';

                return (
                  <div
                    key={part.id}
                    className="p-3.5 flex items-center justify-between hover:bg-stone-50/70 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 text-[14px]">
                          {part.name}
                        </span>
                        {isLowStock && (
                          <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Restock
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-stone-500">
                        Kode: <span className="font-mono text-stone-700 font-medium">{part.code}</span> · Cocok: {part.suitableFor}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div
                          className={`text-xs font-bold ${
                            isLowStock ? 'text-red-600 font-black' : 'text-emerald-700'
                          }`}
                        >
                          {part.category === 'jasa' ? 'Tersedia' : `${part.stock} ${part.unit}`}
                        </div>
                        <div className="text-[12px] font-mono font-bold text-stone-800">
                          Rp {part.sellPrice.toLocaleString('id-ID')}
                        </div>
                      </div>

                      {part.category !== 'jasa' && (
                        <button
                          onClick={() => handleRestockPart(part.id, 5)}
                          className="p-2 bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-800 rounded-xl text-xs font-bold transition-all active:scale-95"
                          title="Restock Cepat +5 Unit"
                        >
                          +5
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 4: KATALOG GENERATOR & PROMO WATERMARK (`katalog.html`) */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'katalog' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider text-emerald-800">
                    Katalog Generator Berkas katalog.html
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Menghasilkan file HTML siap sebar ke grup WhatsApp warga dengan layout list bersih
                    minimalis dan footer resmi AppQu.
                  </p>
                </div>
                <button
                  onClick={handleDownloadKatalog}
                  className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download katalog.html</span>
                </button>
              </div>

              {/* Live Preview of Minimalist Catalog List */}
              <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
                <div className="p-3 bg-stone-50 border-b border-stone-200 font-bold text-xs text-emerald-900 flex justify-between">
                  <span>Pratinjau Katalog Sparepart BengkelQu</span>
                  <span className="font-mono text-[11px] text-stone-500">
                    {parts.filter((p) => p.category !== 'jasa').length} Komponen Terdaftar
                  </span>
                </div>

                <div className="divide-y divide-stone-200/80 text-xs">
                  {parts
                    .filter((p) => p.category !== 'jasa')
                    .map((p) => (
                      <div key={p.id} className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-stone-900">{p.name}</div>
                          <div className="text-[11px] text-stone-500">
                            {p.code} · Cocok untuk {p.suitableFor}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-800 font-mono text-sm">
                            Rp {p.sellPrice.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[10px] text-stone-400">
                            Stok: {p.stock} {p.unit}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="p-4 bg-stone-50 text-center text-xs text-stone-500 border-t border-stone-200 space-y-1">
                  <strong>Powered by AppQu — Solusi Manajemen Bengkel & Usaha</strong>
                  <div className="text-[11px]">
                    Garansi asli pengerjaan & konsultasi mekanik RT 04 Graha Kencana.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 5: AI CUSTOMER CARE & TROUBLESHOOTING             */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'ai_care' && (
          <div className="max-w-3xl mx-auto space-y-3.5">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-4 rounded-2xl shadow-sm space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                <Bot className="w-4 h-4" />
                <span>AI Bengkel Care & Troubleshooting Mandiri</span>
              </div>
              <h2 className="text-sm font-bold">Asisten Pintar Otomotif & Operasional</h2>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Panduan praktis montir: torsi baut, takaran oli mesin, arti kode kedipan lampu injeksi MIL,
                serta kendala koneksi printer thermal.
              </p>
            </div>

            {/* Quick Topic Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleAskAi('torsi')}
                className="p-3 bg-white rounded-xl border border-stone-200 hover:border-emerald-500 text-left transition-all shadow-2xs"
              >
                <Sliders className="w-4 h-4 text-emerald-700 mb-1" />
                <div className="text-xs font-bold text-stone-900">Torsi Baut CVT</div>
                <div className="text-[10px] text-stone-500">Pulley depan & mangkok ganda</div>
              </button>

              <button
                onClick={() => handleAskAi('oli')}
                className="p-3 bg-white rounded-xl border border-stone-200 hover:border-emerald-500 text-left transition-all shadow-2xs"
              >
                <Gauge className="w-4 h-4 text-emerald-700 mb-1" />
                <div className="text-xs font-bold text-stone-900">Kapasitas Oli Mesin</div>
                <div className="text-[10px] text-stone-500">Takaran cc Beat, Vario, NMAX</div>
              </button>

              <button
                onClick={() => handleAskAi('mil')}
                className="p-3 bg-white rounded-xl border border-stone-200 hover:border-emerald-500 text-left transition-all shadow-2xs"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 mb-1" />
                <div className="text-xs font-bold text-stone-900">Kedipan MIL Injeksi</div>
                <div className="text-[10px] text-stone-500">Sensor TP, EOT, O2, Injektor</div>
              </button>

              <button
                onClick={() => handleAskAi('printer')}
                className="p-3 bg-white rounded-xl border border-stone-200 hover:border-emerald-500 text-left transition-all shadow-2xs"
              >
                <Printer className="w-4 h-4 text-emerald-700 mb-1" />
                <div className="text-xs font-bold text-stone-900">Printer Thermal BT</div>
                <div className="text-[10px] text-stone-500">Pairing & tes cetak nota</div>
              </button>
            </div>

            {/* AI Answer Card */}
            {aiAnswer && (
              <div className="bg-white rounded-2xl p-4 border border-emerald-300 shadow-sm space-y-3 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <h4 className="text-xs font-bold text-stone-900">{aiAnswer.topic}</h4>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded">
                    BengkelQu Verified
                  </span>
                </div>

                <div className="text-xs text-stone-700 font-mono whitespace-pre-line leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                  {aiAnswer.content}
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <strong>💡 Catatan Praktis Montir:</strong>
                  <p className="text-[11px] leading-relaxed">{aiAnswer.practicalAdvice}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ------------------------------------------------------- */}
      {/* MODAL 1: WHATSAPP SMART TEMPLATE SENDER (wa.me)        */}
      {/* ------------------------------------------------------- */}
      {waModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-stone-900">
                  Kirim Notifikasi WhatsApp Pelanggan
                </h3>
              </div>
              <button
                onClick={() => setWaModalOrder(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div>Pelanggan: <strong>{waModalOrder.customerName}</strong> ({waModalOrder.plateNumber})</div>
              <div>WhatsApp: <strong className="font-mono">{waModalOrder.customerPhone}</strong></div>
              <div>Total Estimasi: <strong className="font-mono text-emerald-800">Rp {waModalOrder.total.toLocaleString('id-ID')}</strong></div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-stone-700 block">
                Pilih Draf Pesan Otomatis:
              </span>

              <a
                href={BengkelStorageService.generateWaUrl(waModalOrder, 'selesai')}
                target="_blank"
                rel="noreferrer"
                className="w-full p-3 rounded-xl border border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/60 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="font-bold text-emerald-900">1. Servis Selesai & Siap Diambil</div>
                  <div className="text-[10px] text-stone-500">Rincian pengerjaan & garansi 7 hari</div>
                </div>
                <Send className="w-4 h-4 text-emerald-700" />
              </a>

              <a
                href={BengkelStorageService.generateWaUrl(waModalOrder, 'nota')}
                target="_blank"
                rel="noreferrer"
                className="w-full p-3 rounded-xl border border-stone-200 hover:bg-stone-50 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="font-bold text-stone-900">2. Kwitansi Digital Nota Servis</div>
                  <div className="text-[10px] text-stone-500">Bukti pembayaran lunas & rincian biaya</div>
                </div>
                <Send className="w-4 h-4 text-stone-600" />
              </a>

              <a
                href={BengkelStorageService.generateWaUrl(waModalOrder, 'reminder_oli')}
                target="_blank"
                rel="noreferrer"
                className="w-full p-3 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-100/60 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="font-bold text-amber-900">3. Pengingat Jadwal Ganti Oli Berkala</div>
                  <div className="text-[10px] text-stone-500">Target KM: {(waModalOrder.nextOilChangeKm || waModalOrder.currentKm + 2000).toLocaleString('id-ID')} KM</div>
                </div>
                <Send className="w-4 h-4 text-amber-700" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* MODAL 2: DETAIL SPK & CEKLIS FISIK                    */}
      {/* ------------------------------------------------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-mono text-xs font-bold text-stone-500">
                {selectedOrder.spkNumber}
              </span>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <h3 className="text-sm font-bold text-stone-900">
                {selectedOrder.customerName} ({selectedOrder.plateNumber})
              </h3>
              <p className="text-stone-500">
                {selectedOrder.vehicleBrand} {selectedOrder.vehicleModel} · {selectedOrder.currentKm.toLocaleString('id-ID')} KM
              </p>
              <p className="text-stone-600 italic">"{selectedOrder.complaintNotes}"</p>
            </div>

            {/* Ceklis Fisik Status */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
              <div className="font-bold text-stone-800">Kondisi Fisik Saat Masuk:</div>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-stone-600 pt-1">
                <div>Bodi Baret: {selectedOrder.checklist.bodiLecet ? 'Ya' : 'Aman (Tidak)'}</div>
                <div>Lampu: {selectedOrder.checklist.lampuUtama ? 'Normal' : 'Mati / Redup'}</div>
                <div>Rem: {selectedOrder.checklist.remDepanBelakang ? 'Pakem' : 'Dalam / Aus'}</div>
                <div>Indikator Bensin: {selectedOrder.checklist.indikatorBensin}</div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-stone-200 rounded-xl divide-y divide-stone-200 text-xs">
              {selectedOrder.items.map((i) => (
                <div key={i.id} className="p-2.5 flex justify-between">
                  <div>
                    <span className="font-medium text-stone-900">{i.name}</span>
                    <span className="text-stone-400 text-[10px] ml-1">x{i.qty}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-800">
                    Rp {(i.price * i.qty).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-sm font-bold pt-2 border-t border-stone-200">
              <span>Total Tagihan:</span>
              <span className="font-mono text-emerald-800">
                Rp {selectedOrder.total.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setWaModalOrder(selectedOrder);
                  setSelectedOrder(null);
                }}
                className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Kirim WhatsApp</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
