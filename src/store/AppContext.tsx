import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db, saveConversation, saveMessage, getConversations, getMessages, clearAllHistory } from '../services/db';

export type Screen = 'onboarding' | 'loading-adaptation' | 'home' | 'chat' | 'tools' | 'settings';
export type Persona = 'Aura' | 'Atlas';

export interface ThemeSettings {
  accentColor: string;
  backgroundColor?: string;
  glassOpacity: number;
  glassBlur: number;
  fontFamily: string;
  deviceBrand: 'default' | 'iphone' | 'samsung' | 'pixel';
}

export const defaultThemeSettings: ThemeSettings = {
  accentColor: '#3b82f6', // blue-500
  backgroundColor: undefined,
  glassOpacity: 0.1,
  glassBlur: 10,
  fontFamily: 'Inter',
  deviceBrand: 'default',
};

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
  imageUrl?: string;
  imageMimeType?: string;
  youtubeVideoId?: string;
  youtubeSearchQuery?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  expertId?: string;
}

export interface UserProfile {
  name: string;
  photoUrl: string;
  memory: string;
  phoneModel?: string;
  gender?: 'male' | 'female';
}

export interface CustomExpert {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon?: string;
}

interface AppContextType {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  createNewConversation: (initialMessage?: Message, expertId?: string) => string;
  updateConversationTitle: (id: string, title: string) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  persona: Persona;
  setPersona: (persona: Persona) => void;
  clearHistory: () => void;
  youtubeVideoId: string | null;
  setYoutubeVideoId: (id: string | null) => void;
  isYoutubePlayerVisible: boolean;
  setIsYoutubePlayerVisible: (visible: boolean) => void;
  videoSummary: string | null;
  setVideoSummary: (summary: string | null) => void;
  isSummarizing: boolean;
  setIsSummarizing: (isSummarizing: boolean) => void;
  themeSettings: ThemeSettings;
  setThemeSettings: (settings: ThemeSettings) => void;
  openRouterKey: string;
  setOpenRouterKey: (key: string) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  geminiKeys: { id: string; name: string; key: string }[];
  addGeminiKey: (name: string, key: string) => void;
  removeGeminiKey: (id: string) => void;
  useGeminiKey: (id: string) => void;
  customExperts: CustomExpert[];
  addCustomExpert: (expert: CustomExpert) => void;
  removeCustomExpert: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('aura_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error parsing aura_user from localStorage', e);
      return null;
    }
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Load initial data from Dexie
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedConvs = await getConversations();
        if (savedConvs && savedConvs.length > 0) {
          // Load messages for the most recent conversation if needed
          const fullConvs = await Promise.all(savedConvs.map(async (c) => ({
            ...c,
            messages: (await getMessages(c.id)) || []
          })));
          setConversations(fullConvs);
        }
      } catch (e) {
        console.error('Error loading data from Dexie:', e);
      }
    };
    loadData();
  }, []);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('aura_theme');
      return (saved as 'light' | 'dark') || 'light';
    } catch (e) {
      console.error('Error reading aura_theme from localStorage', e);
      return 'light';
    }
  });
  const [persona, setPersona] = useState<Persona>(() => {
    try {
      const saved = localStorage.getItem('aura_persona');
      return (saved as Persona) || 'Aura';
    } catch (e) {
      console.error('Error reading aura_persona from localStorage', e);
      return 'Aura';
    }
  });
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [isYoutubePlayerVisible, setIsYoutubePlayerVisible] = useState(false);
  const [videoSummary, setVideoSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [openRouterKey, setOpenRouterKey] = useState<string>(() => {
    try {
      return localStorage.getItem('aura_openrouter_api_key') || '';
    } catch (e) {
      console.error('Error reading aura_openrouter_api_key from localStorage', e);
      return '';
    }
  });
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('aura_gemini_api_key') || '';
    } catch (e) {
      console.error('Error reading aura_gemini_api_key from localStorage', e);
      return '';
    }
  });
  const [geminiKeys, setGeminiKeys] = useState<{ id: string; name: string; key: string }[]>(() => {
    try {
      const saved = localStorage.getItem('aura_gemini_keys_vault');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error parsing aura_gemini_keys_vault from localStorage', e);
      return [];
    }
  });

  const [customExperts, setCustomExperts] = useState<CustomExpert[]>(() => {
    try {
      const saved = localStorage.getItem('aura_custom_experts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error parsing aura_custom_experts from localStorage', e);
      return [];
    }
  });

  const addCustomExpert = (expert: CustomExpert) => {
    const updated = [...customExperts, expert];
    setCustomExperts(updated);
    localStorage.setItem('aura_custom_experts', JSON.stringify(updated));
  };

  const removeCustomExpert = (id: string) => {
    const updated = customExperts.filter(e => e.id !== id);
    setCustomExperts(updated);
    localStorage.setItem('aura_custom_experts', JSON.stringify(updated));
  };

  const addGeminiKey = (name: string, key: string) => {
    const newKey = { id: uuidv4(), name, key };
    const updated = [...geminiKeys, newKey];
    setGeminiKeys(updated);
    localStorage.setItem('aura_gemini_keys_vault', JSON.stringify(updated));
    
    // If it's the first key or current key is empty, use it automatically
    if (!geminiApiKey) {
      setGeminiApiKey(key);
    }
  };

  const removeGeminiKey = (id: string) => {
    const updated = geminiKeys.filter(k => k.id !== id);
    setGeminiKeys(updated);
    localStorage.setItem('aura_gemini_keys_vault', JSON.stringify(updated));
  };

  const useGeminiKey = (id: string) => {
    const keyObj = geminiKeys.find(k => k.id === id);
    if (keyObj) {
      setGeminiApiKey(keyObj.key);
    }
  };

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    try {
      const saved = localStorage.getItem('aura_theme_settings');
      return saved ? JSON.parse(saved) : defaultThemeSettings;
    } catch (e) {
      console.error('Error parsing aura_theme_settings from localStorage', e);
      return defaultThemeSettings;
    }
  });

  useEffect(() => {
    try {
      if (user && user.phoneModel && user.gender) {
        localStorage.setItem('aura_user', JSON.stringify(user));
        if (currentScreen === 'onboarding') {
          setCurrentScreen('loading-adaptation');
        }
      } else {
        if (!user) {
          localStorage.removeItem('aura_user');
        }
        setCurrentScreen('onboarding');
      }
    } catch (e) {
      console.error('Error saving user to localStorage', e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Error saving theme to localStorage', e);
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_persona', persona);
    } catch (e) {
      console.error('Error saving persona to localStorage', e);
    }
  }, [persona]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_openrouter_api_key', openRouterKey);
    } catch (e) {
      console.error('Error saving openrouter_api_key to localStorage', e);
    }
  }, [openRouterKey]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_gemini_api_key', geminiApiKey);
    } catch (e) {
      console.error('Error saving gemini_api_key to localStorage', e);
    }
  }, [geminiApiKey]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_theme_settings', JSON.stringify(themeSettings));
      
      // Apply theme settings to CSS variables
      document.documentElement.style.setProperty('--color-accent', themeSettings.accentColor);
      if (themeSettings.backgroundColor) {
        document.documentElement.style.setProperty('--bg-color', themeSettings.backgroundColor);
      } else {
        document.documentElement.style.removeProperty('--bg-color');
      }
      document.documentElement.style.setProperty('--glass-opacity', themeSettings.glassOpacity.toString());
      document.documentElement.style.setProperty('--glass-blur', `${themeSettings.glassBlur}px`);
      document.documentElement.style.setProperty('--font-sans', `"${themeSettings.fontFamily}", ui-sans-serif, system-ui, sans-serif`);
      
      // Apply device brand classes
      const brands = ['iphone', 'samsung', 'pixel'];
      brands.forEach(brand => document.documentElement.classList.remove(`brand-${brand}`));
      if (themeSettings.deviceBrand !== 'default') {
        document.documentElement.classList.add(`brand-${themeSettings.deviceBrand}`);
      }
    } catch (e) {
      console.error('Error saving theme settings to localStorage', e);
    }
  }, [themeSettings]);

  const createNewConversation = (initialMessage?: Message, expertId?: string) => {
    const newId = uuidv4();
    const newConv: Conversation = {
      id: newId,
      title: 'Nova Conversa',
      messages: initialMessage ? [initialMessage] : [],
      updatedAt: Date.now(),
      expertId: expertId || 'geral',
    };
    
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    
    // Persist to Dexie
    saveConversation(newConv);
    if (initialMessage) saveMessage(newId, initialMessage);
    
    return newId;
  };

  const addMessage = (conversationId: string, message: Message) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          let title = conv.title;
          if (conv.messages.length === 0 && message.role === 'user') {
            title = message.text.slice(0, 30) + (message.text.length > 30 ? '...' : '');
          }
          const updatedConv = {
            ...conv,
            title,
            messages: [...conv.messages, message],
            updatedAt: Date.now(),
          };
          
          // Persist to Dexie
          saveConversation(updatedConv);
          saveMessage(conversationId, message);
          
          return updatedConv;
        }
        return conv;
      }).sort((a, b) => b.updatedAt - a.updatedAt)
    );
  };

  const removeMessage = (conversationId: string, messageId: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages.filter(m => m.id !== messageId),
          };
        }
        return conv;
      })
    );
  };

  const updateConversationTitle = (id: string, title: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, title } : conv))
    );
  };

  const clearHistory = () => {
    setConversations([]);
    setActiveConversationId(null);
    clearAllHistory();
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        user,
        setUser,
        conversations,
        activeConversationId,
        setActiveConversationId,
        addMessage,
        createNewConversation,
        updateConversationTitle,
        removeMessage,
        theme,
        setTheme,
        persona,
        setPersona,
        clearHistory,
        youtubeVideoId,
        setYoutubeVideoId,
        isYoutubePlayerVisible,
        setIsYoutubePlayerVisible,
        videoSummary,
        setVideoSummary,
        isSummarizing,
        setIsSummarizing,
        themeSettings,
        setThemeSettings,
        openRouterKey,
        setOpenRouterKey,
        geminiApiKey,
        setGeminiApiKey,
        geminiKeys,
        addGeminiKey,
        removeGeminiKey,
        useGeminiKey,
        customExperts,
        addCustomExpert,
        removeCustomExpert,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
