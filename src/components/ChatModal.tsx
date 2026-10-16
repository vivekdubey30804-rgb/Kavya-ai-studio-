import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Heart,
  Shield,
  Volume2,
  VolumeX,
  RotateCcw,
  UserCheck,
  Flame,
  Lock,
  Phone,
  Trash2,
} from 'lucide-react';
import { Girl } from '../data/girlsData';
import { checkCustomRules } from '../utils/chatLogic';
import { BannerAd } from './BannerAd';
import { AudioCallModal } from './AudioCallModal';
import { InterstitialAdModal } from './InterstitialAdModal';
import { ADMOB_CONFIG } from '../config/admob';

export interface ChatMessage {
  id: string;
  sender: 'girl' | 'user';
  text: string;
  timestamp: string;
}

interface ChatModalProps {
  girl: Girl;
  trust: number;
  mood: string;
  userName: string | null;
  dailyCount: number;
  dailyLimit?: number;
  isPremium: boolean;
  onUpdateTrust: (girlId: number, newTrust: number) => void;
  onUpdateMood: (girlId: number, newMood: string) => void;
  onSetUserName: (name: string) => void;
  onIncrementDailyCount: () => void;
  onTriggerPaywall: () => void;
  onClose: () => void;
  onUserMessageSent?: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  girl,
  trust,
  mood,
  userName,
  dailyCount,
  dailyLimit = 25,
  isPremium,
  onUpdateTrust,
  onUpdateMood,
  onSetUserName,
  onIncrementDailyCount,
  onTriggerPaywall,
  onClose,
  onUserMessageSent,
}) => {
  // Requirement 4: Save all chats in localStorage with key chat_[characterId]. Load history when user returns.
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`chat_${girl.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [
      {
        id: `init-${girl.id}`,
        sender: 'girl',
        text: girl.initialMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  // Requirement 5: Monetization Ad count state (0/2) saved in localStorage
  const [callAdCount, setCallAdCount] = useState<number>(() => {
    const saved = localStorage.getItem('kavya_call_ad_count');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [showCallAd, setShowCallAd] = useState(false);
  const [showAudioCall, setShowAudioCall] = useState(false);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [trustToast, setTrustToast] = useState<{ text: string; positive: boolean } | null>(null);

  // Sync chat history to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem(`chat_${girl.id}`, JSON.stringify(messages));
    } catch {
      // ignore storage full
    }
  }, [messages, girl.id]);

  // Load chat history if girl changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`chat_${girl.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setMessages([
      {
        id: `init-${girl.id}`,
        sender: 'girl',
        text: girl.initialMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [girl.id, girl.initialMessage]);

  // Clear Chat function for Requirement 4
  const handleClearChat = () => {
    try {
      localStorage.removeItem(`chat_${girl.id}`);
    } catch {
      // ignore
    }
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'girl',
        text: girl.initialMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setTrustToast({
      text: 'Chat history cleared! 🗑️',
      positive: true,
    });
    setTimeout(() => {
      setTrustToast(null);
    }, 2500);
  };

  // Requirement 5: Free Call button click handler
  const handleFreeCallClick = () => {
    if (callAdCount >= 2) {
      // 2 ads already watched -> enable and open Call!
      setShowAudioCall(true);
    } else {
      // Watch Ad (0/2 or 1/2)
      setShowCallAd(true);
    }
  };

  // On Ad watched callback
  const handleCallAdWatched = () => {
    const nextCount = Math.min(2, callAdCount + 1);
    setCallAdCount(nextCount);
    localStorage.setItem('kavya_call_ad_count', nextCount.toString());

    if (nextCount >= 2) {
      setTrustToast({
        text: '🎉 2 Ads watched! 1 Min Call UNLOCKED! Click Call to start.',
        positive: true,
      });
    } else {
      setTrustToast({
        text: `Ad 1/2 Watched! Watch 1 more ad to unlock 1 Min Call 📞`,
        positive: true,
      });
    }
    setTimeout(() => setTrustToast(null), 3500);
  };

  // On 1 Min Call ended callback
  const handleAudioCallEnded = () => {
    setShowAudioCall(false);
    setCallAdCount(0);
    localStorage.setItem('kavya_call_ad_count', '0');
    setTrustToast({
      text: '1 Minute Call completed. Ad counter reset to 0/2.',
      positive: true,
    });
    setTimeout(() => setTrustToast(null), 3500);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Show story level point change notification (+1 per user SMS)
  const triggerTrustToast = (delta: number) => {
    if (delta === 0) return;
    const positive = delta > 0;
    setTrustToast({
      text: `${positive ? '+' : ''}${delta} Level Point! ${positive ? 'Level up 💕' : 'Level down 😤'}`,
      positive,
    });
    setTimeout(() => {
      setTrustToast(null);
    }, 2800);
  };

  // Text-to-speech for Hinglish voice
  const speakText = (text: string) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.2;
    // Prefer Indian English / Hindi voice if available
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(
      (v) => v.lang.includes('hi') || v.lang.includes('IN') || v.name.includes('India')
    );
    if (indianVoice) {
      utterance.voice = indianVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    // Check daily free limit
    if (!isPremium && dailyCount >= dailyLimit) {
      onTriggerPaywall();
      return;
    }

    const rawText = textToSend !== undefined ? textToSend : inputText;
    const text = rawText.trim();
    if (!text || isLoading) return;

    // Increment dailyCount for non-premium users
    if (!isPremium) {
      onIncrementDailyCount();
    }

    setInputText('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    if (onUserMessageSent) {
      onUserMessageSent();
    }

    try {
      // 1. Check local deterministic rules first for instant responsive feel & guaranteed precision
      const historyTexts = messages.map((m) => m.text);
      const ruleResult = checkCustomRules(
        text,
        trust,
        girl.name,
        girl.personality,
        userName,
        historyTexts
      );

      if (ruleResult.isHandled) {
        if (ruleResult.detectedName) {
          onSetUserName(ruleResult.detectedName);
        }

        // User sends 1 SMS = Level +1 point (slow progression)
        const delta = ruleResult.trustDelta < 0 ? -1 : 1;
        const newTrust = Math.min(100, Math.max(0, trust + delta));
        onUpdateTrust(girl.id, newTrust);
        if (ruleResult.newMood) {
          onUpdateMood(girl.id, ruleResult.newMood);
        }
        triggerTrustToast(delta);

        // Small realistic typing pause
        await new Promise((r) => setTimeout(r, 450));

        const replyMsg: ChatMessage = {
          id: `g-${Date.now()}`,
          sender: 'girl',
          text: ruleResult.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, replyMsg]);
        speakText(ruleResult.reply);
        setIsLoading(false);
        return;
      }

      // 2. Query server /api/chat (using Gemini API internally)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          girlId: girl.id,
          girlName: girl.name,
          girlPersonality: girl.personality,
          girlMood: mood,
          trust,
          userName,
          message: text,
          history: messages.slice(-10).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            text: m.text,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.detectedName) {
          onSetUserName(data.detectedName);
        }
        // Requirement: 1 message = Level +1 point only
        const delta = typeof data.trust === 'number'
          ? (data.trust - trust < 0 ? -1 : 1)
          : 1;
        const newTrust = Math.min(100, Math.max(0, trust + delta));
        onUpdateTrust(girl.id, newTrust);
        if (data.mood) {
          onUpdateMood(girl.id, data.mood);
        }
        triggerTrustToast(delta);

        const replyMsg: ChatMessage = {
          id: `g-${Date.now()}`,
          sender: 'girl',
          text: data.reply || 'Sach me? Mujhe bohot accha laga!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, replyMsg]);
        speakText(replyMsg.text);
      } else {
        throw new Error('Server returned non-200');
      }
    } catch (err) {
      console.error('Chat error:', err);
      // Fallback in-character reply
      const fallbackReply = `Tumhari baatein dil ko chhu leti hain ${userName ? userName : ''}! Aur batao, kya chal raha hai?`;
      onUpdateTrust(girl.id, Math.min(100, trust + 1));
      triggerTrustToast(1);
      const replyMsg: ChatMessage = {
        id: `g-${Date.now()}`,
        sender: 'girl',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
      speakText(fallbackReply);
    } finally {
      setIsLoading(false);
    }
  };

  // Preset quick prompt chips for easy testing & bug verification
  const quickChips = [
    { label: 'Mera naam Vivek Dubey hai', desc: 'Name Extraction' },
    { label: 'Kesi baat karu', desc: 'Blacklist Test' },
    { label: 'Me chahta hu tum meri gf bani', desc: 'Story Level GF Check' },
    { label: 'Kyun naam pasand nahi aaya', desc: 'Pasand Aaya Test' },
    { label: 'Kyun gussa aa raha hai', desc: 'Explain Anger' },
    { label: 'Tum kyun ro rahi ho', desc: 'Has Rahi Hu Test' },
  ];

  // Trust badge styling based on trust score
  const getTrustColor = (val: number) => {
    if (val < 20) return 'from-rose-500 to-red-600 text-rose-300';
    if (val < 50) return 'from-amber-500 to-yellow-600 text-amber-300';
    if (val < 75) return 'from-emerald-500 to-teal-600 text-emerald-300';
    return 'from-pink-500 to-purple-600 text-pink-300';
  };

  const getTrustStatus = (val: number) => {
    if (val < 20) return 'Stranger (Guarded)';
    if (val < 50) return 'Getting Friendly';
    if (val < 75) return 'Close Friend 💕';
    return 'Max Story Level ❤️';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full h-full sm:h-[92vh] max-w-2xl bg-[#0e0e17] sm:rounded-[24px] border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#141422] border-b border-white/10 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Back Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-pink-300 border border-white/10 transition-colors"
              aria-label="Back to 50 girls"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Girl Avatar */}
            <div className="relative shrink-0">
              <img
                src={girl.avatar}
                alt={girl.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-pink-500/60 shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#141422]" />
            </div>

            {/* Girl Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-base leading-tight truncate">
                  {girl.name}
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 shrink-0">
                  #{girl.id < 10 ? `0${girl.id}` : girl.id}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5 truncate">
                (Fictional AI Character - 18+)
              </p>
              <p className="text-xs text-pink-200/70 truncate">{girl.title}</p>
            </div>
          </div>

          {/* Right controls: Free Call, Clear Chat, TTS sound toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Free Call Button (Requirement 5: Watch 2 Ads to Unlock 1 Min Call (0/2)) */}
            <button
              onClick={handleFreeCallClick}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border ${
                callAdCount >= 2
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/50 animate-pulse'
                  : 'bg-gradient-to-r from-pink-600/25 to-purple-600/25 hover:from-pink-600/40 hover:to-purple-600/40 border-pink-500/40 text-pink-200'
              }`}
              title={
                callAdCount >= 2
                  ? '1 Min Call Unlocked! Click to start call.'
                  : `Watch 2 Ads to Unlock 1 Min Call (${callAdCount}/2)`
              }
            >
              <Phone className={`w-3.5 h-3.5 ${callAdCount >= 2 ? 'text-white fill-white' : 'text-pink-400'}`} />
              <span className="font-mono text-[11px] sm:text-xs">
                {callAdCount >= 2 ? 'Call (Ready!)' : `Free Call (${callAdCount}/2)`}
              </span>
            </button>

            {/* Clear Chat Button (Requirement 4: Persistent after restart) */}
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
              title="Clear Chat History (Persistent in localStorage)"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline">Clear Chat</span>
            </button>

            {/* TTS sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-pink-600/30 border-pink-500/50 text-pink-300'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
              }`}
              title={soundEnabled ? 'Voice Mute' : 'Voice Bolke Sunao'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dynamic Story Level & Mood Subheader Bar */}
        <div className="bg-[#12121d] px-4 py-2 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Story Level Meter */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
            <div className="flex items-center gap-1 text-xs font-semibold text-pink-300">
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
              <span>Story Level:</span>
              <span className="font-mono text-white font-bold">{trust}%</span>
            </div>

            {/* Visual Bar */}
            <div className="flex-1 max-w-[130px] h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full bg-gradient-to-r ${getTrustColor(trust)} transition-all duration-500`}
                style={{ width: `${Math.min(100, Math.max(5, trust))}%` }}
              />
            </div>

            <span className="text-[10px] text-pink-200/60 hidden sm:inline">
              ({getTrustStatus(trust)})
            </span>
          </div>

          {/* Mood Badge & User Name & Daily Free Quota */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Daily quota badge */}
            {isPremium ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-extrabold flex items-center gap-1 shadow-sm">
                <span>TODAY: Unlimited 👑</span>
              </span>
            ) : (
              <button
                onClick={onTriggerPaywall}
                className="text-xs px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer bg-white/5 border-white/10 text-pink-300 hover:bg-white/10"
                title="Daily Free Quota (Watch 1 Ad for +10 chats)"
              >
                <span>TODAY: {dailyCount}/{(dailyLimit === 55 || !dailyLimit) ? 25 : dailyLimit} ({Math.max(0, ((dailyLimit === 55 || !dailyLimit) ? 25 : dailyLimit) - dailyCount)} Free)</span>
              </button>
            )}

            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-emerald-300 font-medium">
              Mood: <strong className="text-white">{mood}</strong>
            </span>

            {userName && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-200 font-medium flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-pink-400" />
                Aap: <strong className="text-white">{userName}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Live Trust Floating Toast Notification */}
        {trustToast && (
          <div
            className={`absolute top-24 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl border backdrop-blur-md animate-in slide-in-from-top-2 duration-200 ${
              trustToast.positive
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-950/90 text-rose-300 border-rose-500/40'
            }`}
          >
            {trustToast.text}
          </div>
        )}

        {/* Chat Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#0a0a0f]/90">
          {/* Personality intro banner */}
          <div className="mx-auto max-w-md p-2.5 rounded-xl bg-white/5 border border-white/10 text-center mb-3">
            <p className="text-[11px] text-pink-200/80 leading-relaxed">
              ✨ <strong>{girl.name}</strong> • {girl.personality}
            </p>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'girl' && (
                <img
                  src={girl.avatar}
                  alt={girl.name}
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-pink-500/40 mb-1"
                />
              )}

              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-[13px] sm:text-sm leading-relaxed shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-br-xs'
                    : 'bg-[#181829] border border-white/10 text-slate-100 rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span
                  className={`block text-[10px] mt-1 ${
                    msg.sender === 'user' ? 'text-pink-200/70 text-right' : 'text-slate-400/80 text-left'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start animate-pulse">
              <img
                src={girl.avatar}
                alt={girl.name}
                className="w-7 h-7 rounded-full object-cover shrink-0 border border-pink-500/40 mb-1"
              />
              <div className="bg-[#181829] border border-white/10 rounded-2xl rounded-bl-xs px-4 py-3 flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Test Prompt Chips */}
        <div className="bg-[#10101c] px-3 py-2 border-t border-white/10 overflow-x-auto scrollbar-none shrink-0">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-[11px] font-semibold text-pink-300/80 flex items-center gap-1 pl-1">
              <Sparkles className="w-3 h-3 text-pink-400" /> Test Prompts:
            </span>
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.label)}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-pink-600/20 active:bg-pink-600/30 text-slate-200 hover:text-pink-200 border border-white/10 hover:border-pink-500/40 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Box */}
        <div className="p-3 bg-[#141422] border-t border-white/10 shrink-0">
          {!isPremium && dailyCount >= dailyLimit && (
            <div className="mb-2.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-purple-950/90 border border-amber-400/50 flex items-center justify-between gap-2 animate-in fade-in">
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-amber-300">Free Chat Khatam! 🔓 ({dailyLimit}/{dailyLimit})</p>
                <p className="text-[11px] text-pink-200/90 truncate">Ek video dekho aur 10 aur chat pao!</p>
              </div>
              <button
                type="button"
                onClick={onTriggerPaywall}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md shadow-amber-400/30 active:scale-95 transition-all whitespace-nowrap cursor-pointer border border-amber-300"
              >
                VIDEO DEKHO +10 CHAT
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onClick={() => {
                if (!isPremium && dailyCount >= dailyLimit) {
                  onTriggerPaywall();
                }
              }}
              placeholder={
                !isPremium && dailyCount >= dailyLimit
                  ? `Free Chat Khatam! (${dailyLimit}/${dailyLimit}) - Video dekho +10 chat pao...`
                  : `Baat karo ${girl.name} se (Hinglish)...`
              }
              disabled={isLoading || (!isPremium && dailyCount >= dailyLimit)}
              className="flex-1 bg-white/5 border border-white/15 focus:border-pink-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400/70 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={(!inputText.trim() && (isPremium || dailyCount < dailyLimit)) || isLoading || (!isPremium && dailyCount >= dailyLimit)}
              className="p-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 active:scale-95 text-white font-medium shadow-lg shadow-pink-600/30 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-1.5 px-1">
            <p className="text-[10px] text-slate-400/80">
              💡 Tip: Bolo &quot;Mera naam Vivek Dubey hai&quot; to save your name
            </p>
          </div>
        </div>

        {/* Fixed Banner Ad at bottom of Chat Modal (Real ID: ca-app-pub-7249172099866071/6820423085) */}
        <BannerAd
          className="shrink-0"
          adUnitId={ADMOB_CONFIG.BANNER_AD_ID}
        />
      </div>

      {/* 1 Min Simulated Voice Call Modal */}
      <AudioCallModal
        isOpen={showAudioCall}
        girl={girl}
        userName={userName}
        onEndCall={handleAudioCallEnded}
      />

      {/* Rewarded Ad to unlock 1 Min Call (Real ID: ca-app-pub-7249172099866071/4110499268) */}
      <InterstitialAdModal
        isOpen={showCallAd}
        title="Watch Ad to Unlock 1 Min Call"
        adUnitId={ADMOB_CONFIG.REWARDED_AD_ID}
        onClose={() => setShowCallAd(false)}
        onAdWatched={handleCallAdWatched}
      />
    </div>
  );
};
