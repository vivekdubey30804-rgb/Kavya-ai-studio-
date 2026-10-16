import React, { useState } from 'react';
import { X, LogOut, User, Crown, Zap, Shield, Sparkles, RefreshCcw, Download, CheckCircle, Smartphone, ArrowDownCircle, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  userName: string;
  userDob?: string | null;
  isPremium: boolean;
  dailyCount: number;
  dailyLimit?: number;
  onClose: () => void;
  onLogout: () => void;
  onOpenPaywall: () => void;
  onOpenApkDownload?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  userName,
  userDob,
  isPremium,
  dailyCount,
  dailyLimit = 25,
  onClose,
  onLogout,
  onOpenPaywall,
  onOpenApkDownload,
}) => {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'started'>('idle');

  if (!isOpen) return null;

  // Retrieve saved DOB if not passed
  const displayDob = userDob || localStorage.getItem('kavya_user_dob') || localStorage.getItem('userDob') || '03/06/2004';
  
  // Guarantee daily limit is strictly 25 if previously cached as 55
  const effectiveDailyLimit = (dailyLimit === 55 || !dailyLimit) ? 25 : dailyLimit;

  const handleDownloadApk = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setDownloadStatus('downloading');

    // Trigger direct APK download
    const apkUrl = '/app-release.apk';
    const link = document.createElement('a');
    link.href = apkUrl;
    link.setAttribute('download', 'app-release.apk');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Update UI state to "Download Started"
    setTimeout(() => {
      setDownloadStatus('started');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-sm bg-[#12121e] rounded-[24px] border border-white/10 p-6 shadow-2xl overflow-hidden text-white">
        {/* Glow backdrop */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/20 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-pink-600/30 border border-pink-500/40 flex items-center justify-center text-pink-300">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Settings &amp; Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center font-bold text-white text-base shadow-md">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm">Aap: {userName}</span>
                {isPremium && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
              </div>
              {/* Show saved DOB in Settings & Profile page under name: "DOB: 03/06/2004" */}
              <p className="text-xs text-pink-300 font-mono mt-0.5 font-medium">
                DOB: {displayDob}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isPremium ? 'VIP Unlimited Member 👑' : `Free Daily Plan (${effectiveDailyLimit}/day)`}
              </p>
            </div>
          </div>
        </div>

        {/* Plan / Quota Stats */}
        <div className="bg-[#161626] rounded-2xl p-3.5 border border-white/5 mb-4 space-y-2.5 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Daily Free Messages:</span>
            <span className="font-semibold text-white">
              {isPremium ? 'Unlimited 👑' : `${dailyCount}/${effectiveDailyLimit} used (${Math.max(0, effectiveDailyLimit - dailyCount)} left)`}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Characters Available:</span>
            <span className="font-semibold text-emerald-300">50 AI Story Characters Online</span>
          </div>

          {!isPremium && (
            <button
              onClick={() => {
                onClose();
                onOpenPaywall();
              }}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Upgrade to VIP Unlimited (₹29)</span>
            </button>
          )}
        </div>

        {/* Direct APK Download Section */}
        <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Android App (Outside Play Store)</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-medium">
              v1.1.0 (Build 2) APK
            </span>
          </div>

          <button
            onClick={handleDownloadApk}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md ${
              downloadStatus === 'started'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25 border border-emerald-400'
                : downloadStatus === 'downloading'
                ? 'bg-emerald-700 text-white border border-emerald-500'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 border border-emerald-400/50'
            }`}
          >
            {downloadStatus === 'downloading' ? (
              <>
                <ArrowDownCircle className="w-4 h-4 animate-spin text-white" />
                <span>Starting Download...</span>
              </>
            ) : downloadStatus === 'started' ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-200" />
                <span>Download Started! (app-release.apk) ✓</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white animate-bounce" />
                <span>Download app-release.apk</span>
              </>
            )}
          </button>

          {/* Feedback UI State */}
          {downloadStatus === 'started' && (
            <div className="mt-2.5 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 animate-in fade-in duration-300">
              <p className="text-[11px] text-emerald-200 leading-snug flex items-start gap-1.5 font-medium">
                <span className="shrink-0 text-emerald-300">✅</span>
                <span>
                  <strong>Download Started!</strong> <code>app-release.apk</code> is downloading to your device. Check your browser notification or Downloads folder to install.
                </span>
              </p>
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <button
                  onClick={handleDownloadApk}
                  className="text-emerald-300 hover:text-white underline cursor-pointer"
                >
                  Download again
                </button>
                {onOpenApkDownload && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenApkDownload();
                    }}
                    className="text-emerald-300 hover:text-white flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Installation guide</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout Section */}
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/35 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Logout (Naye naam se shuru karo)</span>
          </button>
          <p className="text-center text-[10px] text-slate-500 mt-2">
            Logout karne par aap wapas Login Screen par chale jayenge.
          </p>
        </div>
      </div>
    </div>
  );
};
