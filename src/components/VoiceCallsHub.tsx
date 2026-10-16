import React, { useState } from 'react';
import { Phone, PhoneCall, Sparkles, CheckCircle2, Play, Heart, AlertCircle } from 'lucide-react';
import { GIRLS_LIST, Girl } from '../data/girlsData';
import { InterstitialAdModal } from './InterstitialAdModal';
import { AudioCallModal } from './AudioCallModal';
import { ADMOB_CONFIG } from '../config/admob';

interface VoiceCallsHubProps {
  userName: string | null;
}

export const VoiceCallsHub: React.FC<VoiceCallsHubProps> = ({ userName }) => {
  const [callAdCount, setCallAdCount] = useState<number>(() => {
    const saved = localStorage.getItem('kavya_call_ad_count');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const [showAdModal, setShowAdModal] = useState(false);
  const [activeCallGirl, setActiveCallGirl] = useState<Girl | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3000);
  };

  const handleWatchAd = () => {
    setShowAdModal(true);
  };

  const handleAdWatched = () => {
    const nextCount = Math.min(2, callAdCount + 1);
    setCallAdCount(nextCount);
    localStorage.setItem('kavya_call_ad_count', nextCount.toString());

    if (nextCount >= 2) {
      triggerToast('🎉 2 Ads watched! 1 Min Call is now UNLOCKED! Choose any character below to call.');
    } else {
      triggerToast('Ad 1/2 watched! Watch 1 more ad to unlock 1 Min Call 📞');
    }
  };

  const handleCallGirl = (girl: Girl) => {
    if (callAdCount < 2) {
      // Need to watch ads
      setShowAdModal(true);
      return;
    }
    setActiveCallGirl(girl);
  };

  const handleCallEnded = () => {
    setActiveCallGirl(null);
    setCallAdCount(0);
    localStorage.setItem('kavya_call_ad_count', '0');
    triggerToast('1 Minute Call completed. Ad counter reset to 0/2.');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-28 text-white">
      {/* Toast Alert */}
      {statusToast && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs shadow-2xl border border-pink-400 flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{statusToast}</span>
        </div>
      )}

      {/* Top Banner Card: Unlock 1 Min Call Progress */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#131322] to-pink-950/40 border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider mb-1">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>1-Minute Voice Calling</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Watch 2 Ads to Unlock 1 Min Call ({callAdCount}/2)
          </h1>
          <p className="text-xs text-slate-300 max-w-md">
            Simulated interactive voice calls with 50 fictional AI characters. After 2 ads, call any girl for 60 seconds!
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          {callAdCount >= 2 ? (
            <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400/50 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>Call Unlocked! Tap any girl</span>
            </div>
          ) : (
            <button
              onClick={handleWatchAd}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:brightness-110 active:scale-95 text-white font-black text-sm shadow-xl shadow-pink-600/30 border border-pink-400/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 text-white fill-white" />
              <span>Watch Ad ({callAdCount}/2)</span>
            </button>
          )}
          <span className="text-[10px] text-slate-400 font-mono">
            Test Ad Unit: 1033173712
          </span>
        </div>
      </div>

      {/* Character Speed Dial List */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-200">
          Select Character to Call (50 Fictional AI Girls)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GIRLS_LIST.slice(0, 16).map((girl) => (
            <div
              key={girl.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#11111d] border border-white/10 hover:border-pink-500/40 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={girl.avatar}
                  alt={girl.name}
                  className="w-12 h-12 rounded-2xl object-cover object-top border-2 border-pink-500/40 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-sm truncate">
                    {girl.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    (Fictional AI - 18+)
                  </p>
                  <p className="text-xs text-pink-300/80 truncate">
                    {girl.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleCallGirl(girl)}
                className={`p-3 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0 ${
                  callAdCount >= 2
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                    : 'bg-white/10 hover:bg-pink-600/30 text-pink-300 border border-white/10'
                }`}
                title={callAdCount >= 2 ? 'Start 1 Min Call' : 'Watch 2 Ads first'}
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Legal Disclaimer */}
      <div className="text-center pt-2 text-xs text-slate-400">
        <p className="font-medium">
          All stories are fictional AI content. Characters are fictional and 18+.
        </p>
      </div>

      {/* Rewarded Ad Modal for Free Call unlock (ca-app-pub-7249172099866071/4110499268) */}
      <InterstitialAdModal
        isOpen={showAdModal}
        title="Watch Ad to Unlock 1 Min Call"
        adUnitId={ADMOB_CONFIG.REWARDED_AD_ID}
        onClose={() => setShowAdModal(false)}
        onAdWatched={handleAdWatched}
      />

      {/* 1 Min Audio Call Modal */}
      {activeCallGirl && (
        <AudioCallModal
          isOpen={!!activeCallGirl}
          girl={activeCallGirl}
          userName={userName}
          onEndCall={handleCallEnded}
        />
      )}
    </div>
  );
};
