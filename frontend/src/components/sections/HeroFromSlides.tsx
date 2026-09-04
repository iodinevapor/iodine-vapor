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

// Apply all text style properties — never clip, always wrap
const tStyle = (s: any): React.CSSProperties => ({
  color:          s?.color     || undefined,
  fontSize:       s?.fontSize  || undefined,
  fontWeight:     s?.fontWeight|| undefined,
  fontFamily:     s?.fontFamily|| undefined,
  textAlign:      (s?.textAlign || undefined) as any,
  fontStyle:      s?.italic    ? 'italic'    : undefined,
  textTransform:  s?.uppercase ? 'uppercase' : undefined,
  whiteSpace:     'normal',
  wordBreak:      'break-word',
  overflowWrap:   'break-word',
  lineHeight:     1.15,
});

const getTextAlign = (pos: string) => {
  if (pos === 'center' || pos === 'top-center' || pos === 'bottom-center') return 'items-center text-center';
  if (pos?.includes('right')) return 'items-end text-right';
  return 'items-start text-left';
};

const getJustify = (pos: string) => {
  if (pos?.includes('top'))    return 'justify-start';
  if (pos?.includes('bottom')) return 'justify-end';
  return 'justify-center'; // left / center / right → vertically center
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

  // ── No slides fallback ────────────────────────────────────────────────────
  if (!slides?.length) {
    return (
      <section className="relative mt-16" style={{ minHeight: '60vh' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#f0f0f0,#e8e8e8)' }} />
        <div className="relative z-10 flex flex-col justify-end h-full min-h-[60vh] px-6 md:px-12 pb-16 pt-24">
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
        {/* Desktop: side-by-side panels */}
        <div className="hidden md:flex absolute inset-0">
          {slides.map((s: any, i: number) => (
            <div key={s._id || i} className="flex-1 relative overflow-hidden">
              {s.imageUrl ? (
                <img src={imgUrl(s.imageUrl)} alt=""
                  className="w-full h-full object-cover transition-transform duration-700"
                  style={{ filter: 'grayscale(20%) contrast(1.05)' }}
                  onMouseEnter={e => { (e.target as HTMLImageElement).style.transform='scale(1.05)'; (e.target as HTMLImageElement).style.filter='grayscale(0%) contrast(1.1)'; }}
                  onMouseLeave={e => { (e.target as HTMLImageElement).style.transform='scale(1)';    (e.target as HTMLImageElement).style.filter='grayscale(20%) contrast(1.05)'; }}
                />
              ) : (
                <div className="w-full h-full" style={{ background: s.bgGradient || s.bgColor || '#f5f5f5' }} />
              )}
              <div className="absolute inset-0" style={{ background: `linear-gradient(180deg,rgba(0,0,0,${Math.max((s.overlayOpacity??0.2)-0.1,0.05)}) 0%,rgba(0,0,0,${Math.min((s.overlayOpacity??0.2)+0.1,0.4)}) 100%)` }} />
              <span className="absolute top-6 left-4 font-mono text-[0.6rem] tracking-[0.15em]" style={{ color: 'rgba(0,0,0,0.4)' }}>0{i+1}</span>
            </div>
          ))}
        </div>

        {/* Mobile: single carousel */}
        <div className="md:hidden absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div key={current}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
              transition={{ duration:0.6 }}
              className="absolute inset-0"
              style={{ background: slide?.bgGradient || slide?.bgColor || '#f5f5f5' }}
            >
              {slide?.imageUrl && (
                <>
                  <img src={imgUrl(slide.imageUrl)} alt="" className="w-full h-full object-cover" style={{ filter:'grayscale(20%) contrast(1.05)' }} />
                  <div className="absolute inset-0" style={{ background:`rgba(0,0,0,${slide.overlayOpacity??0.25})` }} />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none" style={{ background:'repeating-linear-gradient(0deg,rgba(0,0,0,0.02) 0px,rgba(0,0,0,0.02) 1px,transparent 1px,transparent 2px)' }} />
      </div>

      {/* ── Content — normal flow, NO absolute, auto height ── */}
      <div
        className={`relative z-10 flex flex-col ${getTextAlign(pos)} ${getJustify(pos)} min-h-[max(60vh,400px)] px-6 md:px-12 lg:px-16 py-24`}
      >
        <div style={{ maxWidth: '700px', width: '100%' }}>
          {/* Mini title */}
          {slide?.miniTitle?.text && (
            <motion.div
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
              className="flex items-center gap-3 mb-4 font-mono"
              style={{
                ...tStyle(slide.miniTitle),
                fontSize:      slide.miniTitle.fontSize || '0.62rem',
                color:         slide.miniTitle.color    || 'var(--c-gold)',
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                lineHeight:    1.4,
              }}
            >
              <span className="w-6 h-px flex-shrink-0" style={{ background: slide.miniTitle.color || 'var(--c-gold)' }} />
              {slide.miniTitle.text}
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            key={`title-${current}`}
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.3, duration:0.9, ease:[0.16,1,0.3,1] }}
            style={{
              ...tStyle(slide?.title),
              fontSize:   slide?.title?.fontSize   || 'clamp(2.5rem,8vw,8rem)',
              fontFamily: slide?.title?.fontFamily || 'Bebas Neue,sans-serif',
              color:      slide?.title?.color      || '#1a1a2e',
              lineHeight: 1.05,
              marginBottom: '0.35rem',
            }}
          >
            {slide?.title?.text || defaultTitle}
          </motion.h1>

          {/* Subtitle */}
          {(slide?.subtitle?.text || defaultSub) && (
            <motion.div
              key={`sub-${current}`}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.45, duration:0.9, ease:[0.16,1,0.3,1] }}
              style={{
                ...tStyle(slide?.subtitle),
                fontSize:   slide?.subtitle?.fontSize   || 'clamp(1.2rem,3vw,2.5rem)',
                fontFamily: slide?.subtitle?.fontFamily || 'DM Serif Display,serif',
                color:      slide?.subtitle?.color      || 'var(--c-gold)',
                lineHeight: 1.2,
                marginBottom: '1rem',
              }}
            >
              {slide?.subtitle?.text || defaultSub}
            </motion.div>
          )}

          {/* Paragraph */}
          {slide?.paragraph?.text && (
            <motion.p
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
              style={{
                ...tStyle(slide.paragraph),
                fontSize:   slide.paragraph.fontSize || '0.9rem',
                color:      slide.paragraph.color    || 'rgba(0,0,0,0.6)',
                lineHeight: 1.7,
                marginBottom: '1.5rem',
                maxWidth:   '520px',
              }}
            >
              {slide.paragraph.text}
            </motion.p>
          )}

          {/* CTA button */}
          {slide?.linkUrl && slide?.linkText && (
            <motion.a href={slide.linkUrl}
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.75 }}
              className="btn-primary" data-hover>
              <span>{slide.linkText}</span><span>→</span>
            </motion.a>
          )}
        </div>
      </div>

      {/* Mobile dots */}
      {slides?.length > 1 && (
        <div className="md:hidden absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_:any, i:number) => (
            <button key={i} onClick={() => setCurrent(i)}
              className="flex items-center justify-center"
              style={{ minWidth:'44px', minHeight:'44px' }}>
              <span style={{ width: i===current?'24px':'6px', height:'6px', borderRadius:'3px', background: i===current?'var(--c-gold)':'rgba(0,0,0,0.35)', display:'block', transition:'all 0.3s' }} />
            </button>
          ))}
        </div>
      )}

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background:'linear-gradient(0deg,var(--c-bg),transparent)' }} />
    </section>
  );
}
