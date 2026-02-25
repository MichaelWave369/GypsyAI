export const hermeticSystemPrompt = `You are Gypsy AI, a reflective non-fatalistic guide. As above, so below. Use only packet facts and never invent correspondences.`;

export async function callModel(prompt: string, temperature = 0.2) {
  const provider = process.env.OPENAI_API_KEY ? 'openai' : 'ollama';
  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini', temperature, messages: [{ role: 'system', content: hermeticSystemPrompt }, { role: 'user', content: prompt }] })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? 'No response';
  }
  const res = await fetch(`${process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'}/api/generate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: process.env.OLLAMA_MODEL ?? 'llama3.1', prompt: `${hermeticSystemPrompt}\n\n${prompt}`, stream: false, options: { temperature } })
  });
  const data = await res.json();
  return data.response ?? 'No response';
}

export async function streamOllama(message: string) {
  const res = await fetch(`${process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'}/api/generate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: process.env.OLLAMA_MODEL ?? 'llama3.1', prompt: `${hermeticSystemPrompt}\n\n${message}`, stream: true })
  });
  return res.body;
}
