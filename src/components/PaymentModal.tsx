import React, { useState } from 'react';
import { X, CheckCircle2, Sparkles, QrCode, Shield, ArrowRight, Smartphone, Zap } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState<'qr' | 'gpay' | 'phonepe' | 'paytm'>('qr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#131322] rounded-[24px] border border-amber-500/40 p-6 shadow-2xl text-center overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isCompleted ? (
          <div className="py-8 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-white">Payment Successful! 🎉</h3>
            <p className="text-sm text-pink-300 font-semibold">
              VIP Unlimited Access Unlocked!
            </p>
            <p className="text-xs text-slate-400">
              Ab 50 girls se jee bhar ke bina kisi limit baat karo. Enjoy!
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LIFETIME UNLIMITED VIP</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              Unlock All 50 Girls
            </h3>
            <div className="flex items-baseline justify-center gap-2 my-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-400">₹29</span>
              <span className="text-sm text-slate-400 line-through">₹199</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                85% OFF
              </span>
            </div>

            {/* Simulated UPI QR / App Selector */}
            <div className="my-4 p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center">
              {/* QR Code graphic */}
              <div className="relative p-3 bg-white rounded-xl shadow-md mb-3">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi%3A%2F%2Fpay%3Fpa%3Dkavya.ai%40upi%26pn%3DKavya%2520AI%2520Story%26am%3D29.00%26cu%3DINR"
                  alt="UPI QR Code"
                  className="w-32 h-32 object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center text-white text-[10px] font-black border border-white shadow">
                    AI
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">Scan via GPay / PhonePe / Paytm</p>
              <p className="text-[10px] text-slate-500">UPI ID: kavya.story@upi</p>
            </div>

            {/* Quick App Select */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => setSelectedMethod('gpay')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  selectedMethod === 'gpay'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                    : 'bg-white/5 border-white/10 text-slate-300'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> GPay
              </button>
              <button
                onClick={() => setSelectedMethod('phonepe')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  selectedMethod === 'phonepe'
                    ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                    : 'bg-white/5 border-white/10 text-slate-300'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> PhonePe
              </button>
              <button
                onClick={() => setSelectedMethod('paytm')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  selectedMethod === 'paytm'
                    ? 'bg-sky-600/30 border-sky-500 text-sky-300'
                    : 'bg-white/5 border-white/10 text-slate-300'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Paytm
              </button>
            </div>

            {/* Complete Payment Button */}
            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40 disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Payment ₹29...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Pay ₹29 &amp; Unlock Instantly</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Instant VIP activation • Auto-sync with all 50 girls</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
