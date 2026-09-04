'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { showcaseVideosApi, imgUrl } from '@/lib/api';

// ── Draggable Camera Button — desktop only ────────────────────────────────────
function DraggableCameraButton({ onClick }: { onClick: () => void }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [didDrag, setDidDrag] = useState(false);
  const startRef = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  // Set initial position after mount (window is available)
  useEffect(() => {
    setPos({ x: window.innerWidth - 88, y: window.innerHeight / 2 - 32 });
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!pos) return;
    setDragging(true);
    setDidDrag(false);
    startRef.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    e.preventDefault();
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - startRef.current.mx;
      const dy = e.clientY - startRef.current.my;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setDidDrag(true);
      const nx = Math.max(0, Math.min(window.innerWidth  - 64, startRef.current.px + dx));
      const ny = Math.max(0, Math.min(window.innerHeight - 64, startRef.current.py + dy));
      setPos({ x: nx, y: ny });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging]);

  return (
    // hidden on mobile — md:block only
    <div className="hidden md:block fixed z-[50]"
      style={{ left: pos?.x ?? -999, top: pos?.y ?? -999, cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none', visibility: pos ? 'visible' : 'hidden' }}>
      <button
        onMouseDown={onMouseDown}
        onClick={() => { if (!didDrag) onClick(); }}
        className="group relative"
        style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #3a7bd5, #c9a96e, #e91e8c)',
          padding: '3px',
          boxShadow: '0 0 30px rgba(201,169,110,0.3), 0 0 60px rgba(58,123,213,0.15)',
          border: 'none',
        }}
        aria-label="Watch Our Work"
        title="Watch Our Showcase Videos"
      >
        <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: '#ffffff' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#camGrad)" strokeWidth="1.5">
            <defs>
              <linearGradient id="camGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3a7bd5" />
                <stop offset="50%" stopColor="#c9a96e" />
                <stop offset="100%" stopColor="#e91e8c" />
              </linearGradient>
            </defs>
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <circle cx="12" cy="13" r="4" />
            <path d="M7 3h4l1 3H6l1-3z" />
          </svg>
        </div>
        {/* Pulse */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-15 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #3a7bd5, #c9a96e, #e91e8c)' }} />
        {/* Tooltip */}
        <span className="absolute right-[72px] top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none px-3 py-1.5 rounded-lg text-[0.6rem] font-semibold tracking-wide uppercase"
          style={{ background: '#1a1a2e', color: '#ffffff', fontFamily: 'Helvetica Neue, sans-serif' }}>
          Watch Our Work
        </span>
      </button>
    </div>
  );
}

export default function VideoShowcase() {
  const [flash, setFlash] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);
  const touchStartY = useRef(0);

  const { data: videos = [] } = useQuery({
    queryKey: ['showcase-videos'],
    queryFn: showcaseVideosApi.get,
  });

  // Auto-advance videos
  useEffect(() => {
    if (!showVideos || !videos.length || videos.length <= 1) return;
    const t = setInterval(() => setCurrentVideo(c => (c + 1) % videos.length), 8000);
    return () => clearInterval(t);
  }, [showVideos, videos]);

  // Flash effect then show videos
  const handleShutter = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 400);
    setTimeout(() => setShowVideos(true), 500);
  };

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!videos.length || videos.length <= 1) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0) setCurrentVideo(c => (c + 1) % videos.length);
      else setCurrentVideo(c => (c - 1 + videos.length) % videos.length);
    }
  };

  const hasVideos = videos.length > 0;

  return (
    <>
      {/* Flash Overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[2000]"
            style={{ background: '#ffffff', pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1500] flex items-center justify-center"
            style={{ background: 'rgba(6,6,6,0.97)', backdropFilter: 'blur(20px)' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close */}
            <button
              onClick={() => setShowVideos(false)}
              className="absolute top-6 right-6 z-20 font-mono text-[0.6rem] tracking-[0.15em] uppercase px-4 py-2 border transition-all"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', borderRadius: '2px', background: 'rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e91e8c'; (e.currentTarget as HTMLElement).style.color = '#e91e8c'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
            >
              ✕ Close
            </button>

            {!hasVideos ? (
              <div className="text-center">
                <div className="font-display text-[2rem] mb-3" style={{ color: 'var(--c-gold)' }}>📽️</div>
                <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(0,0,0,0.35)' }}>No videos uploaded yet</p>
                <p className="text-[0.8rem] mt-2" style={{ color: 'rgba(0,0,0,0.5)' }}>Add videos from Admin → Showcase Videos</p>
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentVideo}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full absolute inset-0 flex flex-col items-center justify-center"
                  >
                    <div className="relative w-full h-full">
                      <video
                        key={videos[currentVideo]?.videoUrl}
                        src={imgUrl(videos[currentVideo]?.videoUrl)}
                        autoPlay muted loop playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                      <h3 className="font-serif text-[1.3rem] md:text-[1.6rem]" style={{ color: 'var(--c-cream)' }}>
                        {videos[currentVideo]?.title}
                      </h3>
                      {videos[currentVideo]?.description && (
                        <p className="font-mono text-[0.58rem] tracking-[0.12em] mt-2" style={{ color: 'rgba(0,0,0,0.4)' }}>
                          {videos[currentVideo].description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {videos.length > 1 && (
                  <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
                    {videos.map((_: any, i: number) => (
                      <button key={i} onClick={() => setCurrentVideo(i)}
                        className="transition-all duration-300"
                        style={{ width: '6px', height: i === currentVideo ? '28px' : '6px', borderRadius: '3px', background: i === currentVideo ? 'var(--c-gold)' : 'rgba(0,0,0,0.25)', transition: 'all 0.3s' }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Button — desktop only, draggable anywhere on screen */}
      <DraggableCameraButton onClick={handleShutter} />
    </>
  );
}
