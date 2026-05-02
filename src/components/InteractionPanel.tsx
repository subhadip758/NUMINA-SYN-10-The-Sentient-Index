import React, { useState } from "react";
import { Send, ThumbsUp, ThumbsDown, Minus } from "lucide-react";

interface InteractionPanelProps {
  onRefresh: () => void;
}

export const InteractionPanel: React.FC<InteractionPanelProps> = ({ onRefresh }) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Use a shared audio context reference to prevent hitting the browser's hardware limit
  const audioCtxRef = React.useRef<AudioContext | null>(null);

  const playBeep = (type: "success" | "error" | "neutral" | "submit") => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === "success") {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      osc.type = "sine";
    } else if (type === "error") {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      osc.type = "sawtooth";
    } else if (type === "submit") {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.05);
      osc.type = "square";
    } else {
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.type = "triangle";
    }
    
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (type === "error" ? 0.2 : 0.1));
      
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const handleVote = async (vote: "yes" | "no" | "neutral") => {
    playBeep(vote === "yes" ? "success" : vote === "no" ? "error" : "neutral");
    try {
      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    playBeep("submit");
    try {
      const res = await fetch("/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      
      if (data.aiResponse) {
        setAiMessage(data.aiResponse);
        setTimeout(() => setAiMessage(null), 5000);
      }
      
      setInput("");
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md">
      <div>
        <h3 className="font-display font-medium text-lg mb-4">Collective Input</h3>
        <div className="grid grid-cols-3 gap-2">
          <button 
            id="vote-yes"
            onClick={() => handleVote("yes")}
            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-green-500/20 border border-white/10 transition-colors group"
          >
            <ThumbsUp className="w-5 h-5 group-hover:text-green-500" />
            <span className="text-[10px] uppercase tracking-wider">Yes</span>
          </button>
          <button 
            id="vote-neutral"
            onClick={() => handleVote("neutral")}
            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <Minus className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wider">Neutral</span>
          </button>
          <button 
            id="vote-no"
            onClick={() => handleVote("no")}
            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 transition-colors group"
          >
            <ThumbsDown className="w-5 h-5 group-hover:text-red-500" />
            <span className="text-[10px] uppercase tracking-wider">No</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          id="sentiment-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your environment..."
          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 outline-none focus:border-white/30 transition-all text-sm pr-12"
          disabled={isLoading}
        />
        <button
          id="submit-sentiment"
          type="submit"
          disabled={isLoading}
          className="absolute right-2 top-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Send className={isLoading ? "animate-pulse w-4 h-4 opacity-50" : "w-4 h-4"} />
        </button>
      </form>

      {aiMessage && (
        <div className="bg-white/10 border border-white/20 rounded p-3 text-[10px] font-mono text-white/80 animate-in fade-in slide-in-from-top-2">
          <span className="text-white/40 uppercase tracking-widest mr-2">SYS&gt;</span>
          {aiMessage}
        </div>
      )}

      <p className="text-[10px] text-white/30 uppercase tracking-widest text-center">
        Votes and descriptions impact the sentient index in real-time
      </p>
    </div>
  );
};
