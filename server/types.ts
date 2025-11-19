
export type CardValue = '0' | '1' | '2' | '3' | '5' | '8' | '13' | '20' | '40' | '100' | '?' | '☕';

export interface Participant {
  id: string;
  name: string;
  vote: CardValue | null;
  initialRevealVote?: CardValue | null;
  status: 'online' | 'offline';
  joinedAt: number;
  isBot?: boolean;
}

export interface Session {
  id: string;
  name: string;
  createdBy: string;
  createdAt: number;
  isRevealed: boolean;
  participants: Record<string, Participant>;
  protected: boolean;
  password?: string; // Stored internally, stripped before sending to client
}
