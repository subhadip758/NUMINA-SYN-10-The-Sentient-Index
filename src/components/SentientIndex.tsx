import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SentientIndexProps {
  score: number;
  trend: "rising" | "falling" | "stable";
}

export const SentientIndex: React.FC<SentientIndexProps> = ({ score, trend }) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const subOscillatorRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!isAudioEnabled) {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;

    if (!oscillatorRef.current) {
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const masterGain = ctx.createGain();
      
      // Routing: LFO -> LFO Gain -> Master Gain (Gain AudioParam)
      // Osc & SubOsc -> Master Gain -> Destination
      osc.connect(masterGain);
      subOsc.connect(masterGain);
      masterGain.connect(ctx.destination);
      
      lfo.connect(lfoGain);
      lfoGain.connect(masterGain.gain);
      
      masterGain.gain.setValueAtTime(0.05, ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.05, ctx.currentTime); // LFO depth
      
      osc.start();
      subOsc.start();
      lfo.start();
      
      oscillatorRef.current = osc;
      subOscillatorRef.current = subOsc;
      lfoRef.current = lfo;
      lfoGainRef.current = lfoGain;
      masterGainRef.current = masterGain;
    }

    const osc = oscillatorRef.current;
    const subOsc = subOscillatorRef.current;
    const lfo = lfoRef.current;

    if (osc && subOsc && lfo) {
      let targetFreq = 220;
      let targetType: OscillatorType = "sine";
      let lfoFreq = 0.5; // slow pulse

      if (score < 4) {
        targetFreq = 60 + (score * 10);
        targetType = "sawtooth";
        lfoFreq = 4; // fast alarm pulse
      } else if (score < 8) {
        targetFreq = 220 + (score * 20);
        targetType = "sine";
        lfoFreq = 1; // medium pulse
      } else {
        targetFreq = 440 + (score * 10);
        targetType = "triangle";
        lfoFreq = 0.2; // very slow relaxing pulse
      }

      osc.type = targetType;
      subOsc.type = "sine";
      
      osc.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.5);
      subOsc.frequency.setTargetAtTime(targetFreq / 2, ctx.currentTime, 0.5); // One octave lower
      lfo.frequency.setTargetAtTime(lfoFreq, ctx.currentTime, 0.5);
    }

    return () => {
      // Keep running unless explicitly disabled
    };
  }, [isAudioEnabled, score]);

  const getColorClass = () => {
    if (score < 4) return "text-red-500 glow-red";
    if (score < 8) return "text-yellow-400 glow-yellow";
    return "text-green-500 glow-green";
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const TrendIcon = trend === "rising" ? TrendingUp : trend === "falling" ? TrendingDown : Minus;

  return (
    <div className="relative flex flex-col items-center justify-center h-full select-none">
      <button 
        id="audio-toggle"
        onClick={toggleAudio}
        className="absolute -top-32 md:-top-48 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group z-20"
        title="Toggle Neural Audio Feed"
      >
        {isAudioEnabled ? (
          <Volume2 className="w-4 h-4 text-white hover:scale-110 transition-transform" />
        ) : (
          <VolumeX className="w-4 h-4 text-white/30 hover:scale-110 transition-transform" />
        )}
      </button>

      <div className="relative flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={Math.floor(score)}
            initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
            animate={{ 
              scale: (score >= 4 && score < 8) ? [1, 1.05, 1] : 1,
              opacity: 1, 
              filter: "blur(0px)",
              y: trend === "rising" ? [0, -10, 0] : trend === "falling" ? [0, 10, 0] : 0
            }}
            transition={{ 
              type: "spring", 
              stiffness: 100,
              duration: 0.5,
              scale: (score >= 4 && score < 8) ? { repeat: Infinity, duration: 3, ease: "easeInOut" } : { duration: 0.5 },
              y: { type: "tween", ease: "easeInOut", duration: 0.5 }
            }}
            className={cn(
              "font-display font-bold text-[15rem] md:text-[25rem] leading-none transition-all duration-700",
              getColorClass(),
              score < 4 && "cracked heartbeat"
            )}
          >
            {score.toFixed(1)}
          </motion.div>
        </AnimatePresence>

        <motion.div 
          animate={{ 
            y: trend === "rising" ? [0, -5, 0] : trend === "falling" ? [0, 5, 0] : 0,
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={cn(
            "absolute -right-16 md:-right-24 p-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md",
            trend === "rising" ? "text-green-500" : trend === "falling" ? "text-red-500" : "text-white/50"
          )}
        >
          <TrendIcon className="w-8 h-8 md:w-12 md:h-12" />
        </motion.div>
      </div>

      <motion.div 
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mt-4 font-mono text-sm tracking-[0.5em] text-white/50 uppercase flex items-center gap-4"
      >
        <span>Sentient Index</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span>SYN-10</span>
      </motion.div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[30rem] h-[30rem] md:w-[40rem] md:h-[40rem] rounded-full bg-white/5 blur-[100px]" />
    </div>
  );
};
