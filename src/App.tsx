import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Heart, User, Filter, Zap, Lock, Crown, Settings, LogOut, Download } from 'lucide-react';
import { GIRLS_LIST, Girl } from './data/girlsData';
import { GirlCard } from './components/GirlCard';
import { ChatModal } from './components/ChatModal';
import { PaywallModal } from './components/PaywallModal';
import { FreeLimitModal } from './components/FreeLimitModal';
import { LoginScreen } from './components/LoginScreen';
import { SettingsModal } from './components/SettingsModal';
import { BannerAd } from './components/BannerAd';
import { InterstitialAdModal } from './components/InterstitialAdModal';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { NativeAgeGateScreen } from './components/NativeAgeGateScreen';
import { AppSplashScreen } from './components/AppSplashScreen';
import { NativeBottomNav, NavTab } from './components/NativeBottomNav';
import { PrivacyTermsView } from './components/PrivacyTermsView';
import { ChatsListView } from './components/ChatsListView';
import { VoiceCallsHub } from './components/VoiceCallsHub';
import { ADMOB_CONFIG } from './config/admob';

export default function App() {
  // Requirement 2: 18+ Native Age Gate Screen (First Screen)
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(() => {
    return localStorage.getItem('kavya_age_verified_18') === 'true';
  });

  // Requirement 3: Native App Loading Splash
  const [showSplash, setShowSplash] = useState(true);

  // Requirement 3: Native Bottom Navigation Tab
  const [activeTab, setActiveTab] = useState<NavTab>('stories');

  const [selectedGirl, setSelectedGirl] = useState<Girl | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [showMorningToast, setShowMorningToast] = useState(false);
  const [showPremiumToast, setShowPremiumToast] = useState(false);

  // Helper to get formatted today date (YYYY-MM-DD)
  const getTodayDateStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Requirement: Check localStorage key 'kavya_userName'. If empty, show login
  const [userName, setUserName] = useState<string | null>(() => {
    const saved = localStorage.getItem('kavya_userName');
    return saved && saved.trim() ? saved.trim() : null;
  });

  // Requirement: Check localStorage key 'kavya_user_dob'.
  const [userDob, setUserDob] = useState<string | null>(() => {
    const savedDob = localStorage.getItem('kavya_user_dob') || localStorage.getItem('userDob');
    return savedDob && savedDob.trim() ? savedDob.trim() : null;
  });

  // Clear legacy keys on startup and ensure daily limit is 25 if was 55
  useEffect(() => {
    localStorage.removeItem('kavya_user_name');
    localStorage.removeItem('userName');
    const savedLimit = localStorage.getItem('kavya_dailyLimit');
    if (savedLimit === '55' || savedLimit === '50') {
      localStorage.setItem('kavya_dailyLimit', '25');
      setDailyLimit(25);
    }
  }, []);

  // Check isPremium and verify 30-day expiry
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    const isPrem = localStorage.getItem('isPremium') === 'true';
    const expiryStr = localStorage.getItem('premiumExpiry');
    if (isPrem && expiryStr) {
      const expiry = new Date(expiryStr);
      if (new Date() < expiry) {
        return true;
      } else {
        localStorage.removeItem('isPremium');
        localStorage.removeItem('premiumExpiry');
        return false;
      }
    }
    return false;
  });

  // Daily count tracking with localStorage keys "kavya_dailyDate" & "kavya_dailyCount"
  const [dailyCount, setDailyCount] = useState<number>(() => {
    const today = getTodayDateStr();
    const savedDate = localStorage.getItem('kavya_dailyDate');
    const savedCountStr = localStorage.getItem('kavya_dailyCount');

    if (savedDate === today && savedCountStr !== null) {
      return parseInt(savedCountStr, 10) || 0;
    }

    // Reset if date changed or first time
    localStorage.setItem('kavya_dailyDate', today);
    localStorage.setItem('kavya_dailyCount', '0');
    return 0;
  });

  // Daily limit: base is 25 messages, each rewarded ad adds +10 messages.
  const [dailyLimit, setDailyLimit] = useState<number>(() => {
    const today = getTodayDateStr();
    const savedDate = localStorage.getItem('kavya_dailyDate');
    const savedLimitStr = localStorage.getItem('kavya_dailyLimit');

    // Force overwrite any old 55 or 50 values to 25
    if (savedLimitStr === '55' || savedLimitStr === '50') {
      localStorage.setItem('kavya_dailyDate', today);
      localStorage.setItem('kavya_dailyLimit', '25');
      return 25;
    }

    if (savedDate === today && savedLimitStr !== null) {
      const parsed = parseInt(savedLimitStr, 10);
      if (!isNaN(parsed) && parsed >= 25 && parsed !== 55 && parsed !== 50) return parsed;
    }

    localStorage.setItem('kavya_dailyDate', today);
    localStorage.setItem('kavya_dailyLimit', '25');
    return 25;
  });

  const [showRewardToast, setShowRewardToast] = useState(false);
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);
  const [interstitialTitle, setInterstitialTitle] = useState('Google AdMob Interstitial');
  const [lastSelectedGirlId, setLastSelectedGirlId] = useState<number | null>(null);
  const [pendingGirlToSelect, setPendingGirlToSelect] = useState<Girl | null>(null);
  const [userMsgCount, setUserMsgCount] = useState<number>(() => {
    const saved = localStorage.getItem('kavya_userMsgCount');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  // Trust map: all 50 girls start at 10%
  const [trustMap, setTrustMap] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem('kavya_trust_map');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const initial: Record<number, number> = {};
    GIRLS_LIST.forEach((g) => {
      initial[g.id] = 10;
    });
    return initial;
  });

  // Mood map
  const [moodMap, setMoodMap] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('kavya_mood_map');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const initial: Record<number, string> = {};
    GIRLS_LIST.forEach((g) => {
      initial[g.id] = g.mood;
    });
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('kavya_trust_map', JSON.stringify(trustMap));
  }, [trustMap]);

  useEffect(() => {
    localStorage.setItem('kavya_mood_map', JSON.stringify(moodMap));
  }, [moodMap]);

  // Auto midnight reset every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const today = getTodayDateStr();
      const savedDate = localStorage.getItem('kavya_dailyDate');

      if (savedDate && savedDate !== today) {
        localStorage.setItem('kavya_dailyDate', today);
        localStorage.setItem('kavya_dailyCount', '0');
        localStorage.setItem('kavya_dailyLimit', '25');
        setDailyCount(0);
        setDailyLimit(25);

        try {
          window.alert('Good Morning! Aaj ke 25 Free reset ho gaye 💖');
        } catch {
          // ignore iframe restriction if alert blocked
        }

        setShowMorningToast(true);
        setTimeout(() => setShowMorningToast(false), 5000);
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Login handler
  const handleLogin = (name: string, dob: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem('kavya_userName', trimmed);
    localStorage.setItem('kavya_user_name', trimmed);
    localStorage.setItem('userName', trimmed);
    localStorage.setItem('kavya_user_dob', dob);
    localStorage.setItem('userDob', dob);
    setUserName(trimmed);
    setUserDob(dob);
  };

  // Logout handler - clears localStorage and goes back to login screen
  const handleLogout = () => {
    localStorage.removeItem('kavya_userName');
    localStorage.removeItem('kavya_user_name');
    localStorage.removeItem('userName');
    localStorage.removeItem('kavya_user_dob');
    localStorage.removeItem('userDob');
    setUserName(null);
    setUserDob(null);
    setShowSettings(false);
  };

  // Update count after each message
  const handleIncrementDailyCount = () => {
    const today = getTodayDateStr();
    const newCount = dailyCount + 1;
    setDailyCount(newCount);
    localStorage.setItem('kavya_dailyDate', today);
    localStorage.setItem('kavya_dailyCount', newCount.toString());

    // When limit is reached, trigger popup
    if (newCount >= dailyLimit && !isPremium) {
      setShowPaywall(true);
    }
  };

  // Track user messages: Show full-screen interstitial ad after every 8 user messages
  const handleUserMessageSent = () => {
    setUserMsgCount((prev) => {
      const next = prev + 1;
      localStorage.setItem('kavya_userMsgCount', next.toString());
      if (next > 0 && next % 8 === 0) {
        setInterstitialTitle(`8 Messages Milestone (${next} Total Messages)`);
        setShowInterstitialAd(true);
      }
      return next;
    });
  };

  // Character selection / switch handler: show full-screen interstitial ad when user switches character
  const handleGirlClick = (girl: Girl) => {
    if (!isPremium && dailyCount >= dailyLimit) {
      setShowPaywall(true);
      return;
    }

    if (lastSelectedGirlId !== null && lastSelectedGirlId !== girl.id) {
      // User is switching character! Show interstitial ad first
      setPendingGirlToSelect(girl);
      setInterstitialTitle(`Switching Character: ${girl.name}`);
      setShowInterstitialAd(true);
    } else {
      setSelectedGirl(girl);
      setLastSelectedGirlId(girl.id);
    }
  };

  const handleCloseInterstitial = () => {
    setShowInterstitialAd(false);
    if (pendingGirlToSelect) {
      setSelectedGirl(pendingGirlToSelect);
      setLastSelectedGirlId(pendingGirlToSelect.id);
      setPendingGirlToSelect(null);
    }
  };

  // Rewarded Ad completion - 10 Chat Model:
  // Add +10 to limit: 25->35, 35->45, 45->55... (unlimited times)
  const handleRewardAdSuccess = () => {
    const newLimit = dailyLimit + 10;
    setDailyLimit(newLimit);
    localStorage.setItem('kavya_dailyLimit', newLimit.toString());
    setShowPaywall(false);
    setShowRewardToast(true);
    setTimeout(() => setShowRewardToast(false), 4500);
  };

  // Payment successful callback
  const handlePaymentSuccess = () => {
    setIsPremium(true);
    setShowPaywall(false);
    setShowPremiumToast(true);
    setTimeout(() => setShowPremiumToast(false), 4500);
  };

  const handleUpdateTrust = (girlId: number, newTrust: number) => {
    setTrustMap((prev) => ({
      ...prev,
      [girlId]: Math.min(100, Math.max(0, newTrust)),
    }));
  };

  const handleUpdateMood = (girlId: number, newMood: string) => {
    setMoodMap((prev) => ({
      ...prev,
      [girlId]: newMood,
    }));
  };

  const handleSetUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem('kavya_userName', name);
    localStorage.setItem('kavya_user_name', name);
    localStorage.setItem('userName', name);
  };

  // Quick simulate button for testing limit reached
  const handleSimulateLimitExhausted = () => {
    const today = getTodayDateStr();
    setDailyCount(dailyLimit);
    localStorage.setItem('kavya_dailyDate', today);
    localStorage.setItem('kavya_dailyCount', dailyLimit.toString());
    if (!isPremium) {
      setShowPaywall(true);
    }
  };

  // Quick reset count for testing
  const handleResetCount = () => {
    const today = getTodayDateStr();
    setDailyCount(0);
    setDailyLimit(25);
    localStorage.setItem('kavya_dailyDate', today);
    localStorage.setItem('kavya_dailyCount', '0');
    localStorage.setItem('kavya_dailyLimit', '25');
  };

  // Categories & Filtering (All | Horror | Romance | Drama | Fantasy | Thriller)
  const categories = [
    'All',
    'Horror',
    'Romance',
    'Drama',
    'Fantasy',
    'Thriller',
  ];

  const filteredGirls = GIRLS_LIST.filter((girl) => {
    const matchesSearch =
      girl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      girl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      girl.id.toString() === searchQuery.trim();

    const matchesCategory =
      selectedCategory === 'All' || girl.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Requirement 2: Native 18+ Age Verification Gate (First Screen)
  if (!isAgeVerified) {
    return (
      <NativeAgeGateScreen
        onConfirmAdult={() => {
          localStorage.setItem('kavya_age_verified_18', 'true');
          setIsAgeVerified(true);
        }}
      />
    );
  }

  // Requirement 3: Native App Loading Splash
  if (showSplash) {
    return <AppSplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 1. If user is not logged in, show Login Screen first!
  if (!userName) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col font-sans selection:bg-pink-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/10 shadow-lg px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-2.5">
          {/* Main Title & Badges Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-600/30 shrink-0">
                <Sparkles className="w-5 h-5 text-white animate-spin [animation-duration:8s]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-sm sm:text-base md:text-xl font-extrabold tracking-wide uppercase bg-gradient-to-r from-pink-300 via-purple-200 to-rose-300 bg-clip-text text-transparent leading-none">
                    KAVYA AI - VIRTUAL STORY WORLD
                  </h1>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/25 border border-rose-500/40 text-rose-300 text-[9px] sm:text-[10px] font-black shrink-0">
                    18+
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-pink-300/80 tracking-widest uppercase mt-1">
                  Virtual Story World (18+)
                </span>
              </div>
            </div>

            {/* Header Badges: Left (Quota) & Right ("Aap: [userName]" + Logout + Settings) */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Left Badge: "TODAY: X/25" OR after reward "TODAY: X/50" OR "TODAY: Unlimited 👑" */}
              {isPremium ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-extrabold text-xs shadow-md shadow-amber-500/25 border border-amber-300">
                  <span>TODAY: Unlimited 👑</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowPaywall(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-xs font-bold text-pink-300 transition-colors cursor-pointer"
                  title="Daily free message count (Click to earn +10 chats)"
                >
                  <Zap className="w-3.5 h-3.5 text-pink-400" />
                  <span>TODAY: {dailyCount}/{dailyLimit} ({Math.max(0, dailyLimit - dailyCount)} Free)</span>
                </button>
              )}

              {/* Right Badge: "Aap: {userName}" with small logout icon next to it */}
              <div className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 shadow-sm">
                {isPremium ? (
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
                ) : (
                  <User className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                )}
                <span className={isPremium ? 'text-amber-300 font-bold' : 'text-slate-200'}>
                  Aap: {userName}
                </span>

                {/* Small logout icon next to it which clears localStorage and reloads to login */}
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-full hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer ml-0.5"
                  title="Logout (Naam badlo)"
                  aria-label="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Settings button */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Settings &amp; Info"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4 text-pink-300" />
              </button>
            </div>
          </div>

          {/* Search, Filter, and Quick Test Row */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 50 girls by name, #id, title..."
                className="w-full bg-white/5 border border-white/10 focus:border-pink-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category pills with requested colors (Horror: Red, Romance: Pink, Drama: Yellow, Fantasy: Purple, Thriller: Blue) */}
            <div className="w-full overflow-x-auto scrollbar-none flex items-center gap-1.5 py-0.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                let activeClass = 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/25 border-pink-400/40';
                let inactiveHover = 'hover:border-pink-500/40';

                if (cat === 'Horror') {
                  activeClass = 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md shadow-red-600/30 border-red-400/40 font-bold';
                  inactiveHover = 'hover:border-red-500/40 hover:text-red-300';
                } else if (cat === 'Romance') {
                  activeClass = 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md shadow-pink-600/30 border-pink-400/40 font-bold';
                  inactiveHover = 'hover:border-pink-500/40 hover:text-pink-300';
                } else if (cat === 'Drama') {
                  activeClass = 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30 border-amber-300';
                  inactiveHover = 'hover:border-amber-400/40 hover:text-amber-300';
                } else if (cat === 'Fantasy') {
                  activeClass = 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border-purple-400/40 font-bold';
                  inactiveHover = 'hover:border-purple-500/40 hover:text-purple-300';
                } else if (cat === 'Thriller') {
                  activeClass = 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/30 border-blue-400/40 font-bold';
                  inactiveHover = 'hover:border-blue-500/40 hover:text-blue-300';
                }

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[11px] px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? activeClass
                        : `bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border-white/5 ${inactiveHover}`
                    }`}
                  >
                    {cat === 'All' ? `All (${GIRLS_LIST.length})` : cat}
                  </button>
                );
              })}

              {/* Dev/Testing pills */}
              <div className="ml-auto flex items-center gap-1 shrink-0 pl-2">
                <button
                  onClick={handleSimulateLimitExhausted}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 transition-colors whitespace-nowrap cursor-pointer"
                  title="Simulate daily limit exhausted"
                >
                  Simulate Limit
                </button>
                <button
                  onClick={handleResetCount}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                  title="Reset daily count to 0 and limit to 25"
                >
                  Reset 0
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Morning Reset Toast */}
      {showMorningToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-sm shadow-2xl border border-pink-300/40 flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-pink-200 animate-spin" />
          <span>Good Morning! Aaj ke 25 Free reset ho gaye 💖</span>
        </div>
      )}

      {/* Ad Reward Toast */}
      {showRewardToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-2xl border border-emerald-300 flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
          <span>Badhaai ho! +10 Free Chats unlock ho gaye 🎉 (Limit: {dailyLimit})</span>
        </div>
      )}

      {/* Premium Success Toast */}
      {showPremiumToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-sm shadow-2xl border border-amber-300 flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
          <Crown className="w-4 h-4 text-black fill-black" />
          <span>Premium Activated! 30 Days Unlimited Unlocked 🎉</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3.5 sm:p-5 pb-36">
        {activeTab === 'stories' && (
          <>
            {/* Middle bar: Keep only "50 AI Story Characters Online - Click any girl to start Hinglish chat" */}
            <div className="mb-4 flex items-center gap-2 p-2.5 rounded-xl bg-[#12121d] border border-white/10 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>50 AI Story Characters Online</span>
              <span className="text-white/30">•</span>
              <span className="text-pink-300 font-medium">Click any girl to start Hinglish chat</span>
            </div>

            {/* 2 Columns Grid of 50 Girls with exactly 190px height cards */}
            {filteredGirls.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4.5">
                {filteredGirls.map((girl) => (
                  <GirlCard
                    key={girl.id}
                    girl={girl}
                    trust={trustMap[girl.id] ?? 10}
                    currentMood={moodMap[girl.id] ?? girl.mood}
                    onClick={() => handleGirlClick(girl)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <p className="text-sm">Koi girl match nahi hui &quot;{searchQuery}&quot; se</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-pink-600/30 border border-pink-500/40 text-xs text-pink-200 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Footer with exact required disclaimer */}
            <footer className="mt-8 border-t border-white/10 bg-[#0a0a0f] pt-4 pb-28 px-4 text-center text-xs text-slate-400 space-y-1.5">
              <p className="tracking-wide text-pink-300 font-bold uppercase text-[11px] sm:text-xs">
                KAVYA AI STORIES • VIRTUAL STORY WORLD (18+)
              </p>
              <p className="text-xs text-slate-300 font-medium max-w-xl mx-auto">
                All stories are fictional AI content. Characters are fictional and 18+.
              </p>
              <p className="text-[10px] text-slate-400">
                Support: kavyastudio2026@gmail.com • Indus Appstore Verified • v1.1.0
              </p>
            </footer>
          </>
        )}

        {activeTab === 'chats' && (
          <ChatsListView
            onSelectGirl={handleGirlClick}
            trustMap={trustMap}
            moodMap={moodMap}
          />
        )}

        {activeTab === 'calls' && (
          <VoiceCallsHub userName={userName} />
        )}

        {activeTab === 'terms' && (
          <PrivacyTermsView />
        )}
      </main>

      {/* Real Google AdMob Banner Ad (Always visible bottom ad: ca-app-pub-7249172099866071/6820423085) */}
      <BannerAd
        className="fixed bottom-[54px] sm:bottom-[56px] inset-x-0 z-30"
        adUnitId={ADMOB_CONFIG.BANNER_AD_ID}
      />

      {/* Native Bottom Navigation */}
      <NativeBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'settings') {
            setShowSettings(true);
          } else {
            setActiveTab(tab);
          }
        }}
      />

      {/* Full-Screen AdModal (Real ID: ca-app-pub-7249172099866071/4110499268) */}
      <InterstitialAdModal
        isOpen={showInterstitialAd}
        title={interstitialTitle}
        adUnitId={ADMOB_CONFIG.REWARDED_AD_ID}
        onClose={handleCloseInterstitial}
      />

      {/* Chat Modal when any girl card is clicked */}
      {selectedGirl && (
        <ChatModal
          girl={selectedGirl}
          trust={trustMap[selectedGirl.id] ?? 10}
          mood={moodMap[selectedGirl.id] ?? selectedGirl.mood}
          userName={userName}
          dailyCount={dailyCount}
          dailyLimit={dailyLimit}
          isPremium={isPremium}
          onUpdateTrust={handleUpdateTrust}
          onUpdateMood={handleUpdateMood}
          onSetUserName={handleSetUserName}
          onIncrementDailyCount={handleIncrementDailyCount}
          onUserMessageSent={handleUserMessageSent}
          onTriggerPaywall={() => setShowPaywall(true)}
          onClose={() => setSelectedGirl(null)}
        />
      )}

      {/* Free Limit Rewarded Ad Popup Modal with exact user requested text & AdMob Test ID */}
      <FreeLimitModal
        isOpen={showPaywall}
        dailyCount={dailyCount}
        dailyLimit={dailyLimit}
        onClose={() => setShowPaywall(false)}
        onRewardAdSuccess={handleRewardAdSuccess}
      />

      {/* Settings Modal (with Logout option & APK Download) */}
      <SettingsModal
        isOpen={showSettings}
        userName={userName}
        userDob={userDob}
        isPremium={isPremium}
        dailyCount={dailyCount}
        dailyLimit={dailyLimit}
        onClose={() => setShowSettings(false)}
        onLogout={handleLogout}
        onOpenPaywall={() => setShowPaywall(true)}
        onOpenApkDownload={() => setShowApkModal(true)}
      />

      {/* Direct APK Download Modal */}
      <ApkDownloadModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
      />
    </div>
  );
}
