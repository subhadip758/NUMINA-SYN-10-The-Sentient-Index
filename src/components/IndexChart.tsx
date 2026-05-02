import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface IndexChartProps {
  data: { timestamp: number; value: number }[];
  predictedScore: number;
}

export const IndexChart: React.FC<IndexChartProps> = ({ data, predictedScore }) => {
  return (
    <div className="w-full h-48 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
      <h3 className="font-display font-medium text-xs mb-4 uppercase tracking-[0.2em] text-white/40">Temporal Trend</h3>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            hide 
          />
          <YAxis 
            domain={[1, 10]} 
            hide 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
            itemStyle={{ color: "#fff", fontSize: "10px" }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#fff" 
            strokeWidth={1.5} 
            dot={false} 
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-between mt-2 font-mono text-[8px] text-white/20 uppercase">
        <span>-6 Hours</span>
        <span>Current</span>
      </div>
      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center font-mono text-[10px] uppercase">
        <span className="text-white/40">Expected Index in next 24 hours:</span>
        <span className={
          predictedScore < 4 ? "text-red-400 font-bold" :
          predictedScore < 8 ? "text-yellow-400 font-bold" :
          "text-green-400 font-bold"
        }>{predictedScore.toFixed(1)}</span>
      </div>
    </div>
  );
};
