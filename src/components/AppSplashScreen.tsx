import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Shield } from 'lucide-react';

interface AppSplashScreenProps {
  onFinish: () => void;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing Kavya AI Engine...');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(50);
      setStatusText('Loading 50 Fictional Story Characters...');
    }, 400);

    const t2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Syncing 18+ Story Models & Cache...');
    }, 900);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Ready!');
    }, 1300);

    const t4 = setTimeout(() => {
      onFinish();
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[95] min-h-screen w-full bg-[#07070d] flex flex-col items-center justify-between p-6 select-none font-sans text-white">
      {/* Top spacing */}
      <div className="pt-4 flex items-center gap-1.5 text-xs text-pink-300/80 font-mono">
        <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin [animation-duration:6s]" />
        <span>Kavya AI Studio • Indus Edition</span>
      </div>

      {/* Center Branding & Animated Logo */}
      <div className="flex flex-col items-center text-center my-auto">
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-pink-600 to-purple-600 opacity-40 blur-2xl animate-pulse" />
          <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-tr from-pink-600 via-rose-600 to-purple-700 p-1 shadow-2xl flex items-center justify-center border border-white/20">
            <div className="w-full h-full rounded-[22px] bg-[#0c0c16] flex flex-col items-center justify-center">
              <Heart className="w-10 h-10 text-pink-400 fill-pink-500 animate-bounce [animation-duration:2s]" />
              <span className="text-[11px] font-black text-white font-mono mt-1 tracking-widest">KAVYA</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase bg-gradient-to-r from-pink-300 via-purple-200 to-rose-300 bg-clip-text text-transparent">
          KAVYA AI STORIES
        </h1>
        <p className="text-xs font-bold text-pink-400 tracking-widest uppercase mt-1">
          Virtual Story World (18+)
        </p>

        <div className="mt-8 w-64 max-w-xs flex flex-col items-center">
          {/* Native Loading Bar */}
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden border border-white/10 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 font-mono mt-3 h-4">
            {statusText}
          </p>
        </div>
      </div>

      {/* Bottom Version & Safety Badge */}
      <div className="pb-4 flex flex-col items-center gap-1 text-center">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-[10px]">v1.1.0 (Build 2)</span>
          <span>•</span>
          <span>100% Fictional AI</span>
        </div>
        <p className="text-[10px] text-slate-400 font-medium">
          All stories are fictional AI content. Characters are fictional and 18+.
        </p>
      </div>
    </div>
  );
};
