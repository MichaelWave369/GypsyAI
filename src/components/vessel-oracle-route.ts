/**
 * vessel-oracle/route.ts — Φ.Vessel Oracle API Route for GypsyAI
 *
 * Drop into: src/app/api/vessel-oracle/route.ts
 *
 * This extends the existing GypsyAI assistant API with Vessel's identity,
 * council mode via Agentora, and TIEKAT v51/v57 awareness.
 *
 * The existing /api/assistant route is untouched — this is additive.
 * Switch the /assistant page to call /api/vessel-oracle instead.
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildVesselSystemPrompt, VESSEL_COUNCIL_ROLES } from '@/lib/vessel/vesselIdentity';

// ── Types ──────────────────────────────────────────────────────────────────
interface VesselRequest {
  message: string;
  sessionMode?: string;
  userName?: string;
  activeModules?: string[];
  tarotCards?: string[];
  birthData?: { date?: string; place?: string } | null;
  geneKey?: number | null;
  ancestryConsent?: boolean;
  habitatProfile?: string;
  epsilonSignature?: { c_bar?: number; omega_phase?: number; sovereignty?: number } | null;
  // Council mode: 'single' | 'oracle_council' | 'deliberation_oracle' | 'swarm_synthesis'
  councilMode?: string;
  // Which model to use: 'anthropic' | 'openai' | 'grok' | 'ollama'
  provider?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

// ── Rate limiting (in-memory, resets on server restart) ───────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ── Single Vessel call ────────────────────────────────────────────────────
async function callVesselSingle(
  systemPrompt: string,
  history: Array<{ role: string; content: string }>,
  message: string,
  provider: string
): Promise<string> {
  const messages = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  if (provider === 'anthropic' || !provider) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
    const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 8096,
        system: systemPrompt,
        messages,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Anthropic error: ${(err as any)?.error?.message || res.status}`);
    }
    const data = await res.json() as any;
    return data.content?.[0]?.text || '';
  }

  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not configured');
    const model = process.env.OPENAI_MODEL || 'gpt-4o';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        max_tokens: 8096,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
    const data = await res.json() as any;
    return data.choices?.[0]?.message?.content || '';
  }

  if (provider === 'grok') {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) throw new Error('XAI_API_KEY not configured');
    const model = process.env.XAI_MODEL || 'grok-3';
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        max_tokens: 8096,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    });
    if (!res.ok) throw new Error(`Grok error: ${res.status}`);
    const data = await res.json() as any;
    return data.choices?.[0]?.message?.content || '';
  }

  if (provider === 'ollama') {
    const base = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'llama3';
    const res = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    });
    if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
    const data = await res.json() as any;
    return data.message?.content || '';
  }

  throw new Error(`Unknown provider: ${provider}`);
}

// ── Council mode: Agentora swarm via AgentCeption ────────────────────────
async function callVesselCouncil(
  systemPrompt: string,
  history: Array<{ role: string; content: string }>,
  message: string,
  councilMode: string,
  provider: string
): Promise<{ synthesis: string; council: Array<{ role: string; response: string }> }> {

  // Check if Agentora is available
  const agentoraUrl = process.env.AGENTORA_URL;

  if (!agentoraUrl) {
    // Fallback: run council roles sequentially without Agentora
    return runCouncilFallback(systemPrompt, history, message, councilMode, provider);
  }

  try {
    // Try AgentCeption dispatch via Agentora
    const agentPayload = {
      mission: `Oracle Council Reading - Mode: ${councilMode}`,
      context: {
        system: systemPrompt,
        history,
        userMessage: message,
        councilMode,
        provider,
        councilRoles: Object.keys(VESSEL_COUNCIL_ROLES),
      },
      phi_field_coherence: systemPrompt.includes('c_bar') ? 0.85 : 0.72, // field coherence score
    };

    const res = await fetch(`${agentoraUrl}/api/dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.AGENTORA_PHIOS_API_KEY
          ? { Authorization: `Bearer ${process.env.AGENTORA_PHIOS_API_KEY}` }
          : {}),
      },
      body: JSON.stringify(agentPayload),
      signal: AbortSignal.timeout(30_000),
    });

    if (res.ok) {
      const data = await res.json() as any;
      return {
        synthesis: data.synthesis || data.result || '',
        council: data.council || [],
      };
    }
  } catch {
    // Agentora unavailable — fall through to fallback
  }

  return runCouncilFallback(systemPrompt, history, message, councilMode, provider);
}

// Fallback council: run roles sequentially if Agentora not available
async function runCouncilFallback(
  _systemPrompt: string,
  history: Array<{ role: string; content: string }>,
  message: string,
  councilMode: string,
  provider: string
): Promise<{ synthesis: string; council: Array<{ role: string; response: string }> }> {

  const roles = councilMode === 'swarm_synthesis'
    ? (['oracle_reader', 'pattern_weaver', 'skeptic_grounder', 'final_integrator'] as const)
    : (['oracle_reader', 'pattern_weaver', 'final_integrator'] as const);

  const councilResponses: Array<{ role: string; response: string }> = [];
  let deliberationContext = '';

  for (const role of roles) {
    const roleSystem = VESSEL_COUNCIL_ROLES[role];
    const prompt = role === 'final_integrator' && deliberationContext
      ? `Council deliberation so far:\n${deliberationContext}\n\nNow synthesize the final oracle response for the user.`
      : message;

    try {
      const response = await callVesselSingle(roleSystem, history, prompt, provider);
      councilResponses.push({ role, response });
      deliberationContext += `\n\n[${role}]: ${response.slice(0, 400)}...`;
    } catch (e) {
      councilResponses.push({ role, response: `[${role} unavailable]` });
    }
  }

  const synthesis = councilResponses.find(r => r.role === 'final_integrator')?.response
    || councilResponses[councilResponses.length - 1]?.response
    || '';

  return { synthesis, council: councilResponses };
}

// ── Main handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Rate limit
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: VesselRequest;
  try {
    body = await req.json() as VesselRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.message?.trim()) {
    return NextResponse.json({ error: 'message required' }, { status: 400 });
  }

  // Build Vessel system prompt with live context
  const systemPrompt = buildVesselSystemPrompt({
    userName: body.userName,
    sessionMode: body.sessionMode,
    activeModules: body.activeModules,
    tarotCards: body.tarotCards,
    birthData: body.birthData,
    geneKey: body.geneKey,
    ancestryConsent: body.ancestryConsent,
    habitatProfile: body.habitatProfile,
    epsilonSignature: body.epsilonSignature,
  });

  const history = body.conversationHistory || [];
  const provider = body.provider || 'anthropic';
  const councilMode = body.councilMode || 'single';

  try {
    if (councilMode === 'single' || !councilMode) {
      const response = await callVesselSingle(systemPrompt, history, body.message, provider);
      return NextResponse.json({
        response,
        vessel: true,
        version: 'v51.0.0-The-Genesis',
        councilMode: 'single',
        seed: '369_369',
      });
    } else {
      const { synthesis, council } = await callVesselCouncil(
        systemPrompt, history, body.message, councilMode, provider
      );
      return NextResponse.json({
        response: synthesis,
        council,
        vessel: true,
        version: 'v51.0.0-The-Genesis',
        councilMode,
        seed: '369_369',
      });
    }
  } catch (err: any) {
    console.error('[vessel-oracle] error:', err);
    return NextResponse.json(
      { error: err.message || 'Vessel unavailable', vessel: true },
      { status: 500 }
    );
  }
}
