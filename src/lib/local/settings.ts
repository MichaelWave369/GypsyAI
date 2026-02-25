export type ReadingStyle = 'Direct' | 'Gentle' | 'Ritual';

export interface AppSettings {
  provider: 'ollama' | 'openai';
  model: string;
  ollamaBaseUrl: string;
  aspectOrb: number;
  hermeticMode: 'gd' | 'thoth';
  demoMode: boolean;
  zodiacMode: 'tropical' | 'sidereal';
  minorAspects: boolean;
  readingStyle: ReadingStyle;
  accuracyMode: boolean;
  accuracyPasses: 1 | 2 | 3;
  temperaturePreset: 'low' | 'med';
  noNewCorrespondences: true;
  geneKeysGuideMode: 'contemplation' | 'direct';
}

export const defaultSettings: AppSettings = {
  provider: 'ollama',
  model: 'llama3.1',
  ollamaBaseUrl: 'http://localhost:11434',
  aspectOrb: 6,
  hermeticMode: 'gd',
  demoMode: true,
  zodiacMode: 'tropical',
  minorAspects: false,
  readingStyle: 'Gentle',
  accuracyMode: true,
  accuracyPasses: 2,
  temperaturePreset: 'low',
  noNewCorrespondences: true,
  geneKeysGuideMode: 'contemplation'
};

const KEY = 'gypsy-ai-settings';

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw), noNewCorrespondences: true } as AppSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify({ ...settings, noNewCorrespondences: true }));
}
