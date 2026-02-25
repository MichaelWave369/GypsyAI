import Link from 'next/link';

export default function AncestryHome() {
  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">Ancestry</h2>
      <p className="panel text-sm">Local-first ancestry workspace. GEDCOM import, tree browsing, people index, and grounded ancestry readings.</p>
      <div className="grid gap-3 md:grid-cols-3">
        <Link className="panel" href="/ancestry/import">Import GEDCOM</Link>
        <Link className="panel" href="/ancestry/tree">Family Tree</Link>
        <Link className="panel" href="/ancestry/people">People</Link>
        <Link className="panel" href="/ancestry/read">Ancestry Reading</Link>
      </div>
    </main>
  );
}
