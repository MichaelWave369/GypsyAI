'use client';

import { useState } from 'react';

export function HermeticDrawer({ title, items }: { title: string; items: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="panel">
      <button className="text-gold" onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide' : 'Show'} Hermetic Correspondences
      </button>
      {open ? (
        <div className="mt-3 space-y-2 text-sm">
          <h3 className="font-semibold">{title}</h3>
          <ul className="list-disc space-y-1 pl-6">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
