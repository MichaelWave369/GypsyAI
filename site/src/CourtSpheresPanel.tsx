import { COURT_SPHERES_SOURCE, getCourtSphere } from './courtSpheres';

export function CourtSpheresPanel({ cardId, onSelectCard }: {
  cardId:string;
  onSelectCard:(cardId:string)=>void;
}) {
  const sphere=getCourtSphere(cardId);
  if(!sphere)return null;
  return <section className="gaia-court-sphere">
    <span className="eyebrow">COURT SPHERES / BOOK T · 1912</span>
    <h4>Where does this court sit in the historical zodiac?</h4>
    <p className="muted">This describes the Golden Dawn's symbolic correspondence system.
      It does not establish planetary effects, a birth personality, or literal
      correspondence between every Rider–Waite–Smith illustration and Book T.</p>
    <p><strong>GAIA card:</strong> {sphere.cardName}</p>
    <p><strong>Book T terminology:</strong> {sphere.historicalBookTRole}</p>
    {sphere.type==='zodiac-span' && sphere.from && sphere.to ? <>
      <p><strong>Historical span:</strong> from 20° {sphere.from.sign} to 20°
        {' '}{sphere.to.sign}, a continuous 30-degree band spanning two signs.</p>
      <div className="gaia-sphere-band" aria-label={'Three consecutive ten-degree sectors from 20 degrees '+
        sphere.from.sign+' to 20 degrees '+sphere.to.sign}>
        {sphere.pipReferences.map((p,index)=><button type="button" key={p.id}
          className={'gaia-sphere-sector sector-'+index}
          aria-label={'Inspect '+p.name+', '+p.sign+' '+p.startDegree+' to '+p.endDegree+' degrees'}
          onClick={()=>onSelectCard(p.id)}>
          <span className="eyebrow">{p.sign} {p.startDegree}–{p.endDegree}°</span>
          <strong>{p.name}</strong>
          <small>Inspect source card ↗</small>
        </button>)}
      </div>
      <p className="muted">These three exact pip-card decans are from GAIA's already
        checked Book T table. The first often belongs to a different suit.
        Select any segment to open its card's library record. Displayed
        boundaries use 10-degree intervals, with endpoints interpreted
        continuously rather than as three overlapping bands.</p>
    </> : <>
      <div className="gaia-sphere-polar">
        <span aria-hidden="true">✦</span>
        <p>Polar celestial quadrant / Princess throne</p>
      </div>
      <p className="muted">Book T gives this Princess/Knave a celestial quadrant
        around the northern ecliptic pole, not a specific ten-degree zodiac decan.
        This source note deliberately does not invent the quadrant's angular
        boundary or assign three numbered cards to it.</p>
    </>}
    <p className="muted"><strong>Primary source section:</strong> {sphere.sourceSection}</p>
    <p>{sphere.caveat}</p>
    <a href={COURT_SPHERES_SOURCE.url} target="_blank" rel="noopener noreferrer">
      Read the historical court-card source ↗
    </a>
  </section>;
}
