
import React from 'react';
import { ChevronUp, Keyboard } from 'lucide-react';
import { PokerCard } from './PokerCard';
import { FIBONACCI_DECK } from '../constants';
import { CardValue } from '../types';

interface DeckProps {
  isRevealed: boolean;
  selectedCard: CardValue | null;
  onSelectCard: (val: CardValue) => void;
  isFooterHovered: boolean;
  setIsFooterHovered: (val: boolean) => void;
  isPresenterMode: boolean;
}

export const Deck: React.FC<DeckProps> = ({
  isRevealed,
  selectedCard,
  onSelectCard,
  isFooterHovered,
  setIsFooterHovered,
  isPresenterMode
}) => {
  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500 ${isRevealed && !isFooterHovered ? 'translate-y-[calc(100%-24px)]' : 'translate-y-0'}`}
      onMouseEnter={() => setIsFooterHovered(true)}
      onMouseLeave={() => setIsFooterHovered(false)}
    >
      <div className={`absolute -top-10 left-0 right-0 flex justify-center transition-opacity duration-300 ${isRevealed && !isFooterHovered ? 'opacity-100 delay-200' : 'opacity-0 pointer-events-none'}`}>
        <div className="group relative overflow-hidden bg-purple-600 text-white text-xs font-bold px-8 py-2.5 rounded-t-xl shadow-2xl border-t border-x border-purple-500 cursor-pointer pointer-events-auto flex items-center gap-2">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 animate-[shimmer_2s_infinite]"></div>
          <div className="relative z-10 flex items-center gap-2">
            <ChevronUp size={16} className="animate-bounce" />
            <span className="uppercase tracking-wide">Change Vote</span>
            <ChevronUp size={16} className="animate-bounce" />
          </div>
        </div>
      </div>

      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700/50 pb-6 min-h-[180px]">
        <div className="max-w-6xl mx-auto overflow-x-auto pt-14 pb-4 scrollbar-hide">
          
          {isPresenterMode ? (
             <div className="flex flex-col items-center justify-center text-center h-32 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-3 text-indigo-500 dark:text-indigo-400 mb-2">
                    <Keyboard size={32} />
                    <h3 className="text-xl font-bold">Voting via Keyboard</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
                   Type numbers to vote (e.g., <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs">3</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs">13</kbd>). 
                   Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs">C</kbd> for Break, 
                   <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs">?</kbd> for Unsure.
                </p>
             </div>
          ) : (
            <div className="flex justify-center gap-3 min-w-max px-6">
                {FIBONACCI_DECK.map((val) => (
                <div key={val}>
                    <PokerCard
                    value={val}
                    selected={selectedCard === val}
                    onClick={() => onSelectCard(val)}
                    size="md"
                    />
                </div>
                ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
