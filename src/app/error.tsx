'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="panel space-y-2" role="alert">
      <h2 className="text-2xl text-gold">Something went wrong</h2>
      <p className="text-sm">{error.message}</p>
      <button className="rounded border border-zinc-700 px-3 py-1" onClick={reset}>Recover</button>
    </main>
  );
}
