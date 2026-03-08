import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Edit3, Camera, ArrowRight, Check, Copy, Youtube } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useAppContext } from '../store/AppContext';
import { generateToolResponse } from '../services/ai';

export function Tools() {
  const { user, persona, setYoutubeVideoId, setIsYoutubePlayerVisible } = useAppContext();
  const [activeTool, setActiveTool] = useState<'translator' | 'reviewer' | 'reader' | 'youtube' | null>(null);
  
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const tools = [
    {
      id: 'translator',
      icon: Globe,
      title: 'Tradutor Universal',
      description: 'Traduza textos para qualquer idioma instantaneamente.',
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'reviewer',
      icon: Edit3,
      title: 'Revisor de Textos',
      description: 'Corrija gramática e ajuste o tom de voz do seu texto.',
      color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'youtube',
      icon: Youtube,
      title: 'YouTube Study',
      description: 'Pesquise e assista vídeos com auxílio da IA.',
      color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    },
    {
      id: 'reader',
      icon: Camera,
      title: 'Leitor de Imagens',
      description: 'Extraia e explique textos de fotos ou documentos.',
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    },
  ];

  const handleToolAction = async () => {
    if (!inputText.trim()) return;

    if (activeTool === 'youtube') {
      // Check if it's a URL or a search term
      const youtubeUrlMatch = inputText.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (youtubeUrlMatch) {
        setYoutubeVideoId(youtubeUrlMatch[1]);
        setIsYoutubePlayerVisible(true);
        setOutputText('Vídeo carregado no player flutuante! Você pode assisti-lo agora.');
        return;
      }
    }

    setIsLoading(true);
    setOutputText('');
    setCopied(false);

    let prompt = '';
    if (activeTool === 'translator') {
      prompt = `Atue como um tradutor profissional. Identifique o idioma do texto abaixo e traduza para o inglês (se não for inglês) ou para o português (se for inglês). Se o usuário especificar o idioma de destino no texto, siga a instrução. Texto: "${inputText}"`;
    } else if (activeTool === 'reviewer') {
      prompt = `Atue como um revisor profissional. Corrija erros gramaticais, melhore a fluidez e o tom do seguinte texto, mantendo a intenção original. Forneça apenas o texto revisado. Texto: "${inputText}"`;
    } else if (activeTool === 'reader') {
      prompt = `Extraia e explique o texto da imagem descrita ou do texto fornecido. Como não posso enviar imagens diretamente aqui na interface de demonstração, analise este texto como se fosse extraído de um documento: "${inputText}"`;
    } else if (activeTool === 'youtube') {
      prompt = `O usuário quer assistir um vídeo sobre: "${inputText}". Use a busca do Google para encontrar o ID de um vídeo relevante no YouTube e responda APENAS com o título do vídeo e uma breve descrição de por que ele é bom. Eu cuidarei da abertura do player.`;
    }

    try {
      const response = await generateToolResponse(prompt, user?.memory || '', user?.name || '', persona);
      setOutputText(response);
    } catch (error) {
      setOutputText('Erro ao processar a solicitação. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full overflow-y-auto p-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <header className="pt-8">
          <h1 className="text-3xl font-semibold tracking-tight">Ferramentas</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Acesse recursos rápidos da Aura.</p>
        </header>

        {!activeTool ? (
          <div className="grid grid-cols-1 gap-4">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as any)}
                className="flex items-start p-5 glass-panel rounded-2xl hover:shadow-md transition-all text-left group"
              >
                <div className={`p-3 rounded-xl mr-4 ${tool.color}`}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-[var(--color-accent)] transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <button
              onClick={() => {
                setActiveTool(null);
                setInputText('');
                setOutputText('');
              }}
              className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center font-medium"
            >
              <ArrowRight className="w-4 h-4 rotate-180 mr-1" />
              Voltar para Ferramentas
            </button>

            <div className="glass-panel rounded-2xl p-5 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                {(() => {
                  const tool = tools.find(t => t.id === activeTool);
                  if (!tool) return null;
                  const Icon = tool.icon;
                  return <Icon className="w-5 h-5 mr-2 accent-text" />;
                })()}
                {tools.find(t => t.id === activeTool)?.title}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {activeTool === 'reader' ? 'Descreva a imagem ou cole o texto' : 'Texto de entrada'}
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full h-32 p-3 bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] outline-none resize-none text-gray-900 dark:text-gray-100"
                    placeholder="Digite ou cole aqui..."
                  />
                </div>

                <button
                  onClick={handleToolAction}
                  disabled={!inputText.trim() || isLoading}
                  className="w-full py-3 accent-bg text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Processar'
                  )}
                </button>

                {(outputText || isLoading) && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Resultado
                      </label>
                      {outputText && (
                        <button
                          onClick={handleCopy}
                          className="text-xs accent-text font-medium flex items-center hover:opacity-80 select-none"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                          {copied ? 'Copiado' : 'Copiar'}
                        </button>
                      )}
                    </div>
                    <div className="w-full min-h-[8rem] p-4 bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100">
                      {isLoading ? (
                        <div className="flex space-x-1.5 items-center h-full justify-center opacity-50">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {outputText}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
