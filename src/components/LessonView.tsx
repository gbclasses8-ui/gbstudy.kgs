import React, { useState, useEffect } from 'react';
import { ArrowLeft, PlayCircle, FileText, Calendar, Search, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { ClassroomTopic, LectureVideo, StudyNote, LessonData, Batch } from '../types';
import { APP_ICON } from '../constants';

interface LessonViewProps {
  batch: Batch;
  topic: ClassroomTopic;
  onBack: () => void;
  onSelectVideo: (video: LectureVideo) => void;
  onSelectPdf: (url: string, title: string) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  batch,
  topic,
  onBack,
  onSelectVideo,
  onSelectPdf,
}) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'notes'>('videos');
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [loadingNoteId, setLoadingNoteId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/lesson/${topic.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load topic lessons');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setLessonData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching lesson:', err);
        setError('Failed to load lectures and notes for this subject.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [topic.id]);

  const handleNoteClick = async (note: StudyNote) => {
    setLoadingNoteId(note.id);
    try {
      const res = await fetch(`/api/video/${note.id}`);
      if (!res.ok) throw new Error('Failed to fetch note file');
      const data = await res.json();
      const pdfUrl = data.video_url || data.hd_video_url || (data.pdfs && data.pdfs[0]?.url);
      if (pdfUrl) {
        onSelectPdf(pdfUrl, note.name);
      } else {
        alert('PDF document link not available for this note.');
      }
    } catch (err) {
      console.error(err);
      alert('Unable to load note. Please try again.');
    } finally {
      setLoadingNoteId(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const videos = lessonData?.videos || [];
  const notes = lessonData?.notes || [];

  const filteredVideos = videos.filter((v) =>
    v.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredNotes = notes.filter((n) =>
    n.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 sm:p-2.5 rounded-xl border border-pink-900/50 bg-[#160f25] hover:bg-[#201435] text-pink-400 transition-colors flex items-center gap-2 text-xs sm:text-sm font-bold shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Subjects</span>
        </button>

        <div className="text-xs text-slate-400 truncate hidden sm:block">
          <span className="font-semibold text-slate-300">{batch.title}</span> &gt;{' '}
          <span className="text-pink-400 font-bold">{topic.name}</span>
        </div>
      </div>

      {/* Subject Header Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#241033] via-[#1b0e2b] to-[#250d30] border border-pink-500/30 text-white p-5 sm:p-7 shadow-xl shadow-pink-950/30 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-300 text-xs font-bold mb-3">
          <BookOpen className="w-3.5 h-3.5 text-pink-400" />
          <span>SUBJECT MODULE</span>
        </div>

        <h1 className="text-xl sm:text-3xl font-black text-white">{topic.name}</h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
          Part of {batch.title}. Complete recorded lectures and high-yield notes.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-[#130b1e] border border-pink-900/40 text-xs font-semibold flex items-center gap-2 text-pink-200">
            <PlayCircle className="w-4 h-4 text-pink-400" />
            <span>{videos.length || topic.videos} Video Classes</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#130b1e] border border-pink-900/40 text-xs font-semibold flex items-center gap-2 text-pink-200">
            <FileText className="w-4 h-4 text-pink-400" />
            <span>{notes.length || topic.notes} PDF Notes</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-pink-950/70 pb-4 mb-6">
        <div className="flex items-center gap-2 bg-[#160f25] p-1 rounded-2xl border border-pink-900/40 max-w-fit">
          <button
            onClick={() => setActiveTab('videos')}
            className={`py-2 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'videos'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>Classes ({videos.length || topic.videos})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Notes ({notes.length || topic.notes})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={`Filter ${activeTab === 'videos' ? 'classes' : 'notes'}...`}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#160f25] border border-pink-900/50 text-xs text-white placeholder-pink-300/40 outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-pink-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-bold">Loading classes and notes...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center bg-[#140f21] rounded-2xl border border-rose-900/40 p-8">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">{error}</p>
        </div>
      ) : activeTab === 'videos' ? (
        filteredVideos.length === 0 ? (
          <div className="py-16 text-center bg-[#140f21] rounded-2xl border border-pink-900/30 p-8">
            <PlayCircle className="w-12 h-12 text-pink-800 mx-auto mb-3" />
            <h4 className="font-bold text-white">No classes found</h4>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video, idx) => (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="group flex flex-col bg-[#140f21] rounded-2xl border border-pink-900/35 hover:border-pink-500/60 p-3.5 sm:p-4 shadow-lg shadow-pink-950/20 hover:shadow-pink-500/15 transition-all cursor-pointer transform hover:-translate-y-1"
              >
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 mb-3 border border-pink-900/30">
                  <img
                    src={video.thumb || APP_ICON}
                    alt={video.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-pink-600/90 group-hover:bg-pink-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-6 h-6 fill-white" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-black/70 text-white backdrop-blur-xs">
                    Class #{filteredVideos.length - idx}
                  </span>
                </div>

                <h4 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-pink-400 transition-colors mb-2">
                  {video.name}
                </h4>

                <div className="mt-auto pt-2 border-t border-pink-950/70 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-pink-400" />
                    <span>{formatDate(video.published_at)}</span>
                  </div>
                  <span className="font-bold text-pink-400 group-hover:underline">Watch Online ↗</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredNotes.length === 0 ? (
          <div className="py-16 text-center bg-[#140f21] rounded-2xl border border-pink-900/30 p-8">
            <FileText className="w-12 h-12 text-pink-800 mx-auto mb-3" />
            <h4 className="font-bold text-white">No notes found</h4>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note)}
                className="group flex flex-col justify-between bg-[#140f21] rounded-2xl border border-pink-900/35 hover:border-pink-500/60 p-4 sm:p-5 shadow-lg shadow-pink-950/20 hover:shadow-pink-500/15 transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-pink-950/80 border border-pink-500/30 text-pink-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                        Classroom Document
                      </span>
                      <div className="text-[11px] text-slate-400">
                        {formatDate(note.published_at)}
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-pink-400 transition-colors">
                    {note.name}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-pink-950/70 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">Official PDF</span>
                  <button
                    disabled={loadingNoteId === note.id}
                    className="py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-600 shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    {loadingNoteId === note.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Opening...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" />
                        <span>View / Download</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
