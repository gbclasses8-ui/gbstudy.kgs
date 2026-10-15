import React from 'react';
import { Search, Heart, Send, Sparkles } from 'lucide-react';
import { APP_NAME, APP_TAGLINE, APP_ICON, TELEGRAM_URL } from '../constants';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  savedCount: number;
  onOpenSaved: () => void;
  onOpenTelegramModal: () => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  savedCount,
  onOpenSaved,
  onOpenTelegramModal,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0d0917]/95 backdrop-blur-md border-b border-pink-950/60 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Brand Logo & Name */}
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative">
              <img
                src={APP_ICON}
                alt={APP_NAME}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-pink-500 shadow-md shadow-pink-500/30 group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center">
                <span className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  GB <span className="text-pink-500">STUDY</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate max-w-[160px] sm:max-w-none">
                {APP_TAGLINE}
              </p>
            </div>
          </div>

          {/* Right Action Icons (Search, Favorites, Indicator Dot, Telegram) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Search Icon button */}
            <button
              onClick={() => {
                const el = document.getElementById('filterSearchInput');
                if (el) {
                  el.focus();
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="p-2 sm:p-2.5 rounded-full bg-[#1b132c] hover:bg-[#281b40] text-pink-300 border border-pink-900/50 transition-colors"
              title="Search batches"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Saved Batches Heart button */}
            <button
              onClick={onOpenSaved}
              className="relative p-2 sm:p-2.5 rounded-full bg-[#1b132c] hover:bg-[#281b40] text-pink-300 border border-pink-900/50 transition-colors"
              title="Saved batches"
            >
              <Heart className={`w-4 h-4 ${savedCount > 0 ? 'fill-pink-500 text-pink-500' : ''}`} />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Pink Active Indicator Dot */}
            <div className="hidden xs:flex w-2 h-2 rounded-full bg-pink-500 shadow-sm shadow-pink-500 animate-pulse mx-0.5" />

            {/* Telegram Pill Button */}
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 sm:py-2 px-3 sm:px-4 rounded-full font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 shadow-md shadow-pink-500/30 flex items-center gap-1.5 text-xs sm:text-sm transition-all transform active:scale-95"
            >
              <Send className="w-3.5 h-3.5 fill-white" />
              <span>Telegram</span>
            </a>
          </div>
        </div>

        {/* Filter Batches Search Bar (Always visible below header matching screenshot) */}
        <div className="pb-3 pt-1">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
            <input
              id="filterSearchInput"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter batches..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl sm:rounded-2xl bg-[#160f25] border border-pink-900/50 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40 text-sm text-white placeholder-pink-300/40 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-pink-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
