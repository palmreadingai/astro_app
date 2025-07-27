import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface FeedbackData {
  title: string
  message: string
  rating?: number
  category: 'bug' | 'feature' | 'improvement' | 'general'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('🚀 Submit feedback function invoked', {
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

    const { title, message, rating, category }: FeedbackData = await req.json()

    console.log('📝 Input validation', {
      hasTitle: !!title,
      hasMessage: !!message,
      rating: rating || 'not provided',
      category: category || 'not provided',
      titleLength: title?.length || 0,
      messageLength: message?.length || 0
    })

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      console.log('❌ Input validation failed - invalid title')
      return new Response(
        JSON.stringify({ error: 'Title is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      console.log('❌ Input validation failed - invalid message')
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!category || !['bug', 'feature', 'improvement', 'general'].includes(category)) {
      console.log('❌ Input validation failed - invalid category')
      return new Response(
        JSON.stringify({ error: 'Valid category is required (bug, feature, improvement, or general)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate rating if provided
    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      console.log('❌ Input validation failed - invalid rating')
      return new Response(
        JSON.stringify({ error: 'Rating must be between 1 and 5' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Prepare feedback data
    const feedbackData = {
      user_id: user.id,
      title: title.trim(),
      message: message.trim(),
      category,
      rating: rating || null,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('💾 Inserting feedback into database', {
      userId: user.id,
      category,
      hasRating: !!rating
    })

    // Insert feedback into database
    const { data: feedback, error: insertError } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single()

    if (insertError) {
      console.log('❌ Error inserting feedback:', insertError.message)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to submit feedback',
          details: insertError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Feedback submitted successfully', {
      feedbackId: feedback.id,
      userId: user.id,
      category: feedback.category,
      rating: feedback.rating,
      timestamp: new Date().toISOString()
    })

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Feedback submitted successfully',
        feedback: {
          id: feedback.id,
          title: feedback.title,
          category: feedback.category,
          rating: feedback.rating,
          status: feedback.status,
          created_at: feedback.created_at
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in submit-feedback function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred while submitting feedback'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})