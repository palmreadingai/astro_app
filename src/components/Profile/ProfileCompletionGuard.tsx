import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useProfileCompletionContext } from '../../context/ProfileCompletionContext';

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
}

export default function ProfileCompletionGuard({ children }: ProfileCompletionGuardProps) {
  const { isComplete, isLoading, error } = useProfileCompletionContext();
  const location = useLocation();

  // Don't check profile completion for the completion page itself
  const isCompletionPage = location.pathname === '/complete-profile';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-200">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-200 mb-4">Error loading profile information:</p>
          <p className="text-red-300 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If profile is not complete and user is not on completion page, redirect to completion
  if (!isComplete && !isCompletionPage) {
    return <Navigate to="/complete-profile" replace />;
  }

  // If profile is complete and user is on completion page, redirect to home
  if (isComplete && isCompletionPage) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}