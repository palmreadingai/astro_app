import { useAppStore } from '../stores/appStore';
import { supabase } from '../integrations/supabase/client';
import { ChatMessage } from '../types';
import { checkPaymentStatus } from './paymentService';

interface ChatResponse {
  ai_message: ChatMessage;
  all_messages: ChatMessage[];
  success: boolean;
  limitReached?: boolean;
  currentCount?: number;
  dailyLimit?: number;
}

interface SendMessageResult {
  success: boolean;
  error?: string;
  limitReached?: boolean;
  currentCount?: number;
  dailyLimit?: number;
}

interface MessageLimitStatus {
  success: boolean;
  canSendMessage: boolean;
  currentCount: number;
  dailyLimit: number;
  remainingMessages: number;
  error?: string;
}

export const checkMessageLimit = async (): Promise<MessageLimitStatus> => {
  try {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { 
        success: false, 
        error: 'No active session',
        canSendMessage: false,
        currentCount: 0,
        dailyLimit: 0,
        remainingMessages: 0
      };
    }

    // Call the check-message-limit edge function
    const { data: result, error } = await supabase.functions.invoke('check-message-limit', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      }
    });

    if (error) {
      console.error('Error checking message limit:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to check message limit',
        canSendMessage: false,
        currentCount: 0,
        dailyLimit: 0,
        remainingMessages: 0
      };
    }

    return result as MessageLimitStatus;

  } catch (error) {
    console.error('Error in checkMessageLimit:', error);
    return { 
      success: false, 
      error: 'Network error occurred',
      canSendMessage: false,
      currentCount: 0,
      dailyLimit: 0,
      remainingMessages: 0
    };
  }
};

export const sendMessage = async (message: string): Promise<SendMessageResult> => {
  const store = useAppStore.getState();
  
  try {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: 'No active session' };
    }

    // ALWAYS check payment status first - critical blocking check
    const paymentResult = await checkPaymentStatus();
    
    if (!paymentResult.success) {
      console.error('Payment check failed:', paymentResult.error);
      return { success: false, error: 'Unable to verify payment status' };
    }
    
    if (!paymentResult.status?.hasPaid) {
      return { success: false, error: 'Premium subscription required to use chat feature' };
    }

    // Optimistic update - add user message immediately to store
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    store.addChatMessage(userMessage);

    // Call the edge function
    const { data: result, error } = await supabase.functions.invoke('chat-completion', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: { message }
    });

    if (error) {
      console.error('Error calling chat completion:', error);
      // Remove the optimistic message on error
      const currentHistory = store.chatHistory.filter(msg => msg.id !== userMessage.id);
      store.setChatHistory(currentHistory);
      
      // Check if it's a limit reached error (status 429)
      if (error.message?.includes('limit reached') || error.message?.includes('429')) {
        return { 
          success: false, 
          error: 'Daily message limit reached', 
          limitReached: true 
        };
      }
      
      return { success: false, error: error.message || 'Failed to send message' };
    }

    const response = result as ChatResponse;
    
    if (!response.success) {
      // Remove the optimistic message on error
      const currentHistory = store.chatHistory.filter(msg => msg.id !== userMessage.id);
      store.setChatHistory(currentHistory);
      
      // Check if response indicates limit reached
      if (response.limitReached) {
        return { 
          success: false, 
          error: 'Daily message limit reached', 
          limitReached: true,
          currentCount: response.currentCount,
          dailyLimit: response.dailyLimit
        };
      }
      
      return { success: false, error: 'Failed to get AI response' };
    }

    // Replace store with all messages from backend (includes both user and AI messages)
    store.setChatHistory(response.all_messages);
    
    return { success: true };

  } catch (error) {
    console.error('Error in sendMessage:', error);
    // Remove the optimistic message on error
    const currentHistory = store.chatHistory.filter(msg => msg.id.startsWith('temp-'));
    if (currentHistory.length !== store.chatHistory.length) {
      store.setChatHistory(store.chatHistory.filter(msg => !msg.id.startsWith('temp-')));
    }
    return { success: false, error: 'Network error occurred' };
  }
};

export const startNewChat = async (): Promise<SendMessageResult> => {
  try {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: 'No active session' };
    }

    // ALWAYS check payment status first - critical blocking check
    const paymentResult = await checkPaymentStatus();
    
    if (!paymentResult.success) {
      console.error('Payment check failed:', paymentResult.error);
      return { success: false, error: 'Unable to verify payment status' };
    }
    
    if (!paymentResult.status?.hasPaid) {
      return { success: false, error: 'Premium subscription required to use chat feature' };
    }

    // Clear local chat history immediately
    const store = useAppStore.getState();
    store.setChatHistory([]);

    // Directly delete the chat session from database
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error clearing chat session:', error);
      return { success: false, error: error.message || 'Failed to clear chat session' };
    }
    
    return { success: true };

  } catch (error) {
    console.error('Error in startNewChat:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const loadChatHistory = async (): Promise<SendMessageResult> => {
  try {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: 'No active session' };
    }

    // ALWAYS check payment status first - critical blocking check
    const paymentResult = await checkPaymentStatus();
    
    if (!paymentResult.success) {
      console.error('Payment check failed:', paymentResult.error);
      return { success: false, error: 'Unable to verify payment status' };
    }
    
    if (!paymentResult.status?.hasPaid) {
      return { success: false, error: 'Premium subscription required to access chat history' };
    }

    // Get existing chat session from database
    const { data: chatSession, error } = await supabase
      .from('chat_sessions')
      .select('messages')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error loading chat history:', error);
      return { success: false, error: 'Failed to load chat history' };
    }

    // Update store with existing messages (or empty array if no history)
    const store = useAppStore.getState();
    const messages = chatSession?.messages || [];
    store.setChatHistory(messages);
    
    return { success: true };

  } catch (error) {
    console.error('Error in loadChatHistory:', error);
    return { success: false, error: 'Network error occurred' };
  }
};