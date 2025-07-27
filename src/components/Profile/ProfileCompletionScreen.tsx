import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AstroProfileService, AstroProfileData } from '../../services/astroProfileService';
import { useProfileCompletionContext } from '../../context/ProfileCompletionContext';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';

interface FormData {
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
}

export default function ProfileCompletionScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { markAsComplete } = useProfileCompletionContext();
  const [formData, setFormData] = useState<FormData>({
    dateOfBirth: '',
    gender: 'male'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    if (!formData.gender) {
      setError('Gender selection is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const profileData: AstroProfileData = {
        dateOfBirth: formData.dateOfBirth,
        timeOfBirth: null,
        placeOfBirth: null,
        gender: formData.gender
      };

      await AstroProfileService.createOrUpdateProfile(profileData);

      // Mark profile as complete in context
      markAsComplete();
      
      // Show success message briefly then navigate
      setError(null);
      setIsSuccess(true);
      
      // Navigate after a brief moment to show success message
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 800);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/3 left-1/6 w-3 h-3 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
        <div className="absolute top-1/4 right-1/6 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-cyan-300 rounded-full animate-bounce opacity-70"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
            <p className="text-purple-200">
              We need a few details to provide you with personalized astrology insights
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date of Birth */}
              <div>
                <label className="flex items-center text-sm font-medium text-purple-200 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  required
                />
              </div>


              {/* Gender */}
              <div>
                <label className="flex items-center text-sm font-medium text-purple-200 mb-2">
                  <Users className="w-4 h-4 mr-2" />
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value as FormData['gender'])}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  required
                >
                  <option value="male" className="bg-purple-900">Male</option>
                  <option value="female" className="bg-purple-900">Female</option>
                  <option value="other" className="bg-purple-900">Other</option>
                </select>
              </div>

              {/* Success Message */}
              {isSuccess && (
                <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-3">
                  <p className="text-green-200 text-sm">✅ Profile completed successfully! Redirecting...</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-purple-800 disabled:to-pink-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <span>✅ Profile Completed!</span>
                  </>
                ) : (
                  <>
                    <span>Complete Profile</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-purple-300">
                * Required fields. Your information is secure and private.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}