import React from 'react';
import { Sparkles } from 'lucide-react';
import { Girl, GirlCategory } from '../data/girlsData';

interface GirlCardProps {
  girl: Girl;
  trust: number;
  currentMood: string;
  onClick: () => void;
}

// Category-based visual theme: Tag color and background glow
export function getCategoryTheme(category: GirlCategory) {
  switch (category) {
    case 'Horror':
      return {
        tagBg: 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-400/40 shadow-red-600/30',
        tagIconColor: 'text-red-200',
        borderColor: 'border-red-500/45',
        hoverBorder: 'group-hover:border-red-400',
        shadowClass: 'shadow-[0_0_18px_rgba(239,68,68,0.28)]',
        hoverShadowClass: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.65)]',
        glowCorner: 'bg-red-500/30',
        dotBg: 'bg-red-500',
        dotPing: 'bg-red-400',
        textAccent: 'text-red-300',
        innerBorder: 'group-hover:border-red-500/60',
        focusRing: 'focus:ring-red-500/80',
        levelBadgeBorder: 'border-red-500/30',
      };
    case 'Romance':
      return {
        tagBg: 'bg-gradient-to-r from-pink-600 to-rose-500 text-white border-pink-400/40 shadow-pink-600/30',
        tagIconColor: 'text-pink-200',
        borderColor: 'border-pink-500/45',
        hoverBorder: 'group-hover:border-pink-400',
        shadowClass: 'shadow-[0_0_18px_rgba(236,72,153,0.28)]',
        hoverShadowClass: 'group-hover:shadow-[0_0_30px_rgba(236,72,153,0.65)]',
        glowCorner: 'bg-pink-500/30',
        dotBg: 'bg-pink-500',
        dotPing: 'bg-pink-400',
        textAccent: 'text-pink-300',
        innerBorder: 'group-hover:border-pink-500/60',
        focusRing: 'focus:ring-pink-500/80',
        levelBadgeBorder: 'border-pink-500/30',
      };
    case 'Drama':
      return {
        tagBg: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black border-amber-300 shadow-amber-500/30',
        tagIconColor: 'text-slate-950',
        borderColor: 'border-amber-400/50',
        hoverBorder: 'group-hover:border-yellow-400',
        shadowClass: 'shadow-[0_0_18px_rgba(245,158,11,0.3)]',
        hoverShadowClass: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.65)]',
        glowCorner: 'bg-amber-500/30',
        dotBg: 'bg-amber-400',
        dotPing: 'bg-yellow-400',
        textAccent: 'text-amber-300',
        innerBorder: 'group-hover:border-amber-400/60',
        focusRing: 'focus:ring-amber-500/80',
        levelBadgeBorder: 'border-amber-500/30',
      };
    case 'Fantasy':
      return {
        tagBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400/40 shadow-purple-600/30',
        tagIconColor: 'text-purple-200',
        borderColor: 'border-purple-500/45',
        hoverBorder: 'group-hover:border-purple-400',
        shadowClass: 'shadow-[0_0_18px_rgba(168,85,247,0.28)]',
        hoverShadowClass: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.65)]',
        glowCorner: 'bg-purple-500/30',
        dotBg: 'bg-purple-500',
        dotPing: 'bg-purple-400',
        textAccent: 'text-purple-300',
        innerBorder: 'group-hover:border-purple-500/60',
        focusRing: 'focus:ring-purple-500/80',
        levelBadgeBorder: 'border-purple-500/30',
      };
    case 'Thriller':
    default:
      return {
        tagBg: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-400/40 shadow-blue-600/30',
        tagIconColor: 'text-cyan-200',
        borderColor: 'border-blue-500/45',
        hoverBorder: 'group-hover:border-blue-400',
        shadowClass: 'shadow-[0_0_18px_rgba(59,130,246,0.28)]',
        hoverShadowClass: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.65)]',
        glowCorner: 'bg-blue-500/30',
        dotBg: 'bg-blue-500',
        dotPing: 'bg-blue-400',
        textAccent: 'text-blue-300',
        innerBorder: 'group-hover:border-blue-500/60',
        focusRing: 'focus:ring-blue-500/80',
        levelBadgeBorder: 'border-blue-500/30',
      };
  }
}

export const GirlCard: React.FC<GirlCardProps> = ({
  girl,
  trust,
  currentMood,
  onClick,
}) => {
  const activeMood = currentMood || girl.mood;
  const theme = getCategoryTheme(girl.category);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative h-[190px] w-full rounded-[16px] overflow-hidden cursor-pointer select-none border transition-all duration-300 focus:outline-none focus:ring-2 ${theme.borderColor} ${theme.hoverBorder} ${theme.shadowClass} ${theme.hoverShadowClass} ${theme.focusRing}`}
    >
      {/* Real Unsplash Photo */}
      <img
        src={girl.avatar}
        alt={girl.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-108"
      />

      {/* Deep Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-black/25 group-hover:via-[#0a0a0f]/50 transition-colors duration-300" />

      {/* Top Bar: Number 1-50 (top left) & Category Tag (top right) */}
      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
        {/* Number badge */}
        <span className="inline-flex items-center justify-center min-w-6 h-5 px-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[11px] font-mono font-bold text-white shadow-sm">
          #{girl.id < 10 ? `0${girl.id}` : girl.id}
        </span>

        {/* Category Tag (Horror: Red, Romance: Pink, Drama: Yellow, Fantasy: Purple, Thriller: Blue) */}
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-md text-[10px] font-extrabold tracking-wider shadow-md border ${theme.tagBg}`}
        >
          <Sparkles className={`w-2.5 h-2.5 ${theme.tagIconColor} animate-pulse`} />
          {girl.category}
        </span>
      </div>

      {/* Category ambient corner background glow */}
      <div
        className={`absolute -bottom-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-colors duration-500 ${theme.glowCorner}`}
      />

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 inset-x-0 p-3 z-10 flex flex-col justify-end">
        {/* Story Level & Dynamic Mood Pill */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme.dotPing}`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${theme.dotBg}`}
              />
            </span>
            <span
              className={`text-[10px] font-medium tracking-wide transition-colors duration-300 ${theme.textAccent}`}
            >
              {activeMood}
            </span>
          </div>
          <span className={`text-[10px] font-mono text-white font-semibold bg-black/60 px-1.5 py-0.2 rounded border ${theme.levelBadgeBorder}`}>
            Story Level {trust}%
          </span>
        </div>

        {/* Name */}
        <h3
          className={`font-bold text-white text-sm sm:text-[15px] leading-tight line-clamp-1 transition-colors drop-shadow-md group-hover:${theme.textAccent}`}
        >
          {girl.name}
        </h3>

        {/* Fictional AI Character - 18+ Disclaimer */}
        <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
          (Fictional AI Character - 18+)
        </p>

        {/* Title below name */}
        <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-snug line-clamp-1 mt-0.5 drop-shadow-sm">
          {girl.title}
        </p>
      </div>

      {/* Category ambient border glow line */}
      <div
        className={`absolute inset-0 rounded-[16px] pointer-events-none border border-transparent transition-all duration-300 ${theme.innerBorder}`}
      />
    </div>
  );
};
