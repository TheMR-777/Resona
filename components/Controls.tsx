'use client';

import React, { useState } from 'react';
import { useStore, THEMES, ThemeName, SurfaceStyle } from '@/lib/store';
import { Volume2, VolumeX, Settings2, ChevronDown, ChevronUp } from 'lucide-react';

export function Controls() {
  const [isExpanded, setIsExpanded] = useState(true);
  const speed = useStore(state => state.speed);
  const setSpeed = useStore(state => state.setSpeed);
  const damping = useStore(state => state.damping);
  const setDamping = useStore(state => state.setDamping);
  const resolution = useStore(state => state.resolution);
  const setResolution = useStore(state => state.setResolution);
  const theme = useStore(state => state.theme);
  const setTheme = useStore(state => state.setTheme);
  const surfaceStyle = useStore(state => state.surfaceStyle);
  const setSurfaceStyle = useStore(state => state.setSurfaceStyle);
  const soundEnabled = useStore(state => state.soundEnabled);
  const toggleSound = useStore(state => state.toggleSound);
  const baseFrequency = useStore(state => state.baseFrequency);
  const setBaseFrequency = useStore(state => state.setBaseFrequency);
  const radius = useStore(state => state.radius);
  const setRadius = useStore(state => state.setRadius);
  const advancedMode = useStore(state => state.advancedMode);
  const toggleAdvancedMode = useStore(state => state.toggleAdvancedMode);

  return (
    <div className={`bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl w-80 transition-all duration-300 overflow-hidden ${isExpanded ? 'p-6' : 'p-4'}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white/90 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-indigo-400" />
          Simulation
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={toggleAdvancedMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              advancedMode 
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30' 
                : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/10'
            }`}
            title="Toggle Advanced Mode"
          >
            Advanced
          </button>
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled 
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/10'
            }`}
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-white/5 text-white/50 border border-transparent hover:bg-white/10 transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-6">
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex justify-between text-xs text-white/60">
                <span>Theme</span>
              </div>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeName)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              >
                {Object.entries(THEMES).map(([k, v]) => (
                  <option key={k} value={k} className="bg-slate-900">{v.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex justify-between text-xs text-white/60">
                <span>Surface Style</span>
              </div>
              <select
                value={surfaceStyle}
                onChange={(e) => setSurfaceStyle(e.target.value as SurfaceStyle)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              >
                <option value="standard" className="bg-slate-900">Standard</option>
                <option value="wireframe" className="bg-slate-900">Wireframe</option>
                <option value="glass" className="bg-slate-900">Frosted Glass</option>
                <option value="clay" className="bg-slate-900">Matte Clay</option>
                <option value="neon" className="bg-slate-900">Neon Glow</option>
              </select>
            </div>
          </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/60">
            <span>Radius</span>
            <span className="font-mono">{radius.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.5" max="3" step="0.1"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/60">
            <span>Speed</span>
            <span className="font-mono">{speed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.1" max="3" step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/60">
            <span>Damping</span>
            <span className="font-mono">{damping.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0" max="2" step="0.05"
            value={damping}
            onChange={(e) => setDamping(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/60">
            <span>Mesh Resolution</span>
            <span className="font-mono">{resolution}</span>
          </div>
          <input
            type="range"
            min="16" max="128" step="16"
            value={resolution}
            onChange={(e) => setResolution(parseInt(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {soundEnabled && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex justify-between text-xs text-white/60">
              <span>Base Frequency</span>
              <span className="font-mono">{baseFrequency} Hz</span>
            </div>
            <input
              type="range"
              min="55" max="440" step="1"
              value={baseFrequency}
              onChange={(e) => setBaseFrequency(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        )}
        </div>
      )}
    </div>
  );
}
