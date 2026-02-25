export function EvidenceChips({ chips }: { chips: string[] }) {
  if (!chips.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2" aria-label="evidence-chips">
      {chips.map((c) => (
        <span key={c} className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
          {c}
        </span>
      ))}
    </div>
  );
}
