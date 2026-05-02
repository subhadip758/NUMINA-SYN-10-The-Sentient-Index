/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Globe, Info, Menu } from 'lucide-react';
import { SentientIndex } from './components/SentientIndex';
import { FluidBackground } from './components/FluidBackground';
import { InteractionPanel } from './components/InteractionPanel';
import { GlobalComparison } from './components/GlobalComparison';
import { IndexChart } from './components/IndexChart';

interface AppData {
  score: number;
  predictedScore: number;
  trend: "rising" | "falling" | "stable";
  history: { timestamp: number; value: number }[];
  cities: { name: string; value: number }[];
  logs: { id: string; message: string; timestamp: number; type: "info" | "success" | "warning" | "error" }[];
}

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"network" | "logs" | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/index');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch sentient data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center font-mono text-white/50 animate-pulse">
        Initializing Sentient Node...
      </div>
    );
  }

  const handleCitySelect = (city: { name: string; value: number }) => {
    setSelectedCity(city.name);
    // In a real app we might fetch city-specific index, here we just show an alert or update logs
    console.log(`Syncing with ${city.name} node...`);
  };

  return (
    <div className="relative h-screen w-screen bg-black text-white overflow-hidden selection:bg-white/20">
      <FluidBackground score={data.score} />

      {/* Navigation */}
      <nav className="absolute top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">NUMINA SYN-10</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-8 font-mono text-[10px] uppercase tracking-widest text-white/40">
            <button onClick={() => { setIsMenuOpen(false); setActiveModal(null); }} className="hover:text-white transition-colors">Core System</button>
            <button onClick={() => { setIsMenuOpen(false); setActiveModal("network"); }} className="hover:text-white transition-colors">Nodes Map</button>
            <button onClick={() => { setIsMenuOpen(false); setActiveModal("logs"); }} className="hover:text-white transition-colors">System Logs</button>
          </div>
          <button 
            id="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 h-full flex flex-col md:flex-row items-center justify-center p-6 gap-12 pt-24 md:pt-6">
        
        {/* Left Section: Context & Stats */}
        <div className="hidden lg:flex flex-col gap-12 w-80">
          <div className="space-y-4">
            <h2 className="font-display text-4xl font-light leading-snug">Sustainability as an <span className="italic text-white/60">Emergent Intelligence.</span></h2>
            <p className="font-sans text-sm text-white/40 leading-relaxed">
              Synthesizing global data points, local sentiment, and collective action into a living index for human-AI equilibrium.
            </p>
          </div>
          <GlobalComparison cities={data.cities} onCitySelect={handleCitySelect} />
        </div>

        {/* Center Section: The Core */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <SentientIndex score={data.score} trend={data.trend} />
          
          <AnimatePresence>
            {selectedCity && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-10 flex flex-col items-center"
              >
                <div className="px-4 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 font-mono text-[10px] uppercase tracking-widest text-white/60">
                  Node Selected: {selectedCity}
                </div>
                <button onClick={() => setSelectedCity(null)} className="mt-2 text-[8px] text-white/30 uppercase underline">Disconnect</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section: Interaction & Trends */}
        <div className="flex flex-col gap-8 w-full max-w-md">
          <InteractionPanel onRefresh={fetchData} selectedCity={selectedCity} />
          
          {/* Real-time System Logs */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 h-40 overflow-hidden flex flex-col">
            <h3 className="font-display font-medium text-[10px] mb-2 uppercase tracking-[0.2em] text-white/40">System Feed</h3>
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
              {data.logs.map((log) => (
                <div key={log.id} className="font-mono text-[9px] leading-tight flex gap-2">
                  <span className="text-white/20">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                  <span className={
                    log.type === 'success' ? 'text-green-400' : 
                    log.type === 'warning' ? 'text-yellow-400' : 
                    log.type === 'error' ? 'text-red-400' : 'text-white/60'
                  }>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <IndexChart data={data.history} predictedScore={data.predictedScore} />
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md p-8 flex flex-col items-center justify-center text-center"
          >
            <button 
              onClick={() => setIsMenuOpen(false)} 
              className="absolute top-6 right-6 p-4 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            >
              <Menu className="w-6 h-6 rotate-90" />
            </button>
            
            <div className="flex flex-col gap-8 text-4xl font-display font-light">
              <motion.button
                whileHover={{ scale: 1.1, x: 10 }}
                className="hover:text-white/60 transition-colors"
                onClick={() => { setIsMenuOpen(false); setActiveModal("network"); }}
              >
                Network Map
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, x: 10 }}
                className="hover:text-white/60 transition-colors"
                onClick={() => { setIsMenuOpen(false); setActiveModal("logs"); }}
              >
                System Logs
              </motion.button>
            </div>

            <div className="mt-16 max-w-xs text-center">
              <div className="font-mono text-[10px] uppercase text-white/30 tracking-[0.5em] mb-4">Sustainability Manifesto</div>
              <p className="text-xs text-white/50 leading-relaxed italic">
                "The Sentient Index is not a measurement, but a dialogue. A mirror of our collective impact on the digital and physical biosphere."
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 z-[70] bg-black/90 border border-white/20 rounded-3xl p-8 backdrop-blur-2xl flex flex-col"
          >
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <h2 className="font-display text-2xl uppercase tracking-[0.2em]">{activeModal === 'network' ? 'Global Node Map' : 'Core System Logs'}</h2>
              <button 
                onClick={() => setActiveModal(null)} 
                className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
              >
                <Menu className="w-5 h-5 rotate-90" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto relative">
              {activeModal === 'network' && (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M10,50 Q30,10 50,50 T90,50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" className="animate-pulse" />
                    <path d="M20,80 Q40,30 60,70 T100,20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                    <path d="M5,20 Q20,90 70,30 T95,80" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                    {[...Array(15)].map((_, i) => (
                      <circle key={i} cx={Math.random() * 100} cy={Math.random() * 100} r="1" fill={Math.random() > 0.5 ? '#4ade80' : '#ef4444'} className="animate-pulse" style={{ animationDelay: `${Math.random() * 2}s` }} />
                    ))}
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <Globe className="w-16 h-16 mx-auto mb-4 text-white/20 animate-spin-slow" />
                    <p className="font-mono text-xs uppercase tracking-[0.5em] text-white/50">Tracking 5 Active Nodes</p>
                  </div>
                </div>
              )}
              {activeModal === 'logs' && (
                <div className="space-y-4 font-mono text-xs leading-relaxed">
                  {data.logs.map((log) => (
                    <div key={log.id} className="flex gap-4 border-b border-white/5 pb-2">
                      <span className="text-white/30 shrink-0">[{new Date(log.timestamp).toISOString()}]</span>
                      <span className="text-white/50 shrink-0">[{log.type.toUpperCase()}]</span>
                      <span className={
                        log.type === 'success' ? 'text-green-400' : 
                        log.type === 'warning' ? 'text-yellow-400' : 
                        log.type === 'error' ? 'text-red-400' : 'text-white/80'
                      }>{log.message}</span>
                    </div>
                  ))}
                  {data.logs.length === 0 && <div className="text-white/30">No systemic events recorded in current session.</div>}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Status Bar */}
      <footer className="absolute bottom-0 left-0 w-full z-50 p-4 flex justify-between items-center text-[7px] md:text-[8px] font-mono uppercase tracking-[0.3em] text-white/20 border-t border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live Sync: Active
          </span>
          <span className="hidden sm:inline">Neural Link: Stable</span>
        </div>
        <div className="flex gap-4">
          <span>Uptime: 99.98%</span>
          <span className="hidden sm:inline">© 2026 Numina SYN-10</span>
        </div>
      </footer>
    </div>
  );
}

