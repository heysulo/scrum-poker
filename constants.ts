import { CardValue } from './types';

export const FIBONACCI_DECK: CardValue[] = ['0', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕'];

export const MODELS = {
  CHAT: 'gemini-3-pro-preview',
  SEARCH: 'gemini-2.5-flash',
};

export const SYSTEM_INSTRUCTION_POKER = `You are an expert Agile Scrum Master and Technical Lead. 
Your goal is to help the team estimate user stories using Story Points (Fibonacci sequence).
- Analyze the user's story for complexity, risk, and uncertainty.
- Ask clarifying questions if the story is vague.
- Suggest a specific Fibonacci number (1, 2, 3, 5, 8, 13, etc.) with a clear rationale based on standard effort/complexity.
- Be concise and professional.`;
