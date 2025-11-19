
import React, { useState, useEffect } from 'react';
import { CardValue } from '../types';
import { FIBONACCI_DECK } from '../constants';
import { usePokerGame } from '../hooks/usePokerGame';

import { Header } from './Header';
import { Controls } from './Controls';
import { Statistics } from './Statistics';
import { ParticipantList } from './ParticipantList';
import { Deck } from './Deck';

interface PokerRoomProps {
  sessionId: string;
  userId: string;
  userName: string;
  onLeave: () => void;
}

export const PokerRoom: React.FC<PokerRoomProps> = ({ sessionId, userId, userName, onLeave }) => {
  // Local UI State
  const [isFooterHovered, setIsFooterHovered] = useState(false);
  const [filterVote, setFilterVote] = useState<CardValue | null>(null);
  const [isAutoRevealEnabled, setIsAutoRevealEnabled] = useState(true); // Enabled by default
  const [initialTimerValue, setInitialTimerValue] = useState(6);
  
  // New: Presenter Mode State
  const [isPresenterMode, setIsPresenterMode] = useState(false);

  // Custom Hook handles all game logic
  const {
    sessionName,
    participants,
    isRevealed,
    selectedCard,
    stats,
    autoRevealTimer,
    allVoted,
    hasChangedVote,
    initialRevealVote,
    handleSelectCard,
    handleReveal,
    handleReset,
    handleLeaveGame
  } = usePokerGame(sessionId, userId, isAutoRevealEnabled, initialTimerValue);

  // Clear filter on reset
  const wrappedHandleReset = () => {
    handleReset();
    setFilterVote(null);
  };

  const onExit = () => {
      handleLeaveGame();
      onLeave();
  };

  // Keyboard Listener (Global)
  useEffect(() => {
    let buffer = '';
    let timeout: ReturnType<typeof setTimeout>;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Special Keys
      if (e.key.toLowerCase() === 'c') {
        handleSelectCard('☕');
        return;
      }
      if (e.key === '?' || e.key === '/') {
        handleSelectCard('?');
        return;
      }

      // Number handling with buffer for multi-digit values (13, 20, 40, 100)
      if (/^[0-9]$/.test(e.key)) {
        buffer += e.key;
        
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const val = buffer as CardValue;
          if (FIBONACCI_DECK.includes(val)) {
            handleSelectCard(val);
          }
          buffer = '';
        }, 300); // 300ms buffer window
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [handleSelectCard]);

  return (
    <div className="h-full flex flex-col">
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }
      `}</style>

      <Header 
        sessionName={sessionName} 
        participantCount={participants.length} 
        onLeave={onExit}
        isPresenterMode={isPresenterMode}
        setIsPresenterMode={setIsPresenterMode}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <Controls 
            isAutoRevealEnabled={isAutoRevealEnabled}
            setIsAutoRevealEnabled={setIsAutoRevealEnabled}
            initialTimerValue={initialTimerValue}
            setInitialTimerValue={setInitialTimerValue}
            autoRevealTimer={autoRevealTimer}
            allVoted={allVoted}
            isRevealed={isRevealed}
            handleReveal={handleReveal}
            handleReset={wrappedHandleReset}
          />

          <Statistics 
            stats={stats} 
            isRevealed={isRevealed} 
            filterVote={filterVote} 
            setFilterVote={setFilterVote} 
          />

          <ParticipantList 
            participants={participants}
            userId={userId}
            isRevealed={isRevealed}
            filterVote={filterVote}
            hasChangedVote={hasChangedVote}
            initialRevealVote={initialRevealVote}
            isPresenterMode={isPresenterMode}
          />

          {/* Spacer for footer */}
          <div className="h-40 w-full" /> 
        </div>
      </main>

      <Deck 
        isRevealed={isRevealed}
        selectedCard={selectedCard}
        onSelectCard={handleSelectCard}
        isFooterHovered={isFooterHovered}
        setIsFooterHovered={setIsFooterHovered}
        isPresenterMode={isPresenterMode}
      />
    </div>
  );
};
