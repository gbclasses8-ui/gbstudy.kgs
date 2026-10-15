import React from 'react';
import { Home, BookOpen, Search, Send, Heart } from 'lucide-react';
import { TELEGRAM_URL } from '../constants';

interface BottomNavProps {
  currentView: string;
  onNavigateHome: () => void;
  onNavigateBatches: () => void;
  onOpenSaved: () => void;
  onFocusSearch: () => void;
  savedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigateHome,
  onNavigateBatches,
  onOpenSaved,
  onFocusSearch,
  savedCount,
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0917]/95 backdrop-blur-lg border-t border-pink-950/70 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] px-2 py-2">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={onNavigateHome}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            currentView === 'home' ? 'text-pink-500 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Batches */}
        <button
          onClick={onNavigateBatches}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            currentView === 'batches' || currentView === 'batch_detail' || currentView === 'lesson'
              ? 'text-pink-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Batches</span>
        </button>

        {/* Search */}
        <button
          onClick={onFocusSearch}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Search</span>
        </button>

        {/* Telegram */}
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-slate-400 hover:text-pink-400 transition-all"
        >
          <Send className="w-5 h-5" />
          <span className="text-[10px]">Telegram</span>
        </a>

        {/* Saved */}
        <button
          onClick={onOpenSaved}
          className="relative flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
        >
          <Heart className={`w-5 h-5 ${savedCount > 0 ? 'fill-pink-500 text-pink-500' : ''}`} />
          <span className="text-[10px]">Saved</span>
          {savedCount > 0 && (
            <span className="absolute -top-1 right-2 bg-pink-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
              {savedCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};
