import React, { useState, useEffect } from 'react';
import { X, Printer, FileDown, Check, Copy } from 'lucide-react';
import { Order, RestaurantProfile, PrinterConfig } from '../../types';
import { PrinterService } from '../../services/printer';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  profile: RestaurantProfile;
  printerConfig: PrinterConfig;
  isKitchenSlip?: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  profile,
  printerConfig,
  isKitchenSlip = false,
}) => {
  const [paperSize, setPaperSize] = useState<'58mm' | '80mm'>(printerConfig.paperSize);
  const [kitchenMode, setKitchenMode] = useState<boolean>(isKitchenSlip);
  const [copied, setCopied] = useState<boolean>(false);
  const [printSuccessMsg, setPrintSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setKitchenMode(isKitchenSlip);
  }, [isKitchenSlip, isOpen]);

  if (!isOpen || !order) return null;

  const receiptText = PrinterService.generateReceiptText(
    order,
    profile,
    { ...printerConfig, paperSize },
    kitchenMode
  );

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const handlePrintBluetooth = async () => {
    const res = await PrinterService.printOrder(
      order,
      profile,
      { ...printerConfig, paperSize },
      kitchenMode
    );
    setPrintSuccessMsg(res.message);
    setTimeout(() => setPrintSuccessMsg(null), 3000);
  };

  const handlePrintSystemOrPDF = () => {
    window.print();
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm max-h-[92vh] bg-stone-900 text-stone-100 rounded-3xl shadow-2xl flex flex-col z-10 border border-stone-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white">
              {kitchenMode ? 'Struk Dapur' : 'Struk Pembayaran'}
            </span>
            {/* Mode Switcher: Dapur vs Nota */}
            <div className="flex items-center bg-stone-800 p-0.5 rounded-lg text-[10px] font-semibold">
              <button
                onClick={() => setKitchenMode(true)}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  kitchenMode ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
                }`}
              >
                Dapur
              </button>
              <button
                onClick={() => setKitchenMode(false)}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  !kitchenMode ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
                }`}
              >
                Kasir
              </button>
            </div>
            {/* Paper Size Switcher */}
            <div className="flex items-center bg-stone-800 p-0.5 rounded-lg text-[10px] font-mono">
              <button
                onClick={() => setPaperSize('58mm')}
                className={`px-2 py-0.5 rounded-md ${
                  paperSize === '58mm' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
                }`}
              >
                58mm
              </button>
              <button
                onClick={() => setPaperSize('80mm')}
                className={`px-2 py-0.5 rounded-md ${
                  paperSize === '80mm' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
                }`}
              >
                80mm
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Print Feedback Notification */}
        {printSuccessMsg && (
          <div className="bg-emerald-600 text-white text-xs px-3 py-1.5 flex items-center justify-between animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-1.5 font-medium">
              <Check className="w-4 h-4" />
              <span>{printSuccessMsg}</span>
            </div>
          </div>
        )}

        {/* Authentic Thermal Receipt Paper Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-950/60 flex justify-center">
          <div
            id="printable-receipt"
            className={`bg-white text-black p-4 font-mono-receipt text-[11px] leading-relaxed shadow-xl border-x border-stone-300 relative select-text transition-all ${
              paperSize === '80mm' ? 'w-[320px]' : 'w-[250px]'
            }`}
            style={{
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            }}
          >
            {/* Paper Top Jagged Tear Edge */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-repeat-x opacity-40 -mt-1" />

            {kitchenMode ? (
              /* STRUK DAPUR: Hanya Nama Pesanan, Qty, dan Nomor Meja (Tanpa Harga) */
              <div>
                <div className="text-center pb-2 border-b-2 border-dashed border-stone-800 space-y-1">
                  <h2 className="text-sm font-black tracking-wider uppercase text-black">
                    STRUK DAPUR
                  </h2>
                  <div className="text-xs font-extrabold uppercase text-black pt-0.5">
                    NOMOR MEJA: {order.type === 'meja' ? (order.tableName || '-') : 'BUNGKUS'}
                  </div>
                </div>

                <div className="py-1.5 border-b border-dashed border-stone-500 flex justify-between text-[10px] font-black uppercase text-black">
                  <span>NAMA PESANAN</span>
                  <span>QTY</span>
                </div>

                <div className="py-2 space-y-2 border-b-2 border-dashed border-stone-800">
                  {order.items.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-start gap-2 text-xs font-bold text-black">
                        <span className="flex-1">{item.name}</span>
                        <span className="font-black shrink-0">{item.quantity}</span>
                      </div>
                      {item.notes && (
                        <div className="text-[9px] text-stone-700 italic pl-1">
                          * {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* STRUK PEMBAYARAN KASIR */
              <>
                {/* Receipt Content Header */}
                <div className="text-center pb-2 border-b border-dashed border-stone-400 space-y-0.5">
                  <h2 className="text-sm font-black tracking-tight uppercase">
                    {profile.name}
                  </h2>
                  {profile.slogan && (
                    <div className="text-[9px] text-stone-600">{profile.slogan}</div>
                  )}
                  <div className="text-[9px] text-stone-600">{profile.address}</div>
                  <div className="text-[9px] text-stone-600">Telp: {profile.phone}</div>
                </div>

                {/* Order Meta */}
                <div className="py-2 border-b border-dashed border-stone-400 text-[10px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>No. Nota:</span>
                    <span className="font-bold">{order.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>
                      {new Date(order.createdAt).toLocaleDateString('id-ID')}{' '}
                      {new Date(order.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Layanan:</span>
                    <span>
                      {order.type === 'meja'
                        ? `Dine-in (${order.tableName || 'Meja'})`
                        : 'Bungkus / Takeaway'}
                    </span>
                  </div>
                  {order.customerName && (
                    <div className="flex justify-between">
                      <span>Pelanggan:</span>
                      <span>{order.customerName}</span>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="py-2 border-b border-dashed border-stone-400 space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx}>
                      <div className="font-bold text-stone-900">{item.name}</div>
                      <div className="flex justify-between text-stone-700 text-[10px]">
                        <span>
                          {item.quantity} x {formatCurrency(item.price)}
                        </span>
                        <span className="font-bold">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                      {item.notes && (
                        <div className="text-[9px] text-stone-500 italic pl-1">
                          Catatan: {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Calculation Totals */}
                <div className="py-2 border-b border-dashed border-stone-400 space-y-1">
                  <div className="flex justify-between text-stone-700">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-stone-700">
                      <span>Diskon</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-black text-black pt-1 border-t border-stone-300">
                    <span>TOTAL</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                  {order.paymentMethod && (
                    <>
                      <div className="flex justify-between text-stone-700 pt-1 text-[10px]">
                        <span>Bayar ({order.paymentMethod.toUpperCase()})</span>
                        <span>{formatCurrency(order.cashAmount || order.total)}</span>
                      </div>
                      {order.paymentMethod === 'tunai' && (
                        <div className="flex justify-between text-stone-700 text-[10px]">
                          <span>Kembalian</span>
                          <span>{formatCurrency(order.changeAmount || 0)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Receipt Footer Message */}
                <div className="pt-3 text-center text-[9px] text-stone-600 space-y-1">
                  <div>{profile.receiptHeader}</div>
                  <div className="font-bold">{profile.receiptFooter}</div>
                  <div className="font-black text-[10px] tracking-widest text-black pt-1">
                    *** LUNAS ***
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 space-y-2">
          {/* Print Bluetooth Primary */}
          <button
            onClick={handlePrintBluetooth}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 active:scale-98 transition-all"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>
              Cetak {kitchenMode ? 'Struk Dapur' : 'Struk Kasir'} via Bluetooth ({paperSize})
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            {/* Export PDF / Print Window */}
            <button
              onClick={handlePrintSystemOrPDF}
              className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-stone-700 active:scale-95"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Simpan PDF HP</span>
            </button>

            {/* Copy Receipt Text */}
            <button
              onClick={handleCopyText}
              className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-stone-700 active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
              <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
