'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { portfolioApi, imgUrl } from '@/lib/api';

const HF = 'Helvetica Neue, Helvetica, Arial, sans-serif';

const CATS = [
  { key: 'all',          label: 'All' },
  { key: 'industrial',   label: 'Industrial' },
  { key: 'product',      label: 'Product' },
  { key: 'food',         label: 'Food' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'corporate',    label: 'Corporate' },
  { key: 'editorial',    label: 'Editorial' },
];

export default function PortfolioPage() {
  const [filter, setFilter] = useState('all');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['portfolio', filter],
    queryFn: () => portfolioApi.get(filter !== 'all' ? { category: filter } : {}),
  });

  const list = items as any[];

  return (
    <>
      <Navbar />

      {/* ── Hero header ─────────────────────────────────────────────── */}
      <section style={{ background: '#fff', paddingTop: '64px' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-8">
          <p style={{ fontFamily: HF, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#111', marginBottom: '0.6rem' }}>
            Work
          </p>
          <h1 style={{ fontFamily: HF, fontWeight: 800, fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', lineHeight: 1.0, color: '#111', marginBottom: '1rem', textTransform: 'uppercase' }}>
            THE WORK
          </h1>
          <p style={{ fontFamily: HF, fontSize: '0.88rem', lineHeight: 1.7, color: 'rgba(0,0,0,0.45)', maxWidth: '480px' }}>
            A selection of commercial photography across people, products, spaces, food and industry.
          </p>
        </div>
      </section>

      {/* ── Filter tabs ─────────────────────────────────────────────── */}
      <section style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="flex flex-wrap gap-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {CATS.map(cat => (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                style={{
                  fontFamily: HF,
                  fontSize: '0.8rem',
                  fontWeight: filter === cat.key ? 600 : 400,
                  color: filter === cat.key ? '#e91e8c' : 'rgba(0,0,0,0.5)',
                  padding: '14px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: filter === cat.key ? '2px solid #e91e8c' : '2px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { if (filter !== cat.key) (e.currentTarget as HTMLElement).style.color = '#111'; }}
                onMouseLeave={e => { if (filter !== cat.key) (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.5)'; }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grid ────────────────────────────────────────────────────── */}
      <main style={{ background: '#fff', padding: '0 0 80px' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-8">

          {isLoading ? (
            /* Skeleton */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: i % 3 === 0 ? '3/2' : '1/1', background: '#f0f0f0', borderRadius: '3px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: HF, fontSize: '0.85rem', color: 'rgba(0,0,0,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                No items in this category
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={filter}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-3"
                style={{ gridAutoRows: 'auto' }}
              >
                {list.map((item: any, i: number) => {
                  // Asymmetric: every 5th item spans 2 cols
                  const wide = i % 5 === 0;
                  return (
                    <Link
                      key={item._id}
                      href={`/portfolio/${item.slug || item._id}`}
                      className="group relative overflow-hidden block"
                      style={{
                        gridColumn: wide ? 'span 2' : 'span 1',
                        aspectRatio: wide ? '16/9' : '1/1',
                        borderRadius: '3px',
                        background: '#f0f0f0',
                        textDecoration: 'none',
                      }}
                    >
                      {item.imageUrl && (
                        <img
                          src={imgUrl(item.imageUrl)}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          style={{ filter: 'grayscale(5%)' }}
                        />
                      )}
                      {/* Hover overlay */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: 'rgba(0,0,0,0.35)' }}
                      />
                      {/* Label */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <p style={{ fontFamily: HF, fontWeight: 600, fontSize: '0.82rem', color: '#fff', marginBottom: '2px', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                          {item.title}
                        </p>
                        <p style={{ fontFamily: HF, fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>
                          {item.category}
                          {item.client ? ` · ${item.client}` : ''}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Footer tagline */}
      <section style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)', padding: '20px 0' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 flex items-center justify-between">
          <span style={{ fontFamily: HF, fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)' }}>Studio Iodine Vapor</span>
          <span style={{ fontFamily: HF, fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)', fontStyle: 'italic' }}>See. Understand. Create.</span>
        </div>
      </section>

      <Footer />
    </>
  );
}
