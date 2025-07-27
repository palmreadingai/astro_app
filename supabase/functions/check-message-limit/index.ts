import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface MessageLimitResponse {
  success: boolean
  canSendMessage: boolean
  currentCount: number
  dailyLimit: number
  remainingMessages: number
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('🔍 Check message limit function invoked', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  })

  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Authorization required',
          canSendMessage: false,
          currentCount: 0,
          dailyLimit: 0,
          remainingMessages: 0
        }),
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
        JSON.stringify({ 
          success: false,
          error: 'Invalid authorization',
          canSendMessage: false,
          currentCount: 0,
          dailyLimit: 0,
          remainingMessages: 0
        }),
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

    // Get current date in UTC
    const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

    // Check existing message limit record for today
    const { data: existingLimit, error: fetchError } = await supabase
      .from('user_message_limits')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', currentDate)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.log('❌ Error fetching message limits:', fetchError.message)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to fetch message limits',
          canSendMessage: false,
          currentCount: 0,
          dailyLimit: 0,
          remainingMessages: 0
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let currentCount = 0
    let dailyLimit = 10 // Default limit

    if (!existingLimit) {
      // No record for today yet, create one
      console.log('📝 Creating new message limit record for today')
      const { data: newLimit, error: insertError } = await supabase
        .from('user_message_limits')
        .insert({
          user_id: user.id,
          date: currentDate,
          message_count: 0,
          daily_limit: 10
        })
        .select()
        .single()

      if (insertError) {
        console.log('❌ Error creating message limit record:', insertError.message)
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Failed to create message limit record',
            canSendMessage: false,
            currentCount: 0,
            dailyLimit: 0,
            remainingMessages: 0
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      currentCount = newLimit?.message_count || 0
      dailyLimit = newLimit?.daily_limit || 10
    } else {
      currentCount = existingLimit.message_count
      dailyLimit = existingLimit.daily_limit
    }

    const remainingMessages = Math.max(0, dailyLimit - currentCount)
    const canSendMessage = currentCount < dailyLimit

    console.log('📊 Message limit check result', {
      userId: user.id,
      currentCount,
      dailyLimit,
      remainingMessages,
      canSendMessage,
      date: currentDate
    })

    const response: MessageLimitResponse = {
      success: true,
      canSendMessage,
      currentCount,
      dailyLimit,
      remainingMessages
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in check-message-limit function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        canSendMessage: false,
        currentCount: 0,
        dailyLimit: 0,
        remainingMessages: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})