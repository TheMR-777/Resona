'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore, besselJ, BESSEL_ROOTS, Mode, THEMES } from '@/lib/store';

export function Membrane3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  
  const resolution = useStore(state => state.resolution);
  const activeModes = useStore(state => state.activeModes);
  const updateModeAmplitudes = useStore(state => state.updateModeAmplitudes);
  const speed = useStore(state => state.speed);
  const themeName = useStore(state => state.theme);
  const surfaceStyle = useStore(state => state.surfaceStyle);
  const poke = useStore(state => state.poke);
  const radius = useStore(state => state.radius);
  
  const theme = THEMES[themeName];
  
  const timeRef = useRef(0);

  // Generate Polar Grid Geometry
  const { vertices, indices, uvs, thetas, radii } = useMemo(() => {
    const radialSegments = resolution;
    const angularSegments = resolution * 2;
    
    const vertices = [];
    const indices = [];
    const uvs = [];
    const thetas = [];
    const radii = [];
    
    // Center vertex
    vertices.push(0, 0, 0);
    uvs.push(0.5, 0.5);
    thetas.push(0);
    radii.push(0);
    
    for (let r = 1; r <= radialSegments; r++) {
      const radius = r / radialSegments;
      for (let a = 0; a < angularSegments; a++) {
        const theta = (a / angularSegments) * Math.PI * 2;
        vertices.push(radius * Math.cos(theta), radius * Math.sin(theta), 0);
        uvs.push(0.5 + 0.5 * radius * Math.cos(theta), 0.5 + 0.5 * radius * Math.sin(theta));
        thetas.push(theta);
        radii.push(radius);
      }
    }
    
    // Indices
    for (let a = 0; a < angularSegments; a++) {
      const nextA = (a + 1) % angularSegments;
      indices.push(0, 1 + a, 1 + nextA);
    }
    
    for (let r = 1; r < radialSegments; r++) {
      const ringStart = 1 + (r - 1) * angularSegments;
      const nextRingStart = 1 + r * angularSegments;
      for (let a = 0; a < angularSegments; a++) {
        const nextA = (a + 1) % angularSegments;
        const v1 = ringStart + a;
        const v2 = ringStart + nextA;
        const v3 = nextRingStart + a;
        const v4 = nextRingStart + nextA;
        
        indices.push(v1, v2, v3);
        indices.push(v2, v4, v3);
      }
    }
    
    return { 
      vertices: new Float32Array(vertices), 
      indices: new Uint16Array(indices), 
      uvs: new Float32Array(uvs),
      thetas: new Float32Array(thetas),
      radii: new Float32Array(radii)
    };
  }, [resolution]);

  // Precompute shapes for active modes
  const activeModeKeys = activeModes.map(m => `${m.n},${m.m}`).join('|');
  const modeShapesRef = useRef(new Map<string, Float32Array>());
  
  useEffect(() => {
    const shapes = modeShapesRef.current;
    
    activeModes.forEach(mode => {
      const key = `${mode.n},${mode.m}`;
      if (!shapes.has(key)) {
        const shape = new Float32Array(vertices.length / 3);
        const root = BESSEL_ROOTS[mode.n][mode.m - 1];
        
        for (let i = 0; i < shape.length; i++) {
          const r = radii[i];
          const theta = thetas[i];
          shape[i] = besselJ(mode.n, root * r) * Math.cos(mode.n * theta);
        }
        shapes.set(key, shape);
      }
    });
  }, [activeModeKeys, activeModes, vertices.length, radii, thetas]);

  useFrame((state, delta) => {
    // Update amplitudes first
    updateModeAmplitudes(delta);
    
    if (!geometryRef.current) return;
    
    timeRef.current += delta * speed;
    const t = timeRef.current;
    
    const positions = geometryRef.current.attributes.position.array as Float32Array;
    const numVertices = positions.length / 3;
    
    // Reset Z
    for (let i = 0; i < numVertices; i++) {
      positions[i * 3 + 2] = 0;
    }
    
    // Sum active modes
    const modeShapes = modeShapesRef.current;
    activeModes.forEach(mode => {
      const key = `${mode.n},${mode.m}`;
      const shape = modeShapes.get(key);
      if (shape) {
        // frequency is relative to fundamental.
        // Let's scale it so it looks nice visually.
        const angularFreq = mode.frequency * 5; 
        const factor = mode.amplitude * Math.cos(angularFreq * t + mode.phase);
        
        for (let i = 0; i < numVertices; i++) {
          positions[i * 3 + 2] += shape[i] * factor * 0.5; // Scale down amplitude visually
        }
      }
    });
    
    geometryRef.current.attributes.position.needsUpdate = true;
    geometryRef.current.computeVertexNormals();
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.uv) {
      // Map UV back to polar coordinates
      const x = (e.uv.x - 0.5) * 2;
      const y = (e.uv.y - 0.5) * 2;
      const r = Math.sqrt(x*x + y*y);
      const theta = Math.atan2(y, x);
      
      if (r <= 1) {
        // poke(r, theta);
        // For simplicity, let's just add a random mode or specific mode based on click
        // Actually, let's implement a simple poke that adds energy to existing modes
        const { activeModes, toggleMode } = useStore.getState();
        if (activeModes.length === 0) {
          toggleMode(0, 1); // Add fundamental if empty
        } else {
          // Boost amplitude of all active modes
          useStore.setState({
            activeModes: activeModes.map(m => ({ ...m, amplitude: Math.min(2, m.amplitude + 0.5) }))
          });
        }
      }
    }
  };

  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      scale={[radius, radius, radius]}
      onPointerDown={handlePointerDown}
    >
      <bufferGeometry ref={geometryRef} key={resolution}>
        <bufferAttribute
          attach="attributes-position"
          args={[vertices, 3]}
        />
        <bufferAttribute
          attach="index"
          args={[indices, 1]}
        />
        <bufferAttribute
          attach="attributes-uv"
          args={[uvs, 2]}
        />
      </bufferGeometry>
      
      {surfaceStyle === 'standard' && (
        <meshStandardMaterial 
          color={theme.surfaceColor} 
          roughness={0.15} 
          metalness={0.85} 
          envMapIntensity={1.2}
          side={THREE.DoubleSide}
        />
      )}
      {surfaceStyle === 'wireframe' && (
        <meshBasicMaterial 
          color={theme.wireframeColor} 
          wireframe={true} 
          side={THREE.DoubleSide}
        />
      )}
      {surfaceStyle === 'glass' && (
        <meshPhysicalMaterial 
          color={theme.surfaceColor} 
          transmission={1} 
          opacity={1} 
          metalness={0.1} 
          roughness={0.05} 
          ior={1.5} 
          thickness={0.5} 
          specularIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.5}
          side={THREE.DoubleSide} 
          transparent 
        />
      )}
      {surfaceStyle === 'clay' && (
        <meshStandardMaterial 
          color={theme.surfaceColor} 
          roughness={1} 
          metalness={0} 
          envMapIntensity={0.2}
          side={THREE.DoubleSide} 
        />
      )}
      {surfaceStyle === 'neon' && (
        <meshStandardMaterial 
          color="#ffffff" 
          emissive={theme.surfaceColor} 
          emissiveIntensity={2.5} 
          roughness={0.4}
          metalness={0.8}
          toneMapped={false} 
          side={THREE.DoubleSide} 
        />
      )}
    </mesh>
  );
}
