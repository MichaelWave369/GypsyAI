import Link from 'next/link';

export default function StudyHub() {
  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">Hermetic Study Mode</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <Link className="panel" href="/study/tree">Tree of Life Explorer</Link>
        <Link className="panel" href="/study/tarot">Tarot Browser</Link>
        <Link className="panel" href="/study/decans">Decans Map</Link>
      </div>
    </main>
  );
}
