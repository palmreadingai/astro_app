import { useState } from 'react';
import { MessageSquare, Star, Send, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../integrations/supabase/client';
import Breadcrumb from '../Layout/Breadcrumb';

interface FeedbackData {
  title: string;
  message: string;
  rating?: number;
  category: 'bug' | 'feature' | 'improvement' | 'general';
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FeedbackData>({
    title: '',
    message: '',
    rating: undefined,
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const categories = [
    { value: 'general', label: 'General Feedback', description: 'General comments or suggestions' },
    { value: 'bug', label: 'Bug Report', description: 'Report a problem or issue' },
    { value: 'feature', label: 'Feature Request', description: 'Suggest a new feature' },
    { value: 'improvement', label: 'Improvement', description: 'Suggest an enhancement' }
  ] as const;

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleCategorySelect = (category: 'bug' | 'feature' | 'improvement' | 'general') => {
    setFormData(prev => ({ ...prev, category }));
    setIsDropdownOpen(false);
  };

  const selectedCategory = categories.find(cat => cat.value === formData.category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in all required fields');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Please log in to submit feedback');
      }

      const response = await supabase.functions.invoke('submit-feedback', {
        body: {
          title: formData.title.trim(),
          message: formData.message.trim(),
          rating: formData.rating,
          category: formData.category
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to submit feedback');
      }

      setSubmitStatus('success');
      setFormData({
        title: '',
        message: '',
        rating: undefined,
        category: 'general'
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit feedback');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative overflow-hidden pb-20">
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/3 left-1/6 w-3 h-3 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
        <div className="absolute top-1/4 right-1/6 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-cyan-300 rounded-full animate-bounce opacity-70"></div>
        <div className="absolute top-1/6 left-1/3 w-1 h-1 bg-pink-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/6 right-1/6 w-2 h-2 bg-purple-300 rounded-full animate-bounce"></div>
      </div>

      <Breadcrumb
        items={[
          { label: 'Home', path: '/home' },
          { label: 'Feedback' }
        ]}
      />

      <div className="px-6 py-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Share Your Feedback</h1>
          <p className="text-purple-200">Help us improve your experience with Palm AI</p>
        </div>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="bg-green-500/20 backdrop-blur-md border border-green-400/50 rounded-xl p-4 mb-6 flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-200">Thank you for your feedback!</h3>
              <p className="text-sm text-green-300">We truly value your input and appreciate you helping us improve Palm AI.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === 'error' && (
          <div className="bg-red-500/20 backdrop-blur-md border border-red-400/50 rounded-xl p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-200">Error submitting feedback</h3>
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Feedback Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Feedback Category *
              </label>
              
              {/* Dropdown Button */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400/50 focus:bg-white/15 transition-all flex items-center justify-between"
              >
                <div className="text-left">
                  <div className="font-medium">{selectedCategory?.label}</div>
                  <div className="text-sm text-purple-300">{selectedCategory?.description}</div>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-purple-300 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : 'rotate-0'
                  }`} 
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/20 rounded-xl shadow-lg z-10 overflow-hidden">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => handleCategorySelect(category.value)}
                      className={`w-full p-4 text-left transition-all hover:bg-white/10 ${
                        formData.category === category.value
                          ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white'
                          : 'text-purple-200'
                      }`}
                    >
                      <div className="font-medium">{category.label}</div>
                      <div className="text-sm text-purple-300">{category.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-purple-200 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief title for your feedback"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 transition-all"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-purple-200 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Please share your detailed feedback, suggestions, or report any issues you've encountered..."
                rows={6}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 transition-all resize-none"
                required
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-3">
                Overall Rating (Optional)
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        formData.rating && star <= formData.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-purple-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {formData.rating && (
                <p className="text-sm text-purple-300 mt-2">
                  You rated us {formData.rating} out of 5 stars
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.message.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-purple-300">
            Your feedback helps us improve Palm AI. Thank you for taking the time to share your thoughts!
          </p>
        </div>
      </div>
    </div>
  );
}