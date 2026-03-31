import { create } from 'zustand';

export const BESSEL_ROOTS = [
  [2.4048, 5.5201, 8.6537, 11.7915, 14.9309], // n=0
  [3.8317, 7.0156, 10.1735, 13.3237, 16.4706], // n=1
  [5.1356, 8.4172, 11.6198, 14.7960, 17.9598], // n=2
  [6.3802, 9.7610, 13.0152, 16.2235, 19.4094], // n=3
  [7.5883, 11.0647, 14.3725, 17.6160, 20.8269], // n=4
  [8.7715, 12.3386, 15.7002, 18.9801, 22.2178], // n=5
];

function factorial(n: number): number {
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

export function besselJ(n: number, x: number): number {
  if (n < 0) return (n % 2 === 0 ? 1 : -1) * besselJ(-n, x);
  if (x === 0) return n === 0 ? 1 : 0;
  
  let sum = 0;
  let term = Math.pow(x / 2, n) / factorial(n);
  let k = 0;
  
  while (Math.abs(term) > 1e-10 && k < 50) {
    sum += term;
    k++;
    term = -term * (x * x / 4) / (k * (k + n));
  }
  return sum;
}

export type ThemeName = 'midnight' | 'sunset' | 'ocean' | 'monochrome' | 'ethereal';
export type SurfaceStyle = 'standard' | 'wireframe' | 'glass' | 'clay' | 'neon';

export const THEMES: Record<ThemeName, {
  name: string;
  bgClass: string;
  accent: {
    text: string;
    bg: string;
    border: string;
    muted: string;
    ring: string;
    slider: string;
  };
  envPreset: string;
  lightPrimary: string;
  lightSecondary: string;
  surfaceColor: string;
  wireframeColor: string;
  bloomIntensity: number;
  ambientIntensity: number;
}> = {
  midnight: {
    name: 'Midnight',
    bgClass: 'from-slate-950 via-slate-900 to-indigo-950',
    accent: {
      text: 'text-indigo-400',
      bg: 'bg-indigo-500',
      border: 'border-indigo-500',
      muted: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      ring: 'focus:border-indigo-500',
      slider: 'accent-indigo-500',
    },
    envPreset: 'city',
    lightPrimary: '#e0e7ff',
    lightSecondary: '#818cf8',
    surfaceColor: '#4f46e5',
    wireframeColor: '#818cf8',
    bloomIntensity: 1.5,
    ambientIntensity: 0.2,
  },
  sunset: {
    name: 'Sunset',
    bgClass: 'from-orange-950 via-red-950 to-purple-950',
    accent: {
      text: 'text-orange-400',
      bg: 'bg-orange-500',
      border: 'border-orange-500',
      muted: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      ring: 'focus:border-orange-500',
      slider: 'accent-orange-500',
    },
    envPreset: 'sunset',
    lightPrimary: '#ffedd5',
    lightSecondary: '#f43f5e',
    surfaceColor: '#ea580c',
    wireframeColor: '#fb923c',
    bloomIntensity: 2.0,
    ambientIntensity: 0.3,
  },
  ocean: {
    name: 'Ocean',
    bgClass: 'from-cyan-950 via-blue-950 to-teal-950',
    accent: {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500',
      border: 'border-cyan-500',
      muted: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      ring: 'focus:border-cyan-500',
      slider: 'accent-cyan-500',
    },
    envPreset: 'night',
    lightPrimary: '#cffafe',
    lightSecondary: '#06b6d4',
    surfaceColor: '#0ea5e9',
    wireframeColor: '#38bdf8',
    bloomIntensity: 1.2,
    ambientIntensity: 0.4,
  },
  monochrome: {
    name: 'Monochrome',
    bgClass: 'from-zinc-950 via-zinc-900 to-black',
    accent: {
      text: 'text-zinc-400',
      bg: 'bg-zinc-500',
      border: 'border-zinc-500',
      muted: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
      ring: 'focus:border-zinc-500',
      slider: 'accent-zinc-500',
    },
    envPreset: 'studio',
    lightPrimary: '#ffffff',
    lightSecondary: '#a1a1aa',
    surfaceColor: '#d4d4d8',
    wireframeColor: '#ffffff',
    bloomIntensity: 0.8,
    ambientIntensity: 0.2,
  },
  ethereal: {
    name: 'Ethereal',
    bgClass: 'from-fuchsia-950 via-violet-950 to-purple-950',
    accent: {
      text: 'text-fuchsia-400',
      bg: 'bg-fuchsia-500',
      border: 'border-fuchsia-500',
      muted: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
      ring: 'focus:border-fuchsia-500',
      slider: 'accent-fuchsia-500',
    },
    envPreset: 'dawn',
    lightPrimary: '#ffffff',
    lightSecondary: '#d946ef',
    surfaceColor: '#e879f9',
    wireframeColor: '#f0abfc',
    bloomIntensity: 2.5,
    ambientIntensity: 0.5,
  }
};

export interface Mode {
  n: number;
  m: number;
  amplitude: number;
  phase: number;
  frequency: number;
  shape?: Float32Array; // Precomputed shape array
}

interface AppState {
  activeModes: Mode[];
  speed: number;
  damping: number;
  resolution: number;
  theme: ThemeName;
  surfaceStyle: SurfaceStyle;
  soundEnabled: boolean;
  baseFrequency: number;
  radius: number;
  advancedMode: boolean;
  
  toggleMode: (n: number, m: number) => void;
  clearModes: () => void;
  setSpeed: (speed: number) => void;
  setDamping: (damping: number) => void;
  setResolution: (resolution: number) => void;
  setTheme: (theme: ThemeName) => void;
  setSurfaceStyle: (style: SurfaceStyle) => void;
  toggleSound: () => void;
  setBaseFrequency: (freq: number) => void;
  setRadius: (radius: number) => void;
  toggleAdvancedMode: () => void;
  updateModeAmplitudes: (deltaTime: number) => void;
  poke: (r: number, theta: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  activeModes: [],
  speed: 1,
  damping: 0.5,
  resolution: 64,
  theme: 'midnight',
  surfaceStyle: 'standard',
  soundEnabled: false,
  baseFrequency: 110, // A2
  radius: 1,
  advancedMode: false,
  
  toggleMode: (n, m) => set((state) => {
    const exists = state.activeModes.find(mode => mode.n === n && mode.m === m);
    if (exists) {
      return { activeModes: state.activeModes.filter(mode => mode.n !== n || mode.m !== m) };
    } else {
      const root = BESSEL_ROOTS[n][m - 1];
      const freq = root / BESSEL_ROOTS[0][0];
      return {
        activeModes: [...state.activeModes, { n, m, amplitude: 1, phase: 0, frequency: freq }]
      };
    }
  }),
  
  clearModes: () => set({ activeModes: [] }),
  setSpeed: (speed) => set({ speed }),
  setDamping: (damping) => set({ damping }),
  setResolution: (resolution) => set({ resolution }),
  setTheme: (theme) => set({ theme }),
  setSurfaceStyle: (surfaceStyle) => set({ surfaceStyle }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setBaseFrequency: (baseFrequency) => set({ baseFrequency }),
  setRadius: (radius) => set({ radius }),
  toggleAdvancedMode: () => set((state) => ({ advancedMode: !state.advancedMode })),
  
  updateModeAmplitudes: (deltaTime) => set((state) => {
    if (state.damping <= 0 || state.activeModes.length === 0) return state;
    const decay = Math.exp(-state.damping * deltaTime);
    return {
      activeModes: state.activeModes.map(mode => ({
        ...mode,
        amplitude: mode.amplitude * decay
      })).filter(mode => mode.amplitude > 0.001)
    };
  }),

  poke: (pokeR, pokeTheta) => set((state) => {
    // Simplified poke: excite all modes based on their value at the poke location
    // A true poke would project a delta function onto the modes.
    // The coefficient for mode (n,m) is proportional to J_n(k_{nm} r) * cos(n * theta)
    const newModes = [...state.activeModes];
    
    for (let n = 0; n <= 5; n++) {
      for (let m = 1; m <= 5; m++) {
        const root = BESSEL_ROOTS[n][m - 1];
        const val = besselJ(n, root * pokeR) * Math.cos(n * pokeTheta);
        
        if (Math.abs(val) > 0.05) {
          const existingIdx = newModes.findIndex(mode => mode.n === n && mode.m === m);
          if (existingIdx >= 0) {
            newModes[existingIdx] = {
              ...newModes[existingIdx],
              amplitude: Math.min(2, newModes[existingIdx].amplitude + val * 0.5)
            };
          } else {
            const freq = root / BESSEL_ROOTS[0][0];
            newModes.push({ n, m, amplitude: val * 0.5, phase: 0, frequency: freq });
          }
        }
      }
    }
    
    return { activeModes: newModes };
  })
}));
