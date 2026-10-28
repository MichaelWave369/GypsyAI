import { useState } from 'react';
import { createIntegratedReading } from './readingExperience';
import type { ReadingKind } from './readingExperience';

type Integrated = ReturnType<typeof createIntegratedReading>;

const PATHS: { id: 'ritual' | 'tarot' | 'astrology' | 'genekeys' | 'ancestry' | 'oracle' | 'pilot'; icon: string; title: string; subtitle: string; truth: string }[] = [
  { id: 'ritual', icon: '✺', title: 'Ritual Draw Table', subtitle: 'Shuffle, cut, select and reveal', truth: 'Choose face-down cards yourself, then explore the Field Loom of recorded meanings and positions.' },
  { id: 'tarot', icon: '✧', title: 'Tarot', subtitle: 'One card to the Tree of Life', truth: 'Real shuffled draws, card orientations and Hermetic correspondences, computed locally.' },
  { id: 'astrology', icon: '☼', title: 'Astrology', subtitle: 'The celestial map', truth: 'Chart placements, angles and aspects calculated from UTC birth data and coordinates.' },
  { id: 'genekeys', icon: '◇', title: 'Gene Keys', subtitle: 'Contemplation atlas', truth: 'Approximate symbolic activation mappings, not a genetic test or official profile.' },
  { id: 'ancestry', icon: '♧', title: 'Ancestry', subtitle: 'Private ancestral field', truth: 'Optional local GEDCOM analysis; only anonymized aggregates enter approved Oracle context.' },
  { id: 'oracle', icon: '◉', title: 'GAIA Oracle', subtitle: 'Interpret with your local brain', truth: 'A real Ollama reply, requested by you after reviewing the reading packet.' },
  { id: 'pilot', icon: '✺', title: 'Ally Sanctuary', subtitle: 'Get to know GAIA', truth: 'An ephemeral, private, optional-profile chat with a local model.' }
];

export function ReadingRoomPanel({
  onNavigate, onReflect
}: {
  onNavigate: (id: 'ritual' | 'tarot' | 'astrology' | 'genekeys' | 'ancestry' | 'oracle' | 'pilot') => void;
  onReflect: (data: unknown, label: string, kind: ReadingKind, focus?: string) => void;
}) {
  const [focus, setFocus] = useState('');
  const [date, setDate] = useState('');
  const [utcTime, setUtcTime] = useState('12:00');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [zodiac, setZodiac] = useState<'tropical' | 'sidereal'>('tropical');
  const [integrated, setIntegrated] = useState<Integrated | null>(null);
  const [error, setError] = useState('');

  function calculate() {
    setError('');
    setIntegrated(null);
    try {
      const result = createIntegratedReading({
        focus, date, utcTime, latitude: latitude.trim() ? Number(latitude) : NaN,
        longitude: longitude.trim() ? Number(longitude) : NaN, zodiac
      });
      setIntegrated(result);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  return <section className="gaia-reading-room">
    <div className="section-header">
      <span className="eyebrow">GAIA / GYPSY ARTIFICIAL INTELLIGENCE ALLY</span>
      <h2>Choose your doorway.</h2>
      <p>Come for a reading. Leave with a little more perspective. Each chamber uses real,
        inspectable local calculations or real user-initiated model inference. Symbolic insights are
        invitations to reflect, never predictions or scientific verdicts.</p>
    </div>
    <div className="gaia-path-grid">
      {PATHS.map((path) => <button type="button" className="gaia-path" key={path.id}
          onClick={() => onNavigate(path.id)}>
        <span className="gaia-path-icon" aria-hidden="true">{path.icon}</span>
        <span className="gaia-path-title">{path.title}</span>
        <span className="gaia-path-subtitle">{path.subtitle}</span>
        <span className="gaia-path-truth">{path.truth}</span>
        <span className="gaia-path-enter">ENTER CHAMBER ↗</span>
      </button>)}
    </div>
    <div className="gaia-constellation panel">
      <span className="eyebrow">GAIA / THREE THREADS, ONE READING</span>
      <h3>The Constellation Reading</h3>
      <p className="muted">Draw three genuine tarot cards, calculate an astrological chart and
        generate Gene Keys activation mappings together. See the actual outputs here without
        connecting any model. If you choose, send only the resulting compact reading packet to
        your Ollama model for a deeper interpretation.</p>
      <p className="muted">Birth time must be <strong>UTC</strong>, not local clock time. Coordinates
        are required for the chart. The existing engines include approximations, particularly
        sidereal and Gene Keys mappings. Nothing is saved or uploaded by this room automatically.</p>
      <div className="gaia-reading-fields">
        <label>My reflection focus (optional)<input value={focus} maxLength={300}
          placeholder="What patterns am I exploring?" onChange={(e) => { setFocus(e.target.value); setIntegrated(null); }} /></label>
        <label>Birth date<input type="date" value={date}
          onChange={(e) => { setDate(e.target.value); setIntegrated(null); }} /></label>
        <label>Birth time (UTC)<input type="time" value={utcTime}
          onChange={(e) => { setUtcTime(e.target.value); setIntegrated(null); }} /></label>
        <label>Latitude<input type="number" min="-90" max="90" step="any" placeholder="39.47"
          value={latitude} onChange={(e) => { setLatitude(e.target.value); setIntegrated(null); }} /></label>
        <label>Longitude<input type="number" min="-180" max="180" step="any" placeholder="-87.40"
          value={longitude} onChange={(e) => { setLongitude(e.target.value); setIntegrated(null); }} /></label>
        <label>Zodiac<select value={zodiac}
          onChange={(e) => { setZodiac(e.target.value as 'tropical' | 'sidereal'); setIntegrated(null); }}>
          <option value="tropical">Tropical</option><option value="sidereal">Sidereal (approx.)</option>
        </select></label>
      </div>
      <div className="actions">
        <button type="button" className="primary" onClick={calculate}>Create my constellation ✧</button>
        {integrated && <button type="button" className="secondary"
          onClick={() => { setIntegrated(null); setError(''); }}>Clear this reading</button>}
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {integrated && <div className="gaia-constellation-result" aria-live="polite">
        <div className="gaia-result-group"><h4>✦ Tarot / Three Cards</h4>
          <div className="gaia-mini-grid">{integrated.tarot.cards.map((draw, i) =>
            <div className="gaia-mini-card" key={i}>
              <span className="eyebrow">{draw.position}</span><strong>{draw.card.name}</strong>
              <small>{draw.orientation} · {(draw.orientation === 'upright'
                ? draw.card.upright_keywords : draw.card.reversed_keywords).slice(0, 3).join(' / ')}</small>
              <small>{draw.orientation === 'upright' ? draw.card.short_upright_meaning : draw.card.short_reversed_meaning}</small>
            </div>)}</div>
        </div>
        <div className="gaia-result-group"><h4>☼ Celestial placements</h4>
          <p className="muted">Ascendant: {integrated.astro.chart.ascendantSign.sign} ·
            Midheaven: {integrated.astro.chart.mcSign.sign}</p>
          <div className="gaia-mini-grid">{integrated.astro.chart.placements.slice(0, 6).map((p) =>
            <div className="gaia-mini-card" key={p.body}>
              <strong>{p.body}</strong><small>{p.sign} {p.degreeInSign.toFixed(2)}°</small>
            </div>)}</div>
        </div>
        <div className="gaia-result-group"><h4>◇ Gene Keys / Activation sequence</h4>
          <div className="gaia-mini-grid">{integrated.gene.spheres.map((s) =>
            <div className="gaia-mini-card" key={s.sphere}>
              <span className="eyebrow">{s.sphere.replace(/([A-Z])/g, ' $1').trim()}</span>
              <strong>Key {s.key} · Line {s.line}</strong>
            </div>)}</div>
          <p className="muted">Gene Keys mappings are approximate symbolic associations, not
            official profile computations or genetic measurements.</p>
        </div>
        <div className="gaia-reading-handoff">
          <h4>Ready for GAIA's interpretation?</h4>
          <p className="muted">Nothing has been sent to a model. The next button stages the
            compact packet and a suggested prompt in your Local Oracle. You review and press
            Send there before anything reaches your local Ollama.</p>
          <button type="button" className="primary" onClick={() => onReflect(
            integrated.packet, 'Constellation: tarot + astrology + Gene Keys', 'synthesis', focus
          )}>Prepare local GAIA interpretation ↗</button>
        </div>
      </div>}
    </div>
  </section>;
}
