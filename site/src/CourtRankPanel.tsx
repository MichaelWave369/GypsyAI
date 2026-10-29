import { useState } from 'react';
import {
  COURT_REFERENCES, courtRankCoverage, courtRankRecord, listCourtRankRecords
} from './courtRankConcordance';
import type { CourtAlignment, CourtSuit } from './courtRankConcordance';

const SUITS:CourtSuit[]=['Wands','Cups','Swords','Pentacles'];
const SUIT_LABEL:Record<CourtSuit,string>={
  Wands:'Wands · Bâtons',Cups:'Cups · Coupes',
  Swords:'Swords · Épées',Pentacles:'Pentacles · Deniers / Thoth Disks'
};

export function CourtRankPanel({onOpenCard}:{onOpenCard:(id:string)=>void}){
  const [alignment,setAlignment]=useState<CourtAlignment>('printed-role');
  const [suit,setSuit]=useState<CourtSuit>('Wands');
  const [selected,setSelected]=useState('wands-king');
  const coverage=courtRankCoverage();
  const current=selected.startsWith(suit.toLowerCase()+'-')?selected:suit.toLowerCase()+'-king';
  const record=courtRankRecord(current,alignment);
  const choices=listCourtRankRecords(alignment).filter(c=>c.canonical.suit===suit);
  if(!record)throw new Error('Selected court card not found.');

  function pickSuit(next:CourtSuit) {
    setSuit(next);
    const rank=current.split('-')[1]||'king';
    setSelected(next.toLowerCase()+'-'+rank);
  }

  return <section className="gaia-court-concordance">
    <div className="section-header">
      <span className="eyebrow">GAIA / COURT RANK CONCORDANCE · v1.4</span>
      <h2>Same title, different royal court.</h2>
      <p>Compare all 16 tarot court cards across Marseille, Rider–Waite–Smith,
        the Golden Dawn’s printed Book T and Crowley/Harris Thoth. The King
        and Knight mapping is genuinely disputed. Switch the alignment to
        see both interpretations rather than treating either as universal.</p>
    </div>
    <div className="gaia-court-metrics">
      <div><strong>{coverage.courtCards}</strong><small>Source-indexed court cards</small></div>
      <div><strong>{coverage.suits}</strong><small>Suit families</small></div>
      <div><strong>{coverage.rankAlignmentModes}</strong><small>Documented comparison choices</small></div>
    </div>
    <section className="panel gaia-court-workbench">
      <h3>Choose how the ranks align</h3>
      <div className="gaia-court-alignment" role="group" aria-label="Court rank alignment method">
        <button type="button" aria-pressed={alignment==='printed-role'}
          className={alignment==='printed-role'?'active':''}
          onClick={()=>setAlignment('printed-role')}>
          <strong>Printed Book T roles</strong>
          <small>Follow the 1912 card labels and mounted/charioted role. King → Prince, Knight → Knight.</small>
        </button>
        <button type="button" aria-pressed={alignment==='rank-hierarchy'}
          className={alignment==='rank-hierarchy'?'active':''}
          onClick={()=>setAlignment('rank-hierarchy')}>
          <strong>Rank-hierarchy comparison</strong>
          <small>Match top to top across Waite–Smith and Thoth. King → Knight, Knight → Prince.</small>
        </button>
      </div>
      <p className="muted">Switching the method changes only the historical correspondence
        displayed below. The real selected card, its original meanings and your
        stored deck data do not change. There is no universally verified
        pictorial equivalence across these decks.</p>
      <h3>Choose a suit and court card</h3>
      <div className="gaia-court-suit-tabs" role="group" aria-label="Suit">
        {SUITS.map(key=><button key={key} type="button"
          aria-pressed={suit===key} className={suit===key?'active':''}
          onClick={()=>pickSuit(key)}>{SUIT_LABEL[key]}</button>)}
      </div>
      <div className="gaia-court-picker" role="group" aria-label="Court card">
        {choices.map(choice=><button key={choice.canonical.id}
          className={choice.canonical.id===record.canonical.id?'active':''}
          aria-pressed={choice.canonical.id===record.canonical.id}
          type="button" onClick={()=>setSelected(choice.canonical.id)}>
          {choice.canonical.name}
        </button>)}
      </div>
      <div className="gaia-court-heading">
        <div>
          <span className="eyebrow">CANONICAL GAIA CARD / SOURCE COMPARISON</span>
          <h3>{record.canonical.name}</h3>
        </div>
        <button className="secondary" type="button"
          onClick={()=>onOpenCard(record.canonical.id)}>Explore original card ↗</button>
      </div>
      <div className="gaia-court-columns">
        <article>
          <span className="eyebrow">RIDER–WAITE–SMITH</span>
          <h4>{record.canonical.name}</h4>
          <p>GAIA’s actual card identity, unchanged in either alignment.</p>
          <a href={COURT_REFERENCES[1].url} target="_blank" rel="noopener noreferrer">Waite's primary text ↗</a>
        </article>
        <article>
          <span className="eyebrow">MARSEILLE</span>
          <h4>{record.marseille.name}</h4>
          <p>{record.marseille.note}</p>
          <a href={COURT_REFERENCES[3].url} target="_blank" rel="noopener noreferrer">Marseille rank reference ↗</a>
        </article>
        <article>
          <span className="eyebrow">GOLDEN DAWN / BOOK T</span>
          <h4>{record.goldenDawn.printedName}</h4>
          <p><strong>Historical role:</strong> {record.goldenDawn.role}</p>
          <p><strong>Elemental grade:</strong> {record.goldenDawn.elementalGrade}</p>
          <p><strong>Published title:</strong> {record.goldenDawn.bookTTitle}</p>
          <a href={COURT_REFERENCES[0].url} target="_blank" rel="noopener noreferrer">Book T primary text ↗</a>
        </article>
        <article>
          <span className="eyebrow">THOTH / CROWLEY & HARRIS</span>
          <h4>{record.thoth.name}</h4>
          <p>The {record.thoth.rank} rank is paired here using the selected comparison convention.</p>
          <a href={COURT_REFERENCES[2].url} target="_blank" rel="noopener noreferrer">Thoth court text ↗</a>
        </article>
      </div>
      <div className="gaia-court-caution" role="note">
        <strong>{record.provenance.isDebated?'Disputed King/Knight alignment':'Consistent Page/Queen comparison'}</strong>
        <p>{record.provenance.warning}</p>
        <p>Printed titles and elemental classifications are historical features
          of particular occult traditions, not observed personal traits or
          scientifically demonstrated forces.</p>
      </div>
    </section>
    <section className="panel gaia-court-sources">
      <h3>Research ledger</h3>
      <p className="muted">A historic text can establish its author’s rank labels and
        symbolism, but cannot by itself settle how every later deck should
        align. These sources are not interchangeable.</p>
      <div className="gaia-court-source-grid">
        {COURT_REFERENCES.map(ref=><article key={ref.id}>
          <span className="eyebrow">{ref.kind.replaceAll('-',' ')}</span>
          <h4>{ref.label}</h4>
          <p className="muted">{ref.author}</p>
          <p>{ref.scope}</p>
          <a href={ref.url} target="_blank" rel="noopener noreferrer">View reference ↗</a>
        </article>)}
      </div>
      <p className="muted">This release completes the **16 court-card rank/title
        comparisons only**. The other 40 Minor Arcana (four Aces and
        thirty-six numbered cards) are compared separately in GAIA's
        **Minor Pips** chamber, with different source and interpretation limits. No new cards or artwork were introduced.
        The currently reviewed 52 Waite card-meaning notes (22 Major, 30 Minor) remain
        a separate and much smaller historical interpretation audit.</p>
    </section>
  </section>;
}
