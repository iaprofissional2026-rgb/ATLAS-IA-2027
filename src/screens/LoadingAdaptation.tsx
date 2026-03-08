import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../store/AppContext';

export function LoadingAdaptation() {
  const { user, setCurrentScreen } = useAppContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScreen('home');
    }, 3500);

    return () => clearTimeout(timer);
  }, [setCurrentScreen]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F7F7F8] dark:bg-[#121212] p-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full text-center space-y-8"
      >
        <div className="relative inline-block">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
            className="w-24 h-24 rounded-full border-4 border-dashed border-[var(--color-accent)] opacity-20"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Smartphone className="w-10 h-10 accent-text" />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </motion.div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Adaptando Aura AI</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Otimizando interface e performance para o seu <span className="font-bold text-gray-900 dark:text-white">{user?.phoneModel}</span>.
          </p>
        </div>

        <div className="space-y-3 w-full max-w-[240px] mx-auto">
          <LoadingStep label="Calibrando display..." delay={0.5} />
          <LoadingStep label="Ajustando player de vídeo..." delay={1.5} />
          <LoadingStep label="Sincronizando persona..." delay={2.5} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="flex items-center justify-center space-x-2 text-green-500 font-medium"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Tudo pronto!</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

function LoadingStep({ label, delay }: { label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center space-x-3 text-left"
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ delay, duration: 0.5 }}
          className="w-2 h-2 rounded-full bg-[var(--color-accent)]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ delay, duration: 1, repeat: 1 }}
          className="absolute inset-0 w-2 h-2 rounded-full bg-[var(--color-accent)] blur-sm"
        />
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{label}</span>
    </motion.div>
  );
}
