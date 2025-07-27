import { useState, useCallback } from 'react';
import { AnalysisData } from '../types/palmTypes';

export interface LocalPalmProgress {
  palmImageUrl: string | null;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  analysisData: AnalysisData;
}

const DEFAULT_PROGRESS: LocalPalmProgress = {
  palmImageUrl: null,
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  analysisData: {
    images: [],
    answers: {},
  },
};

const STORAGE_KEY = 'palmProgress';

export const useLocalProgress = () => {
  const [progress, setProgressState] = useState<LocalPalmProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PROGRESS;
    } catch (error) {
      console.error('Error loading palm progress from localStorage:', error);
      return DEFAULT_PROGRESS;
    }
  });

  const setProgress = useCallback((newProgress: LocalPalmProgress) => {
    try {
      setProgressState(newProgress);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch (error) {
      console.error('Error saving palm progress to localStorage:', error);
    }
  }, []);

  const updateProgress = useCallback((updates: Partial<LocalPalmProgress>) => {
    setProgressState(prevProgress => {
      const newProgress = { ...prevProgress, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      } catch (error) {
        console.error('Error saving palm progress to localStorage:', error);
      }
      return newProgress;
    });
  }, []);

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setProgressState(DEFAULT_PROGRESS);
    } catch (error) {
      console.error('Error clearing palm progress from localStorage:', error);
    }
  }, []);

  const restoreFromDatabase = useCallback((dbData: any) => {
    try {
      const restoredProgress: LocalPalmProgress = {
        palmImageUrl: dbData.palmImageUrl || null,
        currentSectionIndex: dbData.currentSectionIndex || 0,
        currentQuestionIndex: dbData.currentQuestionIndex || 0,
        analysisData: {
          images: dbData.palmImageUrl ? [dbData.palmImageUrl] : [],
          answers: dbData.answers || {},
        },
      };
      setProgress(restoredProgress);
    } catch (error) {
      console.error('Error restoring palm progress from database:', error);
    }
  }, [setProgress]);

  return {
    progress,
    setProgress,
    updateProgress,
    clearProgress,
    restoreFromDatabase,
  };
};