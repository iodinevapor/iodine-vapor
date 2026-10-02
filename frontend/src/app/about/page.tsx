'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EnquiryPopup from '@/components/sections/EnquiryPopup';
import { slidesApi, settingsApi, testimonialsApi, brandsApi, imgUrl } from '@/lib/api';

const HF = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const BRAND_COLORS = ['#e91e8c','#1a1a2e','#7c3aed','#0ea5e9','#059669','#d97706','#dc2626'];

export default function AboutPage() {
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const { data: slides       = [] } = useQuery({ queryKey: ['slides','about'],  queryFn: () => slidesApi.get('about') });
  const { data: s            = {} } = useQuery({ queryKey: ['settings'],         queryFn: settingsApi.get, staleTime: 300_000 });
  const { data: testimonials = [] } = useQuery({ queryKey: ['testimonials'],     queryFn: () => testimonialsApi.get() });
  const { data: brands       = [] } = useQuery({ queryKey: ['brands'],           queryFn: () => brandsApi.get() });

  const st = s as any;
  const founded   = st.about_founded || '2010';
  const instrName = st.instructor_name || 'Jatin Jain';
  const instrBio  = st.instructor_bio  || `I'm ${instrName}, a photographer and mentor. I've been teaching photography since 2014 while working on commercial assignments across industries. For me, photography is a continuous process of looking, learning and sharing.`;

  const heroImg  = (slides as any[])?.[0]?.imageUrl;

  const stats = [
    { value: st.years_experience  ? `${st.years_experience}+`  : '14+',     label: 'Years teaching' },
    { value: st.students_count    ? `${st.students_count}+`    : '3,600+',  label: 'Students' },
    { value: st.projects_count    ? `${st.projects_count}+`    : '1,600+',  label: 'Shoots' },
  ];

  const doubled = (brands as any[]).length ? [...brands as any[], ...brands as any[]] : [];

  return (
    <>
      <Navbar />

      {/* â”€â”€ 1. HERO â€” reference: ABOUT eyebrow + big headline + image right â”€â”€ */}
      <section style={{ background: '#fff', paddingTop: '64px', minHeight: '100svh', overflow: 'hidden' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12 py-12 md:py-20 min-h-[calc(100svh-64px)]">

            {/* LEFT â€” text */}
            <div>
              <p style={{ fontFamily: HF, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#111', marginBottom: '1rem' }}>
                About
              </p>
              <h1 style={{ fontFamily: HF, fontWeight: 800, fontSize: 'clamp(2.2rem, 5vw, 4.2rem)', lineHeight: 1.0, color: '#111', marginBottom: '1.25rem', textTransform: 'uppercase' as const, wordBreak: 'break-word' as const }}>
                PEOPLE SEE THINGS DIFFERENTLY. I LIKE THAT.
              </h1>
              <p style={{ fontFamily: HF, fontSize: '0.88rem', lineHeight: 1.75, color: 'rgba(0,0,0,0.5)', maxWidth: '400px', marginBottom: '2rem' }}>
                {instrBio}
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-8 md:gap-10">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: HF, fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#111', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontFamily: HF, fontSize: '0.78rem', color: 'rgba(0,0,0,0.45)', marginTop: '3px' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT â€” image */}
            <div className="hidden md:block relative" style={{ aspectRatio: '4/5', overflow: 'hidden', borderRadius: '3px', background: '#f0f0f0' }}>
              {heroImg ? (
                <img src={imgUrl(heroImg)} alt={instrName} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', filter: 'grayscale(8%)' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: HF, fontSize: '0.7rem', color: 'rgba(0,0,0,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Add image via CMS (Slides â†’ About)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ 2. THE STUDIO â€” image left + text right â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)', padding: '80px 0' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

            {/* Left â€” image */}
            <div style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: '3px', background: '#f0f0f0' }}>
              {(slides as any[])?.[1]?.imageUrl ? (
                <img src={imgUrl((slides as any[])[1].imageUrl)} alt="Studio" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(8%)' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#e8e8e8' }} />
              )}
            </div>

            {/* Right â€” text */}
            <div>
              <h2 style={{ fontFamily: HF, fontWeight: 700, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: 1.15, color: '#111', marginBottom: '1.25rem' }}>
                The Studio
              </h2>
              <p style={{ fontFamily: HF, fontSize: '0.88rem', lineHeight: 1.75, color: 'rgba(0,0,0,0.5)', maxWidth: '380px', marginBottom: '1.75rem' }}>
                {st.about_text || 'Studio Iodine Vapor is a photography studio and education practice built on the belief that photography can help us see, understand and create â€” in business, in life and in our surroundings.'}
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-[0.8rem] font-semibold transition-colors"
                style={{ color: '#111', fontFamily: HF }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e91e8c'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#111'}
              >
                Our philosophy &#8594;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ Footer tagline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)', padding: '20px 0' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 flex items-center justify-between">
          <span style={{ fontFamily: HF, fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)' }}>Studio Iodine Vapor</span>
          <span style={{ fontFamily: HF, fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)', fontStyle: 'italic' }}>See. Understand. Create.</span>
        </div>
      </section>

      <Footer />
      <EnquiryPopup open={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </>
  );
}

