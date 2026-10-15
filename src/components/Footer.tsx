import React from 'react';
import { Send, Heart, BookOpen, ShieldCheck, Sparkles, Youtube, Globe } from 'lucide-react';
import { APP_NAME, APP_ICON, TELEGRAM_URL, TELEGRAM_HANDLE } from '../constants';

interface FooterProps {
  onOpenTelegramModal: () => void;
  onNavigateHome: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTelegramModal, onNavigateHome }) => {
  return (
    <footer className="mt-20 border-t border-pink-200 bg-white/90 pb-16 sm:pb-8 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div
              onClick={onNavigateHome}
              className="flex items-center gap-3 cursor-pointer group max-w-fit"
            >
              <img
                src={APP_ICON}
                alt={APP_NAME}
                className="w-12 h-12 rounded-xl object-cover border-2 border-pink-500 shadow-md shadow-pink-500/20"
              />
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">
                  {APP_NAME}
                </span>
                <p className="text-xs text-slate-500 font-semibold">
                  Free Educational Batches &amp; Learning Portal
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
              GB STUDY is dedicated to making education accessible to every aspirant across India. Watch live recorded video classes, read chapter notes, and download PDFs for UPSC, BPSC, SSC, Railway, State Police, and Foundation courses with zero fees and no registration required.
            </p>

            {/* Pink Community Button */}
            <div className="pt-2">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-md shadow-pink-500/25 transition-all transform active:scale-95"
              >
                <Send className="w-4 h-4 fill-white" />
                <span>Join Official Telegram ({TELEGRAM_HANDLE})</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-3">
              Popular Exams
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="hover:text-pink-600 cursor-pointer transition-colors">Khan Sir Foundation Batches</li>
              <li className="hover:text-pink-600 cursor-pointer transition-colors">BPSC &amp; UPSC Civil Services</li>
              <li className="hover:text-pink-600 cursor-pointer transition-colors">SSC CGL, CHSL &amp; GD Constable</li>
              <li className="hover:text-pink-600 cursor-pointer transition-colors">Railway NTPC &amp; Group D</li>
              <li className="hover:text-pink-600 cursor-pointer transition-colors">Bihar Police &amp; UP Daroga</li>
            </ul>
          </div>

          {/* Guarantee / Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>100% Free Forever</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>No Login or Signup Required</span>
              </li>
              <li className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>1,100+ Real Recorded Batches</span>
              </li>
              <li className="flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>Active Telegram Community</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 border-t border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            <span>for dedicated students &amp; aspirants.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
