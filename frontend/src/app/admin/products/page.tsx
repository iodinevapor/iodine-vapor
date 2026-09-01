'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { productsApi, prodCatsApi, imgUrl } from '@/lib/api';
import { AdminHeader, AddBtn, FormDrawer, Field, Toggle, ConfirmDelete, MediaPicker, StatusBadge } from '@/components/admin/AdminComponents';
import toast from 'react-hot-toast';

const empty = () => ({ name: '', category: '', shortDesc: '', description: '', price: 0, mrp: 0, sku: '', inStock: true, isFeatured: false, isBestSeller: false, images: [], tags: [], specifications: [], isActive: true, seo: { metaTitle: '', metaDescription: '' } });

export default function AdminProducts() {
  const [form, setForm]         = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [search, setSearch]     = useState('');
  const [catFilter, setCat]     = useState('');
  const [page, setPage]         = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [specKey, setSpecKey]   = useState('');
  const [specVal, setSpecVal]   = useState('');

  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ['admin-products'] });

  const { data: catData }    = useQuery({ queryKey: ['prod-cats'], queryFn: prodCatsApi.getAll });
  const { data, isLoading }  = useQuery({ queryKey: ['admin-products', { page, search, catFilter }], queryFn: () => productsApi.getAll({ page, limit: 15, search, category: catFilter }) });

  const save   = useMutation({ mutationFn: (d: any) => d._id ? productsApi.update(d._id, d) : productsApi.create(d), onSuccess: () => { inv(); toast.success('Saved!'); setShowForm(false); }, onError: () => toast.error('Failed') });
  const remove = useMutation({ mutationFn: productsApi.delete, onSuccess: () => { inv(); toast.success('Deleted'); setDeleteId(null); } });

  const categories = catData || [];
  const products   = data?.products || [];
  const totalPages = data?.pages || 1;

  const up = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const addTag  = () => { if (tagInput.trim()) { up('tags', [...(form.tags||[]), tagInput.trim()]); setTagInput(''); } };
  const addSpec = () => { if (specKey && specVal) { up('specifications', [...(form.specifications||[]), { key: specKey, value: specVal }]); setSpecKey(''); setSpecVal(''); } };

  return (
    <div>
      <AdminHeader title="Products" subtitle={`${data?.total || 0} total`} action={<AddBtn onClick={() => { setForm(empty()); setShowForm(true); }} />} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products…" className="input-field w-52 py-2 text-[0.8rem]" />
        <select value={catFilter} onChange={e => { setCat(e.target.value); setPage(1); }} className="input-field w-48 py-2 text-[0.78rem]">
          <option value="">All Categories</option>
          {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.8rem]">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {['Product', 'Category', 'Price', 'Stock', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[0.5rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.03)' }}>
              {isLoading ? Array.from({length:6}).map((_,i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-8 shimmer" style={{ borderRadius: '2px' }} /></td></tr>
              )) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center font-mono text-[0.56rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>No products</td></tr>
              ) : products.map((p: any) => (
                <tr key={p._id} className="transition-colors" onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.02)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex-shrink-0 overflow-hidden" style={{ background: '#1a1a1a', borderRadius: '2px' }}>
                        {p.images?.[0] ? <img src={imgUrl(p.images[0].url)} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-mono text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.25)' }}>?</div>}
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        {p.sku && <p className="font-mono text-[0.5rem] tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>SKU: {p.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase px-2 py-1" style={{ color: 'var(--c-gold)', background: 'rgba(201,169,110,0.08)', borderRadius: '2px' }}>{p.category?.name || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.price ? `₹${p.price}` : <span style={{ color: 'rgba(255,255,255,0.4)' }}>Enquire</span>}
                    {p.mrp > p.price && <span className="ml-1.5 text-[0.7rem] line-through" style={{ color: 'rgba(255,255,255,0.4)' }}>₹{p.mrp}</span>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.inStock ? 'active' : 'inactive'} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {p.isFeatured   && <span className="font-mono text-[0.44rem] px-1.5 py-0.5 uppercase" style={{ color: 'var(--c-gold)', background: 'rgba(201,169,110,0.08)', borderRadius: '2px' }}>Featured</span>}
                      {p.isBestSeller && <span className="font-mono text-[0.44rem] px-1.5 py-0.5 uppercase" style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.08)', borderRadius: '2px' }}>★ Best</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => { setForm({ ...p, category: p.category?._id || p.category }); setShowForm(true); }} className="px-3 py-1.5 font-mono text-[0.48rem] tracking-[0.12em] uppercase border transition-all" style={{ borderColor: 'rgba(201,169,110,0.2)', color: 'var(--c-gold)', borderRadius: '2px' }}>Edit</button>
                      <button onClick={() => setDeleteId(p._id)} className="px-3 py-1.5 font-mono text-[0.48rem] tracking-[0.12em] uppercase border transition-all" style={{ borderColor: 'rgba(214,58,47,0.2)', color: '#d63a2f', borderRadius: '2px' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="font-mono text-[0.52rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Page {page}/{totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-3 py-1 font-mono text-[0.52rem] border disabled:opacity-30" style={{ borderColor: 'rgba(255,255,255,0.08)', borderRadius: '2px', color: 'rgba(255,255,255,0.5)' }}>Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="px-3 py-1 font-mono text-[0.52rem] border disabled:opacity-30" style={{ borderColor: 'rgba(255,255,255,0.08)', borderRadius: '2px', color: 'rgba(255,255,255,0.5)' }}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Form Drawer */}
      <FormDrawer open={showForm} onClose={() => setShowForm(false)} title={form?._id ? 'Edit Product' : 'Add Product'} onSave={() => save.mutate(form)} saving={save.isPending}>
        {form && (
          <>
            <Field label="Product Name *">
              <input required value={form.name} onChange={e => up('name', e.target.value)} className="input-field" placeholder="Product name…" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category *">
                <select required value={form.category} onChange={e => up('category', e.target.value)} className="input-field">
                  <option value="">Select…</option>
                  {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="SKU">
                <input value={form.sku || ''} onChange={e => up('sku', e.target.value)} className="input-field" placeholder="IV-001" />
              </Field>
            </div>
            <Field label="Short Description">
              <input value={form.shortDesc || ''} onChange={e => up('shortDesc', e.target.value)} className="input-field" placeholder="One-line summary…" />
            </Field>
            <Field label="Full Description">
              <textarea value={form.description || ''} onChange={e => up('description', e.target.value)} rows={4} className="input-field resize-none" placeholder="Detailed description…" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (₹)"><input type="number" value={form.price || 0} onChange={e => up('price', +e.target.value)} className="input-field" min="0" /></Field>
              <Field label="MRP (₹)"><input type="number" value={form.mrp || 0} onChange={e => up('mrp', +e.target.value)} className="input-field" min="0" /></Field>
            </div>

            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-[0.52rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>Images</label>
                <button type="button" onClick={() => setShowMedia(true)} className="font-mono text-[0.52rem] tracking-[0.12em] uppercase" style={{ color: 'var(--c-gold)' }}>+ Add Image</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(form.images || []).map((img: any, i: number) => (
                  <div key={i} className="relative w-16 h-16 group overflow-hidden" style={{ borderRadius: '2px' }}>
                    <img src={imgUrl(img.url)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => up('images', form.images.filter((_: any, j: number) => j !== i))}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[0.7rem]"
                      style={{ background: 'rgba(214,58,47,0.8)', color: 'white' }}>✕</button>
                  </div>
                ))}
                {!form.images?.length && <div className="w-16 h-16 flex items-center justify-center border" style={{ borderColor: 'rgba(255,255,255,0.08)', borderRadius: '2px', color: 'rgba(255,255,255,0.25)', fontSize: '1.2rem' }}>+</div>}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block font-mono text-[0.52rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Tags</label>
              <div className="flex gap-2 mb-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag…" className="input-field flex-1 py-2 text-[0.8rem]" />
                <button type="button" onClick={addTag} className="px-4 py-2 font-mono text-[0.55rem] border" style={{ borderColor: 'rgba(201,169,110,0.25)', color: 'var(--c-gold)', borderRadius: '2px' }}>Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(form.tags || []).map((t: string, i: number) => (
                  <span key={i} className="flex items-center gap-1.5 font-mono text-[0.5rem] tracking-[0.12em] uppercase px-2.5 py-1 border" style={{ borderColor: 'rgba(201,169,110,0.2)', color: 'var(--c-gold)', borderRadius: '2px' }}>
                    {t} <button type="button" onClick={() => up('tags', form.tags.filter((_: any, j: number) => j !== i))} style={{ color: 'rgba(201,169,110,0.5)' }}>✕</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Specs */}
            <div>
              <label className="block font-mono text-[0.52rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Specifications</label>
              <div className="flex gap-2 mb-2">
                <input value={specKey} onChange={e => setSpecKey(e.target.value)} placeholder="Key (e.g. Volume)" className="input-field flex-1 py-2 text-[0.8rem]" />
                <input value={specVal} onChange={e => setSpecVal(e.target.value)} placeholder="Value (e.g. 500ml)" className="input-field flex-1 py-2 text-[0.8rem]" />
                <button type="button" onClick={addSpec} className="px-4 py-2 font-mono text-[0.55rem] border" style={{ borderColor: 'rgba(201,169,110,0.25)', color: 'var(--c-gold)', borderRadius: '2px' }}>Add</button>
              </div>
              <div className="space-y-1.5">
                {(form.specifications || []).map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 text-[0.78rem]" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '2px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{s.key}:</span>
                    <span style={{ color: '#f5f0ea' }}>{s.value}</span>
                    <button type="button" onClick={() => up('specifications', form.specifications.filter((_: any, j: number) => j !== i))} className="ml-auto font-mono text-[0.5rem]" style={{ color: '#d63a2f' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO */}
            <div className="border p-4 space-y-3" style={{ borderColor: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
              <p className="font-mono text-[0.52rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>SEO</p>
              <input value={form.seo?.metaTitle || ''} onChange={e => up('seo', { ...form.seo, metaTitle: e.target.value })} placeholder="Meta Title" className="input-field text-[0.8rem]" />
              <textarea value={form.seo?.metaDescription || ''} onChange={e => up('seo', { ...form.seo, metaDescription: e.target.value })} placeholder="Meta Description" rows={2} className="input-field resize-none text-[0.8rem]" />
            </div>

            <div className="flex flex-wrap gap-4">
              <Toggle label="In Stock"    checked={!!form.inStock}      onChange={v => up('inStock', v)}      color="#4ade80" />
              <Toggle label="Featured"   checked={!!form.isFeatured}   onChange={v => up('isFeatured', v)}   color="#c9a96e" />
              <Toggle label="Best Seller"checked={!!form.isBestSeller} onChange={v => up('isBestSeller', v)} color="#fbbf24" />
              <Toggle label="Active"     checked={!!form.isActive}     onChange={v => up('isActive', v)}     color="#4ade80" />
            </div>
          </>
        )}
      </FormDrawer>

      {showMedia && (
        <MediaPicker type="image"
          onSelect={(url, id) => { up('images', [...(form.images||[]), { url: url.replace(process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:5000', ''), id: id || '', alt: '' }]); setShowMedia(false); }}
          onClose={() => setShowMedia(false)}
        />
      )}
      <ConfirmDelete open={!!deleteId} label="product" onConfirm={() => deleteId && remove.mutate(deleteId)} onCancel={() => setDeleteId(null)} />
    </div>
  );
}

