/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Batch, ClassroomTopic, LectureVideo, StudyNote, VideoDetail } from './types';
import { APP_NAME, APP_ICON, TELEGRAM_URL, WHATSAPP_URL } from './constants';
import localBatchesData from './data/batches.json';

export default function App() {
  // Navigation: 'home' | 'batches' | 'batch_detail' | 'lesson'
  const [currentPage, setCurrentPage] = useState<'home' | 'batches' | 'batch_detail' | 'lesson'>('home');

  // Batch data
  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [batchSearchQuery, setBatchSearchQuery] = useState('');

  // Selected entities
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const [batchTab, setBatchTab] = useState<'today' | 'classroom' | 'updates' | 'timetable'>('classroom');

  // Batch details tabs data
  const [classroomTopics, setClassroomTopics] = useState<ClassroomTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [loadingToday, setLoadingToday] = useState(false);
  const [updatesList, setUpdatesList] = useState<any[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [timetableImg, setTimetableImg] = useState<string | null>(null);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  // Lesson view data
  const [currentTopic, setCurrentTopic] = useState<ClassroomTopic | null>(null);
  const [lessonTab, setLessonTab] = useState<'classes' | 'notes'>('classes');
  const [lessonVideos, setLessonVideos] = useState<LectureVideo[]>([]);
  const [lessonNotes, setLessonNotes] = useState<StudyNote[]>([]);
  const [loadingLesson, setLoadingLesson] = useState(false);

  // Favourites
  const [showFavSection, setShowFavSection] = useState(false);
  const [favouriteBatches, setFavouriteBatches] = useState<Batch[]>([]);

  // Modals
  const [isTelegramPopupOpen, setIsTelegramPopupOpen] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<{ video: LectureVideo; detail: VideoDetail | null; loading: boolean } | null>(null);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  const [activePdfViewer, setActivePdfViewer] = useState<{ url: string; title: string } | null>(null);

  // Initial load
  useEffect(() => {
    // 1. Load Batches
    async function loadData() {
      try {
        const res = await fetch('/api/batches');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAllBatches(data);
            setLoadingBatches(false);
            return;
          }
        }
        if (Array.isArray(localBatchesData)) {
          setAllBatches(localBatchesData as Batch[]);
        }
      } catch (err) {
        console.error('Failed to load batches:', err);
        if (Array.isArray(localBatchesData)) {
          setAllBatches(localBatchesData as Batch[]);
        }
      } finally {
        setLoadingBatches(false);
      }
    }
    loadData();

    // 2. Load favourites from localStorage
    try {
      const favs = JSON.parse(localStorage.getItem('favouriteCourses') || '[]');
      setFavouriteBatches(favs);
    } catch (e) {
      console.error(e);
    }

    // 3. Show Telegram popup after 500ms like the old website
    const timer = setTimeout(() => {
      setIsTelegramPopupOpen(true);
    }, 500);

    // 4. Check initial URL for deep links (/batches or /batch/:id)
    const path = window.location.pathname;
    if (path === '/batches') {
      setCurrentPage('batches');
    } else if (path.startsWith('/batch/')) {
      const id = path.replace('/batch/', '').split('/')[0];
      if (id) {
        const found = (localBatchesData as Batch[]).find(b => b.id.toString() === id);
        if (found) {
          setCurrentBatch(found);
          setCurrentPage('batch_detail');
        } else {
          setCurrentBatch({
            id: Number(id),
            title: `Batch #${id}`,
            category_id: 1,
            start_at: '',
            end_at: '',
            image_large: '',
            image_thumb: ''
          });
          setCurrentPage('batch_detail');
        }
      }
    }

    return () => clearTimeout(timer);
  }, []);

  // Listen to browser popstate for history navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state) {
        if (e.state.page) setCurrentPage(e.state.page);
        if (e.state.batch) setCurrentBatch(e.state.batch);
        if (e.state.topic) setCurrentTopic(e.state.topic);
      } else {
        setCurrentPage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load Batch Details when currentBatch or batchTab changes
  useEffect(() => {
    if (!currentBatch || currentPage !== 'batch_detail') return;

    if (batchTab === 'classroom') {
      setLoadingTopics(true);
      fetch(`/api/classroom/${currentBatch.id}`)
        .then(r => r.json())
        .then(d => {
          setClassroomTopics(d.classroom || []);
          setLoadingTopics(false);
        })
        .catch(() => {
          setClassroomTopics([]);
          setLoadingTopics(false);
        });
    } else if (batchTab === 'today') {
      setLoadingToday(true);
      fetch(`/api/today/${currentBatch.id}`)
        .then(r => r.json())
        .then(d => {
          setTodayClasses(d.todayclasses || []);
          setLoadingToday(false);
        })
        .catch(() => {
          setTodayClasses([]);
          setLoadingToday(false);
        });
    } else if (batchTab === 'updates') {
      setLoadingUpdates(true);
      fetch(`/api/updates/${currentBatch.id}`)
        .then(r => r.json())
        .then(d => {
          setUpdatesList(d.updates || []);
          setLoadingUpdates(false);
        })
        .catch(() => {
          setUpdatesList([]);
          setLoadingUpdates(false);
        });
    } else if (batchTab === 'timetable') {
      setLoadingTimetable(true);
      fetch(`/api/timetable/${currentBatch.id}`)
        .then(r => r.json())
        .then(d => {
          setTimetableImg(d.timetable?.large || null);
          setLoadingTimetable(false);
        })
        .catch(() => {
          setTimetableImg(null);
          setLoadingTimetable(false);
        });
    }
  }, [currentBatch, batchTab, currentPage]);

  // Load Lesson content when currentTopic changes
  useEffect(() => {
    if (!currentTopic || currentPage !== 'lesson') return;

    setLoadingLesson(true);
    fetch(`/api/lesson/${currentTopic.id}`)
      .then(r => r.json())
      .then(d => {
        setLessonVideos(d.videos || []);
        setLessonNotes(d.notes || []);
        setLoadingLesson(false);
      })
      .catch(() => {
        setLessonVideos([]);
        setLessonNotes([]);
        setLoadingLesson(false);
      });
  }, [currentTopic, currentPage]);

  // Navigation functions
  const navigateToHome = () => {
    setCurrentPage('home');
    setShowFavSection(false);
    window.history.pushState({ page: 'home' }, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToBatches = () => {
    setCurrentPage('batches');
    setShowFavSection(false);
    window.history.pushState({ page: 'batches' }, '', '/batches');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToBatchDetail = (batch: Batch) => {
    setCurrentBatch(batch);
    setBatchTab('classroom');
    setCurrentPage('batch_detail');
    window.history.pushState({ page: 'batch_detail', batch }, '', `/batch/${batch.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLesson = (topic: ClassroomTopic) => {
    setCurrentTopic(topic);
    setLessonTab('classes');
    setCurrentPage('lesson');
    window.history.pushState({ page: 'lesson', topic }, '', `/lesson?lesson_id=${topic.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Favourite toggle
  const isFav = (id: number) => {
    return favouriteBatches.some(b => String(b.id) === String(id));
  };

  const toggleFav = (batch: Batch, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: Batch[];
    if (isFav(batch.id)) {
      updated = favouriteBatches.filter(b => String(b.id) !== String(batch.id));
    } else {
      updated = [...favouriteBatches, batch];
    }
    setFavouriteBatches(updated);
    localStorage.setItem('favouriteCourses', JSON.stringify(updated));
  };

  // Video Options Modal handler
  const handleOpenVideoOptions = (video: LectureVideo) => {
    setActiveVideoModal({ video, detail: null, loading: true });
    fetch(`/api/video/${video.id}`)
      .then(r => r.json())
      .then(detail => {
        setActiveVideoModal({ video, detail, loading: false });
      })
      .catch(() => {
        setActiveVideoModal({
          video,
          detail: { video_url: video.video_url, hd_video_url: video.video_url },
          loading: false
        });
      });
  };

  // Note click handler
  const handleOpenNoteOptions = (note: StudyNote) => {
    setActiveVideoModal({
      video: note as any,
      detail: null,
      loading: true
    });
    fetch(`/api/video/${note.id}`)
      .then(r => r.json())
      .then(detail => {
        setActiveVideoModal({ video: note as any, detail, loading: false });
      })
      .catch(() => {
        setActiveVideoModal({
          video: note as any,
          detail: null,
          loading: false
        });
      });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch {
      return dateStr;
    }
  };

  // Filter batches by search query
  const filteredBatches = allBatches.filter(b =>
    (b.title || '').toLowerCase().includes(batchSearchQuery.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* ========================================================
          PAGE 1: HOMEPAGE (Exact old website layout in Pink)
      ======================================================== */}
      {currentPage === 'home' && (
        <div>
          {/* Header */}
          <div className="site-header">
            <span className="site-brand-title" onClick={navigateToHome}>
              <img src={APP_ICON} className="site-logo-img" alt="GB STUDY Logo" />
              GB STUDY
            </span>
            <a className="site-tg-link" href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" title="Join Telegram">
              <span className="site-tg-logo">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M21.8 3.2 2.9 10.5c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.7c.2.6.1.8.8.8.8.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.3 1.7-.8l3.1-15.9c.3-1.4-.5-2-1.7-1.4ZM8.3 13.1l10.8-6.8c.5-.3 1-.1.6.2l-8.9 8.1-.3 3.2-1.4-4.5-3.4-1.1c-.7-.2-.7-.7.2-1.1Z" />
                </svg>
              </span>
            </a>
          </div>

          {/* Running Marquee Banner */}
          <div className="site-marquee">
            <span>🌸 सारे बैच फ्री है कोई भी किसी को एक रुपया नहीं देगा 🌸 ❤️</span>
          </div>

          {/* Main Grid View */}
          {!showFavSection ? (
            <div className="home-grid-container" id="mainGrid">
              {/* Item 1: Batches */}
              <div className="home-grid-item" onClick={navigateToBatches}>
                <div className="item-icon">
                  <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current">
                    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3 1 9l11 6 9-4.91V17h2V9L12 3z" />
                  </svg>
                </div>
                <h3>GB STUDY Batches</h3>
              </div>

              {/* Item 2: Favourite Batches */}
              <div className="home-grid-item" onClick={() => setShowFavSection(true)}>
                <div className="item-icon">
                  <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current">
                    <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <h3>Favourite Batches ({favouriteBatches.length})</h3>
              </div>

              {/* Item 3: NCERT Books */}
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="home-grid-item text-inherit no-underline"
                style={{ textDecoration: 'none' }}
              >
                <div className="item-icon">
                  <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current">
                    <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
                  </svg>
                </div>
                <h3>NCERT Books</h3>
              </a>

              {/* Item 4: Join Telegram */}
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="home-grid-item text-inherit no-underline"
                style={{ textDecoration: 'none' }}
              >
                <div className="item-icon" style={{ color: '#ec4899' }}>
                  <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current">
                    <path d="M21.8 3.2 2.9 10.5c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.7c.2.6.1.8.8.8.8.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.3 1.7-.8l3.1-15.9c.3-1.4-.5-2-1.7-1.4ZM8.3 13.1l10.8-6.8c.5-.3 1-.1.6.2l-8.9 8.1-.3 3.2-1.4-4.5-3.4-1.1c-.7-.2-.7-.7.2-1.1Z" />
                  </svg>
                </div>
                <h3>Join Telegram Channel</h3>
              </a>

              {/* Item 5: Join WhatsApp */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="home-grid-item text-inherit no-underline"
                style={{ textDecoration: 'none' }}
              >
                <div className="item-icon" style={{ color: '#25D366' }}>
                  <img src="https://cdn-icons-png.flaticon.com/512/3670/3670051.png" alt="WA" className="w-14 h-14" />
                </div>
                <h3>Join WhatsApp Channel</h3>
              </a>
            </div>
          ) : (
            /* Favourites Section (Exact old website) */
            <div className="max-w-4xl mx-auto p-5">
              <button
                onClick={() => setShowFavSection(false)}
                className="bg-gradient-to-r from-pink-600 to-rose-500 text-white py-2 px-5 rounded-full font-bold text-sm flex items-center gap-2 shadow-md hover:scale-105 transition-all mb-6 cursor-pointer"
              >
                <span>←</span> Back to Home
              </button>

              <h2 className="text-2xl font-bold text-pink-900 mb-4">Favourite Batches</h2>

              {favouriteBatches.length === 0 ? (
                <div className="bg-white/80 p-8 rounded-2xl text-center shadow-md">
                  <p className="text-slate-600">No favourite batches yet. Go to Batches and click "Add to Favorites"!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {favouriteBatches.map(b => (
                    <div
                      key={b.id}
                      onClick={() => navigateToBatchDetail(b)}
                      className="old-card"
                    >
                      <img src={b.image_large || b.image_thumb || APP_ICON} alt={b.title} />
                      <div className="old-card-content">
                        <h3>{b.title}</h3>
                        <p>Start: {formatDate(b.start_at)}</p>
                        <button
                          className="old-btn-fav active"
                          onClick={(e) => toggleFav(b, e)}
                        >
                          ★ Favorited
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          PAGE 2: BATCHES PAGE (Exact old website layout in Pink)
      ======================================================== */}
      {currentPage === 'batches' && (
        <div>
          {/* Header with Back button and title */}
          <header className="batches-common-header">
            <button className="batches-back-btn" onClick={navigateToHome}>
              <span>←</span> Back
            </button>
            <h1 className="batches-header-title">GB STUDY Free Batches</h1>
          </header>

          {/* Search Box */}
          <div className="batches-controls">
            <input
              type="text"
              id="search"
              className="batches-search-input"
              placeholder="🔍 Search batches..."
              value={batchSearchQuery}
              onChange={(e) => setBatchSearchQuery(e.target.value)}
            />
          </div>

          {/* Free Notice Marquee Banner */}
          <div className="batches-free-notice">
            <div className="batches-free-notice-text">
              🎉 यह वेबसाइट बिल्कुल FREE है &nbsp;&nbsp; | &nbsp;&nbsp; हमारी वेबसाइट का असली नाम: <strong>GB STUDY</strong> &nbsp;&nbsp; 🎉
            </div>
          </div>

          {/* Batches Grid with Telegram buttons after every 2 batches */}
          {loadingBatches ? (
            <p className="text-center py-20 text-pink-700 font-bold">Loading batches...</p>
          ) : filteredBatches.length === 0 ? (
            <p className="text-center py-20 text-slate-600">No batches found.</p>
          ) : (
            <div className="batches-grid-container" id="batchesGrid">
              {filteredBatches.map((batch, index) => {
                const favorite = isFav(batch.id);
                return (
                  <React.Fragment key={batch.id}>
                    {/* BATCH CARD */}
                    <div
                      className="old-card"
                      onClick={() => navigateToBatchDetail(batch)}
                    >
                      <img
                        src={batch.image_large || batch.image_thumb || APP_ICON}
                        alt={batch.title}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = APP_ICON;
                        }}
                      />
                      <div className="old-card-content">
                        <h3>{batch.title}</h3>
                        <p>Start: {formatDate(batch.start_at)}</p>
                        <button
                          className={`old-btn-fav ${favorite ? 'active' : ''}`}
                          onClick={(e) => toggleFav(batch, e)}
                        >
                          {favorite ? '★ Favorited' : '☆ Add to Favorites'}
                        </button>
                      </div>
                    </div>

                    {/* TELEGRAM AFTER EVERY 2 BATCHES (Exact old website feature) */}
                    {(index + 1) % 2 === 0 && index !== filteredBatches.length - 1 && (
                      <div className="telegram-between">
                        <a
                          className="old-telegram-link"
                          href={TELEGRAM_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                            <path d="M21.8 3.2 2.9 10.5c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.7c.2.6.1.8.8.8.8.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.3 1.7-.8l3.1-15.9c.3-1.4-.5-2-1.7-1.4ZM8.3 13.1l10.8-6.8c.5-.3 1-.1.6.2l-8.9 8.1-.3 3.2-1.4-4.5-3.4-1.1c-.7-.2-.7-.7.2-1.1Z" />
                          </svg>
                          <span>✈️ Join Telegram Channel</span>
                        </a>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          PAGE 3: BATCH DETAILS (Exact old website layout in Pink)
      ======================================================== */}
      {currentPage === 'batch_detail' && currentBatch && (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="batches-common-header relative">
            <button className="batches-back-btn" onClick={navigateToBatches}>
              <span>←</span> Back
            </button>
            <h1 className="batches-header-title truncate px-16">
              {currentBatch.title}
            </h1>
          </header>

          {/* 4 Nav Tabs (today, classroom, updates, timetable) */}
          <nav className="batch-nav-tabs">
            <div
              className={`batch-nav-tab ${batchTab === 'today' ? 'active' : ''}`}
              onClick={() => setBatchTab('today')}
            >
              Today's Class
            </div>
            <div
              className={`batch-nav-tab ${batchTab === 'classroom' ? 'active' : ''}`}
              onClick={() => setBatchTab('classroom')}
            >
              Classroom
            </div>
            <div
              className={`batch-nav-tab ${batchTab === 'updates' ? 'active' : ''}`}
              onClick={() => setBatchTab('updates')}
            >
              Updates
            </div>
            <div
              className={`batch-nav-tab ${batchTab === 'timetable' ? 'active' : ''}`}
              onClick={() => setBatchTab('timetable')}
            >
              Timetable
            </div>
          </nav>

          {/* Tab 1: Today's Class */}
          {batchTab === 'today' && (
            <div className="max-w-4xl mx-auto p-4 flex-1">
              {loadingToday ? (
                <div className="text-center py-16 text-pink-700">Loading today's classes...</div>
              ) : todayClasses.length === 0 ? (
                <p className="text-center py-16 text-slate-600 font-semibold">No classes for today</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {todayClasses.map((cls, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-md p-4 border border-pink-100">
                      <img src={cls.thumb || APP_ICON} alt="Class Thumb" className="w-full h-40 object-cover rounded-lg mb-3" />
                      <h3 className="font-bold text-pink-900 mb-1">{cls.name}</h3>
                      <div className="text-xs text-slate-500 mb-3">{cls.teacher}</div>
                      <div className="flex gap-2">
                        {cls.video_url && (
                          <button
                            onClick={() => setPlayingVideoUrl(cls.video_url)}
                            className="bg-pink-600 text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-pink-700"
                          >
                            Watch Class
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Classroom (Topics/Subjects) */}
          {batchTab === 'classroom' && (
            <div className="flex-1">
              {loadingTopics ? (
                <div className="text-center py-20 text-pink-700 font-bold">
                  Loading classroom topics... <div className="old-spinner"></div>
                </div>
              ) : classroomTopics.length === 0 ? (
                <p className="text-center py-20 text-slate-600">No topics available.</p>
              ) : (
                <div className="topics-container">
                  {classroomTopics.map(t => (
                    <div
                      key={t.id}
                      className="topic-card"
                      onClick={() => navigateToLesson(t)}
                    >
                      <h3>{t.name}</h3>
                      <div className="topic-stats">
                        <div className="topic-stat">
                          <span>🎥 {t.videos} Videos</span>
                        </div>
                        <div className="topic-stat">
                          <span>📄 {t.notes} Notes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Updates */}
          {batchTab === 'updates' && (
            <div className="max-w-3xl mx-auto p-4 flex-1">
              {loadingUpdates ? (
                <div className="text-center py-16 text-pink-700">Loading updates...</div>
              ) : updatesList.length === 0 ? (
                <p className="text-center py-16 text-slate-600">No updates found for this batch.</p>
              ) : (
                <div className="space-y-4">
                  {updatesList.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100">
                      <h4 className="font-bold text-pink-900 mb-1">{item.title || 'Update'}</h4>
                      <p className="text-sm text-slate-700">{item.description || item.message}</p>
                      <div className="text-xs text-slate-400 mt-2">{formatDate(item.created_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Timetable */}
          {batchTab === 'timetable' && (
            <div className="max-w-4xl mx-auto p-4 flex-1 text-center">
              {loadingTimetable ? (
                <div className="py-16 text-pink-700">Loading timetable...</div>
              ) : timetableImg ? (
                <img src={timetableImg} alt="Timetable" className="max-w-full rounded-2xl shadow-lg mx-auto" />
              ) : (
                <p className="py-16 text-slate-600">No timetable available for this batch.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          PAGE 4: LESSON / CLASSES & NOTES (Exact old website)
      ======================================================== */}
      {currentPage === 'lesson' && currentTopic && currentBatch && (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="batches-common-header relative">
            <button className="batches-back-btn" onClick={() => setCurrentPage('batch_detail')}>
              <span>←</span> Back
            </button>
            <h1 className="batches-header-title truncate px-16">
              {currentTopic.name}
            </h1>
          </header>

          {/* Tabs: Classes | Notes */}
          <div className="flex justify-center my-4">
            <div className="bg-white rounded-full p-1 shadow-md border border-pink-200 inline-flex">
              <button
                className={`py-2 px-6 rounded-full font-bold text-sm transition-all ${
                  lessonTab === 'classes'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md'
                    : 'text-slate-600 hover:text-pink-600'
                }`}
                onClick={() => setLessonTab('classes')}
              >
                Classes ({lessonVideos.length})
              </button>
              <button
                className={`py-2 px-6 rounded-full font-bold text-sm transition-all ${
                  lessonTab === 'notes'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md'
                    : 'text-slate-600 hover:text-pink-600'
                }`}
                onClick={() => setLessonTab('notes')}
              >
                Notes ({lessonNotes.length})
              </button>
            </div>
          </div>

          {/* Content */}
          {loadingLesson ? (
            <div className="text-center py-20 text-pink-700 font-bold">
              Loading syllabus... <div className="old-spinner"></div>
            </div>
          ) : lessonTab === 'classes' ? (
            /* Videos List */
            lessonVideos.length === 0 ? (
              <p className="text-center py-16 text-slate-600">No classes found.</p>
            ) : (
              <div className="video-grid">
                {lessonVideos.map((video) => (
                  <div
                    key={video.id}
                    className="video-card"
                    onClick={() => handleOpenVideoOptions(video)}
                  >
                    <img
                      src={video.thumb || APP_ICON}
                      alt={video.name}
                      className="video-thumb"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = APP_ICON;
                      }}
                    />
                    <div className="video-info">
                      <div className="video-title">{video.name}</div>
                      <div className="video-date">Published: {formatDateTime(video.published_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Notes List */
            lessonNotes.length === 0 ? (
              <p className="text-center py-16 text-slate-600">No notes found.</p>
            ) : (
              <div className="max-w-4xl mx-auto w-full p-4 space-y-3">
                {lessonNotes.map((note) => (
                  <div
                    key={note.id}
                    className="note-card"
                    onClick={() => handleOpenNoteOptions(note)}
                  >
                    <div className="font-bold text-pink-900 text-base">{note.name}</div>
                    <div className="text-xs text-slate-500 mt-1">Published: {formatDateTime(note.published_at)}</div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* ========================================================
          VIDEO / NOTE OPTIONS MODAL (Exact old website feature)
      ======================================================== */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-pink-200 p-6 text-center">
            <button
              onClick={() => setActiveVideoModal(null)}
              className="absolute top-3 right-3 text-2xl font-bold text-slate-400 hover:text-pink-600"
            >
              &times;
            </button>

            <h3 className="font-bold text-slate-900 text-base mb-4 truncate pr-6">
              {activeVideoModal.video.name}
            </h3>

            {activeVideoModal.loading ? (
              <div className="py-8 text-pink-600 font-semibold">Loading options...</div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Watch Class */}
                {activeVideoModal.detail?.hd_video_url || activeVideoModal.detail?.video_url ? (
                  <button
                    onClick={() => {
                      const url = activeVideoModal.detail?.hd_video_url || activeVideoModal.detail?.video_url;
                      if (url) setPlayingVideoUrl(url);
                      setActiveVideoModal(null);
                    }}
                    className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    📺 Watch Class
                  </button>
                ) : null}

                {/* PDF handling (for video with pdf or note) */}
                {activeVideoModal.detail?.video_url?.endsWith('.pdf') && (
                  <>
                    <button
                      onClick={() => {
                        setActivePdfViewer({
                          url: activeVideoModal.detail!.video_url!,
                          title: activeVideoModal.video.name
                        });
                        setActiveVideoModal(null);
                      }}
                      className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      📄 View Note PDF
                    </button>
                    <a
                      href={`/api/pdf-proxy?url=${encodeURIComponent(activeVideoModal.detail!.video_url!)}&download=true&filename=${encodeURIComponent(activeVideoModal.video.name + '.pdf')}`}
                      download={`${activeVideoModal.video.name}.pdf`}
                      className="w-full py-2.5 px-4 rounded-xl font-semibold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 flex items-center justify-center gap-2"
                    >
                      ⬇️ Download Note PDF
                    </a>
                  </>
                )}

                {/* If video has attached pdfs */}
                {Array.isArray(activeVideoModal.detail?.pdfs) && activeVideoModal.detail!.pdfs!.length > 0 && (
                  <>
                    <button
                      onClick={() => {
                        const pdf = activeVideoModal.detail!.pdfs![0];
                        setActivePdfViewer({ url: pdf.url, title: pdf.title || activeVideoModal.video.name });
                        setActiveVideoModal(null);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      📄 View Lecture PDF
                    </button>
                    <a
                      href={`/api/pdf-proxy?url=${encodeURIComponent(activeVideoModal.detail!.pdfs![0].url)}&download=true&filename=${encodeURIComponent((activeVideoModal.detail!.pdfs![0].title || activeVideoModal.video.name) + '.pdf')}`}
                      download={`${activeVideoModal.video.name}.pdf`}
                      className="w-full py-2.5 px-4 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 flex items-center justify-center gap-2 text-xs"
                    >
                      ⬇️ Download Lecture PDF
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          VIDEO PLAYER MODAL
      ======================================================== */}
      {playingVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-3 bg-slate-900 text-white">
              <span className="font-bold text-sm text-pink-400">GB STUDY Video Lecture</span>
              <button
                onClick={() => setPlayingVideoUrl(null)}
                className="text-white hover:text-pink-400 text-2xl font-bold px-2 cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="relative aspect-video w-full">
              {playingVideoUrl.includes('youtube.com') || playingVideoUrl.includes('youtu.be') ? (
                <iframe
                  src={playingVideoUrl.includes('?') ? `${playingVideoUrl}&autoplay=1` : `${playingVideoUrl}?autoplay=1`}
                  title="Lecture Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <video
                  src={playingVideoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PDF VIEWER MODAL
      ======================================================== */}
      {activePdfViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-pink-200 bg-pink-50">
              <span className="font-bold text-sm text-pink-900 truncate max-w-md">{activePdfViewer.title}</span>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/pdf-proxy?url=${encodeURIComponent(activePdfViewer.url)}&download=true&filename=${encodeURIComponent(activePdfViewer.title + '.pdf')}`}
                  className="py-1 px-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-bold"
                >
                  Download
                </a>
                <button
                  onClick={() => setActivePdfViewer(null)}
                  className="text-slate-500 hover:text-pink-600 text-2xl font-bold px-2 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>
            <iframe
              src={`/api/pdf-proxy?url=${encodeURIComponent(activePdfViewer.url)}`}
              title={activePdfViewer.title}
              className="w-full flex-1 border-0"
            />
          </div>
        </div>
      )}

      {/* ========================================================
          TELEGRAM POPUP (Exact old website popup layout in Pink)
      ======================================================== */}
      {isTelegramPopupOpen && (
        <div
          id="popupOverlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            id="popupContent"
            style={{
              background: 'linear-gradient(135deg, #be185d, #ec4899, #db2777)',
              color: 'white',
              borderRadius: '18px',
              padding: '28px 22px',
              textAlign: 'center',
              width: '85%',
              maxWidth: '360px',
              position: 'relative',
              boxShadow: '0 10px 35px rgba(190,24,93,0.4)',
              border: '2px solid rgba(255,255,255,0.2)'
            }}
          >
            <button
              onClick={() => setIsTelegramPopupOpen(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'white',
                border: 'none',
                color: '#db2777',
                fontSize: '22px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
              }}
            >
              ×
            </button>
            <img
              src={APP_ICON}
              alt="GB STUDY"
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                border: '3px solid white',
                margin: '0 auto 12px',
                objectFit: 'cover'
              }}
            />
            <h2 style={{ marginBottom: '8px', fontSize: '1.4rem', fontWeight: 800 }}>
              Join Our Telegram Channel!
            </h2>
            <p style={{ color: '#ffe4e6', marginBottom: '20px', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Stay updated with latest updates and new website links if banned.
            </p>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsTelegramPopupOpen(false)}
              style={{
                background: '#ffffff',
                color: '#be185d',
                textDecoration: 'none',
                padding: '12px 32px',
                borderRadius: '30px',
                fontWeight: 800,
                fontSize: '1rem',
                display: 'inline-block',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s ease',
              }}
            >
              JOIN NOW
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
