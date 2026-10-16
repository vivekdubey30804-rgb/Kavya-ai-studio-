import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, ShieldCheck, Share2, Copy, ExternalLink, X, ArrowDownCircle } from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const apkUrl = '/app-release.apk';
  const fullApkUrl = window.location.origin + '/app-release.apk';

  const handleDownload = () => {
    setIsDownloading(true);
    // Create anchor element to trigger download
    const link = document.createElement('a');
    link.href = apkUrl;
    link.setAttribute('download', 'app-release.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
    }, 2500);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullApkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kavya AI Story - Download Android APK',
          text: 'Download Kavya AI Story (50 AI Girls Roleplay) Android APK direct:',
          url: fullApkUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1c182a] to-[#100d18] border border-pink-500/30 rounded-3xl p-6 shadow-2xl shadow-pink-500/20 text-white overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-pink-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 shadow-lg shadow-pink-500/40 mb-3 border border-pink-400/30">
            <Smartphone className="w-8 h-8 text-white animate-bounce" />
          </div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
            Download Android APK
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Install Kavya AI Story directly outside Play Store (v1.1.0 Release • Build 2)
          </p>
        </div>

        {/* App Info Box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-4 relative z-10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">File Name:</span>
            <span className="font-mono font-semibold text-pink-300">app-release.apk</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Package:</span>
            <span className="font-mono text-slate-300 text-[11px]">com.kavya.aistory</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Compatibility:</span>
            <span className="font-medium text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Android 6.0+ (Marshmallow to Android 15)
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Security:</span>
            <span className="font-medium text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Release Signed &amp; Verified
            </span>
          </div>
        </div>

        {/* Primary Download Button */}
        <div className="space-y-2.5 relative z-10 mb-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 hover:from-pink-400 hover:to-purple-500 active:scale-[0.98] text-white font-extrabold text-base shadow-xl shadow-pink-500/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            {isDownloading ? (
              <>
                <ArrowDownCircle className="w-5 h-5 animate-spin" />
                <span>Downloading APK...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 animate-pulse" />
                <span>DOWNLOAD app-release.apk (Direct)</span>
              </>
            )}
          </button>

          {/* Secondary Actions: Share & Copy Link */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShare}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-pink-400" />
              <span>Share APK</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4 text-purple-400" />
              <span>{copied ? 'Link Copied! ✓' : 'Copy APK URL'}</span>
            </button>
          </div>
        </div>

        {/* 3 Step Installation Guide */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-3.5 relative z-10">
          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
            📱 How to Install on Android Phone:
          </p>
          <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>
              Tap <strong className="text-slate-200">DOWNLOAD app-release.apk</strong> button above.
            </li>
            <li>
              Once downloaded, tap the file in Notifications or Downloads folder.
            </li>
            <li>
              If prompted, allow <strong className="text-pink-300">&quot;Install unknown apps&quot;</strong> or &quot;Allow from this source&quot; in Chrome/browser settings.
            </li>
            <li>
              Tap <strong className="text-emerald-400">Install</strong> and launch Kavya AI Story on your phone!
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
