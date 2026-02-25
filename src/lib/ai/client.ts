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

export function ensureProviderConfigured(provider: ProviderId) {
  if (provider === 'ollama') return;
  if (!keyByProvider[provider]) {
    throw new Error(`missing_api_key:${provider}`);
  }
}

export interface ModelCallOptions {
  provider?: ProviderId;
  model?: string;
}

function resolveModel(provider: ProviderId, explicitModel?: string) {
  return explicitModel || modelDefaults[provider];
}

export async function callModel(prompt: string, temperature = 0.2, options: ModelCallOptions = {}) {
  const provider = options.provider ?? 'ollama';
  ensureProviderConfigured(provider);
  const model = resolveModel(provider, options.model);
  return providerMap[provider].generate({ model, prompt, systemPrompt: hermeticSystemPrompt, temperature });
}

export async function streamOllama(message: string, model?: string) {
  const res = await fetch(`${process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || modelDefaults.ollama,
      prompt: `${hermeticSystemPrompt}\n\n${message}`,
      stream: true
    })
  });
  return res.body;
}
