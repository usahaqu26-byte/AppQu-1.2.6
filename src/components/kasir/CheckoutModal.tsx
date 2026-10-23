import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  FileDown,
  CheckCircle2,
  Coins,
  Receipt,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, PaymentMethod, PrinterConfig } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  printerConfig: PrinterConfig;
  onCompletePayment: (
    completedOrder: Order,
    printOption: 'bluetooth' | 'pdf' | 'both' | 'none'
  ) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  order,
  printerConfig,
  onCompletePayment,
}) => {
  if (!isOpen || !order) return null;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');
  const [cashGiven, setCashGiven] = useState<number>(order.total);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  // Discount computation
  const discountAmount = Math.round((order.subtotal * discountPercent) / 100);
  const finalTotal = Math.max(0, order.subtotal - discountAmount);

  useEffect(() => {
    // When opening or total changes, default cash given to finalTotal (uang pas)
    setCashGiven(finalTotal);
  }, [finalTotal, isOpen]);

  const changeAmount = Math.max(0, cashGiven - finalTotal);
  const isCashSufficient = paymentMethod === 'qris' || cashGiven >= finalTotal;

  // Preset cash nominals
  const quickCashOptions = [
    { label: 'Uang Pas', value: finalTotal },
    { label: 'Rp 20.000', value: 20000 },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
    { label: 'Rp 200.000', value: 200000 },
  ].filter((opt, idx, arr) => {
    // Keep reasonable options
    return opt.value >= finalTotal || opt.label === 'Uang Pas';
  });

  const handleProcessPayment = (printOption: 'bluetooth' | 'pdf' | 'both' | 'none') => {
    if (!isCashSufficient) {
      alert('Uang tunai yang dibayarkan masih kurang!');
      return;
    }

    setIsProcessing(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}

    const updatedOrder: Order = {
      ...order,
      subtotal: order.subtotal,
      discount: discountAmount,
      total: finalTotal,
      paymentMethod,
      cashAmount: paymentMethod === 'tunai' ? cashGiven : finalTotal,
      changeAmount: paymentMethod === 'tunai' ? changeAmount : 0,
      status: 'paid',
      paidAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsProcessing(false);
      onCompletePayment(updatedOrder, printOption);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div className="relative w-full max-h-[92vh] bg-stone-900 text-stone-100 rounded-t-3xl shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-300 border-t border-stone-800">
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-stone-700 rounded-full mx-auto my-2.5 shrink-0" />

        {/* Header */}
        <div className="px-4 pb-3 flex items-center justify-between border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-white tracking-tight">
                Pembayaran Kasir
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-amber-400 border border-red-800">
                {order.receiptNumber}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              {order.type === 'meja' ? `Makan di Tempat · ${order.tableName}` : 'Bungkus / Takeaway'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-stone-800 text-stone-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
          {/* Rincian Pesanan Box */}
          <div className="bg-stone-800/80 rounded-2xl p-3 border border-stone-700/70 space-y-2">
            <div className="flex items-center justify-between text-stone-400 font-bold uppercase tracking-wider text-[10px]">
              <span>Rincian Menu</span>
              <span>{order.items.reduce((s, i) => s + i.quantity, 0)} Porsi</span>
            </div>

            <div className="divide-y divide-stone-700/50 max-h-36 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-1.5 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-stone-200">
                      {item.name}{' '}
                      <span className="text-amber-400 font-mono text-[11px]">
                        x{item.quantity}
                      </span>
                    </div>
                    {item.notes && (
                      <div className="text-[10px] text-stone-400 italic">
                        * {item.notes}
                      </div>
                    )}
                  </div>
                  <div className="font-mono text-stone-300">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal & Total Bill */}
            <div className="pt-2 border-t border-stone-700 flex items-center justify-between">
              <span className="text-stone-400">Total Tagihan:</span>
              <span className="text-lg font-black text-amber-400">
                {formatCurrency(finalTotal)}
              </span>
            </div>
          </div>

          {/* Metode Bayar Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
              Pilih Metode Bayar:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('tunai')}
                className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all ${
                  paymentMethod === 'tunai'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                    : 'bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-600'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    paymentMethod === 'tunai' ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-700 text-stone-300'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs text-white">Tunai (Cash)</div>
                  <div className="text-[10px] text-stone-400">Uang Tunai / Pas</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all ${
                  paymentMethod === 'qris'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                    : 'bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-600'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    paymentMethod === 'qris' ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-700 text-stone-300'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs text-white">QRIS Dinamis</div>
                  <div className="text-[10px] text-stone-400">Gopay/OVO/BCA</div>
                </div>
              </button>
            </div>
          </div>

          {/* If Tunai: Input Uang Bayar + Quick Buttons + Kembalian Calculator */}
          {paymentMethod === 'tunai' && (
            <div className="bg-stone-800/80 rounded-2xl p-3 border border-stone-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-stone-300 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Uang Diterima:</span>
                </label>
                <span className="font-mono text-xs text-amber-400 font-bold">
                  {formatCurrency(cashGiven)}
                </span>
              </div>

              {/* Number Input */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">
                  Rp
                </span>
                <input
                  type="number"
                  value={cashGiven || ''}
                  onChange={(e) => setCashGiven(Number(e.target.value) || 0)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-900 rounded-xl border border-stone-700 text-white font-mono font-bold text-base focus:outline-hidden focus:border-amber-500"
                  placeholder="0"
                />
              </div>

              {/* Quick Nominal Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickCashOptions.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCashGiven(opt.value)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      cashGiven === opt.value
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-900 text-stone-300 hover:bg-stone-700 border border-stone-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Kembalian Display */}
              <div className="pt-2 border-t border-stone-700/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-300">Kembalian:</span>
                <span
                  className={`text-base font-extrabold font-mono ${
                    cashGiven < finalTotal ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {cashGiven < finalTotal
                    ? `Kurang ${formatCurrency(finalTotal - cashGiven)}`
                    : formatCurrency(changeAmount)}
                </span>
              </div>
            </div>
          )}

          {/* If QRIS: Show Simulated QR Code */}
          {paymentMethod === 'qris' && (
            <div className="bg-stone-800/80 rounded-2xl p-4 border border-stone-700 flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-3 bg-white rounded-xl shadow-md">
                {/* SVG QR Code Simulation */}
                <div className="w-28 h-28 bg-stone-900 flex flex-col items-center justify-center text-white p-2 rounded relative">
                  <QrCode className="w-20 h-20 text-white" />
                  <span className="text-[8px] font-mono text-amber-400 mt-1 font-bold">QRIS BAKSO QU</span>
                </div>
              </div>
              <p className="text-[11px] text-stone-300 font-medium">
                Scan via BCA, Mandiri, GoPay, OVO, Dana, ShopeePay
              </p>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                Otomatis Terverifikasi Lunas
              </span>
            </div>
          )}
        </div>

        {/* Footer Checkout Actions */}
        <div className="p-3.5 bg-stone-950 border-t border-stone-800 shrink-0 space-y-2">
          {/* Primary Action: Proses Bayar & Print Struk */}
          <button
            onClick={() => handleProcessPayment('bluetooth')}
            disabled={!isCashSufficient || isProcessing}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-950/60 disabled:opacity-40 active:scale-98 transition-all"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>
              {isProcessing
                ? 'Memproses Pembayaran...'
                : `Bayar & Cetak Nota (${printerConfig.paperSize})`}
            </span>
          </button>

          {/* Secondary Action: Bayar Tanpa Cetak / PDF */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleProcessPayment('pdf')}
              disabled={!isCashSufficient || isProcessing}
              className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-stone-700"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Simpan PDF</span>
            </button>

            <button
              onClick={() => handleProcessPayment('none')}
              disabled={!isCashSufficient || isProcessing}
              className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-stone-700"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bayar Saja</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
