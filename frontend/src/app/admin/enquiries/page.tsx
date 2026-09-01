'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { enquiriesApi, imgUrl } from '@/lib/api';
import { AdminHeader, ConfirmDelete, StatusBadge } from '@/components/admin/AdminComponents';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';

const STATUS_OPTS = ['new', 'read', 'replied', 'closed'];
const TYPE_OPTS   = ['contact', 'quote', 'workshop', 'service'];

export default function AdminEnquiries() {
  const [typeFilter,   setTypeFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page,         setPage]         = useState(1);
  const [selected,     setSelected]     = useState<any | null>(null);
  const [checked,      setChecked]      = useState<Set<string>>(new Set());
  const [deleteId,     setDeleteId]     = useState<string | null>(null);
  const [bulkDelete,   setBulkDelete]   = useState(false);

  // Email compose state
  const [emailOpen,    setEmailOpen]    = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody,    setEmailBody]    = useState('');
  const [emailSending, setEmailSending] = useState(false);

  const qc  = useQueryClient();
  const inv = () => { qc.invalidateQueries({ queryKey: ['enquiries'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); };

  const { data, isLoading } = useQuery({
    queryKey: ['enquiries', { type: typeFilter, status: statusFilter, page }],
    queryFn:  () => enquiriesApi.get({ type: typeFilter || undefined, status: statusFilter || undefined, page, limit: 20 }),
  });

  const updateMut = useMutation({ mutationFn: ({ id, d }: any) => enquiriesApi.update(id, d), onSuccess: () => inv() });
  const removeMut = useMutation({
    mutationFn: enquiriesApi.delete,
    onSuccess: () => { inv(); toast.success('Deleted'); setDeleteId(null); setSelected(null); setChecked(new Set()); },
  });

  const enquiries  = data?.enquiries || [];
  const totalPages = data?.pages     || 1;
  const allChecked = enquiries.length > 0 && enquiries.every((e: any) => checked.has(e._id));

  const openDetail = (e: any) => {
    setSelected(e);
    if (e.status === 'new') updateMut.mutate({ id: e._id, d: { status: 'read' } });
  };

  const toggleCheck = (id: string, ev: React.MouseEvent) => {
    ev.stopPropagation();
    setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleAll = () => {
    if (allChecked) setChecked(new Set());
    else setChecked(new Set(enquiries.map((e: any) => e._id)));
  };

  const handleBulkDelete = async () => {
    for (const id of Array.from(checked)) await enquiriesApi.delete(id);
    inv(); toast.success(`${checked.size} deleted`);
    setChecked(new Set()); setBulkDelete(false); setSelected(null);
  };

  const checkedEmails = enquiries
    .filter((e: any) => checked.has(e._id))
    .map((e: any) => e.email)
    .filter(Boolean)
    .join(', ');

  const handleSendEmail = async () => {
    if (!emailSubject || !emailBody) { toast.error('Subject and body required'); return; }
    setEmailSending(true);
    try {
      // Mark all selected as replied
      await Promise.all(Array.from(checked).map(id => enquiriesApi.update(id, { status: 'replied' })));
      inv();
      toast.success(`Email composed for ${checked.size} recipient(s). Copy from compose box.`);
      // Open mailto as fallback (real SMTP can be added backend-side)
      const mailto = `mailto:${checkedEmails}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(mailto, '_blank');
      setEmailOpen(false); setEmailSubject(''); setEmailBody(''); setChecked(new Set());
    } catch {
      toast.error('Failed');
    } finally {
      setEmailSending(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '10px 14px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px', color: '#ffffff', fontSize: '0.82rem',
    fontFamily: 'Helvetica Neue, Helvetica, sans-serif', outline: 'none',
  };

  return (
    <div>
      <AdminHeader title="Enquiries" subtitle={`${data?.total || 0} total`} />

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="input-field w-36 py-2 text-[0.78rem]">
          <option value="">All Types</option>
          {TYPE_OPTS.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-36 py-2 text-[0.78rem]">
          <option value="">All Status</option>
          {STATUS_OPTS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>

        {/* Bulk actions */}
        {checked.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="font-mono text-[0.52rem] tracking-[0.1em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {checked.size} selected
            </span>
            <button onClick={() => setEmailOpen(true)}
              className="flex items-center gap-2 px-4 py-2 font-mono text-[0.55rem] tracking-[0.15em] uppercase transition-all"
              style={{ background: 'rgba(233,30,140,0.12)', border: '1px solid rgba(233,30,140,0.3)', color: '#e91e8c', borderRadius: '4px' }}>
              ✉ Send Email
            </button>
            <button onClick={() => setBulkDelete(true)}
              className="flex items-center gap-2 px-4 py-2 font-mono text-[0.55rem] tracking-[0.15em] uppercase transition-all"
              style={{ background: 'rgba(214,58,47,0.1)', border: '1px solid rgba(214,58,47,0.25)', color: '#d63a2f', borderRadius: '4px' }}>
              ✕ Delete
            </button>
            <button onClick={() => setChecked(new Set())}
              className="px-3 py-2 font-mono text-[0.52rem]"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-5">
        {/* ── List ─────────────────────────────────────────────────────────── */}
        <div className={`${selected ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
          <div className="border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '4px' }}>

            {/* Select-all header */}
            {enquiries.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div onClick={toggleAll}
                  className="w-4 h-4 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all"
                  style={{ borderRadius: '3px', border: `2px solid ${allChecked ? '#e91e8c' : 'rgba(255,255,255,0.2)'}`, background: allChecked ? '#e91e8c' : 'transparent' }}>
                  {allChecked && <span className="text-white" style={{ fontSize: '0.5rem', lineHeight: 1 }}>✓</span>}
                </div>
                <span className="font-mono text-[0.48rem] tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Select All</span>
              </div>
            )}

            {isLoading ? (
              <div className="p-4 space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 shimmer" style={{ borderRadius: '3px' }} />)}</div>
            ) : enquiries.length === 0 ? (
              <div className="p-12 text-center">
                <p className="font-mono text-[0.58rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>No enquiries</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {enquiries.map((e: any) => (
                  <div key={e._id}
                    className="flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors"
                    style={{ background: selected?._id === e._id ? 'rgba(233,30,140,0.04)' : 'transparent' }}
                    onMouseEnter={ev => (ev.currentTarget as HTMLElement).style.background = selected?._id === e._id ? 'rgba(233,30,140,0.04)' : 'rgba(255,255,255,0.01)'}
                    onMouseLeave={ev => (ev.currentTarget as HTMLElement).style.background = selected?._id === e._id ? 'rgba(233,30,140,0.04)' : 'transparent'}
                    onClick={() => openDetail(e)}
                  >
                    {/* Checkbox */}
                    <div onClick={ev => toggleCheck(e._id, ev)}
                      className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-1 cursor-pointer transition-all"
                      style={{ borderRadius: '3px', border: `2px solid ${checked.has(e._id) ? '#e91e8c' : 'rgba(255,255,255,0.15)'}`, background: checked.has(e._id) ? '#e91e8c' : 'transparent' }}>
                      {checked.has(e._id) && <span className="text-white" style={{ fontSize: '0.5rem', lineHeight: 1 }}>✓</span>}
                    </div>

                    {/* Avatar */}
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold text-[0.85rem]"
                      style={{ background: 'rgba(233,30,140,0.12)', color: '#e91e8c', borderRadius: '50%' }}>
                      {e.name?.[0]?.toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className={`text-[0.8rem] ${e.status === 'new' ? 'font-semibold' : 'opacity-70'}`} style={{ color: '#f5f0ea' }}>{e.name}</span>
                        <StatusBadge status={e.status} />
                        <span className="font-mono text-[0.46rem] tracking-[0.12em] uppercase px-1.5 py-0.5 capitalize"
                          style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '3px', color: 'rgba(255,255,255,0.4)' }}>{e.type}</span>
                        {e.fileUrl && <span className="font-mono text-[0.44rem] px-1.5 py-0.5" style={{ background: 'rgba(201,169,110,0.1)', color: 'var(--c-gold)', borderRadius: '3px' }}>📎 File</span>}
                        {e.status === 'new' && <span className="w-1.5 h-1.5 rounded-full ml-auto flex-shrink-0" style={{ background: '#e91e8c' }} />}
                      </div>
                      <p className="text-[0.7rem] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{e.subject || e.message?.slice(0, 55)}</p>
                      <p className="text-[0.6rem] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {e.email} · {formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="font-mono text-[0.52rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>Page {page}/{totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1 font-mono text-[0.52rem] border transition-all disabled:opacity-30"
                    style={{ borderColor: 'rgba(255,255,255,0.08)', borderRadius: '3px', color: 'rgba(255,255,255,0.5)' }}>Prev</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1 font-mono text-[0.52rem] border transition-all disabled:opacity-30"
                    style={{ borderColor: 'rgba(255,255,255,0.08)', borderRadius: '3px', color: 'rgba(255,255,255,0.5)' }}>Next</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Detail Panel ──────────────────────────────────────────────────── */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="w-1/2 border sticky top-6 self-start overflow-y-auto space-y-5"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(233,30,140,0.12)', borderRadius: '6px', maxHeight: 'calc(100vh - 160px)', padding: '20px' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-[1.15rem]" style={{ fontFamily: "'Syne', sans-serif" }}>{selected.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <StatusBadge status={selected.status} />
                    <span className="font-mono text-[0.46rem] tracking-[0.1em] uppercase px-1.5 py-0.5 capitalize"
                      style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '3px', color: 'rgba(255,255,255,0.4)' }}>{selected.type}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="w-7 h-7 flex items-center justify-center transition-colors"
                  style={{ color: 'rgba(255,255,255,0.35)', borderRadius: '4px' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ffffff'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'}>✕</button>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 gap-2 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { label: 'Email',   value: selected.email,   href: `mailto:${selected.email}` },
                  { label: 'Phone',   value: selected.phone,   href: `tel:${selected.phone}` },
                  { label: 'Company', value: selected.company,  href: null },
                  { label: 'Service', value: selected.service,  href: null },
                  { label: 'Date',    value: selected.createdAt ? format(new Date(selected.createdAt), 'MMM d, yyyy · h:mm a') : '', href: null },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className="flex items-start gap-3">
                    <span className="font-mono text-[0.46rem] tracking-[0.18em] uppercase w-14 flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{row.label}</span>
                    {row.href ? (
                      <a href={row.href} className="text-[0.78rem] transition-colors hover:text-[#e91e8c] break-all" style={{ color: 'rgba(255,255,255,0.65)' }}>{row.value}</a>
                    ) : (
                      <span className="text-[0.78rem] break-all" style={{ color: 'rgba(255,255,255,0.65)' }}>{row.value}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Message */}
              <div>
                {selected.subject && <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase mb-2" style={{ color: '#e91e8c' }}>{selected.subject}</p>}
                <div className="p-4 rounded-lg" style={{ background: 'rgba(8,8,8,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[0.82rem] leading-[1.75] whitespace-pre-wrap" style={{ color: 'rgba(245,240,234,0.6)' }}>{selected.message}</p>
                </div>
              </div>

              {/* File attachment */}
              {selected.fileUrl && (
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.15)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.64 17.23a2 2 0 01-2.83-2.83l8.49-8.48"/>
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.72rem] font-medium truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{selected.fileName || 'Attachment'}</p>
                  </div>
                  <a href={imgUrl(selected.fileUrl)} target="_blank" rel="noopener noreferrer"
                    className="font-mono text-[0.5rem] tracking-[0.12em] uppercase px-3 py-1.5 transition-all"
                    style={{ background: 'rgba(201,169,110,0.15)', color: 'var(--c-gold)', borderRadius: '4px' }}>
                    Download
                  </a>
                </div>
              )}

              {/* Status update */}
              <div>
                <p className="font-mono text-[0.48rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Update Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTS.map(s => (
                    <button key={s} onClick={() => { updateMut.mutate({ id: selected._id, d: { status: s } }); setSelected({ ...selected, status: s }); }}
                      className="px-3 py-1.5 font-mono text-[0.5rem] tracking-[0.1em] uppercase border transition-all capitalize"
                      style={{ borderRadius: '4px', background: selected.status === s ? 'rgba(233,30,140,0.12)' : 'transparent', borderColor: selected.status === s ? 'rgba(233,30,140,0.3)' : 'rgba(255,255,255,0.1)', color: selected.status === s ? '#e91e8c' : 'rgba(255,255,255,0.4)' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="font-mono text-[0.48rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Internal Notes</p>
                <textarea defaultValue={selected.notes}
                  onBlur={e => updateMut.mutate({ id: selected._id, d: { notes: e.target.value } })}
                  rows={3} className="input-field resize-none text-[0.78rem]" placeholder="Add notes…" />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <a href={`mailto:${selected.email}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 font-mono text-[0.52rem] tracking-[0.12em] uppercase border transition-all"
                  style={{ borderColor: 'rgba(233,30,140,0.2)', color: '#e91e8c', borderRadius: '4px' }}>
                  ✉ Reply
                </a>
                <button onClick={() => setDeleteId(selected._id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 font-mono text-[0.52rem] tracking-[0.12em] uppercase border transition-all"
                  style={{ borderColor: 'rgba(214,58,47,0.2)', color: '#d63a2f', borderRadius: '4px' }}>
                  ✕ Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Email Compose Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {emailOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
            onClick={e => { if (e.target === e.currentTarget) setEmailOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg"
              style={{ background: '#0f0f18', border: '1px solid rgba(233,30,140,0.2)', borderRadius: '10px' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <h3 className="font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Compose Email</h3>
                <button onClick={() => setEmailOpen(false)} style={{ color: 'rgba(255,255,255,0.4)' }}>✕</button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <p className="font-mono text-[0.48rem] tracking-[0.2em] uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>To ({checked.size} recipients)</p>
                  <div className="px-3 py-2.5 rounded-md text-[0.75rem] break-all" style={{ background: 'rgba(233,30,140,0.06)', border: '1px solid rgba(233,30,140,0.2)', color: 'rgba(255,255,255,0.6)' }}>
                    {checkedEmails || 'No emails selected'}
                  </div>
                </div>
                <div>
                  <p className="font-mono text-[0.48rem] tracking-[0.2em] uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Subject</p>
                  <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                    placeholder="Email subject…" style={inputStyle} />
                </div>
                <div>
                  <p className="font-mono text-[0.48rem] tracking-[0.2em] uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Message</p>
                  <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)}
                    rows={6} placeholder="Write your message…"
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }} />
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={handleSendEmail} disabled={emailSending}
                    className="flex-1 flex items-center justify-center gap-2 py-3 font-mono text-[0.55rem] tracking-[0.15em] uppercase transition-all"
                    style={{ background: emailSending ? 'rgba(233,30,140,0.4)' : 'linear-gradient(135deg, #e91e8c, #c4167a)', color: '#ffffff', borderRadius: '6px', border: 'none', cursor: emailSending ? 'not-allowed' : 'pointer' }}>
                    {emailSending ? 'Sending…' : `✉ Send to ${checked.size} Recipient(s)`}
                  </button>
                  <button onClick={() => setEmailOpen(false)}
                    className="px-5 py-3 font-mono text-[0.55rem] tracking-[0.15em] uppercase border transition-all"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', borderRadius: '6px' }}>
                    Cancel
                  </button>
                </div>
                <p className="font-mono text-[0.46rem] tracking-[0.12em] text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Opens your email client · Status auto-updated to "replied"
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Single Delete ─────────────────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            className="p-8 max-w-sm w-full mx-4 border"
            style={{ background: '#141414', borderColor: 'rgba(214,58,47,0.2)', borderRadius: '8px' }}>
            <h3 className="font-bold text-[1.2rem] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Delete Enquiry?</h3>
            <p className="text-[0.78rem] mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => removeMut.mutate(deleteId)} className="flex-1 py-3 font-mono text-[0.58rem] tracking-[0.15em] uppercase transition-all"
                style={{ background: '#d63a2f', color: 'white', borderRadius: '4px' }}>Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 btn-ghost">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Bulk Delete Confirm ───────────────────────────────────────────────── */}
      {bulkDelete && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            className="p-8 max-w-sm w-full mx-4 border"
            style={{ background: '#141414', borderColor: 'rgba(214,58,47,0.2)', borderRadius: '8px' }}>
            <h3 className="font-bold text-[1.2rem] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Delete {checked.size} Enquiries?</h3>
            <p className="text-[0.78rem] mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={handleBulkDelete} className="flex-1 py-3 font-mono text-[0.58rem] tracking-[0.15em] uppercase transition-all"
                style={{ background: '#d63a2f', color: 'white', borderRadius: '4px' }}>Delete All</button>
              <button onClick={() => setBulkDelete(false)} className="flex-1 py-3 btn-ghost">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
