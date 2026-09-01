'use client';
import { useState } from 'react';
import { MediaPicker } from '@/components/admin/AdminComponents';

export default function AdminMediaPage() {
  const [lastSelected, setLastSelected] = useState('');

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-[2rem] tracking-[0.06em]">Media Library</h1>
        <p className="font-mono text-[0.56rem] tracking-[0.2em] uppercase mt-1" style={{ color: 'rgba(245,240,234,0.28)' }}>
          Upload and manage images, videos, PDFs — each gets a unique ID
        </p>
      </div>
      <div className="border" style={{ borderColor: 'rgba(255,255,255,0.07)', borderRadius: '2px', minHeight: '600px' }}>
        <MediaPicker
          onSelect={(url) => setLastSelected(url)}
          onClose={() => {}}
          type="all"
        />
      </div>
      {lastSelected && (
        <div className="mt-4 p-3 border flex items-center gap-3" style={{ borderColor: 'rgba(201,169,110,0.15)', borderRadius: '2px' }}>
          <span className="font-mono text-[0.5rem] tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Last selected:</span>
          <code className="font-mono text-[0.65rem] break-all" style={{ color: 'var(--c-gold)' }}>{lastSelected}</code>
        </div>
      )}
    </div>
  );
}
