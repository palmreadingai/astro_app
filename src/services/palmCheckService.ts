import { useAppStore } from '../stores/appStore';
import { supabase } from '../integrations/supabase/client';
import { PalmAnalysis } from '../types';
import { checkPaymentStatus } from './paymentService';

interface PalmCheckResult {
  status: 'not_started' | 'processing' | 'completed' | 'failed';
  analysis?: PalmAnalysis;
  savedData?: {
    palmImageUrl: string;
    questionnaire_data: Record<string, unknown>;
  };
  processingStartedAt?: string;
}

export const checkPalmAnalysisStatus = async (): Promise<PalmCheckResult> => {
  try {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { status: 'not_started' };
    }

    // Check payment status first
    const paymentResult = await checkPaymentStatus();
    
    if (!paymentResult.success || !paymentResult.status?.hasPaid) {
      return { status: 'not_started' };
    }

    // Call the edge function to check for existing analysis
    const { data: result, error } = await supabase.functions.invoke('check-palm-analysis', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Error checking palm analysis:', error);
      return { status: 'not_started' };
    }

    // Handle the response based on status
    const response: PalmCheckResult = {
      status: result?.status || 'not_started'
    };

    switch (result?.status) {
      case 'completed':
        if (result.analysis) {
          response.analysis = result.analysis;
        }
        break;
        
      case 'failed':
        if (result.savedData) {
          response.savedData = result.savedData;
        }
        break;
        
      case 'processing':
        response.processingStartedAt = result.processingStartedAt;
        break;
        
      default:
        // not_started
        break;
    }
    
    return response;

  } catch (error) {
    console.error('Error in checkPalmAnalysisStatus:', error);
    return { status: 'not_started' };
  }
};