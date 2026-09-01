'use client';
// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN BLOGS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { blogsApi, blogCatsApi, servicesApi, imgUrl } from '@/lib/api';
import { AdminHeader, AddBtn, FormDrawer, Field, Toggle, ConfirmDelete, MediaPicker, StatusBadge } from '@/components/admin/AdminComponents';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const emptyBlog = () => ({ title: '', category: '', excerpt: '', content: '', coverImage: { url: '', id: '' }, author: 'Studio Jatin', tags: [], isPublished: false, isFeatured: false, linkedServices: [], seo: { metaTitle: '', metaDescription: '' } });

export default function AdminBlogs() {
  const [form, setForm]         = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ['admin-blogs'] });

  const { data: blogs = [], isLoading } = useQuery({ queryKey: ['admin-blogs'], queryFn: blogsApi.getAll });
  const { data: cats  = [] }            = useQuery({ queryKey: ['blog-cats'],   queryFn: blogCatsApi.getAll });
  const { data: allServices = [] }      = useQuery({ queryKey: ['services'],    queryFn: servicesApi.getAll });

  const save   = useMutation({ mutationFn: (d: any) => d._id ? blogsApi.update(d._id, d) : blogsApi.create(d), onSuccess: () => { inv(); toast.success('Saved!'); setShowForm(false); }, onError: () => toast.error('Failed') });
  const remove = useMutation({ mutationFn: blogsApi.delete, onSuccess: () => { inv(); toast.success('Deleted'); setDeleteId(null); } });

  const up = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const addTag = () => { if (tagInput.trim()) { up('tags', [...(form.tags||[]), tagInput.trim()]); setTagInput(''); } };
  const toggleService = (svcId: string) => {
    const cur = form.linkedServices || [];
    up('linkedServices', cur.includes(svcId) ? cur.filter((id: string) => id !== svcId) : [...cur, svcId]);
  };

  return (
    <div>
      <AdminHeader title="Blog / Journal" subtitle={`${blogs.length} posts`} action={<AddBtn onClick={() => { setForm(emptyBlog()); setShowForm(true); }} label="New Post" />} />

      <div className="border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
        {isLoading ? (
          <div className="p-4 space-y-2">{Array.from({length:5}).map((_,i) => <div key={i} className="h-14 shimmer" style={{ borderRadius: '2px' }} />)}</div>
        ) : blogs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-mono text-[0.58rem] tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>No blog posts yet</p>
            <AddBtn onClick={() => { setForm(emptyBlog()); setShowForm(true); }} label="Write First Post" />
          </div>
        ) : blogs.map((b: any) => (
          <div key={b._id} className="flex items-center gap-4 px-5 py-4 border-b last:border-0 transition-colors"
            style={{ borderColor: 'rgba(0,0,0,0.03)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.02)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
            <div className="w-14 h-10 flex-shrink-0 overflow-hidden" style={{ background: '#1a1a1a', borderRadius: '2px' }}>
              {b.coverImage?.url && <img src={imgUrl(b.coverImage.url)} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-[0.82rem] font-medium truncate">{b.title}</span>
                <StatusBadge status={b.isPublished ? 'published' : 'draft'} />
                {b.isFeatured && <span className="font-mono text-[0.44px] px-1.5 py-0.5 uppercase" style={{ color: 'var(--c-gold)', background: 'rgba(201,169,110,0.08)', borderRadius: '2px', fontSize: '0.44rem' }}>Featured</span>}
              </div>
              <div className="flex items-center gap-3">
                {b.category?.name && <span className="font-mono text-[0.5rem] tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>{b.category.name}</span>}
                <span className="font-mono text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.25)' }}>{b.createdAt ? format(new Date(b.createdAt), 'MMM d, yyyy') : ''}</span>
                <span className="font-mono text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.25)' }}>{b.views || 0} views</span>
              </div>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={() => { setForm({ ...b, category: b.category?._id || b.category, linkedServices: (b.linkedServices || []).map((s: any) => s._id || s) }); setShowForm(true); }} className="px-3 py-1.5 font-mono text-[0.48rem] tracking-[0.12em] uppercase border transition-all" style={{ borderColor: 'rgba(201,169,110,0.2)', color: 'var(--c-gold)', borderRadius: '2px' }}>Edit</button>
              <button onClick={() => setDeleteId(b._id)} className="px-3 py-1.5 font-mono text-[0.48rem] tracking-[0.12em] uppercase border transition-all" style={{ borderColor: 'rgba(214,58,47,0.2)', color: '#d63a2f', borderRadius: '2px' }}>Del</button>
            </div>
          </div>
        ))}
      </div>

      <FormDrawer open={showForm} onClose={() => setShowForm(false)} title={form?._id ? 'Edit Post' : 'New Post'} onSave={() => save.mutate(form)} saving={save.isPending}>
        {form && (
          <>
            <Field label="Title *"><input required value={form.title} onChange={e => up('title', e.target.value)} className="input-field" placeholder="Post title…" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category">
                <select value={form.category || ''} onChange={e => up('category', e.target.value)} className="input-field">
                  <option value="">Select…</option>
                  {cats.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Author"><input value={form.author || ''} onChange={e => up('author', e.target.value)} className="input-field" /></Field>
            </div>
            <Field label="Excerpt"><textarea value={form.excerpt || ''} onChange={e => up('excerpt', e.target.value)} rows={2} className="input-field resize-none" placeholder="Brief summary…" /></Field>
            <Field label="Content *"><textarea required value={form.content || ''} onChange={e => up('content', e.target.value)} rows={8} className="input-field resize-none font-mono text-[0.78rem]" placeholder="Write your article here…" /></Field>
            <Field label="Cover Image">
              <div className="flex gap-2">
                <input value={form.coverImage?.url || ''} onChange={e => up('coverImage', { ...form.coverImage, url: e.target.value })} placeholder="URL or pick…" className="input-field flex-1 text-[0.8rem]" />
                <button type="button" onClick={() => setShowMedia(true)} className="px-4 py-2.5 font-mono text-[0.55rem] border" style={{ borderColor: 'rgba(201,169,110,0.25)', color: 'var(--c-gold)', borderRadius: '2px' }} data-hover>Pick</button>
              </div>
              {form.coverImage?.url && <img src={imgUrl(form.coverImage.url)} alt="" className="mt-2 h-20 w-full object-cover" style={{ borderRadius: '2px' }} />}
            </Field>
            <div>
              <label className="block font-mono text-[0.52rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Tags</label>
              <div className="flex gap-2 mb-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag…" className="input-field flex-1 py-2 text-[0.8rem]" />
                <button type="button" onClick={addTag} className="px-4 py-2 font-mono text-[0.55rem] border" style={{ borderColor: 'rgba(201,169,110,0.25)', color: 'var(--c-gold)', borderRadius: '2px' }}>Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(form.tags||[]).map((t: string, i: number) => (
                  <span key={i} className="flex items-center gap-1.5 font-mono text-[0.5rem] tracking-[0.12em] uppercase px-2 py-1 border" style={{ borderColor: 'rgba(201,169,110,0.2)', color: 'var(--c-gold)', borderRadius: '2px' }}>
                    {t}<button type="button" onClick={() => up('tags', form.tags.filter((_: any, j: number) => j !== i))} style={{ color: 'rgba(201,169,110,0.5)' }}>✕</button>
                  </span>
                ))}
              </div>
            </div>
            {/* ── Link to Services ── */}
            <Field label="Link to Services (multi-select)">
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {(allServices as any[]).map((svc: any) => {
                  const linked = (form.linkedServices || []).includes(svc._id);
                  return (
                    <button key={svc._id} type="button" onClick={() => toggleService(svc._id)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left transition-all"
                      style={{ borderRadius: '4px', background: linked ? 'rgba(233,30,140,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${linked ? 'rgba(233,30,140,0.35)' : 'rgba(255,255,255,0.07)'}` }}>
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0" style={{ borderRadius: '3px', border: `2px solid ${linked ? '#e91e8c' : 'rgba(255,255,255,0.2)'}`, background: linked ? '#e91e8c' : 'transparent' }}>
                        {linked && <span className="text-white" style={{ fontSize: '0.55rem', lineHeight: 1 }}>✓</span>}
                      </div>
                      <span className="text-[0.78rem] font-medium" style={{ color: linked ? '#e91e8c' : 'rgba(255,255,255,0.7)' }}>{svc.name}</span>
                      {svc.category && <span className="ml-auto font-mono text-[0.46rem] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>{svc.category}</span>}
                    </button>
                  );
                })}
              </div>
              {(form.linkedServices || []).length > 0 && (
                <p className="mt-1.5 font-mono text-[0.5rem]" style={{ color: '#e91e8c' }}>{(form.linkedServices || []).length} linked</p>
              )}
            </Field>

            <div className="flex flex-wrap gap-4">
              <Toggle label="Published"  checked={!!form.isPublished} onChange={v => up('isPublished', v)} color="#4ade80" />
              <Toggle label="Featured"   checked={!!form.isFeatured}  onChange={v => up('isFeatured', v)}  color="#c9a96e" />
            </div>
          </>
        )}
      </FormDrawer>

      {showMedia && <MediaPicker type="image" onSelect={(url, id) => { up('coverImage', { url: url.replace(process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:5000', ''), id: id || '' }); setShowMedia(false); }} onClose={() => setShowMedia(false)} />}
      <ConfirmDelete open={!!deleteId} label="blog post" onConfirm={() => deleteId && remove.mutate(deleteId)} onCancel={() => setDeleteId(null)} />
    </div>
  );
}

