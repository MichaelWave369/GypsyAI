import { useState } from 'react';
import type { DrawnCard } from '@/types';
import type { AtlasLayout } from './spreadAtlas';
import { buildFieldLoom, SOURCE_LABELS } from './fieldLoomEvidence';
import type { LoomEvidence, LoomLens } from './fieldLoomEvidence';

const LENSES: { id: LoomLens; title: string; description: string }[] = [
  { id: 'positions', title: 'Spread roles', description: 'What each position means' },
  { id: 'keywords', title: 'Themes', description: 'Exact recorded card keywords' },
  { id: 'elements', title: 'Elements', description: 'Existing Hermetic labels, unverified' },
  { id: 'arcana', title: 'Arcana', description: 'Major/minor card classifications' }
];

function EvidenceList({ evidence }: { evidence: LoomEvidence[] }) {
  return <div className="gaia-loom-evidence-list">
    {evidence.map((item, i) => <div className="gaia-loom-evidence" key={i}>
      <span className={'gaia-loom-source ' + (item.source === 'editorial-question' ? 'question' : '')}>
        {SOURCE_LABELS[item.source]}
      </span>
      <p>{item.text}</p>
    </div>)}
  </div>;
}

export function FieldLoomPanel({ draws, layout }: { draws: readonly DrawnCard[]; layout?: AtlasLayout | null }) {
  const [lens, setLens] = useState<LoomLens>('positions');
  const [activeCard, setActiveCard] = useState(0);
  const [activeLink, setActiveLink] = useState(0);
  // Re-derived from actual confirmed cards every render. Never mutate a draw.
  const graph = buildFieldLoom(draws, lens, layout);
  const nodeX = (i:number)=>graph.nodes.length===1 ? 480 :
    185 + i * (graph.nodes.length>3 ? 245 : 295);
  const viewWidth = Math.max(960, nodeX(graph.nodes.length-1)+185);
  const node = graph.nodes[Math.min(activeCard, graph.nodes.length - 1)];
  const edge = graph.links[Math.min(activeLink, Math.max(0, graph.links.length - 1))];

  return <div className="gaia-loom-v2">
    <span className="eyebrow">FIELD LOOM / SOURCE TRANSPARENT</span>
    {layout && <p className="muted">Custom spread: <strong>{layout.name}</strong>. Position roles are user-authored.</p>}
    <h3>Explore the connections.</h3>
    <p className="muted">Choose an evidence lens, then select a card or a thread.
      Every observation is traceable to your selected spread, its defined positions,
      or GAIA's stored card data. Reflective questions are labeled separately.
      Links indicate sequence, not measured energy, fate or physical causation.</p>
    <div className="gaia-loom-lenses" role="group" aria-label="Evidence lens">
      {LENSES.map(item => <button type="button" key={item.id}
        aria-pressed={lens === item.id} className={lens === item.id ? 'active' : ''}
        title={item.description} onClick={() => setLens(item.id)}>{item.title}</button>)}
    </div>
    <svg viewBox={'0 0 '+viewWidth+' 195'} role="img" aria-label={'Confirmed spread visualization: ' +
      graph.nodes.map(n => n.position + ' ' + n.card + ' ' + n.orientation).join('; ')}>
      {graph.links.map((connection, i) => <line key={connection.fromId}
        x1={nodeX(i)} y1="90"
        x2={nodeX(i + 1)} y2="90"
        stroke={activeLink === i ? '#e5c888' : '#729f95'} strokeWidth={activeLink === i ? 5 : 2}/>)}
      {graph.nodes.map((n, i) => {
        const x = nodeX(i);
        return <g key={n.id}>
          <circle cx={x} cy="90" r={i === activeCard ? 74 : 69}
            fill={i === activeCard ? '#285549' : '#17383c'}
            stroke={i === activeCard ? '#efdaa0' : '#9cbcab'} strokeWidth={i === activeCard ? 4 : 2}/>
          <text x={x} y="49" textAnchor="middle" fill="#e6c98d" fontSize="14">{n.position}</text>
          <text x={x} y="87" textAnchor="middle" fill="#fff0d9" fontSize="15">{n.card.slice(0, 20)}</text>
          <text x={x} y="111" textAnchor="middle" fill="#b9dfce" fontSize="13">{n.orientation}</text>
          <text x={x} y="132" textAnchor="middle" fill="#b7cbbb" fontSize="11">
            {lens === 'elements' ? (n.element ?? 'Element not recorded')
              : lens === 'arcana' ? n.arcana + ' arcana'
                : lens === 'keywords' ? n.keywords[0]?.slice(0, 19) ?? 'No keywords'
                  : n.position === 'Future' ? 'Potential unfolding' : n.positionMeaning.slice(0, 23)}
          </text>
        </g>;
      })}
    </svg>
    <div className="gaia-loom-selectors" role="group" aria-label="Select a card to inspect">
      {graph.nodes.map((n, i) => <button type="button" key={n.id}
        className={i === activeCard ? 'active' : ''}
        aria-pressed={i === activeCard} onClick={() => setActiveCard(i)}>
        <span className="eyebrow">{n.position}</span><strong>{n.card}</strong>
        <small>{n.orientation}</small>
      </button>)}
    </div>
    <section className="gaia-loom-detail" aria-live="polite" aria-label="Selected card source facts">
      <span className="eyebrow">CARD RECEIPT / {node.position}</span>
      <h4>{node.card}</h4>
      <p className="gaia-loom-reading">{node.meaning}</p>
      <EvidenceList evidence={node.sources}/>
    </section>
    {graph.links.length ? <>
      <h4 className="gaia-loom-subtitle">Compare adjacent cards</h4>
      <div className="gaia-loom-link-selectors" role="group" aria-label="Select a connection to inspect">
        {graph.links.map((link, i) => <button type="button" key={link.fromId}
          className={i === activeLink ? 'active' : ''} aria-pressed={i === activeLink}
          onClick={() => setActiveLink(i)}>{graph.nodes[i].position} → {graph.nodes[i+1].position}</button>)}
      </div>
      <section className="gaia-loom-detail" aria-live="polite" aria-label="Source-supported connection">
        <span className="eyebrow">THREAD RECEIPT / {LENSES.find(item => item.id === lens)?.title}</span>
        <h4>{graph.nodes[activeLink].card} → {graph.nodes[activeLink + 1].card}</h4>
        <EvidenceList evidence={edge.observations}/>
      </section>
    </> : <p className="muted">A one-card reading has a single focus and no adjacent threads.</p>}
    <p className="muted">Deck meanings are editorial interpretations. Existing Hermetic field labels
      have not yet undergone a complete historical audit. An exact label match is only a
      comparison of stored text, not evidence of causation or a physical phenomenon.</p>
  </div>;
}
