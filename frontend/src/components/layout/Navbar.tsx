'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { settingsApi, servicesApi } from '@/lib/api';

const SERVICE_CATEGORIES = [
  {
    group: 'Spaces',
    items: [
      { label: 'Architecture Photography', slug: 'architecture-photography' },
      { label: 'Interior Design Photography', slug: 'interior-design-photography' },
      { label: 'Hotel & Hospitality Photography', slug: 'hotel-hospitality-photography' },
      { label: 'Retail & Google Business Profile', slug: 'retail-google-business-photography' },
      { label: 'Cinema, Auditorium & Venue', slug: 'cinema-auditorium-venue-photography' },
      { label: 'Structural & Infrastructure', slug: 'structural-infrastructure-photography' },
    ],
  },
  {
    group: 'Industries',
    items: [
      { label: 'Industrial & Manufacturing', slug: 'industrial-manufacturing-photography' },
      { label: 'School & Educational Institution', slug: 'school-educational-photography' },
    ],
  },
  {
    group: 'Products',
    items: [
      { label: 'Commercial Product Photography', slug: 'commercial-product-photography' },
      { label: 'E-commerce Product Photography', slug: 'ecommerce-product-photography' },
      { label: 'Food & Beverage Photography', slug: 'food-beverage-photography' },
    ],
  },
  {
    group: 'People',
    items: [
      { label: 'Corporate & Executive Portrait', slug: 'corporate-executive-portrait-photography' },
    ],
  },
  {
    group: 'Special Projects',
    items: [
      { label: 'Tourism & Destination Photography', slug: 'tourism-destination-photography' },
      { label: 'Pet Portrait Photography', slug: 'pet-portrait-photography' },
    ],
  },
];

const MAIN_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services', hasDropdown: true },
  { href: '/workshops', label: 'Photography Academy' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobile] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: s } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get, staleTime: 300_000 });
  const { data: dbServices = [] } = useQuery({ queryKey: ['services'], queryFn: servicesApi.get, staleTime: 300_000 });

  const dynamicCategories = (() => {
    if (!(dbServices as any[]).length) return SERVICE_CATEGORIES;
    const grouped: Record<string, { label: string; slug: string }[]> = {};
    (dbServices as any[]).forEach((svc: any) => {
      const grp = svc.category || 'Other';
      if (!grouped[grp]) grouped[grp] = [];
      grouped[grp].push({ label: svc.name, slug: svc.slug || svc._id });
    });
    return Object.entries(grouped).map(([group, items]) => ({ group, items }));
  })();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    setMobile(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleServicesEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  const handleServicesLeave = () => {
    closeTimer.current = setTimeout(() => setServicesOpen(false), 150);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-[900] transition-all duration-500"
        style={{
          background: '#ffffff',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          // borderBottom: '1px solid rgba(0,0,0,0.08)',
          // boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.10)' : '0 1px 8px rgba(0,0,0,0.06)',
          height: '64px',
        }}
      >
        <nav className="relative flex items-center justify-between max-w-[1400px] mx-auto lg:px-6 h-full px-4">
          {/* Bottom accent line when scrolled — hidden */}
          {/* {scrolled && (
            <div
              className="absolute bottom-0 left-0 right-0 h-[1.5px]"
              style={{ background: 'linear-gradient(90deg, transparent, #fe3fff, transparent)' }}
            />
          )} */}

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center shrink-0 h-full py-2"
            aria-label="Studio Iodine Vapor Home"
          >
            <img
              src="/Iodine-Logo.png"
              alt="Studio Iodine Vapor"
              style={{
                height: '100%',
                maxHeight: '52px',
                width: 'auto',
                display: 'block',
                objectFit: 'contain',
              }}
              onError={e => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                const fallback = img.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <span
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                fontSize: '1.1rem',
                fontFamily: "'Syne', sans-serif",
                color: '#1a1a2e',
              }}
            >
              IODINE <span style={{ color: '#e91e8c' }}>VAPOR</span>
            </span>
          </Link>

          {/* ── Desktop Nav ──────────────────────────────────────────── */}
          <ul className="hidden lg:flex items-center gap-0.5 list-none">
            {MAIN_LINKS.map(link => {
              if (link.hasDropdown) {
                return (
                  <li
                    key={link.href}
                    ref={dropdownRef}
                    className="relative"
                    onMouseEnter={handleServicesEnter}
                    onMouseLeave={handleServicesLeave}
                  >
                    <Link
                      href={link.href}
                      className="nav-slide-link flex items-center gap-1.5 text-[0.72rem] tracking-[0.06em] uppercase font-semibold px-3 py-2 relative overflow-hidden"
                      style={{ color: '#1a1a2e', fontFamily: 'Helvetica Neue, Helvetica, sans-serif' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e91e8c'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#1a1a2e'; }}
                    >
                      {link.label}
                      <svg
                        width="9" height="5" viewBox="0 0 9 5" fill="none"
                        className="transition-transform duration-200"
                        style={{ transform: servicesOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                      >
                        <path d="M1 1L4.5 4.5L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>

                    {/* Mega Dropdown */}
                    <AnimatePresence>
                      {servicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute top-full mt-2 overflow-hidden"
                          style={{
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '540px',
                            background: '#ffffff',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                            border: '1px solid rgba(0,0,0,0.08)',
                            borderRadius: '14px',
                          }}
                          onMouseEnter={handleServicesEnter}
                          onMouseLeave={handleServicesLeave}
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between px-5 py-3 border-b"
                            style={{ borderColor: 'rgba(0,0,0,0.06)', background: 'linear-gradient(90deg, #fdf2f8, #faf4ff)' }}>
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-3.5 rounded-full" style={{ background: '#e91e8c' }} />
                              <span className="font-bold text-[0.78rem]" style={{ color: '#1a1a2e', fontFamily: "'Syne', sans-serif" }}>
                                Photography Services
                              </span>
                            </div>
                            <span className="font-mono text-[0.44rem] tracking-[0.1em] uppercase px-2 py-0.5 rounded"
                              style={{ background: 'rgba(233,30,140,0.1)', color: '#e91e8c' }}>
                              Pan-India
                            </span>
                          </div>

                          {/* Items — 3 column compact grid */}
                          <div className="p-4">
                            {dynamicCategories.map((cat) => (
                              <div key={cat.group} className="mb-3 last:mb-0">
                                {/* Category label */}
                                <p className="font-mono text-[0.44rem] tracking-[0.2em] uppercase mb-1.5 px-1"
                                  style={{ color: '#e91e8c', fontWeight: 600 }}>
                                  {cat.group}
                                </p>
                                {/* 3-col grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
                                  {cat.items.map(item => (
                                    <Link
                                      key={item.slug}
                                      href={`/services/${item.slug}`}
                                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[0.68rem] font-medium transition-all duration-150"
                                      style={{ color: 'rgba(0,0,0,0.58)', fontFamily: 'Helvetica Neue, Helvetica, sans-serif', lineHeight: 1.3 }}
                                      onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.background = 'rgba(233,30,140,0.07)';
                                        (e.currentTarget as HTMLElement).style.color = '#e91e8c';
                                      }}
                                      onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                                        (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.58)';
                                      }}
                                    >
                                      <span style={{ color: '#e91e8c', fontSize: '0.4rem', flexShrink: 0, opacity: 0.7 }}>●</span>
                                      {item.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between px-5 py-3 border-t"
                            style={{ borderColor: 'rgba(0,0,0,0.06)', background: '#fafafa' }}>
                            <span className="text-[0.65rem]" style={{ color: 'rgba(0,0,0,0.35)', fontFamily: 'Helvetica Neue' }}>
                              GST · MSME · 14+ years
                            </span>
                            <Link
                              href="/services"
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[0.62rem] font-semibold transition-all"
                              style={{ background: '#1a1a2e', color: '#fff', fontFamily: 'Helvetica Neue' }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#e91e8c'}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1a1a2e'}
                            >
                              All Services
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                              </svg>
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              }
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="nav-slide-link text-[0.72rem] tracking-[0.06em] uppercase font-semibold px-3 py-2 block relative overflow-hidden"
                    style={{ color: '#1a1a2e', fontFamily: 'Helvetica Neue, Helvetica, sans-serif' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e91e8c'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#1a1a2e'; }}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ── Desktop CTA ──────────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-4">
            {s?.contact_phone && (
              <a
                href={`tel:${s.contact_phone}`}
                className="text-sm tracking-[0.12em] font-bold transition-colors duration-200"
                style={{ color: '#1a1a2e', fontFamily: 'Helvetica Neue, Helvetica, sans-serif' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e91e8c'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#1a1a2e'; }}
              >
                {s.contact_phone}
              </a>
            )}
            <Link
              href="/contact"
              className="inline-flex items-center justify-center py-2.5 px-6 rounded text-[0.72rem] tracking-[0.08em] uppercase font-bold transition-all duration-300"
              style={{ backgroundColor: '#1a1a2e', color: '#ffffff', fontFamily: 'Helvetica Neue, Helvetica, sans-serif', minWidth: '140px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e91e8c'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1a1a2e'; }}
            >
              Get a Quote
            </Link>
          </div>

          {/* ── Mobile Hamburger ─────────────────────────────────────── */}
          <button
            className="lg:hidden flex items-center justify-center rounded-lg transition-all"
            onClick={() => setMobile(!mobileOpen)}
            aria-label="Toggle navigation menu"
            style={{
              width: '44px', height: '44px',
              background: mobileOpen ? 'rgba(233,30,140,0.08)' : 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '8px',
            }}
          >
            <div className="flex flex-col items-center justify-center gap-[5px]">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  style={{
                    display: 'block', width: '18px', height: '1.5px', borderRadius: '1px',
                    background: mobileOpen ? '#e91e8c' : '#1a1a2e',
                    transition: 'all 0.25s ease',
                    transform: mobileOpen
                      ? i === 0 ? 'rotate(45deg) translateY(6.5px)'
                        : i === 2 ? 'rotate(-45deg) translateY(-6.5px)'
                        : 'scaleX(0)'
                      : 'none',
                    opacity: mobileOpen && i === 1 ? 0 : 1,
                  }}
                />
              ))}
            </div>
          </button>
        </nav>
      </motion.header>

      {/* ── Mobile Menu ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[840]"
              style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
              onClick={() => setMobile(false)}
            />
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="fixed z-[850] overflow-y-auto"
              style={{
                top: '70px', left: '12px', right: '12px',
                maxHeight: 'calc(100vh - 86px)',
                background: '#0f0f0f',
                borderRadius: '16px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="p-4 space-y-1">
                {MAIN_LINKS.map((link, i) => {
                  if (link.hasDropdown) {
                    return (
                      <div key={link.href}>
                        <button
                          onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[0.95rem] font-semibold transition-all"
                          style={{ color: 'rgba(255,255,255,0.85)', background: 'transparent', fontFamily: 'Helvetica Neue, Helvetica, sans-serif' }}
                        >
                          {link.label}
                          <svg
                            width="12" height="7" viewBox="0 0 12 7" fill="none"
                            style={{ transition: 'transform 0.2s', transform: mobileServicesOpen ? 'rotate(180deg)' : 'none' }}
                          >
                            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <AnimatePresence>
                          {mobileServicesOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pr-2 pb-2 space-y-3">
                                {dynamicCategories.map(cat => (
                                  <div key={cat.group}>
                                    <p className="font-mono text-[0.5rem] tracking-[0.22em] uppercase px-4 py-1" style={{ color: '#e91e8c' }}>
                                      {cat.group}
                                    </p>
                                    {cat.items.map(item => (
                                      <Link
                                        key={item.slug}
                                        href={`/services/${item.slug}`}
                                        onClick={() => setMobile(false)}
                                        className="block px-4 py-2 text-[0.82rem] rounded-lg transition-all"
                                        style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Helvetica Neue, Helvetica, sans-serif' }}
                                      >
                                        {item.label}
                                      </Link>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobile(false)}
                        className="block px-4 py-3 rounded-xl text-[0.95rem] font-semibold transition-all"
                        style={{ color: 'rgba(255,255,255,0.85)', background: 'transparent', fontFamily: 'Helvetica Neue, Helvetica, sans-serif' }}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* CTA + Contact Info */}
                <div className="pt-3 mt-2 border-t space-y-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <Link
                    href="/contact"
                    onClick={() => setMobile(false)}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-md text-[0.72rem] font-semibold uppercase tracking-[0.08em] transition-all duration-300"
                    style={{ backgroundColor: '#e91e8c', color: '#ffffff', minWidth: '165px', fontFamily: 'Helvetica Neue, Helvetica, sans-serif' }}
                  >
                    GET A QUOTE
                  </Link>
                  {s?.contact_phone && (
                    <a
                      href={`tel:${s.contact_phone}`}
                      className="flex items-center justify-center gap-2 text-[0.78rem] font-medium py-2"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                    >
                      📞 {s.contact_phone}
                    </a>
                  )}
                  {s?.contact_email && (
                    <a
                      href={`mailto:${s.contact_email}`}
                      className="flex items-center justify-center gap-2 text-[0.72rem] pb-2"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                    >
                      ✉️ {s.contact_email}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
