import React, { useState, useEffect } from 'react';
import { X, Sparkles, ExternalLink, Play, CheckCircle } from 'lucide-react';

import { ADMOB_CONFIG } from '../config/admob';

interface InterstitialAdModalProps {
  isOpen: boolean;
  adUnitId?: string;
  onClose: () => void;
  onAdWatched?: () => void;
  title?: string;
}

export const InterstitialAdModal: React.FC<InterstitialAdModalProps> = ({
  isOpen,
  adUnitId = ADMOB_CONFIG.REWARDED_AD_ID,
  onClose,
  onAdWatched,
  title = 'Sponsored Interstitial',
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);
  const [adInstalled, setAdInstalled] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setCanClose(false);
      setAdInstalled(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isOpen && countdown === 0) {
      setCanClose(true);
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown]);

  const handleFinishAd = () => {
    if (onAdWatched) {
      onAdWatched();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/95 backdrop-blur-md p-3 sm:p-5 select-none animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-lg bg-[#0e0e18] border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top AdMob Header Bar */}
        <div className="bg-[#141422] border-b border-white/10 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider">
              Ad
            </span>
            <span className="text-slate-300 font-semibold text-[11px]">Google AdMob Interstitial</span>
          </div>

          <div className="flex items-center gap-2">
            {canClose ? (
              <button
                onClick={handleFinishAd}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-rose-600/30 hover:border-rose-500/50 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
              >
                <span>Skip / Close</span>
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/15 text-slate-300 font-mono text-[11px]">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Skip in {countdown}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Ad Content Creative */}
        <div className="p-5 sm:p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-full aspect-video rounded-2xl bg-gradient-to-tr from-purple-900/60 via-pink-900/40 to-slate-900 border border-pink-500/30 flex flex-col items-center justify-center relative overflow-hidden p-4 shadow-inner">
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-amber-300 border border-amber-500/30">
              Ad Unit: {adUnitId}
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center shadow-lg shadow-pink-500/30 mb-2 border border-white/20">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>

            <h3 className="text-lg font-black text-white tracking-wide">
              Kavya AI Stories VIP Club
            </h3>
            <p className="text-xs text-pink-200/80 max-w-xs mt-1">
              Unlimited conversations with 50 AI characters, no ads, high voice quality &amp; photos.
            </p>

            <div className="mt-2.5 flex items-center gap-1 text-[11px] text-amber-300 font-semibold">
              <span>★★★★★ 4.9 Rating</span>
              <span className="text-slate-400">•</span>
              <span>100K+ Downloads</span>
            </div>
          </div>

          {/* Ad Info & Action */}
          <div className="w-full space-y-3">
            <div className="text-left px-1">
              <p className="text-xs text-slate-400 font-medium">
                {title} • Full-screen interstitial placement
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Ad Unit: {adUnitId}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAdInstalled(true);
                  setTimeout(() => setAdInstalled(false), 3000);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:brightness-110 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-pink-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {adInstalled ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Offer Opened ✓</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    <span>Install / Explore Now</span>
                  </>
                )}
              </button>

              {canClose && (
                <button
                  onClick={handleFinishAd}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-sm border border-white/15 transition-colors cursor-pointer"
                >
                  Continue App
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-[#0a0a12] px-4 py-2 text-center text-[10px] text-slate-400 border-t border-white/5 font-mono">
          Google Mobile Ads SDK • Ad Unit ID: {adUnitId}
        </div>
      </div>
    </div>
  );
};
