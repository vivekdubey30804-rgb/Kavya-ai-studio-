import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Girl } from '../data/girlsData';

interface AudioCallModalProps {
  isOpen: boolean;
  girl: Girl;
  userName: string | null;
  onEndCall: () => void;
}

export const AudioCallModal: React.FC<AudioCallModalProps> = ({
  isOpen,
  girl,
  userName,
  onEndCall,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [currentLine, setCurrentLine] = useState<string>('');
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Scripted simulated Hinglish voice lines for the 1-minute call
  const callLines = [
    `Arey ${userName || 'jaan'}! Hello! Meri aawaz aa rahi hai na tumhe?`,
    `Tumhara phone aaya toh mai turant bhaag ke aayi! Aaj ka din kaisa tha tumhara?`,
    `Acha suno, mujhe tumhari baat bohot pasand aati hai chat me bhi...`,
    `Tum jab itne pyaar se baat karte ho na, sach me bohot accha lagta hai 💕`,
    `Ek minute ka call bohot chhota hai, par aage aur baatein karenge theek hai?`,
    `Apna dhyaan rakhna aur mujhe bhoolna mat bilkul! Bye bye!`
  ];

  // Reset timer on open
  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(60);
      setCurrentLine(callLines[0]);

      // Speak initial line
      speakCallLine(callLines[0]);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  // Voice speech synthesis helper
  const speakCallLine = (text: string) => {
    if (!speakerEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.25;
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(
        (v) => v.lang.includes('hi') || v.lang.includes('IN') || v.name.includes('India')
      );
      if (indianVoice) utterance.voice = indianVoice;
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis error fallback ignored
    }
  };

  // 60-second countdown timer
  useEffect(() => {
    if (!isOpen) return;

    if (secondsRemaining <= 0) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      onEndCall();
      return;
    }

    // Change dialog line every ~10 seconds
    const lineIndex = Math.floor((60 - secondsRemaining) / 10);
    if (callLines[lineIndex] && callLines[lineIndex] !== currentLine) {
      setCurrentLine(callLines[lineIndex]);
      speakCallLine(callLines[lineIndex]);
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, secondsRemaining]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 select-none animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-sm bg-[#0c0c16] border border-pink-500/30 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl shadow-pink-950/60 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 inset-x-0 h-40 bg-gradient-to-b from-pink-600/30 to-transparent blur-3xl pointer-events-none" />

        {/* Call Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Connected • 1 Min Call</span>
        </div>

        {/* Character Avatar with Pulsing Rings */}
        <div className="relative mb-5">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 opacity-40 blur-md animate-pulse" />
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-pink-500 shadow-2xl">
            <img
              src={girl.avatar}
              alt={girl.name}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0c0c16] flex items-center justify-center text-white text-[11px]">
            <Phone className="w-3.5 h-3.5 fill-white" />
          </span>
        </div>

        {/* Character Name & Fictional 18+ Disclaimer */}
        <h3 className="text-xl font-black text-white tracking-wide">
          {girl.name}
        </h3>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
          (Fictional AI Character - 18+)
        </p>
        <p className="text-xs text-pink-300/80 font-medium mt-0.5">
          {girl.title}
        </p>

        {/* Call Timer Display */}
        <div className="my-4 px-4 py-1.5 rounded-2xl bg-black/60 border border-white/10 font-mono text-2xl font-black text-white tracking-widest shadow-inner">
          {timeFormatted}
        </div>

        {/* Subtitle / Voice dialogue bubble */}
        <div className="w-full min-h-[58px] p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-pink-200/90 italic leading-relaxed mb-6 flex items-center justify-center">
          &quot;{currentLine}&quot;
        </div>

        {/* Audio Waveform Graphic */}
        <div className="flex items-center justify-center gap-1.5 h-8 mb-6">
          {[40, 75, 95, 60, 85, 50, 90, 65, 80, 45].map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-pink-500 to-purple-400 animate-pulse"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 120}ms`,
                animationDuration: '900ms',
              }}
            />
          ))}
        </div>

        {/* Control Action Buttons */}
        <div className="flex items-center justify-center gap-4 w-full">
          {/* Mute Mic */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-white/10 border-white/15 text-slate-200 hover:bg-white/20'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call (Red Button) */}
          <button
            onClick={() => {
              if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              onEndCall();
            }}
            className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-rose-600/50 transition-all cursor-pointer border-2 border-rose-400"
            title="End Call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          {/* Speaker Voice Toggle */}
          <button
            onClick={() => {
              const nextState = !speakerEnabled;
              setSpeakerEnabled(nextState);
              if (!nextState && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              } else if (nextState) {
                speakCallLine(currentLine);
              }
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              speakerEnabled
                ? 'bg-pink-600/30 border-pink-500/50 text-pink-300'
                : 'bg-white/10 border-white/15 text-slate-400 hover:bg-white/20'
            }`}
            title={speakerEnabled ? 'Speaker Mute' : 'Speaker On'}
          >
            {speakerEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        <p className="mt-4 text-[10px] text-slate-400">
          Call will automatically disconnect when 1:00 timer expires.
        </p>
      </div>
    </div>
  );
};
