import React from 'react';
import { Sparkles, MessageCircle, PhoneCall, ShieldCheck, Settings } from 'lucide-react';

export type NavTab = 'stories' | 'chats' | 'calls' | 'terms' | 'settings';

interface NativeBottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadCount?: number;
}

export const NativeBottomNav: React.FC<NativeBottomNavProps> = ({
  activeTab,
  onTabChange,
  unreadCount = 0,
}) => {
  const tabs = [
    {
      id: 'stories' as NavTab,
      label: 'Stories',
      icon: Sparkles,
      badge: null,
    },
    {
      id: 'chats' as NavTab,
      label: 'Chats',
      icon: MessageCircle,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      id: 'calls' as NavTab,
      label: '1 Min Call',
      icon: PhoneCall,
      badge: 'Free',
    },
    {
      id: 'terms' as NavTab,
      label: 'Privacy & 18+',
      icon: ShieldCheck,
      badge: null,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-[#0d0d17]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 shadow-[0_-8px_25px_rgba(0,0,0,0.6)] select-none"
      role="navigation"
      aria-label="Native Bottom Navigation"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 cursor-pointer min-w-[58px] ${
                isActive
                  ? 'text-pink-300 scale-105'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              {/* Active pill background indicator */}
              {isActive && (
                <span className="absolute inset-0 bg-pink-500/15 rounded-2xl border border-pink-500/30 -z-10 shadow-sm" />
              )}

              {/* Icon Container with relative badge */}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'text-pink-400 stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Badge if any */}
                {tab.badge && (
                  <span
                    className={`absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-black leading-none ${
                      tab.badge === 'Free'
                        ? 'bg-emerald-500 text-slate-950 px-1.5 py-0.5'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Text Label */}
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 leading-tight ${
                  isActive ? 'font-bold text-pink-300' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
