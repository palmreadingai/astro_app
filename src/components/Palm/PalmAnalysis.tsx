import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Sparkles } from 'lucide-react';
import Breadcrumb from '../Layout/Breadcrumb';
import ImageUpload from './ImageUpload';
import Questions from './Questions';
import Results from './Results';
import AuthGuard from '../Auth/AuthGuard';
import Footer from '../Layout/Footer';
import PaymentRequiredModal from '../Common/PaymentRequiredModal';
import { AnalysisData } from '../../types/palmTypes';
import { palmQuestions } from '../../data/palmQuestions';
import { generatePalmProfile } from '../../utils/palmProfile';
import { supabase } from '../../integrations/supabase/client';
import { usePayment } from '../../context/PaymentContext';

import { useAppStore } from '../../stores/appStore';
import { useLocalProgress } from '../../hooks/useLocalProgress';
import { usePalmAnalysis } from '../../hooks/usePalmAnalysis';

export default function PalmAnalysis() {
  const navigate = useNavigate();
  const { setPalmAnalysis } = useAppStore();
  const { hasPaid, isLoading: isCheckingPayment } = usePayment();
  const { progress, updateProgress, restoreFromDatabase } = useLocalProgress();
  const { palmAnalysis, checkAndLoadAnalysis } = usePalmAnalysis();
  
  // Initialize state from localStorage via hook
  const [step, setStep] = useState(1);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(progress.currentSectionIndex);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(progress.currentQuestionIndex);
  const [analysisData, setAnalysisData] = useState<AnalysisData>(progress.analysisData);
  const [palmImageUrl, setPalmImageUrl] = useState<string | null>(progress.palmImageUrl);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<'idle' | 'generating' | 'analyzing' | 'completing'>('idle');
  const [checkingExistingAnalysis, setCheckingExistingAnalysis] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    if (!checkingExistingAnalysis && step > 0) {
      updateProgress({
        palmImageUrl,
        currentSectionIndex,
        currentQuestionIndex,
        analysisData
      });
    }
  }, [currentSectionIndex, currentQuestionIndex, analysisData, palmImageUrl, checkingExistingAnalysis, updateProgress]);


  useEffect(() => {
    const checkForExistingAnalysis = async () => {
      try {
        // Check payment status - if not paid, show modal
        if (!hasPaid && !isCheckingPayment) {
          setShowPaymentModal(true);
          setCheckingExistingAnalysis(false);
          return;
        }

        // If still checking payment, wait
        if (isCheckingPayment) {
          return;
        }

        // Payment verified, continue with analysis check
        // First check if we already have analysis in global state
        if (palmAnalysis) {
          setStep(4); // Go directly to results
          setCheckingExistingAnalysis(false);
          return;
        }

        // Use centralized hook to check server status
        const result = await checkAndLoadAnalysis();
        
        switch (result.status) {
          case 'completed':
            if (result.analysis) {
              setStep(4); // Go directly to results
            }
            break;
            
          case 'processing':
            setStep(3); // Show processing screen
            setAnalysisProgress('analyzing');
            // Start polling for completion
            startPolling();
            break;
            
          case 'failed':
            // Smart restore: use database data if localStorage is empty
            if (result.savedData && (!progress.palmImageUrl || Object.keys(progress.analysisData.answers).length === 0)) {
              restoreFromDatabase(result.savedData);
            }
            setStep(2);
            setAnalysisError('Previous analysis failed. Please review your answers and try again.');
            // Keep current position from localStorage (don't force navigation)
            setCurrentSectionIndex(progress.currentSectionIndex);
            setCurrentQuestionIndex(progress.currentQuestionIndex);
            break;
            
          default:
            // not_started - start fresh or continue from localStorage
            if (progress.palmImageUrl || Object.keys(progress.analysisData.answers).length > 0) {
              setStep(2); // Continue with questions
              setCurrentSectionIndex(progress.currentSectionIndex);
              setCurrentQuestionIndex(progress.currentQuestionIndex);
            } else {
              setStep(1); // Start from image upload
            }
            break;
        }
        
        setCheckingExistingAnalysis(false);
      } catch (error) {
        console.error('Error checking existing analysis:', error);
        setCheckingExistingAnalysis(false);
        setStep(1); // Default to image upload on error
      }
    };

    // Only run this check on initial load
    if (checkingExistingAnalysis) {
      checkForExistingAnalysis();
    }
  }, [palmAnalysis, hasPaid, isCheckingPayment, checkingExistingAnalysis, progress, restoreFromDatabase, checkAndLoadAnalysis]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleImageUpload = async (imageUrl: string, base64: string) => {
    setPalmImageUrl(imageUrl);
    setAnalysisData(prev => ({ ...prev, images: [imageUrl] }));
  };


  const handleAnswerSelect = async (questionId: string, answer: string | string[]) => {
    const newAnswers = { ...analysisData.answers, [questionId]: answer };
    setAnalysisData(prev => ({
      ...prev,
      answers: newAnswers
    }));
  };

  const getTotalQuestions = () => {
    return palmQuestions.reduce((total, section) => total + section.questions.length, 0);
  };

  const getCurrentQuestionNumber = () => {
    let questionNumber = 0;
    for (let i = 0; i < currentSectionIndex; i++) {
      questionNumber += palmQuestions[i].questions.length;
    }
    return questionNumber + currentQuestionIndex + 1;
  };

  const goToNextQuestion = () => {
    const currentSection = palmQuestions[currentSectionIndex];
    
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSectionIndex < palmQuestions.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      generateAnalysis();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentQuestionIndex(palmQuestions[currentSectionIndex - 1].questions.length - 1);
    }
  };

  const goBackToImageUpload = () => {
    setStep(1);
  };

  // Polling function for processing status
  const startPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const pollForCompletion = async () => {
      try {
        const result = await checkAndLoadAnalysis();
        
        if (result.status === 'completed' && result.analysis) {
          setAnalysisProgress('completing');
          setTimeout(() => {
            setStep(4);
            setAnalysisProgress('idle');
            if (pollingInterval) {
              clearInterval(pollingInterval);
              setPollingInterval(null);
            }
          }, 1000);
        } else if (result.status === 'failed') {
          setAnalysisError('Analysis failed. Please try again.');
          setAnalysisProgress('idle');
          setStep(2); // Back to questions
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
        // Continue polling if still processing
      } catch (error) {
        console.error('Polling error:', error);
        // Continue polling on error - don't stop unless user manually stops
      }
    };

    const interval = setInterval(pollForCompletion, 15000); // Poll every 15 seconds
    setPollingInterval(interval);
  }, [pollingInterval, checkAndLoadAnalysis]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);



  const generateAnalysis = async () => {
    setStep(3);
    setAnalysisError(null);
    setAnalysisProgress('generating');
    
    try {
      // Generate palm profile from user answers
      setAnalysisProgress('generating');
      const palmProfile = generatePalmProfile(analysisData.answers);
      
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to generate palm analysis');
      }

      // Call the edge function directly
      setAnalysisProgress('analyzing');
      const { data: analysisResult, error } = await supabase.functions.invoke('generate-palm-reading', {
        body: { 
          palmProfile,
          palmImageUrl
        }
      });

      if (error) {
        // Handle specific status errors
        if (error.message?.includes('already in progress')) {
          setAnalysisError('Analysis is already in progress. Please wait...');
          setStep(3);
          setAnalysisProgress('analyzing');
          startPolling();
          return;
        } else if (error.message?.includes('already completed')) {
          setAnalysisError('Analysis already completed. Redirecting to results...');
          // Check for the completed analysis
          const result = await checkAndLoadAnalysis();
          if (result.status === 'completed' && result.analysis) {
            setStep(4);
            return;
          }
        }
        throw new Error(error.message || 'Failed to generate palm analysis');
      }

      if (!analysisResult || typeof analysisResult !== 'object') {
        throw new Error('Invalid response format from analysis service');
      }
      
      setAnalysisProgress('completing');
      
      // Auto-save analysis to local store
      setPalmAnalysis(analysisResult);
      
      // Small delay to show completion state
      setTimeout(() => {
        setStep(4);
        setAnalysisProgress('idle');
      }, 1000);
    } catch (error) {
      console.error('Error generating palm analysis:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Failed to generate analysis');
      setAnalysisProgress('idle');
    }
  };

  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Home', path: '/home' },
      { label: 'Palm Reading' }
    ];

    if (step > 1) {
      switch (step) {
        case 2:
          items.push({ label: 'Questions' });
          break;
        case 3:
          items.push({ label: 'Analysis' });
          break;
        case 4:
          items.push({ label: 'Results' });
          break;
      }
    }

    return items;
  };

  const renderStep = () => {
    // Show loading state while checking for existing analysis
    if (checkingExistingAnalysis) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center bg-black/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-8">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Checking Palm Analysis</h3>
            <p className="text-purple-200">Looking for your existing palm reading...</p>
          </div>
        </div>
      );
    }

    switch (step) {
      case 1:
        return (
          <ImageUpload
            images={analysisData.images}
            onImageUpload={handleImageUpload}
            onContinue={() => setStep(2)}
          />
        );

      case 2:
        return (
          <Questions
            sections={palmQuestions}
            currentSectionIndex={currentSectionIndex}
            currentQuestionIndex={currentQuestionIndex}
            analysisData={analysisData}
            onAnswerSelect={handleAnswerSelect}
            onNext={goToNextQuestion}
            onPrevious={goToPreviousQuestion}
            onBackToImageUpload={goBackToImageUpload}
            getTotalQuestions={getTotalQuestions}
            getCurrentQuestionNumber={getCurrentQuestionNumber}
            analysisError={analysisError}
          />
        );

      case 3: {
        const getProgressMessage = () => {
          switch (analysisProgress) {
            case 'generating':
              return 'Generating palm profile from your answers...';
            case 'analyzing':
              return 'Analyzing your palm characteristics with AI... This may take up to 2 minutes.';
            case 'completing':
              return 'Finalizing your personalized reading...';
            default:
              return 'Processing your responses and generating insights...';
          }
        };

        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center bg-black/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-8">
              <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-white mb-2">Analyzing Your Palm</h3>
              <p className="text-purple-200 mb-4">{getProgressMessage()}</p>
              
              {analysisProgress === 'analyzing' && (
                <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm">
                  <p className="text-blue-200 text-sm">
                    💡 Your analysis will be saved automatically. You can safely close this page and return later.
                  </p>
                </div>
              )}
              
              {analysisError && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm">
                  <p className="text-red-200 text-sm">
                    {analysisError}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 4:
        return (
          <>
            <Results
              analysisResult={palmAnalysis}
              onBackToHome={() => navigate('/home')}
            />
            {/* Chat CTA Section */}
            <div className="mt-6">
              <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-purple-500/30 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <MessageCircle className="w-16 h-16 text-purple-400 animate-pulse" />
                  </div>
                  <h3 className="text-white text-2xl font-bold mb-4">
                    Explore Your Reading Further
                  </h3>
                  <p className="text-purple-200 mb-8 text-lg leading-relaxed max-w-2xl mx-auto">
                    Have questions about your detailed palm analysis? Get personalized insights and ask specific 
                    questions about any aspect of your reading with our AI palmist.
                  </p>
                  <button 
                    onClick={() => navigate('/chat')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl inline-flex items-center"
                  >
                    <MessageCircle className="w-6 h-6 mr-3" />
                    Start Personal Palm Chat
                    <Sparkles className="w-6 h-6 ml-3" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Add spacing before footer */}
            <div className="mb-12"></div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative">
        <Breadcrumb
          items={getBreadcrumbItems()}
        />
        
        <div className="px-6 py-6">
          {renderStep()}
        </div>
        
        {/* Payment Required Modal */}
        <PaymentRequiredModal 
          isOpen={showPaymentModal}
          title="Premium Palm Reading"
          message="Unlock detailed palm analysis with AI-powered insights. Get personalized readings based on your unique palm patterns with lifetime access!"
          feature="palm reading analysis"
        />
      </div>
      
      <Footer />
    </AuthGuard>
  );
}
