'use client';

import { useState } from 'react';
import { parseGedcom } from '@/lib/ancestry/gedcom';
import { clearAncestry, saveAncestry } from '@/lib/ancestry/storage';

export default function AncestryImportPage() {
  const [preview, setPreview] = useState<any>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    const parsed = parseGedcom(text);
    setPreview(parsed);
    await saveAncestry(parsed);
  };

  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">GEDCOM Import</h2>
      <div className="panel space-y-2 text-sm">
        <input type="file" accept=".ged,.txt" onChange={(e) => onFile(e.target.files?.[0])} />
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={() => clearAncestry()}>Delete all ancestry data</button>
        <p className="text-zinc-400">UTF-8 best-effort import. Unknown encoding may yield warning notes.</p>
      </div>
      {preview ? (
        <section className="panel text-sm">
          <p>Imported people: {Object.keys(preview.people).length}</p>
          <p>Imported families: {Object.keys(preview.families).length}</p>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(preview.warnings, null, 2)}</pre>
        </section>
      ) : null}
    </main>
  );
}
