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

// ── Apply ALL admin text style fields ────────────────────────────────────────
const tStyle = (s: any): React.CSSProperties => ({
  color:         s?.color      || undefined,
  fontSize:      s?.fontSize   || undefined,
  fontWeight:    s?.fontWeight || undefined,
  fontFamily:    s?.fontFamily || undefined,
  textAlign:     (s?.textAlign || undefined) as any,
  fontStyle:     s?.italic     ? 'italic'    : undefined,
  textTransform: s?.uppercase  ? 'uppercase' : 'none',
  whiteSpace:    'normal',
  wordBreak:     'break-word',
  overflowWrap:  'break-word',
});

// ── Position → vertical justify ──────────────────────────────────────────────
const getPosJustify = (pos: string): string => {
  if (pos?.startsWith('top'))    return 'justify-start';
  if (pos?.startsWith('bottom')) return 'justify-end';
  return 'justify-center';
};

// ── Position → horizontal align for the WRAPPER ──────────────────────────────
const getPosAlign = (pos: string): React.CSSProperties => {
  if (pos?.endsWith('right') || pos === 'right')
    return { marginLeft: 'auto', marginRight: 0, textAlign: 'right' };
  if (pos === 'center' || pos?.endsWith('-center'))
    return { marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' };
  return { marginLeft: 0, marginRight: 'auto', textAlign: 'left' };
};

// ── miniTitle line direction based on text-align ──────────────────────────────
const getMiniTitleFlex = (pos: string): string => {
  if (pos === 'center' || pos?.endsWith('-center')) return 'flex-col items-center';
  if (pos?.endsWith('right') || pos === 'right')    return 'flex-row-reverse items-center';
  return 'flex-row items-center';
};

export default function HeroFromSlides({ slides, page, defaultTitle = 'TITLE', defaultSub }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!slides?.length || slides.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides]);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!slides?.length || slides.length <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    if (Math.abs(delta) > 50) {
      if (delta < 0) setCurrent(c => (c + 1) % slides.length);
      else           setCurrent(c => (c - 1 + slides.length) % slides.length);
    }
  };

  const slide = slides?.[current];
  const pos   = slide?.position || 'bottom-left';
  const posAlign = getPosAlign(pos);

  // ── No slides fallback ────────────────────────────────────────────────────
  if (!slides?.length) {
    return (
      <section className="relative mt-16" style={{ minHeight: '60vh' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#f0f0f0,#e8e8e8)' }} />
        <div className="relative z-10 flex flex-col justify-end min-h-[60vh] px-6 md:px-12 pb-16 pt-24">
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.16,1,0.3,1] }}
            style={{ fontSize: 'clamp(2.5rem,8vw,8rem)', fontFamily: 'Bebas Neue,sans-serif', color: '#1a1a2e', lineHeight: 1.05, wordBreak: 'break-word' }}
          >{defaultTitle}</motion.h1>
          {defaultSub && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.9, ease: [0.16,1,0.3,1] }}
              style={{ fontSize: 'clamp(1.2rem,3vw,2.5rem)', fontFamily: 'DM Serif Display,serif', fontStyle: 'italic', color: 'var(--c-gold)', wordBreak: 'break-word' }}
            >{defaultSub}</motion.div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(0deg,var(--c-bg),transparent)' }} />
      </section>
    );
  }

  // ── Main hero ─────────────────────────────────────────────────────────────
  return (
    <section
      className="relative mt-16 overflow-hidden"
      style={{ minHeight: 'max(60vh, 400px)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0">

        {/* Desktop: side-by-side panels — each with own bg/image/overlay */}
        <div className="hidden md:flex absolute inset-0">
          {slides.map((s: any, i: number) => (
            <div key={s._id || i} className="flex-1 relative overflow-hidden">
              {s.imageUrl ? (
                <img
                  src={imgUrl(s.imageUrl)} alt=""
                  className="w-full h-full object-cover transition-transform duration-700"
                  style={{ filter: 'grayscale(20%) contrast(1.05)' }}
                  onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.05)'; (e.target as HTMLImageElement).style.filter = 'grayscale(0%) contrast(1.1)'; }}
                  onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)';    (e.target as HTMLImageElement).style.filter = 'grayscale(20%) contrast(1.05)'; }}
                />
              ) : (
                <div className="w-full h-full" style={{ background: s.bgGradient || s.bgColor || '#e8e8e8' }} />
              )}
              {/* per-panel overlay */}
              <div className="absolute inset-0" style={{
                background: `rgba(0,0,0,${s.overlayOpacity ?? 0.3})`
              }} />
              <span className="absolute top-5 left-3 font-mono text-[0.55rem] tracking-[0.15em]"
                style={{ color: 'rgba(255,255,255,0.35)' }}>0{i + 1}</span>
            </div>
          ))}
        </div>

        {/* Mobile: single slide carousel */}
        <div className="md:hidden absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
              style={{ background: slide?.bgGradient || slide?.bgColor || '#e8e8e8' }}
            >
              {slide?.imageUrl && (
                <>
                  <img src={imgUrl(slide.imageUrl)} alt="" className="w-full h-full object-cover"
                    style={{ filter: 'grayscale(20%) contrast(1.05)' }} />
                  <div className="absolute inset-0"
                    style={{ background: `rgba(0,0,0,${slide.overlayOpacity ?? 0})` }} />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.02) 0px,rgba(0,0,0,0.02) 1px,transparent 1px,transparent 2px)' }} />
      </div>

      {/* ── Content — position-aware, never clips ── */}
      <div
        className={`relative z-10 flex flex-col w-full min-h-[max(60vh,400px)] ${getPosJustify(pos)} px-6 md:px-12 lg:px-16 py-24`}
      >
        {/* Inner wrapper — aligned by position */}
        <div style={{ maxWidth: '720px', width: '100%', ...posAlign }}>

          {/* ── Mini Title — with per-word color support ── */}
          {slide?.miniTitle?.text && (
            <motion.div
              key={`mt-${current}`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-4"
              style={{
                ...tStyle(slide.miniTitle),
                fontSize:      slide.miniTitle.fontSize  || '0.62rem',
                letterSpacing: '0.28em',
                lineHeight:    1.5,
                textAlign:     (slide.miniTitle.textAlign || posAlign.textAlign) as any,
                display:       'block',
              }}
            >
              {slide.miniTitleWords?.length > 0 ? (
                /* Per-word colors set in admin */
                <span className="flex flex-wrap gap-[0.35em]">
                  {slide.miniTitle.text.trim().split(/\s+/).map((word: string, i: number) => (
                    <span key={i} style={{ color: slide.miniTitleWords[i]?.color || slide.miniTitle.color || 'rgba(255,255,255,0.7)' }}>
                      {word}
                    </span>
                  ))}
                </span>
              ) : (
                /* Fallback: single color from miniTitle.color */
                <span style={{ color: slide.miniTitle.color || 'rgba(255,255,255,0.7)' }}>
                  {slide.miniTitle.text}
                </span>
              )}
            </motion.div>
          )}

          {/* ── Title ── */}
          <motion.h1
            key={`title-${current}`}
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              ...tStyle(slide?.title),
              fontSize:    slide?.title?.fontSize   || 'clamp(2.5rem, 8vw, 7rem)',
              fontFamily:  slide?.title?.fontFamily || 'Bebas Neue, sans-serif',
              fontWeight:  slide?.title?.fontWeight || '700',
              color:       slide?.title?.color      || '#ffffff',
              lineHeight:  1.05,
              marginBottom: '0.3rem',
              // textAlign from admin overrides position-based align
              textAlign:   (slide?.title?.textAlign || posAlign.textAlign) as any,
            }}
          >
            {slide?.title?.text || defaultTitle}
          </motion.h1>

          {/* ── Subtitle ── */}
          {(slide?.subtitle?.text || defaultSub) && (
            <motion.div
              key={`sub-${current}`}
              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{
                ...tStyle(slide?.subtitle),
                fontSize:    slide?.subtitle?.fontSize   || 'clamp(1.1rem, 3vw, 2.2rem)',
                fontFamily:  slide?.subtitle?.fontFamily || 'DM Serif Display, serif',
                fontWeight:  slide?.subtitle?.fontWeight || '400',
                color:       slide?.subtitle?.color      || 'var(--c-gold)',
                lineHeight:  1.2,
                marginBottom: '1rem',
                textAlign:   (slide?.subtitle?.textAlign || posAlign.textAlign) as any,
              }}
            >
              {slide?.subtitle?.text || defaultSub}
            </motion.div>
          )}

          {/* ── Paragraph ── */}
          {slide?.paragraph?.text && (
            <motion.p
              key={`para-${current}`}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              style={{
                ...tStyle(slide.paragraph),
                fontSize:    slide.paragraph.fontSize   || '0.9rem',
                fontFamily:  slide.paragraph.fontFamily || 'inherit',
                fontWeight:  slide.paragraph.fontWeight || '400',
                color:       slide.paragraph.color      || 'rgba(255,255,255,0.7)',
                lineHeight:  1.75,
                marginBottom: '1.5rem',
                maxWidth:    '520px',
                // inherit position alignment unless admin overrides
                textAlign:   (slide.paragraph.textAlign || posAlign.textAlign) as any,
                ...(posAlign.textAlign === 'center' ? { marginLeft: 'auto', marginRight: 'auto' } : {}),
                ...(posAlign.textAlign === 'right'  ? { marginLeft: 'auto', marginRight: 0      } : {}),
              }}
            >
              {slide.paragraph.text}
            </motion.p>
          )}

          {/* ── CTA Button ── */}
          {slide?.linkUrl && slide?.linkText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
              style={{ display: 'flex', justifyContent: posAlign.textAlign === 'center' ? 'center' : posAlign.textAlign === 'right' ? 'flex-end' : 'flex-start' }}
            >
              <a href={slide.linkUrl} className="btn-primary" data-hover>
                <span>{slide.linkText}</span><span>→</span>
              </a>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile dots */}
      {slides?.length > 1 && (
        <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {slides.map((_: any, i: number) => (
            <button key={i} onClick={() => setCurrent(i)}
              className="flex items-center justify-center"
              style={{ minWidth: '44px', minHeight: '44px' }}>
              <span style={{
                width: i === current ? '24px' : '6px', height: '6px',
                borderRadius: '3px', display: 'block', transition: 'all 0.3s',
                background: i === current ? 'var(--c-gold)' : 'rgba(255,255,255,0.4)',
              }} />
            </button>
          ))}
        </div>
      )}

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{ background: 'linear-gradient(0deg, var(--c-bg), transparent)' }} />
    </section>
  );
}
