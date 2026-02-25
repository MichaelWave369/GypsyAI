import { ProviderId } from './providers/types';
import { ollamaProvider } from './providers/ollama';
import { openaiProvider } from './providers/openai';
import { anthropicProvider } from './providers/anthropic';
import { xaiProvider } from './providers/xai';

export const hermeticSystemPrompt = `You are Gypsy AI, a reflective non-fatalistic guide. As above, so below. Use only packet facts and never invent correspondences.`;

const providerMap = {
  ollama: ollamaProvider,
  openai: openaiProvider,
  anthropic: anthropicProvider,
  xai: xaiProvider
} as const;

const modelDefaults: Record<ProviderId, string> = {
  ollama: process.env.OLLAMA_MODEL ?? 'llama3.1',
  openai: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  anthropic: process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-latest',
  xai: process.env.XAI_MODEL ?? 'grok-4-0709'
};

const keyByProvider: Record<Exclude<ProviderId, 'ollama'>, string | undefined> = {
  openai: process.env.OPENAI_API_KEY,
  anthropic: process.env.ANTHROPIC_API_KEY,
  xai: process.env.XAI_API_KEY
};

export interface ModelRequest {
  provider: ProviderId;
  model?: string;
  prompt: string;
  temperature?: number;
  system?: string;
}

export function isProviderId(value: string): value is ProviderId {
  return value === 'ollama' || value === 'openai' || value === 'anthropic' || value === 'xai';
}

export function assertProvider(provider: string): ProviderId {
  if (!isProviderId(provider)) throw new Error(`invalid_provider:${provider}`);
  return provider;
}

export function providerStatus() {
  return {
    openai: Boolean(process.env.OPENAI_API_KEY),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    xai: Boolean(process.env.XAI_API_KEY)
  };
}

export function getProviderConfigError(provider: ProviderId): { error: string } | null {
  if (provider === 'ollama') return null;
  if (!keyByProvider[provider]) {
    return { error: `Missing API key for ${provider}. Add it in environment variables or enable Demo Mode.` };
  }
  return null;
}

export function ensureProviderConfigured(provider: ProviderId) {
  const issue = getProviderConfigError(provider);
  if (issue) throw new Error(`missing_api_key:${provider}`);
}

function resolveModel(provider: ProviderId, explicitModel?: string) {
  return explicitModel || modelDefaults[provider];
}

export async function callModel({ provider, model, prompt, temperature = 0.2, system = hermeticSystemPrompt }: ModelRequest) {
  ensureProviderConfigured(provider);
  return providerMap[provider].generate({
    model: resolveModel(provider, model),
    prompt,
    systemPrompt: system,
    temperature
  });
}

export async function streamOllama({ model, prompt, temperature = 0.2, system = hermeticSystemPrompt }: Omit<ModelRequest, 'provider'>) {
  return ollamaProvider.stream?.({
    model: resolveModel('ollama', model),
    prompt,
    systemPrompt: system,
    temperature
  }) ?? null;
}
