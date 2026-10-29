import { useState } from 'react';
import {
  CONCORDANCE_SOURCES, concordanceEntries, concordanceCoverage, findConcordanceSource
} from './crossTradition';
import type { ConcordanceSource, ConcordanceFace } from './crossTradition';

const LABELS:{id:'rws'|'marseille'|'goldenDawn'|'thoth'; name:string;caption:string}[]=[
  {id:'marseille',name:'Marseille',caption:'Historical Conver-pattern cartouches'},
  {id:'rws',name:'Rider–Waite–Smith',caption:'Waite and Pamela Colman Smith'},
  {id:'goldenDawn',name:'Golden Dawn',caption:'Book T letter and astrology schema'},
  {id:'thoth',name:'Thoth',caption:'Crowley and Lady Frieda Harris'}
];
const DIFFERENCES:Record<string,string>={
  numbering:'Trump numbering differs',
  renaming:'Card title differs',
  'untitled-card':'Historically untitled trump',
  'unchanged-label':'Names and numbers largely retained'
};
function ReferenceLink({id,label}:{id:string;label?:string}){
  const reference=findConcordanceSource(id);
  return <a href={reference.url} target="_blank" rel="noopener noreferrer">
    {label||reference.title} ↗
  </a>;
}
function TraditionFace({face}:{face:ConcordanceFace}){
  return <>
    <div className="gaia-concordance-rank">{face.ordinal}</div>
    <h4>{face.label}</h4>
    {face.engravedCartouche && <p className="gaia-concordance-plate">
      <strong>Conver-style printed cartouche:</strong> {face.engravedCartouche}
      <small> Transcribed in a modern secondary index of a BnF collection; not a direct scan audit.</small>
    </p>}
    <p>{face.note}</p>
    <ReferenceLink id={face.sourceId} label="View historical reference"/>
  </>;
}

export function ConcordancePanel({onOpenCard}:{onOpenCard:(id:string)=>void}){
  const examples=concordanceEntries();
  const coverage=concordanceCoverage();
  const [selected,setSelected]=useState('major-8');
  const [search,setSearch]=useState('');
  const [sourceType,setSourceType]=useState<'all'|'primary'|'academic'>('all');
  const entry=examples.find(e=>e.cardId===selected)||examples[0];
  const matched=examples.filter(x=>{
    const haystack=(x.canonicalName+' '+x.marseille.label+' '+x.thoth.label).toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });
  const sources=CONCORDANCE_SOURCES.filter(s=>sourceType==='all'
    ||(sourceType==='primary'&&s.type==='historical-primary-text')
    ||(sourceType==='academic'&&s.type==='academic-study'));

  return <section className="gaia-concordance">
    <div className="section-header">
      <span className="eyebrow">GAIA / CROSS-TRADITION CONCORDANCE · v1.3</span>
      <h2>One card. Four historical lenses.</h2>
      <p>Tarot traditions share some recognizable symbols but do not share every
        title, ordinal, historical interpretation or pictorial design. Compare
        all 22 source-indexed Major Arcana structural correspondences without altering
        GAIA's actual cards or treating historical labels as scientific truth.</p>
    </div>
    <div className="gaia-concordance-coverage">
      <div><strong>{coverage.comparisons}</strong><small>Source-indexed major cards</small></div>
      <div><strong>{coverage.traditions}</strong><small>Traditions shown</small></div>
      <div><strong>{coverage.pending}</strong><small>Major card labels missing</small></div>
    </div>
    <section className="panel gaia-concordance-workbench">
      <label htmlFor="gaia-concordance-search">Search all 22 Major Arcana comparisons</label>
      <input id="gaia-concordance-search" maxLength={100} value={search}
        placeholder="Strength, Justice, Lust, La Force..."
        onChange={e=>setSearch(e.target.value)}/>
      <div className="gaia-concordance-picker" role="group" aria-label="Select a historically compared trump">
        {matched.map(card=><button type="button" key={card.cardId}
          aria-pressed={entry.cardId===card.cardId}
          className={entry.cardId===card.cardId?'active':''}
          onClick={()=>setSelected(card.cardId)}>
          <span>{card.canonicalName}</span>
          <small>{card.marseille.ordinal} Marseille · {card.rws.ordinal} RWS</small>
        </button>)}
        {!matched.length&&<p className="muted">No matching Major Arcana title in the 22-card catalog.
          Try the English, Marseille or Thoth name.</p>}
      </div>
      <div className="gaia-concordance-header">
        <div>
          <span className="eyebrow">SOURCE-INDEXED STRUCTURAL RECORD</span>
          <h3>{entry.canonicalName}</h3>
        </div>
        <button className="secondary" type="button" onClick={()=>onOpenCard(entry.cardId)}>
          Open original GAIA record ↗
        </button>
      </div>
      <div className="gaia-concordance-differences">
        {entry.differences.map(diff=><span key={diff}>{DIFFERENCES[diff]}</span>)}
      </div>
      <div className="gaia-concordance-grid">
        {LABELS.map(item=><article className="gaia-concordance-tradition" key={item.id}>
          <span className="eyebrow">{item.name}</span>
          <small className="gaia-concordance-caption">{item.caption}</small>
          {item.id==='goldenDawn'?<>
            <div className="gaia-concordance-rank">{entry.goldenDawn.hebrewLetter}</div>
            <h4>{entry.goldenDawn.attribution}</h4>
            <p>Golden Dawn Tree path: {entry.goldenDawn.path}</p>
            <p>{entry.goldenDawn.note}</p>
            <ReferenceLink id={entry.goldenDawn.sourceId} label="Book T source"/>
          </>:<TraditionFace face={entry[item.id]}/>}
        </article>)}
      </div>
      <div className="gaia-concordance-boundary" role="note">
        <strong>What the comparison does and does not establish</strong>
        <p>{entry.interpretationBoundary}</p>
        <p>Coverage of all 22 Major Arcana is coverage of indexed names and numbers, not 22
          independent critical studies of each deck’s history. This concordance is not a verified
          shared upright/reversed reading, a reconstructed original card image,
          or proof of supernatural effects. The existing Symbolic Library's
          twenty-eight Waite interpretation reviews (all 22 Major, six Minor) are a separate audit.</p>
      </div>
    </section>
    <section className="panel gaia-concordance-sources">
      <span className="eyebrow">RESEARCH LEDGER / SOURCE TYPE MATTERS</span>
      <h3>Follow the published record.</h3>
      <p className="muted">Source annotations identify whether a link leads to a
        historical text, institutional exhibit, academic publication or
        modern secondary reference. These are not interchangeable.</p>
      <div className="gaia-concordance-source-tabs" role="group" aria-label="Filter research sources">
        {([
          ['all','All sources'],
          ['primary','Historical primary texts'],
          ['academic','Academic research']
        ] as const).map(([id,name])=><button key={id} type="button"
          className={sourceType===id?'active':''}
          aria-pressed={sourceType===id} onClick={()=>setSourceType(id)}>{name}</button>)}
      </div>
      <div className="gaia-concordance-source-list">
        {sources.map((source:ConcordanceSource)=><article key={source.id}>
          <span className="eyebrow">{source.type.replaceAll('-',' ')} · {source.year}</span>
          <h4>{source.title}</h4>
          <p className="muted">{source.author}</p>
          <p>{source.scope}</p>
          <ReferenceLink id={source.id} label="Open reference"/>
        </article>)}
      </div>
      <p className="muted">No artwork, copyrighted Thoth paintings, third-party card
        interpretations or downloaded documents have been embedded. Clicking an
        external reference is deliberate; ordinary exploration remains offline.</p>
    </section>
  </section>;
}
