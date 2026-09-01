'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workshopsApi, wsCatsApi, imgUrl } from '@/lib/api';
import { AdminHeader, AddBtn, FormDrawer, Field, Toggle, ConfirmDelete, MediaPicker, StatusBadge } from '@/components/admin/AdminComponents';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const empty = () => ({ title: '', category: '', description: '', content: '', coverImage: { url: '', id: '' }, date: '', duration: '', location: '', seats: 20, price: 0, isFree: false, isOnline: false, isFeatured: false, isActive: true });

export default function AdminWorkshops() {
  const [form, setForm]         = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ['admin-workshops'] });

  const { data: workshops = [], isLoading } = useQuery({ queryKey: ['admin-workshops'], queryFn: workshopsApi.getAll });
  const { data: cats = [] }                 = useQuery({ queryKey: ['ws-cats'],         queryFn: wsCatsApi.getAll });

  const save   = useMutation({ mutationFn: (d: any) => d._id ? workshopsApi.update(d._id, d) : workshopsApi.create(d), onSuccess: () => { inv(); toast.success('Saved!'); setShowForm(false); }, onError: () => toast.error('Failed') });
  const remove = useMutation({ mutationFn: workshopsApi.delete, onSuccess: () => { inv(); toast.success('Deleted'); setDeleteId(null); } });

  const up = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <AdminHeader title="Workshops" subtitle={`${workshops.length} workshops`} action={<AddBtn onClick={() => { setForm(empty()); setShowForm(true); }} label="New Workshop" />} />

      <div className="border divide-y" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
        {isLoading ? Array.from({length:4}).map((_,i) => <div key={i} className="h-16 shimmer mx-4 my-2" style={{ borderRadius: '2px' }} />) :
        workshops.length === 0 ? (
          <div className="p-12 text-center"><p className="font-mono text-[0.58rem] tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>No workshops yet</p><AddBtn onClick={() => { setForm(empty()); setShowForm(true); }} label="Add First Workshop" /></div>
        ) : workshops.map((w: any) => (
          <div key={w._id} className="flex items-center gap-4 px-5 py-4 transition-colors" style={{ borderColor: 'rgba(0,0,0,0.03)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.02)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
            <div className="w-14 h-10 flex-shrink-0 overflow-hidden" style={{ background: '#1a1a1a', borderRadius: '2px' }}>
              {w.coverImage?.url && <img src={imgUrl(w.coverImage.url)} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-[0.82rem] font-medium">{w.title}</span>
                <StatusBadge status={w.isActive ? 'active' : 'inactive'} />
                {w.isFree && <span className="font-mono text-[0.44rem] px-1.5 py-0.5 uppercase" style={{ color: '#4ade80', background: 'rgba(74,222,128,0.08)', borderRadius: '2px' }}>Free</span>}
              </div>
              <div className="flex items-center gap-3">
                {w.date && <span className="font-mono text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>{format(new Date(w.date), 'MMM d, yyyy')}</span>}
                {w.location && <span className="font-mono text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>📍 {w.location}</span>}
                <span className="font-mono text-[0.5rem]" style={{ color: 'var(--c-gold)' }}>{w.isFree ? 'Free' : `₹${w.price}`}</span>
                <span className="font-mono text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>{w.registrations?.length || 0} registered</span>
              </div>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={() => { setForm({ ...w, category: w.category?._id || w.category, date: w.date ? format(new Date(w.date), 'yyyy-MM-dd') : '' }); setShowForm(true); }} className="px-3 py-1.5 font-mono text-[0.48rem] border" style={{ borderColor: 'rgba(201,169,110,0.2)', color: 'var(--c-gold)', borderRadius: '2px' }}>Edit</button>
              <button onClick={() => setDeleteId(w._id)} className="px-3 py-1.5 font-mono text-[0.48rem] border" style={{ borderColor: 'rgba(214,58,47,0.2)', color: '#d63a2f', borderRadius: '2px' }}>Del</button>
            </div>
          </div>
        ))}
      </div>

      <FormDrawer open={showForm} onClose={() => setShowForm(false)} title={form?._id ? 'Edit Workshop' : 'New Workshop'} onSave={() => save.mutate(form)} saving={save.isPending}>
        {form && (
          <>
            <Field label="Title *"><input required value={form.title} onChange={e => up('title', e.target.value)} className="input-field" placeholder="Workshop title…" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category">
                <select value={form.category || ''} onChange={e => up('category', e.target.value)} className="input-field">
                  <option value="">Select…</option>
                  {cats.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Date"><input type="date" value={form.date || ''} onChange={e => up('date', e.target.value)} className="input-field" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Duration"><input value={form.duration || ''} onChange={e => up('duration', e.target.value)} className="input-field" placeholder="e.g. 2 days" /></Field>
              <Field label="Location"><input value={form.location || ''} onChange={e => up('location', e.target.value)} className="input-field" placeholder="City or Online" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Seats"><input type="number" value={form.seats || 0} onChange={e => up('seats', +e.target.value)} className="input-field" /></Field>
              <Field label="Price (₹)"><input type="number" value={form.price || 0} onChange={e => up('price', +e.target.value)} className="input-field" disabled={form.isFree} /></Field>
            </div>
            <Field label="Description"><textarea value={form.description || ''} onChange={e => up('description', e.target.value)} rows={3} className="input-field resize-none" placeholder="Brief description…" /></Field>
            <Field label="Cover Image">
              <div className="flex gap-2">
                <input value={form.coverImage?.url || ''} onChange={e => up('coverImage', { ...form.coverImage, url: e.target.value })} placeholder="URL or pick…" className="input-field flex-1 text-[0.8rem]" />
                <button type="button" onClick={() => setShowMedia(true)} className="px-4 py-2.5 font-mono text-[0.55rem] border" style={{ borderColor: 'rgba(201,169,110,0.25)', color: 'var(--c-gold)', borderRadius: '2px' }}>Pick</button>
              </div>
              {form.coverImage?.url && <img src={imgUrl(form.coverImage.url)} alt="" className="mt-2 h-20 w-full object-cover" style={{ borderRadius: '2px' }} />}
            </Field>
            <div className="flex flex-wrap gap-4">
              <Toggle label="Free"     checked={!!form.isFree}     onChange={v => up('isFree', v)}     color="#4ade80" />
              <Toggle label="Online"   checked={!!form.isOnline}   onChange={v => up('isOnline', v)}   color="#60a5fa" />
              <Toggle label="Featured" checked={!!form.isFeatured} onChange={v => up('isFeatured', v)} color="#c9a96e" />
              <Toggle label="Active"   checked={!!form.isActive}   onChange={v => up('isActive', v)}   color="#4ade80" />
            </div>
          </>
        )}
      </FormDrawer>

      {showMedia && <MediaPicker type="image" onSelect={(url, id) => { up('coverImage', { url: url.replace(process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:5000', ''), id: id || '' }); setShowMedia(false); }} onClose={() => setShowMedia(false)} />}
      <ConfirmDelete open={!!deleteId} label="workshop" onConfirm={() => deleteId && remove.mutate(deleteId)} onCancel={() => setDeleteId(null)} />
    </div>
  );
}

