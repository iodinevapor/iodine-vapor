'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { seoApi } from '@/lib/api';
import { AdminHeader } from '@/components/admin/AdminComponents';
import toast from 'react-hot-toast';

const PAGES = [
  { key: 'home',      label: 'Home' },
  { key: 'about',     label: 'About / Our Story' },
  { key: 'services',  label: 'Services' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'workshops', label: 'Workshops' },
  { key: 'blog',      label: 'Blog / Journal' },
  { key: 'faq',       label: 'FAQ' },
  { key: 'contact',   label: 'Contact' },
  { key: 'quote',     label: 'Get a Quote' },
];

export default function AdminSEO() {
  const [activePage, setActive] = useState('home');
  const [form, setForm]         = useState<any>({});
  const [dirty, setDirty]       = useState(false);

  const qc = useQueryClient();

  const { data: seo, isLoading } = useQuery({
    queryKey: ['seo', activePage],
    queryFn:  () => seoApi.getPage(activePage),
  });

  useEffect(() => { if (seo !== undefined) { setForm(seo || {}); setDirty(false); } }, [seo, activePage]);

  const saveMut = useMutation({
    mutationFn: () => seoApi.upsert(activePage, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['seo'] }); toast.success('SEO saved!'); setDirty(false); },
    onError: () => toast.error('Failed'),
  });

  const set = (k: string, v: any) => { setForm((f: any) => ({ ...f, [k]: v })); setDirty(true); };
  const len = (s?: string) => s?.length || 0;

  return (
    <div>
      <AdminHeader title="SEO Manager" subtitle="Optimize each page for search engines"
        action={
          <button onClick={() => saveMut.mutate()} disabled={!dirty || saveMut.isPending}
            className="flex items-center gap-2 px-5 py-2.5 font-mono text-[0.58rem] tracking-[0.18em] uppercase transition-all"
            style={{ background: dirty ? 'var(--c-gold)' : 'rgba(255,255,255,0.07)', color: dirty ? '#ffffff' : 'rgba(255,255,255,0.4)', borderRadius: '2px', cursor: dirty ? 'pointer' : 'not-allowed' }}>
            {saveMut.isPending ? '…' : '✓'} {dirty ? 'Save SEO' : 'Saved'}
          </button>
        }
      />

      <div className="flex gap-6">
        {/* Pages nav */}
        <div className="w-48 flex-shrink-0">
          <div className="border p-2 space-y-0.5" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
            {PAGES.map(p => (
              <button key={p.key} onClick={() => { setActive(p.key); setDirty(false); }}
                className="w-full text-left px-3 py-2.5 font-mono text-[0.54rem] tracking-[0.14em] uppercase transition-all"
                style={{ borderRadius: '2px', background: activePage === p.key ? 'rgba(201,169,110,0.1)' : 'transparent', color: activePage === p.key ? 'var(--c-cream)' : 'rgba(255,255,255,0.45)', borderLeft: activePage === p.key ? '2px solid var(--c-gold)' : '2px solid transparent' }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 space-y-4">
          {isLoading ? (
            <div className="space-y-4">{Array.from({length:4}).map((_,i) => <div key={i} className="h-12 shimmer" style={{ borderRadius: '2px' }} />)}</div>
          ) : (
            <motion.div key={activePage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="border p-6 space-y-5" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
                <h2 className="font-display text-[1.2rem] tracking-[0.06em]">
                  {PAGES.find(p => p.key === activePage)?.label} — SEO
                </h2>

                {/* Meta Title */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-mono text-[0.52rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Meta Title</label>
                    <span className={`font-mono text-[0.48rem] ${len(form.metaTitle) > 60 ? 'text-red-400' : len(form.metaTitle) > 50 ? 'text-yellow-400' : 'opacity-40'}`} style={{ color: len(form.metaTitle) > 60 ? '#f87171' : len(form.metaTitle) > 50 ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}>
                      {len(form.metaTitle)}/60
                    </span>
                  </div>
                  <input value={form.metaTitle || ''} onChange={e => set('metaTitle', e.target.value)}
                    placeholder={`${PAGES.find(p=>p.key===activePage)?.label} | Iodine Vapor Photography`}
                    className="input-field" maxLength={70} />
                </div>

                {/* Meta Desc */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-mono text-[0.52rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Meta Description</label>
                    <span className="font-mono text-[0.48rem]" style={{ color: len(form.metaDescription) > 160 ? '#f87171' : 'rgba(255,255,255,0.4)' }}>
                      {len(form.metaDescription)}/160
                    </span>
                  </div>
                  <textarea value={form.metaDescription || ''} onChange={e => set('metaDescription', e.target.value)}
                    placeholder="Describe this page for search engines…"
                    rows={3} className="input-field resize-none text-[0.82rem]" maxLength={170} />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block font-mono text-[0.52rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Keywords (comma-separated)</label>
                  <input value={form.keywords?.join(', ') || ''} onChange={e => set('keywords', e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean))}
                    placeholder="photography, videography, Iodine Vapor" className="input-field text-[0.82rem]" />
                </div>

                {/* OG Image */}
                <div>
                  <label className="block font-mono text-[0.52rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>OG Image URL</label>
                  <input value={form.ogImage || ''} onChange={e => set('ogImage', e.target.value)}
                    placeholder="https://…/og-image.jpg" className="input-field text-[0.82rem]" />
                </div>

                {/* Canonical */}
                <div>
                  <label className="block font-mono text-[0.52rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Canonical URL</label>
                  <input value={form.canonical || ''} onChange={e => set('canonical', e.target.value)}
                    placeholder="https://iodinevapor.com/page" className="input-field text-[0.82rem]" />
                </div>
              </div>

              {/* SERP Preview */}
              <div className="border p-5" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
                <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Search Engine Preview</p>
                <div className="space-y-1 p-4" style={{ background: '#fff', borderRadius: '4px' }}>
                  <p style={{ color: '#0f9d58', fontSize: '13px', fontFamily: 'Arial, sans-serif' }}>
                    iodinevapor.com/{activePage === 'home' ? '' : activePage}
                  </p>
                  <p style={{ color: '#1a0dab', fontSize: '18px', fontFamily: 'Arial, sans-serif', lineHeight: '1.3', cursor: 'pointer', textDecoration: 'underline' }}>
                    {form.metaTitle || `${PAGES.find(p=>p.key===activePage)?.label} | Iodine Vapor Photography`}
                  </p>
                  <p style={{ color: '#4d5156', fontSize: '13px', fontFamily: 'Arial, sans-serif', lineHeight: '1.4' }}>
                    {form.metaDescription || 'No meta description set. Add one above to improve click-through rates.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}


