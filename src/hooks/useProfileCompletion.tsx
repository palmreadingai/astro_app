import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { AstroProfileService } from '../services/astroProfileService';

interface ProfileCompletionStatus {
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useProfileCompletion = (): ProfileCompletionStatus => {
  const { user } = useAuth();
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkProfileCompletion = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const isProfileComplete = await AstroProfileService.isProfileComplete();
      setIsComplete(isProfileComplete);
    } catch (err) {
      console.error('Error checking profile completion:', err);
      setError(err instanceof Error ? err.message : 'Failed to check profile completion');
      setIsComplete(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refresh = useCallback(async () => {
    await checkProfileCompletion();
  }, [checkProfileCompletion]);

  useEffect(() => {
    checkProfileCompletion();
  }, [checkProfileCompletion]);

  return { isComplete, isLoading, error, refresh };
};