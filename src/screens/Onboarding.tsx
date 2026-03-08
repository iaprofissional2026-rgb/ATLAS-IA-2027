import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Mail, Apple, Sparkles } from 'lucide-react';
import { useAppContext } from '../store/AppContext';

const slides = [
  {
    title: 'Conheça a Aura AI',
    description: 'Sua assistente pessoal inteligente, projetada para otimizar sua rotina e produtividade.',
    icon: Sparkles,
  },
  {
    title: 'Organize sua Vida',
    description: 'Deixe a Aura planejar seu dia, redigir e-mails e organizar suas ideias com facilidade.',
    icon: Sparkles,
  },
  {
    title: 'Sempre Aprendendo',
    description: 'Aura se adapta ao seu estilo e lembra de suas preferências para um atendimento personalizado.',
    icon: Sparkles,
  },
];

export function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showSetupForm, setShowSetupForm] = useState(true);
  const [showSlides, setShowSlides] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneModel, setPhoneModel] = useState('');
  const [deviceBrand, setDeviceBrand] = useState<'default' | 'iphone' | 'samsung' | 'pixel'>('default');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const { setUser, setThemeSettings, themeSettings, setPersona } = useAppContext();

  const brands = [
    { id: 'iphone', name: 'iPhone', icon: '🍎' },
    { id: 'samsung', name: 'Samsung', icon: '🌌' },
    { id: 'pixel', name: 'Pixel', icon: '🎨' },
    { id: 'default', name: 'Outro', icon: '📱' },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setShowSlides(false);
      setShowEmailForm(false);
    }
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneModel && gender) {
      // Personalize theme and persona based on gender and brand
      const newThemeSettings = { ...themeSettings, deviceBrand };
      
      if (gender === 'female') {
        newThemeSettings.accentColor = '#ec4899'; // pink-500
        setPersona('Aura');
      } else {
        newThemeSettings.accentColor = '#3b82f6'; // blue-500
        setPersona('Atlas');
      }
      
      // Brand specific accents if not default
      if (deviceBrand === 'iphone') {
        newThemeSettings.accentColor = '#007AFF'; // iOS Blue
      } else if (deviceBrand === 'samsung') {
        newThemeSettings.accentColor = '#1259FF'; // Samsung Blue
      } else if (deviceBrand === 'pixel') {
        newThemeSettings.accentColor = '#4285F4'; // Google Blue
      }
      
      setThemeSettings(newThemeSettings);

      setShowSetupForm(false);
      setShowSlides(true);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && phoneModel && gender) {
      setUser({
        name: email.split('@')[0],
        photoUrl: '',
        memory: '',
        phoneModel,
        gender: gender as 'male' | 'female',
      });
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (phoneModel && gender) {
      setUser({
        name: `Usuário ${provider}`,
        photoUrl: '',
        memory: '',
        phoneModel,
        gender: gender as 'male' | 'female',
      });
    } else {
      alert('Por favor, complete a configuração inicial (Marca e Gênero) antes de entrar.');
      setShowSetupForm(true);
      setShowSlides(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F7F8] dark:bg-[#121212] text-gray-900 dark:text-gray-100">
      <div className="flex-1 flex flex-col justify-center items-center p-8 text-center relative">
        <AnimatePresence mode="wait">
          {showSetupForm ? (
            <motion.div
              key="setup-form"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm text-left glass-panel p-8 rounded-3xl shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-2 tracking-tight">Bem-vindo à Aura AI</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Configure seu dispositivo e perfil para começar.</p>

              <form onSubmit={handleSetupSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Marca do Celular</label>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {brands.map((brand) => (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => {
                          setDeviceBrand(brand.id as any);
                          if (brand.id !== 'default') setPhoneModel(brand.name);
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                          deviceBrand === brand.id 
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' 
                            : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'
                        }`}
                      >
                        <span className="text-xl">{brand.icon}</span>
                        <span className="text-[8px] mt-1 font-bold uppercase">{brand.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  <input
                    type="text"
                    required
                    value={phoneModel}
                    onChange={(e) => setPhoneModel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all"
                    placeholder="Modelo específico (ex: iPhone 15 Pro)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Gênero</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-3 rounded-xl border-2 transition-all ${
                        gender === 'male' 
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Masculino
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-3 rounded-xl border-2 transition-all ${
                        gender === 'female' 
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Feminino
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!phoneModel || !gender}
                  className="w-full py-4 mt-4 accent-bg text-white rounded-xl font-bold shadow-lg shadow-[var(--color-accent)]/20 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:shadow-none"
                >
                  Continuar
                </button>
              </form>
            </motion.div>
          ) : showSlides && !showEmailForm ? (
            <motion.div
              key="slides"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-sm"
            >
              <div className="mb-12 flex justify-center">
                <div className="w-24 h-24 accent-bg rounded-3xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </div>

              <div className="h-40">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 className="text-2xl font-semibold mb-4 tracking-tight">{slides[currentSlide].title}</h1>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                      {slides[currentSlide].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex justify-center space-x-2 mb-12">
                {slides.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentSlide ? 'w-6 accent-bg' : 'w-1.5 bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              {currentSlide < slides.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="w-full py-4 accent-bg text-white rounded-xl font-medium flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
                >
                  <span>Continuar</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => handleSocialLogin('Google')}
                    className="w-full py-3.5 glass-panel rounded-xl font-medium flex items-center justify-center space-x-3 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Entrar com Google</span>
                  </button>
                  <button
                    onClick={() => handleSocialLogin('Apple')}
                    className="w-full py-3.5 glass-panel text-gray-900 dark:text-white rounded-xl font-medium flex items-center justify-center space-x-3 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                  >
                    <Apple className="w-5 h-5" />
                    <span>Entrar com Apple</span>
                  </button>
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="w-full py-3.5 bg-transparent text-gray-600 dark:text-gray-400 font-medium flex items-center justify-center space-x-2 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Entrar com E-mail</span>
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="email-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-sm text-left"
            >
              <button
                onClick={() => setShowEmailForm(false)}
                className="mb-8 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center"
              >
                <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                Voltar
              </button>
              
              <h2 className="text-2xl font-semibold mb-6">Entrar com E-mail</h2>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-panel focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-panel focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 mt-4 accent-bg text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Entrar
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
