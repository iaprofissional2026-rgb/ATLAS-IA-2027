import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Moon, Sun, Trash2, LogOut, Check, Save, Users, Palette, Type, Droplets, Key, ExternalLink, Smartphone } from 'lucide-react';
import { useAppContext } from '../store/AppContext';

export function Settings() {
  const { 
    user, 
    setUser, 
    theme, 
    setTheme, 
    clearHistory, 
    setCurrentScreen, 
    persona, 
    setPersona, 
    themeSettings, 
    setThemeSettings,
    openRouterKey,
    setOpenRouterKey,
    geminiApiKey,
    setGeminiApiKey,
  } = useAppContext();
  
  const [name, setName] = useState(user?.name || '');
  const [memory, setMemory] = useState(user?.memory || '');
  const [openRouterKeyInput, setOpenRouterKeyInput] = useState(openRouterKey);
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState(geminiApiKey);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const colors = [
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Esmeralda', value: '#10b981' },
    { name: 'Roxo', value: '#8b5cf6' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Laranja', value: '#f97316' },
    { name: 'Cinza', value: '#64748b' },
  ];

  const fonts = [
    { name: 'Inter (Sans)', value: 'Inter' },
    { name: 'Playfair (Serif)', value: 'Playfair Display' },
    { name: 'JetBrains (Mono)', value: 'JetBrains Mono' },
  ];

  const brands = [
    { id: 'default', name: 'Padrão', icon: '📱' },
    { id: 'iphone', name: 'iPhone', icon: '🍎' },
    { id: 'samsung', name: 'Samsung', icon: '🌌' },
    { id: 'pixel', name: 'Pixel', icon: '🎨' },
  ];

  const handleSaveProfile = () => {
    if (!user) return;
    setIsSaving(true);
    
    // Save API Keys
    setOpenRouterKey(openRouterKeyInput);
    setGeminiApiKey(geminiApiKeyInput);

    setTimeout(() => {
      setUser({ ...user, name, memory });
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  const handleLogout = () => {
    setUser(null);
    clearHistory();
    setCurrentScreen('onboarding');
  };

  const handleClearHistory = () => {
    if (window.confirm('Tem certeza que deseja apagar todo o histórico de conversas? Esta ação não pode ser desfeita.')) {
      clearHistory();
      alert('Histórico apagado com sucesso.');
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <header className="pt-8">
          <h1 className="text-3xl font-semibold tracking-tight">Ajustes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Personalize sua experiência com a Aura.</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Identidade da IA
          </h2>
          <div className="glass-panel rounded-2xl p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPersona('Aura')}
                className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                  persona === 'Aura'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className="w-12 h-12 accent-bg rounded-full flex items-center justify-center text-white text-xl font-medium mb-3">
                  A
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Aura</span>
                <span className="text-xs text-gray-500 mt-1">Feminino</span>
              </button>
              
              <button
                onClick={() => setPersona('Atlas')}
                className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                  persona === 'Atlas'
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className="w-12 h-12 bg-gray-600 dark:bg-gray-500 rounded-full flex items-center justify-center text-white text-xl font-medium mb-3">
                  At
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Atlas</span>
                <span className="text-xs text-gray-500 mt-1">Masculino</span>
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Perfil & Memória
          </h2>
          <div className="glass-panel rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                <User className="w-4 h-4 mr-2 accent-text" />
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all text-gray-900 dark:text-gray-100"
                placeholder="Seu nome"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                <span className="w-4 h-4 mr-2 accent-text flex items-center justify-center font-serif italic font-bold">M</span>
                Memória da IA (Crucial)
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                O que a IA deve saber sobre você? (ex: "Sou advogado, falo formalmente, não como glúten")
              </p>
              <textarea
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                className="w-full h-32 p-4 bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                placeholder="Escreva suas preferências aqui..."
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isSaving || (name === user?.name && memory === user?.memory && openRouterKeyInput === openRouterKey && geminiApiKeyInput === geminiApiKey)}
              className="w-full py-3 accent-bg text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center space-x-2"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : saved ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Salvo</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            API & Conexões
          </h2>
          <div className="glass-panel rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                <div className="flex items-center">
                  <Key className="w-4 h-4 mr-2 accent-text" />
                  Chave Gemini API
                </div>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] accent-text flex items-center hover:underline"
                >
                  Obter chave <ExternalLink className="w-2 h-2 ml-1" />
                </a>
              </label>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                Necessária para modelos Gemini e geração de imagens.
              </p>
              <div className="relative">
                <input
                  type="password"
                  value={geminiApiKeyInput}
                  onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all text-gray-900 dark:text-gray-100 font-mono text-xs"
                  placeholder="AIzaSy..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                <div className="flex items-center">
                  <Key className="w-4 h-4 mr-2 accent-text" />
                  Chave OpenRouter API
                </div>
                <a 
                  href="https://openrouter.ai/settings/keys" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] accent-text flex items-center hover:underline"
                >
                  Obter chave <ExternalLink className="w-2 h-2 ml-1" />
                </a>
              </label>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                Opcional: Use sua própria chave se preferir.
              </p>
              <div className="relative">
                <input
                  type="password"
                  value={openRouterKeyInput}
                  onChange={(e) => setOpenRouterKeyInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all text-gray-900 dark:text-gray-100 font-mono text-xs"
                  placeholder="sk-or-v1-..."
                />
              </div>
              {openRouterKey && (
                <div className="mt-2 flex items-center text-[10px] text-green-600 dark:text-green-400">
                  <Check className="w-3 h-3 mr-1" />
                  Chave personalizada ativa.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Aparência & Interface
          </h2>
          <div className="glass-panel rounded-2xl p-5 shadow-sm space-y-6">
            
            {/* Theme Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Modo de Cor
              </label>
              <div className="bg-white/50 dark:bg-black/50 border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-1.5 flex">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center py-2.5 rounded-lg font-medium transition-all ${
                    theme === 'light' 
                      ? 'bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Sun className="w-5 h-5 mr-2" />
                  Claro
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center py-2.5 rounded-lg font-medium transition-all ${
                    theme === 'dark' 
                      ? 'bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Moon className="w-5 h-5 mr-2" />
                  Escuro
                </button>
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Palette className="w-4 h-4 mr-2" />
                Cor de Destaque
              </label>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setThemeSettings({ ...themeSettings, accentColor: color.value })}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                      themeSettings.accentColor === color.value ? 'scale-110 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600 dark:ring-offset-[#1E1E1E]' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {themeSettings.accentColor === color.value && <Check className="w-5 h-5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Palette className="w-4 h-4 mr-2" />
                Cor de Fundo Personalizada
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setThemeSettings({ ...themeSettings, backgroundColor: undefined })}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform border border-gray-200 dark:border-gray-700 ${
                    !themeSettings.backgroundColor ? 'scale-110 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600 dark:ring-offset-[#1E1E1E]' : 'hover:scale-105'
                  }`}
                  title="Padrão"
                >
                  {!themeSettings.backgroundColor && <Check className="w-5 h-5 text-gray-500" />}
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-black"></div>
                </button>
                {[
                  { name: 'Branco Neve', value: '#ffffff' },
                  { name: 'Creme', value: '#fdfbf7' },
                  { name: 'Cinza Suave', value: '#f0f2f5' },
                  { name: 'Azul Noite', value: '#0f172a' },
                  { name: 'Preto Puro', value: '#000000' },
                  { name: 'Verde Musgo', value: '#1a2e1a' },
                  { name: 'Gradiente Suave', value: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' },
                  { name: 'Gradiente Escuro', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
                  { name: 'Gradiente Aurora', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                ].map((bg) => (
                  <button
                    key={bg.value}
                    onClick={() => setThemeSettings({ ...themeSettings, backgroundColor: bg.value })}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform border border-gray-200 dark:border-gray-700 ${
                      themeSettings.backgroundColor === bg.value ? 'scale-110 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600 dark:ring-offset-[#1E1E1E]' : 'hover:scale-105'
                    }`}
                    style={{ background: bg.value }}
                    title={bg.name}
                  >
                    {themeSettings.backgroundColor === bg.value && <Check className="w-5 h-5 text-white mix-blend-difference" />}
                  </button>
                ))}
                <div className="relative">
                  <input
                    type="color"
                    value={themeSettings.backgroundColor || (theme === 'dark' ? '#0a0a0a' : '#f5f5f5')}
                    onChange={(e) => setThemeSettings({ ...themeSettings, backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded-full overflow-hidden border-none p-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Type className="w-4 h-4 mr-2" />
                Tipografia
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {fonts.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => setThemeSettings({ ...themeSettings, fontFamily: font.value })}
                    className={`px-4 py-3 rounded-xl border text-sm transition-all ${
                      themeSettings.fontFamily === font.value
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 font-medium text-gray-900 dark:text-white'
                        : 'border-gray-200/50 dark:border-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/10'
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Device Brand Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Smartphone className="w-4 h-4 mr-2" />
                Estilo do Dispositivo
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => {
                      const newSettings = { ...themeSettings, deviceBrand: brand.id as any };
                      if (brand.id === 'iphone') newSettings.accentColor = '#007AFF';
                      else if (brand.id === 'samsung') newSettings.accentColor = '#1259FF';
                      else if (brand.id === 'pixel') newSettings.accentColor = '#4285F4';
                      setThemeSettings(newSettings);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      themeSettings.deviceBrand === brand.id
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                        : 'border-gray-200/50 dark:border-gray-800/50 hover:bg-white/50 dark:hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xl mb-1">{brand.icon}</span>
                    <span className={`text-[10px] font-medium ${
                      themeSettings.deviceBrand === brand.id ? 'accent-text' : 'text-gray-500'
                    }`}>
                      {brand.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Glassmorphism */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Droplets className="w-4 h-4 mr-2" />
                Transparência (Glassmorphism)
              </label>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Opacidade ({Math.round(themeSettings.glassOpacity * 100)}%)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={themeSettings.glassOpacity}
                    onChange={(e) => setThemeSettings({ ...themeSettings, glassOpacity: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Desfoque ({themeSettings.glassBlur}px)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    step="1"
                    value={themeSettings.glassBlur}
                    onChange={(e) => setThemeSettings({ ...themeSettings, glassBlur: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="space-y-4 pb-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Conta & Dados
          </h2>
          <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={handleClearHistory}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 group"
            >
              <div className="flex items-center text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                <Trash2 className="w-5 h-5 mr-3" />
                <span className="font-medium">Limpar Histórico de Chat</span>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <div className="flex items-center text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                <LogOut className="w-5 h-5 mr-3" />
                <span className="font-medium">Sair da Conta</span>
              </div>
            </button>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
