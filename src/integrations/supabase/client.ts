import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Replace with your actual Supabase URL and anon key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});