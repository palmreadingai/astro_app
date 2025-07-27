export interface Question {
  id: string;
  type: 'single' | 'multiple' | 'yesno';
  question: string;
  options: string[];
  images?: string[];
  questionImage?: string;
  followUp?: {
    condition: string;
    questions: Question[];
  };
}

export interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface AnalysisData {
  images: string[];
  answers: Record<string, string | string[]>;
}

export interface CareerAnalysis {
  description?: string;
  suitedFields?: string[];
  workStyle?: string;
  leadership?: string;
}

export interface RelationshipsAnalysis {
  description?: string;
  strengths?: string[];
  challenges?: string[];
  compatibility?: string;
}

export interface HealthAnalysis {
  description?: string;
  recommendations?: string[];
  vitality?: string;
  concerns?: string[];
}

export interface MajorLinesAnalysis {
  heartLine?: string;
  headLine?: string;
  lifeLine?: string;
  destinyLine?: string;
}

export interface DetailedPalmAnalysis {
  id: string;
  userId: string;
  createdAt: string;
  profile?: {
    imageUrl?: string;
    questions?: Record<string, string | number>;
    metadata?: Record<string, unknown>;
  };
  overview_and_profile?: Record<string, unknown>;
  detailed_analysis?: Record<string, unknown>;
  insights_and_summary?: Record<string, unknown>;
  palmType?: string;
  personalityTraits?: string[] | Record<string, unknown>;
  career?: CareerAnalysis;
  relationships?: RelationshipsAnalysis;
  health?: HealthAnalysis;
  majorLines?: MajorLinesAnalysis;
  futureInsights?: string[] | Record<string, unknown>;
}

export interface PalmAnalysisResult {
  id: string;
  userId: string;
  palmType: 'earth' | 'air' | 'fire' | 'water';
  heartLine: string;
  headLine: string;
  lifeLine: string;
  personalityTraits: string[];
  futureInsights: string[];
  createdAt: string;
}