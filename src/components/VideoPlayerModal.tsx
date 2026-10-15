import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Maximize, Volume2, VolumeX, FastForward, ExternalLink, Download, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { LectureVideo, VideoDetail } from '../types';
import { APP_ICON } from '../constants';

interface VideoPlayerModalProps {
  video: LectureVideo | null;
  onClose: () => void;
  onOpenPdf?: (url: string, title: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  onOpenPdf,
}) => {
  const [loading, setLoading] = useState(true);
  const [videoDetail, setVideoDetail] = useState<VideoDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!video) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setVideoDetail(null);

    // If video already has direct video_url that is a youtube embed
    if (video.video_url && video.video_url.includes('youtube.com')) {
      setVideoDetail({
        video_url: video.video_url,
        hd_video_url: video.video_url,
      });
      setLoading(false);
      return;
    }

    // Fetch video details from /api/video/:videoId
    fetch(`/api/video/${video.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch video details');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setVideoDetail(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Video error:', err);
        // Fallback to video.video_url if available
        if (video.video_url) {
          setVideoDetail({ video_url: video.video_url });
          setLoading(false);
        } else {
          setError('Unable to load video stream. The video may be processing or restricted.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [video]);

  // Handle speed change
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Handle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  if (!video) return null;

  const streamUrl = videoDetail?.video_url || videoDetail?.hd_video_url || video.video_url;
  const isYouTube = streamUrl?.includes('youtube.com') || streamUrl?.includes('youtu.be');
  const isDirectVideo = streamUrl?.endsWith('.mp4') || streamUrl?.includes('.akamaized.net');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden border border-pink-500/30 shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5 truncate">
            <img src={APP_ICON} alt="GB STUDY" className="w-7 h-7 rounded-lg border border-pink-500" />
            <h3 className="font-bold text-white text-sm sm:text-base truncate">
              {video.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-pink-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-semibold">Loading lecture stream...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 p-6 text-center text-rose-300 max-w-md">
              <AlertCircle className="w-10 h-10 text-rose-400" />
              <p className="text-sm">{error}</p>
              {streamUrl && (
                <a
                  href={streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 py-2 px-4 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Try External Player</span>
                </a>
              )}
            </div>
          ) : isYouTube && streamUrl ? (
            <iframe
              src={streamUrl.includes('autoplay') ? streamUrl : `${streamUrl}?autoplay=1&rel=0`}
              title={video.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : isDirectVideo && streamUrl ? (
            <div className="relative w-full h-full group">
              <video
                ref={videoRef}
                src={streamUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          ) : streamUrl ? (
            <iframe
              src={streamUrl}
              title={video.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="text-slate-400 text-sm">No video source found for this lecture.</div>
          )}
        </div>

        {/* Player Controls & Speed Selector (For direct MP4 videos) */}
        {isDirectVideo && (
          <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs text-slate-300">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-pink-400 font-bold flex items-center gap-1">
                <FastForward className="w-3.5 h-3.5" />
                <span>Speed:</span>
              </span>
              {[0.75, 1, 1.25, 1.5, 1.75, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => handleSpeedChange(spd)}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                    playbackSpeed === spd
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleFullscreen}
                className="p-1 text-slate-400 hover:text-white"
                title="Fullscreen"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Footer info & PDF attachment */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            <span className="text-pink-400 font-semibold">GB STUDY</span> • High Definition Classroom Lecture
          </div>

          <div className="flex items-center gap-2">
            {/* If video has attached PDF */}
            {videoDetail?.pdfs && videoDetail.pdfs.length > 0 && onOpenPdf && (
              <button
                onClick={() => onOpenPdf(videoDetail.pdfs![0].url, videoDetail.pdfs![0].title || `${video.name} PDF`)}
                className="py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lecture PDF</span>
              </button>
            )}

            {streamUrl && (
              <a
                href={streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Tab</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
