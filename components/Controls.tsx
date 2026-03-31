'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore, THEMES, ThemeName, SurfaceStyle } from '@/lib/store';
import { Volume2, VolumeX, Settings2, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface CustomSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  theme: any;
  label: string;
}

function CustomSelect<T extends string>({ value, onChange, options, theme, label }: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 flex-1 relative" ref={containerRef}>
      <div className="flex justify-between text-xs text-white/60 px-1">
        <span>{label}</span>
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white flex items-center justify-between transition-all outline-none group",
          isOpen ? `ring-2 ${theme.accent.ring} border-transparent bg-white/10` : "hover:bg-white/10 hover:border-white/20"
        )}
      >
        <span className="truncate font-medium">{selectedOption?.label}</span>
        <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform duration-300", isOpen && "rotate-180 text-white")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-1.5"
          >
            <div className="max-h-60 overflow-y-auto scrollbar-hide space-y-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center justify-between group",
                    value === opt.value 
                      ? `${theme.accent.muted} text-white font-medium` 
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Controls() {
  const [isExpanded, setIsExpanded] = useState(true);
  const themeName = useStore(state => state.theme);
  const theme = THEMES[themeName];
  
  const speed = useStore(state => state.speed);
  const setSpeed = useStore(state => state.setSpeed);
  const damping = useStore(state => state.damping);
  const setDamping = useStore(state => state.setDamping);
  const resolution = useStore(state => state.resolution);
  const setResolution = useStore(state => state.setResolution);
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
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl w-80 overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white/90 flex items-center gap-2">
          <Settings2 className={`w-5 h-5 ${theme.accent.text} shrink-0`} />
          <span>Simulation</span>
        </h2>
        
        <div className="flex gap-2 items-center ml-2">
          <button
            onClick={toggleAdvancedMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              advancedMode 
                ? theme.accent.muted
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
                ? theme.accent.muted
                : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/10'
            }`}
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-white/5 text-white/50 border border-transparent hover:bg-white/10 transition-colors flex items-center justify-center"
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
            <div className="px-4 pb-4 space-y-4">
              <div className="flex gap-3">
                <CustomSelect
                  label="Theme"
                  value={themeName}
                  onChange={(val) => setTheme(val as ThemeName)}
                  options={Object.entries(THEMES).map(([k, v]) => ({ value: k as ThemeName, label: v.name }))}
                  theme={theme}
                />
                <CustomSelect
                  label="Surface"
                  value={surfaceStyle}
                  onChange={(val) => setSurfaceStyle(val as SurfaceStyle)}
                  options={[
                    { value: 'standard', label: 'Standard' },
                    { value: 'wireframe', label: 'Wireframe' },
                    { value: 'glass', label: 'Frosted Glass' },
                    { value: 'clay', label: 'Matte Clay' },
                    { value: 'neon', label: 'Neon Glow' },
                  ]}
                  theme={theme}
                />
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
            className={`w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer ${theme.accent.slider}`}
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
            className={`w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer ${theme.accent.slider}`}
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
            className={`w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer ${theme.accent.slider}`}
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
            className={`w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer ${theme.accent.slider}`}
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
              className={`w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer ${theme.accent.slider}`}
            />
          </div>
        )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
