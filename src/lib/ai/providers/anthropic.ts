import { ProviderClient, ProviderRequest } from './types';

export const anthropicProvider: ProviderClient = {
  id: 'anthropic',
  async generate(request: ProviderRequest) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': process.env.ANTHROPIC_VERSION ?? '2023-06-01'
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: 1200,
        temperature: request.temperature ?? 0.2,
        system: request.systemPrompt,
        messages: [{ role: 'user', content: request.prompt }]
      })
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`anthropic_error:${res.status}:${detail}`);
    }

    const data = await res.json();
    return data.content?.find((item: { type: string }) => item.type === 'text')?.text ?? 'No response';
  }
};
