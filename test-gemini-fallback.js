import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: "AIzaSyAG-z6-qRIGXciiDAfzRul9EYRUvQm7tBk" });

async function test() {
  const geminiMessages = [{ role: 'user', parts: [{ text: 'hello' }] }];
  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: geminiMessages,
    });
    for await (const chunk of response) {
      console.log(chunk.text);
    }
  } catch (e) {
    console.log("Error object:", e);
  }
}
test();
