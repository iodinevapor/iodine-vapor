'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { settingsApi, imgUrl } from '@/lib/api';
import { AdminHeader, MediaPicker } from '@/components/admin/AdminComponents';
import toast from 'react-hot-toast';

const GROUPS = [
  { key: 'brand',   label: 'Brand',    icon: '◎' },
  { key: 'about',   label: 'About',    icon: '◑' },
  { key: 'team',    label: 'Team',     icon: '◴' },
  { key: 'colors',  label: 'Colors',   icon: '◐' },
  { key: 'contact', label: 'Contact',  icon: '◻' },
  { key: 'social',  label: 'Social',   icon: '◌' },
  { key: 'stats',   label: 'Stats',    icon: '◈' },
  { key: 'footer',  label: 'Footer',   icon: '◧' },
];

const META: Record<string, { label: string; type: string; group: string; placeholder?: string }> = {
  site_name:          { label: 'Site Name',           type: 'text',     group: 'brand',   placeholder: 'Iodine Vapor' },
  site_tagline:       { label: 'Tagline',             type: 'text',     group: 'brand',   placeholder: 'Visual Stories That Convert' },
  site_logo:          { label: 'Logo',                type: 'media',    group: 'brand' },
  site_favicon:       { label: 'Favicon',             type: 'media',    group: 'brand' },
  hero_eyebrow:       { label: 'Hero Eyebrow Text',   type: 'text',     group: 'brand',   placeholder: 'Pan-India Commercial Photography' },
  about_text:         { label: 'Our Story',           type: 'textarea', group: 'about',   placeholder: 'Founded in 2010, Studio Iodine Vapor...' },
  about_image:        { label: 'About Image',         type: 'media',    group: 'about' },
  about_founded:      { label: 'Founded Year',        type: 'text',     group: 'about',   placeholder: '2010' },
  about_mission:      { label: 'Mission Statement',   type: 'textarea', group: 'about',   placeholder: 'To create visual stories that...' },
  about_why_us:       { label: 'Why Studio Iodine Vapor', type: 'textarea', group: 'about', placeholder: 'We bring 14+ years of...' },
  about_equipment:    { label: 'Equipment (one per line)', type: 'textarea', group: 'about', placeholder: 'Nikon Z9 Pro\nGodox AD600 Pro\nDJI Ronin 4D' },
  about_awards:       { label: 'Awards & Publications (one per line)', type: 'textarea', group: 'about', placeholder: 'Nikon NPS Member\nFeatured in Business Today\nMSME Certified' },
  client_brands:      { label: 'Client Names (comma-separated)', type: 'text', group: 'about', placeholder: 'HYATT, JK Lakshmi Cement, AIIMS' },
  team_member_1_name: { label: 'Team Member 1 – Name',  type: 'text',  group: 'team', placeholder: 'Jatin Sharma' },
  team_member_1_role: { label: 'Team Member 1 – Role',  type: 'text',  group: 'team', placeholder: 'Lead Photographer & Founder' },
  team_member_1_bio:  { label: 'Team Member 1 – Bio',   type: 'textarea', group: 'team', placeholder: '14+ years of commercial photography...' },
  team_member_1_img:  { label: 'Team Member 1 – Photo', type: 'media', group: 'team' },
  team_member_2_name: { label: 'Team Member 2 – Name',  type: 'text',  group: 'team', placeholder: 'Name' },
  team_member_2_role: { label: 'Team Member 2 – Role',  type: 'text',  group: 'team', placeholder: 'Role' },
  team_member_2_bio:  { label: 'Team Member 2 – Bio',   type: 'textarea', group: 'team', placeholder: 'Bio...' },
  team_member_2_img:  { label: 'Team Member 2 – Photo', type: 'media', group: 'team' },
  team_member_3_name: { label: 'Team Member 3 – Name',  type: 'text',  group: 'team', placeholder: 'Name' },
  team_member_3_role: { label: 'Team Member 3 – Role',  type: 'text',  group: 'team', placeholder: 'Role' },
  team_member_3_bio:  { label: 'Team Member 3 – Bio',   type: 'textarea', group: 'team', placeholder: 'Bio...' },
  team_member_3_img:  { label: 'Team Member 3 – Photo', type: 'media', group: 'team' },
  primary_color:      { label: 'Primary (Pink/Gold)',  type: 'color', group: 'colors' },
  secondary_color:    { label: 'Secondary (Red)',      type: 'color', group: 'colors' },
  accent_color:       { label: 'Accent (Purple)',      type: 'color', group: 'colors' },
  bg_color:           { label: 'Background',           type: 'color', group: 'colors' },
  text_color:         { label: 'Text',                 type: 'color', group: 'colors' },
  contact_email:      { label: 'Email',                type: 'email', group: 'contact', placeholder: 'hello@iodinevapor.com' },
  contact_phone:      { label: 'Phone',                type: 'text',  group: 'contact', placeholder: '+91 98765 43210' },
  contact_phone2:     { label: 'Phone 2 (optional)',   type: 'text',  group: 'contact', placeholder: '+91 98765 43210' },
  contact_address:    { label: 'Address',              type: 'textarea', group: 'contact', placeholder: '123, Studio Lane, Mumbai, Maharashtra 400001' },
  contact_whatsapp:   { label: 'WhatsApp Number',      type: 'text',  group: 'contact', placeholder: '919876543210 (with country code, no +)' },
  contact_map_embed:  { label: 'Google Maps Embed URL', type: 'textarea', group: 'contact', placeholder: 'https://maps.google.com/maps?q=...&output=embed' },
  contact_hours:      { label: 'Business Hours',       type: 'textarea', group: 'contact', placeholder: 'Mon–Sat: 9am – 7pm\nSunday: By appointment' },
  social_instagram:   { label: 'Instagram URL',        type: 'url',   group: 'social',  placeholder: 'https://instagram.com/…' },
  social_youtube:     { label: 'YouTube URL',          type: 'url',   group: 'social',  placeholder: 'https://youtube.com/…' },
  social_linkedin:    { label: 'LinkedIn URL',         type: 'url',   group: 'social',  placeholder: 'https://linkedin.com/…' },
  social_behance:     { label: 'Behance URL',          type: 'url',   group: 'social',  placeholder: 'https://behance.net/…' },
  social_facebook:    { label: 'Facebook URL',         type: 'url',   group: 'social',  placeholder: 'https://facebook.com/…' },
  years_experience:   { label: 'Years Experience',     type: 'text',  group: 'stats',   placeholder: '14+' },
  projects_count:     { label: 'Projects Count',       type: 'text',  group: 'stats',   placeholder: '2000+' },
  schools_count:      { label: 'Happy Clients',        type: 'text',  group: 'stats',   placeholder: '500+' },
  cinemas_count:      { label: 'Cinemas Count',        type: 'text',  group: 'stats',   placeholder: '32' },
  footer_copy:        { label: 'Footer Copyright',     type: 'text',  group: 'footer',  placeholder: '© 2025 Studio Iodine Vapor' },
};

export default function AdminSettings() {
  const [activeGroup, setActiveGroup] = useState('brand');
  const [values, setValues]           = useState<Record<string, any>>({});
  const [dirty, setDirty]             = useState(false);
  const [mediaKey, setMediaKey]       = useState<string | null>(null);

  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });

  useEffect(() => { if (settings) { setValues(settings); setDirty(false); } }, [settings]);

  const saveMut = useMutation({
    mutationFn: () => settingsApi.save(Object.entries(values).map(([key, value]) => ({ key, value, group: META[key]?.group || 'general', label: META[key]?.label || key }))),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); toast.success('Settings saved!'); setDirty(false); },
    onError: () => toast.error('Failed to save'),
  });

  const set = (key: string, val: any) => { setValues(v => ({ ...v, [key]: val })); setDirty(true); };

  const groupFields = Object.entries(META).filter(([, m]) => m.group === activeGroup);

  return (
    <div>
      <AdminHeader title="Site Settings" subtitle="Configure your website globally"
        action={
          <button onClick={() => saveMut.mutate()} disabled={!dirty || saveMut.isPending}
            className="flex items-center gap-2 px-5 py-2.5 font-mono text-[0.58rem] tracking-[0.18em] uppercase transition-all"
            style={{ background: dirty ? 'var(--c-gold)' : 'rgba(0,0,0,0.07)', color: dirty ? '#080808' : 'rgba(0,0,0,0.35)', borderRadius: '2px', cursor: dirty ? 'pointer' : 'not-allowed' }}>
            {saveMut.isPending ? '…' : '✓'} {dirty ? 'Save Changes' : 'Saved'}
          </button>
        }
      />

      <div className="flex gap-6">
        {/* Group Nav */}
        <div className="w-44 flex-shrink-0">
          <div className="border p-2 space-y-0.5" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '6px' }}>
            {GROUPS.map(g => (
              <button key={g.key} onClick={() => setActiveGroup(g.key)}
                className="w-full flex items-center gap-3 px-4 py-3 text-[0.7rem] tracking-[0.08em] uppercase transition-all font-semibold"
                style={{ borderRadius: '4px', background: activeGroup === g.key ? 'rgba(233,30,140,0.1)' : 'transparent', color: activeGroup === g.key ? '#ffffff' : 'rgba(255,255,255,0.5)', borderLeft: activeGroup === g.key ? '3px solid #e91e8c' : '3px solid transparent' }}>
                <span style={{ color: activeGroup === g.key ? '#e91e8c' : 'rgba(255,255,255,0.4)' }}>{g.icon}</span> {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 border p-6" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
          {isLoading ? (
            <div className="space-y-4">{Array.from({length:5}).map((_,i) => <div key={i} className="h-12 shimmer" style={{ borderRadius: '2px' }} />)}</div>
          ) : (
            <motion.div key={activeGroup} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <h2 className="font-display text-[1.3rem] tracking-[0.06em] mb-5 capitalize">{activeGroup} Settings</h2>

              {groupFields.map(([key, meta]) => (
                <div key={key}>
                  <label className="block font-mono text-[0.52rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{meta.label}</label>

                  {meta.type === 'color' && (
                    <div className="flex items-center gap-3">
                      <input type="color" value={values[key] || '#080808'} onChange={e => set(key, e.target.value)} className="w-12 h-12 border-0 bg-transparent cursor-pointer" style={{ borderRadius: '2px' }} />
                      <input value={values[key] || ''} onChange={e => set(key, e.target.value)} className="input-field flex-1" placeholder="#c9a96e" />
                      {values[key] && <div className="w-12 h-12 border flex-shrink-0" style={{ background: values[key], borderColor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />}
                    </div>
                  )}

                  {meta.type === 'media' && (
                    <div className="flex items-center gap-3">
                      <input value={values[key] || ''} onChange={e => set(key, e.target.value)} className="input-field flex-1 text-[0.8rem]" placeholder="URL or pick from library…" />
                      <button onClick={() => setMediaKey(key)} className="px-4 py-3 font-mono text-[0.55rem] tracking-[0.15em] uppercase border transition-all" style={{ borderColor: 'rgba(201,169,110,0.25)', color: 'var(--c-gold)', borderRadius: '2px' }} data-hover>Pick</button>
                      {values[key] && <img src={imgUrl(values[key])} alt="" className="h-12 w-12 object-contain border flex-shrink-0" style={{ background: 'rgba(0,0,0,0.06)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />}
                    </div>
                  )}

                  {!['color', 'media', 'textarea'].includes(meta.type) && (
                    <input type={meta.type} value={values[key] || ''} onChange={e => set(key, e.target.value)} className="input-field" placeholder={meta.placeholder} />
                  )}

                  {meta.type === 'textarea' && (
                    <textarea value={values[key] || ''} onChange={e => set(key, e.target.value)} className="input-field resize-none" rows={5} placeholder={meta.placeholder} />
                  )}
                </div>
              ))}

              {/* Color preview */}
              {activeGroup === 'colors' && (
                <div className="mt-6 p-4 border" style={{ borderColor: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                  <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Live Preview</p>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {['primary_color','secondary_color','accent_color','bg_color','text_color'].map(k => values[k] && (
                      <div key={k} className="flex items-center gap-2">
                        <div className="w-8 h-8 border" style={{ background: values[k], borderColor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
                        <span className="font-mono text-[0.46rem] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>{META[k]?.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-10" style={{ background: `linear-gradient(135deg, ${values.primary_color || '#c9a96e'}, ${values.secondary_color || '#d63a2f'})`, borderRadius: '2px' }} />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {mediaKey && <MediaPicker onSelect={(url) => { set(mediaKey, url); setMediaKey(null); }} onClose={() => setMediaKey(null)} type="image" />}
    </div>
  );
}

