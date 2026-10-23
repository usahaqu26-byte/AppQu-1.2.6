import {
  ChatMessage,
  ChatThread,
  SOSHistoryRecord,
  ChatReportRecord,
  UserProfile,
} from '../types';

const DB_NAME = 'AppQu_LocalChat_DB';
const DB_VERSION = 1;

// BroadcastChannel for zero-server real-time relay across tabs/components
const getChatBroadcastChannel = (): BroadcastChannel | null => {
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      return new BroadcastChannel('appqu_chat_bus');
    }
  } catch (e) {
    console.warn('BroadcastChannel not supported or blocked in this environment:', e);
  }
  return null;
};
const chatBroadcastChannel = getChatBroadcastChannel();

// Initial Seed Data for AppQu Hyperlocal Ecosystem
const SEED_THREADS: ChatThread[] = [
  {
    id: 'thread_usaha_bakso',
    title: 'Warung Bakso Mas Bro (Lapak RT 04)',
    subtitle: 'Transaksi UsahaQu • Auto-Purge 24 Jam',
    type: 'transaksi',
    subType: 'usaha',
    targetId: 'biz_bakso',
    targetPhoneRaw: '081288889999',
    isPhoneMasked: true,
    participantNames: ['Warung Bakso Mas Bro', 'Pak Budi'],
    lastMessage: 'Siap Pak, 2 porsi Bakso Beranak sedang dibungkus kuah pisah ya!',
    lastMessageTime: '10:14',
    unreadCount: 1,
    avatarText: '🍲',
    avatarColor: 'bg-amber-600',
    status: 'active',
    purgeAfterHours: 24,
  },
  {
    id: 'thread_transport_slamet',
    title: 'Kang Slamet (Driver Ojek & Kurir RT)',
    subtitle: 'TransportasiQu • Antar Galon & Penumpang',
    type: 'transaksi',
    subType: 'transportasi',
    targetId: 'driver_slamet',
    targetPhoneRaw: '085711223344',
    isPhoneMasked: true,
    participantNames: ['Kang Slamet', 'Pak Budi'],
    lastMessage: 'Saya sudah di depan Pos Ronda RT 04 mas.',
    lastMessageTime: '09:45',
    unreadCount: 0,
    avatarText: '🛵',
    avatarColor: 'bg-teal-600',
    status: 'active',
    purgeAfterHours: 24,
  },
  {
    id: 'thread_grup_rt04',
    title: 'Grup Warga & Paguyuban RT 04 / RW 09',
    subtitle: 'Komunitas Resmi • Zonasi Terverifikasi',
    type: 'komunitas',
    subType: 'grup_rt',
    targetPhoneRaw: '081234567890',
    isPhoneMasked: false,
    participantNames: ['Pak RT Mulyono', 'Pak Budi', 'Bu Siti', 'Hansip Wawan'],
    lastMessage: 'Pengingat: Jadwal ronda malam ini gilirian Blok C & D.',
    lastMessageTime: '08:30',
    unreadCount: 2,
    avatarText: '🏘️',
    avatarColor: 'bg-emerald-700',
    status: 'active',
  },
  {
    id: 'thread_private_rt',
    title: 'Pak RT Mulyono (Ketua RT 04)',
    subtitle: 'Private Warga Terverifikasi',
    type: 'komunitas',
    subType: 'warga_private',
    targetId: 'usr_rt_01',
    targetPhoneRaw: '081299991111',
    isPhoneMasked: true,
    participantNames: ['Pak RT Mulyono', 'Pak Budi'],
    lastMessage: 'Berkas surat pengantar domisili sudah saya tanda tangani ya mas.',
    lastMessageTime: 'Kemarin',
    unreadCount: 0,
    avatarText: '👨‍💼',
    avatarColor: 'bg-indigo-600',
    status: 'active',
  },
  {
    id: 'thread_sos_darurat_01',
    title: '🚨 DARURAT RT 04: Percobaan Curanmor',
    subtitle: 'Auto Ephemeral Room • Rekap BAP Siap Ekspor',
    type: 'sos',
    subType: 'sos_darurat',
    targetPhoneRaw: '081211112222',
    isPhoneMasked: false,
    participantNames: ['Hansip Wawan (Pelapor)', 'Semua Warga RT 04', 'Babinsa Pak Joko'],
    lastMessage: 'Pelaku 2 orang kabur ke arah barat gang 3. Warga harap kunci portal.',
    lastMessageTime: '02:15',
    unreadCount: 0,
    avatarText: '🚨',
    avatarColor: 'bg-red-600',
    status: 'selesai',
    completedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    purgeAfterHours: 72,
    sosMetadata: {
      gpsLat: -6.2146,
      gpsLng: 106.8451,
      locationDesc: 'Dekat Pos Kamling Blok B RT 04',
      incidentType: 'Percobaan Pencurian Motor',
      triggerTime: '02:10 WIB',
      voiceTranscript: 'Tolong warga ada 2 orang mencurigakan coba bobol gembok motor beat merah di depan pos ronda.',
      audioRecordedUrl: 'mock_audio_sos_15s',
      bapExported: true,
      escalatedToAparat: true,
    },
  },
];

const SEED_MESSAGES: ChatMessage[] = [
  // Usaha Mas Bro
  {
    id: 'msg_u_1',
    threadId: 'thread_usaha_bakso',
    senderId: 'usr_budi',
    senderName: 'Pak Budi',
    senderRole: 'Warga',
    senderPhoneRaw: '081234567890',
    senderPhoneMasked: '0812-••••-7890',
    text: 'Halo Mas Bro, apakah Bakso Beranak masih ada stok 2 porsi?',
    timestamp: '10:12',
    isMe: true,
    status: 'read',
  },
  {
    id: 'msg_u_2',
    threadId: 'thread_usaha_bakso',
    senderId: 'biz_bakso',
    senderName: 'Warung Bakso Mas Bro',
    senderRole: 'Pedagang Lapak RT',
    senderPhoneRaw: '081288889999',
    senderPhoneMasked: '0812-••••-9999',
    text: 'Siap Pak, 2 porsi Bakso Beranak sedang dibungkus kuah pisah ya! Mau diantar kurir Kang Slamet atau ambil sendiri?',
    timestamp: '10:14',
    isMe: false,
    status: 'read',
  },

  // Transportasi Kang Slamet
  {
    id: 'msg_t_1',
    threadId: 'thread_transport_slamet',
    senderId: 'usr_budi',
    senderName: 'Pak Budi',
    senderRole: 'Warga',
    senderPhoneRaw: '081234567890',
    senderPhoneMasked: '0812-••••-7890',
    text: 'Kang Slamet, tolong ambil pesanan bakso di Mas Bro dan antar ke Blok B No. 4 ya.',
    timestamp: '09:40',
    isMe: true,
    status: 'read',
  },
  {
    id: 'msg_t_2',
    threadId: 'thread_transport_slamet',
    senderId: 'driver_slamet',
    senderName: 'Kang Slamet',
    senderRole: 'Driver / Kurir RT',
    senderPhoneRaw: '085711223344',
    senderPhoneMasked: '0857-••••-3344',
    text: 'Saya sudah di depan Pos Ronda RT 04 mas. Menuju ke warung Mas Bro sekarang.',
    timestamp: '09:45',
    isMe: false,
    status: 'read',
  },

  // Grup RT 04
  {
    id: 'msg_g_1',
    threadId: 'thread_grup_rt04',
    senderId: 'usr_rt_01',
    senderName: 'Pak RT Mulyono',
    senderRole: 'Ketua RT 04',
    senderPhoneRaw: '081299991111',
    senderPhoneMasked: '0812-••••-1111',
    text: 'Assalamu alaikum warga RT 04, mohon kerja bakti pembersihan selokan hari Minggu jam 07:00.',
    timestamp: '08:15',
    isMe: false,
    status: 'read',
  },
  {
    id: 'msg_g_2',
    threadId: 'thread_grup_rt04',
    senderId: 'usr_rt_01',
    senderName: 'Pak RT Mulyono',
    senderRole: 'Ketua RT 04',
    senderPhoneRaw: '081299991111',
    senderPhoneMasked: '0812-••••-1111',
    text: 'Pengingat: Jadwal ronda malam ini gilirian Blok C & D.',
    timestamp: '08:30',
    isMe: false,
    status: 'read',
  },

  // SOS Ephemeral Chat
  {
    id: 'msg_s_1',
    threadId: 'thread_sos_darurat_01',
    senderId: 'usr_hansip_01',
    senderName: 'Hansip Wawan (Pelapor)',
    senderRole: 'Keamanan RT',
    senderPhoneRaw: '081211112222',
    senderPhoneMasked: '0812-••••-2222',
    text: '🚨 PERINGATAN DARURAT: Percobaan Curanmor di Blok B RT 04!',
    timestamp: '02:10',
    isMe: false,
    status: 'read',
  },
  {
    id: 'msg_s_2',
    threadId: 'thread_sos_darurat_01',
    senderId: 'usr_hansip_01',
    senderName: 'Hansip Wawan (Pelapor)',
    senderRole: 'Keamanan RT',
    text: '🎙️ [Smart Rekaman 15 Detik & Auto-Text]: "Tolong warga ada 2 orang mencurigakan coba bobol gembok motor beat merah di depan pos ronda."',
    isSpeechTranscript: true,
    audioDurationSec: 15,
    timestamp: '02:11',
    isMe: false,
    status: 'read',
  },
  {
    id: 'msg_s_3',
    threadId: 'thread_sos_darurat_01',
    senderId: 'usr_hansip_01',
    senderName: 'Hansip Wawan',
    senderRole: 'Keamanan RT',
    text: 'Pelaku 2 orang kabur ke arah barat gang 3. Warga harap kunci portal.',
    timestamp: '02:15',
    isMe: false,
    status: 'read',
  },
];

const SEED_SOS_HISTORY: SOSHistoryRecord[] = [
  {
    id: 'sos_hist_2026_01',
    threadId: 'thread_sos_darurat_01',
    incidentType: 'Percobaan Pencurian Sepeda Motor',
    reporterName: 'Wawan Prasetyo (Hansip RT 04)',
    reporterPhone: '081211112222',
    rtRw: 'RT 04 / RW 09',
    timestamp: '21 Oktober 2026, 02:10:15 WIB',
    gps: { lat: -6.2146, lng: 106.8451 },
    locationDesc: 'Pos Kamling Blok B, Depan Rumah No. 12 RT 04',
    audioTranscript: 'Tolong warga ada 2 orang mencurigakan coba bobol gembok motor beat merah di depan pos ronda.',
    audioDurationSec: 15,
    resolvedAt: '21 Oktober 2026, 03:00:00 WIB',
    actionsTaken: [
      'Alarm sirine dibunyikan ke 48 HP warga 1 RT',
      'Portal gang 1, 2, dan 3 ditutup oleh warga',
      'Pelaku kabur tanpa membawa barang bukti',
      'Laporan diteruskan ke Bhabinkamtibmas Polsek Setempat',
    ],
    status: 'eskalasi_aparat',
    bapDocumentText: `BERITA ACARA PEMERIKSAAN & LAPORAN INSIDEN DARURAT RT 04 / RW 09
Nomor: BAP-SOS/RT04-RW09/X/2026-001
Tanggal Kejadian: 21 Oktober 2026 Pukul 02:10 WIB

I. IDENTITAS PELAPOR
Nama: Wawan Prasetyo (Status: Warga Sah Terverifikasi RT 04)
Jabatan: Petugas Keamanan / Hansip Pos Ronda
Koordinat GPS HP: -6.2146, 106.8451 (Akurasi: ±3 meter)

II. URAIAN SINGKAT KEJADIAN
Telah terjadi percobaan pencurian kendaraan bermotor (Honda Beat Merah) oleh 2 orang pria tak dikenal. Pelapor mengaktifkan Panic Button RT AppQu selama 3 detik.

III. BUKTI ELEKTRONIK & TRANSKRIP
- Rekaman Suara 15 Detik (Ukuran <100 KB, format audio/ogg)
- Transkripsi Web Speech API: "Tolong warga ada 2 orang mencurigakan coba bobol gembok motor beat merah di depan pos ronda."
- Broadcast Alarm: Diterima oleh 48 gawai warga dan 2 personil Bhabinkamtibmas/Babinsa.

IV. TINDAKAN PENGURUS RT
1. Menutup portal keamanan lingkungan.
2. Penyerahan berkas rekap digital ini kepada Polsek setempat untuk penyelidikan lanjutan.

Mengetahui,
Ketua RT 04 / RW 09: Mulyono Sujatmiko
Bhabinkamtibmas: Aiptu Bambang H.`,
    archivedToIndexedDBAt: new Date().toISOString(),
  },
];

export class AppQuChatStorage {
  private static dbPromise: Promise<IDBDatabase> | null = null;
  private static memoryThreads: ChatThread[] = [...SEED_THREADS];
  private static memoryMessages: ChatMessage[] = [...SEED_MESSAGES];
  private static memorySOSHistory: SOSHistoryRecord[] = [...SEED_SOS_HISTORY];
  private static memoryReports: ChatReportRecord[] = [];

  // ==========================================
  // 1. OPEN / INITIALIZE INDEXEDDB
  // ==========================================
  private static async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB not supported, falling back to memory/localStorage.');
      return Promise.reject(new Error('IndexedDB not supported'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store: threads
        if (!db.objectStoreNames.contains('threads')) {
          db.createObjectStore('threads', { keyPath: 'id' });
        }

        // Store: messages
        if (!db.objectStoreNames.contains('messages')) {
          const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
          msgStore.createIndex('threadId', 'threadId', { unique: false });
        }

        // Store: sos_records (Permanent offline history for police BAP)
        if (!db.objectStoreNames.contains('sos_records')) {
          db.createObjectStore('sos_records', { keyPath: 'id' });
        }

        // Store: reports
        if (!db.objectStoreNames.contains('reports')) {
          const reportStore = db.createObjectStore('reports', { keyPath: 'id' });
          reportStore.createIndex('reportedUserId', 'reportedUserId', { unique: false });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        resolve(db);
      };

      request.onerror = (e) => {
        console.error('Failed to open AppQu IndexedDB:', e);
        reject(e);
      };
    });

    // Seed initial data if newly created
    try {
      const db = await this.dbPromise;
      await this.ensureSeedData(db);
    } catch (e) {
      console.warn('Seed initial check skipped or failed:', e);
    }

    return this.dbPromise;
  }

  private static async ensureSeedData(db: IDBDatabase): Promise<void> {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(['threads', 'messages', 'sos_records'], 'readwrite');
        const threadStore = tx.objectStore('threads');
        const countReq = threadStore.count();

        countReq.onsuccess = () => {
          if (countReq.result === 0) {
            SEED_THREADS.forEach((t) => threadStore.put(t));
            const msgStore = tx.objectStore('messages');
            SEED_MESSAGES.forEach((m) => msgStore.put(m));
            const sosStore = tx.objectStore('sos_records');
            SEED_SOS_HISTORY.forEach((s) => sosStore.put(s));
          }
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  // ==========================================
  // 2. THREADS CRUD
  // ==========================================
  public static async getThreads(): Promise<ChatThread[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('threads', 'readonly');
        const store = tx.objectStore('threads');
        const req = store.getAll();
        req.onsuccess = () => {
          const result: ChatThread[] = req.result || [];
          if (result.length === 0) {
            resolve([...this.memoryThreads]);
          } else {
            this.memoryThreads = result;
            resolve(result);
          }
        };
        req.onerror = () => resolve([...this.memoryThreads]);
      });
    } catch {
      // Fallback
      const cached = localStorage.getItem('appqu_chat_threads');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
      return [...this.memoryThreads];
    }
  }

  public static async saveThread(thread: ChatThread): Promise<void> {
    this.memoryThreads = this.memoryThreads.filter((t) => t.id !== thread.id);
    this.memoryThreads.unshift(thread);
    try {
      localStorage.setItem('appqu_chat_threads', JSON.stringify(this.memoryThreads));
      const db = await this.getDB();
      const tx = db.transaction('threads', 'readwrite');
      tx.objectStore('threads').put(thread);
    } catch {}

    // Broadcast update
    this.broadcast({ type: 'THREAD_UPDATED', thread });
  }

  // ==========================================
  // 3. MESSAGES CRUD
  // ==========================================
  public static async getMessages(threadId: string): Promise<ChatMessage[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('messages', 'readonly');
        const store = tx.objectStore('messages');
        const index = store.index('threadId');
        const req = index.getAll(threadId);
        req.onsuccess = () => {
          const res = req.result || [];
          if (res.length === 0) {
            const mem = this.memoryMessages.filter((m) => m.threadId === threadId);
            resolve(mem);
          } else {
            resolve(res);
          }
        };
        req.onerror = () => {
          const mem = this.memoryMessages.filter((m) => m.threadId === threadId);
          resolve(mem);
        };
      });
    } catch {
      return this.memoryMessages.filter((m) => m.threadId === threadId);
    }
  }

  public static async sendMessage(msg: ChatMessage): Promise<void> {
    this.memoryMessages.push(msg);

    try {
      const db = await this.getDB();
      const tx = db.transaction(['messages', 'threads'], 'readwrite');
      tx.objectStore('messages').put(msg);

      // Update thread lastMessage & time
      const threadStore = tx.objectStore('threads');
      const getThreadReq = threadStore.get(msg.threadId);
      getThreadReq.onsuccess = () => {
        const thread: ChatThread = getThreadReq.result;
        if (thread) {
          thread.lastMessage = msg.isSpeechTranscript ? `🎙️ ${msg.text}` : (msg.text || (msg.imageUrl ? '📷 Foto (<100KB)' : '🎙️ Pesan Suara'));
          thread.lastMessageTime = msg.timestamp;
          threadStore.put(thread);
        }
      };
    } catch {
      // Memory fallback
      const idx = this.memoryThreads.findIndex((t) => t.id === msg.threadId);
      if (idx !== -1) {
        this.memoryThreads[idx].lastMessage = msg.text;
        this.memoryThreads[idx].lastMessageTime = msg.timestamp;
      }
    }

    // Broadcast to other tabs/listeners
    this.broadcast({ type: 'NEW_MESSAGE', message: msg });
  }

  // ==========================================
  // 4. TRANSACTION FINISH & AUTO-PURGE
  // ==========================================
  public static async markTransactionDone(threadId: string): Promise<ChatThread | null> {
    const threads = await this.getThreads();
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return null;

    thread.status = 'selesai';
    thread.completedAt = new Date().toISOString();
    thread.purgeAfterHours = 24; // Default 24 jam auto-purge

    await this.saveThread(thread);

    // Kirim pesan sistem auto-purge notice
    const purgeNoticeMsg: ChatMessage = {
      id: `sys_purge_${Date.now()}`,
      threadId,
      senderId: 'system',
      senderName: 'Sistem AppQu',
      senderRole: 'Auto-Purge Robot',
      text: '✅ Transaksi telah ditandai Selesai. Sesuai prinsip RAM 1 GB & Biaya Rp 0, riwayat obrolan ini akan otomatis dihapus permanen dari HP dalam 24–48 jam.',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isMe: false,
      status: 'read',
    };
    await this.sendMessage(purgeNoticeMsg);

    return thread;
  }

  // Run auto-purge cleanup of expired transactions (24-48 hours)
  public static async autoPurgeExpired(): Promise<{ purgedThreadsCount: number; purgedMessagesCount: number }> {
    let purgedThreads = 0;
    let purgedMsgs = 0;
    const now = Date.now();

    const threads = await this.getThreads();
    for (const thread of threads) {
      if (thread.status === 'selesai' && thread.completedAt && thread.purgeAfterHours) {
        const completedTime = new Date(thread.completedAt).getTime();
        const expirationMs = thread.purgeAfterHours * 3600 * 1000;

        if (now - completedTime > expirationMs) {
          // Purge messages
          try {
            const db = await this.getDB();
            const tx = db.transaction(['messages', 'threads'], 'readwrite');
            const msgStore = tx.objectStore('messages');
            const index = msgStore.index('threadId');
            const req = index.getAllKeys(thread.id);
            req.onsuccess = () => {
              (req.result || []).forEach((k) => msgStore.delete(k));
            };
            // Mark thread as purged
            thread.isAutoPurged = true;
            tx.objectStore('threads').put(thread);
          } catch {}

          this.memoryMessages = this.memoryMessages.filter((m) => m.threadId !== thread.id);
          thread.isAutoPurged = true;
          purgedThreads++;
        }
      }
    }

    return { purgedThreadsCount: purgedThreads, purgedMessagesCount: purgedMsgs };
  }

  // ==========================================
  // 5. PERMANENT SOS LOCAL HISTORY (BAP EVIDENCE)
  // ==========================================
  public static async getSOSHistory(): Promise<SOSHistoryRecord[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('sos_records', 'readonly');
        const store = tx.objectStore('sos_records');
        const req = store.getAll();
        req.onsuccess = () => {
          const res = req.result || [];
          if (res.length === 0) resolve([...this.memorySOSHistory]);
          else resolve(res);
        };
        req.onerror = () => resolve([...this.memorySOSHistory]);
      });
    } catch {
      return [...this.memorySOSHistory];
    }
  }

  public static async saveSOSRecord(record: SOSHistoryRecord): Promise<void> {
    this.memorySOSHistory.unshift(record);
    try {
      const db = await this.getDB();
      const tx = db.transaction('sos_records', 'readwrite');
      tx.objectStore('sos_records').put(record);
    } catch {}

    this.broadcast({ type: 'SOS_RECORD_SAVED', record });
  }

  // ==========================================
  // 6. CLIENT-SIDE IMAGE COMPRESSION (< 100 KB)
  // ==========================================
  public static async compressImage(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max resolution 800px to maintain <100KB footprint and low RAM
          const MAX_DIM = 800;
          if (width > height && width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Attempt WebP or JPEG with quality 0.65
          let quality = 0.65;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);

          // Check byte size (~ 4/3 of dataURL length)
          let approxBytes = Math.round((dataUrl.length * 3) / 4);
          if (approxBytes > 95000) {
            quality = 0.45;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ==========================================
  // 7. PHONE NUMBER MASKING HELPER
  // ==========================================
  public static maskPhone(phone: string): string {
    if (!phone) return '08••-••••-••••';
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 8) return clean;
    const prefix = clean.slice(0, 4);
    const suffix = clean.slice(-4);
    return `${prefix}-••••-${suffix}`;
  }

  // ==========================================
  // 8. BLOCK & REPORT SYSTEM (3 Laporan = Freeze)
  // ==========================================
  public static async reportUser(
    reportedUserId: string,
    reportedUserName: string,
    reporter: UserProfile,
    reason: string
  ): Promise<{ totalReports: number; isFrozen: boolean }> {
    const reportItem: ChatReportRecord = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reportedUserId,
      reportedUserName,
      reporterId: reporter.id,
      reporterName: reporter.name,
      reason,
      timestamp: new Date().toISOString(),
    };

    this.memoryReports.push(reportItem);

    try {
      const db = await this.getDB();
      const tx = db.transaction('reports', 'readwrite');
      tx.objectStore('reports').put(reportItem);
    } catch {}

    const totalReports = this.memoryReports.filter(
      (r) => r.reportedUserId === reportedUserId
    ).length;

    const isFrozen = totalReports >= 3;
    if (isFrozen) {
      // Freeze all threads involving this user
      this.memoryThreads.forEach((t) => {
        if (t.targetId === reportedUserId) {
          t.status = 'blocked';
        }
      });
    }

    return { totalReports, isFrozen };
  }

  public static isUserFrozen(userId: string): boolean {
    const count = this.memoryReports.filter((r) => r.reportedUserId === userId).length;
    return count >= 3;
  }

  // ==========================================
  // 9. WHATSAPP DEEP LINK GENERATOR
  // ==========================================
  public static getWhatsAppDeepLink(phone: string, text: string = ''): string {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    const encoded = encodeURIComponent(text);
    return `https://wa.me/${clean}?text=${encoded}`;
  }

  // ==========================================
  // 10. REALTIME BROADCAST DISPATCHER
  // ==========================================
  private static broadcast(payload: any) {
    if (chatBroadcastChannel) {
      try {
        chatBroadcastChannel.postMessage(payload);
      } catch {}
    }
    // Also dispatch to local window for single tab reactive components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('appqu_chat_event', { detail: payload }));
    }
  }

  public static subscribe(callback: (payload: any) => void): () => void {
    const handleBroadcast = (ev: MessageEvent) => {
      callback(ev.data);
    };
    const handleCustom = (ev: Event) => {
      callback((ev as CustomEvent).detail);
    };

    if (chatBroadcastChannel) {
      chatBroadcastChannel.addEventListener('message', handleBroadcast);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('appqu_chat_event', handleCustom);
    }

    return () => {
      if (chatBroadcastChannel) {
        chatBroadcastChannel.removeEventListener('message', handleBroadcast);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('appqu_chat_event', handleCustom);
      }
    };
  }
}
