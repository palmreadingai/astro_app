import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get the JWT token from the authorization header
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Query the palm_profile table for existing analysis
    const { data: existingAnalysis, error: queryError } = await supabase
      .from('palm_profile')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (queryError) {
      console.error('Database query error:', queryError)
      return new Response(
        JSON.stringify({ error: 'Database query failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Return the result
    const result = existingAnalysis && existingAnalysis.length > 0 ? existingAnalysis[0] : null
    
    // If no record exists, return not_started status
    if (!result) {
      return new Response(
        JSON.stringify({ 
          status: 'not_started',
          analysis: null,
          userId: user.id
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Handle different statuses
    let formattedAnalysis = null;
    let responseData = {
      status: result.status || 'not_started',
      analysis: null,
      savedData: null,
      userId: user.id
    };
    
    switch (result.status) {
      case 'completed':
        if (result.ai_analysis) {
          formattedAnalysis = {
            id: result.id,
            userId: result.user_id,
            createdAt: result.created_at,
            profile: result.questionnaire_data,
            ...result.ai_analysis  // Spread the ai_analysis data
          };
          responseData.analysis = formattedAnalysis;
        }
        break;
        
      case 'failed':
        // Return saved data for retry
        responseData.savedData = {
          palmImageUrl: result.palm_image_url,
          questionnaire_data: result.questionnaire_data
        };
        break;
        
      case 'processing':
        // Include processing timestamp for timeout checking
        responseData.processingStartedAt = result.processing_started_at;
        break;
        
      default:
        // not_started or unknown status
        break;
    }
    
    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in check-palm-analysis function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})