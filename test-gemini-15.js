import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: "AIzaSyAG-z6-qRIGXciiDAfzRul9EYRUvQm7tBk" });

async function test() {
  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'hello' }] }],
    });
    for await (const chunk of response) {
      console.log(chunk.text);
    }
  } catch (e) {
    console.log("Error:", e);
  }
}
test();
