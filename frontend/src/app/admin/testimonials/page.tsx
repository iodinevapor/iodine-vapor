'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { testimonialsApi, imgUrl } from '@/lib/api';
import { AdminHeader, AddBtn, FormDrawer, Field, Toggle, ConfirmDelete, MediaPicker } from '@/components/admin/AdminComponents';
import toast from 'react-hot-toast';

const empty = () => ({ name: '', company: '', role: '', content: '', rating: 5, imageUrl: '', isActive: true, isFeatured: false, order: 0 });

export default function AdminTestimonials() {
  const [form, setForm]         = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ['admin-testimonials'] });

  const { data: testimonials = [], isLoading } = useQuery({ queryKey: ['admin-testimonials'], queryFn: testimonialsApi.getAll });

  const save   = useMutation({ mutationFn: (d: any) => d._id ? testimonialsApi.update(d._id, d) : testimonialsApi.create(d), onSuccess: () => { inv(); toast.success('Saved!'); setShowForm(false); }, onError: () => toast.error('Failed') });
  const remove = useMutation({ mutationFn: testimonialsApi.delete, onSuccess: () => { inv(); toast.success('Deleted'); setDeleteId(null); } });

  const up = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <AdminHeader title="Testimonials" subtitle="Client reviews & feedback" action={<AddBtn onClick={() => { setForm(empty()); setShowForm(true); }} />} />

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 shimmer" style={{ borderRadius: '2px' }} />)}</div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-16 border" style={{ borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
          <p className="font-mono text-[0.58rem] tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>No testimonials yet</p>
          <AddBtn onClick={() => { setForm(empty()); setShowForm(true); }} label="Add First Testimonial" />
        </div>
      ) : (
        <div className="space-y-2">
          {testimonials.map((t: any) => (
            <motion.div key={t._id} layout
              className="flex items-start gap-4 px-5 py-4 border transition-all"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: t.isActive ? 'rgba(201,169,110,0.12)' : 'rgba(0,0,0,0.06)', borderRadius: '2px' }}>
              {t.imageUrl && <img src={imgUrl(t.imageUrl)} alt={t.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[0.85rem] font-medium">{t.name}</span>
                  {t.isFeatured && <span className="font-mono text-[0.44rem] tracking-[0.1em] uppercase px-1.5 py-0.5" style={{ background: 'rgba(201,169,110,0.1)', color: 'var(--c-gold)', borderRadius: '2px' }}>Featured</span>}
                  <span className={`font-mono text-[0.44rem] tracking-[0.1em] uppercase px-1.5 py-0.5`}
                    style={{ background: t.isActive ? 'rgba(74,222,128,0.08)' : 'rgba(0,0,0,0.03)', color: t.isActive ? '#4ade80' : 'rgba(0,0,0,0.35)', borderRadius: '2px' }}>
                    {t.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-[0.7rem] mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.role}{t.company && `, ${t.company}`}</p>
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ color: i < t.rating ? 'var(--c-gold)' : 'rgba(0,0,0,0.1)', fontSize: '0.7rem' }}>★</span>)}
                </div>
                <p className="text-[0.75rem] line-clamp-2" style={{ color: 'rgba(255,255,255,0.45)' }}>"{t.content}"</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => { setForm({ ...t }); setShowForm(true); }}
                  className="px-3 py-1.5 font-mono text-[0.5rem] tracking-[0.12em] uppercase border transition-all"
                  style={{ borderColor: 'rgba(201,169,110,0.2)', color: 'var(--c-gold)', borderRadius: '2px' }} data-hover>Edit</button>
                <button onClick={() => setDeleteId(t._id)}
                  className="px-3 py-1.5 font-mono text-[0.5rem] tracking-[0.12em] uppercase border transition-all"
                  style={{ borderColor: 'rgba(214,58,47,0.2)', color: '#d63a2f', borderRadius: '2px' }} data-hover>Del</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <FormDrawer open={showForm} onClose={() => setShowForm(false)} title={form?._id ? 'Edit Testimonial' : 'Add Testimonial'} onSave={() => save.mutate(form)} saving={save.isPending}>
        {form && (
          <>
            <Field label="Name" required>
              <input value={form.name} onChange={e => up('name', e.target.value)} className="input-field" placeholder="Client name" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Role">
                <input value={form.role} onChange={e => up('role', e.target.value)} className="input-field" placeholder="CEO, Manager…" />
              </Field>
              <Field label="Company">
                <input value={form.company} onChange={e => up('company', e.target.value)} className="input-field" placeholder="Company name" />
              </Field>
            </div>
            <Field label="Testimonial Content" required>
              <textarea value={form.content} onChange={e => up('content', e.target.value)} className="input-field resize-none" rows={4} placeholder="What the client said…" />
            </Field>
            <Field label="Rating">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(r => (
                  <button key={r} type="button" onClick={() => up('rating', r)}
                    className="text-[1.3rem] transition-all"
                    style={{ color: r <= form.rating ? 'var(--c-gold)' : 'rgba(255,255,255,0.15)' }}>★</button>
                ))}
              </div>
            </Field>
            <Field label="Photo">
              <div className="flex gap-2">
                <input value={form.imageUrl} onChange={e => up('imageUrl', e.target.value)} className="input-field flex-1 text-[0.8rem]" placeholder="URL or pick…" />
                <button type="button" onClick={() => setShowMedia(true)} className="px-4 py-2.5 font-mono text-[0.55rem] tracking-[0.15em] uppercase border" style={{ borderColor: 'rgba(201,169,110,0.25)', color: 'var(--c-gold)', borderRadius: '2px' }} data-hover>Pick</button>
              </div>
              {form.imageUrl && <img src={imgUrl(form.imageUrl)} alt="" className="mt-2 w-16 h-16 rounded-full object-cover" />}
            </Field>
            <Field label="Order">
              <input type="number" value={form.order} onChange={e => up('order', +e.target.value)} className="input-field w-24" />
            </Field>
            <Toggle label="Featured" checked={!!form.isFeatured} onChange={v => up('isFeatured', v)} />
            <Toggle label="Active / Visible" checked={!!form.isActive} onChange={v => up('isActive', v)} />
          </>
        )}
      </FormDrawer>

      {showMedia && <MediaPicker onSelect={(url) => { up('imageUrl', url); setShowMedia(false); }} onClose={() => setShowMedia(false)} type="image" />}
      <ConfirmDelete open={!!deleteId} label="testimonial" onConfirm={() => deleteId && remove.mutate(deleteId)} onCancel={() => setDeleteId(null)} />
    </div>
  );
}

