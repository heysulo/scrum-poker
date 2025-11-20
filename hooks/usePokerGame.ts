
import { useState, useEffect, useMemo } from 'react';
import { 
  subscribeToSession, 
  castVote, 
  updateRevealState, 
  resetSession,
  leaveSession,
  kickParticipant
} from '../services/api';
import { Participant, CardValue } from '../types';
import { FIBONACCI_DECK } from '../constants';

// Helper to get index for range calculation
export const getCardIndex = (val: string | number) => {
  return FIBONACCI_DECK.indexOf(val.toString() as CardValue);
};

export const usePokerGame = (
  sessionId: string, 
  userId: string,
  isAutoRevealEnabled: boolean,
  initialTimerValue: number
) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionName, setSessionName] = useState('Loading...');
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [autoRevealTimer, setAutoRevealTimer] = useState(initialTimerValue);
  const [kicked, setKicked] = useState(false);
  
  // 1. Connection & Subscription
  useEffect(() => {
    const unsubscribe = subscribeToSession(sessionId, (data) => {
        if (data) {
            setSessionName(data.name);
            setCreatorId(data.creatorId);
            setIsRevealed(data.isRevealed);
            if (data.participants) {
                setParticipants(Object.values(data.participants));
            } else {
                setParticipants([]);
            }
        }
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId]);

  // Check if I was kicked (removed from participant list while session exists)
  useEffect(() => {
    if (participants.length > 0) {
      const me = participants.find(p => p.id === userId);
      if (!me) {
        setKicked(true);
      }
    }
  }, [participants, userId]);

  const myParticipant = participants.find(p => p.id === userId);
  const selectedCard = myParticipant?.vote || null;
  const isSpectator = myParticipant?.role === 'spectator';
  const isAdmin = creatorId === userId;

  // Filter only voters for "All Voted" check
  const voters = participants.filter(p => p.role !== 'spectator');
  const allVoted = voters.length > 0 && voters.every(p => p.vote !== null);

  // 3. Actions
  const handleSelectCard = (value: CardValue) => {
    if (isSpectator) return; // Spectators cannot vote
    const newVote = value === selectedCard ? null : value;
    castVote(sessionId, userId, newVote);
  };

  const handleReset = () => {
    resetSession(sessionId);
    setAutoRevealTimer(initialTimerValue);
  };

  const handleReveal = () => {
    if (!isRevealed) {
      updateRevealState(sessionId, true);
    }
  };

  const handleLeaveGame = () => {
      leaveSession(sessionId, userId);
  };

  const handleKick = (participantId: string) => {
      if (isAdmin) {
          kickParticipant(sessionId, participantId, userId);
      }
  };

  // 4. Auto Reveal Timer
  useEffect(() => {
    if (!isAutoRevealEnabled || !allVoted || isRevealed) {
      setAutoRevealTimer(initialTimerValue);
      return;
    }

    setAutoRevealTimer(initialTimerValue);

    const timer = setInterval(() => {
      setAutoRevealTimer(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleReveal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoRevealEnabled, allVoted, isRevealed, participants, initialTimerValue]);

  // 5. Statistics Calculation
  const stats = useMemo(() => {
    if (!isRevealed) return null;

    // Only include voters in stats
    const allVotes = participants
        .filter(p => p.role !== 'spectator')
        .map(p => p.vote)
        .filter(v => v !== null) as CardValue[];
    
    const numericVotes = allVotes
      .map(v => (v === '?' || v === '☕' ? null : parseInt(v)))
      .filter((v): v is number => v !== null);

    if (numericVotes.length === 0) return null;

    const distribution: Record<string, number> = {};
    allVotes.forEach(v => {
      distribution[v] = (distribution[v] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(distribution));

    const min = Math.min(...numericVotes);
    const max = Math.max(...numericVotes);
    const spread = getCardIndex(max) - getCardIndex(min);

    // Calculate Mode
    let maxFreq = 0;
    numericVotes.forEach(v => {
        const count = distribution[v.toString()] || 0;
        if (count > maxFreq) maxFreq = count;
    });
    const modes: number[] = [];
    numericVotes.forEach(v => {
        const count = distribution[v.toString()] || 0;
        if (count === maxFreq && !modes.includes(v)) {
            modes.push(v);
        }
    });
    modes.sort((a, b) => a - b);

    // Consensus Color (Green/Emerald Palette)
    let consensusColor = 'bg-green-500'; 
    if (spread === 0) consensusColor = 'bg-emerald-500';
    else if (spread <= 2) consensusColor = 'bg-emerald-400';

    const maxScaleIndex = FIBONACCI_DECK.indexOf('100');

    return { 
      modes, min, max, distribution, maxCount, 
      totalVotes: allVotes.length, numericCount: numericVotes.length,
      spread, consensusColor, maxScaleIndex
    };
  }, [isRevealed, participants]);

  return {
    sessionName,
    participants,
    isRevealed,
    selectedCard,
    myParticipant,
    stats,
    autoRevealTimer,
    allVoted,
    handleSelectCard,
    handleReveal,
    handleReset,
    handleLeaveGame,
    handleKick,
    isAdmin,
    isSpectator,
    kicked,
    creatorId // Exported now
  };
};
