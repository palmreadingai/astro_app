import { palmQuestions } from '../data/palmQuestions';

export interface PalmProfile {
  timestamp: string;
  totalQuestions: number;
  answeredQuestions: number;
  sections: {
    [sectionId: string]: {
      title: string;
      description: string;
      questions: {
        [questionId: string]: {
          question: string;
          answer: string | string[];
          type: 'single' | 'multiple';
        };
      };
    };
  };
}

export function generatePalmProfile(answers: { [key: string]: string | string[] }): PalmProfile {
  const profile: PalmProfile = {
    timestamp: new Date().toISOString(),
    totalQuestions: palmQuestions.reduce((total, section) => total + section.questions.length, 0),
    answeredQuestions: Object.keys(answers).length,
    sections: {}
  };

  // Process each section
  palmQuestions.forEach(section => {
    profile.sections[section.id] = {
      title: section.title,
      description: section.description,
      questions: {}
    };

    // Process each question in the section
    section.questions.forEach(question => {
      if (answers[question.id]) {
        profile.sections[section.id].questions[question.id] = {
          question: question.question,
          answer: answers[question.id],
          type: question.type
        };
      }
    });
  });

  return profile;
}

export function generatePalmAnalysisPrompt(profile: PalmProfile): string {
  const prompt = `You are a professional palm reader with extensive knowledge of palmistry. Based on the following palm profile generated from detailed questionnaire responses, provide a comprehensive palm analysis.

**Palm Profile:**
${JSON.stringify(profile, null, 2)}

**Instructions:**
1. Analyze the user's responses to understand their palm characteristics
2. Provide insights into personality traits, life path, relationships, career, and health
3. Base your analysis on traditional palmistry principles
4. Be specific and detailed in your interpretations
5. Maintain a positive but realistic tone

**Required Response Format (JSON):**
{
  "palmType": "earth/air/fire/water",
  "personalityTraits": [
    "trait 1",
    "trait 2",
    "trait 3",
    "trait 4"
  ],
  "lifePath": {
    "description": "detailed life path analysis",
    "keyThemes": ["theme1", "theme2", "theme3"]
  },
  "career": {
    "description": "career insights based on palm characteristics",
    "suitedFields": ["field1", "field2", "field3"]
  },
  "relationships": {
    "description": "relationship patterns and compatibility",
    "strengths": ["strength1", "strength2"],
    "challenges": ["challenge1", "challenge2"]
  },
  "health": {
    "description": "health indicators from palm analysis",
    "recommendations": ["recommendation1", "recommendation2"]
  },
  "majorLines": {
    "heartLine": "interpretation of heart line characteristics",
    "headLine": "interpretation of head line characteristics", 
    "lifeLine": "interpretation of life line characteristics",
    "destinyLine": "interpretation of destiny line characteristics"
  },
  "futureInsights": [
    "insight 1",
    "insight 2", 
    "insight 3",
    "insight 4"
  ]
}

Provide a comprehensive analysis based on the palm profile above.`;

  return prompt;
}