export async function callModel(prompt: string) {
  const provider = process.env.OPENAI_API_KEY ? 'openai' : 'ollama';

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? 'No response';
  }

  const res = await fetch(`${process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? 'llama3.1',
      prompt,
      stream: false
    })
  });
  const data = await res.json();
  return data.response ?? 'No response';
}
