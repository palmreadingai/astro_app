import { useState, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { checkPalmAnalysisStatus } from '../services/palmCheckService';
import { PalmAnalysis } from '../types';

interface UsePalmAnalysisReturn {
  palmAnalysis: PalmAnalysis | null;
  isLoading: boolean;
  error: string | null;
  checkAndLoadAnalysis: () => Promise<{
    status: 'not_started' | 'processing' | 'completed' | 'failed';
    analysis?: PalmAnalysis;
    savedData?: any;
  }>;
  clearError: () => void;
}

export const usePalmAnalysis = (): UsePalmAnalysisReturn => {
  const { palmAnalysis, setPalmAnalysis } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAndLoadAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await checkPalmAnalysisStatus();
      
      // Automatically save completed analysis to global state
      if (result.status === 'completed' && result.analysis) {
        console.log('🔄 usePalmAnalysis: Saving completed analysis to global state');
        setPalmAnalysis(result.analysis);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check palm analysis status';
      setError(errorMessage);
      console.error('❌ usePalmAnalysis: Error checking analysis:', err);
      
      // Return a fallback result
      return { status: 'not_started' as const };
    } finally {
      setIsLoading(false);
    }
  }, [setPalmAnalysis]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    palmAnalysis,
    isLoading,
    error,
    checkAndLoadAnalysis,
    clearError,
  };
};