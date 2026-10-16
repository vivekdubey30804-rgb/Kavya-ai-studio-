import React, { useState } from 'react';
import { ExternalLink, Sparkles, CheckCircle } from 'lucide-react';

import { ADMOB_CONFIG } from '../config/admob';

interface BannerAdProps {
  className?: string;
  adUnitId?: string;
}

export const BannerAd: React.FC<BannerAdProps> = ({
  className = '',
  adUnitId = ADMOB_CONFIG.BANNER_AD_ID,
}) => {
  const [adClicked, setAdClicked] = useState(false);

  return (
    <aside
      className={`w-full bg-[#0d0d17] border-t border-white/10 shadow-2xl z-40 transition-all ${className}`}
      aria-label="Advertisement Banner"
    >
      <div className="max-w-4xl mx-auto px-3 py-1.5 flex items-center justify-between gap-2 h-[48px] sm:h-[50px]">
        {/* AdMob Test Ad Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1 shrink-0">
            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider leading-none shadow-sm">
              Ad
            </span>
            <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono">
              Google AdMob
            </span>
          </div>

          {/* Banner Creative Display */}
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm border border-pink-400/30">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate flex items-center gap-1.5 leading-tight">
                <span>Kavya AI Stories VIP</span>
                <span className="text-[9px] font-normal px-1 py-0.2 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 hidden xs:inline">
                  Sponsored
                </span>
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate leading-none mt-0.5">
                ID: {adUnitId}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              setAdClicked(true);
              setTimeout(() => setAdClicked(false), 2500);
            }}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 active:scale-95 text-white font-extrabold text-[11px] sm:text-xs shadow-md shadow-pink-600/20 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            {adClicked ? (
              <>
                <CheckCircle className="w-3 h-3 text-white" />
                <span>Opened ✓</span>
              </>
            ) : (
              <>
                <span>Install / Open</span>
                <ExternalLink className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
