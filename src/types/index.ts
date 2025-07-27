export interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  gender: 'male' | 'female' | 'other';
  zodiacSign?: string;
}

export interface PalmAnalysis {
  id: string;
  userId: string;
  palmType: 'earth' | 'air' | 'fire' | 'water';
  personalityTraits: string[];
  career?: {
    description: string;
    suitedFields: string[];
  };
  relationships?: {
    description: string;
    strengths: string[];
    challenges: string[];
  };
  health?: {
    description: string;
    recommendations: string[];
  };
  majorLines?: {
    heartLine: string;
    headLine: string;
    lifeLine: string;
    destinyLine: string;
  };
  futureInsights: string[];
  createdAt: string;
  profile?: {
    imageUrl?: string;
    questions?: Record<string, string | number>;
    metadata?: Record<string, unknown>;
  };
}

export interface Kundli {
  id: string;
  userId: string;
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  planetaryPositions: Record<string, {
    position: number;
    sign: string;
    house: number;
    retrograde?: boolean;
  }>;
  basicInterpretation: string;
  doshas: string[];
  remedies: string[];
  createdAt: string;
}

export interface HoroscopeReading {
  sign: string;
  date: string;
  love: { rating: number; text: string };
  career: { rating: number; text: string };
  health: { rating: number; text: string };
  luck: { rating: number; text: string };
  luckyColor: string;
  luckyNumber: number;
  affirmation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}