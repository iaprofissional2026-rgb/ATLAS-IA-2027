import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: "fake" });
try {
  const req = {
    model: "gemini-2.0-flash",
    contents: "hello",
    config: {
      tools: [{ functionDeclarations: [{
        name: "test",
        parameters: { type: "object", properties: { a: { type: "string" } } }
      }]}]
    }
  };
  console.log("Success");
} catch (e) {
  console.log("Error", e);
}
