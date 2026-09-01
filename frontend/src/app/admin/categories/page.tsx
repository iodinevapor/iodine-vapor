'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prodCatsApi, blogCatsApi, wsCatsApi } from '@/lib/api';
import { AdminHeader, AddBtn, FormDrawer, Field, Toggle, ConfirmDelete } from '@/components/admin/AdminComponents';
import toast from 'react-hot-toast';

// ── GENERIC CATEGORY CRUD ─────────────────────────────────────────────────────
function CatSection({ title, queryKey, api }: { title: string; queryKey: string; api: any }) {
  const [form, setForm]         = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: [queryKey] });

  const { data: cats = [], isLoading } = useQuery<any[]>({ queryKey: [queryKey], queryFn: api.getAll });
  const save   = useMutation({ mutationFn: (d: any) => d._id ? api.update(d._id, d) : api.create(d), onSuccess: () => { inv(); toast.success('Saved!'); setShowForm(false); }, onError: () => toast.error('Failed') });
  const remove = useMutation({ mutationFn: (id: string) => api.delete(id), onSuccess: () => { inv(); toast.success('Deleted'); setDeleteId(null); } });

  const up = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const emptyFn = () => ({ name: '', color: '#c9a96e', order: 0, isActive: true });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-[0.62rem] tracking-[0.22em] uppercase" style={{ color: 'var(--c-gold)' }}>◈ {title}</h3>
        <AddBtn onClick={() => { setForm(emptyFn()); setShowForm(true); }} label="Add" />
      </div>
      <div className="border divide-y" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
        {isLoading ? <div className="p-4"><div className="h-10 shimmer" style={{ borderRadius: '2px' }} /></div> :
        cats.length === 0 ? (
          <div className="p-6 text-center font-mono text-[0.55rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>No categories</div>
        ) : cats.map((cat: any) => (
          <div key={cat._id} className="flex items-center gap-4 px-4 py-3 transition-colors" style={{ borderColor: 'rgba(0,0,0,0.03)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.02)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color || '#c9a96e' }} />
            <span className="flex-1 text-[0.82rem]">{cat.name}</span>
            <span className="font-mono text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>{cat.isActive ? '● Active' : '○ Hidden'}</span>
            <div className="flex gap-1.5">
              <button onClick={() => { setForm({ ...cat }); setShowForm(true); }} className="px-3 py-1.5 font-mono text-[0.46rem] border" style={{ borderColor: 'rgba(201,169,110,0.2)', color: 'var(--c-gold)', borderRadius: '2px' }}>Edit</button>
              <button onClick={() => setDeleteId(cat._id)} className="px-3 py-1.5 font-mono text-[0.46rem] border" style={{ borderColor: 'rgba(214,58,47,0.2)', color: '#d63a2f', borderRadius: '2px' }}>Del</button>
            </div>
          </div>
        ))}
      </div>
      <FormDrawer open={showForm} onClose={() => setShowForm(false)} title={form?._id ? `Edit ${title}` : `Add ${title}`} onSave={() => save.mutate(form)} saving={save.isPending}>
        {form && (
          <>
            <Field label="Name *"><input required value={form.name} onChange={e => up('name', e.target.value)} className="input-field" placeholder="Category name…" /></Field>
            <Field label="Color">
              <div className="flex gap-2">
                <input type="color" value={form.color || '#c9a96e'} onChange={e => up('color', e.target.value)} className="w-10 h-10 border-0 bg-transparent cursor-pointer" />
                <input value={form.color || ''} onChange={e => up('color', e.target.value)} className="input-field flex-1" placeholder="#c9a96e" />
              </div>
            </Field>
            <Field label="Order"><input type="number" value={form.order || 0} onChange={e => up('order', +e.target.value)} className="input-field" /></Field>
            <Toggle label="Active" checked={!!form.isActive} onChange={v => up('isActive', v)} />
          </>
        )}
      </FormDrawer>
      <ConfirmDelete open={!!deleteId} label="category" onConfirm={() => deleteId && remove.mutate(deleteId)} onCancel={() => setDeleteId(null)} />
    </div>
  );
}

export default function AdminCategories() {
  return (
    <div>
      <AdminHeader title="Categories" subtitle="Manage product, blog, and workshop categories" />
      <CatSection title="Product Categories"  queryKey="prod-cats" api={prodCatsApi} />
      <CatSection title="Blog Categories"     queryKey="blog-cats" api={blogCatsApi} />
      <CatSection title="Workshop Categories" queryKey="ws-cats"   api={wsCatsApi}  />
    </div>
  );
}

