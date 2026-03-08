/**
 * Aura AI - OpenRouter Integration Service
 */
import { GoogleGenAI } from "@google/genai";

const DEFAULT_OPENROUTER_KEY = '';
const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://aura-ai.netlify.app';
const APP_NAME = 'Aura AI';

const getOpenRouterKey = () => {
  try {
    const userKey = localStorage.getItem('aura_openrouter_api_key');
    if (userKey && userKey.trim()) return userKey;
  } catch (e) {
    console.error('Error reading aura_openrouter_api_key from localStorage', e);
  }
  
  // Check for Vite environment variable (useful for Netlify/Vercel deployments)
  const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (envKey) return envKey;
  
  return DEFAULT_OPENROUTER_KEY;
};

const getGeminiApiKey = () => {
  // 1. Check Vite env var (standard for production builds)
  const viteKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (viteKey) return viteKey;

  // 2. Check process.env (standard for this platform's preview)
  if (typeof process !== 'undefined' && process.env) {
    return process.env.API_KEY || process.env.GEMINI_API_KEY;
  }

  return undefined;
};

// Dynamic Model Management
let currentModel = 'gemini-3-flash-preview';

async function* geminiSdkFallback(
  messages: { role: 'user' | 'assistant'; content: any }[],
  userMemory: string,
  userName: string,
  persona: 'Aura' | 'Atlas',
  expertId: string,
  modelId: string = 'gemini-3-flash-preview'
): AsyncGenerator<{ text?: string; toolCalls?: any[]; imageUrl?: string }> {
  const platformApiKey = getGeminiApiKey();
  if (!platformApiKey) throw new Error('No platform API key available for fallback');

  const ai = new GoogleGenAI({ apiKey: platformApiKey });
  const basePrompt = getSystemPrompt(persona, expertId);
  const systemPrompt = `${basePrompt}
Usuário: ${userName}
Memória: ${userMemory || 'Nenhuma'}
Data: ${new Date().toLocaleString('pt-BR')}`;

  const geminiMessages = messages.map(m => {
    if (typeof m.content === 'string') {
      return { role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] };
    }
    const parts = m.content.map((p: any) => {
      if (p.type === 'text') return { text: p.text };
      if (p.type === 'image_url') {
        const base64 = p.image_url.url.split(',')[1];
        const mimeType = p.image_url.url.split(';')[0].split(':')[1];
        return { inlineData: { data: base64, mimeType } };
      }
      return null;
    }).filter(Boolean);
    return { role: m.role === 'assistant' ? 'model' : 'user', parts };
  });

  const response = await ai.models.generateContentStream({
    model: modelId,
    contents: geminiMessages as any,
    config: {
      systemInstruction: systemPrompt,
      tools: expertId === 'youtube' ? [{ functionDeclarations: [openYouTubeVideoTool.function as any] }] : undefined
    }
  });

  for await (const chunk of response) {
    if (chunk.text) {
      yield { text: chunk.text };
    }
    if (chunk.functionCalls) {
      yield { toolCalls: chunk.functionCalls.map((fc: any) => ({
        id: fc.id,
        type: 'function',
        function: { name: fc.name, arguments: JSON.stringify(fc.args) }
      })) };
    }
  }
}

// Fallback if the above is invalid
export const MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', desc: 'Modelo oficial do Google. Rápido e inteligente.', free: true },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', desc: 'Modelo avançado para raciocínio complexo.', free: true },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', desc: 'Rápido e equilibrado para tarefas gerais.', free: true },
  { id: 'google/gemini-2.0-flash-lite-preview-02-05:free', name: 'Gemini 2.0 Flash Lite', desc: 'Ultra-rápido, ideal para respostas curtas.', free: true },
  { id: 'google/gemini-flash-1.5-8b:free', name: 'Gemini 1.5 Flash 8B', desc: 'Leve e eficiente para tarefas rápidas.', free: true },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', desc: 'Poderoso e versátil, ótimo para lógica.', free: true },
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B', desc: 'Modelo muito forte em lógica e código.', free: true },
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano', desc: 'Eficiente para resumos e textos simples.', free: true },
];

const VALID_MODELS = MODELS.map(m => m.id);

export const switchModel = (modelName: string) => {
  console.log(`[Aura AI] Switching model to: ${modelName}`);
  currentModel = modelName;
  localStorage.setItem('aura_current_model', modelName);
};

// Initialize model from storage
try {
  const savedModel = localStorage.getItem('aura_current_model');
  if (savedModel) currentModel = savedModel;
} catch (e) {
  console.error('Error reading aura_current_model from localStorage', e);
}

export const getCurrentModel = () => currentModel;


// Tool Definitions (OpenAI Compatible)
export const openYouTubeVideoTool = {
  type: 'function',
  function: {
    name: 'openYouTubeVideo',
    description: 'Abre um player de vídeo do YouTube na interface do usuário.',
    parameters: {
      type: 'object',
      properties: {
        videoId: {
          type: 'string',
          description: 'O ID único de 11 caracteres do vídeo do YouTube.',
        },
        title: {
          type: 'string',
          description: 'O título do vídeo.',
        },
      },
      required: ['videoId'],
    },
  },
};

export const generateImageTool = {
  type: 'function',
  function: {
    name: 'generateImage',
    description: 'Gera uma imagem artística baseada em uma descrição textual.',
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'A descrição detalhada da imagem (ex: "um gato astronauta no espaço").',
        },
      },
      required: ['prompt'],
    },
  },
};

const getSystemPrompt = (persona: 'Aura' | 'Atlas', expertId: string) => {
  const isFemale = persona === 'Aura';
  const name = isFemale ? 'Aura' : 'Atlas';
  const genderInstruction = isFemale 
    ? 'Responda usando pronomes e identidade FEMININA. Você é empática, organizada, criativa e fluída.' 
    : 'Responda usando pronomes e identidade MASCULINA. Você é direto, analítico, pragmático e protetor.';

  let expertInstruction = 'Assistente versátil de altíssima capacidade para qualquer tarefa do dia a dia.';
  if (expertId === 'profissional') expertInstruction = 'Você é um executivo sênior e estrategista de negócios. Focado em e-mails, relatórios, LinkedIn, etiqueta corporativa e tomada de decisão.';
  if (expertId === 'tutor') expertInstruction = 'Você é um professor paciente e didático. Explica matérias complexas de forma simples, resolve exercícios passo a passo e cria planos de estudo personalizados.';
  if (expertId === 'bem-estar') expertInstruction = 'Você é um coach de bem-estar e produtividade. Organiza rotinas de treino, meditação, gestão de tempo e hábitos saudáveis.';
  if (expertId === 'tech') expertInstruction = 'Você é um engenheiro de software sênior. Focado em debugar código, arquitetura de sistemas, lógica de programação e melhores práticas de tecnologia.';
  if (expertId === 'youtube') expertInstruction = `Você é o maior especialista em curadoria de vídeos do YouTube do mundo. Sua missão é encontrar vídeos EXATOS e FUNCIONAIS para o usuário. Você tem um conhecimento vasto de IDs de vídeos populares e educacionais. 

DIRETRIZES PARA VÍDEOS:
1. SEMPRE use a ferramenta "openYouTubeVideo" para mostrar o vídeo.
2. Se por qualquer motivo você não puder usar a ferramenta, escreva o comando EXATAMENTE assim no final da sua resposta: openYouTubeVideo("ID_DO_VIDEO")
3. Use APENAS IDs de 11 caracteres que você tem certeza que existem (ex: dQw4w9WgXcQ).
4. Se não tiver certeza do ID exato, descreva o vídeo e peça para o usuário confirmar, ou tente sugerir IDs de canais oficiais renomados sobre o assunto.
5. Priorize vídeos de canais verificados e com alta visualização para garantir que o link não esteja quebrado.
6. Todos os vídeos que você sugerir DEVEM funcionar.`;

  return `Você é ${name}, uma Assistente Pessoal de IA de elite.
${genderInstruction}
Especialidade: ${expertInstruction}

DIRETRIZES:
- Seja humano, inteligente e proativo.
- Use Markdown para formatação.
- Se o usuário quiser ver um vídeo, use a função openYouTubeVideo.
- Se o usuário pedir para criar ou gerar uma imagem, use a função generateImage.
- Se enviar imagens, analise-as com precisão.`;
};

export async function* generateChatResponseStream(
  messages: { role: 'user' | 'assistant'; content: any }[],
  userMemory: string,
  userName: string,
  persona: 'Aura' | 'Atlas',
  expertId: string
): AsyncGenerator<{ text?: string; toolCalls?: any[]; imageUrl?: string }> {
  const platformApiKey = getGeminiApiKey();

  // Direct SDK usage for native Gemini models
  if (platformApiKey && (currentModel === 'gemini-3-flash-preview' || currentModel === 'gemini-3.1-pro-preview')) {
     try {
       yield* geminiSdkFallback(messages, userMemory, userName, persona, expertId, currentModel);
       return;
     } catch (e) {
       console.error('[Aura AI] Gemini SDK failed, attempting fallback to OpenRouter:', e);
       // Proceed to OpenRouter fallback loop
     }
  }

  const isGeminiModel = currentModel.includes('gemini');

  // SILENT FALLBACK: If it's a Gemini model (OpenRouter ID) and we have a platform key, 
  // use the Gemini SDK directly to avoid OpenRouter credit issues.
  if (isGeminiModel && platformApiKey) {
    try {
      let geminiModelId = 'gemini-3-flash-preview';
      if (currentModel.includes('pro') || currentModel.includes('2.0')) geminiModelId = 'gemini-3.1-pro-preview';
      
      yield* geminiSdkFallback(messages, userMemory, userName, persona, expertId, geminiModelId);
      return;
    } catch (e) {
      console.warn('[Aura AI] Initial Gemini SDK fallback failed, trying OpenRouter...', e);
    }
  }

  const modelsToTry = expertId === 'youtube' 
    ? [currentModel, ...VALID_MODELS.filter(m => m !== currentModel)]
    : [currentModel, ...VALID_MODELS.filter(m => m !== currentModel)];
  
  let lastError = null;

  for (const model of modelsToTry) {
    // Skip native models in OpenRouter loop
    if (model === 'gemini-3-flash-preview' || model === 'gemini-3.1-pro-preview') continue;

    try {
      const systemPrompt = `${getSystemPrompt(persona, expertId)}
Usuário: ${userName}
Memória: ${userMemory || 'Nenhuma'}
Data: ${new Date().toLocaleString('pt-BR')}`;

      const payload: any = {
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
        max_tokens: 1000,
      };

      // Improved tool support detection
      const supportsTools = 
        model.includes('gpt-5') || 
        model.includes('gpt-4o') || 
        model.includes('gemini-2.0') || 
        model.includes('gemini-3.1') ||
        model.includes('llama-3.3') ||
        model.includes('gemma-3') ||
        model.includes('nemotron') ||
        (model.includes('gemini') && model.includes(':free'));
      
      if (supportsTools) {
        payload.tools = [openYouTubeVideoTool, generateImageTool];
        payload.tool_choice = 'auto';
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getOpenRouterKey()}`,
          'HTTP-Referer': APP_URL,
          'X-Title': APP_NAME,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        let errorMsg = error?.error?.message || 'Erro na API do OpenRouter';
        
        if (response.status === 401 || errorMsg.includes('User not found') || errorMsg.includes('Authentication')) {
          errorMsg = 'Sua chave de API é inválida ou expirou. Por favor, atualize-a nas configurações.';
        }
        
        console.warn(`[Aura AI] Model ${model} failed: ${errorMsg}. Trying fallback...`);
        lastError = new Error(errorMsg);
        continue; // Try next model
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) continue;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanedLine = line.replace(/^data: /, '').trim();
          if (!cleanedLine || cleanedLine === '[DONE]') continue;

          try {
            const json = JSON.parse(cleanedLine);
            const delta = json.choices[0].delta;
            
            if (delta.content) {
              yield { text: delta.content };
            }
            
            if (delta.tool_calls) {
              yield { toolCalls: delta.tool_calls };
            }
          } catch (e) {
            // Skip partial JSON
          }
        }
      }
      
      return; // Success, exit the generator
    } catch (e: any) {
      console.warn(`[Aura AI] Connection error with ${model}: ${e.message}. Trying fallback...`);
      lastError = e;
      continue;
    }
  }

  // FINAL FALLBACK: If all OpenRouter models fail (likely rate limit), 
  // try Gemini SDK one last time regardless of the selected model.
  if (platformApiKey) {
    try {
      console.warn('[Aura AI] All OpenRouter models failed. Attempting final Gemini SDK fallback...');
      yield* geminiSdkFallback(messages, userMemory, userName, persona, expertId);
      return;
    } catch (e: any) {
      console.error('[Aura AI] Final Gemini SDK fallback also failed.', e);
      if (e?.status === 401 || e?.message?.includes('401')) {
        lastError = new Error('Sua chave de API do Gemini é inválida. Por favor, atualize-a nas configurações.');
      }
    }
  }

  throw lastError || new Error('Todos os modelos falharam.');
}

export async function summarizeYouTubeVideo(videoId: string, persona: 'Aura' | 'Atlas'): Promise<string> {
  const prompt = `Resuma este vídeo do YouTube (ID: ${videoId}). Seja detalhado e use o tom de ${persona}.`;
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getOpenRouterKey()}`,
      'HTTP-Referer': APP_URL,
      'X-Title': APP_NAME,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: currentModel,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800
    })
  });

  if (!response.ok) {
    if (response.status === 401) return 'Erro: Chave de API inválida. Por favor, atualize nas configurações.';
    return 'Não foi possível resumir devido a um erro de conexão.';
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content || 'Não foi possível resumir.';
}

export async function generateToolResponse(
  prompt: string,
  userMemory: string,
  userName: string,
  persona: 'Aura' | 'Atlas'
): Promise<string> {
  const systemPrompt = `${getSystemPrompt(persona, 'geral')}
Usuário: ${userName}
Memória: ${userMemory || 'Nenhuma'}`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getOpenRouterKey()}`,
      'HTTP-Referer': APP_URL,
      'X-Title': APP_NAME,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: currentModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800
    })
  });

  if (!response.ok) {
    if (response.status === 401) return 'Erro: Chave de API inválida. Por favor, atualize nas configurações.';
    return 'Erro de conexão ao processar ferramenta.';
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content || 'Erro ao processar ferramenta.';
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    // Using OpenRouter for image generation if possible, or fallback to a message
    // Note: OpenRouter doesn't have a direct image generation endpoint like OpenAI's /images/generations
    // but some models can return images if they are multimodal and support it.
    // For now, we'll suggest using a model that supports image generation or return a placeholder.
    
    return `Desculpe, a geração direta de imagens está temporariamente desativada. Tente pedir para eu descrever a imagem para você. (Prompt: ${prompt})`;
  } catch (error: any) {
    console.error('[Aura AI] Image generation error:', error);
    return 'Desculpe, ocorreu um erro ao processar seu pedido.';
  }
}
