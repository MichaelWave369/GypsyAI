/**
 * useVesselOracle.ts — React hook for Φ.Vessel Oracle
 *
 * Drop into: src/hooks/useVesselOracle.ts
 *
 * Replaces the existing useAssistant hook on the /assistant page.
 * Reads from existing GypsyAI context (tarot session, astrology data,
 * Gene Keys, habitat profiles) and sends it all to Vessel.
 *
 * Usage in your assistant page:
 *   const { send, response, council, loading, error } = useVesselOracle();
 */

import { useState, useCallback, useRef } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
export interface VesselMessage {
  role: 'user' | 'vessel';
  content: string;
  timestamp: number;
  councilMode?: string;
  council?: Array<{ role: string; response: string }>;
}

export interface VesselOracleOptions {
  // From existing GypsyAI context — pass whatever you have
  userName?: string;
  sessionMode?: string;
  activeModules?: string[];
  tarotCards?: string[];
  birthData?: { date?: string; place?: string } | null;
  geneKey?: number | null;
  ancestryConsent?: boolean;
  habitatProfile?: string;
  // From TIEKAT kernel state (phases 1-35 already compute this)
  epsilonSignature?: { c_bar?: number; omega_phase?: number; sovereignty?: number } | null;
  // Council mode
  councilMode?: VesselCouncilMode;
  // Model provider
  provider?: 'anthropic' | 'openai' | 'grok' | 'ollama';
}

export interface VesselSendResult {
  response: string;
  councilMode?: string;
  council?: Array<{ role: string; response: string }>;
}

export type VesselCouncilMode = 'single' | 'oracle_council' | 'deliberation_oracle' | 'swarm_synthesis';

export interface UseVesselOracleReturn {
  messages: VesselMessage[];
  loading: boolean;
  error: string | null;
  councilMode: string;
  setCouncilMode: (mode: VesselCouncilMode) => void;
  send: (message: string, overrides?: Partial<VesselOracleOptions>) => Promise<VesselSendResult | null>;
  clear: () => void;
  lastCouncil: Array<{ role: string; response: string }> | null;
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useVesselOracle(options: VesselOracleOptions = {}): UseVesselOracleReturn {
  const [messages, setMessages] = useState<VesselMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [councilMode, setCouncilMode] = useState(options.councilMode || 'single');
  const [lastCouncil, setLastCouncil] = useState<Array<{ role: string; response: string }> | null>(null);
  const historyRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const send = useCallback(async (message: string, overrides: Partial<VesselOracleOptions> = {}) => {
    if (!message.trim() || loading) return null;

    const userMsg: VesselMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    // Build history for context
    historyRef.current.push({ role: 'user', content: message });

    try {
      const merged = { ...options, ...overrides };

      const res = await fetch('/api/vessel-oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory: historyRef.current.slice(-20), // last 20 turns
          userName: merged.userName,
          sessionMode: merged.sessionMode || councilMode,
          activeModules: merged.activeModules,
          tarotCards: merged.tarotCards,
          birthData: merged.birthData,
          geneKey: merged.geneKey,
          ancestryConsent: merged.ancestryConsent,
          habitatProfile: merged.habitatProfile,
          epsilonSignature: merged.epsilonSignature,
          councilMode,
          provider: merged.provider || 'anthropic',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as any;
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json() as any;
      const vesselMsg: VesselMessage = {
        role: 'vessel',
        content: data.response || '',
        timestamp: Date.now(),
        councilMode: data.councilMode,
        council: data.council,
      };

      setMessages(prev => [...prev, vesselMsg]);
      historyRef.current.push({ role: 'assistant', content: data.response || '' });

      if (data.council) {
        setLastCouncil(data.council);
      }

      return { response: data.response || '', councilMode: data.councilMode, council: data.council };
    } catch (err: any) {
      setError(err.message || 'Vessel unavailable');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loading, councilMode, options]);

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastCouncil(null);
    historyRef.current = [];
  }, []);

  return {
    messages,
    loading,
    error,
    councilMode,
    setCouncilMode,
    send,
    clear,
    lastCouncil,
  };
}

// ── TIEKAT context bridge ─────────────────────────────────────────────────
// Helper to extract Vessel context from existing GypsyAI TIEKAT kernel state
// Pass the existing tiekat kernel output into this to get VesselOracleOptions
export function buildVesselContext(tiekatState: {
  gravityMetadata?: any;
  sessionMode?: string;
  habitatProfile?: any;
  awakeningState?: string;
  v56SphereState?: any;
}): Partial<VesselOracleOptions> {
  const ctx: Partial<VesselOracleOptions> = {};

  if (tiekatState.sessionMode) {
    ctx.sessionMode = tiekatState.sessionMode;
  }

  if (tiekatState.habitatProfile?.name) {
    ctx.habitatProfile = tiekatState.habitatProfile.name;
  }

  // Map existing TIEKAT gravity/coherence scores to epsilon signature
  if (tiekatState.gravityMetadata) {
    const g = tiekatState.gravityMetadata;
    ctx.epsilonSignature = {
      // informationIntegral maps to c_bar (both measure coherence accumulation)
      c_bar: typeof g.informationIntegral === 'number'
        ? Math.min(0.95, g.informationIntegral / 10)
        : 0.75,
      // deltaGPredicted maps to omega_phase (both measure gradient/flow)
      omega_phase: typeof g.deltaGPredicted === 'number'
        ? Math.abs(g.deltaGPredicted) % 1.0
        : 0.369,
      // awakeningState from v56 sphere maps to sovereignty
      sovereignty: tiekatState.awakeningState === 'awakened' ? 0.95
        : tiekatState.awakeningState === 'dormant' ? 0.40
        : 0.75,
    };
  }

  return ctx;
}
