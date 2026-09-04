'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroFromSlides from '@/components/sections/HeroFromSlides';
import { slidesApi, settingsApi, enquiriesApi, servicesApi } from '@/lib/api';
import { ImLocation2 } from 'react-icons/im';
import toast from 'react-hot-toast';

export default function ContactPage() {
  return <Suspense><ContactPageInner /></Suspense>;
}

function ContactPageInner() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', service: '', message: '', type: 'contact' });
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile]       = useState<File | null>(null);
  const fileRef               = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const svc = searchParams.get('service');
    if (svc) setForm(f => ({ ...f, service: svc }));
  }, [searchParams]);

  const { data: slides   = [] } = useQuery({ queryKey: ['slides','contact'], queryFn: () => slidesApi.get('contact') });
  const { data: s        = {} } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get, staleTime: 300_000 });
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: servicesApi.get });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error('Fill required fields');
    setLoading(true);
    try { await enquiriesApi.submit({ ...form, file: file || undefined }); setSent(true); }
    catch { toast.error('Failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const whatsapp = (s as any).contact_whatsapp;
  const mapEmbed = (s as any).contact_map_embed;
  const hours    = ((s as any).contact_hours || '').split('\n').filter(Boolean);
  const phone2   = (s as any).contact_phone2;

  const contactItems = [
    (s as any).contact_email   && { icon: '✉', label: 'Email Us',      val: (s as any).contact_email,   href: `mailto:${(s as any).contact_email}`,  accent: '#e91e8c' },
    (s as any).contact_phone   && { icon: '☎', label: 'Call Us',       val: (s as any).contact_phone,   href: `tel:${(s as any).contact_phone}`,     accent: '#1a1a2e' },
    phone2                      && { icon: '📱', label: 'Alternate',    val: phone2,                     href: `tel:${phone2}`,                        accent: '#7c3aed' },
    (s as any).contact_address && { icon: 'location', label: 'Our Location', val: (s as any).contact_address, href: '#map', accent: '#e91e8c' },
  ].filter(Boolean) as any[];

  /* shared input style — light themed */
  const inp: React.CSSProperties = {
    display: 'block', width: '100%', padding: '13px 16px',
    background: '#ffffff', border: '1.5px solid #e8e8ef',
    borderRadius: '10px', color: '#1a1a2e', fontSize: '0.875rem',
    fontFamily: 'Helvetica Neue, Helvetica, sans-serif',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const fo = (e: React.FocusEvent<any>) => {
    e.currentTarget.style.borderColor = '#e91e8c';
    e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(233,30,140,0.08)';
  };
  const bl = (e: React.FocusEvent<any>) => {
    e.currentTarget.style.borderColor = '#e8e8ef';
    e.currentTarget.style.boxShadow   = 'none';
  };
  const lbl = 'block font-mono text-[0.48rem] tracking-[0.22em] uppercase mb-1.5 font-semibold';

  return (
    <>
      <Navbar />

      {/* ── Hero — fully dynamic from Admin → Slides / CMS → contact ── */}
      <HeroFromSlides
        slides={slides as any[]}
        page="contact"
        defaultTitle="GET IN TOUCH"
        defaultSub="Let's Start Your Project"
      />

      <main style={{ background: '#ffffff' }}>

        {/* ── Two-column layout ─────────────────────────────────────────── */}
        <section className="py-14 px-6 md:px-12">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-12 items-start">

            {/* ── LEFT — Info ──────────────────────────────────────────── */}
            <div>

              {/* Contact cards */}
              <div className="space-y-3 mb-8">
                {contactItems.map((card: any, i: number) => (
                  <motion.a
                    key={i} href={card.href}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.4 }}
                    className="flex items-center gap-4 p-4 rounded-xl group transition-all duration-200 hover:-translate-y-0.5"
                    style={{ background: '#f7f7fa', border: '1.5px solid #ededf2', textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${card.accent}40`; (e.currentTarget as HTMLElement).style.background = `${card.accent}06`; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ededf2'; (e.currentTarget as HTMLElement).style.background = '#f7f7fa'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[1.1rem] shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: `${card.accent}12` }}>
                      {card.icon === 'location'
                        ? <ImLocation2 size={20} color={card.accent} />
                        : <span>{card.icon}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[0.46rem] tracking-[0.15em] uppercase mb-0.5 font-semibold" style={{ color: card.accent }}>{card.label}</p>
                      <p className="font-semibold text-[0.9rem] truncate" style={{ color: '#1a1a2e', fontFamily: "'Syne', sans-serif" }}>{card.val}</p>
                    </div>
                    <svg className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </motion.a>
                ))}
              </div>

              {/* Business hours */}
              {hours.length > 0 && (
                <div className="p-5 rounded-xl mb-6" style={{ background: '#f7f7fa', border: '1.5px solid #ededf2' }}>
                  <p className="font-mono text-[0.48rem] tracking-[0.2em] uppercase mb-3 font-semibold" style={{ color: 'rgba(0,0,0,0.4)' }}>🕐 Business Hours</p>
                  {hours.map((h: string, i: number) => (
                    <p key={i} className="text-[0.82rem]" style={{ color: 'rgba(0,0,0,0.6)' }}>{h}</p>
                  ))}
                </div>
              )}

              {/* WhatsApp */}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}?text=Hi%2C%20I'd%20like%20to%20enquire%20about%20photography%20services.`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-[0.78rem] mb-6 transition-all w-full justify-center"
                  style={{ background: '#25D366', color: '#ffffff', fontFamily: "'Syne', sans-serif" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(37,211,102,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Chat on WhatsApp
                </a>
              )}

              {/* Credentials */}
              <div className="flex flex-wrap gap-2">
                {['Nikon NPS', 'GST Registered', 'MSME Certified', 'Pan-India'].map(b => (
                  <span key={b} className="font-mono text-[0.46rem] tracking-[0.12em] uppercase px-3 py-1.5"
                    style={{ background: 'rgba(233,30,140,0.06)', border: '1px solid rgba(233,30,140,0.15)', color: '#e91e8c', borderRadius: '6px' }}>
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* ── RIGHT — Form ─────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: '#ffffff', border: '1.5px solid #ededf2', boxShadow: '0 8px 40px rgba(0,0,0,0.07)' }}
            >
              {/* Form header band */}
              <div className="px-8 py-5 border-b" style={{ borderColor: '#ededf2', background: 'linear-gradient(135deg, #fdf2f8, #faf0ff)' }}>
                <h2 className="font-bold text-[#1a1a2e] text-[1.25rem]" style={{ fontFamily: "'Syne', sans-serif" }}>Send a Message</h2>
                <p className="text-[0.78rem] mt-0.5" style={{ color: 'rgba(0,0,0,0.45)' }}>We respond within 24 hours · Mon–Sat</p>
              </div>

              <div className="px-8 py-7">
                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-18 h-18 rounded-full flex items-center justify-center mb-5"
                        style={{ width: 72, height: 72, background: 'rgba(233,30,140,0.08)', border: '2px solid rgba(233,30,140,0.2)' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                      </div>
                      <h3 className="font-bold text-[#1a1a2e] text-[1.4rem] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Message Sent!</h3>
                      <p className="text-[0.85rem] mb-7" style={{ color: 'rgba(0,0,0,0.45)' }}>We'll get back to you within 24 hours.</p>
                      <button onClick={() => setSent(false)}
                        className="px-6 py-2.5 font-mono text-[0.55rem] tracking-[0.18em] uppercase border rounded-lg transition-all"
                        style={{ borderColor: '#e91e8c', color: '#e91e8c' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#e91e8c'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#e91e8c'; }}>
                        Send Another →
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form key="form" onSubmit={submit} className="space-y-5">

                      {/* Name + Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={lbl} style={{ color: 'rgba(0,0,0,0.45)' }}>Full Name <span style={{ color: '#e91e8c' }}>*</span></label>
                          <input required value={form.name} onChange={e => up('name', e.target.value)} placeholder="Your name" style={inp} onFocus={fo} onBlur={bl} />
                        </div>
                        <div>
                          <label className={lbl} style={{ color: 'rgba(0,0,0,0.45)' }}>Phone Number</label>
                          <input value={form.phone} onChange={e => up('phone', e.target.value)} placeholder="+91 98765 43210" style={inp} onFocus={fo} onBlur={bl} />
                        </div>
                      </div>

                      {/* Email + Company */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={lbl} style={{ color: 'rgba(0,0,0,0.45)' }}>Email <span style={{ color: '#e91e8c' }}>*</span></label>
                          <input required type="email" value={form.email} onChange={e => up('email', e.target.value)} placeholder="you@company.com" style={inp} onFocus={fo} onBlur={bl} />
                        </div>
                        <div>
                          <label className={lbl} style={{ color: 'rgba(0,0,0,0.45)' }}>Company</label>
                          <input value={form.company} onChange={e => up('company', e.target.value)} placeholder="Your company" style={inp} onFocus={fo} onBlur={bl} />
                        </div>
                      </div>

                      {/* Service */}
                      <div>
                        <label className={lbl} style={{ color: 'rgba(0,0,0,0.45)' }}>Service Interested In</label>
                        <select value={form.service} onChange={e => up('service', e.target.value)}
                          style={{ ...inp, cursor: 'pointer' }} onFocus={fo} onBlur={bl}>
                          <option value="">Select a service…</option>
                          {(services as any[]).map((svc: any) => (
                            <option key={svc._id} value={svc.name}>{svc.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Message */}
                      <div>
                        <label className={lbl} style={{ color: 'rgba(0,0,0,0.45)' }}>Message <span style={{ color: '#e91e8c' }}>*</span></label>
                        <textarea required value={form.message} onChange={e => up('message', e.target.value)}
                          rows={4} placeholder="Tell us about your project, timeline, requirements…"
                          style={{ ...inp, resize: 'vertical', minHeight: '110px' }}
                          onFocus={fo} onBlur={bl} />
                      </div>

                      {/* File upload */}
                      <div>
                        <label className={lbl} style={{ color: 'rgba(0,0,0,0.45)' }}>
                          Attach Brief <span style={{ color: 'rgba(0,0,0,0.3)' }}>(PDF / JPG / PNG — optional)</span>
                        </label>
                        <div onClick={() => fileRef.current?.click()}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all"
                          style={{ background: '#f7f7fa', border: '1.5px dashed #ddd', borderRadius: '10px' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#e91e8c'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#ddd'}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(233,30,140,0.08)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                            </svg>
                          </div>
                          <span className="text-[0.8rem] flex-1" style={{ color: file ? '#e91e8c' : 'rgba(0,0,0,0.4)' }}>
                            {file ? file.name : 'Click to upload file'}
                          </span>
                          {file && (
                            <button type="button" onClick={ev => { ev.stopPropagation(); setFile(null); }}
                              className="text-[0.6rem] font-mono" style={{ color: '#d63a2f' }}>✕</button>
                          )}
                        </div>
                        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                          onChange={e => setFile(e.target.files?.[0] || null)} />
                      </div>

                      {/* Submit */}
                      <button type="submit" disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-4 font-semibold text-[0.8rem] tracking-[0.08em] uppercase transition-all duration-300 rounded-xl"
                        style={{
                          background: loading ? 'rgba(233,30,140,0.5)' : 'linear-gradient(135deg, #e91e8c 0%, #c4167a 100%)',
                          color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                          fontFamily: 'Helvetica Neue, Helvetica, sans-serif',
                          boxShadow: loading ? 'none' : '0 6px 20px rgba(233,30,140,0.3)',
                        }}
                        onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 28px rgba(233,30,140,0.4)'; } }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = loading ? 'none' : '0 6px 20px rgba(233,30,140,0.3)'; }}>
                        {loading ? (
                          <>
                            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>
                            Sending…
                          </>
                        ) : (
                          <>
                            Send Message
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                            </svg>
                          </>
                        )}
                      </button>

                      <p className="text-center font-mono text-[0.46rem] tracking-[0.12em] uppercase" style={{ color: 'rgba(0,0,0,0.25)' }}>
                        Secure · We never share your information
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Google Map ────────────────────────────────────────────────── */}
        <section id="map" className="px-6 md:px-12 pb-16">
          <div className="max-w-[1400px] mx-auto">
            <div className="overflow-hidden rounded-2xl" style={{ border: '1.5px solid #ededf2', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <iframe
                src={mapEmbed || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.499396588847!2d81.61317347577216!3d21.212036580483492!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28dc31eca06d0b%3A0xd811c1523e35b6e5!2zU3R1ZGlvIGlvZGluZSB2YXBvciB8IOCkhuCkr-Cli-CkoeClgOCkqCDgpLXgpYfgpKrgpLA!5e0!3m2!1sen!2sin!4v1786694327215!5m2!1sen!2sin"}
                width="100%" height="440"
                style={{ border: 0, display: 'block' }}
                allowFullScreen loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Studio Iodine Vapor Location"
              />
              <div className="flex items-center flex-wrap gap-3 px-6 py-4 border-t" style={{ borderColor: '#ededf2', background: '#f7f7fa' }}>
                <div className="flex items-center gap-2 mr-auto">
                  <ImLocation2 size={14} color="#e91e8c" />
                  <span className="font-mono text-[0.5rem] tracking-[0.16em] uppercase" style={{ color: 'rgba(0,0,0,0.4)' }}>
                    Studio Iodine Vapor — Raipur, Chhattisgarh
                  </span>
                </div>
                <div className="flex gap-2">
                  <a href="https://maps.app.goo.gl/wbfSBbEb4mRcVymQ9" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-[0.68rem] font-semibold transition-all rounded-lg"
                    style={{ background: '#1a1a2e', color: '#fff', fontFamily: 'Helvetica Neue' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#e91e8c'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1a1a2e'}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    Open in Maps
                  </a>
                  <button onClick={() => { navigator.clipboard.writeText('https://maps.app.goo.gl/wbfSBbEb4mRcVymQ9'); toast.success('Copied!'); }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-[0.68rem] font-semibold border transition-all rounded-lg"
                    style={{ background: '#fff', color: '#e91e8c', borderColor: 'rgba(233,30,140,0.2)', fontFamily: 'Helvetica Neue' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(233,30,140,0.05)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom bar ───────────────────────────────────────────────── */}
        <section className="py-10 px-6 md:px-12 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)', background: '#f7f7fa' }}>
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
            <div>
              <h3 className="font-bold text-[#1a1a2e] text-[1.1rem] mb-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>Need a Faster Response?</h3>
              <p className="text-[0.8rem]" style={{ color: 'rgba(0,0,0,0.45)' }}>WhatsApp or call us — Mon to Sat, 10am–7pm IST</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {(s as any).contact_phone && (
                <a href={`tel:${(s as any).contact_phone}`}
                  className="inline-flex items-center gap-2 px-6 py-3 text-[0.75rem] font-semibold border rounded-lg transition-all"
                  style={{ borderColor: '#e8e8ef', color: '#1a1a2e', background: '#fff', fontFamily: 'Helvetica Neue' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e91e8c'; (e.currentTarget as HTMLElement).style.color = '#e91e8c'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e8e8ef'; (e.currentTarget as HTMLElement).style.color = '#1a1a2e'; }}>
                  ☎ {(s as any).contact_phone}
                </a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 text-[0.75rem] font-semibold rounded-lg transition-all"
                  style={{ background: '#25D366', color: '#fff', fontFamily: 'Helvetica Neue' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(37,211,102,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                  💬 WhatsApp Now
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
