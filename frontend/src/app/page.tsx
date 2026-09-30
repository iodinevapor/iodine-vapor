'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import VideoShowcase from '@/components/sections/VideoShowcase';
import { IoLocation } from 'react-icons/io5';
import { MdEmail } from 'react-icons/md';
import { LuPhoneCall } from 'react-icons/lu';
import {
  slidesApi, servicesApi, portfolioApi, workshopsApi,
  settingsApi, testimonialsApi, brandsApi, imgUrl,
} from '@/lib/api';
import { useInView } from 'react-intersection-observer';

// Ã¢â€â‚¬Ã¢â€â‚¬ Reveal Hook Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const useReveal = (threshold = 0.05) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold, rootMargin: '0px 0px -40px 0px' });
  const [forceVisible, setForceVisible] = useState(false);
  useEffect(() => {
    // Fallback: if IntersectionObserver never fires (PDF/print/headless), show after 1.2s
    const t = setTimeout(() => setForceVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);
  return { ref, inView: inView || forceVisible };
};

// Ã¢â€â‚¬Ã¢â€â‚¬ Animated Counter Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useReveal(0.3);
  useEffect(() => {
    if (!inView) return;
    const dur = 2000;
    const step = (t: number, s: number) => {
      const p = Math.min((t - s) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(t2 => step(t2, s));
    };
    requestAnimationFrame(t => step(t, t));
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Text Style Helper Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const tStyle = (s: any): React.CSSProperties => ({
  color:         s?.color || undefined,
  fontSize:      s?.fontSize || undefined,
  fontWeight:    s?.fontWeight || undefined,
  fontFamily:    s?.fontFamily || undefined,
  textAlign:     (s?.textAlign || undefined) as any,
  fontStyle:     s?.italic ? 'italic' : undefined,
  textTransform: s?.uppercase ? 'uppercase' : undefined,
});

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// 1. HERO SECTION Ã¢â‚¬â€ Two-column: text left, image right (reference design)
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

const HF = 'Helvetica Neue, Helvetica, Arial, sans-serif';

function Hero({ slides, settings, services }: { slides: any[]; settings: any; services: any[] }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (!slides?.length || slides.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!slides?.length || slides.length <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? setCurrent(c => (c + 1) % slides.length) : setCurrent(c => (c - 1 + slides.length) % slides.length);
  };

  const slide = slides?.[current];

  // Ã¢â€â‚¬Ã¢â€â‚¬ Fallback when no CMS slides Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  if (!slides?.length) return (
    <section style={{ background: '#fff', minHeight: '100svh', paddingTop: '64px' }} aria-label="Hero">
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 py-16 md:py-24 min-h-[calc(100svh-64px)]">
          {/* Text */}
          <div>
            <h1 style={{ fontFamily: HF, fontWeight: 800, fontSize: 'clamp(2.4rem,5.5vw,5rem)', lineHeight: 1.0, color: '#111', marginBottom: '1.25rem', wordBreak: 'break-word' }}>
              WE CREATE.<br />WE TEACH.<br />WE MAKE YOU <span style={{ color: '#e91e8c' }}>SEE.</span>
            </h1>
            <p style={{ fontFamily: HF, fontSize: '0.9rem', lineHeight: 1.75, color: 'rgba(0,0,0,0.5)', maxWidth: '380px', marginBottom: '2rem' }}>
              A photography studio and education practice for people who want to see more, understand better and create with intention.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/services"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.75rem] font-bold uppercase tracking-[0.05em] transition-all"
                style={{ background: '#111', color: '#fff', fontFamily: HF }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#e91e8c'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#111'}
              >Explore Studio <span>Ã¢â€ â€™</span></Link>
              <Link href="/workshops"
                className="inline-flex items-center gap-2 text-[0.75rem] font-semibold transition-colors"
                style={{ color: '#111', fontFamily: HF }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e91e8c'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#111'}
              >Learn Photography <span>Ã¢â€ â€™</span></Link>
            </div>
          </div>
          {/* Image placeholder */}
          <div className="hidden md:flex items-center justify-center" style={{ aspectRatio: '4/5', background: '#f0f0f0', borderRadius: '4px' }}>
            <span style={{ fontFamily: HF, fontSize: '0.7rem', color: 'rgba(0,0,0,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Add image via CMS</span>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <section
      style={{ background: slide?.bgGradient || slide?.bgColor || '#fff', minHeight: '100svh', paddingTop: '64px' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Hero"
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12 py-12 md:py-20 min-h-[calc(100svh-64px)]">

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ LEFT: Text Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>

              {/* Mini Title / eyebrow */}
              {slide?.miniTitle?.text && (
                <div className="mb-4" style={{ fontFamily: HF, fontSize: slide.miniTitle.fontSize || '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600 }}>
                  {slide.miniTitleWords?.length > 0 ? (
                    <span className="flex flex-wrap gap-[0.3em]">
                      {slide.miniTitle.text.trim().split(/\s+/).map((w: string, i: number) => (
                        <span key={i} style={{ color: slide.miniTitleWords[i]?.color || slide.miniTitle.color || '#e91e8c' }}>{w}</span>
                      ))}
                    </span>
                  ) : <span style={{ color: slide.miniTitle.color || '#e91e8c' }}>{slide.miniTitle.text}</span>}
                </div>
              )}

              {/* H1 Title */}
              <h1 style={{
                fontFamily:    slide?.title?.fontFamily  || HF,
                fontWeight:    slide?.title?.fontWeight  || '800',
                fontSize:      slide?.title?.fontSize    || 'clamp(2.4rem, 5.5vw, 5rem)',
                lineHeight:    1.0,
                color:         slide?.title?.color       || '#111',
                marginBottom:  slide?.subtitle?.text ? '0.25rem' : '1.25rem',
                wordBreak:     'break-word',
                textTransform: slide?.title?.uppercase   ? 'uppercase' : 'none',
                fontStyle:     slide?.title?.italic      ? 'italic' : 'normal',
              }}>
                {slide?.title?.text || 'Commercial Photography'}
              </h1>

              {/* H2 Subtitle */}
              {slide?.subtitle?.text && (
                <h2 style={{
                  fontFamily:    slide.subtitle.fontFamily || HF,
                  fontWeight:    slide.subtitle.fontWeight || '800',
                  fontSize:      slide.subtitle.fontSize   || 'clamp(2.4rem, 5.5vw, 5rem)',
                  lineHeight:    1.0,
                  color:         slide.subtitle.color      || '#e91e8c',
                  marginBottom:  '1.25rem',
                  wordBreak:     'break-word',
                  textTransform: slide.subtitle.uppercase  ? 'uppercase' : 'none',
                }}>
                  {slide.subtitle.text}
                </h2>
              )}

              {/* Paragraph */}
              {slide?.paragraph?.text && (
                <p style={{
                  fontFamily:   slide.paragraph.fontFamily || HF,
                  fontSize:     slide.paragraph.fontSize   || '0.9rem',
                  fontWeight:   slide.paragraph.fontWeight || '400',
                  lineHeight:   1.75,
                  color:        slide.paragraph.color      || 'rgba(0,0,0,0.5)',
                  maxWidth:     '400px',
                  marginBottom: '2rem',
                  wordBreak:    'break-word',
                }}>
                  {slide.paragraph.text}
                </p>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                {slide?.linkUrl && slide?.linkText ? (
                  <a href={slide.linkUrl}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.75rem] font-bold uppercase tracking-[0.05em] transition-all"
                    style={{ background: '#111', color: '#fff', fontFamily: HF }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#e91e8c'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#111'}
                  >{slide.linkText} <span>Ã¢â€ â€™</span></a>
                ) : (
                  <>
                    <Link href="/services"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.75rem] font-bold uppercase tracking-[0.05em] transition-all"
                      style={{ background: '#111', color: '#fff', fontFamily: HF }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#e91e8c'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#111'}
                    >Explore Studio <span>Ã¢â€ â€™</span></Link>
                    <Link href="/workshops"
                      className="inline-flex items-center gap-2 text-[0.75rem] font-semibold transition-colors"
                      style={{ color: '#111', fontFamily: HF }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e91e8c'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#111'}
                    >Learn Photography <span>Ã¢â€ â€™</span></Link>
                  </>
                )}
              </div>

              {/* Slide dots */}
              {slides.length > 1 && (
                <div className="flex gap-2 mt-8">
                  {slides.map((_: any, i: number) => (
                    <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`}
                      style={{ width: i === current ? '24px' : '6px', height: '6px', borderRadius: '3px', background: i === current ? '#111' : 'rgba(0,0,0,0.2)', transition: 'all 0.3s', border: 'none', padding: 0, cursor: 'pointer' }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ RIGHT: Image Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <div className="hidden md:block relative" style={{ aspectRatio: '4/5', overflow: 'hidden', borderRadius: '4px' }}>
            <AnimatePresence mode="wait">
              <motion.div key={`img-${current}`} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="absolute inset-0">
                {slide?.imageUrl ? (
                  <>
                    <img
                      src={imgUrl(slide.imageUrl)}
                      alt={slide?.title?.text || 'Hero'}
                      className={`w-full h-full object-cover object-top ${slide?.mobileImageUrl ? 'hidden md:block' : 'block'}`}
                      style={{ filter: 'grayscale(10%)' }}
                    />
                    {slide?.mobileImageUrl && <img src={imgUrl(slide.mobileImageUrl)} alt="" className="w-full h-full object-cover block md:hidden" />}
                  </>
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: HF, fontSize: '0.7rem', color: 'rgba(0,0,0,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Upload image in CMS</span>
                  </div>
                )}
                {(slide?.overlayOpacity ?? 0) > 0 && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${slide.overlayOpacity})` }} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile: image below text */}
          {slide?.imageUrl && (
            <div className="block md:hidden w-full" style={{ aspectRatio: '16/9', overflow: 'hidden', borderRadius: '4px' }}>
              <img src={imgUrl(slide.mobileImageUrl || slide.imageUrl)} alt={slide?.title?.text || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// 2. TRUSTED BY BRANDS SECTION Ã¢â‚¬â€ Modern marquee
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
function TrustedBrands({ brands }: { brands: any[] }) {
  if (!brands?.length) return null;

  // Brand card colors for text-only brands
  const COLORS = ['#e91e8c','#1a1a2e','#7c3aed','#0ea5e9','#059669','#d97706','#dc2626','#0284c7'];

  // Duplicate brands for seamless infinite loop
  const doubled = [...brands, ...brands, ...brands];

  return (
    <section className="py-10 md:py-14 border-b overflow-hidden" style={{ background: '#ffffff', borderColor: 'rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div className="px-6 md:px-12 mb-8">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.12))' }} />
            <p className="font-mono text-[0.52rem] tracking-[0.3em] uppercase flex items-center gap-2" style={{ color: 'rgba(0,0,0,0.35)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#e91e8c' }} />
              Trusted by Leading Brands
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#e91e8c' }} />
            </p>
            <div className="h-px flex-1 w-16" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.12), transparent)' }} />
          </div>
        </div>
      </div>

      {/* Infinite marquee */}
      <div className="relative">
        {/* Left/right fades */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, #ffffff 0%, transparent 100%)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(270deg, #ffffff 0%, transparent 100%)' }} />

        {/* Scrolling track */}
        <div
          className="flex gap-4 w-max"
          style={{ animation: 'brandScroll 30s linear infinite' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.animationPlayState = 'paused'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.animationPlayState = 'running'}
        >
          {doubled.map((brand: any, i: number) => {
            const color = COLORS[i % COLORS.length];
            return (
              <div
                key={`${brand._id}-${i}`}
                className="flex-shrink-0 flex items-center justify-center group cursor-default transition-all duration-300"
                style={{
                  height: '72px',
                  minWidth: '140px',
                  padding: '0 20px',
                  background: '#ffffff',
                  border: '1.5px solid rgba(0,0,0,0.07)',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.25s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${color}18`;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.07)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                }}
              >
                {brand.logoUrl ? (
                  <img
                    src={imgUrl(brand.logoUrl)}
                    alt={brand.name}
                    className="max-h-[40px] w-auto object-contain"
                    style={{ filter: 'grayscale(60%) opacity(60%)', transition: 'filter 0.3s' }}
                    onMouseEnter={e => (e.target as HTMLImageElement).style.filter = 'grayscale(0%) opacity(100%)'}
                    onMouseLeave={e => (e.target as HTMLImageElement).style.filter = 'grayscale(60%) opacity(60%)'}
                    onError={e => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const parent = img.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span style="font-family:'Syne',sans-serif;font-size:0.82rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${color}">${brand.name}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: color,
                    opacity: 0.7,
                    transition: 'opacity 0.3s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.7'}
                  >
                    {brand.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS animation */}
      <style>{`
        @keyframes brandScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% / 3)); }
        }
      `}</style>
    </section>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// 3. COMMERCIAL PHOTOGRAPHY SERVICES Ã¢â‚¬â€ Auto-slide carousel
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
function Services({ services }: { services: any[] }) {
  const { ref, inView } = useReveal();
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef    = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const CARD_W = 200;
  const total  = services?.length || 0;

  // Auto-slide every 5s
  useEffect(() => {
    if (!total) return;
    intervalRef.current = setInterval(() => {
      setActiveIdx(i => (i + 1) % total);
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [total]);

  // Scroll track to activeIdx
  useEffect(() => {
    if (!trackRef.current || !total) return;
    trackRef.current.scrollTo({ left: activeIdx * CARD_W, behavior: 'smooth' });
  }, [activeIdx, total]);

  const goTo = (i: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveIdx(i);
    intervalRef.current = setInterval(() => {
      setActiveIdx(idx => (idx + 1) % total);
    }, 5000);
  };

  if (!total) return null;

  return (
    <section className="py-14 md:py-20" style={{ background: '#ffffff' }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">

        {/* Header */}
        <div ref={ref} className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 reveal ${inView ? 'visible' : ''}`}>
          <div>
            <p className="font-mono text-[0.55rem] tracking-[0.28em] uppercase mb-2 flex items-center gap-2" style={{ color: '#e91e8c' }}>
              <span className="w-5 h-px inline-block" style={{ background: '#e91e8c' }} />What We Offer
            </p>
            <h2 className="font-bold text-[#1a1a2e] leading-[1.05]" style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
              Our Commercial Photography Services
            </h2>
            <p className="text-[0.85rem] mt-1.5" style={{ color: 'rgba(0,0,0,0.45)' }}>
              Tailored photography solutions for every business need.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Dot indicators */}
            <div className="hidden md:flex items-center gap-1.5">
              {services.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === activeIdx ? '20px' : '6px',
                    height: '6px',
                    background: i === activeIdx ? '#e91e8c' : 'rgba(0,0,0,0.15)',
                  }} />
              ))}
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, #ffffff, transparent)' }} />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none" style={{ background: 'linear-gradient(270deg, #ffffff, transparent)' }} />

          {/* Scrollable track */}
          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}
          >
            {services.map((svc: any, i: number) => (
              <Link
                key={svc._id}
                href={`/services/${svc.slug || ''}`}
                className="group flex-shrink-0 flex flex-col border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
                style={{
                  width: `${CARD_W}px`,
                  background: i === activeIdx ? 'linear-gradient(135deg, #fff0f8, #fdf4ff)' : '#ffffff',
                  borderColor: i === activeIdx ? 'rgba(233,30,140,0.25)' : 'rgba(0,0,0,0.08)',
                  boxShadow: i === activeIdx ? '0 4px 20px rgba(233,30,140,0.1)' : 'none',
                  transition: 'all 0.35s ease',
                  textDecoration: 'none',
                }}
                onClick={() => goTo(i)}
              >
                {/* Service image or icon top */}
                {svc.imageUrl ? (
                  <div className="overflow-hidden" style={{ height: '120px' }}>
                    <img src={imgUrl(svc.imageUrl)} alt={svc.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ filter: 'grayscale(20%)' }} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center" style={{ height: '90px', background: 'rgba(233,30,140,0.05)' }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[1.5rem]"
                      style={{ background: 'rgba(233,30,140,0.1)' }}>
                      {svc.icon || 'Ã°Å¸â€œÂ¸'}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-[0.82rem] leading-[1.3] mb-1.5 text-[#1a1a2e] group-hover:text-[#e91e8c] transition-colors"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    {svc.name}
                  </h3>
                  {svc.shortDesc && (
                    <p className="text-[0.68rem] leading-[1.55] mb-3 flex-1" style={{ color: 'rgba(0,0,0,0.45)' }}>
                      {svc.shortDesc.slice(0, 65)}{svc.shortDesc.length > 65 ? 'Ã¢â‚¬Â¦' : ''}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 font-bold text-[0.62rem] tracking-[0.08em] uppercase mt-auto"
                    style={{ color: '#e91e8c' }}>
                    View Details
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </div>

                {/* Active indicator bar */}
                {i === activeIdx && (
                  <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #e91e8c, #c4167a)' }} />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile CTA */}

      </div>
    </section>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// 4. FEATURED PORTFOLIO (horizontal scroll reel)
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
function FeaturedPortfolio({ portfolio }: { portfolio: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const { ref, inView } = useReveal();

  if (!portfolio?.length) return null;

  const items = portfolio.slice(0, 8);
  const SIZES = [
    { w: '320px', h: '420px' },
    { w: '480px', h: '320px' },
    { w: '340px', h: '340px' },
    { w: '280px', h: '420px' },
    { w: '460px', h: '300px' },
    { w: '320px', h: '380px' },
    { w: '400px', h: '340px' },
    { w: '300px', h: '420px' },
  ];

  return (
    <section className="py-14 md:py-20" style={{ background: '#ffffff' }}>
      {/* Header */}
      <div ref={ref} className={`px-6 md:px-12 mb-8 flex items-end justify-between reveal ${inView ? 'visible' : ''}`}>
        <div>
          <p className="font-mono text-[0.58rem] tracking-[0.28em] uppercase mb-2" style={{ color: 'rgba(0,0,0,0.35)' }}>Portfolio</p>
          <h2 className="text-[1.6rem] md:text-[2.2rem] font-bold text-[#1a1a2e]" style={{ fontFamily: "'Syne', sans-serif" }}>
            Featured Work
          </h2>
          <p className="text-[0.82rem] mt-1" style={{ color: 'rgba(0,0,0,0.4)' }}>
            A glimpse of our recent assignments across industries.
          </p>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto px-6 md:px-12 pb-6 select-none"
        style={{ cursor: isDown ? 'grabbing' : 'grab', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={e => {
          setIsDown(true);
          setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
          setScrollLeft(scrollRef.current?.scrollLeft || 0);
        }}
        onMouseLeave={() => setIsDown(false)}
        onMouseUp={() => setIsDown(false)}
        onMouseMove={e => {
          if (!isDown || !scrollRef.current) return;
          e.preventDefault();
          const x = e.pageX - scrollRef.current.offsetLeft;
          scrollRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5;
        }}
      >
        <div className="flex gap-4 w-max">
          {items.map((item: any, i: number) => {
            const sz = SIZES[i % SIZES.length];
            return (
              <div
                key={item._id}
                className="relative overflow-hidden flex-shrink-0 group"
                style={{ width: sz.w, height: sz.h, borderRadius: '3px' }}
              >
                {/* Category badge */}
                <span className="absolute top-3 left-3 z-10 font-mono text-[0.5rem] tracking-[0.15em] uppercase px-2.5 py-1 rounded" style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)' }}>
                  {item.category}
                </span>
                <img
                  src={imgUrl(item.imageUrl)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-all duration-700"
                  style={{ filter: 'grayscale(15%)' }}
                  onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.05)'; (e.target as HTMLImageElement).style.filter = 'grayscale(0%)'; }}
                  onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; (e.target as HTMLImageElement).style.filter = 'grayscale(15%)'; }}
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.05) 55%)' }} />
                <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="font-semibold text-[0.9rem] text-white leading-tight mb-1">{item.title}</p>
                  <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase" style={{ color: 'var(--c-gold)' }}>{item.client || item.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>


    </section>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// 5. WHY BUSINESSES CHOOSE US (dark section with counters)
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
function WhyChooseUs({ settings }: { settings: any }) {
  const { ref, inView } = useReveal();

  const stats = [
    settings?.years_experience
      ? { num: parseInt(settings.years_experience), suffix: '+', label: 'Years of Experience', sub: 'Delivering excellence since 2010' }
      : { num: 14, suffix: '+', label: 'Years of Experience', sub: 'Delivering excellence since 2010' },
    settings?.projects_count
      ? { num: parseInt(settings.projects_count), suffix: '+', label: 'Projects Completed', sub: 'Across India in diverse industries' }
      : { num: 2000, suffix: '+', label: 'Projects Completed', sub: 'Across India in diverse industries' },
    settings?.schools_count
      ? { num: parseInt(settings.schools_count), suffix: '+', label: 'Happy Clients', sub: 'Long-term relationships built on trust' }
      : { num: 500, suffix: '+', label: 'Happy Clients', sub: 'Long-term relationships built on trust' },
    { num: 100, suffix: '%', label: 'Commitment', sub: 'To quality, safety and deadlines' },
  ];

  return (
    <section className="py-14 md:py-20 px-6 md:px-12" style={{ background: 'rgba(34, 16, 39, 1)'}}>
      <div className="max-w-[1400px] mx-auto">
        <div ref={ref} className={`grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 md:gap-16 items-center reveal ${inView ? 'visible' : ''}`}>
          {/* Left Ã¢â‚¬â€ heading + description */}
          <div>
            <p className="font-mono text-[0.58rem] tracking-[0.28em] uppercase mb-4 flex items-center gap-2" style={{ color: 'var(--c-gold)' }}>
              <span className="w-6 h-px inline-block" style={{ background: 'var(--c-gold)' }} />
              Why Choose Us
            </p>
            <h2 className="font-bold text-white leading-[1.1] mb-6" style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
              Why Businesses<br />Choose Us
            </h2>
            <p className="text-[0.85rem] leading-[1.8] mb-8 max-w-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {settings?.about_text
                ? settings.about_text.length > 200
                  ? settings.about_text.slice(0, 200) + 'Ã¢â‚¬Â¦'
                  : settings.about_text
                : '14+ years of experience. Thousands of successful projects. One promise Ã¢â‚¬â€ images that add value.'
              }
            </p>
            <Link href="/about" className="btn-gold-sm" data-hover>
              About Us Ã¢â€ â€™
            </Link>
          </div>

          {/* Right Ã¢â‚¬â€ stat counters grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px', overflow: 'hidden' }}>
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center px-4 py-8" style={{ background: '#1a1a2e' }}>
                <span className="font-bold leading-none mb-2" style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#ffffff' }}>
                  <Counter target={s.num} suffix={s.suffix} />
                </span>
                <span className="font-semibold text-[0.75rem] mb-1.5" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'Syne', sans-serif" }}>
                  {s.label}
                </span>
                <span className="text-[0.68rem] leading-[1.5]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {s.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// 6. OUR PROCESS
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
function OurProcess() {
  const { ref, inView } = useReveal();
  const steps = [
    { num: '01', title: 'Consultation', desc: 'We understand your brand, goals, and vision through an in-depth briefing session.' },
    { num: '02', title: 'Planning & Scouting', desc: 'Location scouting, shot list creation, and pre-production planning for perfection.' },
    { num: '03', title: 'Production Day', desc: 'Professional shoot with expert lighting, direction, and attention to every detail.' },
    { num: '04', title: 'Post Processing', desc: 'Color grading, retouching, and careful editing to deliver pixel-perfect imagery.' },
    { num: '05', title: 'Final Delivery', desc: 'High-resolution images delivered on time via secure cloud link, ready to use.' },
  ];

  return (
    <section className="py-14 md:py-20 px-6 md:px-12" style={{ background: '#ffffff' }}>
      <div className="max-w-[1400px] mx-auto">
        <div ref={ref} className={`mb-12 reveal ${inView ? 'visible' : ''}`}>
          <p className="font-mono text-[0.58rem] tracking-[0.28em] uppercase mb-3 flex items-center gap-2" style={{ color: 'var(--c-gold)' }}>
            <span className="w-6 h-px inline-block" style={{ background: 'var(--c-gold)' }} />
            How We Work
          </p>
          <h2 className="font-bold text-[#1a1a2e] leading-[1.05]" style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
            Our Process
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-[calc(100%+0px)] w-full h-px" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.12), transparent)', width: '100%', zIndex: 0 }} />
              )}
              <div className="p-5 bg-white rounded-sm border relative z-10" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                <span className="font-mono text-[0.6rem] tracking-[0.2em]" style={{ color: 'var(--c-gold)' }}>{step.num}</span>
                <h3 className="font-bold text-[0.88rem] mt-3 mb-2 text-[#1a1a2e]" style={{ fontFamily: "'Syne', sans-serif" }}>{step.title}</h3>
                <p className="text-[0.75rem] leading-[1.65]" style={{ color: 'rgba(0,0,0,0.45)' }}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// 7. CASE STUDIES (portfolio highlights with details)
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
function CaseStudies({ portfolio }: { portfolio: any[] }) {
  const { ref, inView } = useReveal();
  if (!portfolio?.length) return null;
  const items = portfolio.slice(0, 4);

  return (
    <section className="py-14 md:py-20 px-6 md:px-12" style={{ background: '#ffffff' }}>
      <div className="max-w-[1400px] mx-auto">
        <div ref={ref} className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 reveal ${inView ? 'visible' : ''}`}>
          <div>
            <p className="font-mono text-[0.58rem] tracking-[0.28em] uppercase mb-3 flex items-center gap-2" style={{ color: 'var(--c-gold)' }}>
              <span className="w-6 h-px inline-block" style={{ background: 'var(--c-gold)' }} />
              Our Work
            </p>
            <h2 className="font-bold text-[#1a1a2e]" style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
              Case Studies
            </h2>
          </div>
          <Link href="/portfolio" className="btn-outline-sm hidden md:flex" data-hover>View All Ã¢â€ â€™</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item: any, i: number) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className="group relative overflow-hidden rounded-sm cursor-pointer"
              style={{ aspectRatio: i === 0 ? '16/9' : '4/3' }}
              onClick={() => window.location.href = '/portfolio'}
            >
              <img
                src={imgUrl(item.imageUrl)}
                alt={item.title}
                className="w-full h-full object-cover transition-all duration-700"
                style={{ filter: 'grayscale(10%)' }}
              />
              <div className="absolute inset-0 transition-opacity duration-300" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase px-2.5 py-1 rounded mb-3 inline-block" style={{ background: 'var(--c-gold)', color: '#fff' }}>
                  {item.category}
                </span>
                <h3 className="font-bold text-white text-[1rem] md:text-[1.2rem] mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {item.title}
                </h3>
                {item.client && (
                  <p className="text-[0.72rem]" style={{ color: 'rgba(255,255,255,0.55)' }}>{item.client}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link href="/portfolio" className="btn-primary" data-hover>
            <span>View All Work</span><span>Ã¢â€ â€™</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// 8. CLIENT TESTIMONIALS
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
function Testimonials({ testimonials }: { testimonials: any[] }) {
  const { ref, inView } = useReveal();

  if (!testimonials?.length) return null;

  return (
    <section className="py-14 md:py-20 px-6 md:px-12" style={{ background: '#ffffff' }}>
      <div className="max-w-[1400px] mx-auto">
        <div ref={ref} className={`mb-12 reveal ${inView ? 'visible' : ''}`}>
          <p className="font-mono text-[0.58rem] tracking-[0.28em] uppercase mb-3 flex items-center gap-2" style={{ color: 'var(--c-gold)' }}>
            <span className="w-6 h-px inline-block" style={{ background: 'var(--c-gold)' }} />
            What Clients Say
          </p>
          <h2 className="font-bold text-[#1a1a2e]" style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
            Client Testimonials
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.slice(0, 6).map((t: any, i: number) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="bg-white p-6 rounded-sm border flex flex-col"
              style={{ borderColor: 'rgba(0,0,0,0.07)' }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating || 5 }).map((_, j) => (
                  <span key={j} style={{ color: 'var(--c-gold)', fontSize: '0.75rem' }}>Ã¢Ëœâ€¦</span>
                ))}
              </div>
              <p className="text-[0.85rem] leading-[1.8] mb-5 flex-1 italic" style={{ color: 'rgba(0,0,0,0.6)' }}>
                "{t.content}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[0.75rem] text-white shrink-0" style={{ background: 'var(--c-gold)' }}>
                  {t.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-[0.82rem] text-[#1a1a2e]" style={{ fontFamily: "'Syne', sans-serif" }}>{t.name}</p>
                  <p className="font-mono text-[0.55rem] tracking-[0.1em] uppercase" style={{ color: 'rgba(0,0,0,0.35)' }}>
                    {t.role}{t.company ? `, ${t.company}` : ''}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// 9. PHOTOGRAPHY ACADEMY
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
function PhotographyAcademy({ workshops }: { workshops: any[] }) {
  const { ref: leftRef, inView: leftIn } = useReveal();
  const { ref: rightRef, inView: rightIn } = useReveal();

  return (
    <section className="py-14 md:py-20 px-6 md:px-12" style={{ background: '#ffffff' }}>
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left: Images collage */}
          <div ref={leftRef} className={`reveal-left ${leftIn ? 'visible' : ''}`}>
            {workshops?.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {workshops.slice(0, 4).map((w: any, i: number) => (
                  <div
                    key={w._id}
                    className={`overflow-hidden rounded-sm ${i === 0 ? 'col-span-2' : ''}`}
                    style={{ aspectRatio: i === 0 ? '16/7' : '4/3' }}
                  >
                    {w.coverImage?.url
                      ? <img src={imgUrl(w.coverImage.url)} alt={w.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" style={{ filter: 'grayscale(10%)' }} />
                      : <div className="w-full h-full" style={{ background: '#ffffff' }} />
                    }
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-sm overflow-hidden" style={{ aspectRatio: '4/3', background: '#ffffff' }}>
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-[4rem]" style={{ color: 'rgba(0,0,0,0.08)' }}>Ã°Å¸â€œÂ·</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Content */}
          <div ref={rightRef} className={`reveal-right ${rightIn ? 'visible' : ''}`}>
            <p className="font-mono text-[0.58rem] tracking-[0.28em] uppercase mb-4 flex items-center gap-2" style={{ color: 'var(--c-gold)' }}>
              <span className="w-6 h-px inline-block" style={{ background: 'var(--c-gold)' }} />
              Learn, Create, Grow
            </p>
            <h2 className="font-bold text-[#1a1a2e] leading-[1.1] mb-4" style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              Photography Academy
            </h2>
            <p className="text-[0.88rem] leading-[1.8] mb-8" style={{ color: 'rgba(0,0,0,0.5)' }}>
              Practical training, real-world projects and personal mentoring to help you master photography.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {['Workshops', 'One-to-One Mentoring', 'Corporate Training', 'Online Courses', 'Student Portfolio', 'FAQs'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span style={{ color: 'var(--c-gold)', fontSize: '0.6rem' }}>Ã¢Å“Â¦</span>
                  <span className="text-[0.8rem]" style={{ color: 'rgba(0,0,0,0.6)' }}>{item}</span>
                </div>
              ))}
            </div>

            <Link href="/workshops" className="btn-primary" data-hover>
              <span>Explore Academy</span><span>Ã¢â€ â€™</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// 10. CALL TO ACTION
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
function CallToAction({ settings }: { settings: any }) {
  const { ref, inView } = useReveal();

  return (
    <section className="py-14 md:py-20 px-6 md:px-12" style={{ background: 'rgba(34, 16, 39, 1)' }}>
      <div className="max-w-[900px] mx-auto text-center">
        <div ref={ref} className={`reveal ${inView ? 'visible' : ''}`}>
          <p className="font-mono text-[0.58rem] tracking-[0.28em] uppercase mb-4 flex items-center justify-center gap-2" style={{ color: 'var(--c-gold)' }}>
            <span className="w-6 h-px inline-block" style={{ background: 'var(--c-gold)' }} />
            Ready to Start?
            <span className="w-6 h-px inline-block" style={{ background: 'var(--c-gold)' }} />
          </p>
          <h2 className="font-bold text-white leading-[1.05] mb-5" style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Let's Create Visuals<br />That Drive Business
          </h2>
          <p className="text-[0.88rem] leading-[1.8] mb-8 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {settings?.site_tagline || 'High-impact photography for architecture, hospitality, industries, products, people and more.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact" className="btn-primary" data-hover>
              <span>Get a Quote</span><span>Ã¢â€ â€™</span>
            </Link>
            <Link href="/portfolio" className="btn-primary" data-hover>
              <span>View Portfolio</span><span>Ã¢â€ â€™</span>
            </Link>
          </div>
          {/* Contact quick info */}
          {(settings?.contact_phone || settings?.contact_email) && (
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {settings.contact_phone && (
                <a href={`tel:${settings.contact_phone}`}
                  className="flex items-center gap-2 text-[0.8rem] transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <LuPhoneCall size={14} color="#e91e8c" />
                  {settings.contact_phone}
                </a>
              )}
              {settings.contact_email && (
                <a href={`mailto:${settings.contact_email}`}
                  className="flex items-center gap-2 text-[0.8rem] transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <MdEmail size={15} color="#e91e8c" />
                  {settings.contact_email}
                </a>
              )}
              {settings.contact_address && (
                <span className="flex items-center gap-2 text-[0.8rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <IoLocation size={15} color="#e91e8c" />
                  {settings.contact_address}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// MAIN HOME PAGE Ã¢â‚¬â€ Section order matches reference exactly
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
export default function HomePage() {
  const { data: slides = [] }       = useQuery({ queryKey: ['slides', 'home'],   queryFn: () => slidesApi.get('home') });
  const { data: settings = {} }     = useQuery({ queryKey: ['settings'],          queryFn: settingsApi.get, staleTime: 300_000 });
  const { data: services = [] }     = useQuery({ queryKey: ['services'],          queryFn: servicesApi.get });
  const { data: portfolio = [] }    = useQuery({ queryKey: ['portfolio', 'home'], queryFn: () => portfolioApi.get({ featured: 'true' }) });
  const { data: workshops = [] }    = useQuery({ queryKey: ['workshops'],         queryFn: () => workshopsApi.get() });
  const { data: testimonials = [] } = useQuery({ queryKey: ['testimonials'],      queryFn: testimonialsApi.get });
  const { data: brands = [] }       = useQuery({ queryKey: ['brands'],            queryFn: brandsApi.get });

  return (
    <>
      <Navbar />
      <VideoShowcase />
      {/* 1 */} <Hero slides={slides} settings={settings} services={services} />
        {/* 2 */} <TrustedBrands brands={brands} />
        {/* 3 */} <Services services={services} />
        {/* 4 */} <FeaturedPortfolio portfolio={portfolio} />
        {/* 5 */} <WhyChooseUs settings={settings} />
        {/* 6 */} <OurProcess />
        {/* 7 */} <CaseStudies portfolio={portfolio} />
        {/* 8 */} <Testimonials testimonials={testimonials} />
        {/* 9 */} <PhotographyAcademy workshops={workshops} />
        {/* 10 */} <CallToAction settings={settings} />
        <Footer />
    </>
  );
}
