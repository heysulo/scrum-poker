
import React from 'react';
import { BarChart3, FilterX } from 'lucide-react';
import { FIBONACCI_DECK } from '../constants';
import { CardValue } from '../types';
import { getCardIndex } from '../hooks/usePokerGame';

interface StatisticsProps {
  stats: any;
  isRevealed: boolean;
  filterVote: CardValue | null;
  setFilterVote: React.Dispatch<React.SetStateAction<CardValue | null>>;
}

export const Statistics: React.FC<StatisticsProps> = ({ stats, isRevealed, filterVote, setFilterVote }) => {
  if (!isRevealed || !stats) return null;

  const getPosition = (val: number) => {
    const idx = getCardIndex(val);
    // Normalize based on the index of '100' which is the max numeric value
    return (idx / stats.maxScaleIndex) * 100;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Most Voted */}
      <div className="md:col-span-4 space-y-4">
        <div className="bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col justify-between h-full relative overflow-hidden group shadow-sm dark:shadow-none">
          <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Most Voted</div>
          <div className="flex flex-wrap gap-3 mt-1 relative z-10">
            {stats.modes.map((mode: number) => (
              <div key={mode} className="w-20 h-28 bg-green-500 dark:bg-green-600 rounded-xl flex items-center justify-center text-4xl font-bold text-white shadow-lg border-2 border-green-400 transition-transform hover:-translate-y-1">
                {mode}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Consensus Range */}
      <div className="md:col-span-8 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-4">
          <span className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide text-sm">Consensus Range</span>
          <div className="flex items-center gap-4 font-mono text-2xl text-slate-900 dark:text-white">
            <span className="text-sm text-slate-400 mr-2 font-sans font-normal uppercase">Spread</span>
            <span>{stats.min} - {stats.max}</span>
          </div>
        </div>
        
        <div className="relative h-16 w-full mt-2 select-none flex items-center">
          {/* Track */}
          <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
            
            {/* Range Fill */}
            <div 
              className={`absolute top-0 bottom-0 rounded-full opacity-40 ${stats.consensusColor}`}
              style={{
                left: `${getPosition(stats.min)}%`,
                width: `${getPosition(stats.max) - getPosition(stats.min)}%` 
              }}
            />

            {/* Min Marker (Low) */}
            <div 
               className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-500 rounded-full z-10 shadow"
               style={{ left: `${getPosition(stats.min)}%`, transform: 'translate(-50%, -50%)' }}
            >
               <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500 whitespace-nowrap">Low: {stats.min}</div>
            </div>

            {/* Max Marker (High) - Only show if different from Min */}
            {stats.min !== stats.max && (
                <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-500 rounded-full z-10 shadow"
                style={{ left: `${getPosition(stats.max)}%`, transform: 'translate(-50%, -50%)' }}
                >
                <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500 whitespace-nowrap">High: {stats.max}</div>
                </div>
            )}

            {/* Mode Marker(s) */}
            {stats.modes.map((modeVal: number) => (
              <div 
                key={modeVal}
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-800 dark:bg-white border-2 border-white dark:border-slate-900 rounded-full z-20 shadow-lg"
                style={{ left: `${getPosition(modeVal)}%`, transform: 'translate(-50%, -50%)' }}
              >
                 <div className="absolute -top-9 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-2 py-1 rounded shadow-sm whitespace-nowrap border border-slate-100 dark:border-slate-600">
                    {stats.modes.length > 1 ? '' : 'Most: '}{modeVal}
                 </div>
              </div>
            ))}

          </div>
        </div>
      </div>
      
      {/* Vote Distribution */}
      <div className="md:col-span-12 bg-white/40 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"><BarChart3 size={18}/> Vote Distribution</div>
          {filterVote && (
            <div onClick={() => setFilterVote(null)} className="flex items-center gap-1 text-xs font-medium bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-indigo-200 transition-colors">
              <FilterX size={12} /> Clear Filter
            </div>
          )}
        </div>
        <div className="flex items-end justify-center h-48 gap-4 w-full">
          {FIBONACCI_DECK.filter(val => val !== '?' && val !== '☕').map((val) => {
            const count = stats.distribution[val] || 0;
            const isMode = stats.modes.includes(parseInt(val));
            return (
              <div 
                key={val} 
                onClick={() => setFilterVote(prev => prev === val ? null : val)}
                className={`flex flex-col items-center justify-end h-full w-12 group relative cursor-pointer transition-opacity ${filterVote && filterVote !== val ? 'opacity-30' : 'opacity-100'}`}
              >
                <div className="relative w-full flex items-end justify-center h-full">
                  <div 
                    className={`w-full sm:w-10 rounded-t-md transition-all duration-500 ease-out relative ${count === 0 ? 'bg-blue-200 dark:bg-blue-700 h-[2px]' : isMode ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'}`}
                    style={{ height: `${count === 0 ? 2 : (count / stats.maxCount) * 100}%` }}
                  >
                    {count > 0 && <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold px-2 py-1 rounded bg-slate-700 text-white shadow-md">{count}</div>}
                  </div>
                </div>
                <div className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-400">{val}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
