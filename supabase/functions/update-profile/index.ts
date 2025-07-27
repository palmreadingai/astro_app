import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ProfileData {
  dateOfBirth: string
  timeOfBirth?: string | null
  placeOfBirth?: string | null
  gender: 'male' | 'female' | 'other'
}

// Validate date format (YYYY-MM-DD)
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime()) && 
         dateString.match(/^\d{4}-\d{2}-\d{2}$/) !== null
}

// Validate time format (HH:MM)
function isValidTime(timeString: string): boolean {
  return timeString.match(/^\d{2}:\d{2}$/) !== null
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('🚀 Update profile function invoked', {
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

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { dateOfBirth, timeOfBirth, placeOfBirth, gender }: ProfileData = await req.json()

    console.log('📝 Input validation', {
      hasDateOfBirth: !!dateOfBirth,
      hasTimeOfBirth: !!timeOfBirth,
      hasPlaceOfBirth: !!placeOfBirth,
      gender: gender || 'not provided',
      placeOfBirthLength: placeOfBirth?.length || 0
    })

    // Validate required fields
    if (!dateOfBirth || typeof dateOfBirth !== 'string' || !isValidDate(dateOfBirth)) {
      console.log('❌ Input validation failed - invalid date of birth')
      return new Response(
        JSON.stringify({ error: 'Valid date of birth is required (YYYY-MM-DD format)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }


    if (!gender || !['male', 'female', 'other'].includes(gender)) {
      console.log('❌ Input validation failed - invalid gender')
      return new Response(
        JSON.stringify({ error: 'Valid gender is required (male, female, or other)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate time of birth if provided
    if (timeOfBirth && (typeof timeOfBirth !== 'string' || !isValidTime(timeOfBirth))) {
      console.log('❌ Input validation failed - invalid time of birth')
      return new Response(
        JSON.stringify({ error: 'Time of birth must be in HH:MM format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if date of birth is not in the future
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    if (birthDate > today) {
      console.log('❌ Input validation failed - future date of birth')
      return new Response(
        JSON.stringify({ error: 'Date of birth cannot be in the future' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Prepare profile data
    const profileData = {
      user_id: user.id,
      date_of_birth: dateOfBirth,
      time_of_birth: timeOfBirth || null,
      place_of_birth: placeOfBirth ? placeOfBirth.trim() : null,
      gender,
      updated_at: new Date().toISOString()
    }

    console.log('💾 Upserting profile data', {
      userId: user.id,
      gender,
      hasTimeOfBirth: !!timeOfBirth
    })

    // Upsert profile data (now with unique constraint on user_id)
    const { data: profile, error: upsertError } = await supabase
      .from('astro_profile')
      .upsert(profileData, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (upsertError) {
      console.log('❌ Error upserting profile:', upsertError.message)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update profile',
          details: upsertError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Profile updated successfully', {
      profileId: profile.id,
      userId: user.id,
      gender: profile.gender,
      hasTimeOfBirth: !!profile.time_of_birth,
      timestamp: new Date().toISOString()
    })

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Profile updated successfully',
        profile: {
          id: profile.id,
          dateOfBirth: profile.date_of_birth,
          timeOfBirth: profile.time_of_birth,
          placeOfBirth: profile.place_of_birth,
          gender: profile.gender,
          updatedAt: profile.updated_at
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in update-profile function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred while updating profile'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})