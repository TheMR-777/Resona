'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Membrane3D } from './Membrane3D';
import { useStore, THEMES } from '@/lib/store';
import { AudioEngine } from './AudioEngine';

export function Scene() {
  const themeName = useStore(state => state.theme);
  const theme = THEMES[themeName];

  return (
    <div className="absolute inset-0">
      <AudioEngine />
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, -2.5, 2]} fov={45} />
        <OrbitControls 
          enablePan={false} 
          minDistance={1} 
          maxDistance={5} 
          maxPolarAngle={Math.PI / 2 + 0.1} 
        />
        
        <ambientLight intensity={theme.ambientIntensity} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color={theme.lightPrimary} />
        <pointLight position={[-5, -5, 2]} intensity={0.8} color={theme.lightSecondary} />
        
        <Membrane3D />
        
        <Suspense fallback={null}>
          <Environment preset={theme.envPreset as any} />
        </Suspense>
        
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={theme.bloomIntensity} 
            radius={0.8} 
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
