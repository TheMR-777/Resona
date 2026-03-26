import { useEffect, useRef } from 'react';
import { useStore } from './store';

export function useAudioEngine() {
  const activeModes = useStore(state => state.activeModes);
  const soundEnabled = useStore(state => state.soundEnabled);
  const baseFrequency = useStore(state => state.baseFrequency);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<Record<string, { osc: OscillatorNode, gain: GainNode }>>({});

  useEffect(() => {
    if (soundEnabled && !audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.connect(audioCtxRef.current.destination);
      masterGainRef.current.gain.value = 0.2; // Master volume
    }

    if (!soundEnabled && audioCtxRef.current) {
      // Clean up
      Object.values(oscillatorsRef.current).forEach(({ osc, gain }) => {
        osc.stop();
        osc.disconnect();
        gain.disconnect();
      });
      oscillatorsRef.current = {};
      masterGainRef.current?.disconnect();
      audioCtxRef.current.close();
      audioCtxRef.current = null;
      masterGainRef.current = null;
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (!soundEnabled || !audioCtxRef.current || !masterGainRef.current) return;

    const ctx = audioCtxRef.current;
    const currentKeys = new Set<string>();

    activeModes.forEach(mode => {
      const key = `${mode.n},${mode.m}`;
      currentKeys.add(key);

      if (!oscillatorsRef.current[key]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Use sine wave for pure tone
        osc.type = 'sine';
        osc.frequency.value = baseFrequency * mode.frequency;
        
        osc.connect(gain);
        gain.connect(masterGainRef.current!);
        
        gain.gain.value = 0; // Start silent
        osc.start();
        
        oscillatorsRef.current[key] = { osc, gain };
      }

      // Update amplitude smoothly
      const { gain } = oscillatorsRef.current[key];
      const targetGain = Math.max(0, Math.min(1, mode.amplitude * 0.5)); // Scale down to avoid clipping
      gain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.05);
    });

    // Remove old oscillators
    Object.keys(oscillatorsRef.current).forEach(key => {
      if (!currentKeys.has(key)) {
        const { osc, gain } = oscillatorsRef.current[key];
        
        // Mark as being removed to prevent multiple timeouts
        if (!(osc as any).isStopping) {
          (osc as any).isStopping = true;
          gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
          
          setTimeout(() => {
            if (oscillatorsRef.current[key]) {
              osc.stop();
              osc.disconnect();
              gain.disconnect();
              delete oscillatorsRef.current[key];
            }
          }, 100); // Wait for fade out
        }
      }
    });
  }, [activeModes, soundEnabled, baseFrequency]);
}
