export default function PrivacyPage() {
  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">Privacy</h2>
      <section className="panel text-sm space-y-2">
        <p><b>Stored locally:</b> settings, profiles, tarot/astro/genekeys sessions, ancestry GEDCOM data, assistant chat sessions.</p>
        <p><b>Not uploaded by default:</b> ancestry datasets, personal profile history, chat memory, and exports.</p>
        <p><b>AI usage gates:</b> ancestry context is excluded unless explicitly enabled in Settings.</p>
        <p><b>Deletion controls:</b> delete ancestry data in <code>/ancestry/import</code>; overwrite/clear local sessions through profile and assistant tools.</p>
      </section>
    </main>
  );
}
