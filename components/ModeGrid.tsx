'use client';

import React, { useState } from 'react';
import { useStore, BESSEL_ROOTS, THEMES } from '@/lib/store';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ModeGrid() {
  const [isExpanded, setIsExpanded] = useState(true);
  const themeName = useStore(state => state.theme);
  const theme = THEMES[themeName];
  
  const activeModes = useStore(state => state.activeModes);
  const toggleMode = useStore(state => state.toggleMode);
  const clearModes = useStore(state => state.clearModes);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-4 flex justify-between items-center">
        <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider shrink-0">Harmonics (n, m)</h3>
        <div className="flex items-center gap-2 ml-4">
          <AnimatePresence>
            {isExpanded && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearModes}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors mr-2"
              >
                Clear All
              </motion.button>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-white/5 text-white/50 border border-transparent hover:bg-white/10 transition-colors flex items-center justify-center"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>
        </div>
      </div>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 grid grid-cols-6 gap-2">
        {/* Header row for m */}
        <div className="text-xs text-white/40 text-center">n \ m</div>
        {[1, 2, 3, 4, 5].map(m => (
          <div key={`header-m-${m}`} className="text-xs text-white/40 text-center">{m}</div>
        ))}
        
        {/* Rows for n */}
        {[0, 1, 2, 3, 4, 5].map(n => (
          <React.Fragment key={`row-${n}`}>
            <div className="text-xs text-white/40 flex items-center justify-center">{n}</div>
            {[1, 2, 3, 4, 5].map(m => {
              const isActive = activeModes.some(mode => mode.n === n && mode.m === m);
              const mode = activeModes.find(mode => mode.n === n && mode.m === m);
              const amplitude = mode ? mode.amplitude : 0;
              
              return (
                <button
                  key={`mode-${n}-${m}`}
                  onClick={() => toggleMode(n, m)}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-xs transition-all duration-300 relative overflow-hidden group",
                    isActive 
                      ? `${theme.accent.muted.split(' ')[0]} border ${theme.accent.border}/50 ${theme.accent.text.replace('400', '200')}` 
                      : "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10"
                  )}
                  title={`Mode (${n}, ${m})`}
                >
                  {/* Amplitude indicator background */}
                  {isActive && (
                    <div 
                      className={`absolute bottom-0 left-0 right-0 ${theme.accent.bg}/30 transition-all duration-75`}
                      style={{ height: `${Math.min(100, amplitude * 100)}%` }}
                    />
                  )}
                  <span className="relative z-10 font-mono">
                    {n},{m}
                  </span>
                </button>
              );
            })}
          </React.Fragment>
        ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
