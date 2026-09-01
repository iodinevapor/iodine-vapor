'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi, api, imgUrl } from '@/lib/api';
import { AdminHeader, AddBtn, FormDrawer, Field, Toggle, ConfirmDelete, StatusBadge, MediaPicker } from '@/components/admin/AdminComponents';
import toast from 'react-hot-toast';
import { GiPhotoCamera } from 'react-icons/gi';
import { FaHospitalUser, FaBuilding, FaBagShopping, FaUserTie } from 'react-icons/fa6';
import { IoFastFoodOutline, IoStorefront } from 'react-icons/io5';
import { LiaIndustrySolid } from 'react-icons/lia';
import { MdOutlineCastForEducation } from 'react-icons/md';
import { SiInstructure, SiCinema4D } from 'react-icons/si';
import { TbCreativeCommonsBy, TbBuildingSkyscraper } from 'react-icons/tb';
import { BsBoxSeam, BsCamera, BsCameraVideo } from 'react-icons/bs';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';

// Icon definitions — key is the icon id stored in DB
const ICON_MAP: Record<string, React.ReactNode> = {
  camera:       <GiPhotoCamera size={20} />,
  hospital:     <FaHospitalUser size={20} />,
  food:         <IoFastFoodOutline size={20} />,
  industry:     <LiaIndustrySolid size={20} />,
  education:    <MdOutlineCastForEducation size={20} />,
  structure:    <SiInstructure size={20} />,
  creative:     <TbCreativeCommonsBy size={20} />,
  cinema:       <SiCinema4D size={20} />,
  building:     <FaBuilding size={20} />,
  skyscraper:   <TbBuildingSkyscraper size={20} />,
  shopping:     <FaBagShopping size={20} />,
  portrait:     <FaUserTie size={20} />,
  storefront:   <IoStorefront size={20} />,
  box:          <BsBoxSeam size={20} />,
  video:        <BsCameraVideo size={20} />,
  photo:        <BsCamera size={20} />,
  office:       <HiOutlineOfficeBuilding size={20} />,
};

const ICON_KEYS = Object.keys(ICON_MAP);
const SERVICE_CATS = ['Spaces', 'Industries', 'Products', 'People', 'Special Projects', 'Other'];
const empty = () => ({ name: '', category: 'Other', icon: 'camera', shortDesc: '', description: '', imageUrl: '', features: [], order: 0, isActive: true });

// Helper to render icon by key
function SvcIcon({ iconKey, size = 20, color }: { iconKey: string; size?: number; color?: string }) {
  const icons: Record<string, React.ReactNode> = {
    camera:       <GiPhotoCamera size={size} color={color} />,
    hospital:     <FaHospitalUser size={size} color={color} />,
    food:         <IoFastFoodOutline size={size} color={color} />,
    industry:     <LiaIndustrySolid size={size} color={color} />,
    education:    <MdOutlineCastForEducation size={size} color={color} />,
    structure:    <SiInstructure size={size} color={color} />,
    creative:     <TbCreativeCommonsBy size={size} color={color} />,
    cinema:       <SiCinema4D size={size} color={color} />,
    building:     <FaBuilding size={size} color={color} />,
    skyscraper:   <TbBuildingSkyscraper size={size} color={color} />,
    shopping:     <FaBagShopping size={size} color={color} />,
    portrait:     <FaUserTie size={size} color={color} />,
    storefront:   <IoStorefront size={size} color={color} />,
    box:          <BsBoxSeam size={size} color={color} />,
    video:        <BsCameraVideo size={size} color={color} />,
    photo:        <BsCamera size={size} color={color} />,
    office:       <HiOutlineOfficeBuilding size={size} color={color} />,
  };
  return <>{icons[iconKey] || <GiPhotoCamera size={size} color={color} />}</>;
}

export default function AdminServices() {
  const [form, setForm]           = useState<any>(null);
  const [showForm, setShowForm]   = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [featInput, setFeatInput] = useState('');

  const qc  = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ['services'] });

  const { data: services = [], isLoading } = useQuery({ queryKey: ['services'], queryFn: servicesApi.getAll });
  const save   = useMutation({ mutationFn: (d: any) => d._id ? servicesApi.update(d._id, d) : servicesApi.create(d), onSuccess: () => { inv(); toast.success('Saved!'); setShowForm(false); }, onError: () => toast.error('Failed') });
  const remove = useMutation({ mutationFn: servicesApi.delete, onSuccess: () => { inv(); toast.success('Deleted'); setDeleteId(null); } });

  const up     = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const addFeat = () => { if (featInput.trim()) { up('features', [...(form.features || []), featInput.trim()]); setFeatInput(''); } };

  const fixSlugs = async () => {
    try {
      const res = await api.get('/services/fix-slugs');
      inv();
      toast.success(res.data.message || 'Slugs fixed!');
    } catch {
      toast.error('Fix slugs failed');
    }
  };

  return (
    <div>
      <AdminHeader
        title="Services"
        subtitle={`${(services as any[]).length} services`}
        action={
          <div className="flex gap-2">
            <button onClick={fixSlugs}
              className="px-4 py-2.5 font-mono text-[0.52rem] tracking-[0.15em] uppercase border transition-all"
              style={{ borderColor: 'rgba(233,30,140,0.25)', color: '#e91e8c', borderRadius: '4px' }}
              title="Generate slugs for all services that don't have one (needed for detail pages)">
              ⚡ Fix Slugs
            </button>
            <AddBtn onClick={() => { setForm(empty()); setShowForm(true); }} label="Add Service" />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-36 shimmer" style={{ borderRadius: '4px' }} />)
          : (services as any[]).length === 0
          ? (
            <div className="col-span-3 p-16 text-center border" style={{ borderColor: 'rgba(255,255,255,0.07)', borderRadius: '4px' }}>
              <p className="font-mono text-[0.58rem] tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>No services yet</p>
              <AddBtn onClick={() => { setForm(empty()); setShowForm(true); }} label="Add First Service" />
            </div>
          )
          : (services as any[]).map((svc: any) => (
            <div
              key={svc._id}
              className="group border p-5 transition-all duration-300 relative"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '4px' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(233,30,140,0.2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg" style={{ background: 'rgba(233,30,140,0.1)' }}>
                  <SvcIcon iconKey={svc.icon} size={22} color="#e91e8c" />
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setForm({ ...svc }); setShowForm(true); }} className="px-2.5 py-1 font-mono text-[0.44rem] border" style={{ borderColor: 'rgba(201,169,110,0.2)', color: 'var(--c-gold)', borderRadius: '3px' }}>Edit</button>
                  <button onClick={() => setDeleteId(svc._id)} className="px-2.5 py-1 font-mono text-[0.44rem] border" style={{ borderColor: 'rgba(214,58,47,0.2)', color: '#d63a2f', borderRadius: '3px' }}>Del</button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h3 className="font-semibold text-[0.95rem]">{svc.name}</h3>
                <StatusBadge status={svc.isActive ? 'active' : 'inactive'} />
                {svc.category && (
                  <span className="font-mono text-[0.44rem] tracking-[0.1em] uppercase px-1.5 py-0.5"
                    style={{ color: '#e91e8c', background: 'rgba(233,30,140,0.08)', borderRadius: '2px' }}>
                    {svc.category}
                  </span>
                )}
              </div>
              <p className="text-[0.75rem] leading-[1.6]" style={{ color: 'rgba(255,255,255,0.45)' }}>{svc.shortDesc}</p>
              {svc.slug && (
                <p className="mt-2 font-mono text-[0.44rem] tracking-[0.1em] truncate" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  /services/{svc.slug}
                </p>
              )}
              {!svc.slug && (
                <p className="mt-2 font-mono text-[0.44rem] tracking-[0.1em]" style={{ color: '#d63a2f' }}>
                  ⚠ No slug — click "Fix Slugs"
                </p>
              )}
            </div>
          ))
        }
      </div>

      {/* Form Drawer */}
      <FormDrawer
        open={showForm}
        onClose={() => setShowForm(false)}
        title={form?._id ? 'Edit Service' : 'Add Service'}
        onSave={() => save.mutate(form)}
        saving={save.isPending}
      >
        {form && (
          <>
            <Field label="Name *">
              <input required value={form.name} onChange={e => up('name', e.target.value)} className="input-field" placeholder="Service name…" />
            </Field>

            {form._id && form.slug && (
              <div className="px-3 py-2 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="font-mono text-[0.46rem] tracking-[0.18em] uppercase mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>URL Slug (auto-generated)</p>
                <p className="font-mono text-[0.7rem]" style={{ color: '#e91e8c' }}>/services/{form.slug}</p>
              </div>
            )}

            <Field label="Category">
              <select value={form.category || 'Other'} onChange={e => up('category', e.target.value)} className="input-field">
                {SERVICE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Icon">
              <div className="grid grid-cols-5 gap-2">
                {ICON_KEYS.map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => up('icon', key)}
                    title={key}
                    className="h-12 flex flex-col items-center justify-center gap-1 border transition-all"
                    style={{
                      borderColor: form.icon === key ? '#e91e8c' : 'rgba(255,255,255,0.1)',
                      background:  form.icon === key ? 'rgba(233,30,140,0.12)' : 'rgba(255,255,255,0.02)',
                      borderRadius: '6px',
                    }}
                  >
                    <SvcIcon iconKey={key} size={18} color={form.icon === key ? '#e91e8c' : 'rgba(255,255,255,0.5)'} />
                    <span className="font-mono text-[0.38rem] uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.3)' }}>{key}</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Short Description">
              <input value={form.shortDesc || ''} onChange={e => up('shortDesc', e.target.value)} className="input-field" placeholder="One-liner description…" />
            </Field>

            <Field label="Full Description">
              <textarea value={form.description || ''} onChange={e => up('description', e.target.value)} rows={3} className="input-field resize-none" placeholder="Detailed description…" />
            </Field>

            <div>
              <label className="block font-mono text-[0.52rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Features</label>
              <div className="flex gap-2 mb-2">
                <input value={featInput} onChange={e => setFeatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeat())}
                  placeholder="Add feature…" className="input-field flex-1 py-2 text-[0.8rem]" />
                <button type="button" onClick={addFeat} className="px-4 py-2 font-mono text-[0.55rem] border"
                  style={{ borderColor: 'rgba(201,169,110,0.25)', color: 'var(--c-gold)', borderRadius: '3px' }}>Add</button>
              </div>
              <div className="space-y-1.5">
                {(form.features || []).map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-[0.78rem]"
                    style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '3px' }}>
                    <span style={{ color: 'var(--c-gold)', fontSize: '0.5rem' }}>✦</span>
                    <span className="flex-1">{f}</span>
                    <button type="button" onClick={() => up('features', form.features.filter((_: any, j: number) => j !== i))}
                      className="font-mono text-[0.5rem]" style={{ color: '#d63a2f' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            <Field label="Display Order">
              <input type="number" value={form.order || 0} onChange={e => up('order', +e.target.value)} className="input-field" />
            </Field>

            <Field label="Service Image">
              <div className="flex gap-2">
                <input value={form.imageUrl || ''} onChange={e => up('imageUrl', e.target.value)}
                  placeholder="URL or pick from library…" className="input-field flex-1 text-[0.8rem]" />
                <button type="button" onClick={() => setShowMedia(true)}
                  className="px-4 py-2.5 font-mono text-[0.55rem] tracking-[0.15em] uppercase border transition-all"
                  style={{ borderColor: 'rgba(233,30,140,0.25)', color: '#e91e8c', borderRadius: '4px' }}>Pick</button>
              </div>
              {form.imageUrl && <img src={imgUrl(form.imageUrl)} alt="" className="mt-2 h-24 w-full object-cover" style={{ borderRadius: '4px' }} />}
            </Field>

            <Toggle label="Active / Visible" checked={!!form.isActive} onChange={v => up('isActive', v)} />
          </>
        )}
      </FormDrawer>

      <ConfirmDelete open={!!deleteId} label="service" onConfirm={() => deleteId && remove.mutate(deleteId)} onCancel={() => setDeleteId(null)} />
      {showMedia && <MediaPicker onSelect={(url) => { up('imageUrl', url); setShowMedia(false); }} onClose={() => setShowMedia(false)} type="image" />}
    </div>
  );
}
