'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { settingsApi, enquiriesApi, servicesApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ContactPage() {
  return <Suspense><ContactPageInner /></Suspense>;
}

const HF = 'Helvetica Neue, Helvetica, Arial, sans-serif';

/* ── Shared input styles ── */
const baseInput: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '11px 14px',
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: '6px',
  color: '#111',
  fontSize: '0.875rem',
  fontFamily: HF,
  outline: 'none',
  transition: 'border-color 0.18s, box-shadow 0.18s',
  WebkitAppearance: 'none',
};
const onFocus = (e: React.FocusEvent<any>) => {
  e.currentTarget.style.borderColor = '#e91e8c';
  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(233,30,140,0.1)';
};
const onBlur = (e: React.FocusEvent<any>) => {
  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)';
  e.currentTarget.style.boxShadow = 'none';
};

function ContactPageInner() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '',
    service: '', message: '', type: 'contact',
  });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [status, setStatus]   = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [file, setFile]       = useState<File | null>(null);
  const [fileErr, setFileErr] = useState('');
  const fileRef               = useRef<HTMLInputElement>(null);

  const { data: s        = {} } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get, staleTime: 300_000 });
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: servicesApi.get });

  const st = s as any;

  useEffect(() => {
    const svc = searchParams.get('service');
    if (svc) setForm(f => ({ ...f, service: svc }));
  }, [searchParams]);

  const up = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())                            e.name    = 'Name is required';
    if (!form.email.trim())                           e.email   = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.phone && !/^[+\d\s\-()]{7,}$/.test(form.phone))  e.phone  = 'Enter a valid phone number';
    if (!form.message.trim())                         e.message = 'Please tell us about your project';
    return e;
  };

  const handleFile = (f: File | null) => {
    if (!f) { setFile(null); setFileErr(''); return; }
    const ok = ['application/pdf','image/jpeg','image/jpg','image/png','image/webp'];
    if (!ok.includes(f.type)) { setFileErr('Only PDF, JPG, PNG or WEBP allowed'); return; }
    if (f.size > 10 * 1024 * 1024) { setFileErr('File must be under 10 MB'); return; }
    setFile(f); setFileErr('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStatus('submitting');
    try {
      await enquiriesApi.submit({ ...form, file: file || undefined });
      setStatus('success');
    } catch {
      setStatus('error');
      toast.error('Failed to send. Please try again.');
    }
  };

  const whatsapp    = st.contact_whatsapp || st.contact_phone?.replace(/\D/g, '');
  const phone       = st.contact_phone   || '+91 7509666650';
  const email       = st.contact_email   || 'hello@iodinevapor.com';
  const address     = st.contact_address || '164, UNI Home, Bhatagaon, Raipur, CG 492001';

  return (
    <>
      <Navbar />

      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section
        style={{ background: '#fff', paddingTop: '70px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}
        aria-labelledby="contact-heading"
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-end">

            {/* Left */}
            <div>
              <p style={{ fontFamily: HF, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#e91e8c', marginBottom: '1rem' }}>
                Contact
              </p>
              <h1 id="contact-heading" style={{ fontFamily: HF, fontWeight: 800, fontSize: 'clamp(2.2rem, 5vw, 4.2rem)', lineHeight: 1.05, color: '#111', wordBreak: 'break-word', textTransform: 'uppercase' }}>
                SO, WHAT<br />BRINGS YOU<br />HERE?
              </h1>
            </div>

            {/* Right */}
            <div className="md:pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-6">
                {/* Photography CTA */}
                <div>
                  <p style={{ fontFamily: HF, fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#111', marginBottom: '0.5rem' }}>
                    I NEED<br />PHOTOGRAPHY
                  </p>
                  <p style={{ fontFamily: HF, fontSize: '0.82rem', lineHeight: 1.6, color: 'rgba(0,0,0,0.45)', marginBottom: '0.75rem' }}>
                    For brands, businesses, institutions and projects.
                  </p>
                  <button
                    onClick={() => { up('service', 'Commercial Photography'); document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' }); }}
                    style={{ fontFamily: HF, fontSize: '0.8rem', fontWeight: 600, color: '#111', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e91e8c'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#111'}
                  >
                    Start a project &#8594;
                  </button>
                </div>

                {/* Academy CTA */}
                <div>
                  <p style={{ fontFamily: HF, fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#111', marginBottom: '0.5rem' }}>
                    I WANT<br />TO LEARN
                  </p>
                  <p style={{ fontFamily: HF, fontSize: '0.82rem', lineHeight: 1.6, color: 'rgba(0,0,0,0.45)', marginBottom: '0.75rem' }}>
                    About the photography program or other learning opportunities.
                  </p>
                  <button
                    onClick={() => { up('service', 'Photography Academy'); document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' }); }}
                    style={{ fontFamily: HF, fontSize: '0.8rem', fontWeight: 600, color: '#111', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e91e8c'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#111'}
                  >
                    Enquire now &#8594;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FORM + CONTACT INFO ───────────────────────────────────────── */}
      <section id="contact-form" style={{ background: '#f8f8fa', padding: 'clamp(40px,6vw,80px) 0' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1.4fr] gap-8 md:gap-12 items-start">

            {/* ── LEFT: Form ── */}
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div key="success"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ padding: 'clamp(32px,6vw,56px)', textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(233,30,140,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <h2 style={{ fontFamily: HF, fontWeight: 700, fontSize: '1.3rem', color: '#111', marginBottom: '0.5rem' }}>Message sent.</h2>
                    <p style={{ fontFamily: HF, fontSize: '0.85rem', color: 'rgba(0,0,0,0.45)', marginBottom: '1.5rem', maxWidth: '320px', margin: '0 auto 1.5rem' }}>
                      Thank you. Your message has been received. We&#39;ll get back to you within 24 hours.
                    </p>
                    <button onClick={() => { setStatus('idle'); setForm({ name:'',email:'',phone:'',company:'',service:'',message:'',type:'contact' }); setFile(null); }}
                      style={{ fontFamily: HF, fontSize: '0.75rem', fontWeight: 600, color: '#e91e8c', background: 'none', border: '1px solid rgba(233,30,140,0.3)', borderRadius: '6px', padding: '9px 20px', cursor: 'pointer' }}>
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={submit} noValidate style={{ padding: 'clamp(24px,5vw,40px)' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {/* Name */}
                      <div>
                        <label htmlFor="name" style={{ display: 'block', fontFamily: HF, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: errors.name ? '#d63a2f' : 'rgba(0,0,0,0.45)', marginBottom: '5px' }}>
                          Name <span aria-hidden="true" style={{ color: '#e91e8c' }}>*</span>
                        </label>
                        <input id="name" type="text" autoComplete="name" required
                          value={form.name} onChange={e => up('name', e.target.value)}
                          placeholder="Your name"
                          style={{ ...baseInput, borderColor: errors.name ? '#d63a2f' : 'rgba(0,0,0,0.12)' }}
                          onFocus={onFocus} onBlur={onBlur}
                          aria-describedby={errors.name ? 'name-err' : undefined}
                          aria-invalid={!!errors.name}
                        />
                        {errors.name && <p id="name-err" role="alert" style={{ fontFamily: HF, fontSize: '0.65rem', color: '#d63a2f', marginTop: '3px' }}>{errors.name}</p>}
                      </div>
                      {/* Phone */}
                      <div>
                        <label htmlFor="phone" style={{ display: 'block', fontFamily: HF, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: errors.phone ? '#d63a2f' : 'rgba(0,0,0,0.45)', marginBottom: '5px' }}>
                          Phone
                        </label>
                        <input id="phone" type="tel" autoComplete="tel"
                          value={form.phone} onChange={e => up('phone', e.target.value)}
                          placeholder="+91 98765 43210"
                          style={{ ...baseInput, borderColor: errors.phone ? '#d63a2f' : 'rgba(0,0,0,0.12)' }}
                          onFocus={onFocus} onBlur={onBlur}
                          aria-describedby={errors.phone ? 'phone-err' : undefined}
                        />
                        {errors.phone && <p id="phone-err" role="alert" style={{ fontFamily: HF, fontSize: '0.65rem', color: '#d63a2f', marginTop: '3px' }}>{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {/* Email */}
                      <div>
                        <label htmlFor="email" style={{ display: 'block', fontFamily: HF, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: errors.email ? '#d63a2f' : 'rgba(0,0,0,0.45)', marginBottom: '5px' }}>
                          Email <span aria-hidden="true" style={{ color: '#e91e8c' }}>*</span>
                        </label>
                        <input id="email" type="email" autoComplete="email" required
                          value={form.email} onChange={e => up('email', e.target.value)}
                          placeholder="you@example.com"
                          style={{ ...baseInput, borderColor: errors.email ? '#d63a2f' : 'rgba(0,0,0,0.12)' }}
                          onFocus={onFocus} onBlur={onBlur}
                          aria-describedby={errors.email ? 'email-err' : undefined}
                          aria-invalid={!!errors.email}
                        />
                        {errors.email && <p id="email-err" role="alert" style={{ fontFamily: HF, fontSize: '0.65rem', color: '#d63a2f', marginTop: '3px' }}>{errors.email}</p>}
                      </div>
                      {/* Company */}
                      <div>
                        <label htmlFor="company" style={{ display: 'block', fontFamily: HF, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: '5px' }}>
                          Company
                        </label>
                        <input id="company" type="text" autoComplete="organization"
                          value={form.company} onChange={e => up('company', e.target.value)}
                          placeholder="Your company"
                          style={baseInput} onFocus={onFocus} onBlur={onBlur}
                        />
                      </div>
                    </div>

                    {/* Service */}
                    <div className="mb-4">
                      <label htmlFor="service" style={{ display: 'block', fontFamily: HF, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: '5px' }}>
                        I&#39;m interested in
                      </label>
                      <select id="service" value={form.service} onChange={e => up('service', e.target.value)}
                        style={{ ...baseInput, cursor: 'pointer' }} onFocus={onFocus} onBlur={onBlur}>
                        <option value="">Select…</option>
                        {(services as any[]).map((svc: any) => (
                          <option key={svc._id} value={svc.name}>{svc.name}</option>
                        ))}
                        <option value="Photography Academy">Photography Academy</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div className="mb-4">
                      <label htmlFor="message" style={{ display: 'block', fontFamily: HF, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: errors.message ? '#d63a2f' : 'rgba(0,0,0,0.45)', marginBottom: '5px' }}>
                        Tell us a little about your project <span aria-hidden="true" style={{ color: '#e91e8c' }}>*</span>
                      </label>
                      <textarea id="message" required rows={4}
                        value={form.message} onChange={e => up('message', e.target.value)}
                        placeholder="Tell us a little about your project or what you'd like to learn."
                        style={{ ...baseInput, resize: 'vertical', minHeight: '100px', borderColor: errors.message ? '#d63a2f' : 'rgba(0,0,0,0.12)' }}
                        onFocus={onFocus} onBlur={onBlur}
                        aria-describedby={errors.message ? 'msg-err' : undefined}
                        aria-invalid={!!errors.message}
                      />
                      {errors.message && <p id="msg-err" role="alert" style={{ fontFamily: HF, fontSize: '0.65rem', color: '#d63a2f', marginTop: '3px' }}>{errors.message}</p>}
                    </div>

                    {/* File */}
                    <div className="mb-6">
                      <label htmlFor="attachment" style={{ display: 'block', fontFamily: HF, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: '5px' }}>
                        Attachment <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: '0.7rem' }}>(PDF / JPG / PNG — optional, max 10 MB)</span>
                      </label>
                      <div
                        role="button" tabIndex={0}
                        onClick={() => fileRef.current?.click()}
                        onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f8f8fa', border: '1px dashed rgba(0,0,0,0.15)', borderRadius: '6px', cursor: 'pointer', transition: 'border-color 0.18s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#e91e8c'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.15)'}
                        aria-label="Upload attachment"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                        </svg>
                        <span style={{ fontFamily: HF, fontSize: '0.8rem', color: file ? '#e91e8c' : 'rgba(0,0,0,0.4)', flex: 1 }}>
                          {file ? file.name : 'Click to upload'}
                        </span>
                        {file && (
                          <button type="button" onClick={ev => { ev.stopPropagation(); handleFile(null); }}
                            style={{ fontFamily: HF, fontSize: '0.65rem', color: '#d63a2f', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                            aria-label="Remove file">
                            Remove
                          </button>
                        )}
                      </div>
                      {fileErr && <p role="alert" style={{ fontFamily: HF, fontSize: '0.65rem', color: '#d63a2f', marginTop: '3px' }}>{fileErr}</p>}
                      <input ref={fileRef} id="attachment" type="file" className="sr-only"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={e => handleFile(e.target.files?.[0] || null)}
                        aria-label="Upload attachment"
                      />
                    </div>

                    {/* Submit */}
                    {status === 'error' && (
                      <p role="alert" style={{ fontFamily: HF, fontSize: '0.78rem', color: '#d63a2f', marginBottom: '12px', padding: '10px 14px', background: 'rgba(214,58,47,0.06)', borderRadius: '6px', border: '1px solid rgba(214,58,47,0.15)' }}>
                        Something went wrong. Please try again or contact us directly.
                      </p>
                    )}

                    <button type="submit" disabled={status === 'submitting'}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        width: '100%', padding: '13px 24px',
                        background: status === 'submitting' ? 'rgba(233,30,140,0.5)' : '#111',
                        color: '#fff', border: 'none', borderRadius: '7px', cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                        fontFamily: HF, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                        transition: 'background 0.18s',
                      }}
                      onMouseEnter={e => { if (status !== 'submitting') (e.currentTarget as HTMLElement).style.background = '#e91e8c'; }}
                      onMouseLeave={e => { if (status !== 'submitting') (e.currentTarget as HTMLElement).style.background = '#111'; }}
                    >
                      {status === 'submitting' ? (
                        <>
                          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                          </svg>
                          Sending…
                        </>
                      ) : 'Send message'}
                    </button>

                    <p style={{ fontFamily: HF, fontSize: '0.65rem', color: 'rgba(0,0,0,0.28)', textAlign: 'center', marginTop: '10px' }}>
                      We respect your privacy and never share your information.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* ── RIGHT: Contact info ── */}
            <div>
              {/* "You can also reach us at" */}
              <div style={{ marginBottom: '1.75rem' }}>
                <p style={{ fontFamily: HF, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', marginBottom: '1rem' }}>
                  You can also reach us at
                </p>

                {/* Email */}
                <a href={`mailto:${email}`}
                  style={{ display: 'block', fontFamily: HF, fontSize: '0.88rem', fontWeight: 500, color: '#111', textDecoration: 'none', marginBottom: '0.6rem' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e91e8c'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#111'}
                >
                  {email}
                </a>

                {/* Phone */}
                <a href={`tel:${phone.replace(/\s/g,'')}`}
                  style={{ display: 'block', fontFamily: HF, fontSize: '0.88rem', fontWeight: 500, color: '#111', textDecoration: 'none', marginBottom: '0.6rem' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e91e8c'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#111'}
                >
                  {phone}
                </a>

                {/* Address */}
                <address style={{ fontFamily: HF, fontSize: '0.85rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, fontStyle: 'normal' }}>
                  {address}
                </address>
              </div>

              {/* WhatsApp */}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g,'')}?text=Hi%2C%20I'd%20like%20to%20enquire.`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: HF, fontSize: '0.8rem', fontWeight: 600, color: '#111', textDecoration: 'none', marginBottom: '1.75rem' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#25D366'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#111'}
                  aria-label="Chat on WhatsApp"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Prefer WhatsApp? Let&#39;s talk &#8594;
                </a>
              )}

              {/* Social links */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { label: 'Instagram', href: st.social_instagram || 'https://instagram.com', icon: <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5a1 1 0 101-1 1 1 0 01-1 1zM5 2h14a3 3 0 013 3v14a3 3 0 01-3 3H5a3 3 0 01-3-3V5a3 3 0 013-3z" /> },
                  { label: 'LinkedIn',  href: st.social_linkedin  || 'https://linkedin.com',  icon: <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></> },
                  { label: 'YouTube',   href: st.social_youtube   || 'https://youtube.com',   icon: <><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></> },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    aria-label={s.label}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', color: '#333', transition: 'background 0.18s, color 0.18s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(233,30,140,0.1)'; (e.currentTarget as HTMLElement).style.color = '#e91e8c'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.color = '#333'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {s.icon}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FOOTER TAGLINE ──────────────────────────────────────────────── */}
      <section style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)', padding: '20px 0' }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 flex flex-wrap items-center justify-between gap-2">
          <span style={{ fontFamily: HF, fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)' }}>Studio Iodine Vapor</span>
          <span style={{ fontFamily: HF, fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)', fontStyle: 'italic' }}>See. Understand. Create.</span>
        </div>
      </section>

      <Footer />
    </>
  );
}
