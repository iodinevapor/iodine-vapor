'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { AdminHeader, AddBtn, FormDrawer, Field, StatusBadge } from '@/components/admin/AdminComponents';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminUsers() {
  const { isSuper } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });

  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ['admins'], queryFn: authApi.admins });

  const create = useMutation({
    mutationFn: () => authApi.createAdmin(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admins'] }); toast.success('Admin created!'); setShowForm(false); setForm({ name: '', email: '', password: '', role: 'admin' }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed'),
  });

  const toggle = useMutation({
    mutationFn: authApi.toggle,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admins'] }),
  });

  if (!isSuper) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <span className="font-display text-[3rem]" style={{ color: 'rgba(245,240,234,0.1)' }}>◒</span>
      <p className="font-mono text-[0.58rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>Superadmin access required</p>
    </div>
  );

  return (
    <div>
      <AdminHeader title="Admin Users" subtitle="Manage admin and superadmin accounts"
        action={<AddBtn onClick={() => setShowForm(true)} label="Add Admin" />}
      />

      <div className="border divide-y" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
        {isLoading ? Array.from({length:3}).map((_,i) => <div key={i} className="h-16 shimmer mx-4 my-2" style={{ borderRadius: '2px' }} />) :
        users.map((u: any) => (
          <div key={u._id} className="flex items-center gap-4 px-5 py-4 transition-colors"
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.02)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
            {/* Avatar */}
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center font-display text-[1rem]"
              style={{ background: u.role === 'superadmin' ? 'rgba(201,169,110,0.15)' : 'rgba(139,92,246,0.12)', color: u.role === 'superadmin' ? 'var(--c-gold)' : '#8b5cf6', borderRadius: '2px' }}>
              {u.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-[0.82rem] font-medium">{u.name}</span>
                <span className="font-mono text-[0.48rem] tracking-[0.12em] uppercase px-2 py-0.5"
                  style={{ color: u.role === 'superadmin' ? 'var(--c-gold)' : '#8b5cf6', background: u.role === 'superadmin' ? 'rgba(201,169,110,0.08)' : 'rgba(139,92,246,0.08)', borderRadius: '2px' }}>
                  {u.role}
                </span>
                <StatusBadge status={u.isActive ? 'active' : 'inactive'} />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[0.72rem]" style={{ color: 'rgba(255,255,255,0.45)' }}>{u.email}</span>
                {u.lastLogin && <span className="font-mono text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.25)' }}>Last: {format(new Date(u.lastLogin), 'MMM d, yyyy')}</span>}
              </div>
            </div>
            {u.role !== 'superadmin' && (
              <button onClick={() => toggle.mutate(u._id)}
                className="px-4 py-2 font-mono text-[0.5rem] tracking-[0.12em] uppercase border transition-all"
                style={{ borderColor: u.isActive ? 'rgba(74,222,128,0.2)' : 'rgba(107,114,128,0.2)', color: u.isActive ? '#4ade80' : '#6b7280', borderRadius: '2px' }}>
                {u.isActive ? '● Active' : '○ Disabled'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Create Admin Drawer */}
      <FormDrawer open={showForm} onClose={() => setShowForm(false)} title="Add Admin User"
        onSave={() => create.mutate()} saving={create.isPending}>
        <Field label="Full Name *">
          <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input-field" placeholder="Admin name…" />
        </Field>
        <Field label="Email *">
          <input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="input-field" placeholder="admin@example.com" />
        </Field>
        <Field label="Password *">
          <input required type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} className="input-field" placeholder="Min 6 characters…" minLength={6} />
        </Field>
        <Field label="Role">
          <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} className="input-field">
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </Field>
        <div className="p-3 border text-[0.75rem]" style={{ borderColor: 'rgba(201,169,110,0.15)', background: 'rgba(201,169,110,0.04)', borderRadius: '2px', color: 'rgba(255,255,255,0.5)' }}>
          <strong style={{ color: 'var(--c-gold)' }}>Admin</strong> — Can manage all content.<br />
          <strong style={{ color: 'var(--c-gold)' }}>Superadmin</strong> — Full access including user management, deleting products/categories, and site-critical settings.
        </div>
      </FormDrawer>
    </div>
  );
}

