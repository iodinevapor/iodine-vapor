'use client';
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { imgUrl } from '@/lib/api';

interface Props {
  slides: any[];
  page: string;
  defaultTitle?: string;
  defaultSub?: string;
}

// Text style helper — applies all textStyleSchema properties
const tStyle = (s: any): React.CSSProperties => ({
  color:         s?.color || undefined,
  fontSize:      s?.fontSize || undefined,
  fontWeight:    s?.fontWeight || undefined,
  fontFamily:    s?.fontFamily || undefined,
  textAlign:     (s?.textAlign || undefined) as any,
  fontStyle:     s?.italic ? 'italic' : undefined,
  textTransform: s?.uppercase ? 'uppercase' : undefined,
});

// Position mapping — absolute placement within hero
const getPositionStyle = (pos: string): React.CSSProperties => {
  const base: React.CSSProperties = { position: 'absolute', zIndex: 10, maxWidth: '1400px' };
  switch (pos) {
    case 'top-left':      return { ...base, top: '80px', left: '0' };
    case 'top-center':    return { ...base, top: '80px', left: '50%', transform: 'translateX(-50%)' };
    case 'top-right':     return { ...base, top: '80px', right: '0' };
    case 'left':          return { ...base, top: '50%', left: '0', transform: 'translateY(-50%)' };
    case 'center':        return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    case 'right':         return { ...base, top: '50%', right: '0', transform: 'translateY(-50%)' };
    case 'bottom-left':   return { ...base, bottom: '60px', left: '0' };
    case 'bottom-center': return { ...base, bottom: '60px', left: '50%', transform: 'translateX(-50%)' };
    case 'bottom-right':  return { ...base, bottom: '60px', right: '0' };
    default:              return { ...base, bottom: '60px', left: '0' };
  }
};

const getTextAlign = (pos: string) => {
  if (pos === 'center' || pos === 'top-center' || pos === 'bottom-center') return 'text-center';
  if (pos?.includes('right')) return 'text-right';
  return 'text-left';
};

export default function HeroFromSlides({ slides, page, defaultTitle = 'TITLE', defaultSub }: Props) {
  const [current, setCurrent] = useState(0);

  // Auto-advance (5 seconds)
  useEffect(() => {
    if (!slides?.length || slides.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides]);

  // Touch swipe for mobile
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!slides?.length || slides.length <= 1) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const isVertical = Math.abs(deltaY) > Math.abs(deltaX);
    const delta = isVertical ? deltaY : deltaX;
    if (Math.abs(delta) > 50) {
      if (delta < 0) setCurrent(c => (c + 1) % slides.length);
      else setCurrent(c => (c - 1 + slides.length) % slides.length);
    }
  };

  const slide = slides?.[current];

  // If no slides, show minimal fallback with defaultTitle
  if (!slides?.length) {
    return (
      <section className="relative overflow-hidden px-6 md:px-12 mt-16" style={{ minHeight: '40vh' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)' }} />
        <div className="absolute bottom-16 left-6 md:left-12 z-10">
          <motion.h1
            initial={{ y: '100%' }} animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="leading-[0.9]"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 8rem)', fontFamily: 'Bebas Neue, sans-serif', color: '#1a1a2e' }}
          >
            {defaultTitle}
          </motion.h1>
          {defaultSub && (
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }}
              transition={{ delay: 0.45, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: 'clamp(1.2rem, 3vw, 2.5rem)', fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', color: 'var(--c-gold)' }}
            >
              {defaultSub}
            </motion.div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: 'linear-gradient(0deg, var(--c-bg), transparent)' }} />
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden px-4 md:px-6 lg:px-12 mt-16"
      style={{ minHeight: '40vh' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background - Desktop: panels side-by-side | Mobile: carousel */}
      <div className="absolute inset-0">
        {/* Desktop: All slides as panels */}
        <div className="hidden md:flex absolute inset-0">
          {slides.map((s: any, i: number) => (
            <div key={s._id || i} className="flex-1 relative overflow-hidden" style={{ transition: 'flex 0.6s ease' }}>
              {s.imageUrl ? (
                <img
                  src={imgUrl(s.imageUrl)} alt=""
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(20%) contrast(1.05)', transition: 'transform 0.8s, filter 0.8s' }}
                  onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.05)'; (e.target as HTMLImageElement).style.filter = 'grayscale(0%) contrast(1.1)'; }}
                  onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; (e.target as HTMLImageElement).style.filter = 'grayscale(20%) contrast(1.05)'; }}
                />
              ) : (
                <div className="w-full h-full" style={{ background: s.bgGradient || s.bgColor || '#f5f5f5' }} />
              )}
              <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(0,0,0,${Math.max((s.overlayOpacity ?? 0.2) - 0.1, 0.05)}) 0%, rgba(0,0,0,${Math.min((s.overlayOpacity ?? 0.2) + 0.1, 0.4)}) 100%)` }} />
              <span className="absolute top-6 left-4 font-mono text-[0.6rem] tracking-[0.15em]" style={{ color: 'rgba(0,0,0,0.4)' }}>0{i + 1}</span>
            </div>
          ))}
        </div>

        {/* Mobile: Single slide carousel (vertical slide animation) */}
        <div className="md:hidden absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
              style={{ background: slide?.bgGradient || slide?.bgColor || '#f5f5f5' }}
            >
              {slide?.imageUrl && (
                <>
                  <img src={imgUrl(slide.imageUrl)} alt="" className="w-full h-full object-cover" style={{ filter: 'grayscale(20%) contrast(1.05)' }} />
                  <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${slide.overlayOpacity ?? 0.25})` }} />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Scan lines */}
        <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 2px)', pointerEvents: 'none' }} />
      </div>

      {/* Content - positioned per slide.position */}
      <div
        className={`px-4 md:px-6 lg:px-12 ${getTextAlign(slide?.position || 'left')}`}
        style={{ ...getPositionStyle(slide?.position || 'bottom-left'), maxWidth: 'min(700px, 90vw)' }}
      >
        {slide?.miniTitle?.text && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-4 font-mono tracking-[0.3em]"
            style={{ ...tStyle(slide.miniTitle), fontSize: slide.miniTitle.fontSize || '0.58rem', color: slide.miniTitle.color || 'var(--c-gold)', textTransform: 'uppercase' }}>
            <span className="w-6 h-px" style={{ background: slide.miniTitle.color || 'var(--c-gold)' }} />
            {slide.miniTitle.text}
          </motion.div>
        )}

        <div className="mb-2">
          <motion.h1
            key={`title-${current}`}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="leading-[1.05]"
            style={{
              ...tStyle(slide?.title),
              fontSize: slide?.title?.fontSize || 'clamp(2.5rem, 8vw, 8rem)',
              fontFamily: slide?.title?.fontFamily || 'Bebas Neue, sans-serif',
              color: slide?.title?.color || '#1a1a2e',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {slide?.title?.text || defaultTitle}
          </motion.h1>
        </div>

        {(slide?.subtitle?.text || defaultSub) && (
          <div className="mb-4">
            <motion.div
              key={`sub-${current}`}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="leading-[1.2]"
              style={{
                ...tStyle(slide?.subtitle),
                fontSize: slide?.subtitle?.fontSize || 'clamp(1.2rem, 3vw, 2.5rem)',
                fontFamily: slide?.subtitle?.fontFamily || 'DM Serif Display, serif',
                color: slide?.subtitle?.color || 'var(--c-gold)',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {slide?.subtitle?.text || defaultSub}
            </motion.div>
          </div>
        )}

        {slide?.paragraph?.text && (
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="mb-6 max-w-lg"
            style={{ ...tStyle(slide.paragraph), fontSize: slide.paragraph.fontSize || '0.9rem', color: slide.paragraph.color || 'rgba(0,0,0,0.55)' }}>
            {slide.paragraph.text}
          </motion.p>
        )}

        {slide?.linkUrl && slide?.linkText && (
          <motion.a href={slide.linkUrl} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
            className="btn-primary" data-hover>
            <span>{slide.linkText}</span><span>→</span>
          </motion.a>
        )}
      </div>

      {/* Mobile dots */}
      {slides?.length > 1 && (
        <div className="md:hidden absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_: any, i: number) => (
            <button key={i} onClick={() => setCurrent(i)}
              className="flex items-center justify-center transition-all duration-300"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <span style={{ width: i === current ? '24px' : '6px', height: '6px', borderRadius: '3px', background: i === current ? 'var(--c-gold)' : 'rgba(0,0,0,0.35)', display: 'block', transition: 'all 0.3s' }} />
            </button>
          ))}
        </div>
      )}

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: 'linear-gradient(0deg, var(--c-bg), transparent)' }} />
    </section>
  );
}
