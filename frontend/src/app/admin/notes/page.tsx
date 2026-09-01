'use client';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { notesApi } from '@/lib/api';
import toast from 'react-hot-toast';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ['All','General','Future Plans','Ideas','Tasks','Past Records','Meetings','Important','Personal'];

const CAT_META: Record<string, { icon: string; color: string }> = {
  'All':          { icon: '◈', color: '#e91e8c' },
  'General':      { icon: '◎', color: '#94a3b8' },
  'Future Plans': { icon: '◷', color: '#60a5fa' },
  'Ideas':        { icon: '◉', color: '#fbbf24' },
  'Tasks':        { icon: '◻', color: '#4ade80' },
  'Past Records': { icon: '◴', color: '#c9a96e' },
  'Meetings':     { icon: '◈', color: '#a78bfa' },
  'Important':    { icon: '◆', color: '#f87171' },
  'Personal':     { icon: '◌', color: '#fb923c' },
};

const NOTE_COLORS = [
  { label: 'White',  value: '#ffffff' },
  { label: 'Cream',  value: '#fefce8' },
  { label: 'Mint',   value: '#f0fdf4' },
  { label: 'Blue',   value: '#eff6ff' },
  { label: 'Pink',   value: '#fdf2f8' },
  { label: 'Peach',  value: '#fff7ed' },
  { label: 'Lilac',  value: '#f5f3ff' },
  { label: 'Gray',   value: '#f8fafc' },
];

const EMPTY_FORM = { title: '', content: '', category: 'General', tags: '', color: '#ffffff', isPinned: false };

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Note Card ─────────────────────────────────────────────────────────────────
function NoteCard({ note, onEdit, onDelete, onPin, onArchive }: any) {
  const cat = CAT_META[note.category] || CAT_META['General'];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.22 }}
      className="relative rounded-xl border group cursor-pointer"
      style={{
        background: note.color || '#ffffff',
        borderColor: note.isPinned ? cat.color + '60' : 'rgba(0,0,0,0.1)',
        boxShadow: note.isPinned ? `0 0 0 2px ${cat.color}30` : '0 1px 3px rgba(0,0,0,0.08)',
      }}
      onClick={() => onEdit(note)}
    >
      {/* Pin indicator */}
      {note.isPinned && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[0.55rem] z-10"
          style={{ background: cat.color, color: '#fff' }}>📌</div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-[0.75rem]" style={{ color: cat.color }}>{cat.icon}</span>
            <span className="font-mono text-[0.45rem] tracking-[0.15em] uppercase px-1.5 py-0.5 rounded-full"
              style={{ background: cat.color + '18', color: cat.color }}>
              {note.category}
            </span>
          </div>

          {/* Menu button */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[0.7rem]"
              style={{ background: 'rgba(0,0,0,0.07)', color: '#555' }}>
              ⋯
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 z-20 rounded-lg shadow-xl border overflow-hidden min-w-[130px]"
                style={{ background: '#fff', borderColor: 'rgba(0,0,0,0.1)' }}>
                {[
                  { label: note.isPinned ? '📌 Unpin' : '📌 Pin', fn: () => { onPin(note); setMenuOpen(false); } },
                  { label: '✏️ Edit',    fn: () => { onEdit(note); setMenuOpen(false); } },
                  { label: note.isArchived ? '📤 Unarchive' : '📦 Archive', fn: () => { onArchive(note); setMenuOpen(false); } },
                  { label: '🗑️ Delete',  fn: () => { onDelete(note._id); setMenuOpen(false); }, red: true },
                ].map(item => (
                  <button key={item.label} onClick={item.fn}
                    className="w-full text-left px-3 py-2 text-[0.72rem] transition-colors"
                    style={{ color: item.red ? '#ef4444' : '#374151' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = item.red ? '#fef2f2' : '#f9fafb'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[0.9rem] leading-snug mb-2" style={{ color: '#111827' }}>
          {note.title}
        </h3>

        {/* Content preview */}
        {note.content && (
          <p className="text-[0.75rem] leading-relaxed line-clamp-4 mb-3" style={{ color: '#4b5563' }}>
            {note.content}
          </p>
        )}

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.map((tag: string) => (
              <span key={tag} className="text-[0.6rem] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.07)', color: '#6b7280' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.52rem]" style={{ color: '#9ca3af' }}>
            {timeAgo(note.updatedAt)}
          </span>
          {note.isArchived && (
            <span className="font-mono text-[0.46rem] px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(0,0,0,0.07)', color: '#6b7280' }}>archived</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Note Form Modal ───────────────────────────────────────────────────────────
function NoteModal({ note, onClose, onSave, saving }: any) {
  const [form, setForm] = useState(note ? {
    title:    note.title,
    content:  note.content,
    category: note.category,
    tags:     note.tags?.join(', ') || '',
    color:    note.color || '#ffffff',
    isPinned: note.isPinned,
  } : { ...EMPTY_FORM });

  const up = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: form.color, border: '1px solid rgba(0,0,0,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Color bar */}
        <div className="flex items-center gap-1.5 px-5 pt-4 pb-2">
          {NOTE_COLORS.map(c => (
            <button key={c.value} onClick={() => up('color', c.value)}
              className="w-5 h-5 rounded-full border-2 transition-all"
              style={{
                background: c.value,
                borderColor: form.color === c.value ? '#111' : 'rgba(0,0,0,0.15)',
                transform: form.color === c.value ? 'scale(1.25)' : 'scale(1)',
              }}
              title={c.label}
            />
          ))}
          <div className="ml-auto flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <div className="relative w-8 h-4 rounded-full transition-colors"
                style={{ background: form.isPinned ? '#e91e8c' : '#d1d5db' }}
                onClick={() => up('isPinned', !form.isPinned)}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${form.isPinned ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-[0.65rem]" style={{ color: '#374151' }}>Pin</span>
            </label>
          </div>
        </div>

        <div className="px-5 pb-2 space-y-3">
          {/* Title */}
          <input
            value={form.title}
            onChange={e => up('title', e.target.value)}
            placeholder="Note title…"
            className="w-full bg-transparent outline-none font-semibold text-[1.3rem] placeholder:text-gray-300"
            style={{ color: '#111827' }}
            autoFocus
          />

          {/* Category */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.filter(c => c !== 'All').map(c => {
              const m = CAT_META[c];
              const active = form.category === c;
              return (
                <button key={c} onClick={() => up('category', c)}
                  className="px-2.5 py-1 rounded-full text-[0.62rem] font-mono tracking-wide transition-all"
                  style={{
                    background: active ? m.color : m.color + '15',
                    color: active ? '#fff' : m.color,
                    border: `1px solid ${m.color}40`,
                  }}>
                  {m.icon} {c}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <textarea
            value={form.content}
            onChange={e => up('content', e.target.value)}
            placeholder="Write your note here… ideas, plans, anything…"
            rows={10}
            className="w-full bg-transparent outline-none resize-none text-[0.9rem] leading-relaxed placeholder:text-gray-300"
            style={{ color: '#374151' }}
          />

          {/* Tags */}
          <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <span className="text-[0.65rem]" style={{ color: '#9ca3af' }}>#</span>
            <input
              value={form.tags}
              onChange={e => up('tags', e.target.value)}
              placeholder="tags, comma separated (e.g. urgent, 2026, client)"
              className="flex-1 bg-transparent outline-none text-[0.78rem]"
              style={{ color: '#6b7280' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          {note && (
            <span className="font-mono text-[0.55rem]" style={{ color: '#9ca3af' }}>
              Last edited: {formatDate(note.updatedAt)}
            </span>
          )}
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg text-[0.72rem] font-medium transition-colors"
              style={{ background: 'rgba(0,0,0,0.06)', color: '#374151' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 rounded-lg text-[0.72rem] font-medium text-white transition-all"
              style={{ background: '#e91e8c', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : note ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NotesPage() {
  const qc = useQueryClient();
  const [search, setSearch]       = useState('');
  const [activecat, setActivecat] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [editNote, setEditNote]   = useState<any>(null);
  const [showForm, setShowForm]   = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', showArchived],
    queryFn:  () => notesApi.get({ archived: showArchived }),
  });

  const save = useMutation({
    mutationFn: (d: any) => editNote?._id ? notesApi.update(editNote._id, d) : notesApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      toast.success(editNote?._id ? 'Note updated!' : 'Note saved!');
      setShowForm(false); setEditNote(null);
    },
    onError: () => toast.error('Failed to save note'),
  });

  const remove = useMutation({
    mutationFn: notesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); toast.success('Deleted'); setDeleteId(null); },
  });

  const togglePin = useMutation({
    mutationFn: (note: any) => notesApi.update(note._id, { isPinned: !note.isPinned }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });

  const toggleArchive = useMutation({
    mutationFn: (note: any) => notesApi.update(note._id, { isArchived: !note.isArchived }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); toast.success('Done'); },
  });

  // Filter client-side
  const filtered = useMemo(() => {
    let n = notes as any[];
    if (activecat !== 'All') n = n.filter((x: any) => x.category === activecat);
    if (search.trim()) {
      const q = search.toLowerCase();
      n = n.filter((x: any) =>
        x.title?.toLowerCase().includes(q) ||
        x.content?.toLowerCase().includes(q) ||
        x.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }
    return n;
  }, [notes, activecat, search]);

  const pinned   = filtered.filter((n: any) => n.isPinned);
  const unpinned = filtered.filter((n: any) => !n.isPinned);

  const openNew = () => { setEditNote(null); setShowForm(true); };
  const openEdit = (note: any) => { setEditNote(note); setShowForm(true); };

  // Category counts
  const countBycat = useMemo(() => {
    const map: Record<string, number> = { All: (notes as any[]).length };
    (notes as any[]).forEach((n: any) => { map[n.category] = (map[n.category] || 0) + 1; });
    return map;
  }, [notes]);

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[2rem] tracking-[0.06em]" style={{ color: '#111827' }}>
            ✎ My Notes
          </h1>
          <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase mt-1" style={{ color: '#6b7280' }}>
            Personal workspace — ideas, plans, records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="px-3 py-2 rounded-lg font-mono text-[0.58rem] tracking-[0.12em] uppercase transition-all"
            style={{
              background: showArchived ? 'rgba(0,0,0,0.08)' : 'transparent',
              color: '#6b7280',
              border: '1px solid rgba(0,0,0,0.1)',
            }}>
            📦 {showArchived ? 'Active Notes' : 'Archived'}
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-[0.62rem] tracking-[0.12em] uppercase text-white transition-all"
            style={{ background: '#e91e8c', boxShadow: '0 2px 8px rgba(233,30,140,0.3)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#c4167a'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#e91e8c'}>
            + New Note
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[0.85rem]" style={{ color: '#9ca3af' }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes by title, content, or #tag…"
          className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none text-[0.85rem] transition-all"
          style={{
            background: '#fff',
            borderColor: search ? '#e91e8c' : 'rgba(0,0,0,0.1)',
            color: '#111827',
            boxShadow: search ? '0 0 0 3px rgba(233,30,140,0.08)' : 'none',
          }}
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.75rem] w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.08)', color: '#6b7280' }}>✕</button>
        )}
      </div>

      {/* ── Category Filter ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(c => {
          const m = CAT_META[c];
          const active = activecat === c;
          const count = countBycat[c] || 0;
          return (
            <button key={c} onClick={() => setActivecat(c)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.65rem] font-mono tracking-wide transition-all"
              style={{
                background: active ? m.color : '#fff',
                color: active ? '#fff' : '#6b7280',
                border: `1px solid ${active ? m.color : 'rgba(0,0,0,0.1)'}`,
                boxShadow: active ? `0 2px 6px ${m.color}35` : 'none',
              }}>
              <span>{m.icon}</span>
              <span>{c}</span>
              {count > 0 && (
                <span className="px-1 rounded-full text-[0.5rem]"
                  style={{ background: active ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.07)' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Notes Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: 'rgba(0,0,0,0.06)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="text-[3rem] mb-4">📝</div>
          <p className="font-display text-[1.4rem] tracking-wide" style={{ color: '#9ca3af' }}>
            {search ? 'No notes found' : 'No notes yet'}
          </p>
          <p className="font-mono text-[0.6rem] tracking-widest uppercase mt-2" style={{ color: '#d1d5db' }}>
            {search ? 'Try a different keyword' : 'Click "+ New Note" to get started'}
          </p>
          {!search && (
            <button onClick={openNew} className="mt-6 px-6 py-2.5 rounded-xl text-[0.72rem] font-medium text-white"
              style={{ background: '#e91e8c' }}>
              + Create your first note
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Pinned section */}
          {pinned.length > 0 && (
            <div className="mb-6">
              <p className="font-mono text-[0.52rem] tracking-[0.22em] uppercase mb-3 flex items-center gap-2"
                style={{ color: '#9ca3af' }}>
                <span>📌</span> Pinned ({pinned.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                  {pinned.map((note: any) => (
                    <NoteCard key={note._id} note={note}
                      onEdit={openEdit}
                      onDelete={(id: string) => setDeleteId(id)}
                      onPin={(n: any) => togglePin.mutate(n)}
                      onArchive={(n: any) => toggleArchive.mutate(n)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* All notes */}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <p className="font-mono text-[0.52rem] tracking-[0.22em] uppercase mb-3"
                  style={{ color: '#9ca3af' }}>
                  Others ({unpinned.length})
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                  {unpinned.map((note: any) => (
                    <NoteCard key={note._id} note={note}
                      onEdit={openEdit}
                      onDelete={(id: string) => setDeleteId(id)}
                      onPin={(n: any) => togglePin.mutate(n)}
                      onArchive={(n: any) => toggleArchive.mutate(n)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </>
      )}

      {/* Stats bar */}
      {(notes as any[]).length > 0 && (
        <div className="mt-8 pt-6 border-t flex items-center gap-6" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          {[
            { label: 'Total', value: (notes as any[]).length, color: '#e91e8c' },
            { label: 'Pinned', value: (notes as any[]).filter((n: any) => n.isPinned).length, color: '#fbbf24' },
            { label: 'Showing', value: filtered.length, color: '#4ade80' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="font-display text-[1.4rem]" style={{ color: s.color }}>{s.value}</span>
              <span className="font-mono text-[0.5rem] tracking-[0.18em] uppercase" style={{ color: '#9ca3af' }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Note Form Modal ── */}
      <AnimatePresence>
        {showForm && (
          <NoteModal
            note={editNote}
            onClose={() => { setShowForm(false); setEditNote(null); }}
            onSave={(d: any) => save.mutate(d)}
            saving={save.isPending}
          />
        )}
      </AnimatePresence>

      {/* ── Delete Confirm ── */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[700] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="p-8 max-w-sm w-full mx-4 rounded-2xl shadow-2xl"
              style={{ background: '#fff', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="text-[2.5rem] mb-3 text-center">🗑️</div>
              <h3 className="font-semibold text-[1.1rem] text-center mb-2" style={{ color: '#111827' }}>Delete Note?</h3>
              <p className="text-[0.78rem] text-center mb-6" style={{ color: '#6b7280' }}>This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => remove.mutate(deleteId!)}
                  className="flex-1 py-3 rounded-xl text-[0.72rem] font-medium text-white transition-all"
                  style={{ background: '#ef4444' }}>
                  Delete
                </button>
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 rounded-xl text-[0.72rem] font-medium transition-all"
                  style={{ background: 'rgba(0,0,0,0.06)', color: '#374151' }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
