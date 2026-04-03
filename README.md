# Resona: Interactive Wave Canvas

Resona is a high-fidelity, interactive 3D simulation of a vibrating circular membrane. It leverages the physics of Bessel functions to visualize and sonify the complex harmonic patterns (modes) that emerge when a surface is excited.

## 🌟 What is Resona?

At its core, Resona is an interactive playground for exploring **Cymatics**—the study of visible sound and vibration. Unlike a simple ripple simulation, Resona calculates the true physical modes of a circular drumhead. 

### The Value
- **Educational**: Visualize abstract mathematical concepts like Bessel functions and partial differential equations in real-time.
- **Artistic**: Create beautiful, organic geometric patterns through the interplay of different frequencies.
- **Therapeutic**: An immersive, meditative experience combining fluid 3D visuals with generative ambient sound.

## 🚀 What Makes It Different?

While inspired by classic wave simulations, Resona stands out through:
- **Real-time Interactivity**: Poke the membrane to excite it, or use the harmonic grid to precisely toggle specific modes.
- **Dynamic Theming**: Multiple visual aesthetics (Ethereal, Monochrome, Cyberpunk, etc.) that adapt everything from the background to the accent colors.
- **Integrated Audio Engine**: Every vibration you see is mapped to a real-time synthesizer, allowing you to *hear* the geometry of the wave.
- **Advanced Control**: Fine-tune physical parameters like damping, speed, and mesh resolution on the fly.

## 🎮 How to Use

1. **Excite the Surface**: Click or tap anywhere on the 3D membrane to "poke" it and generate energy.
2. **Toggle Modes**: Use the **Mode Grid** in the bottom right to enable or disable specific harmonics ($n, m$).
3. **Customize Visuals**:
   - **Theme**: Change the overall color palette and atmosphere.
   - **Surface Style**: Switch between Standard, Wireframe, Frosted Glass, Matte Clay, or Neon Glow.
4. **Physical Controls**:
   - **Radius**: Scale the simulation area.
   - **Speed**: Speed up or slow down time.
   - **Damping**: Control how quickly vibrations fade away.
   - **Resolution**: Adjust the detail of the 3D mesh (higher resolution = smoother waves).
5. **Camera**: Drag to rotate, scroll to zoom, and right-click to pan.

## 🛠 Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **3D Rendering**: Three.js via React Three Fiber
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 🔮 Future Roadmap

We have ambitious plans for Resona:
- [ ] **Custom Boundary Shapes**: Move beyond circles to squares, triangles, and arbitrary user-drawn shapes.
- [ ] **Multi-Membrane Interference**: Simulate multiple membranes interacting with each other.
- [ ] **MIDI Support**: Use external MIDI controllers to trigger and modulate harmonic modes.
- [ ] **Recording & Export**: Capture your visual and audio creations to share with the world.
- [ ] **VR/AR Support**: Experience the vibrations in fully immersive spatial environments.

---
*Inspired by the beauty of physics and the elegance of mathematics.*
