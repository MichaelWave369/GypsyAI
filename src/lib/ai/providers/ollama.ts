import { ProviderClient, ProviderRequest } from './types';

const base = () => process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';

export const ollamaProvider: ProviderClient = {
  id: 'ollama',
  async generate(request: ProviderRequest) {
    const res = await fetch(`${base()}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: request.model,
        prompt: `${request.systemPrompt}\n\n${request.prompt}`,
        stream: false,
        options: { temperature: request.temperature ?? 0.2 }
      })
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`ollama_error:${res.status}:${detail}`);
    }

    const data = await res.json();
    return data.response ?? 'No response';
  },
  async stream(request: ProviderRequest) {
    const res = await fetch(`${base()}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: request.model,
        prompt: `${request.systemPrompt}\n\n${request.prompt}`,
        stream: true,
        options: { temperature: request.temperature ?? 0.2 }
      })
    });
    return res.body;
  }
};
