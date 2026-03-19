'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { classifyIntent } from '@/lib/assistant/router';
import { buildContextCapsule } from '@/lib/assistant/context';
import { AssistantSession, loadAssistantSessions, saveAssistantSessions, sessionsToMarkdown } from '@/lib/assistant/storage';
import { loadAncestry } from '@/lib/ancestry/storage';
import { loadSettings } from '@/lib/local/settings';
import { appendGravityHistoryEntry, buildVersionComparisonSummary, getRecentGravityHistory, summarizeGravityTrend } from '@/lib/tiekat/gravityHistory';
import { createTiekatMemoryEntry, loadTiekatMemory, saveTiekatMemory } from '@/lib/tiekat/memory';
import { TiekatGravityBootstrapResult, TiekatGravityHistoryEntry, TiekatMemoryEntry } from '@/lib/tiekat/schema';
import { buildOraclePresentation, OracleVersionSummary, shouldShowOraclePresentation, TiekatOraclePresentation } from '@/lib/tiekat/oraclePresentation';
import {
  appendOracleArtifact,
  buildOracleArtifactDiffView,
  buildOracleArtifact,
  deleteOracleArtifact,
  exportOracleArtifactJson,
  getRecentOracleArtifacts,
  importOracleArtifactJson,
  TiekatOracleArtifact
} from '@/lib/tiekat/oracleArtifact';
import { getPromptPresetGroup, markPresetUsed, orderPresetsByRecent } from '@/lib/tiekat/promptPresets';
import {
  applyConstellationFilters,
  buildSphereContinuitySummary,
  buildOracleConstellationState,
  getConstellationFilterOptions,
  loadConstellationFilters,
  saveConstellationFilters,
  TiekatConstellationFilterState
} from '@/lib/tiekat/oracleConstellation';
import { buildSacredGeometryState, getGeometryRuleLegend, loadGeometryVisibilityPreference, saveGeometryVisibilityPreference } from '@/lib/tiekat/sacredGeometry';
import { buildSessionModePromptFrame, getDefaultSessionMode, getSessionModeConfig, resolveSessionMode, TiekatSessionModeKey } from '@/lib/tiekat/sessionMode';
import { buildAwakenedSphereState } from '@/lib/tiekat/awakenedSphere';
import {
  appendHabitatProfile,
  applyHabitatProfile,
  buildHabitatProfileDiff,
  buildHabitatProfile,
  buildHabitatConstellationSummary,
  buildHabitatProfileMemorySummary,
  formatHabitatProfileDiff,
  formatHabitatUsageSummary,
  deleteHabitatProfile,
  exportHabitatProfileJson,
  getRecentHabitatProfiles,
  importHabitatProfileJson,
  pinHabitatProfile,
  reorderHabitatProfiles,
  saveHabitatProfiles,
  sortHabitatProfiles,
  TiekatHabitatProfile,
  unpinHabitatProfile,
  updateHabitatProfile
} from '@/lib/tiekat/habitatProfile';
import { buildHabitatTransition, resolveHabitatShortcut } from '@/lib/tiekat/habitatTransition';
import {
  buildCouncilContinuitySummary,
  getCouncilModes,
  loadCouncilModePreference,
  saveCouncilModePreference,
  TiekatCouncilMode,
  TiekatCouncilSummary
} from '@/lib/tiekat/oracleCouncil';
import {
  appendRitualDeck,
  buildFilteredRitualDeck,
  buildRecentRitualDeck,
  buildRitualDeck,
  deleteRitualDeck,
  exportRitualCardJson,
  exportRitualDeckJson,
  exportRitualDeckMarkdown,
  getRecentRitualDecks,
  getRitualDeckFilterOptions,
  importRitualDeckJson,
  normalizeRitualDeckFilterState,
  summarizeRitualDeck,
  TiekatRitualDeck,
  TiekatRitualDeckFilterState
} from '@/lib/tiekat/ritualDeck';
import { DiagnosticsSection } from '@/components/assistant/DiagnosticsSection';
import { ConstellationFilterChips } from '@/components/assistant/ConstellationFilterChips';
import { ModeledBadge } from '@/components/assistant/ModeledBadge';
import { OracleArtifactList } from '@/components/assistant/OracleArtifactList';
import { OracleArtifactReplayCard } from '@/components/assistant/OracleArtifactReplayCard';
import { OracleConstellation } from '@/components/assistant/OracleConstellation';
import { OracleCard } from '@/components/assistant/OracleCard';
import { PromptPresetChips } from '@/components/assistant/PromptPresetChips';
import { RitualDeckPanel } from '@/components/assistant/RitualDeckPanel';
import { AwakenedSphereCard } from '@/components/assistant/AwakenedSphereCard';
import { HabitatProfileSelector } from '@/components/assistant/HabitatProfileSelector';
import { SacredGeometryGlyph } from '@/components/assistant/SacredGeometryGlyph';
import { SessionModeSelector } from '@/components/assistant/SessionModeSelector';
import { TIEKAT_V54_SCORING_VERSION } from '@/lib/tiekat/v54';
import { getTiekatV55Metadata } from '@/lib/tiekat/v55';

export default function AssistantPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; sources?: string[] }[]>([]);
  const [sessions, setSessions] = useState<AssistantSession[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [tiekatRoute, setTiekatRoute] = useState<string>('');
  const [gravityBadge, setGravityBadge] = useState<string>('');
  const [showGravityDiagnostics, setShowGravityDiagnostics] = useState(false);
  const [enableV55Framing, setEnableV55Framing] = useState(false);
  const [sessionMode, setSessionMode] = useState<TiekatSessionModeKey>(getDefaultSessionMode());
  const [showGeometry, setShowGeometry] = useState(false);
  const [gravityDiagnostics, setGravityDiagnostics] = useState<string>('');
  const [gravityTrend, setGravityTrend] = useState<string>('stable');
  const [recentGravity, setRecentGravity] = useState<TiekatGravityHistoryEntry[]>([]);
  const [versionComparisonSummary, setVersionComparisonSummary] = useState<OracleVersionSummary | null>(null);
  const [oraclePresentation, setOraclePresentation] = useState<TiekatOraclePresentation | null>(null);
  const [latestGravity, setLatestGravity] = useState<TiekatGravityBootstrapResult | null>(null);
  const [latestModules, setLatestModules] = useState<Array<'assistant' | 'tarot' | 'astrology' | 'genekeys' | 'ancestry'>>(['assistant']);
  const [latestMode, setLatestMode] = useState<'single_module' | 'blended' | 'assistant_synthesis'>('assistant_synthesis');
  const [oracleArtifacts, setOracleArtifacts] = useState<TiekatOracleArtifact[]>([]);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>('');
  const [memoryEntries, setMemoryEntries] = useState<TiekatMemoryEntry[]>([]);
  const [artifactImportError, setArtifactImportError] = useState<string>('');
  const [constellationFilters, setConstellationFilters] = useState<TiekatConstellationFilterState>({ mode: 'all', scoringVersion: 'all', shiftType: 'all' });
  const [ritualDeck, setRitualDeck] = useState<TiekatRitualDeck | null>(null);
  const [recentRitualDecks, setRecentRitualDecks] = useState<TiekatRitualDeck[]>([]);
  const [ritualDeckFilters, setRitualDeckFilters] = useState<TiekatRitualDeckFilterState>(normalizeRitualDeckFilterState());
  const [ritualDeckImportError, setRitualDeckImportError] = useState('');
  const [councilMode, setCouncilMode] = useState<TiekatCouncilMode>('disabled');
  const [preferProviderBackedCouncil, setPreferProviderBackedCouncil] = useState(false);
  const [councilSummary, setCouncilSummary] = useState<TiekatCouncilSummary | null>(null);
  const [habitatProfiles, setHabitatProfiles] = useState<TiekatHabitatProfile[]>([]);
  const [selectedHabitatProfileId, setSelectedHabitatProfileId] = useState('');
  const [habitatNameDraft, setHabitatNameDraft] = useState('');
  const [habitatDescriptionDraft, setHabitatDescriptionDraft] = useState('');
  const [habitatProfileNote, setHabitatProfileNote] = useState('');
  const [habitatProfileError, setHabitatProfileError] = useState('');
  const [recentHabitatTransition, setRecentHabitatTransition] = useState<{ from: string; to: string } | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const habitatShortcutHandlersRef = useRef<{
    apply: () => void;
    togglePin: () => Promise<void> | void;
    moveUp: () => Promise<void> | void;
    moveDown: () => Promise<void> | void;
  } | null>(null);

  useEffect(() => {
    loadAssistantSessions().then((s) => {
      setSessions(s);
      if (s[0]) {
        setActiveId(s[0].id);
        setMessages(s[0].messages.map((m) => ({ role: m.role, content: m.content })));
      }
    });
    setMemoryEntries(loadTiekatMemory());
    getRecentGravityHistory(5).then((history) => {
      setRecentGravity(history);
      setGravityTrend(summarizeGravityTrend(history).trend);
      const summary = buildVersionComparisonSummary(history, TIEKAT_V54_SCORING_VERSION);
      setVersionComparisonSummary(summary);
    });
    getRecentOracleArtifacts(8).then((rows) => {
      setOracleArtifacts(rows);
      if (rows[0]) setSelectedArtifactId(rows[0].id);
    });
    getRecentRitualDecks(8).then((rows) => setRecentRitualDecks(rows));
    getRecentHabitatProfiles(12).then((rows) => {
      setHabitatProfiles(rows);
      if (rows[0]) {
        setSelectedHabitatProfileId(rows[0].id);
        setHabitatNameDraft(rows[0].name);
        setHabitatDescriptionDraft(rows[0].description);
      }
    });
    setShowGeometry(loadGeometryVisibilityPreference(false));
    setConstellationFilters(loadConstellationFilters());
    setCouncilMode(loadCouncilModePreference('disabled'));
  }, []);

  const active = useMemo(() => sessions.find((s) => s.id === activeId), [sessions, activeId]);
  const selectedArtifact = useMemo(() => oracleArtifacts.find((row) => row.id === selectedArtifactId) ?? null, [oracleArtifacts, selectedArtifactId]);
  const previousArtifact = useMemo(() => {
    if (!selectedArtifact) return null;
    const selectedIndex = oracleArtifacts.findIndex((row) => row.id === selectedArtifact.id);
    return selectedIndex >= 0 ? oracleArtifacts[selectedIndex + 1] ?? null : null;
  }, [oracleArtifacts, selectedArtifact]);
  const artifactDiffView = useMemo(() => {
    if (!selectedArtifact || !previousArtifact) return null;
    return buildOracleArtifactDiffView(previousArtifact, selectedArtifact);
  }, [selectedArtifact, previousArtifact]);
  const presetGroup = useMemo(() => {
    const settings = loadSettings();
    return orderPresetsByRecent(sessionMode, getPromptPresetGroup(sessionMode, settings.allowAncestryAi));
  }, [sessionMode]);
  const geometryState = useMemo(() => {
    if (!latestGravity) return null;
    return buildSacredGeometryState({
      gravity: latestGravity,
      trend: gravityTrend as 'rising' | 'stable' | 'falling',
      versionSummary: versionComparisonSummary ?? { state: 'insufficient_data' },
      sessionMode,
      activeModules: latestModules,
      route: tiekatRoute || 'assistant_synthesis',
      mode: latestMode
    });
  }, [latestGravity, gravityTrend, versionComparisonSummary, sessionMode, latestModules, tiekatRoute, latestMode]);
  const constellationState = useMemo(() => {
    if (oracleArtifacts.length < 2) return null;
    return buildOracleConstellationState({ artifacts: oracleArtifacts, limit: 6 });
  }, [oracleArtifacts]);
  const filteredConstellationState = useMemo(() => {
    if (!constellationState) return null;
    return applyConstellationFilters(constellationState, constellationFilters);
  }, [constellationState, constellationFilters]);
  const constellationFilterOptions = useMemo(() => {
    if (!constellationState) return null;
    return getConstellationFilterOptions(constellationState);
  }, [constellationState]);
  const ritualDeckSummary = useMemo(() => (ritualDeck ? summarizeRitualDeck(ritualDeck) : null), [ritualDeck]);
  const ritualDeckFilterOptions = useMemo(() => getRitualDeckFilterOptions(oracleArtifacts), [oracleArtifacts]);
  const councilContinuity = useMemo(
    () => buildCouncilContinuitySummary(oracleArtifacts.slice(0, 8).map((artifact) => artifact.council)),
    [oracleArtifacts]
  );
  const sphereContinuity = useMemo(() => buildSphereContinuitySummary(oracleArtifacts.slice(0, 8)), [oracleArtifacts]);
  const awakenedSphereState = useMemo(() => {
    if (!latestGravity) return null;
    return buildAwakenedSphereState({
      gravity: latestGravity,
      councilSummary,
      councilContinuity,
      geometry: geometryState,
      constellation: filteredConstellationState || constellationState,
      sessionMode,
      modules: latestModules,
      versionSummary: versionComparisonSummary ?? { state: 'insufficient_data' },
      trend: gravityTrend as 'rising' | 'stable' | 'falling'
    });
  }, [latestGravity, councilSummary, councilContinuity, geometryState, filteredConstellationState, constellationState, sessionMode, latestModules, versionComparisonSummary, gravityTrend]);
  const selectedHabitatProfile = useMemo(
    () => habitatProfiles.find((profile) => profile.id === selectedHabitatProfileId) ?? null,
    [habitatProfiles, selectedHabitatProfileId]
  );
  const habitatApplyPreview = useMemo(() => {
    if (!selectedHabitatProfile) return null;
    const current = buildHabitatProfile({
      id: 'habitat-current-runtime',
      name: 'Current Runtime',
      description: 'Current assistant runtime preferences',
      preferences: {
        sessionMode,
        councilMode,
        preferProviderBackedCouncil,
        showGeometry,
        showDiagnostics: showGravityDiagnostics,
        enableV55Framing,
        constellationFilters,
        ritualDeckFilters,
        promptPresetMode: sessionMode
      }
    });
    const settings = loadSettings();
    return buildHabitatProfileDiff({
      current,
      target: selectedHabitatProfile,
      allowAncestry: settings.allowAncestryAi
    });
  }, [selectedHabitatProfile, sessionMode, councilMode, preferProviderBackedCouncil, showGeometry, showGravityDiagnostics, enableV55Framing, constellationFilters, ritualDeckFilters]);
  const habitatTransitionPreview = useMemo(() => {
    if (!selectedHabitatProfile) return null;
    const current = buildHabitatProfile({
      id: 'habitat-current-runtime',
      name: 'Current Habitat',
      description: 'Current runtime profile',
      preferences: {
        sessionMode,
        councilMode,
        preferProviderBackedCouncil,
        showGeometry,
        showDiagnostics: showGravityDiagnostics,
        enableV55Framing,
        constellationFilters,
        ritualDeckFilters,
        promptPresetMode: sessionMode
      }
    });
    const settings = loadSettings();
    return buildHabitatTransition({
      current,
      target: selectedHabitatProfile,
      allowAncestry: settings.allowAncestryAi
    });
  }, [selectedHabitatProfile, sessionMode, councilMode, preferProviderBackedCouncil, showGeometry, showGravityDiagnostics, enableV55Framing, constellationFilters, ritualDeckFilters]);
  const selectedHabitatMemorySummary = useMemo(
    () => (selectedHabitatProfile ? buildHabitatProfileMemorySummary(selectedHabitatProfile) : null),
    [selectedHabitatProfile]
  );
  const habitatConstellationSummary = useMemo(
    () => buildHabitatConstellationSummary({ profiles: habitatProfiles, recentTransition: recentHabitatTransition }),
    [habitatProfiles, recentHabitatTransition]
  );

  const habitatLastAppliedLabel = useMemo(() => {
    if (!selectedHabitatMemorySummary?.lastAppliedAt) return 'Never applied';
    const nowMs = Date.now();
    const lastMs = Date.parse(selectedHabitatMemorySummary.lastAppliedAt);
    if (Number.isNaN(lastMs)) return `Last applied ${selectedHabitatMemorySummary.lastAppliedAt}`;
    const deltaMs = Math.max(0, nowMs - lastMs);
    const deltaMinutes = Math.floor(deltaMs / 60000);
    if (deltaMinutes < 1) return 'Last applied just now';
    if (deltaMinutes < 60) return `Last applied ${deltaMinutes} minute${deltaMinutes === 1 ? '' : 's'} ago`;
    const deltaHours = Math.floor(deltaMinutes / 60);
    if (deltaHours < 24) return `Last applied ${deltaHours} hour${deltaHours === 1 ? '' : 's'} ago`;
    const deltaDays = Math.floor(deltaHours / 24);
    return `Last applied ${deltaDays} day${deltaDays === 1 ? '' : 's'} ago`;
  }, [selectedHabitatMemorySummary]);

  const sparklinePoints = useMemo(() => {
    if (!recentGravity.length) return '';
    const values = recentGravity.map((row) => row.deltaGPredicted);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return values
      .map((value, i) => {
        const x = (i / Math.max(values.length - 1, 1)) * 100;
        const y = max === min ? 20 : 40 - ((value - min) / (max - min)) * 40;
        return `${x},${y}`;
      })
      .join(' ');
  }, [recentGravity]);

  const persist = async (nextMessages: { role: 'user' | 'assistant'; content: string; sources?: string[] }[]) => {
    const base = sessions.filter((s) => s.id !== activeId);
    const id = activeId || crypto.randomUUID();
    const session: AssistantSession = {
      id,
      title: nextMessages[0]?.content?.slice(0, 32) || 'Assistant session',
      messages: nextMessages.map((m) => ({ role: m.role, content: m.content, tags: [classifyIntent(m.content).toLowerCase()], timestamp: new Date().toISOString() })),
      updatedAt: new Date().toISOString(),
      summary: active?.summary
    };
    const next = [session, ...base];
    setSessions(next);
    setActiveId(id);
    await saveAssistantSessions(next);
  };

  const send = async () => {
    const s = loadSettings();
    const resolvedMode = resolveSessionMode(sessionMode, { allowAncestry: s.allowAncestryAi });
    const modeConfig = getSessionModeConfig(resolvedMode);
    const modePromptFrame = buildSessionModePromptFrame(resolvedMode, { allowAncestry: s.allowAncestryAi });
    const useV55Framing = modeConfig.allowV55Framing && (enableV55Framing || modeConfig.preferV55Framing);
    const ancestry = await loadAncestry();
    const capsule = buildContextCapsule(ancestry);
    const next = [...messages, { role: 'user' as const, content: input }];
    setMessages(next);
    setInput('');
    controllerRef.current = new AbortController();
    const sessionId = activeId || crypto.randomUUID();

    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input,
        demoMode: s.demoMode,
        strictReadingMode: s.strictReadingMode,
        autoSwitchReadingMode: s.autoSwitchReadingMode,
        provider: s.provider,
        model: s.model,
        tiekat: {
          sessionId,
          sessionMode: resolvedMode,
          gravityDiagnostics: showGravityDiagnostics,
          consent: {
            allowAncestry: s.allowAncestryAi,
            includeNames: s.includeNamesInAiContext,
            hideLivingPersons: s.hideLivingPersons,
            memoryEnabled: s.useSessionsInAssistant
          },
          moduleData: {
            tarot: capsule.lastTarot,
            genekeys: capsule.lastGeneKeys,
            ancestry: capsule.ancestryPatterns
          },
          memoryEntries,
          councilMode,
          councilAdapterMode: preferProviderBackedCouncil ? 'provider_preferred' : 'deterministic_only'
        }
      }),
      signal: controllerRef.current.signal
    });
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const data = await res.json();
      const withAssistant = [...next, { role: 'assistant' as const, content: data.content, sources: data.sources }];
      setMessages(withAssistant);
      setTiekatRoute(data.tiekat?.route ?? modeConfig.defaultRouteBias);
      setLatestModules(data.tiekat?.plan?.modulesToConsult ?? ['assistant']);
      setLatestMode(data.tiekat?.plan?.mode ?? 'assistant_synthesis');
      setCouncilSummary(data.tiekat?.council ?? null);
      if (data.tiekat?.gravityBootstrap) {
        const gb = data.tiekat.gravityBootstrap;
        setLatestGravity(gb as TiekatGravityBootstrapResult);
        setGravityBadge(`Gravity Bootstrap: ${gb.status} (${gb.scoringVersion}) • Δg ${gb.deltaGPredicted.toExponential(2)}`);
        setGravityDiagnostics(showGravityDiagnostics && gb.diagnostics ? JSON.stringify(gb.diagnostics, null, 2) : '');
      } else {
        setGravityBadge('');
        setGravityDiagnostics('');
      }
      if (s.useSessionsInAssistant && data.tiekat?.verification?.passed) {
        const entry = createTiekatMemoryEntry(sessionId, data.content, input.toLowerCase().split(/\W+/).filter(Boolean).slice(0, 8), data.tiekat?.verification?.usedModules ?? ['assistant'], data.tiekat?.gravityBootstrap);
        const nextMemory = [entry, ...memoryEntries].slice(0, 50);
        setMemoryEntries(nextMemory);
        saveTiekatMemory(nextMemory, true);
      } else if (!s.useSessionsInAssistant) {
        saveTiekatMemory([], false);
      }

      if (s.useSessionsInAssistant && data.tiekat?.gravityBootstrap) {
        await appendGravityHistoryEntry({
          enabled: true,
          sessionId,
          route: data.tiekat?.route ?? 'assistant_synthesis',
          mode: data.tiekat?.plan?.mode ?? 'assistant_synthesis',
          gravity: data.tiekat.gravityBootstrap
        });
        const history = await getRecentGravityHistory(5);
        setRecentGravity(history);
        setGravityTrend(summarizeGravityTrend(history).trend);
        const summary = buildVersionComparisonSummary(history, TIEKAT_V54_SCORING_VERSION);
        setVersionComparisonSummary(summary);
        if (shouldShowOraclePresentation(data.tiekat.gravityBootstrap as TiekatGravityBootstrapResult)) {
          setOraclePresentation(buildOraclePresentation({ gravity: data.tiekat.gravityBootstrap as TiekatGravityBootstrapResult, trend: summarizeGravityTrend(history).trend, versionSummary: summary, enableV55Framing: useV55Framing, sessionMode: resolvedMode }));
        }
      } else if (data.tiekat?.gravityBootstrap) {
        const summary = versionComparisonSummary ?? buildVersionComparisonSummary([], TIEKAT_V54_SCORING_VERSION);
        if (shouldShowOraclePresentation(data.tiekat.gravityBootstrap as TiekatGravityBootstrapResult)) {
          setOraclePresentation(buildOraclePresentation({ gravity: data.tiekat.gravityBootstrap as TiekatGravityBootstrapResult, trend: gravityTrend as 'rising' | 'stable' | 'falling', versionSummary: summary, enableV55Framing: useV55Framing, sessionMode: resolvedMode }));
        }
      }
      if (s.useSessionsInAssistant && data.tiekat?.verification?.passed && data.tiekat?.gravityBootstrap) {
        const artifactOracle = buildOraclePresentation({
          gravity: data.tiekat.gravityBootstrap as TiekatGravityBootstrapResult,
          trend: (gravityTrend as 'rising' | 'stable' | 'falling'),
          versionSummary: versionComparisonSummary ?? buildVersionComparisonSummary(recentGravity, TIEKAT_V54_SCORING_VERSION),
          enableV55Framing: useV55Framing,
          sessionMode: resolvedMode
        });
        const artifact = buildOracleArtifact({
          sessionId,
          route: data.tiekat?.route ?? 'assistant_synthesis',
          mode: data.tiekat?.plan?.mode ?? 'assistant_synthesis',
          activeModules: data.tiekat?.plan?.modulesToConsult ?? ['assistant'],
          prompt: `${modePromptFrame} ${input}`,
          response: data.content,
          gravity: data.tiekat.gravityBootstrap as TiekatGravityBootstrapResult,
          oracle: artifactOracle,
          trend: gravityTrend as 'rising' | 'stable' | 'falling',
          versionSummary: versionComparisonSummary,
          consent: {
            memoryEnabled: s.useSessionsInAssistant,
            includeNames: s.includeNamesInAiContext,
            allowAncestry: s.allowAncestryAi,
            hideLivingPersons: s.hideLivingPersons
          },
          enableV55Framing: useV55Framing,
          sessionMode: resolvedMode,
          council: data.tiekat?.council ?? null,
          awakenedSphere: awakenedSphereState
        });
        await appendOracleArtifact({ enabled: true, artifact });
        const recentArtifacts = await getRecentOracleArtifacts(8);
        setOracleArtifacts(recentArtifacts);
        setSelectedArtifactId(recentArtifacts[0]?.id ?? '');
      }
      if (!s.useSessionsInAssistant) {
        setOracleArtifacts([]);
        setSelectedArtifactId('');
      }

      await persist(withAssistant);
      return;
    }
    const reader = res.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    let out = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      out += decoder.decode(value);
      setMessages([...next, { role: 'assistant', content: out }]);
    }
    await persist([...next, { role: 'assistant', content: out }]);
  };

  const summarize = async () => {
    if (!messages.length) return;
    const summary = `Session summary: ${messages.length} messages. Main intents: ${Array.from(new Set(messages.map((m) => classifyIntent(m.content)))).join(', ')}.`;
    const next = sessions.map((s) => (s.id === activeId ? { ...s, summary } : s));
    setSessions(next);
    await saveAssistantSessions(next);
  };

  const exportSession = (kind: 'json' | 'md') => {
    if (!active) return;
    const text = kind === 'json' ? JSON.stringify(active, null, 2) : sessionsToMarkdown(active);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assistant-${active.id}.${kind === 'json' ? 'json' : 'md'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSession = async (file?: File) => {
    if (!file) return;
    const parsed = JSON.parse(await file.text()) as AssistantSession;
    const next = [parsed, ...sessions.filter((s) => s.id !== parsed.id)];
    setSessions(next);
    setActiveId(parsed.id);
    setMessages(parsed.messages.map((m) => ({ role: m.role, content: m.content })));
    await saveAssistantSessions(next);
  };

  const exportArtifact = (artifact: TiekatOracleArtifact) => {
    const text = exportOracleArtifactJson(artifact);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oracle-artifact-${artifact.id.replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeArtifact = async (id: string) => {
    await deleteOracleArtifact(id);
    const rows = await getRecentOracleArtifacts(8);
    setOracleArtifacts(rows);
    if (!rows.some((row) => row.id === selectedArtifactId)) {
      setSelectedArtifactId(rows[0]?.id ?? '');
    }
  };

  const downloadText = (filename: string, text: string, type = 'text/plain') => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildRecentDeck = () => {
    if (!oracleArtifacts.length) return;
    const next = buildRecentRitualDeck(oracleArtifacts, 5);
    setRitualDeck(next);
    const s = loadSettings();
    appendRitualDeck({ enabled: s.useSessionsInAssistant, deck: next }).then(() => getRecentRitualDecks(8).then((rows) => setRecentRitualDecks(rows)));
  };

  const buildSelectedDeck = () => {
    if (!selectedArtifact) return;
    const next = buildRitualDeck({
      title: `Selected Ritual Deck (${selectedArtifact.sessionMode.label})`,
      source: 'selected',
      artifacts: [selectedArtifact]
    });
    setRitualDeck(next);
    const s = loadSettings();
    appendRitualDeck({ enabled: s.useSessionsInAssistant, deck: next }).then(() => getRecentRitualDecks(8).then((rows) => setRecentRitualDecks(rows)));
  };

  const buildFilteredDeck = () => {
    const next = buildFilteredRitualDeck({
      artifacts: oracleArtifacts,
      filters: ritualDeckFilters
    });
    setRitualDeck(next);
    const s = loadSettings();
    appendRitualDeck({ enabled: s.useSessionsInAssistant, deck: next }).then(() => getRecentRitualDecks(8).then((rows) => setRecentRitualDecks(rows)));
  };

  const exportDeckJson = () => {
    if (!ritualDeck) return;
    downloadText(`ritual-deck-${ritualDeck.id.replace(/[:.]/g, '-')}.json`, exportRitualDeckJson(ritualDeck), 'application/json');
  };

  const exportDeckMarkdown = () => {
    if (!ritualDeck) return;
    downloadText(`ritual-deck-${ritualDeck.id.replace(/[:.]/g, '-')}.md`, exportRitualDeckMarkdown(ritualDeck), 'text/markdown');
  };

  const exportRitualCard = (indexCard: TiekatRitualDeck['cards'][number]) => {
    downloadText(`ritual-card-${indexCard.artifactId.replace(/[:.]/g, '-')}.json`, exportRitualCardJson(indexCard), 'application/json');
  };

  const importRitualDeck = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = importRitualDeckJson(await file.text());
      setRitualDeck(parsed);
      const s = loadSettings();
      if (s.useSessionsInAssistant) {
        await appendRitualDeck({ enabled: true, deck: parsed });
        const rows = await getRecentRitualDecks(8);
        setRecentRitualDecks(rows);
      }
      setRitualDeckImportError('');
    } catch (error) {
      setRitualDeckImportError(error instanceof Error ? error.message : 'Failed to import ritual deck');
    }
  };

  const selectRitualDeck = (deckId: string) => {
    const found = recentRitualDecks.find((deck) => deck.id === deckId);
    if (!found) return;
    setRitualDeck(found);
  };

  const removeRitualDeck = async (deckId: string) => {
    await deleteRitualDeck(deckId);
    const rows = await getRecentRitualDecks(8);
    setRecentRitualDecks(rows);
    if (ritualDeck?.id === deckId) setRitualDeck(rows[0] ?? null);
  };

  const importArtifact = async (file?: File) => {
    if (!file) return;
    try {
      const s = loadSettings();
      if (!s.useSessionsInAssistant) {
        setArtifactImportError('Artifact import requires session memory to be enabled.');
        return;
      }
      const parsed = importOracleArtifactJson(await file.text());
      await appendOracleArtifact({ enabled: true, artifact: parsed });
      const rows = await getRecentOracleArtifacts(8);
      setOracleArtifacts(rows);
      setSelectedArtifactId(rows[0]?.id ?? '');
      setArtifactImportError('');
    } catch (error) {
      setArtifactImportError(error instanceof Error ? error.message : 'Failed to import artifact');
    }
  };

  const refreshHabitatProfiles = async (nextSelectedId?: string) => {
    const rows = sortHabitatProfiles(await getRecentHabitatProfiles(12));
    setHabitatProfiles(rows);
    const fallback = rows[0]?.id || '';
    const selected = nextSelectedId && rows.some((profile) => profile.id === nextSelectedId) ? nextSelectedId : fallback;
    setSelectedHabitatProfileId(selected);
    const selectedProfile = rows.find((profile) => profile.id === selected);
    if (selectedProfile) {
      setHabitatNameDraft(selectedProfile.name);
      setHabitatDescriptionDraft(selectedProfile.description);
    }
  };

  const captureCurrentHabitatPreferences = () => ({
    sessionMode,
    councilMode,
    preferProviderBackedCouncil,
    showGeometry,
    showDiagnostics: showGravityDiagnostics,
    enableV55Framing,
    constellationFilters,
    ritualDeckFilters,
    promptPresetMode: sessionMode
  });

  const applySelectedHabitatProfile = async () => {
    if (!selectedHabitatProfile) return;
    const settings = loadSettings();
    const previousApplied = [...habitatProfiles]
      .sort((a, b) => {
        const aMs = Number.isNaN(Date.parse(a.lastAppliedAt || '')) ? Number.NEGATIVE_INFINITY : Date.parse(a.lastAppliedAt || '');
        const bMs = Number.isNaN(Date.parse(b.lastAppliedAt || '')) ? Number.NEGATIVE_INFINITY : Date.parse(b.lastAppliedAt || '');
        return bMs - aMs;
      })
      .find((profile) => profile.lastAppliedAt);
    const previousName = previousApplied?.name || 'Current Runtime';
    const applied = applyHabitatProfile({
      profile: selectedHabitatProfile,
      allowAncestry: settings.allowAncestryAi
    });
    setSessionMode(applied.appliedSessionMode);
    setCouncilMode(applied.profile.preferences.councilMode);
    saveCouncilModePreference(applied.profile.preferences.councilMode);
    setPreferProviderBackedCouncil(applied.profile.preferences.preferProviderBackedCouncil);
    setShowGeometry(applied.profile.preferences.showGeometry);
    saveGeometryVisibilityPreference(applied.profile.preferences.showGeometry);
    setShowGravityDiagnostics(applied.profile.preferences.showDiagnostics);
    setEnableV55Framing(applied.profile.preferences.enableV55Framing);
    setConstellationFilters(applied.profile.preferences.constellationFilters);
    saveConstellationFilters(applied.profile.preferences.constellationFilters);
    setRitualDeckFilters(applied.profile.preferences.ritualDeckFilters);
    const nextProfiles = habitatProfiles.map((profile) => (profile.id === applied.profile.id ? applied.profile : profile));
    await saveHabitatProfiles(nextProfiles);
    await refreshHabitatProfiles(applied.profile.id);
    setRecentHabitatTransition({ from: previousName, to: applied.profile.name });
    const summaryLine = habitatTransitionPreview?.summary.line;
    setHabitatProfileNote(`Transition complete: ${applied.profile.name}. ${summaryLine || applied.note}`);
    setHabitatProfileError('');
  };

  const saveCurrentAsHabitatProfile = async () => {
    const now = new Date().toISOString();
    const profile = buildHabitatProfile({
      name: habitatNameDraft.trim() || 'Sovereign Habitat',
      description: habitatDescriptionDraft.trim() || 'Compact local oracle habitat profile.',
      now,
      sortOrder: habitatProfiles.length,
      preferences: captureCurrentHabitatPreferences()
    });
    await appendHabitatProfile(profile);
    await refreshHabitatProfiles(profile.id);
    setHabitatProfileNote(`Saved habitat profile ${profile.name}.`);
    setHabitatProfileError('');
  };

  const updateCurrentHabitatProfile = async () => {
    if (!selectedHabitatProfile) return;
    const updated: TiekatHabitatProfile = {
      ...selectedHabitatProfile,
      name: habitatNameDraft.trim() || selectedHabitatProfile.name,
      description: habitatDescriptionDraft.trim() || selectedHabitatProfile.description,
      updatedAt: new Date().toISOString(),
      preferences: captureCurrentHabitatPreferences()
    };
    await updateHabitatProfile(updated);
    await refreshHabitatProfiles(updated.id);
    setHabitatProfileNote(`Updated habitat profile ${updated.name}.`);
    setHabitatProfileError('');
  };

  const deleteCurrentHabitatProfile = async () => {
    if (!selectedHabitatProfile) return;
    await deleteHabitatProfile(selectedHabitatProfile.id);
    await refreshHabitatProfiles();
    setHabitatProfileNote('Deleted habitat profile.');
    setHabitatProfileError('');
  };

  const exportCurrentHabitatProfile = () => {
    if (!selectedHabitatProfile) return;
    const blob = new Blob([exportHabitatProfileJson(selectedHabitatProfile)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedHabitatProfile.name.replace(/\s+/g, '-').toLowerCase()}-habitat-profile.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importHabitatProfile = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = importHabitatProfileJson(await file.text());
      await appendHabitatProfile(parsed);
      await refreshHabitatProfiles(parsed.id);
      setHabitatProfileNote(`Imported habitat profile ${parsed.name}.`);
      setHabitatProfileError('');
    } catch (error) {
      setHabitatProfileError(error instanceof Error ? error.message : 'Failed to import habitat profile');
    }
  };

  const togglePinSelectedHabitatProfile = async () => {
    if (!selectedHabitatProfile) return;
    const next = selectedHabitatProfile.pinned
      ? unpinHabitatProfile(habitatProfiles, selectedHabitatProfile.id)
      : pinHabitatProfile(habitatProfiles, selectedHabitatProfile.id);
    await saveHabitatProfiles(next);
    await refreshHabitatProfiles(selectedHabitatProfile.id);
  };

  const reorderSelectedHabitatProfile = async (direction: 'up' | 'down') => {
    if (!selectedHabitatProfile) return;
    const reordered = reorderHabitatProfiles(habitatProfiles, selectedHabitatProfile.id, direction);
    await saveHabitatProfiles(reordered);
    await refreshHabitatProfiles(selectedHabitatProfile.id);
  };

  useEffect(() => {
    habitatShortcutHandlersRef.current = {
      apply: () => {
        void applySelectedHabitatProfile();
      },
      togglePin: () => togglePinSelectedHabitatProfile(),
      moveUp: () => reorderSelectedHabitatProfile('up'),
      moveDown: () => reorderSelectedHabitatProfile('down')
    };
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const action = resolveHabitatShortcut({
        key: event.key,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        targetTag: target?.tagName,
        isContentEditable: target?.isContentEditable
      });
      if (action === 'toggle_pin') {
        event.preventDefault();
        void habitatShortcutHandlersRef.current?.togglePin();
      } else if (action === 'apply') {
        event.preventDefault();
        void habitatShortcutHandlersRef.current?.apply();
      } else if (action === 'move_up') {
        event.preventDefault();
        void habitatShortcutHandlersRef.current?.moveUp();
      } else if (action === 'move_down') {
        event.preventDefault();
        void habitatShortcutHandlersRef.current?.moveDown();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">Conversational Oracle</h2>
      {tiekatRoute ? <p className="text-xs text-zinc-400">TIEKAT route: {tiekatRoute}</p> : null}
      {gravityBadge ? <ModeledBadge text={gravityBadge} /> : null}
      {oraclePresentation ? <OracleCard oracle={oraclePresentation} /> : null}
      {awakenedSphereState ? <AwakenedSphereCard state={awakenedSphereState} showDiagnostics={showGravityDiagnostics} /> : null}
      <HabitatProfileSelector
        profiles={habitatProfiles}
        selectedId={selectedHabitatProfileId}
        profileNameDraft={habitatNameDraft}
        profileDescriptionDraft={habitatDescriptionDraft}
        onSelect={(id) => {
          setSelectedHabitatProfileId(id);
          const found = habitatProfiles.find((profile) => profile.id === id);
          if (found) {
            setHabitatNameDraft(found.name);
            setHabitatDescriptionDraft(found.description);
          }
        }}
        onProfileNameDraftChange={setHabitatNameDraft}
        onProfileDescriptionDraftChange={setHabitatDescriptionDraft}
        onApply={applySelectedHabitatProfile}
        onSave={saveCurrentAsHabitatProfile}
        onUpdate={updateCurrentHabitatProfile}
        onDelete={deleteCurrentHabitatProfile}
        onExport={exportCurrentHabitatProfile}
        onImport={importHabitatProfile}
        onTogglePin={togglePinSelectedHabitatProfile}
        onMoveUp={() => reorderSelectedHabitatProfile('up')}
        onMoveDown={() => reorderSelectedHabitatProfile('down')}
        diffPreview={habitatApplyPreview}
        transitionSummary={habitatTransitionPreview?.summary ?? null}
        transitionChips={habitatTransitionPreview?.chips ?? []}
        profileUsageSummary={selectedHabitatMemorySummary ? formatHabitatUsageSummary(selectedHabitatMemorySummary) : ''}
        profileLastAppliedLabel={habitatLastAppliedLabel}
        constellationContinuityNote={habitatConstellationSummary.compactContinuityNote}
        constellationTransitionNote={habitatConstellationSummary.recentTransitionLine}
        note={habitatProfileNote}
        error={habitatProfileError}
      />
      {habitatApplyPreview?.changed ? <p className="text-xs text-zinc-500">Preview only. Changes apply when you click Apply. {formatHabitatProfileDiff(habitatApplyPreview).split('\n').length} diff line(s).</p> : null}
      <SessionModeSelector value={sessionMode} onChange={setSessionMode} />
      <p className="text-xs text-zinc-500">{getSessionModeConfig(sessionMode).presentation.ritualFrame}</p>
      <label className="text-xs text-zinc-400">
        Oracle council mode
        <select className="ml-2 rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5" value={councilMode} onChange={(e) => {
          const mode = e.target.value as TiekatCouncilMode;
          setCouncilMode(mode);
          saveCouncilModePreference(mode);
        }}>
          {getCouncilModes().map((mode) => <option key={mode} value={mode}>{mode}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-2 text-xs text-zinc-400">
        <input type="checkbox" checked={preferProviderBackedCouncil} onChange={(e) => setPreferProviderBackedCouncil(e.target.checked)} />
        Prefer provider-backed council adapter (fallbacks to deterministic)
      </label>
      {councilSummary ? (
        <div className="rounded border border-zinc-700 p-2 text-xs text-zinc-400" data-testid="council-summary">
          <p className="font-semibold">Council: {councilSummary.mode}</p>
          <p>Roles: {councilSummary.roles.join(', ') || 'none'} • Turns: {councilSummary.turnCount}</p>
          <p>Debate: {councilSummary.disagreement ? 'disagreement detected' : 'aligned synthesis'}</p>
          <p>Execution: {councilSummary.executionSource}{councilSummary.adapterName ? ` (${councilSummary.adapterName})` : ''}</p>
          <p>{councilSummary.synthesisNote}</p>
        </div>
      ) : null}
      <PromptPresetChips
        group={presetGroup}
        onChoose={({ id, text }) => {
          const settings = loadSettings();
          markPresetUsed(sessionMode, id, settings.useSessionsInAssistant);
          setInput((prev) => (prev.trim().length ? `${prev}\n${text}` : text));
        }}
      />
      <label className="flex items-center gap-2 text-xs text-zinc-400">
        <input
          type="checkbox"
          checked={showGeometry}
          onChange={(e) => {
            setShowGeometry(e.target.checked);
            saveGeometryVisibilityPreference(e.target.checked);
          }}
        />
        Show sacred geometry in oracle view
      </label>
      {showGeometry && geometryState ? <SacredGeometryGlyph state={geometryState} /> : null}
      <label className="flex items-center gap-2 text-xs text-zinc-400">
        <input type="checkbox" checked={enableV55Framing} onChange={(e) => setEnableV55Framing(e.target.checked)} />
        Enable v55 master-action framing (conceptual)
      </label>
      {enableV55Framing ? <p className="text-xs text-zinc-400">{getTiekatV55Metadata().confidenceNote}</p> : null}
      <label className="flex items-center gap-2 text-xs text-zinc-400">
        <input type="checkbox" checked={showGravityDiagnostics} onChange={(e) => setShowGravityDiagnostics(e.target.checked)} />
        Show gravity diagnostics (debug)
      </label>
      {showGravityDiagnostics ? (
        <>
          <DiagnosticsSection
            gravityTrend={gravityTrend}
            recentGravity={recentGravity}
            sparklinePoints={sparklinePoints}
            versionState={versionComparisonSummary}
            scoringVersion={TIEKAT_V54_SCORING_VERSION}
            gravityDiagnostics={gravityDiagnostics}
          />
          {geometryState ? (
            <div className="rounded border border-zinc-700 p-2 text-xs text-zinc-400" data-testid="geometry-trace">
              <p className="font-semibold">Geometry Trace (diagnostics)</p>
              <p>Rule: {geometryState.trace.selectionReason}</p>
              <p>Layers: {geometryState.trace.layerReason}</p>
              <div className="flex flex-wrap gap-1 pt-1" data-testid="geometry-rule-legend">
                {getGeometryRuleLegend().map((rule) => (
                  <span key={rule} className="rounded border border-zinc-700 px-1 py-0.5 text-[10px]">{rule}</span>
                ))}
              </div>
            </div>
          ) : null}
          {constellationState && constellationFilterOptions ? (
            <div className="space-y-2">
              <ConstellationFilterChips
                options={constellationFilterOptions}
                value={constellationFilters}
                onChange={(next) => {
                  setConstellationFilters(next);
                  saveConstellationFilters(next);
                }}
                onReset={() => {
                  const reset = { mode: 'all', scoringVersion: 'all', shiftType: 'all' } as TiekatConstellationFilterState;
                  setConstellationFilters(reset);
                  saveConstellationFilters(reset);
                }}
              />
              {filteredConstellationState?.nodes.length ? <OracleConstellation state={filteredConstellationState} /> : <p className="text-xs text-zinc-500">No recent artifacts match the current filter.</p>}
              <p className="pt-2 text-xs text-zinc-500">{sphereContinuity.line} Theoretical integration layer only.</p>
            </div>
          ) : null}
          <div className="rounded border border-zinc-700 p-2 text-xs text-zinc-400" data-testid="council-continuity-diagnostics">
            <p className="font-semibold">Council Continuity (diagnostics)</p>
            <p>State: {councilContinuity.state}</p>
            <p>Role stability: {councilContinuity.roleStability}</p>
            <p>Disagreement rate: {councilContinuity.disagreementRate.toFixed(3)}</p>
            <p>Execution sources: {councilContinuity.executionSources.join(', ') || 'none'}</p>
            <p>{councilContinuity.note}</p>
          </div>
        </>
      ) : null}
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <aside className="panel space-y-2 text-sm">
          <div className="flex gap-2"><button className="rounded border border-zinc-700 px-2" onClick={summarize}>Summarize session</button><button className="rounded border border-zinc-700 px-2" onClick={() => exportSession('md')}>Export MD</button><button className="rounded border border-zinc-700 px-2" onClick={() => exportSession('json')}>Export JSON</button></div>
          <input type="file" accept="application/json" onChange={(e) => importSession(e.target.files?.[0])} />
          <input type="file" accept="application/json" onChange={(e) => importArtifact(e.target.files?.[0])} />
          {artifactImportError ? <p className="text-xs text-red-400">{artifactImportError}</p> : null}
          {sessions.map((s) => <button key={s.id} className="block w-full rounded border border-zinc-700 p-2 text-left" onClick={() => { setActiveId(s.id); setMessages(s.messages.map((m) => ({ role: m.role, content: m.content }))); }}>{s.title}<div className="text-xs text-zinc-400">{new Date(s.updatedAt).toLocaleString()}</div></button>)}
          <OracleArtifactList artifacts={oracleArtifacts} selectedId={selectedArtifactId} onSelect={setSelectedArtifactId} />
        </aside>
        <section className="panel space-y-2">
          {selectedArtifact ? (
            <OracleArtifactReplayCard
              artifact={selectedArtifact}
              diffView={artifactDiffView ?? undefined}
              onExport={() => exportArtifact(selectedArtifact)}
              onDelete={() => removeArtifact(selectedArtifact.id)}
            />
          ) : null}
          <RitualDeckPanel
            deck={ritualDeck}
            summary={ritualDeckSummary}
            onBuildRecentDeck={buildRecentDeck}
            onBuildSelectedDeck={buildSelectedDeck}
            onBuildFilteredDeck={buildFilteredDeck}
            onExportDeckJson={exportDeckJson}
            onExportDeckMarkdown={exportDeckMarkdown}
            onExportCard={exportRitualCard}
            onImportDeck={importRitualDeck}
            onSelectDeck={selectRitualDeck}
            onDeleteDeck={removeRitualDeck}
            filterOptions={ritualDeckFilterOptions}
            filters={ritualDeckFilters}
            onFiltersChange={setRitualDeckFilters}
            recentDecks={recentRitualDecks}
            disabled={!oracleArtifacts.length}
          />
          {ritualDeckImportError ? <p className="text-xs text-red-400">{ritualDeckImportError}</p> : null}
          <div className="max-h-[500px] overflow-auto space-y-2">
            {messages.map((m, i) => <div key={i} className="rounded border border-zinc-700 p-2 text-sm"><b>{m.role}</b><pre className="whitespace-pre-wrap">{m.content}</pre>{m.sources?.length ? <p className="text-xs text-zinc-400">Sources: {m.sources.join(', ')}</p> : null}</div>)}
          </div>
          <textarea className="w-full rounded border border-zinc-700 bg-zinc-800 p-2" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Chat freely or ask for a reading..." />
          <div className="flex gap-2"><button className="rounded bg-gold px-3 py-1 text-black" onClick={send}>Send</button><button className="rounded border border-zinc-700 px-3 py-1" onClick={() => controllerRef.current?.abort()}>Stop</button><button className="rounded border border-zinc-700 px-3 py-1" onClick={() => setInput(messages.filter((m) => m.role === 'user').at(-1)?.content || '')}>Regenerate</button></div>
        </section>
      </div>
    </main>
  );
}
