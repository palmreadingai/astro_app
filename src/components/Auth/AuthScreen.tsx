import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { useAppStore } from '../../stores/appStore';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const navigate = useNavigate();
  const { setUser, authMode } = useAppStore();
  const [isSignUp, setIsSignUp] = useState(authMode === 'signup');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Remove custom redirectTo - let email template handle the redirect
      const { data, error } = await supabase.auth.resetPasswordForEmail(resetEmail);

      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }

      setMessage('If an account exists with this email, you will receive a password reset link shortly.');
    } catch (error: any) {
      console.error('Password reset error details:', error);
      
      let errorMessage = 'An unexpected error occurred while sending the reset email. Please try again.';
      
      if (error.code === 'user_not_found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'email_address_invalid') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'over_email_send_rate_limit') {
        errorMessage = 'Too many reset emails sent. Please wait before trying again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (isSignUp && !formData.fullName) {
      setError('Please enter your full name');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            },
          },
        });

        if (error) {
          console.error('Signup error:', error);
          throw error;
        }

        if (data.user && !data.session) {
          if (data.user.role === 'authenticated') {
            // Unverified user - email sent (new signup or existing unverified)
            setShowSuccessCard(true);
            setMessage('Account created successfully! Please check your email and click the confirmation link to complete your registration.');
          } else {
            // Verified user - email enumeration protection
            setMessage('An account with this email already exists. Please sign in instead.');
          }
        } else if (data.user && data.session) {
          // User is automatically signed in (email confirmation disabled)
          setUser({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || '',
            dateOfBirth: '',
            gender: 'other'
          });
          onSuccess?.();
          navigate('/home');
        } else {
          setShowSuccessCard(true);
          setMessage('Account created successfully. Please check your email for verification.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          console.error('Signin error:', error);
          throw error;
        }

        if (data.session) {
          setUser({
            id: data.user!.id,
            email: data.user!.email!,
            name: data.user!.user_metadata?.full_name || '',
            dateOfBirth: '',
            gender: 'other'
          });
          onSuccess?.();
          navigate('/home');
        }
      }
    } catch (error: any) {
      console.error('Auth error details:', error);
      
      // Handle specific error types using error codes
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.code === 'email_exists' || error.code === 'user_already_exists') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.code === 'invalid_credentials') {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.code === 'email_not_confirmed') {
        errorMessage = 'Please check your email and click the verification link.';
      } else if (error.code === 'weak_password') {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.code === 'email_address_invalid') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message && error.message.includes('For security purposes, you can only request this after')) {
        // Handle rate limiting error - show the actual message from Supabase
        errorMessage = error.message;
      } else if (error.message && error.message.includes('Too Many Requests')) {
        errorMessage = 'Too many signup attempts. Please wait a moment before trying again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLanding = () => {
    navigate('/');
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
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 relative">
          {/* Back Button */}
          <button
            onClick={handleBackToLanding}
            className="absolute top-6 left-6 p-2 rounded-full hover:bg-white/10 transition-colors group"
            aria-label="Back to landing page"
          >
            <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
          </button>

          <div className="text-center mb-8 mt-4">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              {isSignUp ? 'Join Palm AI' : isForgotPassword ? 'Reset Password' : 'Welcome Back'}
            </h1>
            <p className="text-purple-200">
              {isSignUp 
                ? 'Create your account to get started' 
                : isForgotPassword
                ? 'Enter your email to receive a password reset link'
                : 'Sign in to continue your palm reading'}
            </p>
          </div>

          {error && !showSuccessCard && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {message && !showSuccessCard && (
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm">
              <p className="text-blue-200 text-sm">{message}</p>
            </div>
          )}

          {showSuccessCard ? (
            <div className="text-center space-y-6">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <CheckCircle className="w-20 h-20 text-green-400 animate-pulse" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
                </div>
              </div>

              {/* Success Message */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  Account Created Successfully!
                </h2>
                <div className="p-4 bg-green-500/20 border border-green-400/30 rounded-lg backdrop-blur-sm">
                  <p className="text-green-200 text-lg leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-purple-200">
                  <Mail className="w-5 h-5" />
                  <span>Check your email inbox and spam folder</span>
                </div>
                
                <button
                  onClick={() => {
                    setShowSuccessCard(false);
                    setIsSignUp(false);
                    setMessage(null);
                    setFormData({ email: '', password: '', fullName: '' });
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Go to Sign In
                </button>
              </div>
            </div>
          ) : isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      setError(null);
                    }}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-purple-300 backdrop-blur-sm"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 transform hover:scale-105 shadow-lg"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-purple-300 backdrop-blur-sm"
                    placeholder="Enter your full name"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-purple-300 backdrop-blur-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-purple-300 backdrop-blur-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 transform hover:scale-105 shadow-lg"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>

            {!isSignUp && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError(null);
                    setMessage(null);
                    setResetEmail(formData.email);
                  }}
                  className="text-purple-300 hover:text-purple-200 text-sm underline transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </form>
          )}

          {!showSuccessCard && (
            <div className="mt-6 text-center">
              {isForgotPassword ? (
              <div className="space-y-2">
                <p className="text-purple-200 text-sm">
                  Remember your password?
                </p>
                <button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError(null);
                    setMessage(null);
                    setResetEmail('');
                  }}
                  className="text-yellow-400 hover:text-yellow-300 font-medium border border-yellow-400/30 hover:border-yellow-300/50 px-4 py-2 rounded-lg transition-all duration-300"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                <p className="text-purple-200 mb-2">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </p>
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setMessage(null);
                    setFormData({ email: '', password: '', fullName: '' });
                  }}
                  className="text-yellow-400 hover:text-yellow-300 font-medium border border-yellow-400/30 hover:border-yellow-300/50 px-4 py-2 rounded-lg transition-all duration-300"
                >
                  {isSignUp ? 'Sign In as Existing User' : 'Sign Up'}
                </button>
              </>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}