'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { showcaseVideosApi, imgUrl } from '@/lib/api';
import { AdminHeader, AddBtn, FormDrawer, Field, Toggle, ConfirmDelete, MediaPicker } from '@/components/admin/AdminComponents';
import toast from 'react-hot-toast';

const emptyVideo = () => ({ title: '', videoUrl: '', videoId: '', thumbnail: '', description: '', order: 0, isActive: true });

export default function AdminVideos() {
  const [form, setForm]         = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showMedia, setShowMedia] = useState<'video' | 'thumb' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ['admin-showcase-videos'] });

  const { data: videos = [], isLoading } = useQuery({ queryKey: ['admin-showcase-videos'], queryFn: showcaseVideosApi.getAll });

  const save   = useMutation({ mutationFn: (d: any) => d._id ? showcaseVideosApi.update(d._id, d) : showcaseVideosApi.create(d), onSuccess: () => { inv(); toast.success('Saved!'); setShowForm(false); }, onError: () => toast.error('Failed') });
  const remove = useMutation({ mutationFn: showcaseVideosApi.delete, onSuccess: () => { inv(); toast.success('Deleted'); setDeleteId(null); } });
  const toggle = useMutation({ mutationFn: ({ id, d }: any) => showcaseVideosApi.update(id, d), onSuccess: () => inv() });

  const up = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <AdminHeader title="Showcase Videos" subtitle="Manage homepage video reel" action={<AddBtn onClick={() => { setForm(emptyVideo()); setShowForm(true); }} />} />

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 shimmer" style={{ borderRadius: '2px' }} />)}</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 border" style={{ borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
          <p className="font-mono text-[0.58rem] tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>No showcase videos yet</p>
          <AddBtn onClick={() => { setForm(emptyVideo()); setShowForm(true); }} label="Add First Video" />
        </div>
      ) : (
        <div className="space-y-2">
          {videos.map((video: any) => (
            <motion.div key={video._id} layout
              className="flex items-center gap-4 px-4 py-3 border transition-all"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: video.isActive ? 'rgba(201,169,110,0.15)' : 'rgba(0,0,0,0.06)', borderRadius: '2px' }}>
              {/* Thumbnail */}
              {video.thumbnail ? (
                <img src={imgUrl(video.thumbnail)} alt="" className="w-20 h-12 object-cover flex-shrink-0" style={{ borderRadius: '2px', filter: 'grayscale(20%)' }} />
              ) : (
                <div className="w-20 h-12 flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '2px' }}>
                  <span className="text-[1.2rem]">🎬</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[0.82rem] font-medium truncate">{video.title || '(No title)'}</span>
                  <span className={`font-mono text-[0.46rem] tracking-[0.1em] uppercase px-1.5 py-0.5`}
                    style={{ background: video.isActive ? 'rgba(74,222,128,0.08)' : 'rgba(0,0,0,0.03)', color: video.isActive ? '#4ade80' : 'rgba(0,0,0,0.35)', borderRadius: '2px' }}>
                    {video.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-[0.65rem] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{video.videoUrl}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => toggle.mutate({ id: video._id, d: { isActive: !video.isActive } })}
                  className="px-3 py-1.5 font-mono text-[0.5rem] tracking-[0.12em] uppercase border transition-all"
                  style={{ borderColor: video.isActive ? 'rgba(74,222,128,0.25)' : 'rgba(0,0,0,0.08)', color: video.isActive ? '#4ade80' : 'rgba(0,0,0,0.35)', borderRadius: '2px' }}>
                  {video.isActive ? '● On' : '○ Off'}
                </button>
                <button onClick={() => { setForm({ ...video }); setShowForm(true); }}
                  className="px-3 py-1.5 font-mono text-[0.5rem] tracking-[0.12em] uppercase border transition-all"
                  style={{ borderColor: 'rgba(201,169,110,0.2)', color: 'var(--c-gold)', borderRadius: '2px' }} data-hover>Edit</button>
                <button onClick={() => setDeleteId(video._id)}
                  className="px-3 py-1.5 font-mono text-[0.5rem] tracking-[0.12em] uppercase border transition-all"
                  style={{ borderColor: 'rgba(214,58,47,0.2)', color: '#d63a2f', borderRadius: '2px' }} data-hover>Del</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Drawer */}
      <FormDrawer open={showForm} onClose={() => setShowForm(false)} title={form?._id ? 'Edit Video' : 'Add Video'} onSave={() => save.mutate(form)} saving={save.isPending}>
        {form && (
          <>
            <Field label="Title" required>
              <input value={form.title} onChange={e => up('title', e.target.value)} className="input-field" placeholder="Brand Film — Asian Paints" />
            </Field>

            <Field label="Video File">
              <div className="flex gap-2">
                <input value={form.videoUrl} onChange={e => up('videoUrl', e.target.value)} placeholder="URL or pick from library…" className="input-field flex-1 text-[0.8rem]" />
                <button type="button" onClick={() => setShowMedia('video')} className="px-4 py-2.5 font-mono text-[0.55rem] tracking-[0.15em] uppercase border transition-all" style={{ borderColor: 'rgba(201,169,110,0.25)', color: 'var(--c-gold)', borderRadius: '2px' }} data-hover>Pick</button>
              </div>
              {form.videoUrl && (
                <video src={imgUrl(form.videoUrl)} className="mt-2 h-24 w-full object-cover" style={{ borderRadius: '2px' }} muted />
              )}
            </Field>

            <Field label="Thumbnail Image">
              <div className="flex gap-2">
                <input value={form.thumbnail} onChange={e => up('thumbnail', e.target.value)} placeholder="Optional thumbnail…" className="input-field flex-1 text-[0.8rem]" />
                <button type="button" onClick={() => setShowMedia('thumb')} className="px-4 py-2.5 font-mono text-[0.55rem] tracking-[0.15em] uppercase border transition-all" style={{ borderColor: 'rgba(201,169,110,0.25)', color: 'var(--c-gold)', borderRadius: '2px' }} data-hover>Pick</button>
              </div>
              {form.thumbnail && <img src={imgUrl(form.thumbnail)} alt="" className="mt-2 h-16 object-cover" style={{ borderRadius: '2px' }} />}
            </Field>

            <Field label="Description">
              <input value={form.description} onChange={e => up('description', e.target.value)} className="input-field" placeholder="Short description…" />
            </Field>

            <Field label="Order">
              <input type="number" value={form.order} onChange={e => up('order', +e.target.value)} className="input-field w-24" />
            </Field>

            <Toggle label="Active / Visible" checked={!!form.isActive} onChange={v => up('isActive', v)} />
          </>
        )}
      </FormDrawer>

      {showMedia && (
        <MediaPicker
          onSelect={(url, id) => {
            if (showMedia === 'video') { up('videoUrl', url); up('videoId', id || ''); }
            else { up('thumbnail', url); }
            setShowMedia(null);
          }}
          onClose={() => setShowMedia(null)}
          type={showMedia === 'video' ? 'video' : 'image'}
        />
      )}
      <ConfirmDelete open={!!deleteId} label="video" onConfirm={() => deleteId && remove.mutate(deleteId)} onCancel={() => setDeleteId(null)} />
    </div>
  );
}

