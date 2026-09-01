'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { portfolioApi, servicesApi, imgUrl } from '@/lib/api';
import { AdminHeader, AddBtn, FormDrawer, Field, Toggle, ConfirmDelete, MediaPicker, StatusBadge } from '@/components/admin/AdminComponents';
import toast from 'react-hot-toast';

const CATS = ['architecture','product','brand','event','aerial','portrait','education'];
const empty = () => ({ title: '', category: 'architecture', imageUrl: '', imageId: '', videoUrl: '', description: '', client: '', year: new Date().getFullYear().toString(), isFeatured: false, order: 0, isActive: true, linkedServices: [] });

export default function AdminPortfolio() {
  const [form, setForm]         = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [filterCat, setFilterCat] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ['portfolio'] });

  const { data: items = [], isLoading } = useQuery({ queryKey: ['portfolio', filterCat], queryFn: () => portfolioApi.getAll() });
  const { data: allServices = [] } = useQuery({ queryKey: ['services'], queryFn: servicesApi.getAll });
  const filtered = filterCat ? items.filter((i: any) => i.category === filterCat) : items;

  const save   = useMutation({ mutationFn: (d: any) => d._id ? portfolioApi.update(d._id, d) : portfolioApi.create(d), onSuccess: () => { inv(); toast.success('Saved!'); setShowForm(false); }, onError: () => toast.error('Failed') });
  const remove = useMutation({ mutationFn: portfolioApi.delete, onSuccess: () => { inv(); toast.success('Deleted'); setDeleteId(null); } });

  const up = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const toggleService = (svcId: string) => {
    const current = form.linkedServices || [];
    const updated = current.includes(svcId) ? current.filter((id: string) => id !== svcId) : [...current, svcId];
    up('linkedServices', updated);
  };

  return (
    <div>
      <AdminHeader title="Portfolio" subtitle={`${items.length} items`} action={<AddBtn onClick={() => { setForm(empty()); setShowForm(true); }} />} />

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilterCat('')}
          className="px-4 py-2 font-mono text-[0.54rem] tracking-[0.15em] uppercase transition-all"
          style={{ borderRadius: '2px', background: !filterCat ? 'var(--c-gold)' : 'rgba(0,0,0,0.03)', color: !filterCat ? '#080808' : 'rgba(0,0,0,0.4)', border: `1px solid ${!filterCat ? 'var(--c-gold)' : 'rgba(0,0,0,0.08)'}` }}>
          All
        </button>
        {CATS.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className="px-4 py-2 font-mono text-[0.54rem] tracking-[0.15em] uppercase capitalize transition-all"
            style={{ borderRadius: '2px', background: filterCat === cat ? 'var(--c-gold)' : 'rgba(0,0,0,0.03)', color: filterCat === cat ? '#080808' : 'rgba(0,0,0,0.4)', border: `1px solid ${filterCat === cat ? 'var(--c-gold)' : 'rgba(0,0,0,0.08)'}` }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({length:8}).map((_,i) => <div key={i} className="aspect-square shimmer" style={{ borderRadius: '2px' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border" style={{ borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
          <p className="font-mono text-[0.58rem] tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>No portfolio items</p>
          <AddBtn onClick={() => { setForm(empty()); setShowForm(true); }} label="Add First Item" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item: any) => (
            <motion.div key={item._id} layout className="group relative overflow-hidden" style={{ borderRadius: '2px' }}>
              <div className="aspect-square overflow-hidden bg-bg-3">
                {item.imageUrl ? (
                  <img src={imgUrl(item.imageUrl)} alt={item.title} className="w-full h-full object-cover" style={{ filter: 'grayscale(20%)', transition: 'transform 0.5s, filter 0.4s' }}
                    onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.05)'; (e.target as HTMLImageElement).style.filter = 'grayscale(0%)'; }}
                    onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; (e.target as HTMLImageElement).style.filter = 'grayscale(20%)'; }}
                  />
                ) : <div className="w-full h-full" style={{ background: '#1a1a1a' }} />}
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3"
                style={{ background: 'linear-gradient(0deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.1) 60%)' }}>
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => { setForm({ ...item, linkedServices: (item.linkedServices || []).map((s: any) => s._id || s) }); setShowForm(true); }}
                    className="px-3 py-1.5 font-mono text-[0.48rem] tracking-[0.12em] uppercase"
                    style={{ background: 'rgba(201,169,110,0.15)', color: 'var(--c-gold)', borderRadius: '2px' }}>Edit</button>
                  <button onClick={() => setDeleteId(item._id)}
                    className="px-3 py-1.5 font-mono text-[0.48rem] tracking-[0.12em] uppercase"
                    style={{ background: 'rgba(214,58,47,0.15)', color: '#d63a2f', borderRadius: '2px' }}>Del</button>
                </div>
                <div>
                  <h3 className="font-serif text-[0.85rem] leading-tight mb-1">{item.title}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[0.46rem] tracking-[0.12em] uppercase capitalize" style={{ color: 'var(--c-gold)' }}>{item.category}</span>
                    {item.isFeatured && <span className="font-mono text-[0.44rem] tracking-[0.1em] uppercase px-1.5 py-0.5" style={{ background: 'rgba(201,169,110,0.15)', color: 'var(--c-gold)', borderRadius: '2px' }}>Featured</span>}
                    <StatusBadge status={item.isActive ? 'active' : 'inactive'} />
                    {item.linkedServices?.length > 0 && (
                      <span className="font-mono text-[0.42rem] px-1.5 py-0.5" style={{ background: 'rgba(233,30,140,0.15)', color: '#e91e8c', borderRadius: '2px' }}>
                        {item.linkedServices.length} svc
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Drawer */}
      <FormDrawer open={showForm} onClose={() => setShowForm(false)} title={form?._id ? 'Edit Portfolio Item' : 'Add Portfolio Item'} onSave={() => save.mutate(form)} saving={save.isPending}>
        {form && (
          <>
            <Field label="Title *">
              <input required value={form.title} onChange={e => up('title', e.target.value)} className="input-field" placeholder="Project title…" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Category *">
                <select value={form.category} onChange={e => up('category', e.target.value)} className="input-field capitalize">
                  {CATS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </Field>
              <Field label="Year">
                <input value={form.year} onChange={e => up('year', e.target.value)} className="input-field" placeholder="2024" />
              </Field>
            </div>

            <Field label="Client">
              <input value={form.client || ''} onChange={e => up('client', e.target.value)} className="input-field" placeholder="Client name…" />
            </Field>

            <Field label="Image *">
              <div className="flex gap-2">
                <input value={form.imageUrl} onChange={e => up('imageUrl', e.target.value)} placeholder="URL or pick from library…" className="input-field flex-1 text-[0.8rem]" />
                <button type="button" onClick={() => setShowMedia(true)} className="px-4 py-2.5 font-mono text-[0.55rem] tracking-[0.15em] uppercase border transition-all" style={{ borderColor: 'rgba(201,169,110,0.25)', color: 'var(--c-gold)', borderRadius: '2px' }} data-hover>Pick</button>
              </div>
              {form.imageUrl && <img src={imgUrl(form.imageUrl)} alt="" className="mt-2 h-28 w-full object-cover" style={{ borderRadius: '2px', filter: 'grayscale(20%)' }} />}
            </Field>

            <Field label="Video URL (optional)">
              <input value={form.videoUrl || ''} onChange={e => up('videoUrl', e.target.value)} className="input-field text-[0.82rem]" placeholder="https://youtube.com/embed/…" />
            </Field>

            <Field label="Description">
              <textarea value={form.description || ''} onChange={e => up('description', e.target.value)} rows={3} className="input-field resize-none text-[0.82rem]" placeholder="Brief project description…" />
            </Field>

            {/* ── Link to Services ── */}
            <Field label="Link to Services (multi-select)">
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {(allServices as any[]).length === 0 ? (
                  <p className="font-mono text-[0.5rem] tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.3)' }}>No services found — add services first</p>
                ) : (allServices as any[]).map((svc: any) => {
                  const linked = (form.linkedServices || []).includes(svc._id);
                  return (
                    <button key={svc._id} type="button" onClick={() => toggleService(svc._id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all"
                      style={{ borderRadius: '4px', background: linked ? 'rgba(233,30,140,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${linked ? 'rgba(233,30,140,0.35)' : 'rgba(255,255,255,0.07)'}` }}>
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0" style={{ borderRadius: '3px', border: `2px solid ${linked ? '#e91e8c' : 'rgba(255,255,255,0.2)'}`, background: linked ? '#e91e8c' : 'transparent' }}>
                        {linked && <span className="text-white" style={{ fontSize: '0.55rem', lineHeight: 1 }}>✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[0.78rem] font-medium" style={{ color: linked ? '#e91e8c' : 'rgba(255,255,255,0.7)' }}>{svc.name}</span>
                        {svc.category && <span className="ml-2 font-mono text-[0.46rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>{svc.category}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              {(form.linkedServices || []).length > 0 && (
                <p className="mt-2 font-mono text-[0.5rem] tracking-[0.1em]" style={{ color: '#e91e8c' }}>
                  {(form.linkedServices || []).length} service(s) linked
                </p>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Order">
                <input type="number" value={form.order || 0} onChange={e => up('order', +e.target.value)} className="input-field" />
              </Field>
            </div>

            <div className="flex flex-wrap gap-4">
              <Toggle label="Featured" checked={!!form.isFeatured} onChange={v => up('isFeatured', v)} color="#c9a96e" />
              <Toggle label="Active"   checked={!!form.isActive}   onChange={v => up('isActive', v)}   color="#4ade80" />
            </div>
          </>
        )}
      </FormDrawer>

      {showMedia && <MediaPicker onSelect={(url, id) => { up('imageUrl', url); up('imageId', id || ''); setShowMedia(false); }} onClose={() => setShowMedia(false)} type="image" />}
      <ConfirmDelete open={!!deleteId} label="portfolio item" onConfirm={() => deleteId && remove.mutate(deleteId)} onCancel={() => setDeleteId(null)} />
    </div>
  );
}

