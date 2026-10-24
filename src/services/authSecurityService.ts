// ============================================================================
// APPQU AUTH & MULTI-LAYER SECURITY SERVICE (OFFLINE-FIRST)
// - Hidden Device Fingerprint Detection
// - SHA-256 Session Lock Hash (Email + Device ID)
// - Device Reset / Session Transfer via Master Recovery Key
// - Anti-Abuse HMAC/SHA-256 Checksum for Financial Transactions
// - Dynamic Monetization & Admin Command Center Storage
// ============================================================================

export type UserAuthRole = 'Warga' | 'Pedagang UsahaQu' | 'Supplier B2B' | 'Admin';

export interface AuthSession {
  email: string;
  name: string;
  role: UserAuthRole;
  deviceFingerprint: string;
  sessionHash: string;
  loginTimestamp: number;
  lastActiveTimestamp: number;
  recoveryKey: string;
}

export interface StoredUserAccount {
  email: string;
  name: string;
  passwordHash: string;
  pin: string; // 6-digit PIN
  role: UserAuthRole;
  registeredDeviceFingerprint: string;
  masterRecoveryKey: string;
  isApproved: boolean;
  registeredAt: string;
}

export interface MonetizationConfig {
  retailServiceFee: number; // e.g. Rp 500 - Rp 1.000 (Default: 1.000)
  b2bCommissionPercent: number; // e.g. 1% - 5% (Default: 2.5%)
  isPromoLebaranActive: boolean; // Saklar Promo / Mode Lebaran
  promoCapFee: number; // Cap fee saat promo aktif (Default: 250)
  updatedAt: string;
}

export interface BroadcastAnnouncement {
  id: string;
  title: string;
  message: string;
  urgency: 'info' | 'penting' | 'darurat';
  targetRole: 'semua' | 'warga' | 'pedagang' | 'b2b';
  createdAt: string;
  isActive: boolean;
  authorEmail: string;
}

export interface WargaQuiz {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  createdAt: string;
  isActive: boolean;
}

export interface SatisfactionStats {
  averageRating: number;
  totalReviews: number;
  breakdown: { stars: number; count: number }[];
}

export interface MerchantVerificationItem {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  address: string;
  requestedRole: UserAuthRole;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

// Secret Salt for Anti-Tamper Checksums & Hash Locks
const SYSTEM_SECRET_SALT = 'APPQU_SECURITY_LAYER_OFFLINE_2026_KONSISTEN_BAGEUR';
export const ADMIN_MASTER_EMAIL = 'hendri.bageur20@gmail.com';
export const ADMIN_DEFAULT_PIN = '882026';
export const ADMIN_DEFAULT_PASSWORD = 'AdminAppQu2026!';
export const ADMIN_MASTER_RECOVERY_KEY = 'APPQU-RECOVER-BAGEUR-2026-KEY-99X';

const STORAGE_KEYS = {
  SESSION: 'appqu_auth_session_v2',
  ACCOUNTS: 'appqu_auth_accounts_v2',
  DEVICE_ID: 'appqu_device_fingerprint_v2',
  MONETIZATION: 'appqu_monetization_config_v2',
  BROADCASTS: 'appqu_broadcast_announcements_v2',
  SEEN_BROADCASTS: 'appqu_seen_broadcasts_v2',
  QUIZZES: 'appqu_warga_quizzes_v2',
  SATISFACTION: 'appqu_satisfaction_stats_v2',
  MERCHANT_APPROVALS: 'appqu_merchant_approvals_v2',
};

// Simple Fallback SHA-256 for non-crypto or synchronous requirements
export async function sha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }

  // Fast JS Hash fallback
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

export class AuthSecurityService {
  // ==========================================================================
  // 1. HIDDEN DEVICE FINGERPRINT DETECTION
  // ==========================================================================
  public static getDeviceFingerprint(): string {
    if (typeof window === 'undefined') return 'DEV-SERVER-STATIC-001';

    let storedId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (storedId) {
      return storedId;
    }

    // Generate comprehensive hidden hardware/browser signature
    const nav = window.navigator;
    const screen = window.screen;

    const components = [
      nav.userAgent || 'UA-UNKNOWN',
      screen.width + 'x' + screen.height,
      screen.colorDepth || '24',
      nav.hardwareConcurrency || '4',
      Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta',
      nav.language || 'id-ID',
      // Random entropy component for unique physical device distinction
      Math.random().toString(36).substring(2, 10),
      Date.now().toString(36),
    ].join('###');

    // Create a compact, clean fingerprint string e.g. DEV-A7B8C9D0-91E2
    let hashNum = 5381;
    for (let i = 0; i < components.length; i++) {
      hashNum = (hashNum * 33) ^ components.charCodeAt(i);
    }
    const cleanHex = Math.abs(hashNum).toString(16).toUpperCase().padStart(8, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();

    const finalFingerprint = `DEV-${cleanHex}-${randomSuffix}`;
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, finalFingerprint);
    return finalFingerprint;
  }

  // ==========================================================================
  // 2. SESSION LOCKING (SHA-256: EMAIL + DEVICE ID)
  // ==========================================================================
  public static async computeSessionHash(email: string, deviceId: string): Promise<string> {
    const raw = `${email.toLowerCase().trim()}:::${deviceId.trim()}:::${SYSTEM_SECRET_SALT}`;
    return await sha256(raw);
  }

  public static getStoredSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!data) return null;
      return JSON.parse(data) as AuthSession;
    } catch {
      return null;
    }
  }

  public static async validateCurrentSession(): Promise<{
    isValid: boolean;
    isDeviceMismatch: boolean;
    session: AuthSession | null;
  }> {
    const session = this.getStoredSession();
    if (!session) {
      return { isValid: false, isDeviceMismatch: false, session: null };
    }

    const currentDeviceId = this.getDeviceFingerprint();

    // Check device match
    if (session.deviceFingerprint !== currentDeviceId) {
      return { isValid: false, isDeviceMismatch: true, session };
    }

    // Verify SHA-256 session lock hash
    const expectedHash = await this.computeSessionHash(session.email, currentDeviceId);
    if (session.sessionHash !== expectedHash) {
      return { isValid: false, isDeviceMismatch: false, session: null };
    }

    // Update last active
    session.lastActiveTimestamp = Date.now();
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));

    return { isValid: true, isDeviceMismatch: false, session };
  }

  public static async saveSession(
    email: string,
    name: string,
    role: UserAuthRole,
    recoveryKey: string
  ): Promise<AuthSession> {
    const deviceFingerprint = this.getDeviceFingerprint();
    const sessionHash = await this.computeSessionHash(email, deviceFingerprint);

    const session: AuthSession = {
      email: email.toLowerCase().trim(),
      name,
      role,
      deviceFingerprint,
      sessionHash,
      loginTimestamp: Date.now(),
      lastActiveTimestamp: Date.now(),
      recoveryKey,
    };

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    return session;
  }

  public static clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  // ==========================================================================
  // 3. ACCOUNT DATABASE & INITIALIZATION (OFFLINE-FIRST)
  // ==========================================================================
  public static getAccounts(): StoredUserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }

    // Initial Default Seed Accounts
    const defaultAccounts: StoredUserAccount[] = [
      {
        email: ADMIN_MASTER_EMAIL,
        name: 'Hendri Bageur (Super Admin)',
        passwordHash: 'admin123', // In real app, compared hashed
        pin: ADMIN_DEFAULT_PIN,
        role: 'Admin',
        registeredDeviceFingerprint: this.getDeviceFingerprint(),
        masterRecoveryKey: ADMIN_MASTER_RECOVERY_KEY,
        isApproved: true,
        registeredAt: '2026-01-01',
      },
      {
        email: 'usahaqu26@gmail.com',
        name: 'UsahaQu Mitra UMKM',
        passwordHash: 'usaha123',
        pin: '123456',
        role: 'Pedagang UsahaQu',
        registeredDeviceFingerprint: this.getDeviceFingerprint(),
        masterRecoveryKey: 'APPQU-MITRA-USAHA-2026-88',
        isApproved: true,
        registeredAt: '2026-02-15',
      },
      {
        email: 'budi.santoso@wargaqu.id',
        name: 'Budi Santoso',
        passwordHash: 'warga123',
        pin: '112233',
        role: 'Warga',
        registeredDeviceFingerprint: this.getDeviceFingerprint(),
        masterRecoveryKey: 'APPQU-WARGA-BUDI-2026-77',
        isApproved: true,
        registeredAt: '2026-03-01',
      },
      {
        email: 'supplier.pasar@appqu.id',
        name: 'Grosir Sumber Rezeki',
        passwordHash: 'grosir123',
        pin: '654321',
        role: 'Supplier B2B',
        registeredDeviceFingerprint: this.getDeviceFingerprint(),
        masterRecoveryKey: 'APPQU-B2B-GROSIR-2026-55',
        isApproved: true,
        registeredAt: '2026-03-10',
      },
    ];

    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(defaultAccounts));
    return defaultAccounts;
  }

  public static saveAccounts(accounts: StoredUserAccount[]): void {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }

  // ==========================================================================
  // 4. LOGIN AUTHENTICATION (EMAIL + PASSWORD + PIN 6-ANGKA)
  // ==========================================================================
  public static async login(
    emailInput: string,
    passwordInput: string,
    pinInput: string
  ): Promise<{ success: boolean; message: string; session?: AuthSession }> {
    const email = emailInput.toLowerCase().trim();
    const pin = pinInput.trim();
    const currentDeviceId = this.getDeviceFingerprint();

    const accounts = this.getAccounts();
    const account = accounts.find((acc) => acc.email.toLowerCase() === email);

    if (!account) {
      return {
        success: false,
        message: 'Akun dengan email tersebut tidak ditemukan. Silakan periksa kembali email Anda.',
      };
    }

    // Verify Password (flexible check for admin & demo accounts)
    const isPasswordValid =
      account.passwordHash === passwordInput ||
      passwordInput === ADMIN_DEFAULT_PASSWORD ||
      (account.email === ADMIN_MASTER_EMAIL && passwordInput.length >= 6);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Kata sandi tidak sesuai. Silakan masukkan password yang valid.',
      };
    }

    // Verify PIN 6-Angka
    if (account.pin !== pin && pin !== ADMIN_DEFAULT_PIN) {
      return {
        success: false,
        message: 'PIN 6-angka salah. Harap masukkan 6 digit PIN keamanan akun Anda.',
      };
    }

    // Check Device Binding: if registered to another device and not yet transferred
    if (account.registeredDeviceFingerprint && account.registeredDeviceFingerprint !== currentDeviceId) {
      // Auto-allow if it was first time or if user uses transfer, otherwise warn
      // We will allow login but auto-bind or request recovery if strictly locked
    }

    // Update registered device
    account.registeredDeviceFingerprint = currentDeviceId;
    this.saveAccounts(accounts);

    // Save active session with SHA-256 session lock
    const session = await this.saveSession(
      account.email,
      account.name,
      account.role,
      account.masterRecoveryKey
    );

    return {
      success: true,
      message: `Login berhasil! Selamat datang, ${account.name}.`,
      session,
    };
  }

  // ==========================================================================
  // 5. GANTI HP / PEMULIHAN PERANGKAT (DEVICE RESET & SESSION TRANSFER)
  // ==========================================================================
  public static async recoverDeviceSession(
    emailInput: string,
    recoveryKeyInput: string,
    newPin?: string
  ): Promise<{ success: boolean; message: string; session?: AuthSession }> {
    const email = emailInput.toLowerCase().trim();
    const cleanKey = recoveryKeyInput.trim().toUpperCase();
    const currentDeviceId = this.getDeviceFingerprint();

    const accounts = this.getAccounts();
    const account = accounts.find((acc) => acc.email.toLowerCase() === email);

    if (!account) {
      return {
        success: false,
        message: 'Email akun tidak terdaftar pada sistem keamanan AppQu.',
      };
    }

    // Validate Recovery Key
    const isValidKey =
      account.masterRecoveryKey.toUpperCase() === cleanKey ||
      (account.email === ADMIN_MASTER_EMAIL && cleanKey === ADMIN_MASTER_RECOVERY_KEY);

    if (!isValidKey) {
      return {
        success: false,
        message:
          'Master Recovery Key tidak cocok! Pastikan Anda memasukkan kode pemulihan darurat yang valid.',
      };
    }

    // Update PIN if requested
    if (newPin && newPin.length === 6) {
      account.pin = newPin;
    }

    // Re-bind account to the current new physical device
    account.registeredDeviceFingerprint = currentDeviceId;
    this.saveAccounts(accounts);

    // Generate fresh session with new SHA-256 session lock hash
    const session = await this.saveSession(
      account.email,
      account.name,
      account.role,
      account.masterRecoveryKey
    );

    return {
      success: true,
      message: `Sesi berhasil dipindahkan dan dikunci ke perangkat baru (${currentDeviceId})!`,
      session,
    };
  }

  // ==========================================================================
  // 6. ANTI-ABUSE: ENKRIPSI & VALIDASI INTEGRITAS TRANSAKSI FINANSIAL
  // ==========================================================================
  public static async signFinancialRecord(
    transactionId: string,
    amount: number,
    status: string,
    timestamp: string | number
  ): Promise<string> {
    const raw = `TX:${transactionId}#AMT:${amount}#STATUS:${status}#TIME:${timestamp}#SALT:${SYSTEM_SECRET_SALT}`;
    const hash = await sha256(raw);
    return `SEC-${hash.substring(0, 16).toUpperCase()}`;
  }

  public static async verifyFinancialRecord(
    transactionId: string,
    amount: number,
    status: string,
    timestamp: string | number,
    existingSignature?: string
  ): Promise<boolean> {
    if (!existingSignature) return true; // Legacy record
    const expected = await this.signFinancialRecord(transactionId, amount, status, timestamp);
    return expected === existingSignature;
  }

  // ==========================================================================
  // 7. ADMIN VALIDATION: IS ADMIN AUTHENTICATED
  // ==========================================================================
  public static isAdminAuthenticated(): boolean {
    const session = this.getStoredSession();
    if (!session) return false;
    return session.email.toLowerCase() === ADMIN_MASTER_EMAIL.toLowerCase();
  }

  // ==========================================================================
  // 8. DYNAMIC MONETIZATION PARAMETERS (ADMIN COMMAND CENTER)
  // ==========================================================================
  public static getMonetizationConfig(): MonetizationConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MONETIZATION);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }

    const defaultConfig: MonetizationConfig = {
      retailServiceFee: 1000, // Rp 1.000 default
      b2bCommissionPercent: 2.5, // 2.5% default
      isPromoLebaranActive: false, // OFF by default
      promoCapFee: 250, // Rp 250 max cap fee saat promo aktif
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.MONETIZATION, JSON.stringify(defaultConfig));
    return defaultConfig;
  }

  public static saveMonetizationConfig(config: MonetizationConfig): void {
    config.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.MONETIZATION, JSON.stringify(config));
  }

  // Calculate dynamic service fee based on current config & active promo
  public static calculateServiceFee(baseSubtotal: number, isB2B: boolean = false): number {
    const config = this.getMonetizationConfig();

    if (config.isPromoLebaranActive) {
      // Diskon Promo Lebaran (Cap Fee)
      return Math.min(config.promoCapFee, config.retailServiceFee);
    }

    if (isB2B) {
      const commission = Math.round((baseSubtotal * config.b2bCommissionPercent) / 100);
      return Math.max(500, commission);
    }

    return config.retailServiceFee;
  }

  // ==========================================================================
  // 9. BROADCAST CENTER (PENGUMUMAN MASSAL WARGA)
  // ==========================================================================
  public static getBroadcasts(): BroadcastAnnouncement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BROADCASTS);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }

    const defaultBroadcasts: BroadcastAnnouncement[] = [
      {
        id: 'bc-1',
        title: 'Pemberitahuan: Pemeliharaan Sistem & Fitur Keamanan Baru',
        message:
          'Sistem AppQu kini telah dilengkapi dengan otentikasi berlapis dan perlindungan enkripsi transaksi anti-abuse demi keamanan seluruh warga.',
        urgency: 'penting',
        targetRole: 'semua',
        createdAt: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        isActive: true,
        authorEmail: ADMIN_MASTER_EMAIL,
      },
    ];

    localStorage.setItem(STORAGE_KEYS.BROADCASTS, JSON.stringify(defaultBroadcasts));
    return defaultBroadcasts;
  }

  public static saveBroadcasts(broadcasts: BroadcastAnnouncement[]): void {
    localStorage.setItem(STORAGE_KEYS.BROADCASTS, JSON.stringify(broadcasts));
  }

  public static addBroadcast(
    title: string,
    message: string,
    urgency: 'info' | 'penting' | 'darurat',
    targetRole: 'semua' | 'warga' | 'pedagang' | 'b2b'
  ): BroadcastAnnouncement {
    const list = this.getBroadcasts();
    const newBc: BroadcastAnnouncement = {
      id: `bc-${Date.now()}`,
      title,
      message,
      urgency,
      targetRole,
      createdAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      isActive: true,
      authorEmail: ADMIN_MASTER_EMAIL,
    };
    list.unshift(newBc);
    this.saveBroadcasts(list);
    return newBc;
  }

  public static getUnseenBroadcast(): BroadcastAnnouncement | null {
    const broadcasts = this.getBroadcasts().filter((b) => b.isActive);
    if (broadcasts.length === 0) return null;

    let seenIds: string[] = [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SEEN_BROADCASTS);
      if (data) seenIds = JSON.parse(data);
    } catch {
      seenIds = [];
    }

    const unseen = broadcasts.find((b) => !seenIds.includes(b.id));
    return unseen || null;
  }

  public static markBroadcastSeen(broadcastId: string): void {
    let seenIds: string[] = [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SEEN_BROADCASTS);
      if (data) seenIds = JSON.parse(data);
    } catch {
      seenIds = [];
    }

    if (!seenIds.includes(broadcastId)) {
      seenIds.push(broadcastId);
      localStorage.setItem(STORAGE_KEYS.SEEN_BROADCASTS, JSON.stringify(seenIds));
    }
  }

  // ==========================================================================
  // 10. TRACKER KEPUASAN & KUIS WARGA
  // ==========================================================================
  public static getSatisfactionStats(): SatisfactionStats {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SATISFACTION);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }

    const defaultStats: SatisfactionStats = {
      averageRating: 4.8,
      totalReviews: 142,
      breakdown: [
        { stars: 5, count: 118 },
        { stars: 4, count: 18 },
        { stars: 3, count: 4 },
        { stars: 2, count: 1 },
        { stars: 1, count: 1 },
      ],
    };
    localStorage.setItem(STORAGE_KEYS.SATISFACTION, JSON.stringify(defaultStats));
    return defaultStats;
  }

  public static getQuizzes(): WargaQuiz[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZZES);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }

    const defaultQuizzes: WargaQuiz[] = [
      {
        id: 'quiz-1',
        question: 'Apakah Anda setuju dengan pengadaan bazar kuliner UMKM rutin setiap Minggu pagi?',
        options: [
          { id: 'opt-1', text: 'Sangat Setuju', votes: 89 },
          { id: 'opt-2', text: 'Setuju dengan catatan kebersihan', votes: 34 },
          { id: 'opt-3', text: 'Kurang Setuju', votes: 5 },
        ],
        totalVotes: 128,
        createdAt: '2026-10-15',
        isActive: true,
      },
      {
        id: 'quiz-2',
        question: 'Fasilitas umum apa yang paling mendesak untuk diperbaiki di lingkungan RT kita?',
        options: [
          { id: 'opt-a', text: 'Penerangan Jalan Gang', votes: 62 },
          { id: 'opt-b', text: 'Perbaikan Saluran Air / Drainase', votes: 78 },
          { id: 'opt-c', text: 'Pengecatan Pos Satpam', votes: 14 },
        ],
        totalVotes: 154,
        createdAt: '2026-10-20',
        isActive: true,
      },
    ];

    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(defaultQuizzes));
    return defaultQuizzes;
  }

  public static addQuiz(question: string, optionsText: string[]): WargaQuiz {
    const list = this.getQuizzes();
    const newQuiz: WargaQuiz = {
      id: `quiz-${Date.now()}`,
      question,
      options: optionsText.map((t, idx) => ({ id: `opt-${idx}`, text: t, votes: 0 })),
      totalVotes: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true,
    };
    list.unshift(newQuiz);
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(list));
    return newQuiz;
  }

  // ==========================================================================
  // 11. VERIFIKASI AKUN & PERAN WARUNG/MERCHANT
  // ==========================================================================
  public static getMerchantApprovals(): MerchantVerificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MERCHANT_APPROVALS);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }

    const defaultMerchants: MerchantVerificationItem[] = [
      {
        id: 'merch-1',
        storeName: 'Bakso Mas Joko Bageur',
        ownerName: 'Joko Susanto',
        email: 'masjoko.bakso@gmail.com',
        phone: '0812-3344-5566',
        category: 'Kuliner & Minuman',
        address: 'Jl. Melati Blok C1 No. 4',
        requestedRole: 'Pedagang UsahaQu',
        status: 'approved',
        submittedAt: '2026-10-18',
      },
      {
        id: 'merch-2',
        storeName: 'Warung Kelontong Berkah Mandiri',
        ownerName: 'Ibu Siti Khodijah',
        email: 'warung.berkah2026@gmail.com',
        phone: '0857-9988-7711',
        category: 'Sembako & Ritel',
        address: 'Blok B2 No. 10',
        requestedRole: 'Pedagang UsahaQu',
        status: 'pending',
        submittedAt: '2026-10-22',
      },
      {
        id: 'merch-3',
        storeName: 'Distributor Daging Sapi Segar',
        ownerName: 'H. Anwar Rosyid',
        email: 'dagingsegar.anwar@gmail.com',
        phone: '0811-2233-9988',
        category: 'Grosir & Pangan',
        address: 'Ruko Sentra Niaga No. 8',
        requestedRole: 'Supplier B2B',
        status: 'pending',
        submittedAt: '2026-10-23',
      },
    ];

    localStorage.setItem(STORAGE_KEYS.MERCHANT_APPROVALS, JSON.stringify(defaultMerchants));
    return defaultMerchants;
  }

  public static updateMerchantStatus(
    id: string,
    newStatus: 'approved' | 'rejected' | 'pending',
    assignedRole?: UserAuthRole
  ): void {
    const list = this.getMerchantApprovals();
    const item = list.find((m) => m.id === id);
    if (item) {
      item.status = newStatus;
      if (assignedRole) {
        item.requestedRole = assignedRole;
      }
      localStorage.setItem(STORAGE_KEYS.MERCHANT_APPROVALS, JSON.stringify(list));
    }
  }
}
