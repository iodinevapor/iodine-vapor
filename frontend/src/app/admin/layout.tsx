'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/lib/auth';

const NAV_GROUPS = [
  { label: '', items: [
    { href: '/admin',                label: 'Dashboard',       icon: '⬡' },
  ]},
  { label: 'Content', items: [
    { href: '/admin/slides',         label: 'Slides / CMS',    icon: '◧' },
    { href: '/admin/services',       label: 'Services',        icon: '◈' },
    { href: '/admin/portfolio',      label: 'Portfolio',       icon: '◉' },
    { href: '/admin/products',       label: 'Products',        icon: '◫' },
    { href: '/admin/blogs',          label: 'Blog',            icon: '◎' },
    { href: '/admin/faqs',           label: 'FAQs',            icon: '◌' },
    { href: '/admin/workshops',      label: 'Workshops',       icon: '◷' },
    { href: '/admin/testimonials',   label: 'Testimonials',    icon: '◴' },
    { href: '/admin/videos',         label: 'Showcase Videos', icon: '▶' },
    { href: '/admin/brands',         label: 'Trusted Brands',  icon: '◆' },
  ]},
  { label: 'Operations', items: [
    { href: '/admin/enquiries',      label: 'Enquiries',       icon: '◻' },
    { href: '/admin/media',          label: 'Media Library',   icon: '◱' },
  ]},
  { label: 'Config', items: [
    { href: '/admin/settings',       label: 'Site Settings',   icon: '◐' },
    { href: '/admin/seo',            label: 'SEO Manager',     icon: '◑' },
    { href: '/admin/users',          label: 'Admin Users',     icon: '◒', superOnly: true },
  ]},
  { label: 'My Notes', items: [
    { href: '/admin/notes',          label: 'Notes',           icon: '✎' },
  ]},
];

function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isSuper } = useAuth();

  return (
    <aside className="admin-sidebar w-60 flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(233,30,140,0.08)' }}>
        <Link href="/admin" className="block">
          <div className="font-display text-[1.4rem] tracking-[0.12em]" style={{ color: '#f5f0ea' }}>
            Iodine<span style={{ color: '#e91e8c' }}>.</span>Admin
          </div>
          <div className="font-mono text-[0.52rem] tracking-[0.2em] uppercase mt-1" style={{ color: 'rgba(233,30,140,0.6)' }}>
            {user?.role}
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_GROUPS.map(group => (
          <div key={group.label || 'main'} className="mb-4">
            {group.label && (
              <p className="px-4 py-2 font-mono text-[0.48rem] tracking-[0.28em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>{group.label}</p>
            )}
            {group.items.filter(item => !('superOnly' in item) || !item.superOnly || isSuper).map(item => {
              const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}
                  className={`admin-nav-item ${active ? 'active' : ''}`}>
                  <span style={{ fontSize: '0.9rem', color: active ? '#e91e8c' : 'inherit' }}>{item.icon}</span>
                  <span>{item.label}</span>
                  {active && <span className="ml-auto text-[0.5rem]" style={{ color: '#e91e8c' }}>▸</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(233,30,140,0.08)' }}>
        <div className="flex items-center gap-3 mb-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="w-8 h-8 flex items-center justify-center font-display text-[1rem]" style={{ background: 'rgba(233,30,140,0.15)', color: '#e91e8c', borderRadius: '2px' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[0.78rem] font-semibold truncate" style={{ color: '#f5f0ea' }}>{user?.name}</div>
            <div className="text-[0.58rem] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} className="admin-nav-item w-full" style={{ color: '#d63a2f' }}>
          <span>↩</span><span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

function AdminContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') router.replace('/admin/login');
  }, [user, loading, pathname, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
      <div className="w-10 h-10 border border-gold-DEFAULT border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user && pathname !== '/admin/login') return null;
  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="admin-panel flex min-h-screen" style={{ background: '#0a0a0a', color: '#f5f0ea' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminContent>{children}</AdminContent>
    </AuthProvider>
  );
}
