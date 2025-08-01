
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { PalmAnalysisResult } from './Results';

// Register fonts (if custom fonts are needed, otherwise Helvetica is a good default)
// Font.register({
//   family: 'Oswald',
//   src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
// });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#1a1a2e', // Dark background for the page
    padding: 40, // Increased padding for better margins
    fontFamily: 'Helvetica',
    color: '#e0e0e0', // Light text color for contrast
  },
  header: {
    textAlign: 'center',
    marginBottom: 30, // More space below header
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#4a4a6a', // Subtle border
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 28, // Larger title
    fontWeight: 'bold',
    color: '#e0e0e0',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    color: '#b0b0c0', // Slightly lighter subtitle
    marginTop: 5,
  },
  section: {
    marginBottom: 25, // More space between sections
    padding: 15,
    backgroundColor: '#2a2a4a', // Darker background for sections
    borderRadius: 8,
    break: false, // Prevent section from breaking across pages
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f0f0f0', // Brighter title for sections
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#6a6a8a', // More prominent border
    paddingBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: '#4a4a6a', // Darker border for cards
    borderRadius: 6,
    padding: 18, // More padding inside cards
    marginBottom: 15, // More space between cards
    backgroundColor: '#3a3a5a', // Slightly lighter background for cards
    break: false, // Prevent card from breaking across pages
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#f0f0f0',
  },
  content: {
    fontSize: 12, // Slightly larger content font
    color: '#d0d0d0',
    lineHeight: 1.6,
  },
  listItem: {
    fontSize: 12,
    marginBottom: 5,
    marginLeft: 15, // Indent list items
    color: '#d0d0d0',
  },
  trait: {
    backgroundColor: '#4a4a6a', // Darker background for traits
    color: '#f0f0f0',
    padding: 6,
    borderRadius: 4,
    fontSize: 11,
    marginRight: 6,
    marginBottom: 6,
    display: 'inline-block',
  },
  keyValueContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  key: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#b0b0c0',
    width: '35%', // Adjusted width for key
  },
  value: {
    fontSize: 12,
    color: '#d0d0d0',
    width: '65%', // Adjusted width for value
  },
});

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
    parts.push(match[1]); // Only display the text, ignore the reference for PDF
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.join('');
};

const renderObject = (data: Record<string, any>) => {
  if (!data) return null;
  return Object.entries(data).map(([key, value]) => {
    if (typeof value === 'string') {
      return (
        <View key={key} style={styles.keyValueContainer}>
          <Text style={styles.key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</Text>
          <Text style={styles.value}>{parseTextWithReferences(value)}</Text>
        </View>
      );
    }
    if (Array.isArray(value)) {
      return (
        <View key={key}>
          <Text style={styles.key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</Text>
          {value.map((item, index) => (
            <Text key={index} style={styles.listItem}>- {parseTextWithReferences(item)}</Text>
          ))}
        </View>
      );
    }
    return null;
  });
};

const renderHighlightCardPdf = (title: string, cardData: Record<string, any>) => {
    if (!cardData) return null;
    return (
      <View style={styles.card} key={title}>
        <Text style={styles.cardTitle}>{cardData.title || title}</Text>
        <Text style={styles.content}>{parseTextWithReferences(cardData.summary)}</Text>
        {cardData.key_points && (
          <View style={{ marginTop: 8 }}>
            {cardData.key_points.map((point: string, index: number) => (
              <Text key={index} style={styles.listItem}>• {parseTextWithReferences(point)}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderGuidanceCardPdf = (title: string, guidance: Record<string, any>) => {
    if (!guidance) return null;
    const fields = guidance.recommended_fields || guidance.work_style_tips || guidance.relationship_tips || guidance.wellness_tips || guidance.personal_growth || guidance.wealth_building;
    return (
      <View style={styles.card} key={title}>
        <Text style={styles.cardTitle}>{guidance.title || title}</Text>
        {fields && fields.map((item: string, index: number) => (
          <Text key={index} style={styles.listItem}>• {parseTextWithReferences(item)}</Text>
        ))}
      </View>
    );
  };


const PalmReadingReport = ({ analysisResult }: { analysisResult: PalmAnalysisResult | null }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {analysisResult ? (
        <>
          <View style={styles.header}>
            <Image src="/home/sudhir/Dropbox/untu/astro_app/public/logo.webp" style={styles.logo} />
            <Text style={styles.title}>Your Complete Palm Reading</Text>
            <Text style={styles.subtitle}>Insights into Your Life's Path</Text>
          </View>

          {/* Overview and Profile */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview and Profile</Text>
            {analysisResult.overview_and_profile && (
              <>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{analysisResult.overview_and_profile.personality_overview?.title || "Personality Profile"}</Text>
                  <Text style={styles.content}>{parseTextWithReferences(analysisResult.overview_and_profile.personality_overview?.content)}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
                    {analysisResult.overview_and_profile.personality_overview?.traits?.map((trait: string, index: number) => (
                      <Text key={index} style={styles.trait}>{parseTextWithReferences(trait)}</Text>
                    ))}
                  </View>
                </View>
                <Text style={{...styles.cardTitle, fontSize: 18, marginTop: 15, marginBottom: 10, color: '#f0f0f0'}}>Analysis Highlights</Text>
                {renderHighlightCardPdf("Career & Professional Life", analysisResult.overview_and_profile?.analysis_highlights?.career_card)}
                {renderHighlightCardPdf("Life Path & Destiny", analysisResult.overview_and_profile?.analysis_highlights?.life_destiny_card)}
                {renderHighlightCardPdf("Love & Relationships", analysisResult.overview_and_profile?.analysis_highlights?.love_relationships_card)}
                {renderHighlightCardPdf("Health & Vitality", analysisResult.overview_and_profile?.analysis_highlights?.health_vitality_card)}
                {renderHighlightCardPdf("Financial Prosperity", analysisResult.overview_and_profile?.analysis_highlights?.financial_prosperity_card)}
                {renderHighlightCardPdf("Spiritual Growth", analysisResult.overview_and_profile?.analysis_highlights?.spiritual_growth_card)}
              </>
            )}
          </View>

          {/* Detailed Analysis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detailed Analysis</Text>
            {analysisResult.detailed_analysis && Object.entries(analysisResult.detailed_analysis).map(([sectionKey, sectionValue]) => (
              <View key={sectionKey} style={{ marginBottom: 15 }}>
                <Text style={{...styles.cardTitle, fontSize: 18, marginTop: 15, marginBottom: 10, color: '#f0f0f0'}}>{sectionKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
                {typeof sectionValue === 'object' && sectionValue !== null && Object.entries(sectionValue).map(([cardKey, cardValue]) => (
                  <View key={cardKey} style={styles.card}>
                    <Text style={styles.cardTitle}>{cardValue?.title || cardKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
                    {renderObject(cardValue)}
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* Insights and Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insights and Summary</Text>
            {analysisResult.insights_and_summary?.final_conclusion?.comprehensive_summary && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Comprehensive Summary</Text>
                <Text style={styles.content}>{parseTextWithReferences(analysisResult.insights_and_summary.final_conclusion.comprehensive_summary.overall_personality)}</Text>
                
                <Text style={{...styles.key, marginTop: 15, marginBottom: 5, color: '#b0b0c0'}}>Life Themes:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
                    {analysisResult.insights_and_summary.final_conclusion.comprehensive_summary.life_themes?.map((theme: string, index: number) => (
                        <Text key={index} style={styles.trait}>{parseTextWithReferences(theme)}</Text>
                    ))}
                </View>

                <Text style={{...styles.key, marginTop: 15, marginBottom: 5, color: '#b0b0c0'}}>Strongest Traits:</Text>
                {analysisResult.insights_and_summary.final_conclusion.comprehensive_summary.strongest_traits?.map((trait: string, index: number) => (
                    <Text key={index} style={styles.listItem}>• {parseTextWithReferences(trait)}</Text>
                ))}

                <Text style={{...styles.key, marginTop: 15, marginBottom: 5, color: '#b0b0c0'}}>Unique Gifts:</Text>
                {analysisResult.insights_and_summary.final_conclusion.comprehensive_summary.unique_gifts?.map((gift: string, index: number) => (
                    <Text key={index} style={styles.listItem}>• {parseTextWithReferences(gift)}</Text>
                ))}
              </View>
            )}
             <Text style={{...styles.cardTitle, fontSize: 18, marginTop: 15, marginBottom: 10, color: '#f0f0f0'}}>Actionable Guidance</Text>
             {renderGuidanceCardPdf("Career Guidance", analysisResult.insights_and_summary?.actionable_guidance?.career_guidance)}
             {renderGuidanceCardPdf("Relationship Guidance", analysisResult.insights_and_summary?.actionable_guidance?.relationship_guidance)}
             {renderGuidanceCardPdf("Health Guidance", analysisResult.insights_and_summary?.actionable_guidance?.health_guidance)}
             {renderGuidanceCardPdf("Spiritual Guidance", analysisResult.insights_and_summary?.actionable_guidance?.spiritual_guidance)}
             {renderGuidanceCardPdf("Financial Guidance", analysisResult.insights_and_summary?.actionable_guidance?.financial_guidance)}
          </View>
        </>
      ) : (
        <Text>No analysis data available to generate a report.</Text>
      )}
    </Page>
  </Document>
);

export default PalmReadingReport;
