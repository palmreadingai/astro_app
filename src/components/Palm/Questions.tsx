import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Question, Section, AnalysisData } from '../../types/palmTypes';
import { ProgressPanel } from './ProgressIndicator';

interface QuestionsProps {
  sections: Section[];
  currentSectionIndex: number;
  currentQuestionIndex: number;
  analysisData: AnalysisData;
  onAnswerSelect: (questionId: string, answer: string | string[], isMultiple?: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
  onBackToImageUpload: () => void;
  getTotalQuestions: () => number;
  getCurrentQuestionNumber: () => number;
  analysisError?: string | null;
}

export default function Questions({
  sections,
  currentSectionIndex,
  currentQuestionIndex,
  analysisData,
  onAnswerSelect,
  onNext,
  onPrevious,
  onBackToImageUpload,
  getTotalQuestions,
  getCurrentQuestionNumber,
  analysisError
}: QuestionsProps) {
  const currentSection = sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  const currentAnswer = analysisData.answers[currentQuestion?.id || ''];
  
  const hasAnswer = currentAnswer !== undefined && currentAnswer !== null && 
    (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : currentAnswer !== '');

  const getOverallProgress = () => {
    return (getCurrentQuestionNumber() / getTotalQuestions()) * 100;
  };

  const getSectionProgress = () => {
    return {
      current: currentQuestionIndex + 1,
      total: currentSection.questions.length,
      percentage: ((currentQuestionIndex + 1) / currentSection.questions.length) * 100
    };
  };

  const renderQuestionInput = (question: Question) => {
    const hasAnyImages = question.images && question.images.some(img => img !== null);
    const hasQuestionImage = question.questionImage;
    
    const renderOption = (option: string, index: number) => {
      const hasImage = question.images && question.images[index] && question.images[index] !== null;
      const isSelected = question.type === 'multiple' 
        ? ((currentAnswer as string[]) || []).includes(option)
        : currentAnswer === option;
      
      const handleClick = () => {
        if (question.type === 'multiple') {
          const selectedOptions = (currentAnswer as string[]) || [];
          const isCurrentlySelected = selectedOptions.includes(option);
          const newSelection = isCurrentlySelected
            ? selectedOptions.filter(item => item !== option)
            : [...selectedOptions, option];
          onAnswerSelect(question.id, newSelection, true);
        } else {
          onAnswerSelect(question.id, option);
        }
      };

      // Card Grid Layout for options with images (when not using questionImage)
      if (hasAnyImages && !hasQuestionImage) {
        return (
          <button
            key={option}
            onClick={handleClick}
            className={`relative h-80 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl bg-white ${
              isSelected
                ? 'border-purple-600 shadow-lg ring-2 ring-purple-600/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Selection indicator */}
            <div className="absolute top-5 right-5 z-10">
              <div className={`w-8 h-8 ${question.type === 'multiple' ? 'rounded border-2' : 'rounded-full border-2'} flex items-center justify-center transition-all shadow-md ${
                isSelected
                  ? 'border-purple-600 bg-purple-600'
                  : 'border-gray-400 bg-gray-200'
              }`}>
                {question.type === 'multiple' 
                  ? isSelected && <Check className="w-5 h-5 text-white" />
                  : isSelected && <div className="w-4 h-4 bg-white rounded-full"></div>
                }
              </div>
            </div>

            {hasImage && (
              <>
                {/* Image section - takes up most of the card */}
                <div className="h-60 p-4">
                  <img
                    src={question.images![index]}
                    alt={`Reference for ${option}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                
                {/* Text caption section */}
                <div className={`h-20 px-5 py-4 border-t transition-colors ${
                  isSelected ? 'bg-purple-100 border-purple-300' : 'bg-gray-50 border-gray-200'
                }`}>
                  <span className={`text-lg font-medium leading-tight block text-center ${
                    isSelected ? 'text-purple-700' : 'text-gray-800'
                  }`}>
                    {option}
                  </span>
                </div>
              </>
            )}
          </button>
        );
      }

      // Simple text-only options (for questions with questionImage or no images)
      return (
        <button
          key={option}
          onClick={handleClick}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
            isSelected
              ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
              : 'border-purple-400/30 hover:border-purple-400/50 bg-black/20'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-5 h-5 ${question.type === 'multiple' ? 'rounded border-2' : 'rounded-full border-2'} flex items-center justify-center ${
              isSelected
                ? 'border-yellow-400 bg-yellow-400'
                : 'border-white/50'
            }`}>
              {question.type === 'multiple' 
                ? isSelected && <Check className="w-3 h-3 text-white" />
                : isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>
              }
            </div>
            <span className={`font-medium ${isSelected ? 'text-yellow-300' : 'text-white'}`}>{option}</span>
          </div>
        </button>
      );
    };

    return (
      <div className="space-y-4">
        {/* Question Image - Display below question text */}
        {hasQuestionImage && (
          <div className="flex justify-center">
            <div className="max-w-md">
              <img
                src={question.questionImage}
                alt={`Reference image for ${question.question}`}
                className="w-full h-auto object-contain rounded-lg shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
        
        {/* Options */}
        <div className={hasAnyImages && !hasQuestionImage ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
          {question.options.map((option, index) => renderOption(option, index))}
        </div>
      </div>
    );
  };

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {analysisError && (
        <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-red-200 text-sm">
            {analysisError}
          </p>
        </div>
      )}

      {/* Progress Panel */}
      <ProgressPanel 
        overallProgress={getOverallProgress()}
        currentQuestion={getCurrentQuestionNumber()}
        totalQuestions={getTotalQuestions()}
        sections={sections}
        currentSectionIndex={currentSectionIndex}
        sectionProgress={getSectionProgress()}
      />

      {/* Question Card */}
      <div className="bg-black/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            {currentQuestion.question}
          </h3>
          {currentQuestion.type === 'multiple' && (
            <p className="text-sm text-purple-200">Select all that apply</p>
          )}
        </div>

        {renderQuestionInput(currentQuestion)}
      </div>

      {/* Navigation Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={currentSectionIndex === 0 && currentQuestionIndex === 0 ? onBackToImageUpload : onPrevious}
          className="flex items-center space-x-2 px-6 py-3 bg-black/30 text-white rounded-xl font-medium hover:bg-black/40 transition-colors border border-purple-500/30"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentSectionIndex === 0 && currentQuestionIndex === 0 ? 'Back to Image' : 'Previous'}</span>
        </button>
        
        <button
          onClick={onNext}
          disabled={!hasAnswer}
          className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>
            {currentSectionIndex === sections.length - 1 && 
             currentQuestionIndex === sections[currentSectionIndex].questions.length - 1
              ? 'Generate Analysis' 
              : 'Next'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}