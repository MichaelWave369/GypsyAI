import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { loadAncestry, saveAncestry, clearAncestry } from '@/lib/ancestry/storage';
import {
  SPREADS, createTarotReading, createAstroReading, createGeneKeysReading,
  parseGedcom, extractAncestryPatterns, getAncestryPreview, localOllamaUrl,
  discoverLocalModels, askLocalModel
} from './logic';
import type { TarotSpreadType, AncestryData, ChatTurn } from './logic';
import './styles.css';

const TABS = [
  { id: 'home', name: 'Sanctuary', glyph: '✧' },
  { id: 'oracle', name: 'Local Oracle', glyph: '◉' },
  { id: 'tarot', name: 'Tarot', glyph: '✦' },
  { id: 'astrology', name: 'Astrology', glyph: '☼' },
  { id: 'genekeys', name: 'Gene Keys', glyph: '◇' },
  { id: 'ancestry', name: 'Ancestry', glyph: '♧' },
  { id: 'settings', name: 'Sovereignty', glyph: '⚙' }
] as const;
type Tab = typeof TABS[number]['id'];
const STORE = 'gypsy-ai-pages-v1';
const CHAT_STORE = 'gypsy-ai-pages-chat-v1';
const defaultModelUrl = 'http://127.0.0.1:11434';
function initialTab(): Tab {
  const hash = window.location.hash.slice(1) as Tab;
  return TABS.some((item) => item.id === hash) ? hash : 'home';
}
function loadPreferences(): { base: string; model: string; keepChat: boolean } {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || '{}');
    return { base: typeof saved.base === 'string' ? saved.base : defaultModelUrl,
      model: typeof saved.model === 'string' ? saved.model : '', keepChat: saved.keepChat === true };
  } catch { return { base: defaultModelUrl, model: '', keepChat: false }; }
}
function loadSavedChat(): ChatTurn[] {
  try {
    const saved = JSON.parse(localStorage.getItem(CHAT_STORE) || '[]');
    return Array.isArray(saved) ? saved.filter((x) =>
      (x.role === 'assistant' || x.role === 'user') && typeof x.content === 'string'
    ).slice(-30) : [];
  } catch { return []; }
}
function exportJson(filename: string, obj: unknown) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Notice({ children }: { children: React.ReactNode }) {
  return <p className="notice">{children}</p>;
}
function SectionHeader({ kicker, title, description }: { kicker: string; title: string; description: string }) {
  return <div className="section-header"><span className="eyebrow">{kicker}</span><h2>{title}</h2><p>{description}</p></div>;
}
function App() {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [prefs] = useState(loadPreferences);
  const [base, setBase] = useState(prefs.base);
  const [selected, setSelected] = useState(prefs.model);
  const [keepChat, setKeepChat] = useState(prefs.keepChat);
  const [turns, setTurns] = useState<ChatTurn[]>(prefs.keepChat ? loadSavedChat() : []);
  const [models, setModels] = useState<string[]>([]);
  const [connection, setConnection] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState('');
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState('');
  const [replyError, setReplyError] = useState('');
  const [packet, setPacket] = useState('');
  const [packetLabel, setPacketLabel] = useState('');
  const [spread, setSpread] = useState<TarotSpreadType>('three-card');
  const [question, setQuestion] = useState('');
  const [tarot, setTarot] = useState<ReturnType<typeof createTarotReading> | null>(null);
  const [chartDate, setChartDate] = useState('');
  const [chartTime, setChartTime] = useState('12:00');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [zodiac, setZodiac] = useState<'tropical' | 'sidereal'>('tropical');
  const [chart, setChart] = useState<ReturnType<typeof createAstroReading> | null>(null);
  const [geneDate, setGeneDate] = useState('');
  const [geneTime, setGeneTime] = useState('12:00');
  const [gene, setGene] = useState<ReturnType<typeof createGeneKeysReading> | null>(null);
  const [ancestry, setAncestry] = useState<AncestryData | null>(null);
  const [busyAncestry, setBusyAncestry] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const onHash = () => setTab(initialTab());
    window.addEventListener('hashchange', onHash);
    loadAncestry().then(setAncestry).catch(() => setStatus('IndexedDB is unavailable; ancestry will not persist.'));
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify({ base, model: selected, keepChat }));
  }, [base, selected, keepChat]);
  useEffect(() => {
    if (keepChat) localStorage.setItem(CHAT_STORE, JSON.stringify(turns.slice(-30)));
    else localStorage.removeItem(CHAT_STORE);
  }, [turns, keepChat]);
  function go(id: Tab) {
    window.location.hash = id;
    setTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function reflect(context: unknown, label: string) {
    setPacket(JSON.stringify(context).slice(0, 8000));
    setPacketLabel(label);
    go('oracle');
  }
  async function connect() {
    setConnection('checking'); setConnectionError(''); setModels([]);
    try {
      localOllamaUrl(base);
      const list = await discoverLocalModels(base);
      setModels(list); setSelected((old) => list.includes(old) ? old : list[0] || '');
      setConnection('connected');
      if (!list.length) setConnectionError('Ollama is reachable, but no local models were found. Pull a model in Ollama first.');
    } catch (error) {
      setConnection('error');
      setConnectionError(error instanceof Error ? error.message : String(error));
    }
  }
  async function send() {
    const message = query.trim();
    if (!message || !selected || pending || connection !== 'connected') return;
    const next: ChatTurn[] = [...turns, { role: 'user', content: message }];
    setTurns(next); setQuery(''); setReplyError(''); setPending(true);
    try {
      const answer = await askLocalModel(base, selected, next, packet);
      setTurns([...next, { role: 'assistant' as const, content: answer }].slice(-30));
    } catch (error) {
      setReplyError(error instanceof Error ? error.message : String(error));
      setTurns(next); // Preserve user input so it can be retried or copied.
    } finally { setPending(false); }
  }
  function generateTarot() {
    try { setTarot(createTarotReading(spread)); setStatus(''); }
    catch (e) { setStatus(String(e)); }
  }
  function generateChart() {
    try { setChart(createAstroReading(chartDate, chartTime, Number(lat || 'NaN'), Number(lon || 'NaN'), zodiac)); setStatus(''); }
    catch (e) { setStatus(e instanceof Error ? e.message : String(e)); }
  }
  function generateGene() {
    try { setGene(createGeneKeysReading(geneDate, geneTime)); setStatus(''); }
    catch (e) { setStatus(e instanceof Error ? e.message : String(e)); }
  }
  async function importAncestry(file?: File) {
    if (!file) return;
    setStatus(''); setBusyAncestry(true);
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('Maximum GEDCOM file size is 10 MB.');
      const data = parseGedcom(await file.text());
      if (!Object.keys(data.people).length) throw new Error('No people found. Import a valid GEDCOM file.');
      await saveAncestry(data);
      setAncestry(data);
      setStatus('GEDCOM imported into local browser IndexedDB. Nothing was uploaded.');
    } catch (e) { setStatus(e instanceof Error ? e.message : String(e)); }
    finally { setBusyAncestry(false); }
  }
  async function deleteAncestry() {
    if (!window.confirm('Delete GypsyAI ancestry data saved in this browser?')) return;
    try { await clearAncestry(); setAncestry(null); setStatus('Local ancestry data deleted.'); }
    catch { setStatus('Unable to delete local ancestry data.'); }
  }
  const patterns = ancestry ? extractAncestryPatterns(ancestry) : null;
  const ancestryCount = ancestry ? Object.keys(ancestry.people).length : 0;

  return <div className="app-shell">
    <div className="ambient ambient-one" aria-hidden="true" /><div className="ambient ambient-two" aria-hidden="true" />
    <header className="masthead">
      <div className="logo" aria-hidden="true">✧</div>
      <div className="brand"><span className="eyebrow">ENTER THE FIELD · SOVEREIGN SYSTEMS</span><h1>Gypsy<span>AI</span></h1><p>THE ORACLE LIVES WITH YOU</p></div>
      <div className="header-status"><span className={'dot ' + (connection === 'connected' ? 'active' : '')} />
        {connection === 'connected' ? 'LOCAL MODEL CONNECTED' : 'LOCAL FIRST · NO CLOUD REQUIRED'}</div>
    </header>
    <nav className="nav" aria-label="Main navigation">
      {TABS.map((item) => <button key={item.id} className={'nav-item ' + (tab === item.id ? 'current' : '')}
        onClick={() => go(item.id)} aria-current={tab === item.id ? 'page' : undefined}>
        <span aria-hidden="true">{item.glyph}</span>{item.name}</button>)}
    </nav>
    <main>
      {tab === 'home' && <>
        <section className="hero">
          <div className="hero-copy"><span className="eyebrow">GYPSYAI · SOVEREIGN PORTAL v0.2 PREVIEW</span>
            <h2>Wisdom without<br/><em>the leash.</em></h2>
            <p>Explore symbolic systems with deterministic, source-declared tools. Speak with an optional model on your own computer. Your ancestry, history, and context stay under your control.</p>
            <div className="actions"><button className="primary" onClick={() => go('oracle')}>Open the Oracle <span>↗</span></button><button className="secondary" onClick={() => go('tarot')}>Explore the readings</button></div>
          </div>
          <div className="orb-wrap" aria-hidden="true"><div className="orb-ring r1"/><div className="orb-ring r2"/><div className="orb-core">✺</div><div className="orb-caption">YOUR FIELD · YOUR KEYS</div></div>
        </section>
        <div className="three-cards">
          <button className="feature" onClick={() => go('tarot')}><span className="feature-symbol">✦</span><strong>Symbolic readings</strong><p>Tarot, astrology and Gene Keys using the original GypsyAI computation libraries.</p><span className="feature-action">ENTER STUDIO ↗</span></button>
          <button className="feature" onClick={() => go('ancestry')}><span className="feature-symbol">♧</span><strong>Ancestral field</strong><p>GEDCOM import, private local IndexedDB storage, living-person redaction and pattern summaries.</p><span className="feature-action">OPEN ARCHIVE ↗</span></button>
          <button className="feature" onClick={() => go('settings')}><span className="feature-symbol">◈</span><strong>Local intelligence</strong><p>Connect a model you already run in Ollama. ΦStream remains separate and experimental.</p><span className="feature-action">REVIEW CONTROLS ↗</span></button>
        </div>
        <Notice>The symbolic layers are tools for reflection, not scientific, psychological, medical, legal or financial verdicts. This Pages portal is a staged migration; the legacy Next.js application remains in the repository while features are ported.</Notice>
      </>}
      {tab === 'oracle' && <>
        <SectionHeader kicker="LOCAL INTELLIGENCE" title="The Sovereign Oracle" description="Your browser talks directly to Ollama on this device, only after you initiate the connection. No API keys, cloud relay or model weights are stored on GitHub Pages." />
        <div className="two-columns">
          <div className="panel">
            <h3>01 / Establish the connection</h3>
            <label htmlFor="model-origin">Local Ollama origin</label><input id="model-origin" value={base} onChange={(e) => { setBase(e.target.value); setConnection('idle'); setModels([]); }} placeholder={defaultModelUrl} />
            <div className="actions"><button className="primary" disabled={connection === 'checking' || pending} onClick={connect}>{connection === 'checking' ? 'Checking…' : 'Detect local models'}</button>
              <span className={'small-status ' + (connection === 'connected' ? 'ok' : '')}>{connection.toUpperCase()}</span></div>
            {connectionError && <p className="error" role="alert">{connectionError}</p>}
            <label htmlFor="model-choice">Model</label><select id="model-choice" value={selected} onChange={(e) => setSelected(e.target.value)} disabled={!models.length}>
              {!models.length && <option value="">Connect Ollama first</option>}
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <p className="muted">For a GitHub Pages HTTPS site, local browser access may need an explicit Ollama origin allowlist and compatible browser permissions. The app will never expose Ollama to the public internet.</p>
            <div className="thin-rule"/>
            <h3>02 / Approved context</h3>
            {packetLabel ? <><p className="context-name">{packetLabel}</p><p className="muted">A deterministic reading packet is attached to your next messages. It will be sent only to the local Ollama endpoint when you submit.</p><button className="text-button" onClick={() => { setPacket(''); setPacketLabel(''); }}>Remove attached context</button></> : <p className="muted">No reading or ancestry information attached. Use “Reflect with Oracle” on a reading to attach its factual packet.</p>}
            <div className="thin-rule"/>
            <div className="research-note"><strong>ΦStream research lane</strong><p>Our real-weight inference experiments are not yet a compatible interactive chat server. No PhiStream model or weights are falsely advertised as connected here.</p></div>
          </div>
          <div className="panel conversation">
            <div className="conversation-head"><div><span className="eyebrow">DIRECT · LOCAL</span><h3>Conversation</h3></div><span className="conversation-live">{connection === 'connected' ? '● READY' : '○ OFFLINE'}</span></div>
            <div className="message-area" aria-live="polite">
              {!turns.length && <div className="empty-chat"><span>✺</span><h3>An open mind. A grounded reading.</h3><p>Connect your Ollama model, then begin. We separate interpretations from what the underlying reader actually calculated.</p></div>}
              {turns.map((turn, index) => <div key={index} className={'chat-bubble ' + turn.role}><span className="bubble-role">{turn.role === 'user' ? 'YOU' : 'GYPSYAI · LOCAL MODEL'}</span><p>{turn.content}</p></div>)}
              {pending && <p className="muted">Local model is generating…</p>}
            </div>
            {replyError && <p className="error" role="alert">{replyError}</p>}
            <form className="send-form" onSubmit={(e) => { e.preventDefault(); void send(); }}>
              <label htmlFor="oracle-message">Your message</label>
              <textarea id="oracle-message" rows={3} maxLength={5000} placeholder="What's on your mind?" value={query} onChange={(e) => setQuery(e.target.value)} />
              <button className="primary" type="submit" disabled={pending || !query.trim() || !selected || connection !== 'connected'}>{pending ? 'Thinking…' : 'Send to my local model ↗'}</button>
            </form>
            <p className="muted micro">Model-generated interpretations can be inaccurate. Verify consequential claims independently.</p>
          </div>
        </div>
      </>}
      {tab === 'tarot' && <>
        <SectionHeader kicker="SYMBOLIC STUDIO / I" title="The Tarot Chamber" description="Draw from GypsyAI's original deck and Hermetic correspondence mappings. Cards are chosen locally, not generated by an LLM." />
        <section className="panel control-panel"><div className="field"><label htmlFor="spread">Spread</label><select id="spread" value={spread} onChange={(e) => setSpread(e.target.value as TarotSpreadType)}>{SPREADS.map((s) => <option key={s.value} value={s.value}>{s.name}</option>)}</select></div>
          <div className="field grow"><label htmlFor="question">Reflection focus (optional)</label><input id="question" placeholder="What am I exploring?" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={500} /></div>
          <button className="primary" onClick={generateTarot}>Draw Cards ✧</button></section>
        {tarot && <><div className="reading-grid">{tarot.cards.map((draw, index) => <article className="reading-card" key={index}>
          <span className="eyebrow">{draw.position}</span><div className="card-symbol">✦</div><h3>{draw.card.name}</h3><p className="orientation">{draw.orientation}</p>
          <p>{(draw.orientation === 'upright' ? draw.card.upright_keywords : draw.card.reversed_keywords).join(' · ')}</p>
          <p className="muted">Hermetic: {Object.entries(draw.card.hermetic).filter(([,v]) => typeof v === 'string').map(([k,v]) => k + ': ' + v).join(' · ')}</p>
        </article>)}</div><div className="actions"><button className="primary" onClick={() => reflect(tarot.packet, 'Tarot: ' + spread + (question ? ' · ' + question : ''))}>Reflect with Oracle ↗</button><button className="secondary" onClick={() => exportJson('gypsyai-tarot.json', { question, ...tarot })}>Export reading JSON</button></div></>}
      </>}
      {tab === 'astrology' && <>
        <SectionHeader kicker="SYMBOLIC STUDIO / II" title="The Celestial Map" description="Compute positions, aspects, equal houses and mapped Hermetic associations using the existing GypsyAI astronomy engine." />
        <Notice>Enter the birth time in UTC, not local civil time. Latitude and longitude are required for the Ascendant. The current astronomical engine includes documented approximations; treat outputs accordingly.</Notice>
        <section className="panel control-panel wrap-fields">
          <div className="field"><label htmlFor="birthdate">Date</label><input id="birthdate" type="date" value={chartDate} onChange={(e) => setChartDate(e.target.value)} /></div>
          <div className="field"><label htmlFor="birthtime">Time (UTC)</label><input id="birthtime" type="time" value={chartTime} onChange={(e) => setChartTime(e.target.value)} /></div>
          <div className="field"><label htmlFor="latitude">Latitude</label><input id="latitude" type="number" step="any" min="-90" max="90" placeholder="39.47" value={lat} onChange={(e) => setLat(e.target.value)} /></div>
          <div className="field"><label htmlFor="longitude">Longitude</label><input id="longitude" type="number" step="any" min="-180" max="180" placeholder="-87.40" value={lon} onChange={(e) => setLon(e.target.value)} /></div>
          <div className="field"><label htmlFor="zodiac">Zodiac</label><select id="zodiac" value={zodiac} onChange={(e) => setZodiac(e.target.value as 'tropical' | 'sidereal')}><option value="tropical">Tropical</option><option value="sidereal">Sidereal (approx.)</option></select></div>
          <button className="primary" onClick={generateChart}>Calculate Chart</button>
        </section>
        {chart && <><div className="two-columns">
          <section className="panel"><h3>Planetary placements</h3><div className="data-list">{chart.chart.placements.map((p) => <div key={p.body} className="data-row"><strong>{p.body}</strong><span>{p.sign} {p.degreeInSign.toFixed(2)}°</span></div>)}</div></section>
          <section className="panel"><h3>Angles &amp; aspects</h3><p className="highlight">ASC {chart.chart.ascendantSign.sign} · MC {chart.chart.mcSign.sign}</p><div className="data-list">{chart.chart.aspects.slice(0, 12).map((a, index) => <div key={index} className="data-row"><strong>{a.bodyA} {a.type} {a.bodyB}</strong><span>{a.orb.toFixed(2)}° orb</span></div>)}</div></section></div>
          <div className="actions"><button className="primary" onClick={() => reflect(chart.packet, 'Astrology computation')}>Reflect with Oracle ↗</button><button className="secondary" onClick={() => exportJson('gypsyai-astrology.json', chart)}>Export chart JSON</button></div></>}
      </>}
      {tab === 'genekeys' && <>
        <SectionHeader kicker="SYMBOLIC STUDIO / III" title="The Gene Keys Atlas" description="Explore activation-sequence associations using GypsyAI's local symbolic mapping data. These correspondences are interpretive, not genetic testing." />
        <Notice>This app's current Gene Keys implementation includes approximate astronomical mappings and original generic descriptive material, not an official Gene Keys profile.</Notice>
        <section className="panel control-panel"><div className="field"><label htmlFor="gene-date">Date</label><input id="gene-date" type="date" value={geneDate} onChange={(e) => setGeneDate(e.target.value)} /></div>
          <div className="field"><label htmlFor="gene-time">Time (UTC)</label><input id="gene-time" type="time" value={geneTime} onChange={(e) => setGeneTime(e.target.value)} /></div>
          <button className="primary" onClick={generateGene}>Explore Profile</button></section>
        {gene && <><div className="reading-grid four">{gene.spheres.map((s) => <article className="reading-card" key={s.sphere}>
          <span className="eyebrow">{s.sphere.replace(/([A-Z])/g, ' $1').trim()}</span><div className="key-number">{String(s.key).padStart(2, '0')}</div><h3>Key {s.key} · Line {s.line}</h3><p>{s.summary?.short_gift ?? 'Contemplate this key as a symbolic theme.'}</p></article>)}</div>
          <div className="actions"><button className="primary" onClick={() => reflect(gene.packet, 'Gene Keys activation sequence')}>Reflect with Oracle ↗</button><button className="secondary" onClick={() => exportJson('gypsyai-genekeys.json', gene.profile)}>Export profile JSON</button></div></>}
      </>}
      {tab === 'ancestry' && <>
        <SectionHeader kicker="PRIVATE ARCHIVE" title="The Ancestral Field" description="Import GEDCOM into your browser's IndexedDB. Living people stay hidden by default, and ancestry is never attached to model prompts automatically." />
        <section className="panel"><h3>Import or manage family records</h3>
          <div className="actions"><label className="file-picker">Choose GEDCOM file<input type="file" accept=".ged,.txt" onChange={(e) => void importAncestry(e.target.files?.[0])} disabled={busyAncestry} /></label>
            {ancestry && <><button className="secondary" onClick={() => exportJson('gypsyai-ancestry.json', ancestry)}>Export local GEDCOM data as JSON</button><button className="danger" onClick={() => void deleteAncestry()}>Delete local ancestry</button></>}</div>
          <p className="muted">Max 10 MB. Import persists only in this browser, on this origin. Previous Vercel-origin browser storage cannot be read by GitHub Pages; use the old application's export first.</p></section>
        {ancestry && patterns && <>
          <div className="metric-row"><div className="metric"><strong>{ancestryCount}</strong><span>People stored locally</span></div><div className="metric"><strong>{Object.keys(ancestry.families).length}</strong><span>Family records</span></div><div className="metric"><strong>{patterns.longevity.count}</strong><span>Recorded lifespans</span></div></div>
          <div className="two-columns">
            <section className="panel"><h3>Local pattern summary</h3><p className="muted">Most common birthplaces</p><div className="data-list">{patterns.topBirthPlaces.map(([place, count]) => <div key={place} className="data-row"><strong>{place}</strong><span>{count}</span></div>)}</div>
              <p className="muted">Age-at-death average (recorded dates only): {patterns.longevity.avg ?? 'not available'}</p>
              <button className="secondary" onClick={() => reflect({ counts: { people: ancestryCount, families: Object.keys(ancestry.families).length }, longevity: patterns.longevity }, 'Ancestry: aggregate counts only')}>Reflect on anonymized aggregate counts ↗</button>
            </section>
            <section className="panel"><h3>People (living persons redacted)</h3><div className="data-list scroll-list">{getAncestryPreview(ancestry).map((person) => <div className="data-row" key={person.id}><strong>{person.names[0] || 'Unknown'}</strong><span>{person.death?.date || 'private / unknown'}</span></div>)}</div></section>
          </div>
          <Notice>The export JSON includes the entire unredacted family dataset. Store or share that file carefully. Only aggregate counts, not names or locations, can be passed to the model from this preview.</Notice>
        </>}
        {!ancestry && <div className="empty-state">♧<p>No family records imported on this origin.</p></div>}
      </>}
      {tab === 'settings' && <>
        <SectionHeader kicker="USER SOVEREIGNTY" title="Keep the Keys" description="A small, clear control room. Everything here is under your control; no account or model subscription is required." />
        <div className="two-columns">
          <section className="panel"><h3>Model residency</h3><p>Inference runs in an Ollama process on your own device when connected. The Pages build contains no model weights, secret API keys, telemetry endpoint or server runtime.</p>
            <p className="muted">Endpoint: {base} (loopback-only policy). Browser-to-local access depends on HTTPS, CORS, local-network browser permissions, and an explicit Ollama origin allowlist.</p>
            <button className="secondary" onClick={() => go('oracle')}>Configure local model ↗</button>
            <div className="thin-rule"/><h3>Conversation storage</h3><label className="switch"><input type="checkbox" checked={keepChat} onChange={(e) => setKeepChat(e.target.checked)} /> Remember local chat in this browser</label>
            <p className="muted">Off by default. Turning this off deletes the locally saved conversation history, but keeps currently visible messages until you clear them.</p>
            <div className="actions"><button className="secondary" onClick={() => exportJson('gypsyai-local-chat.json', turns)}>Export chat JSON</button><button className="danger" onClick={() => { if (window.confirm('Clear the local chat and stored history?')) { setTurns([]); localStorage.removeItem(CHAT_STORE); } }}>Clear chat history</button></div>
          </section>
          <section className="panel"><h3>What's local, what's not</h3>
            <div className="data-list"><div className="data-row"><strong>Tarot / Astronomy / Gene Keys</strong><span>Browser computations</span></div><div className="data-row"><strong>Ancestry GEDCOM</strong><span>IndexedDB only</span></div><div className="data-row"><strong>Model</strong><span>Ollama on localhost</span></div><div className="data-row"><strong>PhiStream</strong><span>Research, not live chat</span></div><div className="data-row"><strong>Original TIEKAT interface</strong><span>Pending migration parity</span></div></div>
            <div className="thin-rule"/><h3>License &amp; provenance</h3><p>GypsyAI project-owned code: MIT. Third-party engines and dataset licenses remain their own. Symbolic interpretation is never presented as a measurement of physical phenomena.</p>
            <a href="https://github.com/MichaelWave369/GypsyAI" target="_blank" rel="noreferrer" className="text-link">Inspect source and development status ↗</a>
          </section>
        </div>
      </>}
      {status && <p className="status-message" role="status">{status}</p>}
    </main>
    <footer className="footer"><span>GYPSYAI / SOVEREIGN PORTAL</span><span>PEOPLE ABOVE PROFIT · LEDGER ABOVE EGO</span><span>v0.2 PREVIEW · MIT</span></footer>
  </div>;
}
createRoot(document.getElementById('root')!).render(<App />);
