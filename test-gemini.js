import { GoogleGenAI } from '@google/genai';

const apiKey = "AIzaSyAG-z6-qRIGXciiDAfzRul9EYRUvQm7tBk";
const ai = new GoogleGenAI({ apiKey });

async function test() {
  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
    });
    for await (const chunk of response) {
      console.log(chunk.text);
    }
  } catch (e) {
    console.error("SDK Error:", e);
  }
}
test();
