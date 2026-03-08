import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Paperclip, Mic, Copy, Check, Plus, ArrowLeft, MessageSquare, Briefcase, GraduationCap, HeartPulse, Code, RefreshCw, X, Image as ImageIcon, Youtube, Key, Search, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext, Message } from '../store/AppContext';
import { generateChatResponseStream, switchModel, getCurrentModel, generateImage, MODELS } from '../services/ai';
import { cn } from '../lib/utils';

const EXPERTS = [
  { id: 'geral', icon: MessageSquare, label: 'Geral', desc: 'Assistente versátil', color: 'text-gray-500 bg-gray-100 dark:bg-gray-800' },
  { id: 'profissional', icon: Briefcase, label: 'Profissional', desc: 'E-mails e LinkedIn', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
  { id: 'tutor', icon: GraduationCap, label: 'Tutor', desc: 'Estudos e explicações', color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
  { id: 'bem-estar', icon: HeartPulse, label: 'Bem-estar', desc: 'Treino e meditação', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' },
  { id: 'tech', icon: Code, label: 'Dev/Tech', desc: 'Código e lógica', color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30' },
  { id: 'youtube', icon: Youtube, label: 'YouTube', desc: 'Estudar com vídeos', color: 'text-red-500 bg-red-100 dark:bg-red-900/30' },
];

export function Chat() {
  const { 
    user, 
    conversations, 
    activeConversationId, 
    setActiveConversationId, 
    addMessage, 
    removeMessage,
    createNewConversation,
    setCurrentScreen,
    persona,
    setPersona,
    setYoutubeVideoId,
    setIsYoutubePlayerVisible
  } = useAppContext();
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [currentModel, setCurrentModel] = useState(getCurrentModel());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageMimeType, setSelectedImageMimeType] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);

  const activeModel = MODELS.find(m => m.id === currentModel) || MODELS[0];

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const userGeminiKey = localStorage.getItem('aura_gemini_api_key');
        const userOpenRouterKey = localStorage.getItem('aura_openrouter_api_key');
        const envGeminiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const envOpenRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
        
        if (userGeminiKey?.trim() || userOpenRouterKey?.trim() || envGeminiKey || envOpenRouterKey) {
          setHasApiKey(true);
          return;
        }

        if (typeof window !== 'undefined' && (window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          setHasApiKey(!!hasKey);
        } else {
          setHasApiKey(false);
        }
      } catch (e) {
        console.error('Error checking API key:', e);
        setHasApiKey(false);
      }
    };
    checkApiKey();
  }, [currentModel]);

  const handleOpenKeyDialog = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    if (messagesEndRef.current) {
      const behavior = isTyping ? 'auto' : 'smooth';
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, [messages, streamingMessage, isTyping]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowPersonaMenu(false);
        setShowModelMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModelChange = (model: string) => {
    switchModel(model);
    setCurrentModel(model);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setSelectedImageMimeType(file.type);
    };
    reader.readAsDataURL(file);
    
    // Reset input so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setSelectedImageMimeType(null);
  };

  const handleSend = async (textToProcess: string = input) => {
    if (!textToProcess.trim() && !selectedImage) return;

    let convId = activeConversationId;
    if (!convId) {
      convId = createNewConversation(undefined, 'geral');
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      text: textToProcess,
      timestamp: Date.now(),
      imageUrl: selectedImage || undefined,
      imageMimeType: selectedImageMimeType || undefined,
    };

    addMessage(convId, userMessage);
    if (textToProcess === input) setInput('');
    
    // Clear image selection immediately after sending
    const currentImage = selectedImage;
    const currentImageMimeType = selectedImageMimeType;
    setSelectedImage(null);
    setSelectedImageMimeType(null);
    
    setIsTyping(true);
    setStreamingMessage('');

    const handleImageGeneration = async (convId: string, prompt: string) => {
      const loadingMsgId = uuidv4();
      addMessage(convId, {
        id: loadingMsgId,
        role: 'model',
        text: '🎨 Gerando sua imagem, um momento...',
        timestamp: Date.now()
      });
      
      try {
        const imageResult = await generateImage(prompt);
        removeMessage(convId, loadingMsgId);
        addMessage(convId, {
          id: uuidv4(),
          role: 'model',
          text: imageResult,
          timestamp: Date.now()
        });
      } catch (err) {
        removeMessage(convId, loadingMsgId);
        addMessage(convId, {
          id: uuidv4(),
          role: 'model',
          text: 'Erro ao gerar imagem. Tente novamente.',
          timestamp: Date.now(),
          isError: true
        });
      }
    };

    try {
      // Map messages to OpenRouter format
      const history = [...messages, userMessage]
        .filter(m => !m.isError)
        .map(m => {
          if (!m.imageUrl) {
            return {
              role: (m.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
              content: m.text
            };
          }

          const content: any[] = [{ type: 'text', text: m.text }];
          if (m.imageUrl && m.imageMimeType) {
            content.push({
              type: 'image_url',
              image_url: {
                url: m.imageUrl
              }
            });
          }
          
          return {
            role: (m.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
            content
          };
        });

      const stream = await generateChatResponseStream(
        history, 
        user?.memory || '', 
        user?.name || 'Usuário',
        persona,
        activeConversation?.expertId || 'geral'
      );
      
      let fullResponse = '';
      let toolCallArguments = '';
      let hasToolCall = false;

      for await (const chunk of stream) {
        if (chunk.toolCalls) {
          hasToolCall = true;
          for (const call of chunk.toolCalls) {
            if (call.function?.arguments) {
              toolCallArguments += call.function.arguments;
            }
          }
        }
        if (chunk.text) {
          fullResponse += chunk.text;
          setStreamingMessage(fullResponse);
        }
        if (chunk.imageUrl) {
          fullResponse += `\n\n![Imagem Gerada](${chunk.imageUrl})`;
          setStreamingMessage(fullResponse);
        }
      }

      let detectedVideoId: string | undefined = undefined;
      let detectedSearchQuery: string | undefined = undefined;

      // Process tool call after stream ends
      if (hasToolCall && toolCallArguments) {
        try {
          const args = JSON.parse(toolCallArguments);
          if (args.videoId) {
            detectedVideoId = args.videoId;
            setYoutubeVideoId(args.videoId);
            setIsYoutubePlayerVisible(true);
          }

          if (args.prompt) {
            handleImageGeneration(convId, args.prompt);
          }
        } catch (e) {
          console.error('Error parsing tool call arguments:', e, 'Raw:', toolCallArguments);
        }
      } else {
        // Fallback: Check if the model hallucinated the function call as text or sent a URL
        const youtubeMatch = fullResponse.match(/openYouTubeVideo\s*\(\s*(?:videoId\s*[:=]\s*)?["']?([a-zA-Z0-9_-]{11})["']?\s*\)/i);
        const youtubeUrlMatch = fullResponse.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
        
        const videoId = (youtubeMatch && youtubeMatch[1]) || (youtubeUrlMatch && youtubeUrlMatch[1]);
        
        if (videoId) {
          detectedVideoId = videoId;
          setYoutubeVideoId(videoId);
          setIsYoutubePlayerVisible(true);
          
          // Clean up the text if it was a function call hallucination
          if (youtubeMatch) {
            fullResponse = fullResponse.replace(youtubeMatch[0], '').trim();
          }
        }

        const imageMatch = fullResponse.match(/generateImage\s*\(\s*(?:prompt\s*[:=]\s*)?["']?([^"'\)]+)["']?\s*\)/i);
        if (imageMatch && imageMatch[1]) {
          handleImageGeneration(convId, imageMatch[1]);
          // Remove the function call from the text to keep it clean
          fullResponse = fullResponse.replace(imageMatch[0], '').trim();
        }

        // Detect search intent if no video was found but YouTube is mentioned
        if (!videoId && fullResponse.toLowerCase().includes('youtube')) {
          const searchKeywords = ['busc', 'pesquis', 'procur', 'encontr', 'ver', 'assistir'];
          if (searchKeywords.some(k => fullResponse.toLowerCase().includes(k))) {
            // Try to extract what to search for
            const searchMatch = fullResponse.match(/(?:busc|pesquis|procur)(?:ar|ando)?\s+(?:por|um\s+vídeo\s+sobre)?\s+["']?([^"'\.\?\!]+)["']?/i);
            detectedSearchQuery = searchMatch ? searchMatch[1].trim() : activeConversation?.title || 'vídeo';
          }
        }
      }

      const modelMessage: Message = {
        id: uuidv4(),
        role: 'model',
        text: fullResponse,
        timestamp: Date.now(),
        youtubeVideoId: detectedVideoId,
        youtubeSearchQuery: detectedSearchQuery,
      };
      
      addMessage(convId, modelMessage);
    } catch (error: any) {
      console.error('Error generating response:', error);
      
      let errorText = 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente em alguns instantes.';
      if (error?.message) {
        // Translate common errors for better UX
        if (error.message.includes('429') || error.message.includes('Rate limit')) 
          errorText = 'Limite de requisições atingido. Aguarde um momento ou tente outro modelo.';
        else if (error.message.includes('403')) errorText = 'Chave de API inválida ou expirada.';
        else if (error.message.includes('SAFETY')) errorText = 'A resposta foi bloqueada por filtros de segurança.';
        else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) errorText = 'Erro de conexão. Verifique sua internet.';
        else if (error.message.includes('Request timeout')) errorText = 'A conexão demorou muito. Tente novamente.';
        else errorText = `Erro: ${error.message}`;
      }

      const errorMessage: Message = {
        id: uuidv4(),
        role: 'model',
        text: errorText,
        timestamp: Date.now(),
        isError: true,
      };
      addMessage(convId, errorMessage);
    } finally {
      setIsTyping(false);
      setStreamingMessage('');
    }
  };

  const handleRetry = (messageId: string) => {
    if (!activeConversationId) return;
    
    // Find the last user message before this error
    const errorIndex = messages.findIndex(m => m.id === messageId);
    if (errorIndex > 0) {
      const lastUserMsg = messages[errorIndex - 1];
      if (lastUserMsg.role === 'user') {
        removeMessage(activeConversationId, messageId);
        removeMessage(activeConversationId, lastUserMsg.id);
        
        // Restore image if it existed
        if (lastUserMsg.imageUrl && lastUserMsg.imageMimeType) {
          setSelectedImage(lastUserMsg.imageUrl);
          setSelectedImageMimeType(lastUserMsg.imageMimeType);
        }
        
        handleSend(lastUserMsg.text);
      }
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExpertClick = (expertId: string) => {
    createNewConversation(undefined, expertId);
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto bg-transparent">
      <header className="glass-panel flex items-center justify-between px-4 py-3 border-b border-gray-200/50 dark:border-gray-800/50 shrink-0 relative z-10">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center space-x-2 hover:bg-white/50 dark:hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 accent-bg rounded-full flex items-center justify-center text-white font-medium text-sm">
                {persona === 'Aura' ? 'A' : 'At'}
              </div>
              <div className="text-left">
                <h1 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight">
                  {persona}
                </h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                  {activeConversation?.expertId ? EXPERTS.find(e => e.id === activeConversation.expertId)?.label : 'Geral'}
                </p>
              </div>
            </button>

            <AnimatePresence>
              {showPersonaMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 mt-2 w-48 glass-panel rounded-xl shadow-lg overflow-hidden z-50"
                >
                  <button
                    onClick={() => { setPersona('Aura'); setShowPersonaMenu(false); }}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm transition-colors",
                      persona === 'Aura' ? "bg-white/50 dark:bg-white/10 font-medium" : "hover:bg-white/50 dark:hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 accent-bg rounded-full flex items-center justify-center text-white text-xs mr-3">A</div>
                      Aura (Feminino)
                    </div>
                  </button>
                  <button
                    onClick={() => { setPersona('Atlas'); setShowPersonaMenu(false); }}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm transition-colors border-t border-gray-200/50 dark:border-gray-700/50",
                      persona === 'Atlas' ? "bg-white/50 dark:bg-white/10 font-medium" : "hover:bg-white/50 dark:hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gray-600 dark:bg-gray-500 rounded-full flex items-center justify-center text-white text-xs mr-3">At</div>
                      Atlas (Masculino)
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <button 
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="flex items-center space-x-1.5 text-[10px] bg-white/50 dark:bg-black/50 border border-gray-200/50 dark:border-gray-800/50 rounded-lg px-2 py-1 outline-none hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
            >
              <span className="font-medium">{activeModel.name}</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", showModelMenu && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showModelMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-64 glass-panel rounded-xl shadow-lg overflow-hidden z-50 py-1"
                >
                  <div className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200/50 dark:border-gray-700/50 mb-1">
                    Selecione o Cérebro da IA
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          handleModelChange(model.id);
                          setShowModelMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2.5 transition-colors group",
                          currentModel === model.id ? "bg-white/50 dark:bg-white/10" : "hover:bg-white/50 dark:hover:bg-white/10"
                        )}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={cn("text-xs font-medium", currentModel === model.id ? "accent-text" : "text-gray-700 dark:text-gray-200")}>
                              {model.name}
                            </span>
                            {model.free && (
                              <span className="text-[8px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1 rounded uppercase font-bold">Free</span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight group-hover:text-gray-600 dark:group-hover:text-gray-300">
                            {model.desc}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => createNewConversation()}
            className="p-2 accent-text bg-white/50 dark:bg-black/50 rounded-full hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!hasApiKey && currentModel.includes('gemini-3.1-flash-image-preview') && (
          <div className="mx-auto max-w-md p-6 glass-panel rounded-2xl text-center space-y-4 my-8">
            <Key className="w-12 h-12 mx-auto text-amber-500" />
            <h3 className="text-lg font-semibold">Chave de API Necessária</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Para usar o modelo Gemini 3.1 Flash Image, você precisa selecionar sua própria chave de API paga.
            </p>
            <button
              onClick={handleOpenKeyDialog}
              className="w-full py-3 accent-bg text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Selecionar Chave de API
            </button>
            <p className="text-[10px] text-gray-400">
              Saiba mais em <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline">documentação de faturamento</a>.
            </p>
          </div>
        )}

        {messages.length === 0 && !isTyping && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Escolha um Especialista</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-[280px]">
              Selecione o perfil ideal para a sua tarefa atual.
            </p>
            
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {EXPERTS.map((expert) => (
                <button
                  key={expert.id}
                  onClick={() => handleExpertClick(expert.id)}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-2xl border transition-all text-center glass-panel",
                    activeConversation?.expertId === expert.id 
                      ? "border-[var(--color-accent)] shadow-sm" 
                      : "border-transparent hover:border-gray-200/50 dark:hover:border-gray-700/50"
                  )}
                >
                  <div className={cn("p-3 rounded-xl mb-3", expert.color)}>
                    <expert.icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{expert.label}</span>
                  <span className="text-[10px] text-gray-500 mt-1">{expert.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex w-full",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 relative group",
                  msg.role === 'user'
                    ? "accent-bg text-white rounded-br-sm"
                    : msg.isError 
                      ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-100 dark:border-red-900/30 rounded-bl-sm"
                      : "glass-panel text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm"
                )}
              >
                {msg.imageUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
                    <img src={msg.imageUrl} alt="Uploaded" className="max-w-full h-auto max-h-64 object-contain" />
                  </div>
                )}
                
                {msg.role === 'model' && !msg.isError ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-pre:text-gray-800 dark:prose-pre:text-gray-200">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        code({node, inline, className, children, ...props}: any) {
                          const match = /language-(\w+)/.exec(className || '')
                          const isCodeBlock = !inline && match;
                          const codeText = (Array.isArray(children) ? children.join('') : String(children || '')).replace(/\n$/, '');
                          
                          if (isCodeBlock) {
                            return (
                              <div className="relative group/code mt-4 mb-4">
                                <div className="absolute flex items-center justify-between w-full px-3 py-1.5 bg-gray-200 dark:bg-gray-800 rounded-t-lg border-b border-gray-300 dark:border-gray-700 select-none">
                                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{match[1]}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(codeText);
                                      setCopiedId(`code-${msg.id}-${codeText.substring(0, 10)}`);
                                      setTimeout(() => setCopiedId(null), 2000);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center space-x-1"
                                    title="Copiar código"
                                  >
                                    {copiedId === `code-${msg.id}-${codeText.substring(0, 10)}` ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                        <span className="text-xs text-green-500">Copiado</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span className="text-xs">Copiar</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <pre className="!mt-0 !pt-10 !rounded-t-none">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              </div>
                            )
                          }
                          return <code className={className} {...props}>{children}</code>
                        }
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                    
                    {msg.youtubeVideoId && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setYoutubeVideoId(msg.youtubeVideoId!);
                            setIsYoutubePlayerVisible(true);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-sm group/btn"
                        >
                          <Youtube className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                          <span className="font-medium">Abrir Player de Vídeo</span>
                        </button>
                      </div>
                    )}

                    {msg.youtubeSearchQuery && !msg.youtubeVideoId && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            // Trigger a search by sending a message
                            const query = msg.youtubeSearchQuery || 'vídeo interessante';
                            handleSend(`Por favor, busque no YouTube por: ${query}`);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-all shadow-sm hover:bg-red-50 dark:hover:bg-red-900/10 group/btn"
                        >
                          <Search className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          <span className="font-medium text-xs">Pesquisar "{msg.youtubeSearchQuery}" no YouTube</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                )}
                
                {msg.role === 'model' && !msg.isError && (
                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="absolute -right-2 -bottom-2 p-1.5 bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm select-none"
                    title="Copiar texto"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}

                {msg.isError && (
                  <button
                    onClick={() => handleRetry(msg.id)}
                    className="mt-3 flex items-center text-sm font-medium text-red-600 dark:text-red-400 hover:opacity-80 transition-opacity"
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5" />
                    Tentar Novamente
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
             <motion.div
             key="typing-indicator"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="flex w-full justify-start"
           >
             <div className="max-w-[85%] glass-panel text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
               {streamingMessage ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {streamingMessage}
                    </ReactMarkdown>
                  </div>
               ) : (
                 <div className="flex space-x-1.5 items-center h-6">
                   <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                   <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                   <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                 </div>
               )}
             </div>
           </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="glass-panel p-4 border-t border-gray-200/50 dark:border-gray-800/50 shrink-0 z-10">
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 w-20 h-20">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
            <button
              onClick={removeSelectedImage}
              className="absolute -top-2 -right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        
        <div className="flex items-end bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-800/50 focus-within:ring-2 focus-within:ring-[var(--color-accent)] transition-all p-1">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-[#4A5568] dark:hover:text-[#718096] transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Mensagem para ${persona}...`}
            className="flex-1 max-h-32 min-h-[44px] py-3 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
            rows={1}
            style={{ height: 'auto' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
          
          <button
            onClick={() => handleSend()}
            disabled={(!input.trim() && !selectedImage) || isTyping}
            className={cn(
              "p-3 m-1 rounded-xl transition-all",
              (input.trim() || selectedImage)
                ? "accent-bg text-white hover:opacity-90" 
                : "text-gray-400 bg-transparent"
            )}
          >
            {(input.trim() || selectedImage) ? <Send className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
