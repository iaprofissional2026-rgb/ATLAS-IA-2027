import React, { useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { X, Minimize2, Maximize2, FileText, Headphones, GripHorizontal, RotateCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../store/AppContext';
import { summarizeYouTubeVideo } from '../services/ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function FloatingYouTubePlayer() {
  const { 
    youtubeVideoId, 
    isYoutubePlayerVisible, 
    setIsYoutubePlayerVisible, 
    setYoutubeVideoId, 
    user, 
    persona,
    videoSummary,
    setVideoSummary,
    isSummarizing,
    setIsSummarizing
  } = useAppContext();
  const [isMinimized, setIsMinimized] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showSummaryOverlay, setShowSummaryOverlay] = useState(false);

  const isRotated = rotation === 90 || rotation === 270;

  // Adapt size based on phone model (simulated)
  const getBaseWidth = () => {
    if (!user?.phoneModel) return 320;
    const model = user.phoneModel.toLowerCase();
    
    // Specific models requested by user
    if (model.includes('a03core') || model.includes('a03 core')) return 300; // Small/Budget
    if (model.includes('g23')) return 340; // Mid
    if (model.includes('c71')) return 360; // Large
    
    // General categories
    if (model.includes('ultra') || model.includes('max') || model.includes('plus') || model.includes('pro')) return 380;
    if (model.includes('mini') || model.includes('core') || model.includes('lite')) return 300;
    return 340; // Default
  };

  const baseWidth = getBaseWidth();
  const baseHeight = baseWidth * (9 / 16);

  const closePlayer = () => {
    setIsYoutubePlayerVisible(false);
    setYoutubeVideoId(null);
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      controls: 1,
      showinfo: 0,
      iv_load_policy: 3,
    },
  };

  const handleSummarize = async () => {
    if (!youtubeVideoId) return;
    setIsSummarizing(true);
    setShowSummaryOverlay(true);
    try {
      const summary = await summarizeYouTubeVideo(youtubeVideoId, persona);
      setVideoSummary(summary);
    } catch (error) {
      console.error('Error summarizing video:', error);
      setVideoSummary('Ocorreu um erro ao tentar resumir o vídeo. Tente novamente.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleAudio = () => {
    alert('Modo apenas áudio em desenvolvimento. O vídeo continuará tocando em segundo plano.');
    setIsMinimized(true);
  };

  return (
    <AnimatePresence>
      {isYoutubePlayerVisible && youtubeVideoId && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            rotate: rotation
          }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="absolute z-50 flex flex-col glass-panel border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl overflow-hidden"
          style={{
            right: '16px',
            bottom: '80px', // Positioned above the bottom nav bar (approx 64px)
            width: isMinimized 
              ? '280px' 
              : (isRotated ? `${baseHeight}px` : `${baseWidth}px`),
            touchAction: 'none'
          }}
        >
          {/* Header / Drag Handle */}
          <div className="flex items-center justify-between px-3 py-2 bg-white/30 dark:bg-black/30 border-b border-gray-200/50 dark:border-gray-700/50 cursor-grab active:cursor-grabbing">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
              <GripHorizontal className="w-4 h-4" />
              <span className="text-xs font-medium truncate w-24">YouTube Player</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={rotate}
                className="p-1 hover:bg-white/50 dark:hover:bg-white/10 rounded-md transition-colors text-gray-600 dark:text-gray-300"
                title="Girar Tela"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/50 dark:hover:bg-white/10 rounded-md transition-colors text-gray-600 dark:text-gray-300"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={closePlayer}
                className="p-1 hover:bg-red-500/20 hover:text-red-600 dark:hover:bg-red-500/30 dark:hover:text-red-400 rounded-md transition-colors text-gray-600 dark:text-gray-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Player Area */}
          <div 
            className="bg-black transition-all duration-300 overflow-hidden flex items-center justify-center relative"
            style={{ 
              height: isMinimized ? 0 : (isRotated ? baseWidth : baseHeight),
              width: isMinimized ? 0 : (isRotated ? baseHeight : baseWidth)
            }}
          >
            <div className="absolute inset-0 w-full h-full">
              <YouTube videoId={youtubeVideoId} opts={opts} className="w-full h-full" />
            </div>

            {/* Summary Overlay */}
            <AnimatePresence>
              {showSummaryOverlay && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-md z-20 flex flex-col p-4 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <h3 className="text-white font-bold text-sm flex items-center">
                      <FileText className="w-4 h-4 mr-2 accent-text" />
                      Resumo da IA
                    </h3>
                    <button 
                      onClick={() => setShowSummaryOverlay(false)}
                      className="p-1 hover:bg-white/10 rounded-full text-white/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 text-white/90 text-xs leading-relaxed">
                    {isSummarizing ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="w-6 h-6 animate-spin accent-text" />
                        <p className="animate-pulse">Analisando conteúdo...</p>
                      </div>
                    ) : (
                      <div className="prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {videoSummary || ''}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-around p-2 bg-white/30 dark:bg-black/30 border-t border-gray-200/50 dark:border-gray-700/50">
            <button 
              onClick={handleSummarize}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 text-xs font-medium text-gray-700 dark:text-gray-200 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 accent-text" />
              <span>Resumir</span>
            </button>
            <div className="w-px h-4 bg-gray-300/50 dark:bg-gray-600/50"></div>
            <button 
              onClick={handleAudio}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 text-xs font-medium text-gray-700 dark:text-gray-200 transition-colors"
            >
              <Headphones className="w-3.5 h-3.5 accent-text" />
              <span>Áudio</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
