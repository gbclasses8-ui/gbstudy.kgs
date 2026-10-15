import React, { useEffect } from 'react';
import { Send, X, Bell } from 'lucide-react';
import { APP_ICON, TELEGRAM_URL, TELEGRAM_HANDLE } from '../constants';

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramModal: React.FC<TelegramModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-[#140f22] border-2 border-pink-500/40 p-6 sm:p-7 text-center shadow-2xl shadow-pink-950/60"
        role="dialog"
        aria-modal="true"
      >
        {/* Glow */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-pink-600/30 text-pink-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="relative mx-auto mb-4 w-20 h-20">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-pink-500 shadow-lg shadow-pink-500/30 p-0.5 bg-gradient-to-tr from-pink-500 to-rose-500">
            <img
              src={APP_ICON}
              alt="GB STUDY"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white p-1.5 rounded-full shadow-md border-2 border-[#140f22]">
            <Send className="w-3.5 h-3.5 fill-white" />
          </div>
        </div>

        {/* Community Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-950/80 border border-pink-500/30 text-pink-300 text-xs font-semibold mb-2">
          <Bell className="w-3.5 h-3.5 text-pink-400" />
          <span>JOIN OFFICIAL COMMUNITY</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Join GB STUDY Telegram Channel
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          Stay updated with free lecture links, class notes, PDF materials &amp; study updates on <strong className="text-pink-400">{TELEGRAM_HANDLE}</strong>.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 text-sm transform active:scale-98 transition-all"
          >
            <Send className="w-4 h-4 fill-white" />
            <span>Join Telegram</span>
          </a>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs border border-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
