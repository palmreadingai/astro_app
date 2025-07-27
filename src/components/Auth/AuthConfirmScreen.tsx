import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAppStore } from '../../stores/appStore';

export default function AuthConfirmScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const confirmAuth = async () => {
      try {
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const next = searchParams.get('next');

        if (!tokenHash || !type) {
          throw new Error('Invalid confirmation link. Missing required parameters.');
        }

        // Verify OTP token using PKCE flow
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change' | 'phone_change',
        });

        if (error) {
          console.error('Token verification error:', error);
          throw error;
        }

        if (data.session && data.user) {
          // Update app store with user data
          setUser({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || '',
            dateOfBirth: '',
            gender: 'other'
          });

          setSuccess(true);

          // Redirect after a brief success display
          setTimeout(() => {
            if (next) {
              navigate(next);
            } else if (type === 'signup') {
              navigate('/home');
            } else if (type === 'recovery') {
              navigate('/account/update-password');
            } else {
              navigate('/home');
            }
          }, 2000);
        } else {
          throw new Error('Authentication failed. Please try again.');
        }
      } catch (error: any) {
        console.error('Auth confirmation error:', error);
        
        let errorMessage = 'Authentication failed. Please try again.';
        
        if (error.message?.includes('Token has expired')) {
          errorMessage = 'This confirmation link has expired. Please request a new one.';
        } else if (error.message?.includes('Invalid token')) {
          errorMessage = 'This confirmation link is invalid. Please request a new one.';
        } else if (error.message?.includes('already been used')) {
          errorMessage = 'This confirmation link has already been used.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    confirmAuth();
  }, [searchParams, navigate, setUser]);

  const handleRetry = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            </div>
          </div>

          {loading && (
            <>
              <h1 className="text-2xl font-bold text-white mb-4">
                Confirming Your Account
              </h1>
              <p className="text-purple-200 mb-6">
                Please wait while we verify your account...
              </p>
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
            </>
          )}

          {success && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Account Confirmed!
              </h1>
              <p className="text-purple-200 mb-6">
                Your account has been successfully verified. Redirecting you now...
              </p>
            </>
          )}

          {error && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="w-16 h-16 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Confirmation Failed
              </h1>
              <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Back to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}