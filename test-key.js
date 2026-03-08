import fetch from 'node-fetch';
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer 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',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'google/gemini-flash-1.5-8b:free',
    messages: [{ role: 'user', content: 'test' }]
  })
});
const data = await response.json();
console.log(data);
