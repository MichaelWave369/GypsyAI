export type ProviderId = 'ollama' | 'openai' | 'anthropic' | 'xai';

export interface ProviderRequest {
  model: string;
  prompt: string;
  systemPrompt: string;
  temperature?: number;
}

export interface ProviderClient {
  id: ProviderId;
  generate(request: ProviderRequest): Promise<string>;
}
