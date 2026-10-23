import { GoogleGenAI } from '@google/genai';
import { RitelProduct, RitelInvoice, RitelCustomer } from '../types';

// Detect Gemini API Key if available (from vite env or runtime)
const getGeminiApiKey = (): string | undefined => {
  try {
    return (
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      (import.meta as any).env?.GEMINI_API_KEY ||
      (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined)
    );
  } catch {
    return undefined;
  }
};

export interface VoiceMatchResult {
  product: RitelProduct;
  qty: number;
  confidence: number;
  originalText: string;
}

export interface CrossSellItem {
  product: RitelProduct;
  reason: string;
}

export interface RitelAiResponse {
  answer: string;
  source: 'gemini' | 'local_expert';
  suggestedActions?: { label: string; action: string }[];
}

export const RitelAiService = {
  /**
   * Main conversational and advisory AI for RitelQu
   */
  async askRitelAi(
    userPrompt: string,
    context: {
      products: RitelProduct[];
      invoices: RitelInvoice[];
      customers: RitelCustomer[];
      storeName: string;
      deviceId: string;
    }
  ): Promise<RitelAiResponse> {
    const apiKey = getGeminiApiKey();

    // Prepare rich context summary
    const lowStockCount = context.products.filter(
      (p) => p.stock <= (p.minStock || 5)
    ).length;
    const totalOmset = context.invoices.reduce((acc, i) => acc + i.total, 0);
    const totalPiutang = context.customers.reduce((acc, c) => acc + (c.totalDebt || 0), 0);
    const topProducts = context.products.slice(0, 5).map((p) => p.name).join(', ');

    const systemInstruction = `Kamu adalah RitelQu AI, asisten pintar dan ahli operasional manajemen toko ritel, minimarket, dan toko kelontong warga yang terintegrasi di dalam aplikasi AppQu RT 04.
Peran & Karakter:
- Cepat, teliti, solutif, ramah, dan paham alur kasir (POS), pemindaian barcode, input suara (Speech-to-Text), manajemen stok, re-order point, CRM bon warga, promosi WhatsApp, dan troubleshooting teknis printer/aplikasi.
- Gunakan Bahasa Indonesia yang santun, praktis, to-the-point, dan berstruktur rapi tanpa basa-basi berbelit-belit.
- Data toko saat ini:
  * Nama Toko: ${context.storeName}
  * ID Perangkat: ${context.deviceId}
  * Total Produk: ${context.products.length} SKU (Stok menipis: ${lowStockCount} item)
  * Total Omset Terdata: Rp ${totalOmset.toLocaleString('id-ID')}
  * Total Bon/Hutang Warga: Rp ${totalPiutang.toLocaleString('id-ID')}
  * Produk Populer: ${topProducts}
Jika pengguna menanyakan masalah teknis atau bug, sertakan petunjuk solusi dan tawarkan pembuatan draf email ke Tim Support AppQu (support@appqu.id).`;

    // Attempt Gemini API call if key is available
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        });

        if (response.text) {
          return {
            answer: response.text,
            source: 'gemini',
          };
        }
      } catch (err) {
        console.warn('Gemini API call fell back to local retail brain:', err);
      }
    }

    // 100% Free Built-in Local Ritel Brain (Always instant, offline-capable)
    const localAnswer = this.getLocalRetailExpertAnswer(userPrompt, context);
    return {
      answer: localAnswer.text,
      source: 'local_expert',
      suggestedActions: localAnswer.actions,
    };
  },

  /**
   * Rule-based intelligent offline expert engine for 100% free guaranteed response
   */
  getLocalRetailExpertAnswer(
    query: string,
    context: {
      products: RitelProduct[];
      invoices: RitelInvoice[];
      customers: RitelCustomer[];
      storeName: string;
      deviceId: string;
    }
  ): { text: string; actions?: { label: string; action: string }[] } {
    const q = query.toLowerCase();

    // 1. Stok Menipis & Re-Order Point
    if (q.includes('stok') || q.includes('reorder') || q.includes('habis') || q.includes('kulak')) {
      const lowStockItems = context.products.filter(
        (p) => p.stock <= (p.minStock || 5)
      );

      if (lowStockItems.length === 0) {
        return {
          text: `Halo! Semua stok di ${context.storeName} saat ini dalam kondisi aman di atas batas minimum. Belum ada barang yang mendesak untuk di-reorder. Pantau terus item fast-moving seperti minyak goreng dan beras!`,
          actions: [{ label: 'Lihat Daftar Stok', action: 'open_stok' }],
        };
      }

      const listStr = lowStockItems
        .map(
          (p) => `• ${p.name}: sisa ${p.stock} ${p.unit} (Min: ${p.minStock || 5} ${p.unit})`
        )
        .join('\n');

      return {
        text: `Peringatan Smart Re-Order Point RitelQu AI:\nTerdapat ${lowStockItems.length} produk dengan stok di bawah batas aman yang perlu segera dipesan ke distributor:\n\n${listStr}\n\nSaran Operasional: Segera buat daftar kulakan atau broadcast pesanan ke supplier langganan agar kasir tidak mengalami stock-out.`,
        actions: [{ label: 'Kelola Stok Barang', action: 'open_stok' }],
      };
    }

    // 2. Bon Hutang Warga & CRM
    if (q.includes('bon') || q.includes('hutang') || q.includes('piutang') || q.includes('tagih')) {
      const debtCustomers = context.customers.filter((c) => (c.totalDebt || 0) > 0);
      const totalDebt = debtCustomers.reduce((sum, c) => sum + (c.totalDebt || 0), 0);

      const listStr = debtCustomers
        .map((c) => `• ${c.name} (${c.blockNumber}): Rp ${c.totalDebt.toLocaleString('id-ID')}`)
        .join('\n');

      return {
        text: `Laporan Bon / Piutang Pelanggan RitelQu:\nTotal piutang warga saat ini: Rp ${totalDebt.toLocaleString('id-ID')} dari ${debtCustomers.length} pelanggan.\n\n${listStr || '• Tidak ada catatan bon aktif.'}\n\nTips Penagihan Santun: Gunakan fitur "Kirim Pengingat WA" dengan bahasa kekeluargaan khas warga RT 04 agar hubungan baik tetap terjaga.`,
        actions: [{ label: 'Buka Buku Pelanggan & Bon', action: 'open_crm' }],
      };
    }

    // 3. Promosi, Diskon & Marketing
    if (q.includes('promo') || q.includes('diskon') || q.includes('laris') || q.includes('omset') || q.includes('katalog')) {
      return {
        text: `Strategi Peningkatan Omset dari RitelQu AI:\n1. Bundling Sembako Hemat: Gabungkan Minyak Goreng 2L + Gula 1KG + Telur 1KG dengan diskon Rp 3.000 untuk menarik belanja mingguan.\n2. Beli 2 Gratis 1 untuk snack / minuman mendekati masa promosi.\n3. Bagikan "Katalog Digital (katalog.html)" ke grup WhatsApp RT 04 dengan pesan ramah agar warga bisa langsung pesan antar (COD) ke rumah masing-masing!`,
        actions: [
          { label: 'Download katalog.html', action: 'gen_katalog' },
          { label: 'Buat Broadcast Promo WA', action: 'gen_promo_wa' },
        ],
      };
    }

    // 4. Printer Thermal & Kendala Teknis
    if (q.includes('printer') || q.includes('cetak') || q.includes('bluetooth') || q.includes('struk')) {
      return {
        text: `Panduan Printer Thermal Bluetooth RitelQu:\n1. Pastikan Bluetooth di HP/Tablet aktif dan printer thermal 58mm/80mm menyala (lampu indikator biru/hijau stabil).\n2. Format cetak RitelQu menggunakan standar ESC/POS resmi yang kompatibel dengan printer RPP02N, Panda, Iware, Zywell, dan VSC.\n3. Jika struk keluar kosong, periksa apakah posisi kertas thermal terbalik (sisi mengkilap harus menghadap pemanas head).\n4. Anda juga bisa menggunakan simulasi struk cetak langsung dari browser via tombol "Cetak Struk".`,
        actions: [{ label: 'Tes Cetak Printer', action: 'test_print' }],
      };
    }

    // 5. Bug / Masalah Aplikasi & Customer Care
    if (q.includes('error') || q.includes('bug') || q.includes('rusak') || q.includes('bantuan') || q.includes('support') || q.includes('kendala')) {
      return {
        text: `Smart Customer Care RitelQu AI:\nJika Anda mendapati kendala teknis pada aplikasi RitelQu:\n1. Coba lakukan "Pencadangan Data (Backup JSON)" di tab Pengaturan agar data transaksi tersimpan aman.\n2. Muat ulang halaman (Refresh) jika pemindaian scanner terasa lambat.\n3. Anda dapat langsung mengklik tombol "Kirim Laporan Bug ke Support AppQu" untuk membuat draf email resmi ke support@appqu.id dengan menyertakan ID Perangkat: ${context.deviceId}.`,
        actions: [{ label: 'Draft Email Support AppQu', action: 'draft_support_email' }],
      };
    }

    // Default Retail Consultation Answer
    return {
      text: `Halo! Saya RitelQu AI, asisten pintar manajemen toko ritel Anda.\nSaya siap membantu:\n• Cek analisis stok menipis & rekomendasi re-order barang.\n• Kelola catatan bon/piutang warga secara otomatis.\n• Buat draf promosi WhatsApp & berkas katalog.html interaktif.\n• Troubleshooting kasir, scanner barcode, dan printer thermal Bluetooth.\n\nSilakan tanyakan hal apa pun seputar operasional toko kelontong Anda!`,
      actions: [
        { label: 'Cek Re-Order Stok', action: 'check_stock' },
        { label: 'Buat Draf Promo WA', action: 'gen_promo_wa' },
        { label: 'Generate kasir.html', action: 'gen_kasir' },
      ],
    };
  },

  /**
   * Smart Speech-to-Text String Fuzzy Matcher
   * Converts spoken text e.g. "Minyak goreng dua liter" -> { product, qty: 2 }
   */
  parseVoiceToCart(
    spokenText: string,
    products: RitelProduct[]
  ): VoiceMatchResult | null {
    if (!spokenText || !spokenText.trim()) return null;

    const clean = spokenText.toLowerCase().trim();

    // 1. Detect Quantity
    let qty = 1;
    const qtyPatterns: Record<string, number> = {
      'satu': 1,
      'dua': 2,
      'tiga': 3,
      'empat': 4,
      'lima': 5,
      'enam': 6,
      'tujuh': 7,
      'delapan': 8,
      'sembilan': 9,
      'sepuluh': 10,
      'lusin': 12,
      'setengah': 0.5,
    };

    // Check number words
    for (const [word, val] of Object.entries(qtyPatterns)) {
      if (clean.includes(word)) {
        qty = val;
        break;
      }
    }

    // Check direct digits e.g. "2 pouch", "3 pcs"
    const digitMatch = clean.match(/(\d+)/);
    if (digitMatch && digitMatch[1]) {
      const parsedNum = parseInt(digitMatch[1], 10);
      if (parsedNum > 0 && parsedNum <= 100) {
        qty = parsedNum;
      }
    }

    // 2. Score products based on keyword match
    let bestProduct: RitelProduct | null = null;
    let highestScore = 0;

    for (const prod of products) {
      const prodName = prod.name.toLowerCase();
      const sku = prod.sku;
      let score = 0;

      // Exact SKU match
      if (clean.includes(sku)) {
        score += 100;
      }

      // Keyword token match
      const tokens = prodName.split(/\s+/).filter((t) => t.length > 2);
      for (const token of tokens) {
        if (clean.includes(token)) {
          score += 20;
        }
      }

      // Specific known mappings
      if (clean.includes('minyak') && prodName.includes('minyak')) score += 30;
      if (clean.includes('beras') && prodName.includes('beras')) score += 30;
      if (clean.includes('gula') && prodName.includes('gula')) score += 30;
      if (clean.includes('mie') && (prodName.includes('mie') || prodName.includes('indomie'))) score += 30;
      if (clean.includes('telur') && prodName.includes('telur')) score += 30;
      if (clean.includes('kopi') && prodName.includes('kopi')) score += 30;
      if (clean.includes('gas') && (prodName.includes('gas') || prodName.includes('elpiji'))) score += 30;
      if (clean.includes('galon') && (prodName.includes('galon') || prodName.includes('aqua'))) score += 30;
      if (clean.includes('sabun') && prodName.includes('sabun')) score += 30;
      if (clean.includes('kecap') && prodName.includes('kecap')) score += 30;

      if (score > highestScore) {
        highestScore = score;
        bestProduct = prod;
      }
    }

    if (bestProduct && highestScore >= 20) {
      return {
        product: bestProduct,
        qty: Math.max(1, Math.round(qty)),
        confidence: Math.min(100, highestScore),
        originalText: spokenText,
      };
    }

    return null;
  },

  /**
   * Smart Cross-Selling Suggester
   * Recommends complementary products based on currently selected items in cart
   */
  getCrossSellRecommendations(
    cartProductIds: string[],
    allProducts: RitelProduct[]
  ): CrossSellItem[] {
    if (cartProductIds.length === 0) return [];

    const recommendations: CrossSellItem[] = [];
    const inCartSet = new Set(cartProductIds);

    // Get products in cart
    const cartProds = allProducts.filter((p) => inCartSet.has(p.id));

    for (const item of cartProds) {
      const name = item.name.toLowerCase();

      // If buying Beras or Minyak -> Recommend Telur or Kecap
      if (name.includes('beras') || name.includes('minyak')) {
        const telur = allProducts.find(
          (p) => !inCartSet.has(p.id) && p.name.toLowerCase().includes('telur')
        );
        if (telur && !recommendations.some((r) => r.product.id === telur.id)) {
          recommendations.push({
            product: telur,
            reason: 'Pasangan sembako komplit untuk kebutuhan dapur harian.',
          });
        }
      }

      // If buying Mie Instan -> Recommend Telur & Minuman
      if (name.includes('mie')) {
        const telur = allProducts.find(
          (p) => !inCartSet.has(p.id) && p.name.toLowerCase().includes('telur')
        );
        if (telur && !recommendations.some((r) => r.product.id === telur.id)) {
          recommendations.push({
            product: telur,
            reason: 'Pelengkap nikmat masak mie instan kuah/goreng.',
          });
        }
      }

      // If buying Kopi -> Recommend Gula Pasir
      if (name.includes('kopi')) {
        const gula = allProducts.find(
          (p) => !inCartSet.has(p.id) && p.name.toLowerCase().includes('gula')
        );
        if (gula && !recommendations.some((r) => r.product.id === gula.id)) {
          recommendations.push({
            product: gula,
            reason: 'Pelengkap seduh kopi manis hangat.',
          });
        }
      }
    }

    return recommendations.slice(0, 3);
  },

  /**
   * Generates WhatsApp message draft for promo broadcast
   */
  generatePromoBroadcast(
    storeName: string,
    products: RitelProduct[],
    title: string = 'Promo Berkah Warga RT 04'
  ): string {
    const promoItems = products.slice(0, 6);
    const dateStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    let msg = `*📢 ${title.toUpperCase()}*\n`;
    msg += `🏪 *${storeName}*\n`;
    msg += `🗓️ ${dateStr}\n\n`;
    msg += `Halo Bpk/Ibu Warga RT 04! Nikmati penawaran belanja hemat kebutuhan dapur hari ini:\n\n`;

    promoItems.forEach((p, idx) => {
      msg += `${idx + 1}. *${p.name}* : *Rp ${p.price.toLocaleString('id-ID')}* / ${p.unit} (Stok: ${p.stock})\n`;
    });

    msg += `\n🛵 *Bisa Pesan Antar / Siap Ambil Langsung*\n`;
    msg += `Hubungi kasir untuk order cepat. Terima kasih! 🙏\n`;
    msg += `_Sistem Kasir RitelQu powered by AppQu_`;

    return msg;
  },

  /**
   * Generates WhatsApp debt reminder message
   */
  generateDebtReminderWa(
    customer: RitelCustomer,
    storeName: string
  ): string {
    let msg = `Halo Bpk/Ibu *${customer.name}* (${customer.blockNumber}), salam hangat dari *${storeName}*.\n\n`;
    msg += `Kami ingin menginformasikan rekap catatan bon belanja yang tercatat di kasir saat ini sebesar:\n`;
    msg += `💰 *Rp ${customer.totalDebt.toLocaleString('id-ID')}*\n\n`;
    msg += `Pembayaran dapat dilakukan melalui:\n`;
    msg += `• Tunai di kasir toko\n`;
    msg += `• Transfer / QRIS Toko\n\n`;
    msg += `Terima kasih atas kerja sama dan kepercayaannya berbelanja di warung kelontong warga. Semoga berkah selalu! 🙏`;

    return msg;
  },

  /**
   * Generates Support Email Draft for bug reporting
   */
  generateCustomerCareEmail(
    issueDescription: string,
    deviceId: string,
    storeName: string
  ): { to: string; subject: string; body: string; mailtoUrl: string } {
    const to = 'support@appqu.id';
    const subject = `[Laporan Kendala RitelQu] ID: ${deviceId} - ${storeName}`;
    const body = `Halo Tim Customer Care AppQu,\n\nSaya ingin melaporkan kendala operasional pada modul RitelQu:\n\n` +
      `• Nama Toko: ${storeName}\n` +
      `• ID Perangkat: ${deviceId}\n` +
      `• Waktu Kejadian: ${new Date().toLocaleString('id-ID')}\n` +
      `• Deskripsi Kendala:\n${issueDescription}\n\n` +
      `Mohon bantuan panduan teknisnya.\nTerima kasih.`;

    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    return { to, subject, body, mailtoUrl };
  },

  /**
   * Generates structured Developer Coding Prompt for bug fix / enhancement (100% Gratis)
   */
  generateDeveloperFixPrompt(data: {
    category: string;
    description: string;
    errorLog?: string;
    stepsToReproduce?: string;
    storeName: string;
    deviceId: string;
  }): {
    promptMarkdown: string;
    emailMailto: string;
    whatsappUrl: string;
  } {
    const timestamp = new Date().toLocaleString('id-ID');
    const promptMarkdown =
`# LAPORAN MASALAH KODING APP & AUTO-PROMPT PERBAIKAN DEVELOPER (GRATIS)
## Modul: RitelQu (AppQu RT 04)
- **ID Perangkat**: ${data.deviceId}
- **Nama Toko**: ${data.storeName}
- **Kategori Kendala**: ${data.category}
- **Waktu Laporan**: ${timestamp}

### 1. Deskripsi Keluhan / Gejala Masalah:
${data.description}

${data.errorLog ? `### 2. Pesan Error / Log Teknis:\n\`\`\`\n${data.errorLog}\n\`\`\`\n` : ''}
${data.stepsToReproduce ? `### 3. Langkah Reproduksi:\n${data.stepsToReproduce}\n` : ''}
### 4. Instruksi Perbaikan Khusus Developer (AI Builder / Software Engineer):
- Telusuri berkas terkait di \`src/components/ritel/RitelQuView.tsx\`, \`src/services/storageRitel.ts\`, atau \`src/services/ritelAiService.ts\`.
- Perbaiki logika penanganan exception / rendering agar antarmuka tidak freeze atau crash.
- Pastikan tampilan responsif dan mematuhi aturan minimalist UI (gaya list border-b tanpa kotak tebal).
- Lakukan validasi menggunakan \`compile_applet\` dan \`lint_applet\` hingga 0 error.`;

    const emailSubject = `[Auto-Fix Prompt] Kendala Koding RitelQu: ${data.category} (${data.deviceId})`;
    const emailMailto = `mailto:support@appqu.id?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(promptMarkdown)}`;

    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(
      `*Laporan Koding RitelQu (${data.category})*\n\n${promptMarkdown}`
    )}`;

    return {
      promptMarkdown,
      emailMailto,
      whatsappUrl,
    };
  },
};
