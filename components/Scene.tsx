'use client';

import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Membrane3D } from './Membrane3D';
import { useStore } from '@/lib/store';
import { AudioEngine } from './AudioEngine';

export function Scene() {
  const updateModeAmplitudes = useStore(state => state.updateModeAmplitudes);
  
  // Damping loop
  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;
    
    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      updateModeAmplitudes(delta);
      frameId = requestAnimationFrame(loop);
    };
    
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [updateModeAmplitudes]);

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <AudioEngine />
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, -2.5, 2]} fov={45} />
        <OrbitControls 
          enablePan={false} 
          minDistance={1} 
          maxDistance={5} 
          maxPolarAngle={Math.PI / 2 + 0.1} 
        />
        
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#e0e7ff" />
        <pointLight position={[-5, -5, 2]} intensity={0.8} color="#818cf8" />
        
        <Membrane3D />
        
        <Environment preset="city" />
        
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.8} 
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
