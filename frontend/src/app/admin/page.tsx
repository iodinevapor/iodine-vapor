'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const STAT_CARDS = [
  { key: 'products',    label: 'Products',      icon: '◫', color: '#c9a96e', href: '/admin/products'  },
  { key: 'services',    label: 'Services',       icon: '◈', color: '#8b5cf6', href: '/admin/services'  },
  { key: 'blogs',       label: 'Blog Posts',     icon: '◎', color: '#4ade80', href: '/admin/blogs'     },
  { key: 'enquiries',   label: 'Enquiries',      icon: '◻', color: '#f472b6', href: '/admin/enquiries' },
  { key: 'workshops',   label: 'Workshops',      icon: '◷', color: '#60a5fa', href: '/admin/workshops' },
  { key: 'portfolio',   label: 'Portfolio',      icon: '◉', color: '#fb923c', href: '/admin/portfolio' },
  { key: 'media',       label: 'Media Files',    icon: '◱', color: '#fbbf24', href: '/admin/media'     },
  { key: 'newEnq',      label: 'New Enquiries',  icon: '◌', color: '#d63a2f', href: '/admin/enquiries' },
];

const QUICK = [
  { label: 'Add Slide',     href: '/admin/slides',    color: '#c9a96e', icon: '◧' },
  { label: 'New Blog',      href: '/admin/blogs',     color: '#4ade80', icon: '◎' },
  { label: 'Add Workshop',  href: '/admin/workshops', color: '#60a5fa', icon: '◷' },
  { label: 'Add Portfolio', href: '/admin/portfolio', color: '#fb923c', icon: '◉' },
  { label: 'New Product',   href: '/admin/products',  color: '#fbbf24', icon: '◫' },
  { label: 'Site Settings', href: '/admin/settings',  color: '#8b5cf6', icon: '◐' },
];

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  new:     { color: '#4ade80', background: 'rgba(74,222,128,0.1)',   border: '1px solid rgba(74,222,128,0.25)'  },
  read:    { color: '#60a5fa', background: 'rgba(96,165,250,0.1)',   border: '1px solid rgba(96,165,250,0.25)'  },
  replied: { color: '#c9a96e', background: 'rgba(201,169,110,0.1)',  border: '1px solid rgba(201,169,110,0.25)' },
  closed:  { color: '#6b7280', background: 'rgba(107,114,128,0.08)', border: '1px solid rgba(107,114,128,0.2)'  },
};

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const day   = days[now.getDay()];
  const date  = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  const hh    = String(now.getHours()).padStart(2, '0');
  const mm    = String(now.getMinutes()).padStart(2, '0');
  const ss    = String(now.getSeconds()).padStart(2, '0');
  const ampm  = now.getHours() >= 12 ? 'PM' : 'AM';
  const h12   = now.getHours() % 12 || 12;

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[2rem] leading-none tracking-[0.04em]" style={{ color: '#f5f0ea' }}>
          {String(h12).padStart(2,'0')}:{mm}:{ss}
        </span>
        <span className="font-mono text-[0.6rem] tracking-[0.12em]" style={{ color: '#e91e8c' }}>{ampm}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[0.52rem] tracking-[0.18em] uppercase" style={{ color: '#e91e8c' }}>{day}</span>
        <span className="font-mono text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
        <span className="font-mono text-[0.52rem] tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.5)' }}>{date}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: authApi.dashboard });

  const stats  = data?.stats  || {};
  const recent = data?.recent || [];

  return (
    <div>
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between mb-8 pb-6 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-[0.5rem] tracking-[0.25em] uppercase px-2 py-1"
              style={{ background: 'rgba(233,30,140,0.1)', color: '#e91e8c', borderRadius: '2px', border: '1px solid rgba(233,30,140,0.2)' }}>
              ● Live
            </span>
          </div>
          <h1 className="font-display text-[2.6rem] tracking-[0.06em] leading-none" style={{ color: '#f5f0ea' }}>
            Welcome, <span style={{ color: '#e91e8c' }}>{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="font-mono text-[0.55rem] tracking-[0.22em] uppercase mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Iodine Vapor — CMS Dashboard
          </p>
        </div>

        <div className="flex items-start gap-4">
          <LiveClock />
          {stats.newEnq > 0 && (
            <Link href="/admin/enquiries"
              className="flex items-center gap-2 px-4 py-2.5 font-mono text-[0.56rem] tracking-[0.15em] uppercase transition-all duration-200 mt-1"
              style={{ borderColor: 'rgba(214,58,47,0.35)', color: '#ff6b6b', background: 'rgba(214,58,47,0.08)', borderRadius: '4px', border: '1px solid rgba(214,58,47,0.35)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(214,58,47,0.15)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(214,58,47,0.08)'}>
              ◌ {stats.newEnq} New {stats.newEnq === 1 ? 'Enquiry' : 'Enquiries'}
            </Link>
          )}
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
        {STAT_CARDS.map((card, i) => (
          <motion.div key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
          >
            <Link href={card.href}
              className="block p-4 border transition-all duration-300 group relative overflow-hidden"
              style={{ background: card.color + '0a', borderColor: card.color + '25', borderRadius: '6px' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = card.color + '60';
                (e.currentTarget as HTMLElement).style.background  = card.color + '18';
                (e.currentTarget as HTMLElement).style.transform   = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = card.color + '25';
                (e.currentTarget as HTMLElement).style.background  = card.color + '0a';
                (e.currentTarget as HTMLElement).style.transform   = 'translateY(0)';
              }}>
              {/* glow dot */}
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10 blur-2xl"
                style={{ background: card.color, transform: 'translate(30%, -30%)' }} />
              <div className="text-[1.3rem] mb-3" style={{ color: card.color }}>{card.icon}</div>
              <div className="font-display text-[2.2rem] leading-none mb-1" style={{ color: '#f5f0ea' }}>
                {isLoading ? <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span> : stats[card.key] ?? 0}
              </div>
              <div className="font-mono text-[0.48rem] tracking-[0.18em] uppercase" style={{ color: card.color + 'cc' }}>{card.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Enquiries */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="border rounded-md overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          {/* section header */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <h2 className="font-mono text-[0.6rem] tracking-[0.22em] uppercase flex items-center gap-2" style={{ color: '#f5f0ea' }}>
              <span style={{ color: '#f472b6' }}>◻</span> Recent Enquiries
            </h2>
            <Link href="/admin/enquiries" className="font-mono text-[0.5rem] tracking-[0.15em] uppercase transition-colors"
              style={{ color: '#e91e8c' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ff4da6'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#e91e8c'}>
              View all →
            </Link>
          </div>

          <div className="p-4 space-y-2">
            {recent.length === 0 && (
              <div className="text-center py-10">
                <p className="font-mono text-[0.58rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>No enquiries yet</p>
              </div>
            )}
            {recent.map((e: any, i: number) => (
              <motion.div key={e._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.06 }}
                className="flex items-start gap-3 p-3 rounded transition-colors cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.02)' }}
                onMouseEnter={e2 => (e2.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e2 => (e2.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}>
                {/* avatar */}
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center font-display text-[1rem] rounded"
                  style={{ background: 'rgba(233,30,140,0.12)', color: '#e91e8c' }}>
                  {e.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[0.82rem] font-semibold" style={{ color: '#f5f0ea' }}>{e.name}</span>
                    <span className="font-mono text-[0.46rem] tracking-[0.12em] uppercase px-1.5 py-0.5 rounded"
                      style={{ ...STATUS_STYLE[e.status] || STATUS_STYLE.new }}>
                      {e.status}
                    </span>
                  </div>
                  <p className="text-[0.72rem] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {e.subject || e.message?.slice(0, 60)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62 }}
          className="border rounded-md overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <h2 className="font-mono text-[0.6rem] tracking-[0.22em] uppercase flex items-center gap-2" style={{ color: '#f5f0ea' }}>
              <span style={{ color: '#c9a96e' }}>◈</span> Quick Actions
            </h2>
          </div>

          <div className="p-4 grid grid-cols-2 gap-3">
            {QUICK.map((q, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.65 + i * 0.06 }}>
                <Link href={q.href}
                  className="flex items-center gap-3 p-4 rounded transition-all duration-200"
                  style={{ background: q.color + '0d', border: `1px solid ${q.color}28`, borderRadius: '6px' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background  = q.color + '1a';
                    (e.currentTarget as HTMLElement).style.borderColor = q.color + '50';
                    (e.currentTarget as HTMLElement).style.transform   = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background  = q.color + '0d';
                    (e.currentTarget as HTMLElement).style.borderColor = q.color + '28';
                    (e.currentTarget as HTMLElement).style.transform   = 'translateY(0)';
                  }}>
                  <span className="text-[1.1rem]" style={{ color: q.color }}>{q.icon}</span>
                  <span className="font-mono text-[0.56rem] tracking-[0.12em] uppercase" style={{ color: '#f5f0ea' }}>{q.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* View Live Website */}
          <div className="px-4 pb-4">
            <a href="/" target="_blank" rel="noreferrer"
              className="flex items-center justify-between p-3 rounded transition-all duration-200"
              style={{ border: '1px solid rgba(233,30,140,0.2)', background: 'rgba(233,30,140,0.04)', borderRadius: '6px' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(233,30,140,0.45)';
                (e.currentTarget as HTMLElement).style.background  = 'rgba(233,30,140,0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(233,30,140,0.2)';
                (e.currentTarget as HTMLElement).style.background  = 'rgba(233,30,140,0.04)';
              }}>
              <span className="font-mono text-[0.56rem] tracking-[0.2em] uppercase" style={{ color: '#e91e8c' }}>
                ◉ View Live Website
              </span>
              <span style={{ color: '#e91e8c' }}>↗</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
