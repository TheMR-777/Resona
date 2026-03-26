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
  viewMode: 'solid' | 'wireframe';
  soundEnabled: boolean;
  baseFrequency: number;
  radius: number;
  
  toggleMode: (n: number, m: number) => void;
  clearModes: () => void;
  setSpeed: (speed: number) => void;
  setDamping: (damping: number) => void;
  setResolution: (resolution: number) => void;
  setViewMode: (viewMode: 'solid' | 'wireframe') => void;
  toggleSound: () => void;
  setBaseFrequency: (freq: number) => void;
  setRadius: (radius: number) => void;
  updateModeAmplitudes: (deltaTime: number) => void;
  poke: (r: number, theta: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  activeModes: [],
  speed: 1,
  damping: 0.5,
  resolution: 64,
  viewMode: 'solid',
  soundEnabled: false,
  baseFrequency: 110, // A2
  radius: 1,
  
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
  setViewMode: (viewMode) => set({ viewMode }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setBaseFrequency: (baseFrequency) => set({ baseFrequency }),
  setRadius: (radius) => set({ radius }),
  
  updateModeAmplitudes: (deltaTime) => set((state) => {
    if (state.damping <= 0) return state;
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
