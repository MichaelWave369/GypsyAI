import { useEffect, useRef, useState } from 'react';
import { discoverLocalModels, localOllamaUrl } from './logic';
import type { ChatTurn } from './logic';
import {
  PILOT_MAX_MESSAGE, PILOT_MAX_PROFILE, sendPilotTurn
} from './pilotSession';
import type { PilotMeasurement } from './pilotSession';

const DEFAULT_ORIGIN = 'http://127.0.0.1:11434';
function compactNum(n: number) {
  return Number.isFinite(n) ? n.toFixed(0) + ' ms' : 'n/a';
}
export function PilotSessionPanel() {
  const [origin, setOrigin] = useState(DEFAULT_ORIGIN);
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [profile, setProfile] = useState('');
  const [includeProfile, setIncludeProfile] = useState(false);
  const [profilePreviouslySent, setProfilePreviouslySent] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [measurement, setMeasurement] = useState<PilotMeasurement | null>(null);
  const unmounted = useRef(false);
  const busy = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    return () => { unmounted.current = true; };
  }, []);

  function clearPilot() {
    if (busy.current) return;
    setTurns([]); setProfile(''); setIncludeProfile(false);
    setProfilePreviouslySent(false); setMessage('');
    setMeasurement(null); setError('');
  }
  function changeProfile(text: string) {
    // A prior assistant answer could repeat an older profile. Clear old context
    // before letting an edited profile be sent, rather than silently retaining it.
    setProfile(text);
    setIncludeProfile(false);
    setProfilePreviouslySent(false);
    setTurns([]); setMeasurement(null);
  }
  async function connect() {
    if (busy.current || connecting) return;
    setConnecting(true); setError(''); setConnected(false); setModels([]);
    try {
      const endpoint = localOllamaUrl(origin);
      const installed = await discoverLocalModels(endpoint);
      if (unmounted.current) return;
      if (!installed.length) throw new Error('Ollama responded, but no models are installed.');
      setModels(installed); setModel(installed[0]); setConnected(true);
      setTurns([]); setMeasurement(null); setProfilePreviouslySent(false);
    } catch (e) {
      if (!unmounted.current) setError(e instanceof Error ? e.message : String(e));
    } finally { if (!unmounted.current) setConnecting(false); }
  }
  async function send() {
    if (busy.current || !connected || !models.includes(model) || !message.trim()) return;
    if (includeProfile && !profile.trim()) {
      setError('Add a profile before approving its inclusion.'); return;
    }
    const earlier = profilePreviouslySent && !includeProfile ? [] : turns;
    // Profile revocation cannot erase previous model knowledge, but it must
    // prevent assistant text that may repeat personal details from re-entering context.
    if (profilePreviouslySent && !includeProfile) setTurns([]);
    busy.current = true; setPending(true); setError(''); setMeasurement(null);
    try {
      const result = await sendPilotTurn({
        base: origin, model, turns: earlier, message, profile,
        approveProfile: includeProfile
      });
      if (!unmounted.current) {
        setTurns(result.nextTurns);
        setMeasurement(result.measurement);
        setProfilePreviouslySent(includeProfile);
        setIncludeProfile(false); // Renew consent if user wants profile next turn.
        setMessage('');
      }
    } catch (e) {
      if (!unmounted.current) setError(e instanceof Error ? e.message : String(e));
    } finally {
      busy.current = false;
      if (!unmounted.current) setPending(false);
    }
  }
  return <section className="pilot-sanctuary">
    <div className="section-header">
      <span className="eyebrow">GAIA / PRIVATE ALLY SANCTUARY v0.3.0</span>
      <h2>Get to know your Ally.</h2>
      <p>Try a real conversation with GAIA's TIEKAT reflection planner and a model on your own Ollama installation.
        Your personal pilot profile is optional, temporary, and shared only when you approve it for that individual request.</p>
    </div>
    <div className="two-columns">
      <section className="panel">
        <div className="lab-heading"><h3>01 / Connect to her local brain</h3><span className={'lab-pill ' + (connected ? 'pass' : 'neutral')}>{connected ? 'LOCAL MODEL FOUND' : 'OFFLINE UNTIL CONNECTED'}</span></div>
        <p className="muted">This page doesn't contact Ollama until you click Detect local models. No cloud model or public proxy is used.</p>
        <label htmlFor="pilot-origin">Ollama origin (this device only)</label>
        <input id="pilot-origin" value={origin} disabled={pending || connecting}
          onChange={(e) => { setOrigin(e.target.value);setConnected(false);setModels([]);setModel('');setTurns([]);setMeasurement(null);setProfilePreviouslySent(false); }} />
        <button className="primary" disabled={connecting || pending} onClick={() => void connect()}>
          {connecting ? 'Checking loopback…' : 'Detect local models'}</button>
        <label htmlFor="pilot-model">Select the model speaking</label>
        <select id="pilot-model" value={model} disabled={!connected || pending}
          onChange={(e) => { setModel(e.target.value);setTurns([]);setMeasurement(null);setProfilePreviouslySent(false); }}>
          {!models.length && <option value="">Connect Ollama first</option>}
          {models.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <p className="muted">For a more capable personal conversation, choose a model such as <strong>granite4.2:8b</strong> if installed. The model may make mistakes and should not invent personal facts, astrological calculations or clinical conclusions.</p>
        <div className="thin-rule"/>
        <h3>02 / Optional pilot background</h3>
        <p className="muted">Tell her only what you want her to know for this test. You can include a preferred name, interests and goals, or birth details if you want to discuss them. Avoid passwords, account numbers and details about other people. Birth-chart calculations belong in the separate Astrology chamber.</p>
        <label htmlFor="pilot-profile">My pilot profile (up to {PILOT_MAX_PROFILE} characters)</label>
        <textarea id="pilot-profile" rows={5} maxLength={PILOT_MAX_PROFILE}
          disabled={pending} value={profile} onChange={(e) => changeProfile(e.target.value)}
          placeholder="Example: Call me Wave. I'm building open-source creative tools and want to reflect on my next steps."/>
        <label className="switch"><input type="checkbox" checked={includeProfile}
          disabled={pending || !profile.trim()} onChange={(e) => setIncludeProfile(e.target.checked)} />
          Include the profile above in my <strong>next</strong> local model request only.</label>
        <p className="muted">Profile details are sent to Ollama on this device only when the checkbox is selected AND you press Send. Your profile is never saved to localStorage, IndexedDB, a JSON export or GitHub.</p>
        <button className="secondary" disabled={pending} onClick={clearPilot}>Clear pilot profile and entire conversation</button>
      </section>
      <section className="panel">
        <div className="lab-heading"><h3>03 / Talk with GAIA</h3><span className="lab-pill neutral">VOLATILE SESSION</span></div>
        <p className="muted">Chat is in this open tab only, with no automatic memory, genealogy, profile imports or tool access. Switching tabs closes this pilot session.</p>
        <div className="pilot-dialog" aria-live="polite">
          {!turns.length && <div className="pilot-intro"><strong>GAIA is ready when you are.</strong><p>Try asking her to reflect on a creative project or help you think through a decision. This is an actual local model conversation, not a scripted demo.</p></div>}
          {turns.map((turn, i) => <div key={i} className={'pilot-bubble ' + turn.role}>
            <strong>{turn.role === 'user' ? 'You' : 'GAIA · local model'}</strong>
            <p>{turn.content}</p>
          </div>)}
        </div>
        <form onSubmit={(e) => {e.preventDefault();void send();}}>
          <label htmlFor="pilot-question">Your next message</label>
          <textarea id="pilot-question" rows={4} value={message} maxLength={PILOT_MAX_MESSAGE}
            disabled={pending} onChange={(e) => setMessage(e.target.value)}
            placeholder="GAIA, I'm here to explore with you. What would you like to explore together?"/>
          <button className="primary" type="submit" disabled={!connected || pending || !message.trim() || !models.includes(model)}>
            {pending ? 'GAIA is responding…' : 'Send to GAIA on my local model'}</button>
        </form>
        {pending && <p className="muted" role="status">Your browser is waiting for Ollama. The current request cannot be cancelled from this pilot interface.</p>}
        {error && <p className="error" role="alert">{error}</p>}
        {measurement && <p className="muted micro">
          Real local reply · {compactNum(measurement.elapsedBrowserMs)} browser elapsed ·
          Profile attached to last request: {measurement.profileAttachedToThisRequest ? 'yes' : 'no'} ·
          No persistent memory or automatic evidence export.
        </p>}
        {profilePreviouslySent && !includeProfile && <p className="muted micro">
          Privacy boundary: because an earlier answer may mention your profile, the next send without renewed profile permission begins a fresh conversation. Clearing the session also removes all visible pilot history.
        </p>}
      </section>
    </div>
    <p className="muted">This pilot uses the existing TIEKAT/open-reflection plan and local Ollama response. It is not multiple autonomous agents, isn't backed by BrainC memory, and does not use experimental PocketBrain Tiny or PhiStream for this chat.
      For browser-native Tiny inference experiments, use the <a href="#brains">Brain Bridge</a>. To calculate an actual natal chart, use the <a href="#astrology">Astrology</a> chamber.</p>
  </section>;
}
