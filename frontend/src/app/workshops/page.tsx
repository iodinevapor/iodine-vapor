'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroFromSlides from '@/components/sections/HeroFromSlides';
import EnquiryPopup from '@/components/sections/EnquiryPopup';
import { slidesApi, workshopsApi, settingsApi, imgUrl } from '@/lib/api';

const HF = 'Helvetica Neue, Helvetica, Arial, sans-serif';

const LEARNING_STEPS = [
  {
    num: '01',
    title: 'SEE',
    items: ['Observation', 'Composition', 'Perspective', 'Visual awareness'],
  },
  {
    num: '02',
    title: 'UNDERSTAND',
    items: ['Camera & technique', 'Light & exposure', 'Creative decisions'],
  },
  {
    num: '03',
    title: 'CREATE',
    items: ['Intentional photography', 'Personal style', 'Visual storytelling'],
  },
  {
    num: '04',
    title: 'PRACTICE',
    items: ['Assignments', 'Feedback', 'Real-world application'],
  },
];

export default function WorkshopsPage() {
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const { data: slides     = [] } = useQuery({ queryKey: ['slides', 'workshops'], queryFn: () => slidesApi.get('workshops') });
  const { data: workshops  = [] } = useQuery({ queryKey: ['workshops'],            queryFn: () => workshopsApi.get({}) });
  const { data: s          = {} } = useQuery({ queryKey: ['settings'],             queryFn: settingsApi.get, staleTime: 300_000 });

  const settings = s as any;
  const heroImg  = (slides as any[])?.[0]?.imageUrl;
  const philImg  = (workshops as any[])?.[0]?.coverImage?.url;
  const instrImg = (workshops as any[])?.[1]?.coverImage?.url;

  const instrName = settings?.instructor_name || 'Jatin Jain';
  const instrBio  = settings?.instructor_bio  || `${instrName} has been teaching photography since 2014, while working on real commercial assignments.`;

  return (
    <>
      <Navbar />

      {/* ── 1. HERO — eyebrow + big headline + image right ──────────────── */}
      <section style={{ background: '#fff', paddingTop: '64px', minHeight: '100svh', overflow: 'hidden' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12 py-12 md:py-20 min-h-[calc(100svh-64px)]">

            {/* Left — text */}
            <div>
              <p style={{ fontFamily: HF, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#111', marginBottom: '1rem' }}>
                ACADEMY
              </p>
              <h1 style={{ fontFamily: HF, fontWeight: 800, fontSize: 'clamp(2.6rem, 6vw, 5rem)', lineHeight: 1.0, color: '#111', marginBottom: '1.25rem', textTransform: 'uppercase', wordBreak: 'break-word' }}>
                LEARN TO<br />SEE DIFFERENTLY.
              </h1>
              <p style={{ fontFamily: HF, fontSize: '0.9rem', lineHeight: 1.75, color: 'rgba(0,0,0,0.5)', maxWidth: '360px', marginBottom: '2rem' }}>
                A practical photography program for people who want to take photography seriously.
              </p>
              <button
                onClick={() => setEnquiryOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.75rem] font-bold uppercase tracking-[0.05em] transition-all"
                style={{ background: '#111', color: '#fff', fontFamily: HF }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#e91e8c'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#111'}
              >
                Explore the program &#8594;
              </button>
            </div>

            {/* Right — image */}
            <div className="hidden md:block relative" style={{ aspectRatio: '4/5', overflow: 'hidden', borderRadius: '4px', background: '#f0f0f0' }}>
              {heroImg ? (
                <img src={imgUrl(heroImg)} alt="Academy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: HF, fontSize: '0.7rem', color: 'rgba(0,0,0,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Add hero image via CMS</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. PHILOSOPHY — image left, text right ───────────────────────── */}
      <section style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)', padding: '80px 0' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

            {/* Left — image */}
            <div style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: '3px', background: '#f0f0f0' }}>
              {philImg ? (
                <img src={imgUrl(philImg)} alt="Not just camera knowledge" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(8%)' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#e8e8e8' }} />
              )}
            </div>

            {/* Right — text */}
            <div>
              <h2 style={{ fontFamily: HF, fontWeight: 700, fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', lineHeight: 1.15, color: '#111', marginBottom: '1.25rem' }}>
                Not just camera knowledge.
              </h2>
              <p style={{ fontFamily: HF, fontSize: '0.88rem', lineHeight: 1.75, color: 'rgba(0,0,0,0.5)', maxWidth: '360px', marginBottom: '1.75rem' }}>
                Develop technical skills, visual understanding, creative thinking and a professional approach to photography.
              </p>
              <Link
                href="/contact?type=workshop"
                className="inline-flex items-center gap-2 text-[0.8rem] font-semibold transition-colors"
                style={{ color: '#111', fontFamily: HF }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e91e8c'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#111'}
              >
                Who is it for? &#8594;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. LEARNING JOURNEY — 4 steps ────────────────────────────────── */}
      <section style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)', padding: '72px 0' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <h2 style={{ fontFamily: HF, fontWeight: 500, fontSize: '1rem', color: '#333', marginBottom: '2.5rem', letterSpacing: '0.01em' }}>
            The learning journey
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
            {LEARNING_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div style={{ fontFamily: HF, fontWeight: 700, fontSize: '1.1rem', color: '#e91e8c', marginBottom: '0.35rem' }}>
                  {step.num}
                </div>
                <div style={{ fontFamily: HF, fontWeight: 800, fontSize: '0.75rem', color: '#111', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  {step.title}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {step.items.map((item, j) => (
                    <li key={j} style={{ fontFamily: HF, fontSize: '0.8rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.8 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. INSTRUCTOR ─────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)', padding: '80px 0' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

            {/* Left — image */}
            <div style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: '3px', background: '#f0f0f0' }}>
              {instrImg ? (
                <img src={imgUrl(instrImg)} alt={instrName} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(8%)' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#e8e8e8' }} />
              )}
            </div>

            {/* Right — text */}
            <div>
              <h2 style={{ fontFamily: HF, fontWeight: 700, fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', lineHeight: 1.15, color: '#111', marginBottom: '1.25rem' }}>
                Learn from someone who does it.
              </h2>
              <p style={{ fontFamily: HF, fontSize: '0.88rem', lineHeight: 1.75, color: 'rgba(0,0,0,0.5)', maxWidth: '380px', marginBottom: '1.75rem' }}>
                {instrBio}
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-[0.8rem] font-semibold transition-colors"
                style={{ color: '#111', fontFamily: HF }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e91e8c'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#111'}
              >
                More about {instrName.split(' ')[0]} &#8594;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. WORKSHOPS LIST (if any exist) ─────────────────────────────── */}
      {(workshops as any[]).length > 0 && (
        <section style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)', padding: '72px 0' }}>
          <div className="max-w-[1200px] mx-auto px-5 md:px-8">
            <h2 style={{ fontFamily: HF, fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: '#111', marginBottom: '2rem' }}>
              Upcoming programs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(workshops as any[]).map((w: any) => (
                <Link
                  key={w._id}
                  href={`/workshops/${w.slug || w._id}`}
                  className="group block border rounded-lg overflow-hidden transition-all hover:shadow-md"
                  style={{ borderColor: 'rgba(0,0,0,0.08)', background: '#fff', textDecoration: 'none' }}
                >
                  {w.coverImage?.url && (
                    <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                      <img src={imgUrl(w.coverImage.url)} alt={w.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ filter: 'grayscale(10%)' }} />
                    </div>
                  )}
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontFamily: HF, fontWeight: 700, fontSize: '0.95rem', color: '#111', marginBottom: '6px' }}>{w.title}</h3>
                    {w.description && (
                      <p style={{ fontFamily: HF, fontSize: '0.8rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, marginBottom: '10px' }}>
                        {w.description.slice(0, 80)}{w.description.length > 80 ? '…' : ''}
                      </p>
                    )}
                    <span style={{ fontFamily: HF, fontSize: '0.72rem', fontWeight: 600, color: '#e91e8c' }}>
                      {w.isFree ? 'Free' : w.price ? `&#8377;${w.price}` : 'Enquire'} &#8594;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer tagline ────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)', padding: '24px 0' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 flex items-center justify-between">
          <span style={{ fontFamily: HF, fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)' }}>Studio Iodine Vapor</span>
          <span style={{ fontFamily: HF, fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)', fontStyle: 'italic' }}>See. Understand. Create.</span>
        </div>
      </section>

      <Footer />

      <EnquiryPopup open={enquiryOpen} onClose={() => setEnquiryOpen(false)} serviceName="Photography Academy" />
    </>
  );
}
