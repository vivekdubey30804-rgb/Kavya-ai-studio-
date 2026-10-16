import React, { useState, useRef } from 'react';
import { Sparkles, ArrowRight, Shield, Calendar, AlertTriangle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (name: string, dob: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [nameInput, setNameInput] = useState('');
  const [dobInput, setDobInput] = useState('');
  const [error, setError] = useState('');
  const [ageDisplay, setAgeDisplay] = useState<number | null>(null);
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  // Parse DD/MM/YYYY or YYYY-MM-DD and compute age
  const parseDobAndCalculateAge = (input: string): { age: number | null; formatted: string | null } => {
    const trimmed = input.trim();
    if (!trimmed) return { age: null, formatted: null };

    let day = 0;
    let month = 0;
    let year = 0;

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      const parts = trimmed.split('/');
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const parts = trimmed.split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      const parts = trimmed.split('-');
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    } else {
      return { age: null, formatted: null };
    }

    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1920 || year > 2026) {
      return { age: null, formatted: null };
    }

    const birthDate = new Date(year, month - 1, day);
    if (
      birthDate.getFullYear() !== year ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getDate() !== day
    ) {
      return { age: null, formatted: null };
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const formatted = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    return { age, formatted };
  };

  const handleDobChange = (val: string) => {
    setDobInput(val);
    if (error) setError('');
    const { age } = parseDobAndCalculateAge(val);
    setAgeDisplay(age);
  };

  const handleNativeDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value; // YYYY-MM-DD
    if (!rawVal) return;
    const parts = rawVal.split('-');
    if (parts.length === 3) {
      const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
      setDobInput(formatted);
      if (error) setError('');
      const { age } = parseDobAndCalculateAge(formatted);
      setAgeDisplay(age);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      setError('Kripya apna naam enter karein');
      return;
    }

    if (!dobInput.trim()) {
      setError('Kripya apni Date of Birth (DOB) select karein');
      return;
    }

    const { age, formatted } = parseDobAndCalculateAge(dobInput);

    if (age === null || !formatted) {
      setError('Kripya valid Date of Birth enter karein (Format: DD/MM/YYYY, e.g. 03/06/2004)');
      return;
    }

    // MANDATORY 18+ check
    if (age < 18) {
      setError('Sorry, you must be 18+ to use this app. This app is for 18+ Mature Audience only.');
      return;
    }

    // 18+ verified: Save to localStorage and proceed
    localStorage.setItem('kavya_userName', trimmedName);
    localStorage.setItem('kavya_user_name', trimmedName);
    localStorage.setItem('userName', trimmedName);
    localStorage.setItem('kavya_user_dob', formatted);
    localStorage.setItem('userDob', formatted);
    localStorage.setItem('kavya_age_verified_18', 'true');

    onLogin(trimmedName, formatted);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none font-sans">
      {/* Background ambient glowing gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-rose-500/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
        {/* Center Card */}
        <div className="w-full bg-[#12121e]/90 border border-white/10 rounded-[24px] p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
          
          {/* Logo with Spark icon and pink style */}
          <div className="flex flex-col items-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-purple-600 flex items-center justify-center shadow-xl shadow-pink-600/35 border border-pink-400/40 mb-3">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase bg-gradient-to-r from-pink-400 via-purple-300 to-rose-400 bg-clip-text text-transparent drop-shadow-md">
                KAVYA AI STORIES
              </h1>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/30 border border-rose-500/50 text-rose-300 text-[10px] font-black">
                18+
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest text-pink-200/75 font-semibold mt-1">
              Virtual Story World
            </p>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
            Apni Kahani Shuru Karo
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            Apna naam aur Date of Birth (18+ Required) enter karein
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-3.5">
            {/* Field 1: Name */}
            <div className="text-left space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider pl-1">
                Aapka Naam
              </label>
              <input
                type="text"
                autoFocus
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Apna Naam Likho"
                maxLength={30}
                className="w-full bg-white/5 border border-white/15 focus:border-pink-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all text-left"
              />
            </div>

            {/* Field 2: Date of Birth (DOB) with Calendar picker */}
            <div className="text-left space-y-1">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-pink-400" />
                  <span>Date of Birth (DOB)</span>
                  <span className="text-[10px] text-rose-400 font-bold">(18+ Only)</span>
                </label>
                {ageDisplay !== null && (
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      ageDisplay >= 18
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    Age: {ageDisplay} yrs {ageDisplay >= 18 ? '✓' : '✗'}
                  </span>
                )}
              </div>

              {/* Hybrid Date Input: Text with Calendar Button trigger */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={dobInput}
                  onChange={(e) => handleDobChange(e.target.value)}
                  placeholder="DD/MM/YYYY example 03/06/2004"
                  maxLength={10}
                  className="w-full bg-white/5 border border-white/15 focus:border-pink-500 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all font-mono"
                />

                {/* Calendar picker button */}
                <button
                  type="button"
                  onClick={() => hiddenDateInputRef.current?.showPicker ? hiddenDateInputRef.current.showPicker() : hiddenDateInputRef.current?.click()}
                  className="absolute right-2 p-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/35 text-pink-300 hover:text-white transition-colors cursor-pointer border border-pink-500/30"
                  title="Open Calendar Date Picker"
                >
                  <Calendar className="w-4 h-4" />
                </button>

                {/* Hidden native HTML5 date input for OS Calendar modal */}
                <input
                  type="date"
                  ref={hiddenDateInputRef}
                  onChange={handleNativeDateSelect}
                  max="2008-10-14"
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>

              <p className="text-[10px] text-slate-400 pl-1">
                Calendar icon par click karein ya type karein (e.g. 03/06/2004)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-left flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="font-medium leading-tight">{error}</span>
              </div>
            )}

            {/* Pink gradient button */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-base shadow-lg shadow-pink-600/35 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-pink-400/30 mt-2"
            >
              <span>Kahani Shuru Karo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Preset Buttons (18+ compliant sample dates) */}
          <div className="mt-4 pt-3.5 border-t border-white/5 w-full flex flex-col gap-2 text-[11px] text-slate-400 text-left">
            <div className="flex items-center justify-between">
              <span>Quick fill DOB (18+):</span>
              <div className="flex items-center gap-1.5">
                {[
                  { label: '03/06/2004', name: 'Vivek' },
                  { label: '15/08/2001', name: 'Aryan' },
                  { label: '22/11/1999', name: 'Kabir' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setDobInput(preset.label);
                      if (!nameInput) setNameInput(preset.name);
                      handleDobChange(preset.label);
                    }}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-pink-300 hover:text-white border border-white/10 transition-colors text-[10px] font-mono cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 18+ Disclaimer Footer */}
          <div className="mt-4 pt-2 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-slate-400 font-medium">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Fictional AI Characters • 18+ Mature Audience Only</span>
          </div>
        </div>
      </div>
    </div>
  );
};

