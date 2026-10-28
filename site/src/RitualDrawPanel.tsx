import { useState } from 'react';
import type { DrawnCard } from '@/types';
import {
  shuffledRitualDeck, cutRitualDeck, chooseRitualCard, ritualReadingPacket,
  selectedCardMeaning, getRitualThreads
} from './ritualDraw';
import type { RitualCard, RitualSpread } from './ritualDraw';

const PAGE_SIZE = 12;
const SPREAD_SIZE: Record<RitualSpread, number> = { single: 1, 'three-card': 3 };

export function RitualDrawPanel({ onReflect }: {
  onReflect: (data: unknown, label: string, kind: 'tarot', focus?: string) => void
}) {
  const [spread, setSpread] = useState<RitualSpread>('three-card');
  const [focus, setFocus] = useState('');
  const [deck, setDeck] = useState<RitualCard[]>([]);
  const [selected, setSelected] = useState<DrawnCard[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [cutAt, setCutAt] = useState(39);
  const [page, setPage] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [journal, setJournal] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const total = SPREAD_SIZE[spread];
  const complete = selected.length === total;
  const allRevealed = complete && selected.every((_, i) => revealed.includes(i));
  const threads = getRitualThreads(selected);
  const pageCount = Math.ceil(deck.length / PAGE_SIZE);
  const shown = deck.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function clearDraw() {
    setDeck([]); setSelected([]); setRevealed([]);
    setConfirmed(false); setPage(0); setJournal(''); setError(''); setStatus('');
  }

  function setNewSpread(value: RitualSpread) {
    if (selected.length && !window.confirm('Changing spreads discards this in-progress draw and private note. Continue?')) return;
    setSpread(value); clearDraw();
  }

  function shuffle() {
    if ((selected.length || journal.trim()) &&
      !window.confirm('Shuffle a new deck? This discards your current selected cards and private note.')) return;
    try {
      const next = shuffledRitualDeck();
      clearDraw(); setDeck(next);
      setStatus('Deck shuffled in this browser. You may cut it, browse the face-down fan and choose your cards.');
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  function cut() {
    if (selected.length || confirmed || deck.length !== 78) return;
    try {
      setDeck(cutRitualDeck(deck, cutAt));
      setPage(0); setError('');
      setStatus('Deck cut at card ' + cutAt + '. Its order is fixed until you choose to shuffle again.');
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  function choose(index: number) {
    if (complete || confirmed) return;
    try {
      const next = chooseRitualCard(deck, selected, spread, index);
      setDeck(next.remaining); setSelected(next.selected); setPage(0);
      setStatus('Card ' + next.selected.length + ' of ' + total + ' chosen, face down. Reveal when ready.');
      setError('');
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  function reveal(index: number) {
    if (index < 0 || index >= selected.length) return;
    setRevealed(old => old.includes(index) ? old : [...old, index]);
    setStatus('Card revealed. Its identity and orientation were fixed when the deck was shuffled.');
  }

  function confirm() {
    if (!allRevealed) return;
    setConfirmed(true); setError('');
    setStatus('Spread confirmed. These exact chosen cards are locked for this reading.');
  }

  function prepare() {
    if (!confirmed || !allRevealed) return;
    if (journal.trim() && !window.confirm('Your private note stays out of the Oracle and will be lost when you leave this chamber. Export the reading first if you want to keep it. Continue?')) return;
    try {
      const packet = ritualReadingPacket(spread, selected);
      onReflect(packet, 'Ritual Draw: ' + (spread === 'single' ? 'one card' : 'three cards'), 'tarot', focus);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  function exportPrivate() {
    if (!confirmed || !allRevealed) return;
    if (!window.confirm('Export a JSON file containing your focus, selected cards and private journal note to this device?')) return;
    const record = {
      schema: 'GAIA_RITUAL_DRAW_V1',
      spread, focus, provenance: {
        selection: 'person_chose_face_down_cards', shuffle: 'browser_crypto_fisher_yates',
        orientations: 'fixed_before_selection', reader: 'GAIA original deck',
        claimBoundary: 'symbolic_reflection_not_prediction'
      },
      cards: selected.map(draw => ({
        id: draw.card.id, name: draw.card.name, orientation: draw.orientation,
        position: draw.position, keywords: draw.orientation === 'upright'
          ? draw.card.upright_keywords : draw.card.reversed_keywords,
        meaning: selectedCardMeaning(draw)
      })),
      note: journal
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'gaia-private-ritual-reading.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Private JSON export requested. Only your browser controls the downloaded file.');
  }

  return <section className="gaia-ritual">
    <div className="section-header">
      <span className="eyebrow">GAIA / ORIGINAL RITUAL DRAW · FIELD LOOM</span>
      <h2>The cards are yours to choose.</h2>
      <p>Shuffle, cut, browse the face-down deck, and choose each card yourself. Reveal them
        one at a time, explore their recorded meanings, and trace the connections between
        spread positions. No automatic replacement, no cloud reading, and no model required.</p>
    </div>
    <section className="panel gaia-ritual-controls">
      <div className="gaia-reading-fields">
        <label>Spread
          <select value={spread} onChange={e => setNewSpread(e.target.value as RitualSpread)}>
            <option value="single">One card · Focus</option>
            <option value="three-card">Three cards · Past / Present / Future</option>
          </select>
        </label>
        <label>Reflection focus (optional)
          <input value={focus} maxLength={300} onChange={e => setFocus(e.target.value)}
            placeholder="What am I exploring?" />
        </label>
        <label>Cut point (before drawing)
          <input type="number" min={1} max={77} value={cutAt} disabled={deck.length !== 78 || !!selected.length}
            onChange={e => setCutAt(Number(e.target.value))}/>
        </label>
      </div>
      <div className="actions">
        <button className="primary" type="button" onClick={shuffle}>✦ Shuffle a new deck</button>
        <button className="secondary" type="button" onClick={cut}
          disabled={deck.length !== 78 || !!selected.length}>Cut this deck</button>
      </div>
      <p className="muted">The shuffle uses the browser's secure random-number source and a
        Fisher–Yates permutation. This is a software shuffle, not evidence of a supernatural
        influence. Orientations are assigned before you pick any cards.</p>
      {error && <p className="error" role="alert">{error}</p>}
      {status && <p className="muted" role="status">{status}</p>}
    </section>

    {deck.length > 0 && !complete && <section className="panel">
      <div className="lab-heading">
        <h3>Choose face-down card {selected.length + 1} of {total}</h3>
        <span className="lab-pill neutral">{deck.length} CARDS LEFT</span>
      </div>
      <p className="muted">Browsing the fan does not change the deck. Choose a numbered card
        to place it into the next spread position.</p>
      <div className="gaia-card-fan">
        {shown.map((_, index) => {
          const absolute = page * PAGE_SIZE + index;
          return <button type="button" className="gaia-card-back" key={absolute}
            aria-label={'Choose face-down card ' + (absolute + 1)}
            onClick={() => choose(absolute)}>
            <span aria-hidden="true" className="gaia-card-back-sigil">✧</span>
            <small>#{absolute + 1}</small>
          </button>;
        })}
      </div>
      <div className="gaia-fan-pagination">
        <button type="button" className="secondary" disabled={page === 0}
          onClick={() => setPage(v => v - 1)}>Previous fan</button>
        <span>Fan {page + 1} of {pageCount}</span>
        <button type="button" className="secondary" disabled={page + 1 >= pageCount}
          onClick={() => setPage(v => v + 1)}>Next fan</button>
      </div>
    </section>}

    {selected.length > 0 && <section className="panel">
      <div className="lab-heading"><h3>The cards you've chosen</h3>
        <span className="lab-pill neutral">{selected.length}/{total} SELECTED</span></div>
      <div className="gaia-reveal-grid">
        {selected.map((draw, index) => {
          const isVisible = revealed.includes(index);
          const keywords = isVisible ? (draw.orientation === 'upright'
            ? draw.card.upright_keywords : draw.card.reversed_keywords) : [];
          return <article className="gaia-reveal-card" key={draw.card.id}>
            <span className="eyebrow">{draw.position}</span>
            {isVisible ? <>
              <div className="gaia-reveal-icon" aria-hidden="true">✺</div>
              <h4>{draw.card.name}</h4>
              <span className="gaia-reveal-orientation">{draw.orientation}</span>
              <p className="muted">{keywords.join(' · ')}</p>
              <p>{selectedCardMeaning(draw)}</p>
              {draw.card.hermetic.element && <small>Recorded element: {draw.card.hermetic.element}</small>}
            </> : <>
              <div className="gaia-face-down" aria-hidden="true">✧</div>
              <p className="muted">Identity hidden until you reveal it.</p>
              <button className="primary" type="button" onClick={() => reveal(index)}>
                Reveal this card
              </button>
            </>}
          </article>;
        })}
      </div>
      {allRevealed && !confirmed && <div className="actions">
        <button className="primary" type="button" onClick={confirm}>Confirm and lock this spread</button>
      </div>}
      {confirmed && <p className="muted">Confirmed: the cards and their orientations
        will remain fixed. Starting a new shuffle will ask before discarding them.</p>}
    </section>}

    {confirmed && <section className="panel gaia-field-loom">
      <span className="eyebrow">FIELD LOOM / SOURCE-LINKED CONNECTIONS</span>
      <h3>Follow the thread.</h3>
      <p className="muted">This diagram shows the actual selected card positions. Lines denote
        spread order, not a measured energy, supernatural connection or scientific
        relationship. Every comparison below identifies the recorded evidence;
        inherited Hermetic labels have not been independently audited.</p>
      <svg viewBox="0 0 960 195" role="img" aria-label={'Diagram of ' +
        selected.map(c => c.position + ': ' + c.card.name).join('; ')}>
        {selected.length > 1 && selected.slice(0, -1).map((_, i) =>
          <line key={i} x1={185 + 295 * i} y1="90"
            x2={185 + 295 * (i + 1)} y2="90" stroke="#8fbaa7" strokeWidth="3" />)}
        {selected.map((draw, i) => {
          const x = selected.length === 1 ? 480 : 185 + 295 * i;
          return <g key={draw.card.id}>
            <circle cx={x} cy={90} r="70" fill="#173c39" stroke="#dabf82" strokeWidth="2"/>
            <text x={x} y="49" textAnchor="middle" fill="#d9c390" fontSize="14">{draw.position}</text>
            <text x={x} y="85" textAnchor="middle" fill="#f0edd8" fontSize="15">{draw.card.name.slice(0, 18)}</text>
            <text x={x} y="110" textAnchor="middle" fill="#b2d6c0" fontSize="13">{draw.orientation}</text>
            <text x={x} y="129" textAnchor="middle" fill="#a6c9c0" fontSize="12">{draw.card.hermetic.element || 'Element unlisted'}</text>
          </g>;
        })}
      </svg>
      {threads.length ? <div className="gaia-thread-list">
        {threads.map((thread, i) => <div className="gaia-thread" key={i}>
          <strong>{thread.from} → {thread.to}</strong><p>{thread.evidence}</p>
        </div>)}
      </div> : <p className="muted">A single-card reading has one focus point and no pairwise thread.</p>}
      <label htmlFor="gaia-ritual-journal">My own interpretation (optional, private in this tab)</label>
      <textarea id="gaia-ritual-journal" rows={4} maxLength={1000} value={journal}
        onChange={e => setJournal(e.target.value)}
        placeholder="What stood out to me about these cards?"/>
      <p className="muted">Your note is not automatically saved, added to GAIA memory,
        or sent to Ollama. It is included ONLY in a JSON file if you explicitly export.
        Leaving this chamber also discards the note, so export first if you want to keep it.</p>
      <div className="actions">
        <button type="button" className="primary" onClick={prepare}>
          Prepare local GAIA interpretation ↗
        </button>
        <button type="button" className="secondary" onClick={exportPrivate}>
          Export my reading + note as JSON
        </button>
      </div>
      <p className="muted">Preparing an interpretation stages the confirmed source packet
        and your optional focus in GAIA Oracle. You review the request and press Send
        separately before any local model is contacted. Your private note is not shared
        and will be cleared when you leave this chamber.</p>
    </section>}
  </section>;
}
