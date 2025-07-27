import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../integrations/supabase/client';

interface PaymentStatus {
  hasPaid: boolean;
  paymentDate?: string;
}

interface PaymentContextType {
  hasPaid: boolean;
  paymentDate?: string;
  isLoading: boolean;
  error: string | null;
  refreshPaymentStatus: () => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ hasPaid: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [hasInitialCheck, setHasInitialCheck] = useState(false);

  // Cache duration: 5 minutes if paid, 30 seconds if not paid
  const getCacheDuration = (hasPaid: boolean) => hasPaid ? 5 * 60 * 1000 : 30 * 1000;

  const checkPaymentStatus = useCallback(async (forceRefresh = false): Promise<void> => {
    if (!user) {
      setPaymentStatus({ hasPaid: false });
      setHasInitialCheck(true);
      return;
    }

    const now = Date.now();
    const cacheDuration = getCacheDuration(paymentStatus.hasPaid);
    
    // Use cache if not forcing refresh and within cache duration
    if (!forceRefresh && hasInitialCheck && (now - lastCheck) < cacheDuration) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setPaymentStatus({ hasPaid: false });
        setHasInitialCheck(true);
        return;
      }

      const { data: result, error: apiError } = await supabase.functions.invoke('check-payment-status', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (apiError) {
        throw new Error(apiError.message || 'Failed to check payment status');
      }

      const newStatus: PaymentStatus = {
        hasPaid: result.hasPaid || false,
        paymentDate: result.paymentDate || undefined
      };

      setPaymentStatus(newStatus);
      setLastCheck(now);
      setHasInitialCheck(true);

    } catch (err) {
      console.error('Error checking payment status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check payment status');
      
      // Don't clear payment status on error if user was previously paid
      if (!paymentStatus.hasPaid) {
        setPaymentStatus({ hasPaid: false });
      }
      setHasInitialCheck(true);
    } finally {
      setIsLoading(false);
    }
  }, [user, paymentStatus.hasPaid, lastCheck, hasInitialCheck]);

  const refreshPaymentStatus = useCallback(async (): Promise<void> => {
    await checkPaymentStatus(true);
  }, [checkPaymentStatus]);

  // Initial payment status check when user changes
  useEffect(() => {
    if (user) {
      checkPaymentStatus();
    } else {
      setPaymentStatus({ hasPaid: false });
      setHasInitialCheck(true);
      setLastCheck(0);
    }
  }, [user, checkPaymentStatus]);

  // Periodic refresh for unpaid users
  useEffect(() => {
    if (!paymentStatus.hasPaid && hasInitialCheck && user) {
      const interval = setInterval(() => {
        checkPaymentStatus();
      }, 30000); // Check every 30 seconds for unpaid users

      return () => clearInterval(interval);
    }
  }, [paymentStatus.hasPaid, hasInitialCheck, user, checkPaymentStatus]);

  const value: PaymentContextType = {
    hasPaid: paymentStatus.hasPaid,
    paymentDate: paymentStatus.paymentDate,
    isLoading,
    error,
    refreshPaymentStatus,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};