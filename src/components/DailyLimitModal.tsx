import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, Clock, Zap, CheckCircle2, QrCode, ArrowRight, ShieldCheck, X } from 'lucide-react';

interface DailyLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPayment: () => void;
  onInstantUnlock: () => void;
}

export const DailyLimitModal: React.FC<DailyLimitModalProps> = ({
  isOpen,
  onClose,
  onOpenPayment,
}) => {
  const [timeLeft, setTimeLeft] = useState('');

  // Calculate live countdown to next 12:00 PM / AM (Kal subah 12 baje)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Target tomorrow 12:00 PM (noon)
      const target = new Date();
      if (now.getHours() >= 12) {
        target.setDate(target.getDate() + 1);
      }
      target.setHours(12, 0, 0, 0);

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('00h 00m 00s');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}h ${minutes
          .toString()
          .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12121e] rounded-[24px] border border-pink-500/30 p-6 shadow-2xl text-center overflow-hidden">
        {/* Glow backdrop behind modal */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-pink-600/25 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Crying / Lock Icon Badge */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-amber-500/20 border border-pink-500/40 flex items-center justify-center mb-4 shadow-lg shadow-pink-500/10">
          <span className="text-4xl select-none animate-bounce [animation-duration:2.5s]">😭</span>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-pink-600 text-white shadow-md">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* Title exactly as requested */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Aaj ke 50 khatam! 😭
        </h2>

        {/* Subtitle exactly as requested */}
        <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-pink-300 via-rose-200 to-amber-300 bg-clip-text text-transparent mb-3">
          Kal subah 12 baje fir 50 Free milenge!
        </p>

        {/* Timer Box */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 border border-white/10 text-xs font-mono text-pink-300 mb-6">
          <Clock className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span>Next 50 Free in: <strong className="text-white">{timeLeft}</strong></span>
        </div>

        {/* Features teaser */}
        <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 text-left text-xs space-y-2 mb-6">
          <div className="flex items-center gap-2 text-slate-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>50 girls se unlimited bina ruke baat karo</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <Zap className="w-4 h-4 text-pink-400 shrink-0" />
            <span>Fast VIP response & high trust speed</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Sirf ₹29 one-time - Lifetime Unlimited!</span>
          </div>
        </div>

        {/* Action Buttons exactly as requested */}
        <div className="space-y-3">
          {/* [Pay ₹29 - Unlimited Unlock] */}
          <button
            onClick={onOpenPayment}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:via-rose-500 hover:to-amber-400 text-white font-bold text-base shadow-lg shadow-pink-600/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-pink-400/40"
          >
            <Sparkles className="w-5 h-5 text-amber-200 animate-spin [animation-duration:6s]" />
            <span>Pay ₹29 - Unlimited Unlock</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* [Kal Tak Wait Karunga] */}
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-300 hover:text-white font-medium text-sm transition-colors cursor-pointer border border-white/10"
          >
            Kal Tak Wait Karunga
          </button>
        </div>

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Instant Unlock • 100% Safe UPI Payment</span>
        </div>
      </div>
    </div>
  );
};
