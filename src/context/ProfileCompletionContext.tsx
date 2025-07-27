import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AstroProfileService } from '../services/astroProfileService';

interface ProfileCompletionContextType {
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsComplete: () => void;
}

const ProfileCompletionContext = createContext<ProfileCompletionContextType | undefined>(undefined);

export const ProfileCompletionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const markAsComplete = useCallback(() => {
    setIsComplete(true);
  }, []);

  useEffect(() => {
    checkProfileCompletion();
  }, [checkProfileCompletion]);

  const value = {
    isComplete,
    isLoading,
    error,
    refresh,
    markAsComplete
  };

  return (
    <ProfileCompletionContext.Provider value={value}>
      {children}
    </ProfileCompletionContext.Provider>
  );
};

export const useProfileCompletionContext = (): ProfileCompletionContextType => {
  const context = useContext(ProfileCompletionContext);
  if (context === undefined) {
    throw new Error('useProfileCompletionContext must be used within a ProfileCompletionProvider');
  }
  return context;
};