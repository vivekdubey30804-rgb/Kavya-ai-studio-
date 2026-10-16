import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, ShieldCheck, Lock, AlertTriangle, ArrowRight } from 'lucide-react';

interface NativeAgeGateScreenProps {
  onConfirmAdult: () => void;
}

export const NativeAgeGateScreen: React.FC<NativeAgeGateScreenProps> = ({ onConfirmAdult }) => {
  const [hasExited, setHasExited] = useState(false);

  // If user tapped "Exit - I am under 18", render Native App Closed screen
  if (hasExited) {
    return (
      <div className="fixed inset-0 z-[100] min-h-screen w-full bg-[#05050a] text-white flex flex-col items-center justify-center p-6 select-none font-sans">
        <div className="w-full max-w-md bg-[#0e0e18] border border-rose-500/40 rounded-3xl p-8 text-center shadow-2xl flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/15 border-2 border-rose-500/50 flex items-center justify-center mb-5 text-rose-400">
            <XCircle className="w-10 h-10" />
          </div>

          <span className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black tracking-widest uppercase mb-3">
            APP CLOSED • UNDER 18
          </span>

          <h1 className="text-2xl font-black text-white mb-3">
            Application Terminated
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed mb-8">
            You indicated that you are under 18. In compliance with Indus Appstore &amp; safety policies, Kavya AI Stories is restricted to mature adults (18+). You may now safely close or swipe away this application.
          </p>

          <button
            onClick={() => setHasExited(false)}
            className="text-xs text-slate-400 hover:text-pink-300 underline underline-offset-4 transition-colors"
          >
            Wrong selection? Verify age again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] min-h-screen w-full bg-[#08080f] text-white flex flex-col justify-between p-5 sm:p-8 select-none font-sans overflow-y-auto">
      {/* Top Native Status & Security Badge */}
      <div className="w-full max-w-md mx-auto pt-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-pink-300">
          <Lock className="w-3.5 h-3.5 text-pink-400" />
          <span>Kavya AI Stories • v1.1.0</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-extrabold text-[10px] tracking-wider">
          18+ ONLY
        </span>
      </div>

      {/* Main Center Content Card (Native Screen Layout) */}
      <div className="w-full max-w-md mx-auto my-auto py-6 flex flex-col items-center text-center">
        {/* Large Native 18+ Shield Graphic */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-pink-600 to-purple-600 opacity-30 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-pink-600 via-rose-600 to-purple-700 border-2 border-pink-400/40 flex flex-col items-center justify-center shadow-2xl">
            <span className="text-3xl font-black text-white font-mono leading-none tracking-tight">18+</span>
            <span className="text-[10px] font-bold text-pink-200 uppercase tracking-widest mt-1">ADULT</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs border-2 border-[#08080f] shadow-md">
            !
          </div>
        </div>

        {/* Exact User Requested Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide mb-4 bg-gradient-to-r from-pink-300 via-white to-purple-200 bg-clip-text text-transparent">
          Age Verification - 18+ Only
        </h1>

        {/* Exact User Requested Text */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#11111d] border border-white/10 text-slate-200 text-xs sm:text-sm leading-relaxed mb-6 text-center shadow-lg">
          <p className="font-medium">
            Kavya AI Stories contains fictional AI character stories intended for mature audiences (18+). All characters are fictional, AI-generated and 18+ years old. No real persons.
          </p>
        </div>

        {/* Indus Appstore Compliance Highlights */}
        <div className="grid grid-cols-2 gap-2.5 w-full mb-6 text-left">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] text-slate-300 font-semibold leading-tight">100% Fictional AI Generated</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
            <span className="text-[11px] text-slate-300 font-semibold leading-tight">No Explicit / Real Persons</span>
          </div>
        </div>

        {/* Native Touch Buttons */}
        <div className="w-full space-y-3">
          {/* Button 1: [I am 18+ - Enter] */}
          <button
            onClick={onConfirmAdult}
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:brightness-110 active:scale-[0.98] text-white font-black text-base tracking-wide shadow-xl shadow-pink-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-pink-400/50"
          >
            <span>I am 18+ - Enter</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>

          {/* Button 2: [Exit - I am under 18] */}
          <button
            onClick={() => setHasExited(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-slate-300 hover:text-white font-bold text-sm border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-slate-400" />
            <span>Exit - I am under 18</span>
          </button>
        </div>
      </div>

      {/* Footer Legal Notice */}
      <div className="w-full max-w-md mx-auto pb-2 text-center text-[10px] text-slate-500">
        Kavya AI Stories • Virtual Story World 18+ • Support: kavyastudio2026@gmail.com
      </div>
    </div>
  );
};
