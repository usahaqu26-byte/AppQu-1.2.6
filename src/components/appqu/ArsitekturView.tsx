import React, { useState } from 'react';
import {
  Database,
  Layout,
  Code2,
  CheckCircle,
  Copy,
  Terminal,
  ShieldCheck,
  Send,
  Play,
  Layers,
  ArrowRight,
  GitBranch,
} from 'lucide-react';

export const ArsitekturView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'db' | 'wireframe' | 'api' | 'erd'>('db');
  const [selectedApiTest, setSelectedApiTest] = useState<string>('panic');
  const [apiResponseJson, setApiResponseJson] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleTestApi = (endpointKey: string) => {
    setSelectedApiTest(endpointKey);

    if (endpointKey === 'panic') {
      setApiResponseJson(
        JSON.stringify(
          {
            status: 'success',
            code: 201,
            message: 'Emergency incident broadcasted successfully to all responders',
            data: {
              incident_id: 'EMERG-20261019-9941',
              reporter: {
                id: 'usr-warga-1',
                name: 'Budi Santoso',
                block: 'Blok C3 No. 12',
                phone: '0812-8877-6655',
              },
              category: 'KEMALINGAN',
              priority: 'P1_CRITICAL',
              siren_dispatched: true,
              coordinates: { lat: -7.7956, lng: 110.3695 },
              nearest_cctv: {
                id: 'CAM-01-POS-UTAMA',
                rtsp_url: 'rtsp://security.appqu.local:554/live/cam01',
              },
              notifications_sent: [
                { target: 'Satpam Pos Utama (Pak Agus)', status: 'DELIVERED', sound: 'SIREN_MAX' },
                { target: 'Ketua RT 04 (Ir. Hendra Gunawan)', status: 'DELIVERED', sound: 'SIREN_MAX' },
              ],
              created_at: new Date().toISOString(),
            },
          },
          null,
          2
        )
      );
    } else if (endpointKey === 'letter_approval') {
      setApiResponseJson(
        JSON.stringify(
          {
            status: 'success',
            code: 200,
            message: 'Letter approved and cryptographically sealed with digital QR signature',
            data: {
              letter_id: 'surat-1049281',
              letter_number: '04/SP-RT04/X/2026',
              type: 'SKCK',
              applicant: {
                name: 'Budi Santoso',
                nik: '3201123456780001',
                block: 'Blok C3 No. 12',
              },
              status: 'APPROVED',
              approver: {
                user_id: 'usr-rt-1',
                name: 'Ir. H. Hendra Gunawan',
                role: 'Ketua RT 04',
              },
              digital_signature: {
                algorithm: 'ECDSA_SHA256',
                qr_hash: 'VERIFIED-RT04-04-SP-RT04-X-2026-BUDI-SANTOSO-92A8BF',
                verification_url: 'https://appqu.id/verify/letter/04-SP-RT04-X-2026',
              },
              approved_at: new Date().toISOString(),
            },
          },
          null,
          2
        )
      );
    } else if (endpointKey === 'ocr_verify') {
      setApiResponseJson(
        JSON.stringify(
          {
            status: 'success',
            code: 200,
            message: 'Transfer receipt parsed and ledger matched with 99.8% confidence',
            data: {
              ocr_transaction_id: 'OCR-TX-88391',
              extracted_fields: {
                bank: 'BCA Mobile',
                sender_name: 'BUDI SANTOSO',
                amount: 50000,
                timestamp: '2026-10-15 08:32:10',
                target_account: '8830192111 (KAS PAGUYUBAN RT 04)',
              },
              match_score: 99.8,
              ledger_status: 'AUTO_RECONCILED',
              updated_dues_status: 'LUNAS',
            },
          },
          null,
          2
        )
      );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-stone-100 overflow-hidden">
      {/* Top Section Tabs */}
      <div className="bg-white border-b border-stone-200 px-3 py-2 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSection('db')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeSection === 'db'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>1. Skema Database</span>
          </button>

          <button
            onClick={() => setActiveSection('wireframe')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeSection === 'wireframe'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>2. Wireframe Warga vs Pengurus</span>
          </button>

          <button
            onClick={() => setActiveSection('api')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeSection === 'api'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>3. API Mapping & Tester</span>
          </button>
        </div>
      </div>

      {/* Content Canvas */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-stone-900">
        {/* ========================================================= */}
        {/* SECTION 1: DATABASE ARCHITECTURE */}
        {/* ========================================================= */}
        {activeSection === 'db' && (
          <div className="space-y-3.5">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-4 rounded-2xl shadow-sm space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Spesifikasi Teknis Data Model
              </span>
              <h2 className="text-sm font-bold">Arsitektur Database Relasional AppQu</h2>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Dirancang untuk integritas tinggi, audit trail keuangan, granular RBAC (Role-Based Access
                Control), dan integrasi POS UMKM lokal (BaksoQu).
              </p>
            </div>

            {/* Table ERD Cards */}
            <div className="space-y-3">
              {/* 1. USERS & ROLES */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h3 className="text-xs font-black font-mono text-stone-900">
                      users & roles (Hirarki RBAC 2-Tier: Tier 1 & Tier 2)
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                    One-to-Many
                  </span>
                </div>

                <div className="text-xs font-mono bg-stone-950 text-emerald-300 p-3 rounded-xl overflow-x-auto space-y-1">
                  <div className="text-stone-400">-- Tabel Users (Buku Induk Warga)</div>
                  <div>CREATE TABLE users (</div>
                  <div className="pl-4 text-stone-200">id UUID PRIMARY KEY DEFAULT gen_random_uuid(),</div>
                  <div className="pl-4 text-stone-200">nik VARCHAR(16) UNIQUE NOT NULL,</div>
                  <div className="pl-4 text-stone-200">no_kk VARCHAR(16) NOT NULL,</div>
                  <div className="pl-4 text-stone-200">full_name VARCHAR(150) NOT NULL,</div>
                  <div className="pl-4 text-stone-200">phone VARCHAR(20) NOT NULL,</div>
                  <div className="pl-4 text-stone-200">block_number VARCHAR(50) NOT NULL, -- e.g. Blok C3 No. 12</div>
                  <div className="pl-4 text-stone-200">resident_status VARCHAR(20) DEFAULT 'tetap', -- tetap, kontrak, kos</div>
                  <div className="pl-4 text-stone-200">emergency_contact VARCHAR(100),</div>
                  <div className="pl-4 text-stone-200">created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()</div>
                  <div>);</div>
                  <div className="pt-2 text-stone-400">-- Tabel Roles (Hirarki 2-Tier: Tier 1 Akar Rumput & Tier 2 Pengurus RT)</div>
                  <div>CREATE TABLE roles (</div>
                  <div className="pl-4 text-stone-200">id UUID PRIMARY KEY,</div>
                  <div className="pl-4 text-stone-200">user_id UUID REFERENCES users(id) ON DELETE CASCADE,</div>
                  <div className="pl-4 text-stone-200">tier VARCHAR(30) NOT NULL, -- governance, pengurus, koordinator, warga</div>
                  <div className="pl-4 text-stone-200">role_detail VARCHAR(50) NOT NULL, -- ketua_rt, bendahara, sekretaris, koor_keamanan, dll</div>
                  <div className="pl-4 text-stone-200">permissions_json JSONB NOT NULL,</div>
                  <div className="pl-4 text-stone-200">is_active BOOLEAN DEFAULT TRUE</div>
                  <div>);</div>
                </div>
              </div>

              {/* 2. TRANSACTIONS & KAS */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h3 className="text-xs font-black font-mono text-stone-900">
                      transactions & dues_ledger (Kas & Smart OCR)
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                    Financial Ledger
                  </span>
                </div>

                <div className="text-xs font-mono bg-stone-950 text-amber-300 p-3 rounded-xl overflow-x-auto space-y-1">
                  <div>CREATE TABLE transactions (</div>
                  <div className="pl-4 text-stone-200">id UUID PRIMARY KEY,</div>
                  <div className="pl-4 text-stone-200">user_id UUID REFERENCES users(id),</div>
                  <div className="pl-4 text-stone-200">type VARCHAR(20) NOT NULL, -- iuran, pengeluaran, donasi_duka</div>
                  <div className="pl-4 text-stone-200">amount DECIMAL(12,2) NOT NULL,</div>
                  <div className="pl-4 text-stone-200">category VARCHAR(50) NOT NULL,</div>
                  <div className="pl-4 text-stone-200">proof_image_url TEXT,</div>
                  <div className="pl-4 text-stone-200">ocr_data JSONB, -- bank, sender, amount, match_score</div>
                  <div className="pl-4 text-stone-200">status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected</div>
                  <div className="pl-4 text-stone-200">verified_by UUID REFERENCES users(id),</div>
                  <div className="pl-4 text-stone-200">created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()</div>
                  <div>);</div>
                </div>
              </div>

              {/* 3. EMERGENCY LOGS & PATROL */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <h3 className="text-xs font-black font-mono text-stone-900">
                      emergency_logs, patrol_checkpoints, patrol_logs
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                    Real-Time Security
                  </span>
                </div>

                <div className="text-xs font-mono bg-stone-950 text-red-300 p-3 rounded-xl overflow-x-auto space-y-1">
                  <div>CREATE TABLE emergency_logs (</div>
                  <div className="pl-4 text-stone-200">id UUID PRIMARY KEY,</div>
                  <div className="pl-4 text-stone-200">reporter_id UUID REFERENCES users(id),</div>
                  <div className="pl-4 text-stone-200">type VARCHAR(30) NOT NULL, -- kemalingan, medis, kebakaran, bencana</div>
                  <div className="pl-4 text-stone-200">block_number VARCHAR(50) NOT NULL,</div>
                  <div className="pl-4 text-stone-200">latitude DOUBLE PRECISION,</div>
                  <div className="pl-4 text-stone-200">longitude DOUBLE PRECISION,</div>
                  <div className="pl-4 text-stone-200">nearest_cctv_id VARCHAR(50),</div>
                  <div className="pl-4 text-stone-200">siren_triggered BOOLEAN DEFAULT TRUE,</div>
                  <div className="pl-4 text-stone-200">status VARCHAR(20) DEFAULT 'active', -- active, dispatched, resolved</div>
                  <div className="pl-4 text-stone-200">dispatched_responders JSONB,</div>
                  <div className="pl-4 text-stone-200">resolved_at TIMESTAMP WITH TIME ZONE</div>
                  <div>);</div>
                </div>
              </div>

              {/* 4. LETTERS (SURAT PENGANTAR DIGITAL) */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                    <h3 className="text-xs font-black font-mono text-stone-900">
                      letters (Surat Pengantar & Approval Flow)
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                    Digital Signature
                  </span>
                </div>

                <div className="text-xs font-mono bg-stone-950 text-teal-300 p-3 rounded-xl overflow-x-auto space-y-1">
                  <div>CREATE TABLE letters (</div>
                  <div className="pl-4 text-stone-200">id UUID PRIMARY KEY,</div>
                  <div className="pl-4 text-stone-200">letter_number VARCHAR(50) UNIQUE NOT NULL,</div>
                  <div className="pl-4 text-stone-200">user_id UUID REFERENCES users(id),</div>
                  <div className="pl-4 text-stone-200">type VARCHAR(30) NOT NULL, -- skck, domisili, izin_usaha, dll</div>
                  <div className="pl-4 text-stone-200">purpose TEXT NOT NULL,</div>
                  <div className="pl-4 text-stone-200">auto_fill_snapshot JSONB NOT NULL, -- NIK, KK, Alamat</div>
                  <div className="pl-4 text-stone-200">status VARCHAR(30) DEFAULT 'pending_sekretaris',</div>
                  <div className="pl-4 text-stone-200">approved_by UUID REFERENCES users(id),</div>
                  <div className="pl-4 text-stone-200">digital_signature_qr TEXT,</div>
                  <div className="pl-4 text-stone-200">approved_at TIMESTAMP WITH TIME ZONE</div>
                  <div>);</div>
                </div>
              </div>

              {/* 5. USAHAQU & BAKSOQU POS INTEGRATION */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                    <h3 className="text-xs font-black font-mono text-stone-900">
                      businesses, menu_items, orders (Integrasi POS BaksoQu)
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                    POS Bridge
                  </span>
                </div>

                <div className="text-xs font-mono bg-stone-950 text-stone-200 p-3 rounded-xl overflow-x-auto space-y-1">
                  <div className="text-stone-400">-- Lapak UMKM Warga & Unit POS Aktif</div>
                  <div>CREATE TABLE businesses (</div>
                  <div className="pl-4">id UUID PRIMARY KEY,</div>
                  <div className="pl-4">owner_id UUID REFERENCES users(id),</div>
                  <div className="pl-4">name VARCHAR(150) NOT NULL, -- Bakso Qu 1.0 / BengkelQu</div>
                  <div className="pl-4">category VARCHAR(50) NOT NULL,</div>
                  <div className="pl-4">pos_module_key VARCHAR(50), -- 'baksoqu' | 'bengkelqu' (Master Switch flags)</div>
                  <div className="pl-4">rating DECIMAL(2,1) DEFAULT 5.0</div>
                  <div>);</div>
                  <div className="pt-2 text-stone-400">-- Tabel BengkelQu (SPK & Smart Service Estimator)</div>
                  <div>CREATE TABLE service_work_orders (</div>
                  <div className="pl-4">id UUID PRIMARY KEY,</div>
                  <div className="pl-4">spk_number VARCHAR(50) UNIQUE NOT NULL,</div>
                  <div className="pl-4">plate_number VARCHAR(20) NOT NULL,</div>
                  <div className="pl-4">vehicle_brand VARCHAR(50) NOT NULL,</div>
                  <div className="pl-4">current_km INT NOT NULL,</div>
                  <div className="pl-4">checklist JSONB NOT NULL, -- bodi, lampu, rem, bensin</div>
                  <div className="pl-4">items JSONB NOT NULL, -- jasa & sparepart</div>
                  <div className="pl-4">up_selling JSONB,</div>
                  <div className="pl-4">status VARCHAR(20) DEFAULT 'antre', -- antre, dikerjakan, selesai, diambil</div>
                  <div className="pl-4">total DECIMAL(12,2) NOT NULL</div>
                  <div>);</div>
                  <div className="pt-2 text-stone-400">-- Tabel BengkelQu Suku Cadang & Re-Order Point</div>
                  <div>CREATE TABLE bengkel_parts (</div>
                  <div className="pl-4">id UUID PRIMARY KEY,</div>
                  <div className="pl-4">code VARCHAR(50) UNIQUE NOT NULL,</div>
                  <div className="pl-4">name VARCHAR(150) NOT NULL,</div>
                  <div className="pl-4">category VARCHAR(50) NOT NULL, -- oli, cvt, rem, busi, filter, cairan</div>
                  <div className="pl-4">stock INT NOT NULL DEFAULT 0,</div>
                  <div className="pl-4">min_stock INT NOT NULL DEFAULT 3, -- Smart Re-Order Point Alert</div>
                  <div className="pl-4">sell_price DECIMAL(12,2) NOT NULL</div>
                  <div>);</div>
                  <div className="pt-2 text-stone-400">-- Tabel KlinikQu Kasir & Layanan Medis</div>
                  <div>CREATE TABLE klinik_services (</div>
                  <div className="pl-4">id UUID PRIMARY KEY,</div>
                  <div className="pl-4">name VARCHAR(150) NOT NULL,</div>
                  <div className="pl-4">description TEXT,</div>
                  <div className="pl-4">category VARCHAR(50) NOT NULL, -- konsultasi, tindakan, lab, obat</div>
                  <div className="pl-4">price DECIMAL(12,2) NOT NULL</div>
                  <div>);</div>
                  <div className="pt-2 text-stone-400">-- Tabel KlinikQu Kwitansi Medis & Rekam Tindakan</div>
                  <div>CREATE TABLE klinik_invoices (</div>
                  <div className="pl-4">id UUID PRIMARY KEY,</div>
                  <div className="pl-4">invoice_number VARCHAR(50) UNIQUE NOT NULL,</div>
                  <div className="pl-4">patient_name VARCHAR(150) NOT NULL,</div>
                  <div className="pl-4">patient_nik VARCHAR(20),</div>
                  <div className="pl-4">patient_block VARCHAR(50),</div>
                  <div className="pl-4">doctor_name VARCHAR(150) NOT NULL,</div>
                  <div className="pl-4">items JSONB NOT NULL, -- list tindakan/obat & harga</div>
                  <div className="pl-4">total DECIMAL(12,2) NOT NULL,</div>
                  <div className="pl-4">payment_method VARCHAR(30) NOT NULL, -- tunai, qris, bpjs_subsidi</div>
                  <div className="pl-4">notes TEXT,</div>
                  <div className="pl-4">created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()</div>
                  <div>);</div>
                  <div className="pt-2 text-stone-400">-- Tabel RitelQu Kasir & Toko Kelontong Warga</div>
                  <div>CREATE TABLE ritel_products (</div>
                  <div className="pl-4">id UUID PRIMARY KEY,</div>
                  <div className="pl-4">sku VARCHAR(50) UNIQUE NOT NULL,</div>
                  <div className="pl-4">name VARCHAR(150) NOT NULL,</div>
                  <div className="pl-4">category VARCHAR(50) NOT NULL, -- sembako, makanan, minuman, kebersihan, bumbu</div>
                  <div className="pl-4">price DECIMAL(12,2) NOT NULL,</div>
                  <div className="pl-4">stock INT NOT NULL DEFAULT 0,</div>
                  <div className="pl-4">unit VARCHAR(20) DEFAULT 'Pcs',</div>
                  <div className="pl-4">min_stock INT DEFAULT 5</div>
                  <div>);</div>
                  <div className="pt-2 text-stone-400">-- Tabel RitelQu Transaksi Penjualan & Struk</div>
                  <div>CREATE TABLE ritel_invoices (</div>
                  <div className="pl-4">id UUID PRIMARY KEY,</div>
                  <div className="pl-4">invoice_number VARCHAR(50) UNIQUE NOT NULL,</div>
                  <div className="pl-4">cashier_name VARCHAR(100) NOT NULL,</div>
                  <div className="pl-4">customer_name VARCHAR(150),</div>
                  <div className="pl-4">items JSONB NOT NULL, -- rincian item, sku, qty, harga</div>
                  <div className="pl-4">total DECIMAL(12,2) NOT NULL,</div>
                  <div className="pl-4">cash_given DECIMAL(12,2),</div>
                  <div className="pl-4">change DECIMAL(12,2),</div>
                  <div className="pl-4">payment_method VARCHAR(20) NOT NULL, -- tunai, qris, bon_warga</div>
                  <div className="pl-4">status VARCHAR(20) DEFAULT 'lunas',</div>
                  <div className="pl-4">created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()</div>
                  <div>);</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 2: WIREFRAME DASHBOARD WARGA VS PENGURUS */}
        {/* ========================================================= */}
        {activeSection === 'wireframe' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider text-emerald-800">
                Struktur Desain Antarmuka: Warga vs Pengurus
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                AppQu menerapkan prinsip <em>adaptive interface by role</em>: Warga biasa mendapatkan
                tampilan yang berfokus pada kemudahan akses kebutuhan harian (Iuran, Surat, Belanja UMKM,
                Panic Button), sedangkan Pengurus RT/Admin mendapatkan panel verifikasi & approval
                bertingkat.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Wireframe A: Dashboard Warga */}
              <div className="bg-white rounded-2xl p-4 border border-stone-300 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold text-emerald-900">
                    A. Tampilan Dashboard Warga Biasa
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Citizen Mode
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-950 text-white space-y-1">
                    <div className="text-[10px] text-amber-300 font-bold">1. Header Kompak</div>
                    <div className="text-[11px] text-stone-300">
                      Nama Warga, Blok Rumah, Quick SOS Panic, Tombol Buka POS BaksoQu
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 space-y-1">
                    <div className="text-[10px] text-stone-800 font-bold">2. Kartu Identitas Digital</div>
                    <div className="text-[11px] text-stone-600">
                      QR Code Verifikasi Warga, NIK, No. KK, Status Tinggal (Tetap/Kontrak)
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 space-y-1">
                    <div className="text-[10px] text-stone-800 font-bold">3. Kas Warga & Iuran</div>
                    <div className="text-[11px] text-stone-600">
                      Status Lunas/Belum + Smart Scan OCR Struk Pembayaran Instan
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 space-y-1">
                    <div className="text-[10px] text-stone-800 font-bold">4. Permohonan Surat Online</div>
                    <div className="text-[11px] text-stone-600">
                      Form auto-fill untuk SKCK, Domisili, Izin Usaha tanpa perlu ketik ulang
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 space-y-1">
                    <div className="text-[10px] text-stone-800 font-bold">5. UsahaQu & SiagaQu</div>
                    <div className="text-[11px] text-stone-600">
                      Belanja di lapak tetangga, Donasi duka, dan 1-tap Tombol Darurat
                    </div>
                  </div>
                </div>
              </div>

              {/* Wireframe B: Dashboard Pengurus */}
              <div className="bg-white rounded-2xl p-4 border border-stone-300 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold text-amber-900">
                    B. Tampilan Dashboard Pengurus (Ketua RT / Sekretaris / Bendahara)
                  </span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    Officer Mode
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-900 text-white space-y-1">
                    <div className="text-[10px] text-amber-300 font-bold">1. Approval Center Bar</div>
                    <div className="text-[11px] text-stone-300">
                      Badge permohonan surat pending, validasi mutasi iuran masuk, & broadcast darurat
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                    <div className="text-[10px] text-amber-900 font-bold">
                      2. Validasi & Tanda Tangan QR Surat
                    </div>
                    <div className="text-[11px] text-stone-700">
                      Ketua RT & Sekretaris dapat menyetujui surat secara digital lengkap dengan QR Code
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 space-y-1">
                    <div className="text-[10px] text-stone-800 font-bold">3. Verifikasi Keuangan Bendahara</div>
                    <div className="text-[11px] text-stone-600">
                      Review struk mutasi bank, konfirmasi penerimaan iuran, & input pengeluaran kas
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 space-y-1">
                    <div className="text-[10px] text-stone-800 font-bold">4. Monitoring Keamanan Pos Satpam</div>
                    <div className="text-[11px] text-stone-600">
                      Pantauan Live RTSP CCTV, status scan QR Checkpoint ronda malam, & respons SOS
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 space-y-1">
                    <div className="text-[10px] text-stone-800 font-bold">5. Manajemen Musibah & Piket</div>
                    <div className="text-[11px] text-stone-600">
                      Terbitkan berita lelayu, dompet solidaritas digital, & bagikan giliran takziah warga
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 3: API ENDPOINT MAPPING & TESTER */}
        {/* ========================================================= */}
        {activeSection === 'api' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider text-emerald-800">
                RESTful API Endpoint Architecture & Live Sandbox
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pemetaan API ringkas untuk Panic Button, Approval Surat Pengantar, Kas Smart OCR, dan Switch
                Master UsahaQu. Klik tombol "Test Endpoint" untuk menjalankan simulasi request/response!
              </p>
            </div>

            {/* Endpoints Table / Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button
                onClick={() => handleTestApi('panic')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedApiTest === 'panic'
                    ? 'border-red-600 bg-red-50/50 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-700">
                  <span className="bg-red-700 text-white px-1.5 py-0.2 rounded text-[10px]">POST</span>
                  <span>/api/v1/siaga/panic</span>
                </div>
                <div className="text-[11px] font-bold text-stone-900 mt-1">Smart Panic Button SOS</div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  Trigger sirene, broadcast satpam & RT, capture CCTV
                </div>
              </button>

              <button
                onClick={() => handleTestApi('letter_approval')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedApiTest === 'letter_approval'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800">
                  <span className="bg-emerald-800 text-white px-1.5 py-0.2 rounded text-[10px]">PUT</span>
                  <span>/api/v1/letters/approve</span>
                </div>
                <div className="text-[11px] font-bold text-stone-900 mt-1">Approval Surat Pengantar</div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  Verifikasi ketua RT & terbitkan Tanda Tangan QR resmi
                </div>
              </button>

              <button
                onClick={() => handleTestApi('ocr_verify')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedApiTest === 'ocr_verify'
                    ? 'border-amber-600 bg-amber-50/50 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-800">
                  <span className="bg-amber-600 text-white px-1.5 py-0.2 rounded text-[10px]">POST</span>
                  <span>/api/v1/finance/ocr-verify</span>
                </div>
                <div className="text-[11px] font-bold text-stone-900 mt-1">Smart Scan OCR Struk Kas</div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  Ekstraksi otomatis bank, nominal, & rekonsiliasi buku kas
                </div>
              </button>
            </div>

            {/* Endpoint Documentation & Sandbox Console */}
            {apiResponseJson && (
              <div className="bg-stone-950 rounded-2xl p-4 text-stone-100 shadow-xl border border-stone-800 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-stone-300">
                      HTTP 200 OK · Payload Simulator Output
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(apiResponseJson)}
                    className="p-1 rounded text-stone-400 hover:text-white flex items-center gap-1 text-[10px]"
                  >
                    {isCopied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Tersalin' : 'Salin JSON'}</span>
                  </button>
                </div>

                <pre className="text-[11px] text-emerald-400 overflow-x-auto max-h-72 leading-relaxed whitespace-pre-wrap">
                  {apiResponseJson}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
