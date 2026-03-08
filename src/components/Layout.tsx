import React from 'react';
import { Home, MessageSquare, Wrench, Settings } from 'lucide-react';
import { useAppContext, Screen } from '../store/AppContext';
import { cn } from '../lib/utils';
import { FloatingYouTubePlayer } from './FloatingYouTubePlayer';

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentScreen, setCurrentScreen } = useAppContext();

  if (currentScreen === 'onboarding') {
    return <>{children}</>;
  }

  const navItems: { id: Screen; icon: React.ElementType; label: string }[] = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'tools', icon: Wrench, label: 'Ferramentas' },
    { id: 'settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <div className="flex flex-col h-[100dvh] w-full md:max-w-md md:mx-auto md:h-[90vh] md:mt-[5vh] md:rounded-[2.5rem] md:border-[8px] md:border-gray-900 md:shadow-2xl [background:var(--bg-color)] text-gray-900 dark:text-gray-100 font-sans transition-all duration-200 overflow-hidden relative">
      <main className="flex-1 overflow-hidden relative w-full">
        {children}
      </main>
      
      <nav className="glass-panel border-t border-gray-200/50 dark:border-gray-800/50 pb-safe z-40 w-full shrink-0">
        <div className="flex justify-around items-center h-16 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  isActive 
                    ? "accent-text" 
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                )}
              >
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
      <FloatingYouTubePlayer />
    </div>
  );
}
