import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const openAiApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Function to validate JSON structure against template
function validateJsonStructure(data: Record<string, unknown>, template: Record<string, unknown>): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = []

  function checkStructure(obj: Record<string, unknown>, temp: Record<string, unknown>, path: string = ''): void {
    if (typeof temp !== 'object' || temp === null) {
      return
    }

    for (const key in temp) {
      const currentPath = path ? `${path}.${key}` : key

      if (!(key in obj)) {
        missingFields.push(currentPath)
        continue
      }

      if (typeof temp[key] === 'object' && temp[key] !== null && !Array.isArray(temp[key])) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          checkStructure(obj[key], temp[key], currentPath)
        } else {
          missingFields.push(currentPath)
        }
      }
    }
  }

  checkStructure(data, template)
  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('🚀 Palm reading function invoked', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  })

  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.log('❌ Authentication failed', { authError: authError?.message })
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ User authenticated', {
      userId: user.id,
      email: user.email
    })

    const { palmProfile, palmImageUrl } = await req.json()

    console.log('📝 Input validation', {
      hasPalmProfile: !!palmProfile,
      hasPalmImageUrl: !!palmImageUrl,
      palmProfileKeys: palmProfile ? Object.keys(palmProfile).length : 0
    })

    if (!palmProfile) {
      console.log('❌ Input validation failed - missing palm profile')
      return new Response(
        JSON.stringify({ error: 'Palm profile is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!openAiApiKey) {
      console.log('❌ OpenAI API key not configured')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Input validation completed successfully')

    // Check for existing processing or completed analysis
    const { data: existingRecord, error: checkError } = await supabase
      .from('palm_profile')
      .select('id, status, processing_started_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.log('❌ Error checking existing analysis:', checkError)
      return new Response(
        JSON.stringify({ error: 'Database error while checking existing analysis' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // If analysis is already processing, prevent duplicate submission
    if (existingRecord?.status === 'processing') {
      console.log('⚠️ Analysis already in progress for user:', user.id)
      return new Response(
        JSON.stringify({ 
          error: 'Palm analysis is already in progress. Please wait for completion or check results.' 
        }),
        {
          status: 409, // Conflict
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // If analysis is already completed, prevent duplicate submission
    if (existingRecord?.status === 'completed') {
      console.log('⚠️ Analysis already completed for user:', user.id)
      return new Response(
        JSON.stringify({ 
          error: 'Palm analysis already completed. Please check your results.' 
        }),
        {
          status: 409, // Conflict
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create or update record with processing status
    let palmProfileId: string
    if (existingRecord) {
      // Update existing record (likely failed status)
      const { data: updatedRecord, error: updateError } = await supabase
        .from('palm_profile')
        .update({
          status: 'processing',
          processing_started_at: new Date().toISOString(),
          palm_image_url: palmImageUrl,
          questionnaire_data: palmProfile,
          ai_analysis: {} // Clear previous failed analysis
        })
        .eq('id', existingRecord.id)
        .select('id')
        .single()

      if (updateError) {
        console.log('❌ Error updating palm profile status:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update analysis status' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      palmProfileId = updatedRecord.id
    } else {
      // Create new record with processing status
      const { data: newRecord, error: insertError } = await supabase
        .from('palm_profile')
        .insert({
          user_id: user.id,
          status: 'processing',
          processing_started_at: new Date().toISOString(),
          palm_image_url: palmImageUrl,
          questionnaire_data: palmProfile,
          ai_analysis: {}
        })
        .select('id')
        .single()

      if (insertError) {
        console.log('❌ Error creating palm profile record:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to create analysis record' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      palmProfileId = newRecord.id
    }

    console.log('✅ Palm profile record created/updated with processing status', {
      palmProfileId,
      userId: user.id
    })

    const outputJsonTemplate = {
      "detailed_analysis": {
        "major_lines": {
          "heart_line": {
            "title": "Heart Line Analysis",
            "ending_position": "",
            "features": [],
            "emotional_nature": "",
            "relationship_patterns": "",
            "compatibility": ""
          },
          "head_line": {
            "title": "Head Line Analysis",
            "starting_position": "",
            "length": "",
            "type": [],
            "thinking_style": "",
            "decision_making": "",
            "intellectual_capacity": ""
          },
          "life_line": {
            "title": "Life Line Analysis",
            "course": "",
            "features": [],
            "vitality": "",
            "life_approach": "",
            "major_life_events": ""
          },
          "destiny_line": {
            "title": "Destiny Line Analysis",
            "presence": "",
            "start_position": "",
            "end_position": "",
            "features": [],
            "career_path": "",
            "life_purpose": ""
          },
          "worry_lines": {
            "title": "Worry Lines Analysis",
            "quantity": "",
            "stress_levels": "",
            "anxiety_tendencies": "",
            "coping_mechanisms": ""
          }
        },
        "hand_analysis": {
          "hand_type": {
            "title": "Hand Type Classification",
            "elemental_type": "",
            "detailed_type": "",
            "interpretation": "",
            "characteristics": []
          },
          "hand_physical": {
            "title": "Physical Hand Characteristics",
            "skin_texture": "",
            "palm_consistency": "",
            "hand_flexibility": "",
            "hand_size": "",
            "palm_color": "",
            "overall_interpretation": ""
          },
          "hand_quadrants": {
            "title": "Four Quadrants Energy Distribution",
            "dominant_quadrant": "",
            "energy_distribution": "",
            "personality_implications": ""
          },
          "hand_comparison": {
            "title": "Left vs Right Hand Analysis",
            "dominant_hand": "",
            "hand_differences": "",
            "interpretation": "",
            "personality_balance": ""
          }
        },
        "minor_lines_analysis": {
          "sun_line": {
            "title": "Sun Line (Apollo Line) Analysis",
            "presence": "",
            "interpretation": "",
            "fame_factor": ""
          },
          "girdle_of_venus": {
            "title": "Girdle of Venus Analysis",
            "presence": "",
            "interpretation": "",
            "artistic_nature": ""
          },
          "hepatica_line": {
            "title": "Hepatica (Health Line) Analysis",
            "presence": "",
            "interpretation": "",
            "wellness_insights": ""
          },
          "ring_of_solomon": {
            "title": "Ring of Solomon Analysis",
            "presence": "",
            "interpretation": "",
            "spiritual_insight": ""
          },
          "sympathy_line": {
            "title": "Sympathy Line Analysis",
            "presence": "",
            "interpretation": "",
            "healing_abilities": ""
          },
          "relationship_lines": {
            "title": "Relationship Lines Analysis",
            "presence": "",
            "number_of_lines": "",
            "marriage_potential": "",
            "relationship_timing": ""
          },
          "children_lines": {
            "title": "Children Lines Analysis",
            "presence": "",
            "number_of_lines": "",
            "parenting_style": "",
            "family_insights": ""
          },
          "travel_lines": {
            "title": "Travel Lines Analysis",
            "presence": "",
            "travel_frequency": "",
            "wanderlust": "",
            "significant_journeys": ""
          },
          "intuition_line": {
            "title": "Intuition Line Analysis",
            "presence": "",
            "psychic_abilities": "",
            "spiritual_connection": "",
            "inner_wisdom": ""
          },
          "medical_stigmata": {
            "title": "Medical Stigmata Analysis",
            "presence": "",
            "healing_abilities": "",
            "medical_aptitude": "",
            "service_orientation": ""
          },
          "via_lasciva": {
            "title": "Via Lasciva Analysis",
            "presence": "",
            "interpretation": "",
            "adventure_seeking": ""
          },
          "family_chain": {
            "title": "Family Chain Analysis",
            "presence": "",
            "family_bonds": "",
            "ancestral_influence": ""
          },
          "rascettes": {
            "title": "Rascettes (Bracelet Lines) Analysis",
            "presence": "",
            "number_of_lines": "",
            "health_longevity": "",
            "prosperity_signs": ""
          },
          "simian_crease": {
            "title": "Simian Crease Analysis",
            "presence": "",
            "interpretation": "",
            "personality_traits": "",
            "life_approach": ""
          }
        },
        "mounts_analysis": {
          "mount_jupiter": {
            "title": "Mount of Jupiter Analysis",
            "development": "",
            "leadership_qualities": "",
            "ambition_level": "",
            "authority_comfort": ""
          },
          "mount_saturn": {
            "title": "Mount of Saturn Analysis",
            "development": "",
            "responsibility_sense": "",
            "discipline_level": "",
            "serious_nature": ""
          },
          "mount_apollo": {
            "title": "Mount of Apollo Analysis",
            "development": "",
            "creativity_level": "",
            "self_expression": "",
            "recognition_desire": ""
          },
          "mount_mercury": {
            "title": "Mount of Mercury Analysis",
            "development": "",
            "communication_skills": "",
            "business_acumen": "",
            "adaptability": ""
          },
          "mount_venus": {
            "title": "Mount of Venus Analysis",
            "development": "",
            "love_capacity": "",
            "sensuality": "",
            "artistic_appreciation": ""
          },
          "mount_inner_mars": {
            "title": "Mount of Inner Mars Analysis",
            "development": "",
            "courage_level": "",
            "resistance_to_pressure": "",
            "assertiveness": ""
          },
          "mount_outer_mars": {
            "title": "Mount of Outer Mars Analysis",
            "development": "",
            "persistence": "",
            "determination": "",
            "defensive_nature": ""
          },
          "mount_luna": {
            "title": "Mount of Luna Analysis",
            "development": "",
            "imagination": "",
            "subconscious_connection": "",
            "emotional_depth": ""
          },
          "mount_neptune": {
            "title": "Mount of Neptune Analysis",
            "development": "",
            "spiritual_connection": "",
            "intuitive_abilities": "",
            "transformation_power": ""
          }
        },
        "finger_analysis": {
          "finger_setting": {
            "title": "Finger Setting Analysis",
            "setting_type": "",
            "stress_lines": "",
            "interpretation": "",
            "confidence_level": ""
          },
          "fingertip_shapes": {
            "title": "Fingertip Shape Analysis",
            "shape_type": "",
            "interpretation": "",
            "thinking_style": ""
          },
          "jupiter_finger": {
            "title": "Index Finger (Jupiter) Analysis",
            "length": "",
            "shape": "",
            "interpretation": "",
            "career_implications": ""
          },
          "saturn_finger": {
            "title": "Middle Finger (Saturn) Analysis",
            "length": "",
            "shape": "",
            "interpretation": "",
            "life_approach": ""
          },
          "apollo_finger": {
            "title": "Ring Finger (Apollo) Analysis",
            "length": "",
            "shape": "",
            "interpretation": "",
            "artistic_potential": ""
          },
          "mercury_finger": {
            "title": "Little Finger (Mercury) Analysis",
            "length": "",
            "shape": "",
            "interpretation": "",
            "relationship_skills": ""
          }
        },
        "fingerprint_patterns_analysis": {
          "finger_pattern_loops": {
            "title": "Loop Patterns Analysis",
            "presence": "",
            "personality_traits": "",
            "social_skills": "",
            "decision_making": ""
          },
          "finger_pattern_whorls": {
            "title": "Whorl Patterns Analysis",
            "presence": "",
            "personality_traits": "",
            "unique_perspective": "",
            "leadership_style": ""
          },
          "finger_pattern_arches": {
            "title": "Arch Patterns Analysis",
            "presence": "",
            "personality_traits": "",
            "work_ethic": "",
            "life_approach": ""
          }
        }
      },
      "overview_and_profile": {
        "personality_overview": {
          "title": "Your Personality Profile",
          "content": "",
          "traits": []
        },
        "analysis_highlights": {
          "career_card": {
            "title": "Career & Professional Life",
            "summary": "",
            "key_points": []
          },
          "life_destiny_card": {
            "title": "Life Path & Destiny",
            "summary": "",
            "key_points": []
          },
          "love_relationships_card": {
            "title": "Love & Relationships",
            "summary": "",
            "key_points": []
          },
          "health_vitality_card": {
            "title": "Health & Vitality",
            "summary": "",
            "key_points": []
          },
          "financial_prosperity_card": {
            "title": "Financial Prosperity",
            "summary": "",
            "key_points": []
          },
          "spiritual_growth_card": {
            "title": "Spiritual & Personal Growth",
            "summary": "",
            "key_points": []
          }
        }
      },
      "insights_and_summary": {
        "final_conclusion": {
          "comprehensive_summary": {
            "title": "Your Complete Palm Reading Summary",
            "overall_personality": "",
            "life_themes": [],
            "strongest_traits": [],
            "areas_for_growth": [],
            "life_path_direction": "",
            "unique_gifts": []
          }
        },
        "actionable_guidance": {
          "career_guidance": {
            "title": "Career & Professional Guidance",
            "recommended_fields": [],
            "work_style_tips": [],
            "leadership_potential": "",
            "professional_growth": ""
          },
          "relationship_guidance": {
            "title": "Relationship & Love Guidance",
            "compatibility_traits": "",
            "relationship_tips": [],
            "communication_advice": "",
            "emotional_growth": ""
          },
          "health_guidance": {
            "title": "Health & Wellness Guidance",
            "stress_management": "",
            "wellness_tips": [],
            "energy_optimization": "",
            "preventive_care": ""
          },
          "spiritual_guidance": {
            "title": "Spiritual & Personal Growth Guidance",
            "meditation_practices": "",
            "intuition_development": "",
            "personal_growth": [],
            "life_purpose": ""
          },
          "financial_guidance": {
            "title": "Financial & Prosperity Guidance",
            "money_management": "",
            "investment_style": "",
            "wealth_building": [],
            "prosperity_mindset": ""
          }
        }
      }
    }

    // Generate the palm analysis prompt
    const prompt = `You are a professional palm reader with extensive knowledge of palmistry. Based on the following palm profile generated from detailed questionnaire responses, provide a comprehensive palm analysis.

**User's Palm Profile:**
${JSON.stringify(palmProfile, null, 2)}

**Instructions:**
1. Analyze the user's PALM PROFILE (given above) to understand their palm characteristics
2. Based on the profile you need to generate a structured JSON in EXACT template given below.
3. Be specific and detailed in your interpretations

**Required Response Format (JSON):**
${JSON.stringify(outputJsonTemplate, null, 2)}

Special Instructions for anaysis highlishts subsection in the overview and profile sections:
- In this section we have 6 cards each have summary and key points. These two things (summary and key points) should be based on the detailed analysis of the palm profile (like based on interpretation of major lines, mounts, fingers, etc.).
- They should therefore contain references to the detailed analysis of the palm profile in following format (few examples):
    - Your [destiny line]<destiny_line> ending in a trident suggests multiple fulfilling paths in life Destiny Line Analysis.
    - You may experience significant changes marked by your [Life Line features]<major_lines|life_line>.
    - [Girdle of Venus]<girdle_of_venus> suggests a passionate and intense approach to love.
    - Strong leadership potential due to the developed [Mount of Jupiter]<mount_jupiter>.
    - [Earth hand type]<hand_type> suggests a grounded approach to financial matters.
- So basically the reference phrase is of format [phrase]<reference>, where phrase is actual text related to features while reference is the proper name of that feature. Name of the feature is fixed and is taken from detailed anaysis section.
- You need to select one of the features from the detailed analysis section and use it in the phrase.
    - heart_line, head_line, life_line, destiny_line, worry_lines
    -hand_type, hand_physical, hand_quadrants, hand_comparison
    - sun_line, girdle_of_venus, hepatica_line, ring_of_solomon, sympathy_line, relationship_lines, children_lines, travel_lines, intuition_line, medical_stigmata, via_lasciva, family_chain, rascettes, simian_crease
    - mount_jupiter, mount_saturn, mount_apollo, mount_mercury, mount_venus, mount_inner_mars, mount_outer_mars, mount_luna, mount_neptune
    - finger_setting, fingertip_shapes, jupiter_finger, saturn_finger, apollo_finger, mercury_finger
    - finger_pattern_loops, finger_pattern_whorls, finger_pattern_arches

Now provide a comprehensive analysis based on the user's palm profile. Return only the JSON response without any additional text.`;

    console.log('🤖 Calling OpenAI API', {
      timestamp: new Date().toISOString(),
      model: 'gpt-4o-mini',
      promptLength: prompt.length,
      maxTokens: 16384,
      temperature: 0.3
    })

    // Call OpenAI API
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional palm reader. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 16384,
        temperature: 0.3,
      }),
    })

    if (!openAiResponse.ok) {
      const error = await openAiResponse.text()
      console.log('❌ OpenAI API error', {
        status: openAiResponse.status,
        statusText: openAiResponse.statusText,
        error: error
      })
      return new Response(
        JSON.stringify({ error: 'Failed to analyze palm profile' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const openAiData = await openAiResponse.json()
    const analysisContent = openAiData.choices[0].message.content

    console.log('✅ OpenAI response received', {
      timestamp: new Date().toISOString(),
      responseLength: analysisContent?.length || 0,
      tokensUsed: openAiData.usage?.total_tokens || 0,
      finishReason: openAiData.choices[0].finish_reason
    })

    console.log('📝 Raw OpenAI response:', analysisContent)

    // Try to parse the JSON response
    let analysisData: Record<string, unknown>
    console.log('🔍 Starting JSON parsing', {
      timestamp: new Date().toISOString(),
      contentType: typeof analysisContent,
      contentLength: analysisContent?.length || 0
    })

    try {
      analysisData = JSON.parse(analysisContent)
      console.log('✅ JSON parsing successful', {
        dataKeys: Object.keys(analysisData).length,
        hasDetailedAnalysis: !!analysisData.detailed_analysis,
        hasOverview: !!analysisData.overview_and_profile,
        hasInsights: !!analysisData.insights_and_summary
      })
    } catch (parseError) {
      console.log('⚠️ Initial JSON parsing failed, trying regex extraction', {
        error: parseError instanceof Error ? parseError.message : 'Unknown error'
      })

      // If JSON parsing fails, try to extract JSON from the content
      const jsonMatch = analysisContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          analysisData = JSON.parse(jsonMatch[0])
          console.log('✅ Regex extraction successful', {
            extractedLength: jsonMatch[0].length,
            dataKeys: Object.keys(analysisData).length
          })
        } catch (e) {
          console.log('❌ Failed to parse extracted JSON', {
            error: e instanceof Error ? e.message : 'Unknown error',
            extractedContent: jsonMatch[0].substring(0, 200) + '...'
          })
          
          // Mark analysis as failed
          await supabase
            .from('palm_profile')
            .update({ status: 'failed' })
            .eq('id', palmProfileId)
          
          return new Response(
            JSON.stringify({ error: 'Failed to parse analysis results' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
      } else {
        console.log('❌ No valid JSON found in OpenAI response', {
          responsePreview: analysisContent.substring(0, 200) + '...'
        })
        // Mark analysis as failed
        await supabase
          .from('palm_profile')
          .update({ status: 'failed' })
          .eq('id', palmProfileId)
        
        return new Response(
          JSON.stringify({ error: 'Invalid analysis format received' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Validate the parsed JSON against the template
    console.log('🔍 Starting structure validation', {
      timestamp: new Date().toISOString()
    })

    const validation = validateJsonStructure(analysisData, outputJsonTemplate)
    if (!validation.isValid) {
      console.log('❌ Structure validation failed', {
        missingFieldsCount: validation.missingFields.length,
        missingFields: validation.missingFields,
        timestamp: new Date().toISOString()
      })
      // Mark analysis as failed
      await supabase
        .from('palm_profile')
        .update({ status: 'failed' })
        .eq('id', palmProfileId)
      
      return new Response(
        JSON.stringify({
          error: 'AI response does not match expected format',
          missingFields: validation.missingFields
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Structure validation passed', {
      timestamp: new Date().toISOString()
    })

    // Add metadata to the analysis
    const finalAnalysis = {
      ...analysisData,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      profile: palmProfile
    }

    // Update the existing record with completed analysis
    const { data: palmProfileRecord, error: dbError } = await supabase
      .from('palm_profile')
      .update({
        status: 'completed',
        ai_analysis: finalAnalysis
      })
      .eq('id', palmProfileId)
      .select()
      .single()

    if (dbError) {
      console.error('Database error updating completed analysis:', dbError)
      // Mark as failed if we can't save the results
      await supabase
        .from('palm_profile')
        .update({ status: 'failed' })
        .eq('id', palmProfileId)
      
      return new Response(
        JSON.stringify({ error: 'Failed to save analysis results' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({
        ...finalAnalysis,
        id: palmProfileRecord?.id || finalAnalysis.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in generate-palm-reading function:', error)
    
    // Try to mark analysis as failed if we have the palmProfileId
    if (typeof palmProfileId !== 'undefined') {
      try {
        await supabase
          .from('palm_profile')
          .update({ status: 'failed' })
          .eq('id', palmProfileId)
      } catch (updateError) {
        console.error('Failed to update status to failed:', updateError)
      }
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})