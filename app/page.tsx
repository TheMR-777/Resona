'use client';

import React, { useEffect } from 'react';
import { Scene } from '@/components/Scene';
import { ModeGrid } from '@/components/ModeGrid';
import { Controls } from '@/components/Controls';
import { Activity } from 'lucide-react';

export default function Page() {
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('THREE.Clock')) return;
      originalWarn(...args);
    };
    return () => {
      console.warn = originalWarn;
    };
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-slate-950 text-white font-sans">
      {/* 3D Scene Background */}
      <Scene />
      
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 pointer-events-none z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center backdrop-blur-md">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white/90">Resona</h1>
            <p className="text-xs text-white/50">Interactive Wave Canvas</p>
          </div>
        </div>
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-auto">
        <Controls />
      </div>

      {/* Mode Grid Overlay */}
      <div className="absolute bottom-6 right-6 z-10 pointer-events-auto">
        <ModeGrid />
      </div>
      
      {/* Instructions Overlay */}
      <div className="absolute top-6 right-6 z-10 pointer-events-none text-right">
        <p className="text-xs text-white/40 mb-1">Click membrane to poke</p>
        <p className="text-xs text-white/40 mb-1">Drag to rotate camera</p>
        <p className="text-xs text-white/40">Scroll to zoom</p>
      </div>
    </main>
  );
}
