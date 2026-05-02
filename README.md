# NUMINA SYN-10: The Sentient Index

NUMINA SYN-10 is a full-stack interactive web application that visualizes global sustainability and human-AI equilibrium as a real-time "Sentient Index." The core interface features a massive dynamic number (ranging from 1.0 to 10.0) that reacts organically to system states, user interactions, and simulated global telemetry.

## Features

- **Living UI:** The central index actively scales, pulses, and glitches based on system health.
    - `1.0 - 3.9` (Critical): Aggressive red glitch, chaotic network particles, and alarm-rate audio pulses.
    - `4.0 - 7.9` (Unstable/Neutral): Yellow glow with moderate organic movement.
    - `8.0 - 10.0` (Healthy): Smooth green pulsing with harmonious, connected neural background particles.
- **Interactive Fluid Network:** The background canvas renders an organic particle swarm. Particles intelligently track your mouse (attracting when healthy, fleeing when critical) and draw dynamic connections forming neural nodes.
- **Audio Synthesis Engine:** Native Web Audio API generates LFO-driven ambient synth drones corresponding to the health state, accompanied by sci-fi interaction chimes for voting and submissions.
- **Sentient Data Logging:** Submitting local data or feedback to the system simulates an active AI consensus change, giving you an immediate, contextual "SYS" console readout.
- **Live Monitoring & Prediction:** Features a real-time historical graph predicting index movement for the next 24 hours, and an immersive global tracker showing mock readings from other primary urban nodes.

## Technologies Used

- **Frontend:** React, TypeScript, Tailwind CSS, Vite, Framer Motion, Recharts
- **Backend:** Node.js, Express.js
- **Audio:** Native Web Audio API LFOs and Oscillators
- **Effects:** HTML5 Canvas, CSS Keyframes (Glitch/Chromatic Aberrations)

## Running the Application Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Node & Vite Development Server:**
   ```bash
   npm run dev
   ```
   
   *This command spins up the backend Express server with Vite middleware for immediate hot-reloading.*

3. **Interact:**
   Navigate to `http://localhost:3000` in your web browser. 
   Turn on the audio by clicking the speaker icon floating above the main index to hear the generative synthesizer respond to real-time fluctuations.

## Core Philosophy

"The Sentient Index is not a measurement, but a dialogue. A mirror of our collective impact on the digital and physical biosphere."
