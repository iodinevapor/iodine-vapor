'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { brandsApi, imgUrl } from '@/lib/api';
import {
  AdminHeader, AddBtn, FormDrawer, Field,
  Toggle, MediaPicker, ConfirmDelete, StatusBadge,
} from '@/components/admin/AdminComponents';
import toast from 'react-hot-toast';

const emptyBrand = () => ({
  name: '', logoUrl: '', logoId: '', website: '', order: 0, isActive: true,
});

export default function AdminBrands() {
  const [form, setForm]         = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const qc  = useQueryClient();
  const inv = () => {
    qc.invalidateQueries({ queryKey: ['admin-brands'] });
    qc.invalidateQueries({ queryKey: ['brands'] });
  };

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: brandsApi.getAll,
  });

  const save = useMutation({
    mutationFn: (d: any) => d._id ? brandsApi.update(d._id, d) : brandsApi.create(d),
    onSuccess: () => { inv(); toast.success('Saved!'); setShowForm(false); },
    onError: (err: any) => {
      console.error('Brand save error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to save';
      toast.error(msg);
    },
  });

  const remove = useMutation({
    mutationFn: brandsApi.delete,
    onSuccess: () => { inv(); toast.success('Deleted'); setDeleteId(null); },
  });

  const toggle = useMutation({
    mutationFn: ({ id, d }: any) => brandsApi.update(id, d),
    onSuccess: inv,
  });

  const up = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <AdminHeader
        title="Trusted Brands"
        subtitle="Manage client logos shown on homepage"
        action={<AddBtn onClick={() => { setForm(emptyBrand()); setShowForm(true); }} />}
      />

      {/* Brand List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 shimmer" style={{ borderRadius: '4px' }} />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-16 border" style={{ borderColor: 'rgba(255,255,255,0.07)', borderRadius: '4px' }}>
          <p className="font-mono text-[0.58rem] tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
            No brands yet
          </p>
          <AddBtn onClick={() => { setForm(emptyBrand()); setShowForm(true); }} label="Add First Brand" />
        </div>
      ) : (
        <div className="space-y-2">
          {brands.map((brand: any) => (
            <motion.div
              key={brand._id}
              layout
              className="flex items-center gap-4 px-4 py-3 border transition-all"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderColor: brand.isActive ? 'rgba(201,169,110,0.15)' : 'rgba(255,255,255,0.05)',
                borderRadius: '4px',
              }}
            >
              {/* Logo preview */}
              <div
                className="w-16 h-10 flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}
              >
                {brand.logoUrl ? (
                  <img
                    src={imgUrl(brand.logoUrl)}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain p-1"
                    style={{ filter: 'brightness(1.5)' }}
                  />
                ) : (
                  <span className="font-mono text-[0.45rem] text-center px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    No Logo
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[0.85rem] font-semibold truncate">
                    {brand.name}
                  </span>
                  <StatusBadge status={brand.isActive ? 'active' : 'inactive'} />
                  {brand.website && (
                    <span className="font-mono text-[0.48rem] tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {brand.website}
                    </span>
                  )}
                </div>
                <p className="font-mono text-[0.5rem] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Order: {brand.order}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => toggle.mutate({ id: brand._id, d: { isActive: !brand.isActive } })}
                  className="px-3 py-1.5 font-mono text-[0.5rem] tracking-[0.12em] uppercase border transition-all"
                  style={{
                    borderColor: brand.isActive ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)',
                    color: brand.isActive ? '#4ade80' : 'rgba(255,255,255,0.35)',
                    borderRadius: '3px',
                  }}
                >
                  {brand.isActive ? '● On' : '○ Off'}
                </button>
                <button
                  onClick={() => { setForm({ ...brand }); setShowForm(true); }}
                  className="px-3 py-1.5 font-mono text-[0.5rem] tracking-[0.12em] uppercase border transition-all"
                  style={{ borderColor: 'rgba(201,169,110,0.2)', color: 'var(--c-gold)', borderRadius: '3px' }}
                  data-hover
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteId(brand._id)}
                  className="px-3 py-1.5 font-mono text-[0.5rem] tracking-[0.12em] uppercase border transition-all"
                  style={{ borderColor: 'rgba(214,58,47,0.2)', color: '#d63a2f', borderRadius: '3px' }}
                  data-hover
                >
                  Del
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Drawer */}
      <FormDrawer
        open={showForm}
        onClose={() => setShowForm(false)}
        title={form?._id ? 'Edit Brand' : 'Add Brand'}
        onSave={() => save.mutate(form)}
        saving={save.isPending}
      >
        {form && (
          <>
            <Field label="Brand Name" required>
              <input
                value={form.name}
                onChange={e => up('name', e.target.value)}
                placeholder="e.g. HYATT Hotels & Resorts"
                className="input-field"
              />
            </Field>

            <Field label="Logo Image">
              <div className="flex gap-2">
                <input
                  value={form.logoUrl}
                  onChange={e => up('logoUrl', e.target.value)}
                  placeholder="URL or pick from media library…"
                  className="input-field flex-1 text-[0.8rem]"
                />
                <button
                  type="button"
                  onClick={() => setShowMedia(true)}
                  className="px-4 py-2.5 font-mono text-[0.55rem] tracking-[0.15em] uppercase border transition-all"
                  style={{ borderColor: 'rgba(201,169,110,0.25)', color: 'var(--c-gold)', borderRadius: '3px' }}
                  data-hover
                >
                  Pick
                </button>
              </div>
              {form.logoUrl && (
                <div className="mt-3 p-3 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', minHeight: '80px' }}>
                  <img
                    src={imgUrl(form.logoUrl)}
                    alt="Preview"
                    className="max-h-16 max-w-full object-contain"
                    style={{ filter: 'brightness(1.5)' }}
                  />
                </div>
              )}
            </Field>

            <Field label="Website URL (optional)">
              <input
                value={form.website || ''}
                onChange={e => up('website', e.target.value)}
                placeholder="https://example.com"
                className="input-field"
              />
            </Field>

            <Field label="Display Order">
              <input
                type="number"
                value={form.order}
                onChange={e => up('order', +e.target.value)}
                className="input-field"
                min={0}
              />
            </Field>

            <Toggle
              label="Active (visible on website)"
              checked={!!form.isActive}
              onChange={v => up('isActive', v)}
            />
          </>
        )}
      </FormDrawer>

      {showMedia && (
        <MediaPicker
          onSelect={(url, id) => { up('logoUrl', url); up('logoId', id || ''); setShowMedia(false); }}
          onClose={() => setShowMedia(false)}
          type="image"
        />
      )}

      <ConfirmDelete
        open={!!deleteId}
        label="brand"
        onConfirm={() => deleteId && remove.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
