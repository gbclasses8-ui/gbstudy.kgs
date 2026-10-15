import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, PlayCircle, FileText, Calendar, Heart, Share2, Sparkles, Loader2, AlertCircle, ChevronRight, Info } from 'lucide-react';
import { Batch, ClassroomTopic } from '../types';
import { APP_ICON, TELEGRAM_URL } from '../constants';

interface BatchDetailViewProps {
  batch: Batch;
  isSaved: boolean;
  onToggleSave: (batch: Batch, e: React.MouseEvent) => void;
  onBack: () => void;
  onSelectTopic: (topic: ClassroomTopic) => void;
}

export const BatchDetailView: React.FC<BatchDetailViewProps> = ({
  batch,
  isSaved,
  onToggleSave,
  onBack,
  onSelectTopic,
}) => {
  const [topics, setTopics] = useState<ClassroomTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'classroom' | 'about' | 'schedule'>('classroom');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/classroom/${batch.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load classroom topics');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setTopics(data.classroom || []);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching classroom topics:', err);
        setError('Classroom subjects could not be loaded at this moment.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [batch.id]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Ongoing';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${batch.title} - GB STUDY`,
        text: `Watch free lectures and download notes for ${batch.title} on GB STUDY!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const totalVideos = topics.reduce((acc, t) => acc + (t.videos || 0), 0);
  const totalNotes = topics.reduce((acc, t) => acc + (t.notes || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 sm:p-2.5 rounded-xl border border-pink-900/50 bg-[#160f25] hover:bg-[#201435] text-pink-400 transition-colors flex items-center gap-2 text-xs sm:text-sm font-bold shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Batches</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => onToggleSave(batch, e)}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
              isSaved
                ? 'border-pink-500 bg-pink-950/50 text-pink-400'
                : 'border-pink-900/50 bg-[#160f25] text-slate-300 hover:border-pink-500/50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-pink-500 text-pink-500' : ''}`} />
            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save Batch'}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2 sm:p-2.5 rounded-xl border border-pink-900/50 bg-[#160f25] hover:border-pink-500/50 text-slate-300 hover:text-pink-400 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Share Batch"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Batch Hero Card */}
      <div className="relative rounded-3xl bg-[#140f21] border border-pink-900/40 shadow-2xl p-5 sm:p-8 mb-8 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Batch Thumbnail */}
          <div className="lg:col-span-5 relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-950 border border-pink-900/40">
            <img
              src={batch.image_large || batch.image_thumb || APP_ICON}
              alt={batch.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = APP_ICON;
              }}
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-[#271233]/90 border border-pink-500/40 text-pink-300 text-xs font-black tracking-wide shadow-md backdrop-blur-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>100% FREE BATCH</span>
            </div>
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold border border-white/10">
              ID: {batch.id}
            </div>
          </div>

          {/* Batch Details */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-950/60 border border-pink-500/30 text-pink-300 text-xs font-bold mb-3">
                <span>OFFICIAL COMPLETE BATCH</span>
              </div>

              <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
                {batch.title}
              </h1>

              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Complete syllabus lectures, official classroom notes, revision tests and practice material. All content is 100% free with zero fees on GB STUDY.
              </p>

              {/* Highlights */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#1c142e] border border-pink-900/40">
                  <div className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">Start Date</div>
                  <div className="text-xs font-bold text-white mt-0.5">{formatDate(batch.start_at)}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#1c142e] border border-pink-900/40">
                  <div className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">Validity Till</div>
                  <div className="text-xs font-bold text-white mt-0.5">{formatDate(batch.end_at)}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#1c142e] border border-pink-900/40 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">Subjects</div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {topics.length} Modules
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats & Telegram CTA */}
            <div className="mt-6 pt-4 border-t border-pink-950/60 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 text-pink-400">
                  <PlayCircle className="w-4 h-4" />
                  <strong className="text-white">{totalVideos || 'Multiple'}</strong> Classes
                </span>
                <span className="flex items-center gap-1.5 text-pink-400">
                  <FileText className="w-4 h-4" />
                  <strong className="text-white">{totalNotes || 'Full'}</strong> Notes
                </span>
              </div>

              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-md shadow-pink-500/25 flex items-center gap-2 transition-all transform active:scale-95"
              >
                <span>Join Telegram Channel</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-pink-950/70 mb-6">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('classroom')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'classroom'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-pink-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Classroom Subjects ({topics.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'about'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-pink-300'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Course Details</span>
          </button>
        </nav>
      </div>

      {/* Topics Grid */}
      {activeTab === 'classroom' && (
        <div>
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-pink-500">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm font-bold">Loading classroom topics...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center bg-[#140f21] rounded-2xl border border-rose-900/40 p-8">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">{error}</p>
            </div>
          ) : topics.length === 0 ? (
            <div className="py-16 text-center bg-[#140f21] rounded-2xl border border-pink-900/30 p-8">
              <BookOpen className="w-12 h-12 text-pink-700 mx-auto mb-3" />
              <h4 className="font-bold text-white text-base">Classroom modules updating soon</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                The subjects for this batch are being synchronized with the latest lecture schedule.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {topics.map((topic, index) => (
                <div
                  key={topic.id}
                  onClick={() => onSelectTopic(topic)}
                  className="group flex flex-col justify-between bg-[#140f21] rounded-2xl border border-pink-900/35 hover:border-pink-500/60 p-5 sm:p-6 shadow-lg shadow-pink-950/20 hover:shadow-pink-500/15 transition-all cursor-pointer transform hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-pink-950/70 border border-pink-500/30 text-pink-300 text-[11px] font-black">
                        SUBJECT #{index + 1}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-pink-400 transition-colors leading-snug">
                      {topic.name}
                    </h3>
                  </div>

                  <div className="mt-5 pt-4 border-t border-pink-950/70 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1c142e] border border-pink-900/40 text-pink-300 text-xs font-semibold">
                        <PlayCircle className="w-3.5 h-3.5 text-pink-400" />
                        <span>{topic.videos} Videos</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1c142e] border border-pink-900/40 text-pink-300 text-xs font-semibold">
                        <FileText className="w-3.5 h-3.5 text-pink-400" />
                        <span>{topic.notes} Notes</span>
                      </span>
                    </div>

                    <span className="text-xs font-bold text-pink-400 group-hover:underline">
                      Open &gt;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-[#140f21] rounded-2xl border border-pink-900/40 p-6 sm:p-8 space-y-4">
          <h3 className="text-xl font-bold text-white">About {batch.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Welcome to the official <strong>{batch.title}</strong> on <strong>GB STUDY</strong>. This batch provides full video lectures, organized subject folders, handwritten notes, and comprehensive test series for all competitive exam aspirants.
          </p>
        </div>
      )}
    </div>
  );
};
