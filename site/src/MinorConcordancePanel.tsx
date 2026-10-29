import { useState } from 'react';
import {
  MINOR_REFERENCES, listMinorConcordanceEntries, minorConcordanceCoverage,
  minorConcordanceEntry
} from './minorConcordance';
import type { MinorSuit } from './minorConcordance';

const suits:MinorSuit[]=['Wands','Cups','Swords','Pentacles'];
const rankLabels=['Ace','2','3','4','5','6','7','8','9','10'];

export function MinorConcordancePanel({onOpenCard}:{onOpenCard:(id:string)=>void}){
  const [suit,setSuit]=useState<MinorSuit>('Wands');
  const [rank,setRank]=useState(8);
  const [sourceFilter,setSourceFilter]=useState<'all'|'historical-primary-text'|'modern-secondary-index'>('all');
  const id=suit.toLowerCase()+'-'+(rank===1?'ace':rank);
  const entry=minorConcordanceEntry(id);
  if(!entry)throw new Error('Minor Arcana card not found.');
  const coverage=minorConcordanceCoverage();
  const matching=listMinorConcordanceEntries().filter(c=>c.canonical.suit===suit);
  const visible=MINOR_REFERENCES.filter(ref=>sourceFilter==='all'||ref.kind===sourceFilter);
  return <section className="gaia-minor-concordance">
    <div className="section-header">
      <span className="eyebrow">GAIA / ACE + PIP CONCORDANCE · v1.5</span>
      <h2>Forty cards, four distinct stories.</h2>
      <p>Inspect each Ace or numbered card across the Marseille pattern,
        Rider–Waite–Smith, Golden Dawn Book T and the Crowley/Harris Thoth deck.
        Compare the historical titles, suit names, pip illustrations and
        documented decan assignments. Matching structure does not establish
        a single shared tarot interpretation.</p>
    </div>
    <div className="gaia-minor-metrics" aria-label="Structural comparison coverage">
      <div><strong>{coverage.structuralComparisons}</strong><small>Indexed Aces and pips</small></div>
      <div><strong>{coverage.aces}</strong><small>Elemental Aces</small></div>
      <div><strong>{coverage.decanPips}</strong><small>Book T decan pips</small></div>
    </div>
    <section className="panel gaia-minor-workbench">
      <span className="eyebrow">SELECT A REAL GAIA CARD</span>
      <div className="gaia-minor-suits" role="group" aria-label="Minor Arcana suit">
        {suits.map(s=><button type="button" key={s} aria-pressed={suit===s}
          className={suit===s?'active':''} onClick={()=>setSuit(s)}>{s}</button>)}
      </div>
      <div className="gaia-minor-ranks" role="group" aria-label="Minor Arcana number">
        {matching.map((c,i)=><button type="button" key={c.id}
          aria-pressed={rank===i+1} className={rank===i+1?'active':''}
          onClick={()=>setRank(i+1)}>{rankLabels[i]}</button>)}
      </div>
      <div className="gaia-minor-heading">
        <div>
          <span className="eyebrow">CARD ID · {entry.id}</span>
          <h3>{entry.canonical.name}</h3>
        </div>
        <button className="secondary" type="button" onClick={()=>onOpenCard(entry.id)}>
          Inspect original GAIA card ↗
        </button>
      </div>
      <div className="gaia-minor-grid">
        <article>
          <span className="eyebrow">MARSEILLE / SUIT-SYMBOL PIPS</span>
          <h4>{entry.marseille.normalizedLabel}</h4>
          <p><strong>Suit:</strong> {entry.marseille.suitLabel}</p>
          <p>{entry.marseille.visualConvention}</p>
          <p className="gaia-minor-disclaimer">{entry.marseille.printedLabelCaution}</p>
          <a href={MINOR_REFERENCES[1].url} target="_blank" rel="noopener noreferrer">Modern pattern analysis ↗</a>
        </article>
        <article>
          <span className="eyebrow">RIDER–WAITE–SMITH</span>
          <h4>{entry.rws.label}</h4>
          <p>{entry.rws.visualConvention}</p>
          <p>This is GAIA's original local card identity and editorial deck.
            A historical Waite association is not automatically GAIA's modern
            upright/reversed meaning.</p>
          <a href={MINOR_REFERENCES[0].url} target="_blank" rel="noopener noreferrer">Waite primary text ↗</a>
        </article>
        <article>
          <span className="eyebrow">GOLDEN DAWN / 1912 BOOK T</span>
          <h4>{entry.goldenDawn.title}</h4>
          <p><strong>Element:</strong> {entry.goldenDawn.element}</p>
          <p><strong>Sephirah:</strong> {entry.goldenDawn.sephirah}</p>
          {entry.goldenDawn.isDecanPip ? <>
            <p><strong>Zodiac decan:</strong> {entry.goldenDawn.decan}</p>
            <p><strong>Planetary ruler:</strong> {entry.goldenDawn.planetRuler}</p>
          </>:<p><strong>Elemental root:</strong> No single numbered-pip decan or planet belongs to this Ace.</p>}
          <a href={MINOR_REFERENCES[2].url} target="_blank" rel="noopener noreferrer">Book T primary text ↗</a>
        </article>
        <article>
          <span className="eyebrow">THOTH / CROWLEY & HARRIS</span>
          <h4>{entry.thoth.label}</h4>
          <p><strong>Suit:</strong> {entry.thoth.suitLabel}</p>
          <p>{entry.thoth.printedKeyword?
            'The printed keyword is a specific Thoth title, not a verbatim copy of Book T’s longer Lord title.'
            :'The Ace carries its elemental suit title, not an invented Thoth pip keyword.'}</p>
          <a href={MINOR_REFERENCES[3].url} target="_blank" rel="noopener noreferrer">Historical title index ↗</a>
        </article>
      </div>
      <div className="gaia-minor-boundaries" role="note">
        <strong>Research scope, not an automatic reading</strong>
        {entry.provenance.notes.map((note,i)=><p key={i}>{note}</p>)}
        <p>The Concordance does not transmit these labels to an LLM,
          redraw your cards, or claim to scientifically verify tarot.</p>
      </div>
    </section>
    <section className="panel gaia-minor-references">
      <h3>Source ledger</h3>
      <p className="muted">These links identify different types of evidence.
        Primary historical descriptions establish what a historical writer
        recorded; modern comparative indexes help identify edition-specific
        labels, without pretending to be contemporary originals.</p>
      <div className="gaia-minor-source-filters" role="group" aria-label="Filter source type">
        {([
          ['all','All references'],
          ['historical-primary-text','Primary historical texts'],
          ['modern-secondary-index','Modern secondary indexes']
        ] as const).map(([type,label])=><button key={type}
          type="button" aria-pressed={sourceFilter===type}
          className={sourceFilter===type?'active':''} onClick={()=>setSourceFilter(type)}>{label}</button>)}
      </div>
      <div className="gaia-minor-source-grid">
        {visible.map(ref=><article key={ref.id}>
          <span className="eyebrow">{ref.kind.replaceAll('-',' ')}</span>
          <h4>{ref.title}</h4>
          <p className="muted">{ref.authorOrEditor}</p>
          <p>{ref.scope}</p>
          <a href={ref.url} target="_blank" rel="noopener noreferrer">Open reference ↗</a>
        </article>)}
      </div>
      <p className="muted">Structural indexing across GAIA's chambers now covers
        { ' ' }{coverage.structurallyIndexedAcrossMajorCourtAndPip} card identities
        (22 major, 16 court and 40 Ace/pip). This does not turn the 40
        historically reviewed Waite *interpretation* notes (22 Major, 18 Minor) into 78 reviewed
        meanings, and does not prove universal image equivalence.</p>
    </section>
  </section>;
}
