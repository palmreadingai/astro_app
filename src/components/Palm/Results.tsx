import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PalmReadingReport from './PalmReadingReport';
import { 
  Download,
  Eye, 
  Search, 
  Lightbulb, 
  Hand, 
  Heart, 
  Brain, 
  Shield, 
  TrendingUp, 
  Users, 
  Sparkles,
  ChevronRight,
  Activity,
  Star,
  Target,
  Zap,
  Crown,
  Mountain,
  Sun,
  Moon,
  Fingerprint,
  Navigation,
  CircleDot,
  Triangle,
  Square,
  Pentagon,
  ArrowUpRight
} from 'lucide-react';

// Define the actual structure returned by the API
export interface PalmAnalysisResult {
  id: string;
  userId: string;
  createdAt: string;
  profile?: Record<string, unknown>;
  overview_and_profile?: Record<string, unknown>;
  detailed_analysis?: Record<string, unknown>;
  insights_and_summary?: Record<string, unknown>;
  // Also include legacy PalmAnalysis fields for compatibility
  palmType?: 'earth' | 'air' | 'fire' | 'water';
  personalityTraits?: string[];
  career?: {
    description: string;
    suitedFields: string[];
  };
  relationships?: {
    description: string;
    strengths: string[];
    challenges: string[];
  };
  health?: {
    description: string;
    recommendations: string[];
  };
  majorLines?: {
    heartLine: string;
    headLine: string;
    lifeLine: string;
    destinyLine: string;
  };
  futureInsights?: string[];
}

interface ResultsProps {
  analysisResult: PalmAnalysisResult | null;
  onBackToHome?: () => void;
}

export default function Results({ analysisResult }: ResultsProps) {
  const [currentPage, setCurrentPage] = useState<'overview' | 'analysis' | 'insights'>('overview');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'hand' | 'fingers' | 'major' | 'minor' | 'mounts' | 'fingerprints'>('major');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Utility function to parse text with references and make them clickable
  const parseTextWithReferences = (text: string) => {
    if (!text) return text;
    
    // Regex to match pattern [text]<reference_type>
    const referencePattern = /\[([^\]]+)\]<([^>]+)>/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = referencePattern.exec(text)) !== null) {
      // Add text before the reference
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Add the clickable reference
      const referenceText = match[1];
      const referenceType = match[2];
      
      parts.push(
        <button
          key={match.index}
          onClick={() => handleReferenceClick(referenceType)}
          className="text-astro-primary hover:text-astro-secondary underline font-medium transition-colors cursor-pointer"
        >
          {referenceText}
        </button>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after last reference
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  // Handle reference clicks to navigate to analysis sections
  const handleReferenceClick = (referenceType: string) => {
    // Switch to analysis page
    setCurrentPage('analysis');
    
    // Handle pipe-separated references (e.g., "major_lines|heart_line")
    const actualReference = referenceType.includes('|') ? referenceType.split('|')[1] : referenceType;
    
    // Set the appropriate analysis tab and card based on reference type
    const tabAndCardMap: { [key: string]: { tab: 'hand' | 'fingers' | 'major' | 'minor' | 'mounts' | 'fingerprints'; card?: string } } = {
      // Legacy tab-level references
      'hand_analysis': { tab: 'hand' },
      'finger_analysis': { tab: 'fingers' },
      'major_lines': { tab: 'major' },
      'minor_lines_analysis': { tab: 'minor' },
      'mounts_analysis': { tab: 'mounts' },
      'fingerprint_patterns_analysis': { tab: 'fingerprints' },
      
      // Specific card references for major lines
      'heart_line': { tab: 'major', card: 'heart_line' },
      'head_line': { tab: 'major', card: 'head_line' },
      'life_line': { tab: 'major', card: 'life_line' },
      'destiny_line': { tab: 'major', card: 'destiny_line' },
      'worry_lines': { tab: 'major', card: 'worry_lines' },
      
      // Specific card references for minor lines
      'sun_line': { tab: 'minor', card: 'sun_line' },
      'girdle_of_venus': { tab: 'minor', card: 'girdle_of_venus' },
      'hepatica_line': { tab: 'minor', card: 'hepatica_line' },
      'ring_of_solomon': { tab: 'minor', card: 'ring_of_solomon' },
      'sympathy_line': { tab: 'minor', card: 'sympathy_line' },
      'relationship_lines': { tab: 'minor', card: 'relationship_lines' },
      'children_lines': { tab: 'minor', card: 'children_lines' },
      'travel_lines': { tab: 'minor', card: 'travel_lines' },
      'intuition_line': { tab: 'minor', card: 'intuition_line' },
      'medical_stigmata': { tab: 'minor', card: 'medical_stigmata' },
      'via_lasciva': { tab: 'minor', card: 'via_lasciva' },
      'family_chain': { tab: 'minor', card: 'family_chain' },
      'rascettes': { tab: 'minor', card: 'rascettes' },
      'simian_crease': { tab: 'minor', card: 'simian_crease' },
      
      // Specific card references for mounts
      'mount_jupiter': { tab: 'mounts', card: 'mount_jupiter' },
      'mount_saturn': { tab: 'mounts', card: 'mount_saturn' },
      'mount_apollo': { tab: 'mounts', card: 'mount_apollo' },
      'mount_mercury': { tab: 'mounts', card: 'mount_mercury' },
      'mount_venus': { tab: 'mounts', card: 'mount_venus' },
      'mount_inner_mars': { tab: 'mounts', card: 'mount_inner_mars' },
      'mount_outer_mars': { tab: 'mounts', card: 'mount_outer_mars' },
      'mount_luna': { tab: 'mounts', card: 'mount_luna' },
      'mount_neptune': { tab: 'mounts', card: 'mount_neptune' },
      
      // Specific card references for hand analysis
      'hand_type': { tab: 'hand', card: 'hand_type' },
      'hand_physical': { tab: 'hand', card: 'hand_physical' },
      'hand_quadrants': { tab: 'hand', card: 'hand_quadrants' },
      'hand_comparison': { tab: 'hand', card: 'hand_comparison' },
      
      // Specific card references for finger analysis
      'finger_setting': { tab: 'fingers', card: 'finger_setting' },
      'fingertip_shapes': { tab: 'fingers', card: 'fingertip_shapes' },
      'jupiter_finger': { tab: 'fingers', card: 'jupiter_finger' },
      'saturn_finger': { tab: 'fingers', card: 'saturn_finger' },
      'apollo_finger': { tab: 'fingers', card: 'apollo_finger' },
      'mercury_finger': { tab: 'fingers', card: 'mercury_finger' },
      
      // Specific card references for fingerprints
      'finger_pattern_loops': { tab: 'fingerprints', card: 'finger_pattern_loops' },
      'finger_pattern_whorls': { tab: 'fingerprints', card: 'finger_pattern_whorls' },
      'finger_pattern_arches': { tab: 'fingerprints', card: 'finger_pattern_arches' }
    };
    
    const targetConfig = tabAndCardMap[actualReference];
    if (targetConfig) {
      setActiveAnalysisTab(targetConfig.tab);
      
      // If there's a specific card to navigate to, scroll to it after tab switch
      if (targetConfig.card) {
        setTimeout(() => {
          const cardElement = document.querySelector(`[data-card="${targetConfig.card}"]`);
          if (cardElement) {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  };

  if (!analysisResult) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Available</h3>
          <p className="text-gray-600">Please complete the palm analysis first.</p>
        </div>
      </div>
    );
  }

  const renderHeader = () => (
    <div className="text-center mb-8 relative">
      <div className="w-16 h-16 bg-gradient-to-br from-astro-gold to-astro-accent rounded-full flex items-center justify-center mx-auto mb-4">
        <Hand className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent mb-2">
        Your Complete Palm Reading
      </h1>
      <p className="text-purple-200 text-lg">Insights into Your Life's Path</p>
      
      {isClient && analysisResult && (
        <div className="absolute top-0 right-0 mt-2 mr-2">
          <PDFDownloadLink
            document={<PalmReadingReport analysisResult={analysisResult} />}
            fileName="palm-reading-report.pdf"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {({ loading }) =>
              loading ? 'Loading...' : (
                <>
                  <Download className="w-4 h-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Download PDF</span>
                </>
              )
            }
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );

  const renderNavigation = () => (
    <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-2 mb-8 shadow-lg border border-purple-500/30">
      <div className="flex space-x-2">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'analysis', label: 'Analysis', icon: Search },
          { id: 'insights', label: 'Insights', icon: Lightbulb }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setCurrentPage(id as string)}
            className={`flex-1 flex items-center justify-center 
                       flex-col space-x-0 space-y-1 
                       md:flex-row md:space-x-2 md:space-y-0
                       py-2 md:py-3 px-2 md:px-4 
                       rounded-xl transition-all duration-200 ${
              currentPage === id 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                : 'text-purple-200 hover:bg-black/20'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium text-sm">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderPersonalityCard = (data: Record<string, unknown>) => (
    <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-purple-500/30 mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white">{data?.personality_overview?.title || "Your Personality Profile"}</h3>
      </div>
      {data?.personality_overview?.content && (
        <p className="text-green-100 mb-4">{data.personality_overview.content}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {data?.personality_overview?.traits?.map((trait: string, index: number) => (
          <span key={index} className="inline-block bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-full text-sm font-medium border border-emerald-400/30">
            {trait}
          </span>
        )) || (
          <div className="text-green-200 text-center py-4 w-full">
            Personality traits will be displayed here
          </div>
        )}
      </div>
    </div>
  );

  const renderHighlightCard = (title: string, icon: React.ComponentType<{ className?: string }>, cardData: Record<string, unknown>, colorScheme: {gradient: string, iconColor: string, textColor: string, bulletColor: string}) => (
    <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50 hover:shadow-xl hover:border-gray-600/50 transition-all duration-200 cursor-pointer group">
      <div className="flex items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 md:p-3 bg-gradient-to-r ${colorScheme.gradient} rounded-lg shadow-md`}>
            {React.createElement(icon, { className: "w-4 h-4 md:w-6 md:h-6 text-white" })}
          </div>
          <h4 className="font-semibold text-white">{cardData?.title || title}</h4>
        </div>
      </div>
      
      <div className={`${colorScheme.textColor} text-sm mb-3`}>
        {cardData?.summary ? parseTextWithReferences(cardData.summary) : `Detailed insights about your ${title.toLowerCase()} path`}
      </div>
      
      <div className="space-y-2">
        {cardData?.key_points?.slice(0, 3).map((point: string, index: number) => (
          <div key={index} className="flex items-start space-x-2">
            <div className={`w-1.5 h-1.5 ${colorScheme.bulletColor} rounded-full mt-2 flex-shrink-0`}></div>
            <div className={`text-sm ${colorScheme.textColor}`}>{parseTextWithReferences(point)}</div>
          </div>
        )) || (
          <div className={`${colorScheme.textColor} text-sm`}>Key insights will be displayed here</div>
        )}
      </div>
    </div>
  );

  const renderAnalysisTab = (tabId: string, label: string, shortLabel: string, icon: React.ComponentType<{ className?: string }>) => (
    <button
      key={tabId}
      onClick={() => setActiveAnalysisTab(tabId as string)}
      className={`flex items-center justify-center space-x-1 sm:space-x-2 px-1 sm:px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
        activeAnalysisTab === tabId
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
          : 'text-purple-200 hover:bg-black/20'
      }`}
    >
      {React.createElement(icon, { className: "w-4 h-4" })}
      <span className="font-medium text-xs sm:text-sm sm:hidden">{shortLabel}</span>
      <span className="font-medium text-sm hidden sm:inline">{label}</span>
    </button>
  );

  const renderMajorLineCard = (title: string, content: Record<string, unknown>, icon?: React.ComponentType<{ className?: string }>) => (
    <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-400/30">
      <div className="flex items-center space-x-3 mb-4">
        {icon && React.createElement(icon, { className: "w-5 h-5 text-purple-400" })}
        <h4 className="font-semibold text-purple-100">{content?.title || title}</h4>
      </div>
      <div className="text-purple-200 text-sm space-y-2">
        {content?.length && (
          <div>
            <span className="font-medium text-purple-300">Length: </span>
            <span>{content.length}</span>
          </div>
        )}
        {content?.type && Array.isArray(content.type) && (
          <div>
            <span className="font-medium text-purple-300">Type: </span>
            <div className="mt-1">
              {content.type.map((type: string, index: number) => (
                <span key={index} className="inline-block bg-astro-primary/10 text-astro-primary px-2 py-1 rounded text-xs mr-1 mb-1">
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}
        {content?.features && Array.isArray(content.features) && (
          <div>
            <span className="font-medium text-purple-300">Features: </span>
            <div className="mt-1">
              {content.features.map((feature: string, index: number) => (
                <span key={index} className="inline-block bg-astro-secondary/10 text-astro-secondary px-2 py-1 rounded text-xs mr-1 mb-1">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
        {content?.starting_position && (
          <div>
            <span className="font-medium text-purple-300">Starting Position: </span>
            <span>{content.starting_position}</span>
          </div>
        )}
        {content?.ending_position && (
          <div>
            <span className="font-medium text-purple-300">Ending Position: </span>
            <span>{content.ending_position}</span>
          </div>
        )}
        {content?.start_position && (
          <div>
            <span className="font-medium text-purple-300">Start Position: </span>
            <span>{content.start_position}</span>
          </div>
        )}
        {content?.end_position && (
          <div>
            <span className="font-medium text-purple-300">End Position: </span>
            <span>{content.end_position}</span>
          </div>
        )}
        {content?.course && (
          <div>
            <span className="font-medium text-purple-300">Course: </span>
            <span>{content.course}</span>
          </div>
        )}
        {content?.quantity && (
          <div>
            <span className="font-medium text-purple-300">Quantity: </span>
            <span>{content.quantity}</span>
          </div>
        )}
        {content?.thinking_style && (
          <div>
            <span className="font-medium text-purple-300">Thinking Style: </span>
            <span>{content.thinking_style}</span>
          </div>
        )}
        {content?.decision_making && (
          <div>
            <span className="font-medium text-purple-300">Decision Making: </span>
            <span>{content.decision_making}</span>
          </div>
        )}
        {content?.intellectual_capacity && (
          <div>
            <span className="font-medium text-purple-300">Intellectual Capacity: </span>
            <span>{content.intellectual_capacity}</span>
          </div>
        )}
        {content?.vitality && (
          <div>
            <span className="font-medium text-purple-300">Vitality: </span>
            <span>{content.vitality}</span>
          </div>
        )}
        {content?.life_approach && (
          <div>
            <span className="font-medium text-purple-300">Life Approach: </span>
            <span>{content.life_approach}</span>
          </div>
        )}
        {content?.major_life_events && (
          <div>
            <span className="font-medium text-purple-300">Major Life Events: </span>
            <span>{content.major_life_events}</span>
          </div>
        )}
        {content?.emotional_nature && (
          <div>
            <span className="font-medium text-purple-300">Emotional Nature: </span>
            <span>{content.emotional_nature}</span>
          </div>
        )}
        {content?.relationship_patterns && (
          <div>
            <span className="font-medium text-purple-300">Relationship Patterns: </span>
            <span>{content.relationship_patterns}</span>
          </div>
        )}
        {content?.compatibility && (
          <div>
            <span className="font-medium text-purple-300">Compatibility: </span>
            <span>{content.compatibility}</span>
          </div>
        )}
        {content?.career_path && (
          <div>
            <span className="font-medium text-purple-300">Career Path: </span>
            <span>{content.career_path}</span>
          </div>
        )}
        {content?.life_purpose && (
          <div>
            <span className="font-medium text-purple-300">Life Purpose: </span>
            <span>{content.life_purpose}</span>
          </div>
        )}
        {content?.stress_levels && (
          <div>
            <span className="font-medium text-purple-300">Stress Levels: </span>
            <span>{content.stress_levels}</span>
          </div>
        )}
        {content?.coping_mechanisms && (
          <div>
            <span className="font-medium text-purple-300">Coping Mechanisms: </span>
            <span>{content.coping_mechanisms}</span>
          </div>
        )}
        {content?.anxiety_tendencies && (
          <div>
            <span className="font-medium text-purple-300">Anxiety Tendencies: </span>
            <span>{content.anxiety_tendencies}</span>
          </div>
        )}
        {content?.interpretation && (
          <div>
            <span className="font-medium text-purple-300">Interpretation: </span>
            <span>{content.interpretation}</span>
          </div>
        )}
        {!content?.length && !content?.type && !content?.features && !content?.starting_position && !content?.ending_position && !content?.start_position && !content?.end_position && !content?.course && !content?.quantity && !content?.thinking_style && !content?.decision_making && !content?.intellectual_capacity && !content?.vitality && !content?.life_approach && !content?.major_life_events && !content?.emotional_nature && !content?.relationship_patterns && !content?.compatibility && !content?.career_path && !content?.life_purpose && !content?.stress_levels && !content?.coping_mechanisms && !content?.anxiety_tendencies && !content?.interpretation && (
          <div className="text-gray-500 italic">
            {content ? (typeof content === 'string' ? content : JSON.stringify(content, null, 2)) : 'Analysis data will be displayed here'}
          </div>
        )}
      </div>
    </div>
  );

  const renderMountCard = (title: string, content: Record<string, unknown>, icon?: React.ComponentType<{ className?: string }>) => (
    <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl p-6 shadow-lg border border-green-400/30">
      <div className="flex items-center space-x-3 mb-4">
        {icon && React.createElement(icon, { className: "w-5 h-5 text-green-400" })}
        <h4 className="font-semibold text-green-100">{content?.title || title}</h4>
      </div>
      <div className="text-green-200 text-sm space-y-2">
        {content?.development && (
          <div>
            <span className="font-medium text-green-300">Development: </span>
            <span>{content.development}</span>
          </div>
        )}
        {content?.ambition_level && (
          <div>
            <span className="font-medium text-green-300">Ambition Level: </span>
            <span>{content.ambition_level}</span>
          </div>
        )}
        {content?.authority_comfort && (
          <div>
            <span className="font-medium text-green-300">Authority Comfort: </span>
            <span>{content.authority_comfort}</span>
          </div>
        )}
        {content?.leadership_qualities && (
          <div>
            <span className="font-medium text-green-300">Leadership Qualities: </span>
            <span>{content.leadership_qualities}</span>
          </div>
        )}
        {content?.serious_nature && (
          <div>
            <span className="font-medium text-green-300">Serious Nature: </span>
            <span>{content.serious_nature}</span>
          </div>
        )}
        {content?.discipline_level && (
          <div>
            <span className="font-medium text-green-300">Discipline Level: </span>
            <span>{content.discipline_level}</span>
          </div>
        )}
        {content?.responsibility_sense && (
          <div>
            <span className="font-medium text-green-300">Responsibility Sense: </span>
            <span>{content.responsibility_sense}</span>
          </div>
        )}
        {content?.self_expression && (
          <div>
            <span className="font-medium text-purple-300">Self Expression: </span>
            <span>{content.self_expression}</span>
          </div>
        )}
        {content?.creativity_level && (
          <div>
            <span className="font-medium text-purple-300">Creativity Level: </span>
            <span>{content.creativity_level}</span>
          </div>
        )}
        {content?.recognition_desire && (
          <div>
            <span className="font-medium text-purple-300">Recognition Desire: </span>
            <span>{content.recognition_desire}</span>
          </div>
        )}
        {content?.adaptability && (
          <div>
            <span className="font-medium text-purple-300">Adaptability: </span>
            <span>{content.adaptability}</span>
          </div>
        )}
        {content?.business_acumen && (
          <div>
            <span className="font-medium text-purple-300">Business Acumen: </span>
            <span>{content.business_acumen}</span>
          </div>
        )}
        {content?.communication_skills && (
          <div>
            <span className="font-medium text-purple-300">Communication Skills: </span>
            <span>{content.communication_skills}</span>
          </div>
        )}
        {content?.sensuality && (
          <div>
            <span className="font-medium text-purple-300">Sensuality: </span>
            <span>{content.sensuality}</span>
          </div>
        )}
        {content?.love_capacity && (
          <div>
            <span className="font-medium text-purple-300">Love Capacity: </span>
            <span>{content.love_capacity}</span>
          </div>
        )}
        {content?.artistic_appreciation && (
          <div>
            <span className="font-medium text-purple-300">Artistic Appreciation: </span>
            <span>{content.artistic_appreciation}</span>
          </div>
        )}
        {content?.assertiveness && (
          <div>
            <span className="font-medium text-purple-300">Assertiveness: </span>
            <span>{content.assertiveness}</span>
          </div>
        )}
        {content?.courage_level && (
          <div>
            <span className="font-medium text-purple-300">Courage Level: </span>
            <span>{content.courage_level}</span>
          </div>
        )}
        {content?.resistance_to_pressure && (
          <div>
            <span className="font-medium text-purple-300">Resistance to Pressure: </span>
            <span>{content.resistance_to_pressure}</span>
          </div>
        )}
        {content?.persistence && (
          <div>
            <span className="font-medium text-purple-300">Persistence: </span>
            <span>{content.persistence}</span>
          </div>
        )}
        {content?.determination && (
          <div>
            <span className="font-medium text-purple-300">Determination: </span>
            <span>{content.determination}</span>
          </div>
        )}
        {content?.defensive_nature && (
          <div>
            <span className="font-medium text-purple-300">Defensive Nature: </span>
            <span>{content.defensive_nature}</span>
          </div>
        )}
        {content?.imagination && (
          <div>
            <span className="font-medium text-purple-300">Imagination: </span>
            <span>{content.imagination}</span>
          </div>
        )}
        {content?.emotional_depth && (
          <div>
            <span className="font-medium text-purple-300">Emotional Depth: </span>
            <span>{content.emotional_depth}</span>
          </div>
        )}
        {content?.subconscious_connection && (
          <div>
            <span className="font-medium text-purple-300">Subconscious Connection: </span>
            <span>{content.subconscious_connection}</span>
          </div>
        )}
        {content?.intuitive_abilities && (
          <div>
            <span className="font-medium text-purple-300">Intuitive Abilities: </span>
            <span>{content.intuitive_abilities}</span>
          </div>
        )}
        {content?.spiritual_connection && (
          <div>
            <span className="font-medium text-purple-300">Spiritual Connection: </span>
            <span>{content.spiritual_connection}</span>
          </div>
        )}
        {content?.transformation_power && (
          <div>
            <span className="font-medium text-purple-300">Transformation Power: </span>
            <span>{content.transformation_power}</span>
          </div>
        )}
        {content?.interpretation && (
          <div>
            <span className="font-medium text-purple-300">Interpretation: </span>
            <span>{content.interpretation}</span>
          </div>
        )}
        {!content?.development && !content?.ambition_level && !content?.authority_comfort && !content?.leadership_qualities && !content?.serious_nature && !content?.discipline_level && !content?.responsibility_sense && !content?.self_expression && !content?.creativity_level && !content?.recognition_desire && !content?.adaptability && !content?.business_acumen && !content?.communication_skills && !content?.sensuality && !content?.love_capacity && !content?.artistic_appreciation && !content?.assertiveness && !content?.courage_level && !content?.resistance_to_pressure && !content?.persistence && !content?.determination && !content?.defensive_nature && !content?.imagination && !content?.emotional_depth && !content?.subconscious_connection && !content?.intuitive_abilities && !content?.spiritual_connection && !content?.transformation_power && !content?.interpretation && (
          <div className="text-gray-500 italic">
            {content ? (typeof content === 'string' ? content : JSON.stringify(content, null, 2)) : 'Analysis data will be displayed here'}
          </div>
        )}
      </div>
    </div>
  );

  // For Hand Analysis Tab - Blue Theme
  const renderHandAnalysisCard = (title: string, content: Record<string, unknown>, icon?: React.ComponentType<{ className?: string }>) => (
    <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl p-6 shadow-lg border border-blue-400/30">
      <div className="flex items-center space-x-3 mb-4">
        {icon && React.createElement(icon, { className: "w-5 h-5 text-blue-400" })}
        <h4 className="font-semibold text-blue-100">{content?.title || title}</h4>
      </div>
      <div className="text-blue-200 text-sm space-y-2">
        {content?.dominant_quadrant && (
          <div>
            <span className="font-medium text-blue-300">Dominant Quadrant: </span>
            <span>{content.dominant_quadrant}</span>
          </div>
        )}
        {content?.energy_distribution && (
          <div>
            <span className="font-medium text-blue-300">Energy Distribution: </span>
            <span>{content.energy_distribution}</span>
          </div>
        )}
        {content?.personality_implications && (
          <div>
            <span className="font-medium text-blue-300">Personality Implications: </span>
            <span>{content.personality_implications}</span>
          </div>
        )}
        {content?.interpretation && (
          <div>
            <span className="font-medium text-blue-300">Interpretation: </span>
            <span>{content.interpretation}</span>
          </div>
        )}
        {content?.elemental_type && (
          <div>
            <span className="font-medium text-blue-300">Type: </span>
            <span>{content.elemental_type}</span>
          </div>
        )}
        {content?.detailed_type && (
          <div>
            <span className="font-medium text-blue-300">Detailed Type: </span>
            <span>{content.detailed_type}</span>
          </div>
        )}
        {content?.characteristics && content.characteristics.length > 0 && (
          <div>
            <span className="font-medium text-blue-300">Characteristics: </span>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {content.characteristics.map((char: string, index: number) => (
                <li key={index} className="text-sm">{char}</li>
              ))}
            </ul>
          </div>
        )}
        {content?.overall_interpretation && (
          <div>
            <span className="font-medium text-blue-300">Analysis: </span>
            <span>{content.overall_interpretation}</span>
          </div>
        )}
        {content?.hand_size && (
          <div>
            <span className="font-medium text-blue-300">Hand Size: </span>
            <span>{content.hand_size}</span>
          </div>
        )}
        {content?.palm_color && (
          <div>
            <span className="font-medium text-blue-300">Palm Color: </span>
            <span>{content.palm_color}</span>
          </div>
        )}
        {content?.skin_texture && (
          <div>
            <span className="font-medium text-blue-300">Skin Texture: </span>
            <span>{content.skin_texture}</span>
          </div>
        )}
        {content?.hand_flexibility && (
          <div>
            <span className="font-medium text-blue-300">Hand Flexibility: </span>
            <span>{content.hand_flexibility}</span>
          </div>
        )}
        {content?.palm_consistency && (
          <div>
            <span className="font-medium text-blue-300">Palm Consistency: </span>
            <span>{content.palm_consistency}</span>
          </div>
        )}
        {!content?.interpretation && !content?.elemental_type && !content?.characteristics && !content?.overall_interpretation && !content?.dominant_quadrant && !content?.energy_distribution && !content?.personality_implications && !content?.detailed_type && !content?.hand_size && !content?.palm_color && !content?.skin_texture && !content?.hand_flexibility && !content?.palm_consistency && (
          <div className="text-blue-300 italic">
            {content ? (typeof content === 'string' ? content : JSON.stringify(content, null, 2)) : 'Analysis data will be displayed here'}
          </div>
        )}
      </div>
    </div>
  );

  // For Finger Analysis Tab - Blue Theme  
  const renderFingerAnalysisCard = (title: string, content: Record<string, unknown>, icon?: React.ComponentType<{ className?: string }>) => (
    <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl p-6 shadow-lg border border-blue-400/30">
      <div className="flex items-center space-x-3 mb-4">
        {icon && React.createElement(icon, { className: "w-5 h-5 text-blue-400" })}
        <h4 className="font-semibold text-blue-100">{content?.title || title}</h4>
      </div>
      <div className="text-blue-200 text-sm space-y-2">
        {content?.shape && (
          <div>
            <span className="font-medium text-blue-300">Shape: </span>
            <span>{content.shape}</span>
          </div>
        )}
        {content?.length && (
          <div>
            <span className="font-medium text-blue-300">Length: </span>
            <span>{content.length}</span>
          </div>
        )}
        {content?.setting_type && (
          <div>
            <span className="font-medium text-blue-300">Setting Type: </span>
            <span>{content.setting_type}</span>
          </div>
        )}
        {content?.shape_type && (
          <div>
            <span className="font-medium text-blue-300">Shape Type: </span>
            <span>{content.shape_type}</span>
          </div>
        )}
        {content?.thinking_style && (
          <div>
            <span className="font-medium text-blue-300">Thinking Style: </span>
            <span>{content.thinking_style}</span>
          </div>
        )}
        {content?.confidence_level && (
          <div>
            <span className="font-medium text-blue-300">Confidence Level: </span>
            <span>{content.confidence_level}</span>
          </div>
        )}
        {content?.artistic_nature && (
          <div>
            <span className="font-medium text-blue-300">Artistic Nature: </span>
            <span>{content.artistic_nature}</span>
          </div>
        )}
        {content?.fame_factor && (
          <div>
            <span className="font-medium text-blue-300">Fame Factor: </span>
            <span>{content.fame_factor}</span>
          </div>
        )}
        {content?.work_ethic && (
          <div>
            <span className="font-medium text-blue-300">Work Ethic: </span>
            <span>{content.work_ethic}</span>
          </div>
        )}
        {content?.social_skills && (
          <div>
            <span className="font-medium text-blue-300">Social Skills: </span>
            <span>{content.social_skills}</span>
          </div>
        )}
        {content?.decision_making && (
          <div>
            <span className="font-medium text-blue-300">Decision Making: </span>
            <span>{content.decision_making}</span>
          </div>
        )}
        {content?.leadership_style && (
          <div>
            <span className="font-medium text-blue-300">Leadership Style: </span>
            <span>{content.leadership_style}</span>
          </div>
        )}
        {content?.interpretation && (
          <div>
            <span className="font-medium text-blue-300">Interpretation: </span>
            <span>{content.interpretation}</span>
          </div>
        )}
        {!content?.shape && !content?.length && !content?.setting_type && !content?.shape_type && !content?.thinking_style && !content?.confidence_level && !content?.artistic_nature && !content?.fame_factor && !content?.work_ethic && !content?.social_skills && !content?.decision_making && !content?.leadership_style && !content?.interpretation && (
          <div className="text-blue-300 italic">
            {content ? (typeof content === 'string' ? content : JSON.stringify(content, null, 2)) : 'Analysis data will be displayed here'}
          </div>
        )}
      </div>
    </div>
  );

  // For Minor Lines Tab - Yellow/Orange Theme
  const renderMinorLineAnalysisCard = (title: string, content: Record<string, unknown>, icon?: React.ComponentType<{ className?: string }>) => (
    <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 rounded-xl p-6 shadow-lg border border-yellow-400/30">
      <div className="flex items-center space-x-3 mb-4">
        {icon && React.createElement(icon, { className: "w-5 h-5 text-yellow-400" })}
        <h4 className="font-semibold text-yellow-100">{content?.title || title}</h4>
      </div>
      <div className="text-yellow-200 text-sm space-y-2">
        {content?.presence && (
          <div>
            <span className="font-medium text-yellow-300">Presence: </span>
            <span>{content.presence}</span>
          </div>
        )}
        {content?.spiritual_insight && (
          <div>
            <span className="font-medium text-yellow-300">Spiritual Insight: </span>
            <span>{content.spiritual_insight}</span>
          </div>
        )}
        {content?.personality_traits && (
          <div>
            <span className="font-medium text-yellow-300">Personality Traits: </span>
            <span>{content.personality_traits}</span>
          </div>
        )}
        {content?.number_of_lines && (
          <div>
            <span className="font-medium text-yellow-300">Number of Lines: </span>
            <span>{content.number_of_lines}</span>
          </div>
        )}
        {content?.health_longevity && (
          <div>
            <span className="font-medium text-yellow-300">Health & Longevity: </span>
            <span>{content.health_longevity}</span>
          </div>
        )}
        {content?.prosperity_signs && (
          <div>
            <span className="font-medium text-yellow-300">Prosperity Signs: </span>
            <span>{content.prosperity_signs}</span>
          </div>
        )}
        {content?.adventure_seeking && (
          <div>
            <span className="font-medium text-yellow-300">Adventure Seeking: </span>
            <span>{content.adventure_seeking}</span>
          </div>
        )}
        {content?.interpretation && (
          <div>
            <span className="font-medium text-yellow-300">Interpretation: </span>
            <span>{content.interpretation}</span>
          </div>
        )}
        {!content?.presence && !content?.spiritual_insight && !content?.personality_traits && !content?.number_of_lines && !content?.health_longevity && !content?.prosperity_signs && !content?.adventure_seeking && !content?.interpretation && (
          <div className="text-yellow-200 italic">
            {content ? (typeof content === 'string' ? content : JSON.stringify(content, null, 2)) : 'Analysis data will be displayed here'}
          </div>
        )}
      </div>
    </div>
  );

  // For Fingerprints Tab - Indigo Theme  
  const renderFingerprintAnalysisCard = (title: string, content: Record<string, unknown>, icon?: React.ComponentType<{ className?: string }>) => (
    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-xl p-6 shadow-lg border border-indigo-400/30">
      <div className="flex items-center space-x-3 mb-4">
        {icon && React.createElement(icon, { className: "w-5 h-5 text-indigo-400" })}
        <h4 className="font-semibold text-indigo-100">{content?.title || title}</h4>
      </div>
      <div className="text-indigo-200 text-sm space-y-2">
        {content?.presence && (
          <div>
            <span className="font-medium text-indigo-300">Presence: </span>
            <span>{content.presence}</span>
          </div>
        )}
        {content?.work_ethic && (
          <div>
            <span className="font-medium text-indigo-300">Work Ethic: </span>
            <span>{content.work_ethic}</span>
          </div>
        )}
        {content?.life_approach && (
          <div>
            <span className="font-medium text-indigo-300">Life Approach: </span>
            <span>{content.life_approach}</span>
          </div>
        )}
        {content?.personality_traits && (
          <div>
            <span className="font-medium text-indigo-300">Personality Traits: </span>
            <span>{content.personality_traits}</span>
          </div>
        )}
        {content?.social_skills && (
          <div>
            <span className="font-medium text-indigo-300">Social Skills: </span>
            <span>{content.social_skills}</span>
          </div>
        )}
        {content?.decision_making && (
          <div>
            <span className="font-medium text-indigo-300">Decision Making: </span>
            <span>{content.decision_making}</span>
          </div>
        )}
        {content?.unique_perspective && (
          <div>
            <span className="font-medium text-indigo-300">Unique Perspective: </span>
            <span>{content.unique_perspective}</span>
          </div>
        )}
        {content?.interpretation && (
          <div>
            <span className="font-medium text-indigo-300">Interpretation: </span>
            <span>{content.interpretation}</span>
          </div>
        )}
        {!content?.presence && !content?.work_ethic && !content?.life_approach && !content?.personality_traits && !content?.social_skills && !content?.decision_making && !content?.unique_perspective && !content?.interpretation && (
          <div className="text-indigo-200 italic">
            {content ? (typeof content === 'string' ? content : JSON.stringify(content, null, 2)) : 'Analysis data will be displayed here'}
          </div>
        )}
      </div>
    </div>
  );

  const renderMajorLinesNavigation = () => (
    <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-purple-500/30 mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-astro-gold via-yellow-300 to-astro-accent bg-clip-text text-transparent">
          Explore Your Major Lines
        </h3>
      </div>
      <div className="flex justify-between sm:justify-start sm:space-x-6 md:space-x-12 lg:space-x-16">
          <button
            onClick={() => {
              setCurrentPage('analysis');
              setActiveAnalysisTab('major');
              // Scroll to heart line card after navigation
              setTimeout(() => {
                const heartLineCard = document.querySelector('[data-card="heart_line"]');
                if (heartLineCard) {
                  heartLineCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 100);
            }}
            className="group relative flex flex-col items-center cursor-pointer"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 border border-white/20 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110"
              style={{ 
                animation: 'float 5.7s ease-in-out infinite',
                animationDelay: '0s'
              }}
            >
              <span className="text-3xl sm:text-4xl md:text-5xl">❤️</span>
            </div>
            <span className="text-xs md:text-sm font-semibold text-rose-100 group-hover:text-white transition-colors mt-1 sm:mt-2 text-center">Heart</span>
          </button>
          <button
            onClick={() => {
              setCurrentPage('analysis');
              setActiveAnalysisTab('major');
              setTimeout(() => {
                const headLineCard = document.querySelector('[data-card="head_line"]');
                if (headLineCard) {
                  headLineCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 100);
            }}
            className="group relative flex flex-col items-center cursor-pointer"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 border border-white/20 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110"
              style={{ 
                animation: 'float 5.7s ease-in-out infinite',
                animationDelay: '0.9s'
              }}
            >
              <span className="text-3xl sm:text-4xl md:text-5xl">🧠</span>
            </div>
            <span className="text-xs md:text-sm font-semibold text-blue-100 group-hover:text-white transition-colors mt-1 sm:mt-2 text-center">Head</span>
          </button>
          <button
            onClick={() => {
              setCurrentPage('analysis');
              setActiveAnalysisTab('major');
              setTimeout(() => {
                const lifeLineCard = document.querySelector('[data-card="life_line"]');
                if (lifeLineCard) {
                  lifeLineCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 100);
            }}
            className="group relative flex flex-col items-center cursor-pointer"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 border border-white/20 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110"
              style={{ 
                animation: 'float 5.7s ease-in-out infinite',
                animationDelay: '1.8s'
              }}
            >
              <span className="text-3xl sm:text-4xl md:text-5xl">🌟</span>
            </div>
            <span className="text-xs md:text-sm font-semibold text-emerald-100 group-hover:text-white transition-colors mt-1 sm:mt-2 text-center">Life</span>
          </button>
          <button
            onClick={() => {
              setCurrentPage('analysis');
              setActiveAnalysisTab('major');
              setTimeout(() => {
                const destinyLineCard = document.querySelector('[data-card="destiny_line"]');
                if (destinyLineCard) {
                  destinyLineCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 100);
            }}
            className="group relative flex flex-col items-center cursor-pointer"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 border border-white/20 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110"
              style={{ 
                animation: 'float 5.7s ease-in-out infinite',
                animationDelay: '2.7s'
              }}
            >
              <span className="text-3xl sm:text-4xl md:text-5xl">🔮</span>
            </div>
            <span className="text-xs md:text-sm font-semibold text-violet-100 group-hover:text-white transition-colors mt-1 sm:mt-2 text-center">Destiny</span>
          </button>
        </div>
    </div>
  );

  const renderOverviewPage = () => (
    <div className="max-w-6xl mx-auto">
      {renderPersonalityCard(analysisResult.overview_and_profile)}
      {renderMajorLinesNavigation()}
      
      <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 md:p-8 shadow-xl border border-purple-500/30 mb-8">
        <div className="mb-4 md:mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-astro-gold via-yellow-300 to-astro-accent bg-clip-text text-transparent">
            Key Areas of Life
          </h3>
        </div>
        <p className="text-gray-200 mb-4 md:mb-6">
          Comprehensive analysis of your key life areas and personal characteristics
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {renderHighlightCard("Career & Professional Life", TrendingUp, analysisResult.overview_and_profile?.analysis_highlights?.career_card, {
            gradient: "from-blue-500 to-cyan-500",
            iconColor: "text-blue-400",
            textColor: "text-gray-200",
            bulletColor: "bg-gray-400"
          })}
          {renderHighlightCard("Life Path & Destiny", Target, analysisResult.overview_and_profile?.analysis_highlights?.life_destiny_card, {
            gradient: "from-purple-500 to-pink-500",
            iconColor: "text-purple-400",
            textColor: "text-gray-200",
            bulletColor: "bg-gray-400"
          })}
          {renderHighlightCard("Love & Relationships", Heart, analysisResult.overview_and_profile?.analysis_highlights?.love_relationships_card, {
            gradient: "from-pink-500 to-rose-500",
            iconColor: "text-pink-400",
            textColor: "text-gray-200",
            bulletColor: "bg-gray-400"
          })}
          {renderHighlightCard("Health & Vitality", Shield, analysisResult.overview_and_profile?.analysis_highlights?.health_vitality_card, {
            gradient: "from-green-500 to-emerald-500",
            iconColor: "text-green-400",
            textColor: "text-gray-200",
            bulletColor: "bg-gray-400"
          })}
          {renderHighlightCard("Financial Prosperity", Crown, analysisResult.overview_and_profile?.analysis_highlights?.financial_prosperity_card, {
            gradient: "from-amber-500 to-yellow-500",
            iconColor: "text-amber-400",
            textColor: "text-gray-200",
            bulletColor: "bg-gray-400"
          })}
          {renderHighlightCard("Spiritual Growth", Sparkles, analysisResult.overview_and_profile?.analysis_highlights?.spiritual_growth_card, {
            gradient: "from-violet-500 to-purple-500",
            iconColor: "text-violet-400",
            textColor: "text-gray-200",
            bulletColor: "bg-gray-400"
          })}
        </div>
      </div>
    </div>
  );

  const renderAnalysisPage = () => (
    <div className="max-w-6xl mx-auto">
      <div className="bg-black/30 backdrop-blur-lg rounded-xl p-2 mb-6 shadow-lg border border-purple-500/30">
        <div className="grid grid-cols-3 gap-1 sm:flex sm:justify-between sm:space-x-2 sm:gap-0">
          {renderAnalysisTab('major', 'Major Lines', 'Major', Activity)}
          {renderAnalysisTab('hand', 'Hand Analysis', 'Hand', Hand)}
          {renderAnalysisTab('minor', 'Minor Lines', 'Minor', Navigation)}
          {renderAnalysisTab('mounts', 'Mounts', 'Mounts', Mountain)}
          {renderAnalysisTab('fingers', 'Fingers', 'Fingers', CircleDot)}
          {renderAnalysisTab('fingerprints', 'Fingerprints', 'Prints', Fingerprint)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeAnalysisTab === 'hand' && (
          <>
            <div data-card="hand_type">
              {renderHandAnalysisCard("Hand Type Classification", analysisResult.detailed_analysis?.hand_analysis?.hand_type, Square)}
            </div>
            <div data-card="hand_physical">
              {renderHandAnalysisCard("Physical Characteristics", analysisResult.detailed_analysis?.hand_analysis?.hand_physical, Activity)}
            </div>
            <div data-card="hand_quadrants">
              {renderHandAnalysisCard("Quadrants Analysis", analysisResult.detailed_analysis?.hand_analysis?.hand_quadrants, Triangle)}
            </div>
            <div data-card="hand_comparison">
              {renderHandAnalysisCard("Hand Comparison", analysisResult.detailed_analysis?.hand_analysis?.hand_comparison, Pentagon)}
            </div>
          </>
        )}
        
        {activeAnalysisTab === 'fingers' && (
          <>
            <div data-card="finger_setting">
              {renderFingerAnalysisCard("Finger Setting", analysisResult.detailed_analysis?.finger_analysis?.finger_setting, ArrowUpRight)}
            </div>
            <div data-card="fingertip_shapes">
              {renderFingerAnalysisCard("Fingertip Shapes", analysisResult.detailed_analysis?.finger_analysis?.fingertip_shapes, CircleDot)}
            </div>
            <div data-card="jupiter_finger">
              {renderFingerAnalysisCard("Jupiter Finger", analysisResult.detailed_analysis?.finger_analysis?.jupiter_finger, Star)}
            </div>
            <div data-card="saturn_finger">
              {renderFingerAnalysisCard("Saturn Finger", analysisResult.detailed_analysis?.finger_analysis?.saturn_finger, Mountain)}
            </div>
            <div data-card="apollo_finger">
              {renderFingerAnalysisCard("Apollo Finger", analysisResult.detailed_analysis?.finger_analysis?.apollo_finger, Sun)}
            </div>
            <div data-card="mercury_finger">
              {renderFingerAnalysisCard("Mercury Finger", analysisResult.detailed_analysis?.finger_analysis?.mercury_finger, Zap)}
            </div>
          </>
        )}

        {activeAnalysisTab === 'major' && (
          <>
            <div data-card="heart_line">
              {renderMajorLineCard("Heart Line", analysisResult.detailed_analysis?.major_lines?.heart_line, Heart)}
            </div>
            <div data-card="head_line">
              {renderMajorLineCard("Head Line", analysisResult.detailed_analysis?.major_lines?.head_line, Brain)}
            </div>
            <div data-card="life_line">
              {renderMajorLineCard("Life Line", analysisResult.detailed_analysis?.major_lines?.life_line, Activity)}
            </div>
            <div data-card="destiny_line">
              {renderMajorLineCard("Destiny Line", analysisResult.detailed_analysis?.major_lines?.destiny_line, Target)}
            </div>
            <div data-card="worry_lines">
              {renderMajorLineCard("Worry Lines", analysisResult.detailed_analysis?.major_lines?.worry_lines, Navigation)}
            </div>
          </>
        )}

        {activeAnalysisTab === 'minor' && (
          <>
            <div data-card="sun_line">
              {renderMinorLineAnalysisCard("Sun Line", analysisResult.detailed_analysis?.minor_lines_analysis?.sun_line, Sun)}
            </div>
            <div data-card="girdle_of_venus">
              {renderMinorLineAnalysisCard("Girdle of Venus", analysisResult.detailed_analysis?.minor_lines_analysis?.girdle_of_venus, Moon)}
            </div>
            <div data-card="hepatica_line">
              {renderMinorLineAnalysisCard("Hepatica Line", analysisResult.detailed_analysis?.minor_lines_analysis?.hepatica_line, Activity)}
            </div>
            <div data-card="ring_of_solomon">
              {renderMinorLineAnalysisCard("Ring of Solomon", analysisResult.detailed_analysis?.minor_lines_analysis?.ring_of_solomon, Crown)}
            </div>
            <div data-card="sympathy_line">
              {renderMinorLineAnalysisCard("Sympathy Line", analysisResult.detailed_analysis?.minor_lines_analysis?.sympathy_line, Heart)}
            </div>
            <div data-card="relationship_lines">
              {renderMinorLineAnalysisCard("Relationship Lines", analysisResult.detailed_analysis?.minor_lines_analysis?.relationship_lines, Users)}
            </div>
            <div data-card="children_lines">
              {renderMinorLineAnalysisCard("Children Lines", analysisResult.detailed_analysis?.minor_lines_analysis?.children_lines, Star)}
            </div>
            <div data-card="travel_lines">
              {renderMinorLineAnalysisCard("Travel Lines", analysisResult.detailed_analysis?.minor_lines_analysis?.travel_lines, Navigation)}
            </div>
            <div data-card="intuition_line">
              {renderMinorLineAnalysisCard("Intuition Line", analysisResult.detailed_analysis?.minor_lines_analysis?.intuition_line, Lightbulb)}
            </div>
            <div data-card="medical_stigmata">
              {renderMinorLineAnalysisCard("Medical Stigmata", analysisResult.detailed_analysis?.minor_lines_analysis?.medical_stigmata, Shield)}
            </div>
            <div data-card="via_lasciva">
              {renderMinorLineAnalysisCard("Via Lasciva", analysisResult.detailed_analysis?.minor_lines_analysis?.via_lasciva, Zap)}
            </div>
            <div data-card="family_chain">
              {renderMinorLineAnalysisCard("Family Chain", analysisResult.detailed_analysis?.minor_lines_analysis?.family_chain, Users)}
            </div>
            <div data-card="rascettes">
              {renderMinorLineAnalysisCard("Rascettes", analysisResult.detailed_analysis?.minor_lines_analysis?.rascettes, Activity)}
            </div>
            <div data-card="simian_crease">
              {renderMinorLineAnalysisCard("Simian Crease", analysisResult.detailed_analysis?.minor_lines_analysis?.simian_crease, Hand)}
            </div>
          </>
        )}

        {activeAnalysisTab === 'mounts' && (
          <>
            <div data-card="mount_jupiter">
              {renderMountCard("Mount of Jupiter", analysisResult.detailed_analysis?.mounts_analysis?.mount_jupiter, Star)}
            </div>
            <div data-card="mount_saturn">
              {renderMountCard("Mount of Saturn", analysisResult.detailed_analysis?.mounts_analysis?.mount_saturn, Mountain)}
            </div>
            <div data-card="mount_apollo">
              {renderMountCard("Mount of Apollo", analysisResult.detailed_analysis?.mounts_analysis?.mount_apollo, Sun)}
            </div>
            <div data-card="mount_mercury">
              {renderMountCard("Mount of Mercury", analysisResult.detailed_analysis?.mounts_analysis?.mount_mercury, Zap)}
            </div>
            <div data-card="mount_venus">
              {renderMountCard("Mount of Venus", analysisResult.detailed_analysis?.mounts_analysis?.mount_venus, Heart)}
            </div>
            <div data-card="mount_inner_mars">
              {renderMountCard("Inner Mars", analysisResult.detailed_analysis?.mounts_analysis?.mount_inner_mars, Shield)}
            </div>
            <div data-card="mount_outer_mars">
              {renderMountCard("Outer Mars", analysisResult.detailed_analysis?.mounts_analysis?.mount_outer_mars, Target)}
            </div>
            <div data-card="mount_luna">
              {renderMountCard("Mount of Luna", analysisResult.detailed_analysis?.mounts_analysis?.mount_luna, Moon)}
            </div>
            <div data-card="mount_neptune">
              {renderMountCard("Mount of Neptune", analysisResult.detailed_analysis?.mounts_analysis?.mount_neptune, Navigation)}
            </div>
          </>
        )}

        {activeAnalysisTab === 'fingerprints' && (
          <>
            <div data-card="finger_pattern_loops">
              {renderFingerprintAnalysisCard("Loops Analysis", analysisResult.detailed_analysis?.fingerprint_patterns_analysis?.finger_pattern_loops, CircleDot)}
            </div>
            <div data-card="finger_pattern_whorls">
              {renderFingerprintAnalysisCard("Whorls Analysis", analysisResult.detailed_analysis?.fingerprint_patterns_analysis?.finger_pattern_whorls, Pentagon)}
            </div>
            <div data-card="finger_pattern_arches">
              {renderFingerprintAnalysisCard("Arches Analysis", analysisResult.detailed_analysis?.fingerprint_patterns_analysis?.finger_pattern_arches, Triangle)}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderGuidanceCard = (title: string, icon: React.ComponentType<{ className?: string }>, number: number, guidance: Record<string, unknown>, colorScheme: {gradient: string, iconColor: string, textColor: string, bulletColor: string}) => (
    <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-purple-500/30">
      <div className="flex items-start space-x-4 mb-4">
        <div className={`w-8 h-8 bg-gradient-to-r ${colorScheme.gradient} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
          {number}
        </div>
        <div className="flex items-center space-x-2">
          {React.createElement(icon, { className: `w-5 h-5 ${colorScheme.iconColor}` })}
          <h4 className="font-semibold text-white">{guidance?.title || title}</h4>
        </div>
      </div>
      
      <div className="space-y-3">
        {guidance?.recommended_fields?.map((field: string, index: number) => (
          <div key={index} className="flex items-start space-x-2">
            <div className={`w-2 h-2 ${colorScheme.bulletColor} rounded-full mt-1.5 flex-shrink-0`}></div>
            <span className={`text-sm ${colorScheme.textColor}`}>{field}</span>
          </div>
        ))}
        {guidance?.work_style_tips?.map((tip: string, index: number) => (
          <div key={index} className="flex items-start space-x-2">
            <div className={`w-2 h-2 ${colorScheme.bulletColor} rounded-full mt-1.5 flex-shrink-0`}></div>
            <span className={`text-sm ${colorScheme.textColor}`}>{tip}</span>
          </div>
        ))}
        {guidance?.relationship_tips?.map((tip: string, index: number) => (
          <div key={index} className="flex items-start space-x-2">
            <div className={`w-2 h-2 ${colorScheme.bulletColor} rounded-full mt-1.5 flex-shrink-0`}></div>
            <span className={`text-sm ${colorScheme.textColor}`}>{tip}</span>
          </div>
        ))}
        {guidance?.wellness_tips?.map((tip: string, index: number) => (
          <div key={index} className="flex items-start space-x-2">
            <div className={`w-2 h-2 ${colorScheme.bulletColor} rounded-full mt-1.5 flex-shrink-0`}></div>
            <span className={`text-sm ${colorScheme.textColor}`}>{tip}</span>
          </div>
        ))}
        {guidance?.personal_growth?.map((growth: string, index: number) => (
          <div key={index} className="flex items-start space-x-2">
            <div className={`w-2 h-2 ${colorScheme.bulletColor} rounded-full mt-1.5 flex-shrink-0`}></div>
            <span className={`text-sm ${colorScheme.textColor}`}>{growth}</span>
          </div>
        ))}
        {guidance?.wealth_building?.map((wealth: string, index: number) => (
          <div key={index} className="flex items-start space-x-2">
            <div className={`w-2 h-2 ${colorScheme.bulletColor} rounded-full mt-1.5 flex-shrink-0`}></div>
            <span className={`text-sm ${colorScheme.textColor}`}>{wealth}</span>
          </div>
        ))}
        {!guidance?.recommended_fields && !guidance?.work_style_tips && !guidance?.relationship_tips && !guidance?.wellness_tips && !guidance?.personal_growth && !guidance?.wealth_building && (
          <div className={`${colorScheme.textColor} text-sm`}>Guidance recommendations will appear here</div>
        )}
      </div>
    </div>
  );

  const renderInsightsPage = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 md:p-8 shadow-xl border border-purple-500/30 mb-8">
        <div className="flex items-center space-x-3 mb-4 md:mb-6">
          <Hand className="w-8 h-8 text-yellow-400" />
          <h3 className="text-2xl font-bold text-white">Your Complete Palm Reading Summary</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">Overall Personality</h4>
            <p className="text-purple-200">
              {analysisResult.insights_and_summary?.final_conclusion?.comprehensive_summary?.overall_personality || 
               "Your palm reveals a unique combination of traits that define your character and approach to life."}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-purple-300 mb-3">Life Themes</h4>
            <div className="flex flex-wrap gap-2">
              {analysisResult.insights_and_summary?.final_conclusion?.comprehensive_summary?.life_themes?.map((theme: string, index: number) => (
                <span key={index} className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 px-3 py-1 rounded-full text-sm font-medium border border-purple-400/30">
                  {theme}
                </span>
              )) || (
                <span className="text-purple-300 text-sm">Life themes will be displayed here</span>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-purple-300 mb-3">Strongest Traits</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysisResult.insights_and_summary?.final_conclusion?.comprehensive_summary?.strongest_traits?.map((trait: string, index: number) => (
                <div key={index} className="flex items-center space-x-2 bg-yellow-400/10 rounded-lg p-3 border border-yellow-400/30">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white">{trait}</span>
                </div>
              )) || null}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-purple-300 mb-3">Unique Gifts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysisResult.insights_and_summary?.final_conclusion?.comprehensive_summary?.unique_gifts?.map((gift: string, index: number) => (
                <div key={index} className="flex items-center space-x-2 bg-yellow-400/10 rounded-lg p-3 border border-yellow-400/30">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white">{gift}</span>
                </div>
              )) || (
                <div className="col-span-full text-purple-300 text-sm text-center py-4">
                  Your unique gifts will be highlighted here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 md:p-8 shadow-xl border border-purple-500/30">
        <div className="flex items-center space-x-3 mb-4 md:mb-6">
          <Lightbulb className="w-8 h-8 text-yellow-400" />
          <h3 className="text-2xl font-bold text-white">Actionable Guidance & Tips</h3>
        </div>
        <p className="text-purple-200 mb-4 md:mb-6">
          Personalized recommendations to help you navigate life's journey based on your palm reading insights.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          {renderGuidanceCard("Career & Professional", TrendingUp, 1, analysisResult.insights_and_summary?.actionable_guidance?.career_guidance, {
            gradient: "from-blue-500 to-cyan-500",
            iconColor: "text-blue-400",
            textColor: "text-purple-200",
            bulletColor: "bg-purple-400"
          })}
          {renderGuidanceCard("Relationships & Love", Heart, 2, analysisResult.insights_and_summary?.actionable_guidance?.relationship_guidance, {
            gradient: "from-pink-500 to-rose-500",
            iconColor: "text-pink-400",
            textColor: "text-purple-200",
            bulletColor: "bg-purple-400"
          })}
          {renderGuidanceCard("Health & Wellness", Shield, 3, analysisResult.insights_and_summary?.actionable_guidance?.health_guidance, {
            gradient: "from-green-500 to-emerald-500",
            iconColor: "text-green-400",
            textColor: "text-purple-200",
            bulletColor: "bg-purple-400"
          })}
          {renderGuidanceCard("Spiritual Growth", Sparkles, 4, analysisResult.insights_and_summary?.actionable_guidance?.spiritual_guidance, {
            gradient: "from-violet-500 to-purple-500",
            iconColor: "text-violet-400",
            textColor: "text-purple-200",
            bulletColor: "bg-purple-400"
          })}
          {renderGuidanceCard("Financial Prosperity", Crown, 5, analysisResult.insights_and_summary?.actionable_guidance?.financial_guidance, {
            gradient: "from-amber-500 to-yellow-500",
            iconColor: "text-amber-400",
            textColor: "text-purple-200",
            bulletColor: "bg-purple-400"
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0% {
              transform: translateY(0px);
            }
            26.3% {
              transform: translateY(-8px);
            }
            52.6% {
              transform: translateY(0px);
            }
            100% {
              transform: translateY(0px);
            }
          }
        `
      }} />
      <div className="mx-auto px-0 md:px-4 py-8">
        {renderHeader()}
        {renderNavigation()}
        
        <div className="animate-fade-in">
          {currentPage === 'overview' && renderOverviewPage()}
          {currentPage === 'analysis' && renderAnalysisPage()}
          {currentPage === 'insights' && renderInsightsPage()}
        </div>
      </div>
    </div>
  );
}