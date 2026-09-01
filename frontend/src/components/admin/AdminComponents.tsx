'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApi, imgUrl } from '@/lib/api';
import toast from 'react-hot-toast';

// ── ADMIN PAGE HEADER ────────────────────────────────────────────────────────
export function AdminHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="font-display text-[2rem] tracking-[0.06em]" style={{ color: '#f5f0ea' }}>{title}</h1>
        {subtitle && <p className="font-mono text-[0.56rem] tracking-[0.2em] uppercase mt-1" style={{ color: 'rgba(245,240,234,0.28)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── ADD BUTTON ────────────────────────────────────────────────────────────────
export function AddBtn({ onClick, label = 'Add New' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} data-hover
      className="flex items-center gap-2 px-5 py-2.5 font-mono text-[0.58rem] tracking-[0.18em] uppercase transition-all duration-200"
      style={{ background: 'var(--c-gold)', color: '#080808', borderRadius: '2px' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#e8c88a'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--c-gold)'}>
      + {label}
    </button>
  );
}

// ── FORM DRAWER ───────────────────────────────────────────────────────────────
export function FormDrawer({ open, onClose, title, children, onSave, saving }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; onSave?: () => void; saving?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] flex items-start justify-end"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full max-w-2xl flex flex-col overflow-hidden"
            style={{ background: '#0f0f0f', borderLeft: '1px solid rgba(201,169,110,0.15)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <h2 className="font-display text-[1.4rem] tracking-[0.06em]" style={{ color: '#f5f0ea' }}>{title}</h2>
              <button onClick={onClose} className="font-mono text-[0.7rem] transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f5f0ea'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}>✕</button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">{children}</div>
            {/* Footer */}
            {onSave && (
              <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <button onClick={onSave} disabled={saving} data-hover
                  className="btn-primary flex-1 justify-center py-3.5">
                  <span>{saving ? 'Saving…' : 'Save ✦'}</span>
                </button>
                <button onClick={onClose} className="btn-ghost px-6 py-3.5">Cancel</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── FORM FIELD ─────────────────────────────────────────────────────────────── 
export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-mono text-[0.52rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}{required && <span style={{ color: 'var(--c-red)' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

// ── TEXT STYLE EDITOR ────────────────────────────────────────────────────────
export function TextStyleEditor({ label, value, onChange }: { label: string; value: any; onChange: (v: any) => void }) {
  const [open, setOpen] = useState(false);
  const SIZES   = ['12px','14px','16px','18px','20px','24px','28px','32px','36px','40px','48px','56px','64px','72px','80px','96px','112px'];
  const WEIGHTS = [{ v: '300', l: 'Light' }, { v: '400', l: 'Regular' }, { v: '500', l: 'Medium' }, { v: '600', l: 'SemiBold' }, { v: '700', l: 'Bold' }, { v: '800', l: 'ExtraBold' }];
  const ALIGNS  = ['left', 'center', 'right'];
  const FONTS   = ['Syne', 'Bebas Neue', 'DM Serif Display', 'Space Mono'];

  return (
    <div className="border" style={{ borderColor: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.58rem] tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
          {value?.text && <span className="text-[0.7rem] truncate max-w-[200px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{value.text}</span>}
        </div>
        <span className="font-mono text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.4)', transform: open ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>▾</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3 space-y-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <textarea value={value?.text || ''} onChange={e => onChange({ ...value, text: e.target.value })}
            placeholder={`${label} text…`} rows={2}
            className="input-field resize-none text-[0.82rem]" />

          <div className="grid grid-cols-2 gap-3">
            {/* Color */}
            <div>
              <p className="font-mono text-[0.48rem] tracking-[0.18em] uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Color</p>
              <div className="flex items-center gap-2">
                <input type="color" value={value?.color || '#f5f0ea'} onChange={e => onChange({ ...value, color: e.target.value })}
                  className="w-9 h-9 border-0 bg-transparent cursor-pointer" style={{ borderRadius: '2px' }} />
                <input type="text" value={value?.color || ''} onChange={e => onChange({ ...value, color: e.target.value })}
                  className="input-field flex-1 text-[0.78rem] py-2" />
              </div>
            </div>

            {/* Font Size */}
            <div>
              <p className="font-mono text-[0.48rem] tracking-[0.18em] uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Font Size</p>
              <select value={value?.fontSize || '16px'} onChange={e => onChange({ ...value, fontSize: e.target.value })} className="input-field text-[0.78rem] py-2">
                {SIZES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Font Weight */}
            <div>
              <p className="font-mono text-[0.48rem] tracking-[0.18em] uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Weight</p>
              <select value={value?.fontWeight || '400'} onChange={e => onChange({ ...value, fontWeight: e.target.value })} className="input-field text-[0.78rem] py-2">
                {WEIGHTS.map(w => <option key={w.v} value={w.v}>{w.l}</option>)}
              </select>
            </div>

            {/* Font Family */}
            <div>
              <p className="font-mono text-[0.48rem] tracking-[0.18em] uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Font Family</p>
              <select value={value?.fontFamily || 'Syne'} onChange={e => onChange({ ...value, fontFamily: e.target.value })} className="input-field text-[0.78rem] py-2">
                {FONTS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Text Align */}
          <div>
            <p className="font-mono text-[0.48rem] tracking-[0.18em] uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Text Align</p>
            <div className="flex gap-2">
              {ALIGNS.map(a => (
                <button key={a} type="button" onClick={() => onChange({ ...value, textAlign: a })}
                  className="flex-1 py-1.5 font-mono text-[0.58rem] uppercase transition-all"
                  style={{ borderRadius: '2px', background: value?.textAlign === a ? 'var(--c-gold)' : 'rgba(255,255,255,0.06)', color: value?.textAlign === a ? '#080808' : 'rgba(255,255,255,0.5)' }}>
                  {a[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            {[{ key: 'italic', label: 'Italic' }, { key: 'uppercase', label: 'Uppercase' }].map(t => (
              <label key={t.key} className="flex items-center gap-2 cursor-pointer">
                <div className="relative w-9 h-5 rounded-full transition-colors" style={{ background: value?.[t.key] ? 'var(--c-gold)' : '#374151' }}
                  onClick={() => onChange({ ...value, [t.key]: !value?.[t.key] })}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value?.[t.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.label}</span>
              </label>
            ))}
          </div>

          {/* Preview */}
          {value?.text && (
            <div className="p-3 border" style={{ borderColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', background: 'rgba(8,8,8,0.5)' }}>
              <p className="font-mono text-[0.45rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Preview</p>
              <span style={{
                color:       value.color,
                fontSize:    value.fontSize,
                fontWeight:  value.fontWeight,
                fontFamily:  value.fontFamily,
                textAlign:   value.textAlign as any,
                fontStyle:   value.italic ? 'italic' : 'normal',
                textTransform: value.uppercase ? 'uppercase' : 'none',
                display:     'block',
                lineHeight:  '1.2',
              }}>{value.text}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── TOGGLE ────────────────────────────────────────────────────────────────────
export function Toggle({ label, checked, onChange, color = 'var(--c-gold)' }: { label: string; checked: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative w-11 h-6 rounded-full transition-colors" style={{ background: checked ? color : '#374151' }}
        onClick={() => onChange(!checked)}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
      <span className="font-mono text-[0.55rem] tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
    </label>
  );
}

// ── POSITION PICKER ───────────────────────────────────────────────────────────
export function PositionPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const POSITIONS = [
    ['top-left', 'top-center', 'top-right'],
    ['left',     'center',     'right'],
    ['bottom-left', 'bottom-center', 'bottom-right'],
  ];
  return (
    <div>
      <p className="font-mono text-[0.48rem] tracking-[0.18em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Content Position</p>
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {POSITIONS.flat().map(pos => (
          <button key={pos} type="button" onClick={() => onChange(pos)}
            className="w-9 h-9 transition-all duration-150"
            style={{
              borderRadius: '2px',
              background:   value === pos ? 'var(--c-gold)' : 'rgba(255,255,255,0.06)',
              border:       `1px solid ${value === pos ? 'var(--c-gold)' : 'rgba(255,255,255,0.1)'}`,
              fontSize: '0.45rem',
              color: value === pos ? '#080808' : 'rgba(255,255,255,0.4)',
            }}
            title={pos}
          >
            {pos === 'center' ? '●' : pos.includes('left') ? '◂' : pos.includes('right') ? '▸' : pos.includes('top') ? '▴' : '▾'}
          </button>
        ))}
      </div>
      <p className="font-mono text-[0.46rem] tracking-[0.12em] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{value}</p>
    </div>
  );
}

// ── MEDIA PICKER MODAL ────────────────────────────────────────────────────────
export function MediaPicker({ onSelect, onClose, type = 'all' }: { onSelect: (url: string, id?: string) => void; onClose: () => void; type?: string }) {
  const [filter, setFilter]   = useState(type === 'all' ? '' : type);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['media', filter, page],
    queryFn:  () => mediaApi.get({ type: filter || undefined, page, limit: 24 }),
  });

  const upload = useMutation({
    mutationFn: ({ file }: { file: File }) => mediaApi.upload(file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['media'] }); toast.success('Uploaded!'); },
    onError: () => toast.error('Upload failed'),
  });

  const remove = useMutation({
    mutationFn: mediaApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['media'] }); toast.success('Deleted'); setSelected(null); },
  });

  const onDrop = useCallback((files: File[]) => { files.forEach(f => upload.mutate({ file: f })); }, [upload]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [], 'video/*': [], 'application/pdf': [] }, multiple: true });

  const media    = data?.media || [];
  const pages    = data?.pages || 1;
  const filtered = search ? media.filter((m: any) => m.originalName?.toLowerCase().includes(search.toLowerCase())) : media;
  const selItem  = media.find((m: any) => m._id === selected);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-5xl h-[80vh] flex flex-col"
        style={{ background: '#0f0f0f', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '2px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="font-display text-[1.3rem] tracking-[0.06em]" style={{ color: '#f5f0ea' }}>Media Library</h2>
          <div className="flex items-center gap-3">
            {selected && selItem && (
              <button onClick={() => onSelect(imgUrl(selItem.url), selItem._id)}
                className="flex items-center gap-2 px-4 py-2 font-mono text-[0.56rem] tracking-[0.15em] uppercase"
                style={{ background: 'var(--c-gold)', color: '#080808', borderRadius: '2px' }}>
                ✓ Use Selected
              </button>
            )}
            <button onClick={onClose} className="font-mono text-[0.65rem]" style={{ color: 'rgba(255,255,255,0.5)' }}>✕</button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Main */}
          <div className="flex-1 flex flex-col min-w-0 border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="input-field flex-1 py-2 text-[0.8rem]" />
              <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field w-28 py-2 text-[0.75rem]">
                <option value="">All</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="pdf">PDFs</option>
              </select>
            </div>

            {/* Drop zone — FIXED: visible on dark bg */}
            <div {...getRootProps()} className="mx-4 mt-3 flex-shrink-0 px-4 py-5 border-2 border-dashed text-center cursor-pointer transition-all"
              style={{
                borderColor: isDragActive ? 'var(--c-gold)' : 'rgba(255,255,255,0.15)',
                background: isDragActive ? 'rgba(201,169,110,0.08)' : 'rgba(255,255,255,0.03)',
                borderRadius: '4px'
              }}>
              <input {...getInputProps()} />
              <p className="font-mono text-[0.62rem] tracking-[0.18em] uppercase" style={{ color: isDragActive ? 'var(--c-gold)' : 'rgba(255,255,255,0.55)' }}>
                {upload.isPending ? '⏳ Uploading…' : isDragActive ? '📂 Drop here' : '↑ Drag & drop or click to upload'}
              </p>
              <p className="font-mono text-[0.5rem] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Images, Videos, PDFs supported
              </p>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="grid grid-cols-5 md:grid-cols-7 gap-2">
                  {Array.from({ length: 14 }).map((_, i) => <div key={i} className="aspect-square shimmer" style={{ borderRadius: '2px' }} />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  <p className="font-mono text-[0.58rem] tracking-[0.2em] uppercase">No media yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-5 md:grid-cols-7 gap-2">
                  {filtered.map((m: any) => (
                    <button key={m._id} onClick={() => setSelected(selected === m._id ? null : m._id)}
                      onDoubleClick={() => onSelect(imgUrl(m.url), m._id)}
                      className="relative group aspect-square overflow-hidden transition-all"
                      style={{ background: '#1a1a1a', borderRadius: '2px', outline: selected === m._id ? '2px solid var(--c-gold)' : '2px solid transparent', outlineOffset: '2px' }}>
                      {m.type === 'image' ? (
                        <img src={imgUrl(m.url)} alt={m.alt} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.5)' }}>{m.type}</div>
                      )}
                      {selected === m._id && <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.25)' }}><span className="text-[1.2rem]">✓</span></div>}
                      <button onClick={e => { e.stopPropagation(); if (confirm('Delete?')) remove.mutate(m._id); }}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[0.5rem]"
                        style={{ background: '#d63a2f', color: 'white' }}>✕</button>
                    </button>
                  ))}
                </div>
              )}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className="w-8 h-8 font-mono text-[0.58rem] transition-all"
                      style={{ borderRadius: '2px', background: page === p ? 'var(--c-gold)' : 'rgba(255,255,255,0.08)', color: page === p ? '#080808' : 'rgba(255,255,255,0.6)' }}>{p}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          {selItem && (
            <div className="w-52 flex-shrink-0 p-4 flex flex-col gap-3 overflow-y-auto">
              <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Selected</p>
              <div className="aspect-square overflow-hidden" style={{ background: '#1a1a1a', borderRadius: '2px' }}>
                {selItem.type === 'image' ? <img src={imgUrl(selItem.url)} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center font-mono text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>{selItem.type}</div>}
              </div>
              <div className="space-y-1.5 text-[0.7rem]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <p className="truncate"><span style={{ color: 'rgba(255,255,255,0.3)' }}>Name: </span>{selItem.originalName}</p>
                <p><span style={{ color: 'rgba(255,255,255,0.3)' }}>Type: </span>{selItem.type}</p>
                <p><span style={{ color: 'rgba(255,255,255,0.3)' }}>Size: </span>{(selItem.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={() => onSelect(imgUrl(selItem.url), selItem._id)}
                className="btn-primary justify-center py-2.5 text-[0.56rem]" data-hover>
                <span>Insert ✦</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── CONFIRM DELETE ────────────────────────────────────────────────────────────
export function ConfirmDelete({ open, onConfirm, onCancel, label = 'item' }: { open: boolean; onConfirm: () => void; onCancel: () => void; label?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
        className="p-8 max-w-sm w-full mx-4 border"
        style={{ background: '#141414', borderColor: 'rgba(214,58,47,0.2)', borderRadius: '2px' }}>
        <h3 className="font-display text-[1.4rem] tracking-[0.06em] mb-2" style={{ color: '#f5f0ea' }}>Delete {label}?</h3>
        <p className="text-[0.78rem] mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 py-3 font-mono text-[0.58rem] tracking-[0.15em] uppercase transition-all"
            style={{ background: '#d63a2f', color: 'white', borderRadius: '2px' }}>Delete</button>
          <button onClick={onCancel} className="flex-1 py-3 btn-ghost">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── STATUS BADGE ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { color: string; bg: string; border: string }> = {
    new:       { color: '#4ade80', bg: 'rgba(74,222,128,0.08)',   border: 'rgba(74,222,128,0.2)' },
    read:      { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',   border: 'rgba(96,165,250,0.2)' },
    replied:   { color: '#c9a96e', bg: 'rgba(201,169,110,0.08)',  border: 'rgba(201,169,110,0.2)' },
    closed:    { color: '#6b7280', bg: 'rgba(107,114,128,0.08)',  border: 'rgba(107,114,128,0.2)' },
    published: { color: '#4ade80', bg: 'rgba(74,222,128,0.08)',   border: 'rgba(74,222,128,0.2)' },
    draft:     { color: '#6b7280', bg: 'rgba(107,114,128,0.08)',  border: 'rgba(107,114,128,0.2)' },
    active:    { color: '#4ade80', bg: 'rgba(74,222,128,0.08)',   border: 'rgba(74,222,128,0.2)' },
    inactive:  { color: '#6b7280', bg: 'rgba(107,114,128,0.08)',  border: 'rgba(107,114,128,0.2)' },
  };
  const s = styles[status] || styles.inactive;
  return (
    <span className="font-mono text-[0.48rem] tracking-[0.12em] uppercase px-2 py-0.5"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: '2px' }}>
      {status}
    </span>
  );
}
