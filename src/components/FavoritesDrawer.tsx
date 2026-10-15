import React from 'react';
import { X, Heart, Trash2, ArrowRight } from 'lucide-react';
import { Batch } from '../types';
import { APP_ICON } from '../constants';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedBatches: Batch[];
  onSelectBatch: (batch: Batch) => void;
  onRemoveSaved: (id: number) => void;
  onClearAll: () => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  savedBatches,
  onSelectBatch,
  onRemoveSaved,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#130d22] border-l border-pink-900/40 shadow-2xl flex flex-col text-white">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-pink-950/80 flex items-center justify-between bg-[#19102c]/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-600/30">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Saved Batches</h3>
                <span className="text-[11px] text-pink-400 font-semibold">{savedBatches.length} Bookmarked</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {savedBatches.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="p-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg flex items-center gap-1 transition-colors"
                  title="Clear all saved"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Clear</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-pink-400 hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Batches List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {savedBatches.length === 0 ? (
              <div className="py-24 text-center px-4">
                <Heart className="w-12 h-12 text-pink-900 mx-auto mb-3" />
                <h4 className="font-bold text-slate-300 text-base">No Saved Batches Yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Click the heart icon on any batch to save it here for quick access later without logging in.
                </p>
              </div>
            ) : (
              savedBatches.map((batch) => (
                <div
                  key={batch.id}
                  onClick={() => {
                    onSelectBatch(batch);
                    onClose();
                  }}
                  className="group relative flex items-center gap-3 p-3 rounded-2xl border border-pink-900/35 hover:border-pink-500/50 bg-[#1a122c] hover:bg-[#22163b] shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <img
                    src={batch.image_thumb || batch.image_large || APP_ICON}
                    alt={batch.title}
                    className="w-16 h-14 rounded-xl object-cover bg-slate-900 shrink-0 border border-pink-900/30"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = APP_ICON;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-white truncate group-hover:text-pink-400 transition-colors">
                      {batch.title}
                    </h4>
                    <span className="text-[10px] text-pink-400 font-semibold block mt-0.5">
                      Batch #{batch.id}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSaved(batch.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
