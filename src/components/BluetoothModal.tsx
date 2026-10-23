import React, { useState } from 'react';
import { X, Printer, Bluetooth, RefreshCw, CheckCircle2, Info } from 'lucide-react';
import { PrinterConfig, RestaurantProfile } from '../types';
import { PrinterService } from '../services/printer';

interface BluetoothModalProps {
  isOpen: boolean;
  onClose: () => void;
  printerConfig: PrinterConfig;
  onSavePrinterConfig: (cfg: PrinterConfig) => void;
  profile: RestaurantProfile;
}

export const BluetoothModal: React.FC<BluetoothModalProps> = ({
  isOpen,
  onClose,
  printerConfig,
  onSavePrinterConfig,
  profile,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScan = async () => {
    setIsScanning(true);
    setStatusMsg('Memindai printer Bluetooth terdekat...');
    try {
      const res = await PrinterService.scanAndConnectBluetooth();
      setStatusMsg(res.message);
      if (res.success && res.deviceName) {
        onSavePrinterConfig({
          ...printerConfig,
          connectedDeviceName: res.deviceName,
        });
      }
    } catch (e: any) {
      setStatusMsg('Gagal: ' + e.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleTestPrint = async () => {
    setStatusMsg('Mencetak struk uji coba...');
    const dummyOrder: any = {
      id: 'test',
      receiptNumber: 'TES-BT-01',
      type: 'meja',
      tableName: 'Meja Tes',
      customerName: 'Uji Bluetooth',
      items: [
        { menuId: '1', name: 'Bakso Urat Jumbo (Tes)', price: 25000, quantity: 1 },
        { menuId: '6', name: 'Es Teh Manis (Tes)', price: 5000, quantity: 1 },
      ],
      subtotal: 30000,
      discount: 0,
      tax: 0,
      total: 30000,
      status: 'paid',
      createdAt: new Date().toISOString(),
      paymentMethod: 'tunai',
      cashAmount: 50000,
      changeAmount: 20000,
    };

    const res = await PrinterService.printOrder(dummyOrder, profile, printerConfig, false);
    setStatusMsg(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-xs bg-stone-900 text-stone-100 rounded-3xl p-4 shadow-2xl border border-stone-800 z-10 animate-in zoom-in-95 duration-200 space-y-3 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white">Printer Thermal Bluetooth</h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
          <div className="text-[10px] text-stone-400 uppercase font-bold">Status Perangkat</div>
          <div className="font-bold text-amber-400 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{printerConfig.connectedDeviceName || 'POS-58-BT'}</span>
          </div>
          <div className="text-[10px] text-stone-400">
            Ukuran Kertas: <strong className="text-white">{printerConfig.paperSize}</strong>
          </div>
        </div>

        {statusMsg && (
          <div className="p-2 bg-stone-800 text-amber-300 rounded-xl text-[11px] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold flex items-center justify-center gap-2 border border-stone-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Memindai...' : 'Pindai Ulang Bluetooth'}</span>
          </button>

          <button
            onClick={handleTestPrint}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 text-white font-bold shadow-md"
          >
            Test Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
};
