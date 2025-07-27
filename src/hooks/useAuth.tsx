import { useState, useEffect, useContext, createContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { useAppStore } from '../stores/appStore';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const setStoreUser = useAppStore((state) => state.setUser);
  const storeLogout = useAppStore((state) => state.logout);

  const updateUserState = (session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);
    
    // Update the Zustand store with user data
    if (session?.user) {
      setStoreUser({
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.full_name || '',
        dateOfBirth: '',
        gender: 'other'
      });
    } else {
      setStoreUser(null);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateUserState(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        updateUserState(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [setStoreUser]);

  const signOut = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      // Clear local state regardless of Supabase response
      setUser(null);
      setSession(null);
      storeLogout(); // This clears both user and all user data from persistent storage
      
      // Force clear any remaining Supabase session data
      localStorage.removeItem('sb-' + (import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'supabase') + '-auth-token');
      
      return { error };
    } catch (err) {
      // Even if there's an error, clear local state
      setUser(null);
      setSession(null);
      storeLogout();
      return { error: err };
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};