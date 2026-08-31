'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const STAT_CARDS = [
  { key: 'products',   label: 'Products',    icon: '◫', color: '#c9a96e', href: '/admin/products' },
  { key: 'services',   label: 'Services',    icon: '◈', color: '#8b5cf6', href: '/admin/services' },
  { key: 'blogs',      label: 'Blog Posts',  icon: '◎', color: '#4ade80', href: '/admin/blogs' },
  { key: 'enquiries',  label: 'Enquiries',   icon: '◻', color: '#d63a2f', href: '/admin/enquiries' },
  { key: 'workshops',  label: 'Workshops',   icon: '◷', color: '#60a5fa', href: '/admin/workshops' },
  { key: 'portfolio',  label: 'Portfolio',   icon: '◉', color: '#f472b6', href: '/admin/portfolio' },
  { key: 'media',      label: 'Media Files', icon: '◱', color: '#fbbf24', href: '/admin/media' },
  { key: 'newEnq',     label: 'New Enquiries',icon: '◌', color: '#d63a2f', href: '/admin/enquiries' },
];

const STATUS_STYLE: Record<string, string> = {
  new:     'color:#4ade80;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2)',
  read:    'color:#60a5fa;background:rgba(96,165,250,0.08);border:1px solid rgba(96,165,250,0.2)',
  replied: 'color:#c9a96e;background:rgba(201,169,110,0.08);border:1px solid rgba(201,169,110,0.2)',
  closed:  'color:#6b7280;background:rgba(107,114,128,0.08);border:1px solid rgba(107,114,128,0.2)',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: authApi.dashboard });

  const stats  = data?.stats || {};
  const recent = data?.recent || [];

  const QUICK = [
    { label: 'Add Slide',     href: '/admin/slides',    color: '#c9a96e', icon: '◧' },
    { label: 'New Blog',      href: '/admin/blogs',     color: '#4ade80', icon: '◎' },
    { label: 'Add Workshop',  href: '/admin/workshops', color: '#60a5fa', icon: '◷' },
    { label: 'Add Portfolio', href: '/admin/portfolio', color: '#f472b6', icon: '◉' },
    { label: 'New Product',   href: '/admin/products',  color: '#fbbf24', icon: '◫' },
    { label: 'Site Settings', href: '/admin/settings',  color: '#8b5cf6', icon: '◐' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-[2.2rem] tracking-[0.06em]" style={{ color: '#f5f0ea' }}>
            Welcome, {user?.name?.split(' ')[0]}
          </h1>
          <p className="font-mono text-[0.58rem] tracking-[0.2em] uppercase mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Iodine Vapor CMS Dashboard
          </p>
        </div>
        {stats.newEnq > 0 && (
          <Link href="/admin/enquiries" className="flex items-center gap-2 px-4 py-2.5 border font-mono text-[0.58rem] tracking-[0.15em] uppercase transition-all duration-200"
            style={{ borderColor: 'rgba(214,58,47,0.3)', color: '#d63a2f', background: 'rgba(214,58,47,0.06)', borderRadius: '2px' }}>
            ◌ {stats.newEnq} new {stats.newEnq === 1 ? 'enquiry' : 'enquiries'}
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
        {STAT_CARDS.map((card, i) => (
          <motion.div key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link href={card.href} className="block p-4 border transition-all duration-300 group"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = card.color + '35'; (e.currentTarget as HTMLElement).style.background = card.color + '08'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.07)'; (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.02)'; }}>
              <div className="text-xl mb-2" style={{ color: card.color }}>{card.icon}</div>
              <div className="font-display text-[2rem] leading-none mb-1" style={{ color: '#f5f0ea' }}>
                {isLoading ? '—' : stats[card.key] ?? 0}
              </div>
              <div className="font-mono text-[0.5rem] tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>{card.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enquiries */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="border p-6"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-mono text-[0.62rem] tracking-[0.22em] uppercase flex items-center gap-2" style={{ color: '#f5f0ea' }}>
              <span style={{ color: 'var(--c-gold)' }}>◻</span> Recent Enquiries
            </h2>
            <Link href="/admin/enquiries" className="font-mono text-[0.52rem] tracking-[0.15em] uppercase" style={{ color: 'var(--c-gold)' }}>View all →</Link>
          </div>
          <div className="space-y-2">
            {recent.length === 0 && <p className="text-center py-8 font-mono text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.25)' }}>No enquiries yet</p>}
            {recent.map((e: any) => (
              <div key={e._id} className="flex items-start gap-3 p-3 transition-colors"
                style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '2px' }}>
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center font-display text-[0.9rem]"
                  style={{ background: 'rgba(201,169,110,0.12)', color: 'var(--c-gold)', borderRadius: '2px' }}>
                  {e.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[0.8rem] font-medium truncate" style={{ color: '#f5f0ea' }}>{e.name}</span>
                    <span className="font-mono text-[0.48rem] tracking-[0.12em] uppercase px-1.5 py-0.5"
                      style={{ borderRadius: '2px', ...(Object.fromEntries((STATUS_STYLE[e.status] || STATUS_STYLE.new).split(';').filter(Boolean).map(s => { const [k, v] = s.split(':'); return [k.trim().replace(/-([a-z])/g, (_: any, l: string) => l.toUpperCase()), v?.trim()]; }))) }}>
                      {e.status}
                    </span>
                  </div>
                  <p className="text-[0.72rem] truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{e.subject || e.message?.slice(0, 60)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
          className="border p-6"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}
        >
          <h2 className="font-mono text-[0.62rem] tracking-[0.22em] uppercase mb-5 flex items-center gap-2" style={{ color: '#f5f0ea' }}>
            <span style={{ color: 'var(--c-gold)' }}>◈</span> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK.map((q, i) => (
              <Link key={i} href={q.href}
                className="p-4 flex items-center gap-3 transition-all duration-200"
                style={{ background: q.color + '0a', border: `1px solid ${q.color}20`, borderRadius: '2px' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = q.color + '16'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = q.color + '0a'}>
                <span className="text-base" style={{ color: q.color }}>{q.icon}</span>
                <span className="font-mono text-[0.58rem] tracking-[0.12em] uppercase" style={{ color: '#f5f0ea' }}>{q.label}</span>
              </Link>
            ))}
          </div>

          {/* Website link */}
          <div className="mt-5 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <a href="/" target="_blank" rel="noreferrer"
              className="flex items-center justify-between p-3 border transition-all duration-200"
              style={{ borderColor: 'rgba(201,169,110,0.15)', borderRadius: '2px' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.35)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.15)'}>
              <span className="font-mono text-[0.56rem] tracking-[0.2em] uppercase" style={{ color: 'var(--c-gold)' }}>
                ◉ View Live Website
              </span>
              <span style={{ color: 'var(--c-gold)' }}>↗</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

