import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const openAiApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('🚀 Chat completion function invoked', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  })

  try {
    // Get user from auth header (same pattern as check-palm-analysis)
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

    const { message, action } = await req.json()

    console.log('📝 Input validation', {
      hasMessage: !!message,
      action: action || 'none',
      messageLength: message?.length || 0
    })

    if (!message || typeof message !== 'string') {
      console.log('❌ Input validation failed - invalid message')
      return new Response(
        JSON.stringify({ error: 'Valid message is required' }),
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

    // Check daily message limit
    console.log('📊 Checking daily message limit')
    const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    
    const { data: existingLimit, error: limitError } = await supabase
      .from('user_message_limits')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', currentDate)
      .single()

    let currentCount = 0
    let dailyLimit = 10

    if (limitError && limitError.code !== 'PGRST116') {
      console.log('❌ Error checking message limits:', limitError.message)
      return new Response(
        JSON.stringify({ error: 'Failed to check message limits' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!existingLimit) {
      // Create new limit record for today
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
          JSON.stringify({ error: 'Failed to create message limit record' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      currentCount = 0
      dailyLimit = 10
    } else {
      currentCount = existingLimit.message_count
      dailyLimit = existingLimit.daily_limit
    }

    // Check if user has reached daily limit
    if (currentCount >= dailyLimit) {
      console.log('🚫 Daily message limit reached', {
        userId: user.id,
        currentCount,
        dailyLimit,
        date: currentDate
      })
      return new Response(
        JSON.stringify({ 
          error: 'Daily message limit reached',
          success: false,
          limitReached: true,
          currentCount,
          dailyLimit
        }),
        {
          status: 429, // Too Many Requests
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Message limit check passed', {
      userId: user.id,
      currentCount,
      dailyLimit,
      remaining: dailyLimit - currentCount
    })

    // Handle new chat action - clear existing chat history
    if (action === 'new_chat') {
      console.log('🔄 Starting new chat - clearing existing history')
      const { error: deleteError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('user_id', user.id)
      
      if (deleteError) {
        console.log('⚠️ Error clearing chat history:', deleteError.message)
        // Continue anyway, don't fail the request
      }
    }

    // Get existing chat session
    const { data: existingSession, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (sessionError && sessionError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.log('❌ Error fetching chat session:', sessionError.message)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch chat session' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get user's palm analysis for context
    const { data: palmProfile, error: palmError } = await supabase
      .from('palm_profile')
      .select('ai_analysis')
      .eq('user_id', user.id)
      .single()

    if (palmError) {
      console.log('⚠️ No palm analysis found for user:', palmError.message)
      // Continue without palm analysis context
    }

    // Prepare chat history
    const existingMessages: ChatMessage[] = existingSession?.messages || []
    
    // Add user message to history
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...existingMessages, userMessage]

    console.log('🤖 Preparing OpenAI request', {
      timestamp: new Date().toISOString(),
      hasPalmAnalysis: !!palmProfile?.ai_analysis,
      existingMessagesCount: existingMessages.length,
      totalMessagesCount: updatedMessages.length
    })

    // Construct system prompt with palm analysis context
    let systemPrompt = "You are Samadhan, an expert AI astrologer and palmist. You provide personalized guidance based on palmistry and astrology."
    
    if (palmProfile?.ai_analysis) {
      // Extract key insights from palm analysis for context
      const analysis = palmProfile.ai_analysis
      let palmContext = ""
      
      // Add personality overview if available
      if (analysis.overview_and_profile?.personality_overview?.content) {
        palmContext += `\n\nUser's Personality Profile: ${analysis.overview_and_profile.personality_overview.content}`
      }
      
      // Add key traits if available
      if (analysis.overview_and_profile?.personality_overview?.traits) {
        palmContext += `\n\nKey Traits: ${analysis.overview_and_profile.personality_overview.traits.join(', ')}`
      }
      
      // Add analysis highlights
      if (analysis.overview_and_profile?.analysis_highlights) {
        const highlights = analysis.overview_and_profile.analysis_highlights
        palmContext += "\n\nKey Life Areas:"
        
        if (highlights.career_card?.summary) {
          palmContext += `\n- Career: ${highlights.career_card.summary}`
        }
        if (highlights.love_relationships_card?.summary) {
          palmContext += `\n- Relationships: ${highlights.love_relationships_card.summary}`
        }
        if (highlights.health_vitality_card?.summary) {
          palmContext += `\n- Health: ${highlights.health_vitality_card.summary}`
        }
        if (highlights.life_destiny_card?.summary) {
          palmContext += `\n- Life Path: ${highlights.life_destiny_card.summary}`
        }
      }
      
      systemPrompt += palmContext
      systemPrompt += "\n\nUse this palm analysis to provide personalized, relevant guidance. Reference specific aspects of their palm reading when appropriate."
    }

    systemPrompt += "\n\nKeep responses helpful, insightful, and encouraging. Answer questions about palmistry, astrology, life guidance, and destiny. If asked about topics outside your expertise, gently redirect to astrological guidance."

    // Prepare messages for OpenAI
    const openAiMessages = [
      { role: 'system', content: systemPrompt },
      // Add recent chat history (limit to last 10 messages to avoid token limits)
      ...existingMessages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    console.log('🤖 Calling OpenAI API', {
      timestamp: new Date().toISOString(),
      model: 'gpt-4o-mini',
      messagesCount: openAiMessages.length,
      systemPromptLength: systemPrompt.length
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
        messages: openAiMessages,
        max_tokens: 1000,
        temperature: 0.7,
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
        JSON.stringify({ error: 'Failed to get AI response' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const openAiData = await openAiResponse.json()
    const aiResponseContent = openAiData.choices[0].message.content

    console.log('✅ OpenAI response received', {
      timestamp: new Date().toISOString(),
      responseLength: aiResponseContent?.length || 0,
      tokensUsed: openAiData.usage?.total_tokens || 0,
      finishReason: openAiData.choices[0].finish_reason
    })

    // Create AI message
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponseContent,
      timestamp: new Date().toISOString()
    }

    // Add AI response to messages
    const finalMessages = [...updatedMessages, aiMessage]

    // Increment daily message count after successful OpenAI response
    console.log('📈 Incrementing daily message count')
    const { error: incrementError } = await supabase
      .from('user_message_limits')
      .update({ 
        message_count: currentCount + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('date', currentDate)

    if (incrementError) {
      console.log('⚠️ Error incrementing message count:', incrementError.message)
      // Continue anyway, don't fail the request
    } else {
      console.log('✅ Message count incremented', {
        userId: user.id,
        newCount: currentCount + 1,
        dailyLimit,
        remaining: dailyLimit - (currentCount + 1)
      })
    }

    // Update or create chat session
    const sessionData = {
      user_id: user.id,
      title: existingSession?.title || 'Chat with Samadhan',
      messages: finalMessages,
      updated_at: new Date().toISOString()
    }

    if (existingSession) {
      // Update existing session
      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update(sessionData)
        .eq('id', existingSession.id)

      if (updateError) {
        console.log('❌ Error updating chat session:', updateError.message)
        // Continue anyway, return the response
      }
    } else {
      // Create new session
      const { error: insertError } = await supabase
        .from('chat_sessions')
        .insert(sessionData)

      if (insertError) {
        console.log('❌ Error creating chat session:', insertError.message)
        // Continue anyway, return the response
      }
    }

    console.log('✅ Chat session updated successfully', {
      timestamp: new Date().toISOString(),
      finalMessagesCount: finalMessages.length
    })

    // Return the AI response and updated messages
    return new Response(
      JSON.stringify({
        ai_message: aiMessage,
        all_messages: finalMessages,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in chat-completion function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})