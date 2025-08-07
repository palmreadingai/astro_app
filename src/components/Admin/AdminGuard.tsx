import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { supabase } from '../../integrations/supabase/client';
import LoadingSpinner from '../UI/LoadingSpinner';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const user = useAppStore((state) => state.user);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Checking admin status for:', user.email);
        
        // Check admin status via backend API
        const session = await supabase.auth.getSession();
        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/manage-coupons?action=check-admin`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.data.session?.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('📊 Admin check response:', { data });

        if (!data?.isAdmin) {
          console.log('❌ User is not an admin:', user.email);
          setIsAdmin(false);
        } else {
          console.log('✅ Admin access granted for:', user.email);
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('❌ Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;