
export type CardValue = '0' | '1' | '2' | '3' | '5' | '8' | '13' | '20' | '40' | '100' | '?' | '☕';

export interface Participant {
  id: string;
  name: string;
  vote: CardValue | null;
  initialRevealVote?: CardValue | null; // Snapshot of vote at the moment of reveal
  status: 'online' | 'offline';
  joinedAt: number;
  isBot?: boolean;
  role?: 'voter' | 'spectator';
}

export interface Session {
  id: string;
  name: string;
  createdBy: string; // Name of creator
  creatorId: string; // ID of creator (Admin)
  createdAt: number;
  isRevealed: boolean;
  participants: Record<string, Participant>;
  protected?: boolean; // Indicates if password is required
}

export interface UserState {
  id: string;
  name: string;
}