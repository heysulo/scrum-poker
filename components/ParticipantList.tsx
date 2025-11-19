
import React from 'react';
import { Coffee, Clock, CheckCircle2 } from 'lucide-react';
import { PokerCard } from './PokerCard';
import { Participant, CardValue } from '../types';

interface ParticipantListProps {
  participants: Participant[];
  userId: string;
  isRevealed: boolean;
  filterVote: CardValue | null;
  isPresenterMode: boolean;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({ 
  participants, 
  userId, 
  isRevealed, 
  filterVote,
  isPresenterMode
}) => {
  
  const visibleParticipants = participants.filter(p => !filterVote || p.vote === filterVote);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {visibleParticipants.map((p, index) => {
        const isMe = p.id === userId;
        const isBreak = p.vote === '☕';
        const isReady = !!p.vote;
        
        // Changed Vote Logic (Synced across room)
        // If revealed, and the user has an initial vote recorded, check if current vote differs
        const hasChanged = isRevealed && p.initialRevealVote && p.vote !== p.initialRevealVote;
        
        // Only show green "Ready" styling if not yet revealed
        const showReadyGreen = isReady && !isRevealed;

        // Determine visibility of the card face
        // Normally: Revealed OR (It's Me). 
        // Presenter Mode: Revealed OR (It's Me AND NOT PresenterMode)
        const showFaceUp = isRevealed || (isMe && !isPresenterMode);

        return (
          <div 
            key={p.id} 
            style={{ animationDelay: `${index * 50}ms` }}
            className={`relative animate-fadeInUp p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                isBreak 
                    ? 'border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/10' 
                    : hasChanged
                      ? 'border-violet-300 dark:border-violet-600 bg-violet-100 dark:bg-violet-900/50 shadow-lg shadow-violet-500/20'
                    : showReadyGreen 
                        ? 'border-green-500 dark:border-green-500 bg-green-100 dark:bg-green-900/40 shadow-[0_4px_12px_-2px_rgba(34,197,94,0.2)]' 
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50'
            } ${isMe ? 'ring-2 ring-blue-500/20' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-inner border border-slate-200 dark:border-slate-600 ${
                    isBreak ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' 
                    : isMe ? 'bg-blue-600 text-white shadow-blue-500/30' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {isBreak ? <Coffee size={20} /> : p.name.charAt(0).toUpperCase()}
                </div>
                {p.vote && (
                  <div className={`absolute -bottom-1 -right-1 rounded-full p-0.5 border-2 border-white dark:border-slate-900 ${isBreak ? 'bg-amber-500' : 'bg-green-500'}`}>
                    {isBreak ? <Clock size={14} className="text-white" /> : <CheckCircle2 size={14} className="text-white" />}
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  {p.name} {isMe && <span className="text-xs text-slate-400">(You)</span>}
                </div>
                <div className={`text-xs font-mono ${isBreak ? 'text-amber-600' : hasChanged ? 'text-violet-600 dark:text-violet-300' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {isBreak ? 'ON BREAK' : hasChanged ? 'UPDATED' : p.vote ? 'READY' : 'THINKING'}
                </div>
              </div>
            </div>
            
            <div className="transition-opacity relative">
              {showFaceUp ? (
                p.vote ? (
                    <div className="relative flex items-center">
                        {/* Original Vote Ghost (Shown to the left) */}
                        {hasChanged && (
                            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 flex flex-col items-end opacity-70">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Was</span>
                                <span className="text-xl font-bold text-slate-500 dark:text-slate-400 line-through decoration-slate-400 decoration-2">{p.initialRevealVote}</span>
                            </div>
                        )}
                        <div className={hasChanged ? "relative z-10" : ""}>
                            <PokerCard value={p.vote} selected={isMe} size="sm" />
                        </div>
                    </div>
                ) : (
                    <div className="w-12 h-16 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg opacity-50" />
                )
              ) : (
                // Render Face Down card (e.g. for Presenter Mode or other users)
                <PokerCard value="?" selected={false} size="sm" faceDown={true} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
