import { useState } from 'react';
import {
  SYMBOLIC_SOURCES, findSymbolicEntry, getSourceForAnnotation,
  searchSymbolicEntries, symbolicCoverage
} from './symbolicLibrary';
import type { SymbolicFilter } from './symbolicLibrary';
import { getHermeticAuditForCard, hermeticAuditCoverage, HERMETIC_AUDIT_REFERENCES } from './hermeticAudit';

type Orientation = 'upright' | 'reversed';

export function SymbolicLibraryPanel({ initialCardId }: { initialCardId?: string | null }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<SymbolicFilter>('all');
  const [chosenId, setChosenId] = useState(initialCardId || 'major-7');
  const [orientation, setOrientation] = useState<Orientation>('upright');
  const coverage = symbolicCoverage();
  const hermeticCoverage = hermeticAuditCoverage();
  const matches = searchSymbolicEntries(search, filter);
  const entry = findSymbolicEntry(chosenId);
  const audit = getHermeticAuditForCard(chosenId);
  const note = entry?.annotation;
  const source = note ? getSourceForAnnotation(note) : null;

  function selectCard(id: string) {
    setChosenId(id);
    setOrientation('upright');
  }

  return <section className="gaia-library">
    <div className="section-header">
      <span className="eyebrow">GAIA / SYMBOLIC LIBRARY · PROVENANCE FIRST</span>
      <h2>The scholarship behind the symbols.</h2>
      <p>Explore GAIA's original 78-card editorial deck, then compare selected cards with
        explicitly reviewed historical writing. Every historical observation names its
        source. Unreviewed material is marked honestly, rather than receiving an invented citation.</p>
    </div>
    <div className="gaia-library-counts" aria-label="Library coverage">
      <div><strong>{coverage.total}</strong><span>Cards in GAIA deck</span></div>
      <div><strong>{coverage.editorial}</strong><span>GAIA original interpretations</span></div>
      <div><strong>{coverage.historicalReviewed}</strong><span>Historical notes reviewed</span></div>
      <div><strong>{coverage.historicalNotReviewed}</strong><span>Historical notes pending</span></div>
    </div>
    <p className="muted gaia-audit-coverage">Hermetic correspondence audit:
      <strong> {hermeticCoverage.traditionChecked} of {hermeticCoverage.total}</strong>
      {' '}cards have checked Golden Dawn fields; <strong>{hermeticCoverage.specialistPending}</strong>
      {' '}court/ace records still require specialist review. This is historical attribution,
      not empirical proof of divination.</p>
    <div className="gaia-library-workspace">
      <aside className="gaia-library-index panel" aria-label="Browse tarot cards">
        <label htmlFor="gaia-library-search">Search by card name or GAIA keyword</label>
        <input id="gaia-library-search" value={search} maxLength={100}
          placeholder="Search 78 cards..." onChange={e=>setSearch(e.target.value)}/>
        <label htmlFor="gaia-library-filter">Show</label>
        <select id="gaia-library-filter" value={filter}
          onChange={e=>setFilter(e.target.value as SymbolicFilter)}>
          <option value="all">All cards</option>
          <option value="major">Major Arcana</option>
          <option value="minor">Minor Arcana</option>
          <option value="reviewed">Reviewed source notes</option>
        </select>
        <p className="muted">{matches.length} cards match</p>
        <div className="gaia-library-items">
          {matches.map(card=><button type="button" key={card.id}
            aria-pressed={chosenId===card.id} className={chosenId===card.id?'active':''}
            onClick={()=>selectCard(card.id)}>
            <span>{card.name}</span>
            <small>{card.annotation?'Historical note reviewed':'GAIA editorial only'}</small>
          </button>)}
          {!matches.length && <p className="muted">No matching cards. Try another name or reset the filter.</p>}
        </div>
      </aside>
      <div className="gaia-library-detail">
        {entry && <article className="panel gaia-library-card">
          <span className="eyebrow">CARD RECORD / {entry.id}</span>
          <h3>{entry.name}</h3>
          <p className="muted">{entry.arcana === 'major' ? 'Major Arcana' : 'Minor Arcana'}
            {entry.suit ? ' · '+entry.suit : ''}</p>
          <div className="gaia-library-tags">
            <span>GAIA editorial</span>
            <span>{entry.annotation ? 'Historical source note reviewed' : 'Historical comparison pending'}</span>
          </div>
          <div role="group" aria-label="Orientation for GAIA interpretation" className="gaia-library-orientation">
            <button type="button" aria-pressed={orientation==='upright'}
              className={orientation==='upright'?'active':''}
              onClick={()=>setOrientation('upright')}>Upright</button>
            <button type="button" aria-pressed={orientation==='reversed'}
              className={orientation==='reversed'?'active':''}
              onClick={()=>setOrientation('reversed')}>Reversed</button>
          </div>
          <div className="gaia-library-interpretation">
            <span className="eyebrow">GAIA / ORIGINAL EDITORIAL INTERPRETATION</span>
            <p>{orientation==='upright'?entry.editorial.uprightMeaning:entry.editorial.reversedMeaning}</p>
            <p className="muted">{(orientation==='upright'
              ?entry.editorial.uprightKeywords:entry.editorial.reversedKeywords).join(' · ')}</p>
          </div>
          <div className="gaia-library-source-section">
            <h4>Historical comparison</h4>
            {note && source ? <>
              <p>{note.checkedMeaning}</p>
              <p className="muted"><strong>Reference:</strong> {source.authorOrInstitution},
                <em> {source.title}</em> ({source.dateLabel}), {note.sectionTitle}.</p>
              <p className="muted"><strong>Scope:</strong> {note.interpretationScope==='card-symbolism'
                ? 'Historical card imagery and symbolism. This entry does not verify a separate reversed reading.'
                : 'Historical upright/reversed divinatory descriptions.'}</p>
              <p className="muted"><strong>Boundary:</strong> {note.readingNote}</p>
              <a href={note.sectionUrl} target="_blank" rel="noopener noreferrer">
                Open the cited historical section ↗</a>
            </> : <>
              <p className="muted">No independently reviewed historical card annotation has been
                attached to this entry. GAIA's editorial text is available, but it is
                <strong> not</strong> being passed off as a quotation from Waite or another tradition.</p>
              <p className="muted">Future research can add a source only after the corresponding
                original text has been checked and identified.</p>
            </>}
          </div>
          <details className="gaia-library-hermetic">
            <summary>Hermetic correspondences · audited fields and pending research</summary>
            {audit && <div className="gaia-hermetic-audit">
              <p><strong>Status:</strong> {audit.status==='checked-in-golden-dawn-tradition'
                ? 'Checked against the historical Golden Dawn attribution system, field by field.'
                : 'Specialist historical review still pending.'}</p>
              {audit.fields.map(field=><p key={field.field}>
                <strong>{field.field.replaceAll('_',' ')}:</strong> {field.value}
                <span className="muted"> · Source: {field.evidence}</span>
              </p>)}
              {audit.pendingFields.length>0 && <p><strong>Still pending:</strong>
                {' '}{audit.pendingFields.join(' · ')}</p>}
              {audit.notes.map((note,i)=><p key={i}>{note}</p>)}
              {audit.sources.map(id=>{
                const ref=HERMETIC_AUDIT_REFERENCES.find(r=>r.id===id);
                return ref?<p key={id}><a href={ref.url} target="_blank" rel="noopener noreferrer">
                  {ref.title} ↗</a></p>:null;
              })}
              <p className="muted">Legacy fields below are shown as stored. A checked decan,
                path or planetary label does not authenticate unrelated fields.</p>
            </div>}
            {Object.entries(entry.recordedHermetic).map(([key,value])=><p key={key}>
              <strong>{key.replaceAll('_',' ')}:</strong> {typeof value==='string'||typeof value==='number'
                ? String(value).trim() || 'Not recorded' : 'Not recorded'}
            </p>)}
          </details>
        </article>}
        <section className="panel gaia-library-sources">
          <span className="eyebrow">REFERENCE DESK</span>
          <h3>Sources and limits</h3>
          <p className="muted">The following sources serve different purposes. A source documenting
            the existence of a historical deck is not automatically a source for the
            interpretation of a particular card.</p>
          {SYMBOLIC_SOURCES.map(item=><div className="gaia-library-reference" key={item.id}>
            <strong>{item.title}</strong>
            <p className="muted">{item.authorOrInstitution} · {item.dateLabel}</p>
            <p>{item.scope}</p><p className="muted">{item.accessNote}</p>
            <a href={item.url} target="_blank" rel="noopener noreferrer">View reference ↗</a>
          </div>)}
          <p className="muted">Historical tarot texts describe traditions and beliefs; they do not
            demonstrate supernatural effects or forecast outcomes. GAIA's authored meanings
            remain separately attributed. Older Hermetic paths, decans and correspondences
            in the existing deck are not yet independently validated.</p>
        </section>
      </div>
    </div>
  </section>;
}
