import fetch from 'node-fetch';
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer badkey',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'google/gemini-flash-1.5-8b:free',
    messages: [{ role: 'user', content: 'test' }]
  })
});
const data = await response.json();
console.log(data);
