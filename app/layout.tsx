import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Resona | Interactive Wave Canvas',
  description: 'Explore the mesmerizing physics of wave propagation and resonance on a 3D membrane. Visualize and interact with mathematical harmonics in real-time.',
  keywords: ['physics', 'wave equation', '3D', 'WebGL', 'Three.js', 'React Three Fiber', 'harmonics', 'resonance', 'interactive art'],
  authors: [{ name: 'Resona Team' }],
  openGraph: {
    title: 'Resona | Interactive Wave Canvas',
    description: 'Explore the mesmerizing physics of wave propagation and resonance on a 3D membrane.',
    type: 'website',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
