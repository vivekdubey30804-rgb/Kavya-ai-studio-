import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Sparkles } from 'lucide-react';

interface AgeGateModalProps {
  onConfirmAdult: () => void;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({ onConfirmAdult }) => {
  const [isUnderAge, setIsUnderAge] = useState(false);

  if (isUnderAge) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-2xl p-4 select-none animate-in fade-in duration-300">
        <div className="relative w-full max-w-md bg-[#11111b] border border-rose-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-rose-950/50 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center mb-4 text-rose-400">
            <XCircle className="w-9 h-9" />
          </div>

          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black tracking-wider uppercase mb-2">
            Access Denied • 18+ Only
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
            You Must Be 18+ To Access
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            Access is restricted to users who are 18 years of age or older. You cannot proceed further. Please close this browser tab or window.
          </p>

          <button
            onClick={() => setIsUnderAge(false)}
            className="text-xs text-slate-400 hover:text-pink-300 underline underline-offset-4 transition-colors"
          >
            I made a mistake, let me re-verify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 select-none animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-[#0f0f18] border border-white/20 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-purple-950/40 flex flex-col items-center overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-b from-pink-600/30 to-purple-600/0 rounded-full blur-3xl pointer-events-none" />

        {/* 18+ Badge Icon */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-600/30 mb-4 border border-pink-400/30">
          <span className="text-2xl font-black text-white font-mono tracking-tight">18+</span>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs font-bold border-2 border-[#0f0f18]">
            !
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mb-3 bg-gradient-to-r from-pink-300 via-white to-purple-200 bg-clip-text text-transparent">
          Age Verification Required
        </h2>

        {/* Message */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed mb-6 space-y-2 text-left">
          <p className="font-semibold text-pink-300 text-center">
            This app contains fictional AI characters.
          </p>
          <p className="text-center text-slate-300">
            All characters are 18+ AI-generated fictional. You must be 18+ to continue.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          {/* I am 18+ Continue (Pink) */}
          <button
            onClick={onConfirmAdult}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:brightness-110 active:scale-[0.98] text-white font-black text-sm tracking-wide shadow-lg shadow-pink-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer border border-pink-400/40"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>I am 18+ Continue</span>
          </button>

          {/* I am under 18 Exit (Grey) */}
          <button
            onClick={() => setIsUnderAge(true)}
            className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-slate-300 hover:text-white font-bold text-xs sm:text-sm border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-slate-400" />
            <span>I am under 18 Exit</span>
          </button>
        </div>

        {/* Disclaimer Footer Note */}
        <p className="mt-4 text-[10px] text-slate-400 font-medium">
          By proceeding, you verify under penalty of law that you are at least 18 years old.
        </p>
      </div>
    </div>
  );
};
