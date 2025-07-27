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

  console.log('🚀 Get profile function invoked', {
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

    // Only allow GET requests
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('📝 Fetching complete profile for user', { userId: user.id })

    // Get user's complete astro profile
    const { data: profile, error: profileError } = await supabase
      .from('astro_profile')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.log('❌ Error fetching profile:', profileError.message)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch profile',
          details: profileError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get user's basic profile information
    const { data: userProfile, error: userProfileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    if (userProfileError) {
      console.log('❌ Error fetching user profile:', userProfileError.message)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch user profile',
          details: userProfileError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Profile fetched successfully', {
      userId: user.id,
      hasAstroProfile: !!profile,
      hasUserProfile: !!userProfile,
      profileComplete: profile && profile.date_of_birth && profile.gender
    })

    // Return complete profile data
    return new Response(
      JSON.stringify({
        success: true,
        profile: {
          // Basic user info
          id: user.id,
          email: user.email,
          fullName: userProfile?.full_name || '',
          
          // Astro profile data
          dateOfBirth: profile?.date_of_birth || null,
          timeOfBirth: profile?.time_of_birth || null,
          placeOfBirth: profile?.place_of_birth || null,
          gender: profile?.gender || null,
          phone: profile?.phone || null,
          preferences: profile?.preferences || {},
          
          // Metadata
          createdAt: profile?.created_at || null,
          updatedAt: profile?.updated_at || null,
          
          // Computed fields
          isComplete: !!(profile?.date_of_birth && profile?.gender)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in get-profile function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching profile'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})