import React, { useState, useEffect } from 'react';
import { Play, Sparkles, X, CheckCircle, Gift } from 'lucide-react';
import { ADMOB_CONFIG } from '../config/admob';

interface FreeLimitModalProps {
  isOpen: boolean;
  dailyCount: number;
  dailyLimit: number;
  onClose: () => void;
  onRewardAdSuccess: () => void;
}

export const FreeLimitModal: React.FC<FreeLimitModalProps> = ({
  isOpen,
  dailyCount,
  dailyLimit,
  onClose,
  onRewardAdSuccess,
}) => {
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adRewarded, setAdRewarded] = useState(false);

  // Reset ad playback state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setIsAdPlaying(false);
      setAdCountdown(5);
      setAdRewarded(false);
    }
  }, [isOpen]);

  // Handle ad countdown when playing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAdPlaying && adCountdown > 0) {
      timer = setTimeout(() => {
        setAdCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isAdPlaying && adCountdown === 0) {
      setAdRewarded(true);
      const finishTimer = setTimeout(() => {
        setIsAdPlaying(false);
        onRewardAdSuccess();
      }, 1000);
      return () => clearTimeout(finishTimer);
    }
    return () => clearTimeout(timer);
  }, [isAdPlaying, adCountdown, onRewardAdSuccess]);

  if (!isOpen) return null;

  return (
    <div
      id="paywall"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-md bg-[#12121e] rounded-[24px] border border-amber-400/40 p-6 sm:p-7 shadow-2xl text-center overflow-hidden">
        {/* Glow backdrop behind modal */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 bg-gradient-to-r from-amber-500/25 via-pink-600/25 to-yellow-500/25 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* If Rewarded Ad is currently simulating playback */}
        {isAdPlaying ? (
          <div className="py-4 space-y-4">
            <div className="relative mx-auto w-full aspect-video rounded-2xl bg-black border border-amber-500/30 overflow-hidden flex flex-col items-center justify-center p-4">
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/85 text-[10px] font-mono text-amber-300 border border-amber-500/40">
                Google AdMob Rewarded Ad • ID: {ADMOB_CONFIG.REWARDED_AD_ID}
              </div>
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-500 text-[11px] font-black text-slate-950 shadow">
                {adCountdown > 0 ? `Reward in ${adCountdown}s` : 'Reward Unlocked!'}
              </div>

              {adRewarded ? (
                <div className="text-center animate-in zoom-in-75">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-base font-extrabold text-emerald-300">+10 Free Chats Added! 🎉</p>
                  <p className="text-xs text-slate-300 font-mono mt-1">Naya Limit: {dailyLimit + 10} Chats</p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center mx-auto animate-pulse">
                    <Play className="w-6 h-6 text-amber-400 fill-amber-400 ml-1" />
                  </div>
                  <p className="text-xs text-slate-200 font-semibold">Playing Rewarded Video Ad...</p>
                  <p className="text-[10px] text-slate-400 font-mono">{ADMOB_CONFIG.REWARDED_AD_ID}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-amber-300 font-medium animate-pulse">
              Video poora dekho aur turant +10 free chats pao...
            </p>
          </div>
        ) : (
          <>
            {/* 10 SMS = 1 Ad Logic Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-xs uppercase tracking-wider mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>10 SMS = 1 Ad</span>
            </div>

            {/* Unlock Icon Badge */}
            <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/25 via-pink-500/25 to-yellow-500/25 border border-amber-400/50 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/15">
              <span className="text-4xl select-none animate-bounce [animation-duration:2.5s]">🔓</span>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-amber-400 text-slate-950 shadow-md">
                <Gift className="w-4 h-4 text-slate-950" />
              </div>
            </div>

            {/* Exact Requested Title & Text:
                "You used 25 free messages. Watch 1 Ad for 10 more chats"
            */}
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2 leading-snug">
              You used 25 free messages. Watch 1 Ad for 10 more chats
            </h2>

            {/* Logic description: 10 SMS = 1 Ad */}
            <div className="space-y-1 mb-5 text-center">
              <p className="text-sm font-bold text-amber-300">
                10 SMS = 1 Ad
              </p>
              <p className="text-xs text-slate-300">
                You used your 25 free messages. Watch 1 short Ad to immediately unlock 10 more chats!
              </p>
            </div>

            {/* Current Limit Status Badge: 25/25 -> 25/35 */}
            <div className="mb-5 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between px-4">
              <div className="text-left">
                <span className="text-xs text-slate-300 font-medium block">Counter Status</span>
                <span className="text-[11px] text-amber-300 font-semibold">1 Ad = +10 Messages Added</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                  {dailyCount}/{(dailyLimit === 55 || !dailyLimit) ? 25 : dailyLimit}
                </span>
                <span className="text-xs text-slate-400">➔</span>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {dailyCount}/{((dailyLimit === 55 || !dailyLimit) ? 25 : dailyLimit) + 10}
                </span>
              </div>
            </div>

            {/* Action Buttons: "Watch 1 Ad to get 10 More Messages" */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsAdPlaying(true);
                  setAdCountdown(5);
                  setAdRewarded(false);
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:via-yellow-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-400/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
              >
                <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>Watch 1 Ad to get 10 More Messages</span>
                <Sparkles className="w-4 h-4 text-slate-900 animate-spin [animation-duration:6s]" />
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 px-6 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-300 hover:text-white font-bold text-sm transition-colors cursor-pointer border border-white/10"
              >
                KAL AAO
              </button>
            </div>

            {/* AdMob Real Rewarded ID footer label */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <span>Rewarded Ad ID: {ADMOB_CONFIG.REWARDED_AD_ID}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
