import React from 'react';
import { MessageSquare, Sparkles, Heart, ChevronRight, User } from 'lucide-react';
import { GIRLS_LIST, Girl } from '../data/girlsData';

interface ChatsListViewProps {
  onSelectGirl: (girl: Girl) => void;
  trustMap: Record<number, number>;
  moodMap: Record<number, string>;
}

export const ChatsListView: React.FC<ChatsListViewProps> = ({
  onSelectGirl,
  trustMap,
  moodMap,
}) => {
  // Check which girls have saved chats in localStorage
  const activeChats = GIRLS_LIST.map((girl) => {
    let lastMsg = girl.initialMessage;
    let hasCustomChat = false;
    let msgCount = 1;

    try {
      const saved = localStorage.getItem(`chat_${girl.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          lastMsg = parsed[parsed.length - 1].text;
          hasCustomChat = parsed.length > 1;
          msgCount = parsed.length;
        }
      }
    } catch {}

    return {
      girl,
      lastMsg,
      hasCustomChat,
      msgCount,
      trust: trustMap[girl.id] ?? 10,
      mood: moodMap[girl.id] ?? girl.mood,
    };
  });

  // Sort by active chats first
  const sorted = [...activeChats].sort((a, b) => {
    if (a.hasCustomChat && !b.hasCustomChat) return -1;
    if (!a.hasCustomChat && b.hasCustomChat) return 1;
    return a.girl.id - b.girl.id;
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-4 pb-28 text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h1 className="text-xl font-black text-white tracking-wide">
            Conversations
          </h1>
          <p className="text-xs text-slate-400">
            50 AI Story Characters • Local persistent chat history
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 font-mono text-xs font-bold">
          50 Online
        </span>
      </div>

      {/* List */}
      <div className="space-y-2">
        {sorted.map(({ girl, lastMsg, hasCustomChat, trust, mood }) => (
          <div
            key={girl.id}
            onClick={() => onSelectGirl(girl)}
            className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#11111d] hover:bg-[#161625] border border-white/10 hover:border-pink-500/40 transition-all cursor-pointer shadow-md group"
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={girl.avatar}
                alt={girl.name}
                className="w-13 h-13 rounded-2xl object-cover object-top border-2 border-pink-500/40 group-hover:scale-105 transition-transform"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#11111d]" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm truncate">
                    {girl.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    (18+ Fictional AI)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-pink-300">
                  <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                  <span>{trust}%</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-1 italic">
                &quot;{lastMsg}&quot;
              </p>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-pink-300/80 font-medium truncate">
                  {girl.title}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-[10px] text-emerald-400">
                  Mood: {mood}
                </span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-pink-300 transition-colors shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
