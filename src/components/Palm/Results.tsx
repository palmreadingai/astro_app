import React, { useState } from 'react';
import { Download, Home, Sparkles, Heart, Briefcase, Activity, DollarSign, Star, Brain } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PalmReadingReport from './PalmReadingReport';

export interface PalmAnalysisResult {
  id: string;
  userId: string;
  createdAt: string;
  profile?: {
    imageUrl?: string;
    questions?: Record<string, string | number>;
    metadata?: Record<string, unknown>;
  };
  overview_and_profile?: {
    personality_overview?: {
      title: string;
      content: string;
      traits: string[];
    };
    analysis_highlights?: {
      career_card?: {
        title: string;
        summary: string;
        key_points: string[];
      };
      life_destiny_card?: {
        title: string;
        summary: string;
        key_points: string[];
      };
      love_relationships_card?: {
        title: string;
        summary: string;
        key_points: string[];
      };
      health_vitality_card?: {
        title: string;
        summary: string;
        key_points: string[];
      };
      financial_prosperity_card?: {
        title: string;
        summary: string;
        key_points: string[];
      };
      spiritual_growth_card?: {
        title: string;
        summary: string;
        key_points: string[];
      };
    };
  };
  detailed_analysis?: Record<string, any>;
  insights_and_summary?: {
    final_conclusion?: {
      comprehensive_summary?: {
        title: string;
        overall_personality: string;
        life_themes: string[];
        strongest_traits: string[];
        areas_for_growth: string[];
        life_path_direction: string;
        unique_gifts: string[];
      };
    };
    actionable_guidance?: {
      career_guidance?: {
        title: string;
        recommended_fields: string[];
        work_style_tips: string[];
        leadership_potential: string;
        professional_growth: string;
      };
      relationship_guidance?: {
        title: string;
        compatibility_traits: string;
        relationship_tips: string[];
        communication_advice: string;
        emotional_growth: string;
      };
      health_guidance?: {
        title: string;
        stress_management: string;
        wellness_tips: string[];
        energy_optimization: string;
        preventive_care: string;
      };
      spiritual_guidance?: {
        title: string;
        meditation_practices: string;
        intuition_development: string;
        personal_growth: string[];
        life_purpose: string;
      };
      financial_guidance?: {
        title: string;
        money_management: string;
        investment_style: string;
        wealth_building: string[];
        prosperity_mindset: string;
      };
    };
  };
}

interface ResultsProps {
  analysisResult: PalmAnalysisResult | null;
  onBackToHome: () => void;
}

const parseTextWithReferences = (text: string) => {
  if (!text) return text;

  const referencePattern = /\[([^\]]+)\]<([^>]+)>/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = referencePattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    const linkText = match[1];
    const reference = match[2];
    
    parts.push(
      <span 
        key={match.index}
        className="text-yellow-300 font-semibold cursor-help border-b border-yellow-300/50 border-dotted"
        title={`Reference: ${reference}`}
      >
        {linkText}
      </span>
    );
    
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 1 ? <>{parts}</> : text;
};

const renderHighlightCard = (title: string, cardData: any, icon: React.ElementType, gradient: string) => {
  if (!cardData) return null;

  return (
    <div className={`bg-gradient-to-br ${gradient} backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl`}>
      <div className="flex items-center space-x-3 mb-4">
        {React.createElement(icon, { className: "w-8 h-8 text-white" })}
        <h3 className="text-xl font-bold text-white">{cardData.title || title}</h3>
      </div>
      <p className="text-white/90 mb-4 leading-relaxed">
        {parseTextWithReferences(cardData.summary)}
      </p>
      {cardData.key_points && cardData.key_points.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-white/80 text-sm">Key Insights:</h4>
          <ul className="space-y-1">
            {cardData.key_points.map((point: string, index: number) => (
              <li key={index} className="text-white/80 text-sm flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>{parseTextWithReferences(point)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const renderGuidanceCard = (title: string, guidance: any, icon: React.ElementType) => {
  if (!guidance) return null;

  const fields = guidance.recommended_fields || guidance.work_style_tips || guidance.relationship_tips || guidance.wellness_tips || guidance.personal_growth || guidance.wealth_building;

  return (
    <div className="bg-black/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center space-x-3 mb-4">
        {React.createElement(icon, { className: "w-6 h-6 text-purple-400" })}
        <h3 className="text-lg font-bold text-white">{guidance.title || title}</h3>
      </div>
      {fields && (
        <ul className="space-y-2">
          {fields.map((item: string, index: number) => (
            <li key={index} className="text-purple-100 text-sm flex items-start">
              <span className="text-yellow-400 mr-2 mt-1">•</span>
              <span>{parseTextWithReferences(item)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function Results({ analysisResult, onBackToHome }: ResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'guidance'>('overview');

  if (!analysisResult) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-black/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Analysis Available</h3>
          <p className="text-purple-200 mb-4">We couldn't find your palm analysis results.</p>
          <button
            onClick={onBackToHome}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Star },
    { id: 'detailed', label: 'Detailed Analysis', icon: Brain },
    { id: 'guidance', label: 'Life Guidance', icon: Sparkles }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Palm Reading Results</h2>
        <p className="text-purple-200">Discover insights into your personality and life path</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-black/30 backdrop-blur-lg border border-purple-500/30 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Personality Overview */}
            {analysisResult.overview_and_profile?.personality_overview && (
              <div className="bg-black/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Star className="w-6 h-6 mr-3 text-yellow-400" />
                  {analysisResult.overview_and_profile.personality_overview.title}
                </h3>
                <p className="text-purple-100 mb-4 leading-relaxed">
                  {parseTextWithReferences(analysisResult.overview_and_profile.personality_overview.content)}
                </p>
                {analysisResult.overview_and_profile.personality_overview.traits && (
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.overview_and_profile.personality_overview.traits.map((trait: string, index: number) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium border border-yellow-400/30"
                      >
                        {parseTextWithReferences(trait)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Analysis Highlights */}
            {analysisResult.overview_and_profile?.analysis_highlights && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderHighlightCard(
                  "Career & Professional Life",
                  analysisResult.overview_and_profile.analysis_highlights.career_card,
                  Briefcase,
                  "from-blue-600/80 to-indigo-600/80"
                )}
                {renderHighlightCard(
                  "Love & Relationships",
                  analysisResult.overview_and_profile.analysis_highlights.love_relationships_card,
                  Heart,
                  "from-pink-600/80 to-rose-600/80"
                )}
                {renderHighlightCard(
                  "Health & Vitality",
                  analysisResult.overview_and_profile.analysis_highlights.health_vitality_card,
                  Activity,
                  "from-green-600/80 to-emerald-600/80"
                )}
                {renderHighlightCard(
                  "Financial Prosperity",
                  analysisResult.overview_and_profile.analysis_highlights.financial_prosperity_card,
                  DollarSign,
                  "from-yellow-600/80 to-amber-600/80"
                )}
                {renderHighlightCard(
                  "Life Path & Destiny",
                  analysisResult.overview_and_profile.analysis_highlights.life_destiny_card,
                  Star,
                  "from-purple-600/80 to-violet-600/80"
                )}
                {renderHighlightCard(
                  "Spiritual Growth",
                  analysisResult.overview_and_profile.analysis_highlights.spiritual_growth_card,
                  Sparkles,
                  "from-indigo-600/80 to-purple-600/80"
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'detailed' && (
          <div className="space-y-6">
            {analysisResult.detailed_analysis && Object.entries(analysisResult.detailed_analysis).map(([sectionKey, sectionValue]) => (
              <div key={sectionKey} className="bg-black/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 capitalize">
                  {sectionKey.replace(/_/g, ' ')}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {typeof sectionValue === 'object' && sectionValue !== null && Object.entries(sectionValue).map(([cardKey, cardValue]: [string, any]) => (
                    <div key={cardKey} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h4 className="font-semibold text-purple-200 mb-2 capitalize">
                        {cardValue?.title || cardKey.replace(/_/g, ' ')}
                      </h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(cardValue || {}).map(([key, value]) => {
                          if (key === 'title') return null;
                          if (typeof value === 'string') {
                            return (
                              <div key={key} className="flex flex-col">
                                <span className="text-purple-300 font-medium capitalize mb-1">
                                  {key.replace(/_/g, ' ')}:
                                </span>
                                <span className="text-purple-100 leading-relaxed">
                                  {parseTextWithReferences(value)}
                                </span>
                              </div>
                            );
                          }
                          if (Array.isArray(value)) {
                            return (
                              <div key={key} className="flex flex-col">
                                <span className="text-purple-300 font-medium capitalize mb-1">
                                  {key.replace(/_/g, ' ')}:
                                </span>
                                <ul className="space-y-1 ml-2">
                                  {value.map((item: string, index: number) => (
                                    <li key={index} className="text-purple-100 text-sm flex items-start">
                                      <span className="text-yellow-400 mr-2 mt-1">•</span>
                                      <span>{parseTextWithReferences(item)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'guidance' && (
          <>
            {/* Final Conclusion */}
            {analysisResult.insights_and_summary?.final_conclusion?.comprehensive_summary && (
              <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Sparkles className="w-6 h-6 mr-3 text-yellow-400" />
                  {analysisResult.insights_and_summary.final_conclusion.comprehensive_summary.title}
                </h3>
                <p className="text-white/90 mb-6 leading-relaxed">
                  {parseTextWithReferences(analysisResult.insights_and_summary.final_conclusion.comprehensive_summary.overall_personality)}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-yellow-300 mb-3">Life Themes</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.insights_and_summary.final_conclusion.comprehensive_summary.life_themes?.map((theme: string, index: number) => (
                        <span
                          key={index}
                          className="bg-yellow-400/20 text-yellow-200 px-3 py-1 rounded-full text-sm border border-yellow-400/30"
                        >
                          {parseTextWithReferences(theme)}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-yellow-300 mb-3">Strongest Traits</h4>
                    <ul className="space-y-1">
                      {analysisResult.insights_and_summary.final_conclusion.comprehensive_summary.strongest_traits?.map((trait: string, index: number) => (
                        <li key={index} className="text-white/80 text-sm flex items-start">
                          <span className="text-yellow-400 mr-2 mt-1">•</span>
                          <span>{parseTextWithReferences(trait)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-yellow-300 mb-3">Unique Gifts</h4>
                    <ul className="space-y-1">
                      {analysisResult.insights_and_summary.final_conclusion.comprehensive_summary.unique_gifts?.map((gift: string, index: number) => (
                        <li key={index} className="text-white/80 text-sm flex items-start">
                          <span className="text-yellow-400 mr-2 mt-1">•</span>
                          <span>{parseTextWithReferences(gift)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-yellow-300 mb-3">Growth Areas</h4>
                    <ul className="space-y-1">
                      {analysisResult.insights_and_summary.final_conclusion.comprehensive_summary.areas_for_growth?.map((area: string, index: number) => (
                        <li key={index} className="text-white/80 text-sm flex items-start">
                          <span className="text-yellow-400 mr-2 mt-1">•</span>
                          <span>{parseTextWithReferences(area)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Actionable Guidance */}
            {analysisResult.insights_and_summary?.actionable_guidance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderGuidanceCard(
                  "Career Guidance",
                  analysisResult.insights_and_summary.actionable_guidance.career_guidance,
                  Briefcase
                )}
                {renderGuidanceCard(
                  "Relationship Guidance",
                  analysisResult.insights_and_summary.actionable_guidance.relationship_guidance,
                  Heart
                )}
                {renderGuidanceCard(
                  "Health Guidance",
                  analysisResult.insights_and_summary.actionable_guidance.health_guidance,
                  Activity
                )}
                {renderGuidanceCard(
                  "Spiritual Guidance",
                  analysisResult.insights_and_summary.actionable_guidance.spiritual_guidance,
                  Sparkles
                )}
                {renderGuidanceCard(
                  "Financial Guidance",
                  analysisResult.insights_and_summary.actionable_guidance.financial_guidance,
                  DollarSign
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <PDFDownloadLink
          document={<PalmReadingReport analysisResult={analysisResult} />}
          fileName={`palm-reading-${new Date().toISOString().split('T')[0]}.pdf`}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
        >
          {({ loading }) => (
            <>
              <Download className="w-5 h-5" />
              <span>{loading ? 'Generating PDF...' : 'Download Report'}</span>
            </>
          )}
        </PDFDownloadLink>
        
        <button
          onClick={onBackToHome}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
        >
          <Home className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
}