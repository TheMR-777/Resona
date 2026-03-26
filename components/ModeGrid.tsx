'use client';

import React from 'react';
import { useStore, BESSEL_ROOTS } from '@/lib/store';
import { cn } from '@/lib/utils';

export function ModeGrid() {
  const activeModes = useStore(state => state.activeModes);
  const toggleMode = useStore(state => state.toggleMode);
  const clearModes = useStore(state => state.clearModes);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider">Harmonics (n, m)</h3>
        <button 
          onClick={clearModes}
          className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
        >
          Clear All
        </button>
      </div>
      
      <div className="grid grid-cols-6 gap-2">
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
                      ? "bg-indigo-500/20 border border-indigo-500/50 text-indigo-200" 
                      : "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10"
                  )}
                  title={`Mode (${n}, ${m})`}
                >
                  {/* Amplitude indicator background */}
                  {isActive && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-indigo-500/30 transition-all duration-75"
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
    </div>
  );
}
