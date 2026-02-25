import { ProviderClient, ProviderRequest } from './types';

export const xaiProvider: ProviderClient = {
  id: 'xai',
  async generate(request: ProviderRequest) {
    const res = await fetch('https://api.x.ai/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: request.model,
        temperature: request.temperature ?? 0.2,
        input: [
          { role: 'system', content: [{ type: 'text', text: request.systemPrompt }] },
          { role: 'user', content: [{ type: 'text', text: request.prompt }] }
        ]
      })
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`xai_error:${res.status}:${detail}`);
    }

    const data = await res.json();
    return data.output_text ?? data.output?.[0]?.content?.[0]?.text ?? 'No response';
  }
};
