import {
  KulinerSubCategory,
  KulinerMenuItem,
  KulinerOrder,
  KulinerProfile,
  KulinerCartItem,
} from '../types';

export const KULINER_STORAGE_KEY = 'kulinerqu_data_v1';

export interface KulinerAppData {
  profile: KulinerProfile;
  menu: KulinerMenuItem[];
  orders: KulinerOrder[];
  openBills: KulinerOrder[];
}

export const DEFAULT_KULINER_MENU: KulinerMenuItem[] = [
  // Presets Porsi Utama
  {
    id: 'k-1',
    name: 'Porsi Biasa',
    category: 'porsi_preset',
    portionType: 'biasa',
    price: 15000,
    cogs: 8000,
    isPreset: true,
    dailyStartingStock: 60,
    stockRemaining: 60,
    icon: '🍜',
  },
  {
    id: 'k-2',
    name: 'Porsi Jumbo',
    category: 'porsi_preset',
    portionType: 'jumbo',
    price: 22000,
    cogs: 11000,
    isPreset: true,
    dailyStartingStock: 30,
    stockRemaining: 30,
    icon: '🍲',
  },
  {
    id: 'k-3',
    name: 'Setengah Porsi',
    category: 'porsi_preset',
    portionType: 'setengah',
    price: 10000,
    cogs: 5000,
    isPreset: true,
    dailyStartingStock: 20,
    stockRemaining: 20,
    icon: '🥣',
  },
  {
    id: 'k-4',
    name: '+ Toping Telur / Tetelan',
    category: 'ekstra',
    portionType: 'toping',
    price: 4000,
    cogs: 2000,
    isPreset: true,
    icon: '🥚',
  },
  {
    id: 'k-5',
    name: '+ Pangsit Goreng / Kerupuk',
    category: 'ekstra',
    portionType: 'toping',
    price: 2000,
    cogs: 1000,
    isPreset: true,
    icon: '🥟',
  },
  {
    id: 'k-6',
    name: 'Es Teh Manis',
    category: 'minuman',
    portionType: 'custom',
    price: 4000,
    cogs: 1200,
    isPreset: true,
    icon: '🧊',
  },
  {
    id: 'k-7',
    name: 'Es Jeruk Peras',
    category: 'minuman',
    portionType: 'custom',
    price: 6000,
    cogs: 2500,
    isPreset: true,
    icon: '🍊',
  },
  {
    id: 'k-8',
    name: 'Teh Hangat / Tawar',
    category: 'minuman',
    portionType: 'custom',
    price: 2000,
    cogs: 500,
    isPreset: true,
    icon: '🍵',
  },
];

export const DEFAULT_KULINER_PROFILE: KulinerProfile = {
  storeName: 'KulinerQu Gerobak Berkah RT 04',
  ownerName: 'Pak Joko / Bu Siti',
  phone: '081298765432',
  address: 'Pojok Pos Ronda RT 04 / RW 01',
  subCategory: 'mangkal_gerobak',
  dailyPortionTarget: 80,
  dailyPortionRemaining: 80,
  lastResetDate: new Date().toISOString().split('T')[0],
  qrisPayload: '00020101021126570011ID.GO.QRIS.WWW01189360091100223344555204581253033605802ID5914KULINERQU RT046007JAKARTA6304ABCD',
};

export const KulinerStorage = {
  loadData(): KulinerAppData {
    if (typeof window === 'undefined') {
      return {
        profile: DEFAULT_KULINER_PROFILE,
        menu: DEFAULT_KULINER_MENU,
        orders: [],
        openBills: [],
      };
    }

    try {
      const raw = localStorage.getItem(KULINER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure today's portion countdown sync
        const todayStr = new Date().toISOString().split('T')[0];
        let profile = parsed.profile || DEFAULT_KULINER_PROFILE;
        if (profile.lastResetDate !== todayStr) {
          profile.lastResetDate = todayStr;
          profile.dailyPortionRemaining = profile.dailyPortionTarget || 80;
        }

        return {
          profile,
          menu: parsed.menu && parsed.menu.length > 0 ? parsed.menu : DEFAULT_KULINER_MENU,
          orders: parsed.orders || [],
          openBills: parsed.openBills || [],
        };
      }
    } catch (e) {
      console.error('Failed to parse KulinerQu storage', e);
    }

    const initialData: KulinerAppData = {
      profile: DEFAULT_KULINER_PROFILE,
      menu: DEFAULT_KULINER_MENU,
      orders: [],
      openBills: [],
    };
    this.saveData(initialData);
    return initialData;
  },

  saveData(data: KulinerAppData) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(KULINER_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save KulinerQu storage', e);
    }
  },

  addOrder(order: KulinerOrder): KulinerAppData {
    const data = this.loadData();
    data.orders.unshift(order);

    // If order was an open bill, remove it from openBills
    if (order.id) {
      data.openBills = data.openBills.filter((b) => b.id !== order.id);
    }

    // Decrement daily portion remaining if items contain presets
    const portionCount = order.items
      .filter((it) => it.portionType === 'biasa' || it.portionType === 'jumbo' || it.portionType === 'setengah')
      .reduce((acc, it) => acc + it.qty, 0);

    if (portionCount > 0) {
      data.profile.dailyPortionRemaining = Math.max(0, data.profile.dailyPortionRemaining - portionCount);
    }

    this.saveData(data);
    return data;
  },

  saveOpenBill(bill: KulinerOrder): KulinerAppData {
    const data = this.loadData();
    const existingIndex = data.openBills.findIndex((b) => b.id === bill.id);
    if (existingIndex >= 0) {
      data.openBills[existingIndex] = bill;
    } else {
      data.openBills.unshift(bill);
    }
    this.saveData(data);
    return data;
  },

  removeOpenBill(billId: string): KulinerAppData {
    const data = this.loadData();
    data.openBills = data.openBills.filter((b) => b.id !== billId);
    this.saveData(data);
    return data;
  },

  updateOrder(updatedOrder: KulinerOrder): KulinerAppData {
    const data = this.loadData();
    const idx = data.orders.findIndex((o) => o.id === updatedOrder.id);
    if (idx >= 0) {
      data.orders[idx] = updatedOrder;
      this.saveData(data);
    }
    return data;
  },

  settleBon(orderId: string, paymentMethod: 'cash' | 'qris', paidAmount?: number): KulinerAppData {
    const data = this.loadData();
    const order = data.orders.find((o) => o.id === orderId);
    if (order) {
      const remainingDebt = order.total - (order.bonPaidAmount || 0);
      const payment = paidAmount !== undefined ? paidAmount : remainingDebt;
      const newPaid = (order.bonPaidAmount || 0) + payment;

      if (newPaid >= order.total) {
        order.status = 'paid';
        order.paidAt = new Date().toISOString();
        order.paymentMethod = paymentMethod;
        order.bonPaidAmount = order.total;
      } else {
        order.status = 'bon_partial';
        order.bonPaidAmount = newPaid;
      }
      this.saveData(data);
    }
    return data;
  },

  updateProfile(newProfile: Partial<KulinerProfile>): KulinerAppData {
    const data = this.loadData();
    data.profile = { ...data.profile, ...newProfile };
    this.saveData(data);
    return data;
  },

  updateMenu(newMenu: KulinerMenuItem[]): KulinerAppData {
    const data = this.loadData();
    data.menu = newMenu;
    this.saveData(data);
    return data;
  },

  exportJSON(): string {
    const data = this.loadData();
    return JSON.stringify(data, null, 2);
  },

  importJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile && parsed.menu) {
        this.saveData(parsed);
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON import', e);
    }
    return false;
  },

  resetSampleData(): KulinerAppData {
    const fresh: KulinerAppData = {
      profile: DEFAULT_KULINER_PROFILE,
      menu: DEFAULT_KULINER_MENU,
      orders: [
        {
          id: `ord-sample-1`,
          orderNumber: 'KUL-001',
          subCategory: 'mangkal_gerobak',
          orderType: 'dine_in',
          tableOrCustomer: 'Pak RT 04 (Bambang)',
          items: [
            { id: '1', menuId: 'k-1', name: 'Porsi Biasa', portionType: 'biasa', price: 15000, cogs: 8000, qty: 2, notes: 'Pedas mantap' },
            { id: '2', menuId: 'k-6', name: 'Es Teh Manis', price: 4000, cogs: 1200, qty: 2 },
          ],
          subtotal: 38000,
          discount: 0,
          total: 38000,
          cogsTotal: 18400,
          paymentMethod: 'cash',
          cashGiven: 50000,
          change: 12000,
          status: 'paid',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          paidAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: `ord-sample-2`,
          orderNumber: 'KUL-002',
          subCategory: 'mangkal_gerobak',
          orderType: 'bungkus',
          tableOrCustomer: 'Mas Doni (Blok B2)',
          items: [
            { id: '3', menuId: 'k-2', name: 'Porsi Jumbo', portionType: 'jumbo', price: 22000, cogs: 11000, qty: 1, notes: 'Tanpa Bawang' },
            { id: '4', menuId: 'k-4', name: '+ Toping Telur / Tetelan', price: 4000, cogs: 2000, qty: 1 },
          ],
          subtotal: 26000,
          discount: 0,
          total: 26000,
          cogsTotal: 13000,
          paymentMethod: 'bon',
          status: 'bon_unpaid',
          bonCustomerName: 'Mas Doni',
          bonCustomerPhone: '081398761234',
          bonCustomerAddress: 'Blok B2 No 14',
          bonDueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          bonPaidAmount: 0,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
      openBills: [
        {
          id: `bill-hold-1`,
          orderNumber: 'HLD-01',
          subCategory: 'kios_ruko',
          orderType: 'dine_in',
          tableOrCustomer: 'Meja 04 (Keluarga Pak Budi)',
          items: [
            { id: 'h1', menuId: 'k-1', name: 'Porsi Biasa', portionType: 'biasa', price: 15000, cogs: 8000, qty: 3, notes: 'Kuah Pisah' },
            { id: 'h2', menuId: 'k-7', name: 'Es Jeruk Peras', price: 6000, cogs: 2500, qty: 3 },
          ],
          subtotal: 63000,
          discount: 0,
          total: 63000,
          cogsTotal: 31500,
          paymentMethod: 'cash',
          status: 'open_bill',
          kitchenNotes: 'Meja 04: 3 Porsi Kuah Pisah, jangan lupa sendok garpu',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
    };
    this.saveData(fresh);
    return fresh;
  },

  // Audio synthesizer for crisp checkout / tap feedback without external media files
  playBeep(type: 'tap' | 'cash' | 'alert' | 'voice') {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tap') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.start();
        osc.stop(ctx.currentTime + 0.07);
      } else if (type === 'cash') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.26);
      } else if (type === 'alert') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(330, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.32);
      } else if (type === 'voice') {
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      }
    } catch {}
  },
};
