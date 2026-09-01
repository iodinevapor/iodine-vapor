'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { faqsApi } from '@/lib/api';
import { AdminHeader, AddBtn, FormDrawer, Field, Toggle, ConfirmDelete } from '@/components/admin/AdminComponents';
import toast from 'react-hot-toast';

const emptyFaq = () => ({ question: '', answer: '', category: 'General', order: 0, isActive: true });

export default function AdminFAQs() {
  const [form, setForm]         = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const qc  = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ['admin-faqs'] });

  const { data: faqs = [], isLoading } = useQuery({ queryKey: ['admin-faqs'], queryFn: faqsApi.getAll });

  const save = useMutation({
    mutationFn: (d: any) => d._id ? faqsApi.update(d._id, d) : faqsApi.create(d),
    onSuccess: () => { inv(); toast.success('Saved!'); setShowForm(false); },
    onError: () => toast.error('Failed'),
  });

  const remove = useMutation({
    mutationFn: faqsApi.delete,
    onSuccess: () => { inv(); toast.success('Deleted'); setDeleteId(null); },
  });

  const up = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <AdminHeader
        title="FAQs"
        subtitle={`${faqs.length} questions`}
        action={<AddBtn onClick={() => { setForm(emptyFaq()); setShowForm(true); }} />}
      />

      <div className="border divide-y" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 shimmer mx-4 my-2" style={{ borderRadius: '2px' }} />
          ))
        ) : faqs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-mono text-[0.58rem] tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>No FAQs yet</p>
            <AddBtn onClick={() => { setForm(emptyFaq()); setShowForm(true); }} label="Add First FAQ" />
          </div>
        ) : faqs.map((faq: any) => (
          <div
            key={faq._id}
            className="flex items-start gap-4 px-5 py-4 transition-colors"
            style={{ borderColor: 'rgba(0,0,0,0.03)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.02)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-[0.82rem] font-medium">{faq.question}</p>
                <span className="font-mono text-[0.46rem]" style={{ color: faq.isActive ? '#4ade80' : '#6b7280' }}>
                  {faq.isActive ? '● Active' : '○ Hidden'}
                </span>
              </div>
              <p className="text-[0.75rem] line-clamp-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{faq.answer}</p>
              {faq.category && faq.category !== 'General' && (
                <span className="font-mono text-[0.46rem] tracking-[0.12em] uppercase mt-1 inline-block" style={{ color: 'var(--c-gold)' }}>{faq.category}</span>
              )}
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button
                onClick={() => { setForm({ ...faq }); setShowForm(true); }}
                className="px-3 py-1.5 font-mono text-[0.48rem] border"
                style={{ borderColor: 'rgba(201,169,110,0.2)', color: 'var(--c-gold)', borderRadius: '2px' }}
              >Edit</button>
              <button
                onClick={() => setDeleteId(faq._id)}
                className="px-3 py-1.5 font-mono text-[0.48rem] border"
                style={{ borderColor: 'rgba(214,58,47,0.2)', color: '#d63a2f', borderRadius: '2px' }}
              >Del</button>
            </div>
          </div>
        ))}
      </div>

      <FormDrawer
        open={showForm}
        onClose={() => setShowForm(false)}
        title={form?._id ? 'Edit FAQ' : 'Add FAQ'}
        onSave={() => save.mutate(form)}
        saving={save.isPending}
      >
        {form && (
          <>
            <Field label="Question *">
              <input
                required
                value={form.question}
                onChange={e => up('question', e.target.value)}
                className="input-field"
                placeholder="Frequently asked question…"
              />
            </Field>
            <Field label="Answer *">
              <textarea
                required
                value={form.answer}
                onChange={e => up('answer', e.target.value)}
                rows={5}
                className="input-field resize-none"
                placeholder="Detailed answer…"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category">
                <input value={form.category || ''} onChange={e => up('category', e.target.value)} className="input-field" placeholder="General" />
              </Field>
              <Field label="Order">
                <input type="number" value={form.order || 0} onChange={e => up('order', +e.target.value)} className="input-field" />
              </Field>
            </div>
            <Toggle label="Active / Visible" checked={!!form.isActive} onChange={v => up('isActive', v)} />
          </>
        )}
      </FormDrawer>

      <ConfirmDelete
        open={!!deleteId}
        label="FAQ"
        onConfirm={() => deleteId && remove.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

