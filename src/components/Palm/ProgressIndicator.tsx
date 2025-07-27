import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
}

export function CircularProgress({ percentage, size = 60 }: CircularProgressProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="5"
          fill="none"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth="5"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out drop-shadow-sm"
        />
      </svg>
      {/* Progress text in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-yellow-300">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

interface LinearProgressProps {
  percentage: number;
  className?: string;
}

export function LinearProgress({ percentage, className = '' }: LinearProgressProps) {
  return (
    <div className={`w-full bg-black/30 rounded-full h-2 shadow-inner ${className}`}>
      <div 
        className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}

interface Section {
  id: string;
  title: string;
  description: string;
  questions: Array<{
    id: string;
    type: string;
    question: string;
    options?: string[];
  }>;
}

interface ProgressPanelProps {
  overallProgress: number;
  currentQuestion: number;
  totalQuestions: number;
  sections: Section[];
  currentSectionIndex: number;
  sectionProgress: {
    current: number;
    total: number;
    percentage: number;
  };
}

const getSectionIcon = (sectionId: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'handType': '✋',
    'physical': '🔍',
    'quadrants': '📐',
    'majorLines': '📏',
    'timing': '⏰',
    'minorLines': '✨',
    'fingers': '🤏',
    'thumb': '👍',
    'mounts': '⛰️',
    'quadrangle': '🔲',
    'markings': '⭐',
    'fingerprints': '🔖',
    'comparison': '⚖️'
  };
  return iconMap[sectionId] || '📋';
};

export function ProgressPanel({ 
  overallProgress, 
  currentQuestion, 
  totalQuestions, 
  sections, 
  currentSectionIndex, 
  sectionProgress 
}: ProgressPanelProps) {
  const currentSection = sections[currentSectionIndex];
  
  return (
    <div className="bg-black/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-4 shadow-lg">
      {/* Header with overall progress */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <CircularProgress percentage={overallProgress} size={50} />
          <div>
            <h2 className="text-lg font-bold text-white">
              Question {currentQuestion} of {totalQuestions}
            </h2>
            <p className="text-xs text-purple-200 font-medium">
              {Math.round(overallProgress)}% Complete
            </p>
          </div>
        </div>
      </div>

      {/* Current Section Info */}
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-lg">{getSectionIcon(currentSection.id)}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm">
            {currentSection.title}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-yellow-300">
            {sectionProgress.current} / {sectionProgress.total}
          </span>
        </div>
      </div>
      <LinearProgress percentage={sectionProgress.percentage} />
    </div>
  );
}