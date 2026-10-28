import { useState } from 'react';
import type { PointerEvent } from 'react';
import {
  ATLAS_TEMPLATES, moveAtlasSlot, parseAtlasJSON,
  serializeAtlasLayout, validateAtlasLayout
} from './spreadAtlas';
import type { AtlasLayout, AtlasSlot } from './spreadAtlas';

export function SpreadAtlasPanel({ onUseLayout }: { onUseLayout: (layout: AtlasLayout)=>void }) {
  const [layout,setLayout] = useState<AtlasLayout>(()=>ATLAS_TEMPLATES[0]);
  const [selected,setSelected] = useState(0);
  const [drag,setDrag] = useState<number|null>(null);
  const [input,setInput] = useState('');
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');
  const slots=layout.slots;
  const active=slots[Math.min(selected,slots.length-1)];

  function editSlot(index:number, patch:Partial<AtlasSlot>) {
    setLayout(prev=>({...prev,slots:prev.slots.map((s,i)=>i===index?{...s,...patch}:s)}));
    setError('');setMessage('');
  }

  function selectTemplate(index:number) {
    if (!ATLAS_TEMPLATES[index]) return;
    if (layout !== ATLAS_TEMPLATES[index] &&
      !window.confirm('Load this template? Your unsaved Spread Atlas edits will be replaced.')) return;
    setLayout(ATLAS_TEMPLATES[index]);setSelected(0);setError('');setMessage('');
  }

  function addPosition() {
    if(slots.length>=5)return;
    const candidate=[.17,.35,.5,.65,.83].flatMap(y=>
      [.18,.36,.5,.64,.82].map(x=>({x,y}))).find(p=>
      slots.every(s=>Math.hypot(s.x-p.x,s.y-p.y)>=.17));
    if(!candidate){setError('No non-overlapping position was found. Move existing cards first.');return;}
    const next=slots.length+1;
    setLayout(prev=>({...prev,slots:[...prev.slots,{id:'slot-'+next,
      label:'Position '+next,meaning:'What this position invites you to consider.',
      ...candidate}]}));
    setSelected(slots.length);setError('');
  }

  function removePosition(){
    if(slots.length<=1)return;
    if(!window.confirm('Remove the final position from this layout?'))return;
    setLayout(prev=>({...prev,slots:prev.slots.slice(0,-1)}));
    setSelected(n=>Math.min(n,slots.length-2));setError('');
  }

  function move(pointer:PointerEvent<SVGSVGElement>){
    if(drag===null)return;
    const rect=pointer.currentTarget.getBoundingClientRect();
    const x=(pointer.clientX-rect.left)/rect.width;
    const y=(pointer.clientY-rect.top)/rect.height;
    try{setLayout(moveAtlasSlot(layout,drag,x,y));setError('');}
    catch{/* A too-close or invalid move is ignored; the last valid position stays. */}
  }

  function download() {
    try {
      const text=serializeAtlasLayout(layout);
      const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
      const a=document.createElement('a');a.href=url;a.download='gaia-spread-atlas.json';a.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      setMessage('Layout JSON export requested. It contains only your custom spread, no private journal or cards.');
      setError('');
    }catch(e){setError(e instanceof Error?e.message:String(e));}
  }

  function importData(){
    try{const imported=parseAtlasJSON(input);
      if(!window.confirm('Import this layout? It will replace your unsaved Spread Atlas edits.'))return;
      setLayout(imported);setSelected(0);setInput('');setError('');
      setMessage('Validated local JSON imported. Nothing was uploaded.');
    }catch(e){setError(e instanceof Error?e.message:String(e));}
  }

  function useLayout(){
    try{onUseLayout(validateAtlasLayout(layout));}
    catch(e){setError(e instanceof Error?e.message:String(e));}
  }

  return <section className="gaia-spread-atlas">
    <div className="section-header">
      <span className="eyebrow">GAIA / SPREAD ATLAS v0.6 · LOCAL EDITOR</span>
      <h2>Design your own ritual.</h2>
      <p>Arrange one to five tarot positions on a custom board. Name the roles, give
        each position a purpose, and export or import a portable layout. Drag the
        nodes or use the coordinate controls below. Nothing is uploaded or saved
        automatically.</p>
    </div>
    <section className="panel">
      <div className="gaia-atlas-tools">
        {ATLAS_TEMPLATES.map((template,i)=><button className="secondary" type="button"
          key={template.name} onClick={()=>selectTemplate(i)}>
          {template.name} · {template.slots.length}
        </button>)}
      </div>
      <div className="gaia-reading-fields">
        <label>Spread title
          <input maxLength={48} value={layout.name} onChange={e=>setLayout(prev=>({...prev,name:e.target.value}))}/>
        </label>
        <label>Positions
          <input readOnly value={slots.length+' of 5'} aria-label="Number of positions"/>
        </label>
      </div>
      <div className="actions">
        <button className="secondary" type="button" onClick={addPosition} disabled={slots.length>=5}>
          Add a position
        </button>
        <button className="secondary" type="button" onClick={removePosition} disabled={slots.length<=1}>
          Remove final position
        </button>
      </div>
      <div className="gaia-atlas-board-wrap">
        <svg viewBox="0 0 800 520" role="img" aria-label="Editable tarot position map"
          onPointerMove={move}
          onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);setDrag(null);}}
          onPointerCancel={()=>setDrag(null)}>
          <defs>
            <pattern id="gaia-atlas-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1.2" fill="#638e7d"/>
            </pattern>
          </defs>
          <rect x="0" y="0" width="800" height="520" rx="20" fill="#0f2c34"/>
          <rect x="0" y="0" width="800" height="520" rx="20" fill="url(#gaia-atlas-grid)"/>
          {slots.map((slot,i)=> <g key={slot.id} className="gaia-atlas-node"
            transform={'translate('+slot.x*800+' '+slot.y*520+')'}
            onPointerDown={e=>{
              e.preventDefault();
              setSelected(i);setDrag(i);
              e.currentTarget.ownerSVGElement?.setPointerCapture(e.pointerId);
            }}>
            <rect x="-73" y="-50" width="146" height="100" rx="12"
              fill={i===selected?'#285c50':'#183e40'}
              stroke={i===selected?'#f0d99f':'#94bea8'} strokeWidth={i===selected?4:2}/>
            <text textAnchor="middle" y="-12" fill="#f5dfaf" fontSize="13">{i+1} · {slot.label.slice(0,18)}</text>
            <text textAnchor="middle" y="15" fill="#cadccf" fontSize="12">Drag to arrange</text>
            <circle cx="0" cy="32" r="4" fill="#e4cb8a"/>
          </g>)}
        </svg>
      </div>
      <p className="muted">Drag a position to move it. Card slots cannot overlap or leave the
        board. Drawing order follows the numbered positions, not their placement.</p>
      <div className="gaia-atlas-editor">
        <div className="gaia-atlas-position-tabs" role="group" aria-label="Choose position to edit">
          {slots.map((slot,i)=><button type="button" key={slot.id}
            className={i===selected?'active':''} aria-pressed={selected===i}
            onClick={()=>setSelected(i)}>{i+1}. {slot.label}</button>)}
        </div>
        <div className="gaia-reading-fields">
          <label>Position name
            <input maxLength={32} value={active.label}
              onChange={e=>editSlot(selected,{label:e.target.value})}/>
          </label>
          <label>Interpretive role
            <input maxLength={110} value={active.meaning}
              onChange={e=>editSlot(selected,{meaning:e.target.value})}/>
          </label>
          <label>Horizontal placement (%)
            <input type="number" min={9} max={91} step={1}
              value={Math.round(active.x*100)}
              onChange={e=>{try{setLayout(moveAtlasSlot(layout,selected,Number(e.target.value)/100,layout.slots[selected].y));setError('');}
                catch(err){setError(err instanceof Error?err.message:String(err));}}}/>
          </label>
          <label>Vertical placement (%)
            <input type="number" min={12} max={88} step={1}
              value={Math.round(active.y*100)}
              onChange={e=>{try{setLayout(moveAtlasSlot(layout,selected,layout.slots[selected].x,Number(e.target.value)/100));setError('');}
                catch(err){setError(err instanceof Error?err.message:String(err));}}}/>
          </label>
        </div>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {message && <p className="muted" role="status">{message}</p>}
      <div className="actions">
        <button className="primary" type="button" onClick={useLayout}>Use this layout in Ritual Draw ↗</button>
        <button className="secondary" type="button" onClick={download}>Export layout JSON</button>
      </div>
    </section>
    <section className="panel">
      <h3>Import a saved layout</h3>
      <p className="muted">Paste only a GAIA_SPREAD_ATLAS_V1 JSON layout. Imported layouts
        cannot run code and are limited to five non-overlapping positions.
        Your input stays in this browser tab.</p>
      <textarea rows={4} maxLength={8000} value={input}
        aria-label="Paste Spread Atlas JSON" onChange={e=>setInput(e.target.value)}
        placeholder='{"schema":"GAIA_SPREAD_ATLAS_V1","name":"...","slots":[...]}'/>
      <div className="actions">
        <button type="button" className="secondary" disabled={!input.trim()}
          onClick={importData}>Validate and import JSON</button>
      </div>
    </section>
  </section>;
}
