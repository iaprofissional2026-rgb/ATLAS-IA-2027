import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, FileText, Mail, Calendar, MessageSquare, ArrowRight, Youtube } from 'lucide-react';
import { useAppContext } from '../store/AppContext';

export function Home() {
  const { user, conversations, setCurrentScreen, createNewConversation, setActiveConversationId, persona } = useAppContext();
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    
    const newId = createNewConversation({
      id: Date.now().toString(),
      role: 'user',
      text: quickInput,
      timestamp: Date.now(),
    });
    setQuickInput('');
    setCurrentScreen('chat');
  };

  const handleSuggestionClick = (prompt: string) => {
    createNewConversation({
      id: Date.now().toString(),
      role: 'user',
      text: prompt,
      timestamp: Date.now(),
    });
    setCurrentScreen('chat');
  };

  const handleResumeConversation = (id: string) => {
    setActiveConversationId(id);
    setCurrentScreen('chat');
  };

  const suggestions = [
    { icon: Youtube, label: 'Estudar com YouTube', prompt: 'Quero estudar sobre este assunto usando vídeos do YouTube: ' },
    { icon: FileText, label: 'Resumir um texto', prompt: 'Por favor, resuma o seguinte texto: ' },
    { icon: Mail, label: 'Criar um e-mail', prompt: 'Me ajude a escrever um e-mail sobre: ' },
    { icon: Calendar, label: 'Planejar meu dia', prompt: 'Crie um cronograma para o meu dia com as seguintes tarefas: ' },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <header className="pt-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Bom dia, <span className="accent-text">{user?.name || 'Visitante'}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Como posso ajudar você hoje?</p>
        </header>

        <form onSubmit={handleQuickSubmit} className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder={`Pergunte algo para ${persona}...`}
            className="w-full pl-12 pr-12 py-4 glass-panel border-none rounded-2xl focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="absolute inset-y-2 right-2 p-2 accent-bg text-white rounded-xl disabled:opacity-50 transition-opacity"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Sugestões
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(s.prompt)}
                className="flex items-center p-4 glass-panel rounded-2xl hover:shadow-sm transition-all text-left"
              >
                <div className="p-2 bg-white/50 dark:bg-black/50 rounded-xl mr-4">
                  <s.icon className="w-5 h-5 accent-text" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{s.label}</span>
              </button>
            ))}
          </div>
        </section>

        {conversations.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Recentes
              </h2>
              <button 
                onClick={() => setCurrentScreen('chat')}
                className="text-xs accent-text font-medium"
              >
                Ver tudo
              </button>
            </div>
            <div className="space-y-3">
              {conversations.slice(0, 5).map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleResumeConversation(conv.id)}
                  className="w-full flex items-center p-4 glass-panel rounded-2xl hover:shadow-sm transition-all text-left"
                >
                  <MessageSquare className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {conv.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conv.updatedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </div>
  );
}
