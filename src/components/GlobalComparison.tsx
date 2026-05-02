import React from "react";
import { MapPin } from "lucide-react";

interface CityData {
  name: string;
  value: number;
}

interface GlobalComparisonProps {
  cities: CityData[];
  onCitySelect?: (city: CityData) => void;
}

export const GlobalComparison: React.FC<GlobalComparisonProps> = ({ cities, onCitySelect }) => {
  return (
    <div className="flex flex-col gap-3 w-full max-w-xs">
      <h3 className="font-display font-medium text-xs mb-1 uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
        <MapPin className="w-3 h-3" />
        Global Syn-Nodes
      </h3>
      <div className="space-y-2">
        {cities.map((city) => (
          <button 
            key={city.name}
            onClick={() => onCitySelect?.(city)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group text-left"
          >
            <span className="font-mono text-xs text-white/60 group-hover:text-white transition-colors uppercase">
              {city.name}
            </span>
            <span className={`font-display font-semibold text-xs ${
              city.value < 4 ? 'text-red-500' : city.value < 7 ? 'text-yellow-400' : 'text-green-500'
            }`}>
              {city.value.toFixed(1)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
