'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="bg-mystic p-6 text-zinc-100">
        <main className="panel space-y-2">
          <h2 className="text-2xl text-gold">App error boundary</h2>
          <p className="text-sm">{error.message}</p>
          <button className="rounded border border-zinc-700 px-3 py-1" onClick={reset}>Try again</button>
        </main>
      </body>
    </html>
  );
}
