'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { slidesApi, imgUrl } from '@/lib/api';
import { AdminHeader, AddBtn, FormDrawer, Field, TextStyleEditor, Toggle, PositionPicker, MediaPicker, ConfirmDelete, StatusBadge, MiniTitleWordEditor } from '@/components/admin/AdminComponents';
import toast from 'react-hot-toast';

const PAGES = ['home','about','services','portfolio','workshops','blog','faq','contact','quote','navbar','footer'];
const emptyStyle = () => ({ text: '', color: '#f5f0ea', fontSize: '16px', fontWeight: '400', fontFamily: 'Syne', textAlign: 'left', italic: false, uppercase: false });
const emptySlide = (page = 'home') => ({ page, title: emptyStyle(), subtitle: emptyStyle(), miniTitle: { ...emptyStyle(), color: '#c9a96e', fontSize: '0.62rem', uppercase: true }, paragraph: { ...emptyStyle(), color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }, imageUrl: '', imageId: '', mobileImageUrl: '', mobileImageId: '', linkUrl: '', linkText: '', position: 'center', bgColor: '', bgGradient: '', overlayOpacity: 0.5, order: 0, isActive: true });

export default function AdminSlides() {
  const [filterPage, setFilterPage] = useState('home');
  const [form, setForm]             = useState<any>(null);
  const [showForm, setShowForm]     = useState(false);
  const [showMedia, setShowMedia]   = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'desktop' | 'mobile'>('desktop');
  const [deleteId, setDeleteId]     = useState<string | null>(null);

  const qc = useQueryClient();
  const inv = () => { qc.invalidateQueries({ queryKey: ['admin-slides'] }); qc.invalidateQueries({ queryKey: ['slides'] }); };

  const { data: slides = [], isLoading } = useQuery({ queryKey: ['admin-slides', filterPage], queryFn: () => slidesApi.getAll(filterPage) });

  const save   = useMutation({ mutationFn: (d: any) => d._id ? slidesApi.update(d._id, d) : slidesApi.create(d), onSuccess: () => { inv(); toast.success('Saved!'); setShowForm(false); }, onError: () => toast.error('Failed') });
  const remove = useMutation({ mutationFn: slidesApi.delete, onSuccess: () => { inv(); toast.success('Deleted'); setDeleteId(null); } });
  const toggle = useMutation({ mutationFn: ({ id, d }: any) => slidesApi.update(id, d), onSuccess: () => inv() });

  const up = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <AdminHeader title="Slides / CMS" subtitle="Manage all page content sections" action={<AddBtn onClick={() => { setForm(emptySlide(filterPage)); setShowForm(true); }} />} />

      {/* Page Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PAGES.map(p => (
          <button key={p} onClick={() => setFilterPage(p)}
            className="px-4 py-2 text-[0.65rem] tracking-[0.1em] uppercase capitalize transition-all font-semibold"
            style={{ borderRadius: '4px', background: filterPage === p ? '#e91e8c' : 'rgba(255,255,255,0.05)', color: filterPage === p ? '#ffffff' : 'rgba(255,255,255,0.5)', border: `1px solid ${filterPage === p ? '#e91e8c' : 'rgba(255,255,255,0.1)'}` }}>
            {p}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({length:4}).map((_,i) => <div key={i} className="h-16 shimmer" style={{ borderRadius: '2px' }} />)}</div>
      ) : slides.length === 0 ? (
        <div className="text-center py-16 border" style={{ borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
          <p className="font-mono text-[0.58rem] tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>No slides for "{filterPage}"</p>
          <AddBtn onClick={() => { setForm(emptySlide(filterPage)); setShowForm(true); }} label="Add First Slide" />
        </div>
      ) : (
        <div className="space-y-2">
          {slides.map((slide: any) => (
            <motion.div key={slide._id} layout
              className="flex items-center gap-4 px-4 py-3 border transition-all"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: slide.isActive ? 'rgba(201,169,110,0.15)' : 'rgba(0,0,0,0.06)', borderRadius: '2px' }}>
              <span className="font-mono text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>⋮⋮</span>
              {slide.imageUrl && <img src={imgUrl(slide.imageUrl)} alt="" className="w-14 h-10 object-cover flex-shrink-0" style={{ borderRadius: '2px', filter: 'grayscale(30%)' }} />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-[0.82rem] font-medium truncate">{slide.title?.text || '(No title)'}</span>
                  <StatusBadge status={slide.isActive ? 'active' : 'inactive'} />
                  <span className="font-mono text-[0.48rem] tracking-[0.12em] uppercase px-1.5 py-0.5 capitalize" style={{ color: 'var(--c-gold)', background: 'rgba(201,169,110,0.08)', borderRadius: '2px' }}>{slide.page}</span>
                  <span className="font-mono text-[0.46rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>{slide.position}</span>
                </div>
                {slide.subtitle?.text && <p className="text-[0.7rem] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{slide.subtitle.text}</p>}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => toggle.mutate({ id: slide._id, d: { isActive: !slide.isActive } })}
                  className="px-3 py-1.5 font-mono text-[0.5rem] tracking-[0.12em] uppercase border transition-all"
                  style={{ borderColor: slide.isActive ? 'rgba(74,222,128,0.25)' : 'rgba(0,0,0,0.08)', color: slide.isActive ? '#4ade80' : 'rgba(0,0,0,0.35)', borderRadius: '2px' }}>
                  {slide.isActive ? '● On' : '○ Off'}
                </button>
                <button onClick={() => { setForm({ ...slide }); setShowForm(true); }}
                  className="px-3 py-1.5 font-mono text-[0.5rem] tracking-[0.12em] uppercase border transition-all"
                  style={{ borderColor: 'rgba(201,169,110,0.2)', color: 'var(--c-gold)', borderRadius: '2px' }} data-hover>Edit</button>
                <button onClick={() => setDeleteId(slide._id)}
                  className="px-3 py-1.5 font-mono text-[0.5rem] tracking-[0.12em] uppercase border transition-all"
                  style={{ borderColor: 'rgba(214,58,47,0.2)', color: '#d63a2f', borderRadius: '2px' }} data-hover>Del</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Drawer */}
      <FormDrawer open={showForm} onClose={() => setShowForm(false)} title={form?._id ? 'Edit Slide' : 'Add Slide'} onSave={() => save.mutate(form)} saving={save.isPending}>
        {form && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Page">
                <select value={form.page} onChange={e => up('page', e.target.value)} className="input-field capitalize">
                  {PAGES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                </select>
              </Field>
              <Field label="Order">
                <input type="number" value={form.order} onChange={e => up('order', +e.target.value)} className="input-field" />
              </Field>
            </div>

            <TextStyleEditor label="Mini Title" value={form.miniTitle} onChange={v => up('miniTitle', v)} />

            {/* Per-word color picker for miniTitle */}
            <div className="border p-4 space-y-3" style={{ borderColor: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
              <p className="font-mono text-[0.52rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>
                ✦ Mini Title — Per Word Colors
              </p>
              <MiniTitleWordEditor
                text={form.miniTitle?.text || ''}
                words={form.miniTitleWords || []}
                onChange={v => up('miniTitleWords', v)}
              />
            </div>
            <TextStyleEditor label="Title"      value={form.title}     onChange={v => up('title', v)} />
            <TextStyleEditor label="Subtitle"   value={form.subtitle}  onChange={v => up('subtitle', v)} />
            <TextStyleEditor label="Paragraph"  value={form.paragraph} onChange={v => up('paragraph', v)} />

            <PositionPicker value={form.position} onChange={v => up('position', v)} />

            <Field label="Background Image — Desktop">
              <div className="flex gap-2">
                <input value={form.imageUrl} onChange={e => up('imageUrl', e.target.value)} placeholder="URL or pick from library…" className="input-field flex-1 text-[0.8rem]" />
                <button type="button" onClick={() => { setMediaTarget('desktop'); setShowMedia(true); }} className="px-4 py-2.5 font-mono text-[0.55rem] tracking-[0.15em] uppercase border transition-all" style={{ borderColor: 'rgba(201,169,110,0.25)', color: 'var(--c-gold)', borderRadius: '2px' }} data-hover>Pick</button>
              </div>
              {form.imageUrl && (
                <div className="mt-2 relative group">
                  <img src={imgUrl(form.imageUrl)} alt="Desktop preview" className="h-24 w-full object-cover" style={{ borderRadius: '2px', filter: 'grayscale(20%)' }} />
                  <button type="button" onClick={() => { up('imageUrl', ''); up('imageId', ''); }} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 px-2 py-0.5 font-mono text-[0.5rem] uppercase transition-all" style={{ background: 'rgba(214,58,47,0.85)', color: '#fff', borderRadius: '2px' }}>Remove</button>
                  <span className="absolute bottom-1 left-1 font-mono text-[0.45rem] tracking-[0.1em] uppercase px-1.5 py-0.5" style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.7)', borderRadius: '2px' }}>🖥 Desktop</span>
                </div>
              )}
            </Field>

            <Field label="Background Image — Mobile">
              <div className="flex gap-2">
                <input value={form.mobileImageUrl || ''} onChange={e => up('mobileImageUrl', e.target.value)} placeholder="Leave blank to use desktop image on mobile…" className="input-field flex-1 text-[0.8rem]" />
                <button type="button" onClick={() => { setMediaTarget('mobile'); setShowMedia(true); }} className="px-4 py-2.5 font-mono text-[0.55rem] tracking-[0.15em] uppercase border transition-all" style={{ borderColor: 'rgba(233,30,140,0.3)', color: '#e91e8c', borderRadius: '2px' }} data-hover>Pick</button>
              </div>
              {form.mobileImageUrl ? (
                <div className="mt-2 relative group">
                  <img src={imgUrl(form.mobileImageUrl)} alt="Mobile preview" className="h-24 w-full object-cover" style={{ borderRadius: '2px', filter: 'grayscale(20%)' }} />
                  <button type="button" onClick={() => { up('mobileImageUrl', ''); up('mobileImageId', ''); }} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 px-2 py-0.5 font-mono text-[0.5rem] uppercase transition-all" style={{ background: 'rgba(214,58,47,0.85)', color: '#fff', borderRadius: '2px' }}>Remove</button>
                  <span className="absolute bottom-1 left-1 font-mono text-[0.45rem] tracking-[0.1em] uppercase px-1.5 py-0.5" style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.7)', borderRadius: '2px' }}>📱 Mobile</span>
                </div>
              ) : (
                <p className="mt-1.5 font-mono text-[0.5rem] tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  ℹ️ No mobile image set — desktop image will be used as fallback
                </p>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="BG Color">
                <div className="flex gap-2">
                  <input type="color" value={form.bgColor || '#080808'} onChange={e => up('bgColor', e.target.value)} className="w-10 h-10 border-0 bg-transparent cursor-pointer" />
                  <input value={form.bgColor || ''} onChange={e => up('bgColor', e.target.value)} className="input-field flex-1 text-[0.78rem]" placeholder="#080808" />
                </div>
              </Field>
              <Field label="BG Gradient">
                <input value={form.bgGradient || ''} onChange={e => up('bgGradient', e.target.value)} className="input-field text-[0.78rem]" placeholder="linear-gradient(…)" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Link URL"><input value={form.linkUrl || ''} onChange={e => up('linkUrl', e.target.value)} className="input-field text-[0.82rem]" placeholder="/portfolio" /></Field>
              <Field label="Link Text"><input value={form.linkText || ''} onChange={e => up('linkText', e.target.value)} className="input-field text-[0.82rem]" placeholder="View Work" /></Field>
            </div>

            <Field label="Overlay Opacity (0–1)">
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="1" step="0.05" value={form.overlayOpacity || 0.5} onChange={e => up('overlayOpacity', +e.target.value)} className="flex-1" />
                <span className="font-mono text-[0.65rem] w-8 text-right">{form.overlayOpacity || 0.5}</span>
              </div>
            </Field>

            <Toggle label="Active / Visible" checked={!!form.isActive} onChange={v => up('isActive', v)} />
          </>
        )}
      </FormDrawer>

      {showMedia && <MediaPicker onSelect={(url, id) => {
        if (mediaTarget === 'mobile') {
          up('mobileImageUrl', url);
          up('mobileImageId', id || '');
        } else {
          up('imageUrl', url);
          up('imageId', id || '');
        }
        setShowMedia(false);
      }} onClose={() => setShowMedia(false)} type="image" />}
      <ConfirmDelete open={!!deleteId} label="slide" onConfirm={() => deleteId && remove.mutate(deleteId)} onCancel={() => setDeleteId(null)} />
    </div>
  );
}

