-- Complete setup for PalmAI App
-- This migration sets up everything from scratch

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================
-- ENUMS
-- ==============================================

-- Create enum type for palm reading status
CREATE TYPE palm_reading_status AS ENUM ('not_started', 'processing', 'completed', 'failed');

-- Create enum type for feedback status
CREATE TYPE feedback_status AS ENUM ('pending', 'reviewed', 'resolved');

-- ==============================================
-- TABLES
-- ==============================================

-- Create profiles table (basic user info only)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  has_paid BOOLEAN DEFAULT false,
  payment_verified_at TIMESTAMPTZ,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create astro_profile table (astrology-related user data)
CREATE TABLE IF NOT EXISTS public.astro_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  time_of_birth TIME,
  place_of_birth TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  phone TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  -- Add unique constraint on user_id to prevent duplicate profiles
  CONSTRAINT astro_profile_user_id_unique UNIQUE (user_id)
);

-- Create palm_profile table (palm reading data)
CREATE TABLE IF NOT EXISTS public.palm_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  palm_image_url TEXT, -- URL to the uploaded palm image
  hand_preference TEXT CHECK (hand_preference IN ('left', 'right', 'both')),
  questionnaire_data JSONB DEFAULT '{}', -- Data collected from palm questionnaire
  ai_analysis JSONB DEFAULT '{}', -- AI analysis results
  status palm_reading_status DEFAULT 'not_started' NOT NULL, -- Tracks palm reading progress
  processing_started_at TIMESTAMP WITH TIME ZONE, -- When AI analysis processing began
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create horoscope_profile table (for future use)
CREATE TABLE IF NOT EXISTS public.horoscope_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zodiac_sign TEXT,
  daily_horoscope JSONB DEFAULT '{}',
  weekly_horoscope JSONB DEFAULT '{}',
  monthly_horoscope JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create kundli_profile table (for future use)
CREATE TABLE IF NOT EXISTS public.kundli_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_details JSONB DEFAULT '{}',
  kundli_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create chat_sessions table (for Samadhan chat)
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create orders table to track one-off payment information
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id TEXT UNIQUE NOT NULL,      -- Generic order ID from payment provider
  payment_id TEXT,                    -- Actual payment transaction ID from provider
  amount INTEGER,                     -- Amount charged (in paise for INR)
  currency TEXT DEFAULT 'INR',
  status TEXT,                        -- e.g., 'pending', 'paid', 'failed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_message_limits table for daily message tracking
CREATE TABLE IF NOT EXISTS public.user_message_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER NOT NULL DEFAULT 0,
  daily_limit INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one record per user per date
  UNIQUE(user_id, date)
);

-- Create feedback table for user feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  category TEXT CHECK (category IN ('bug', 'feature', 'improvement', 'general')),
  status feedback_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('discount', 'free')),
  
  -- Discount configuration
  discount_type TEXT CHECK (discount_type IN ('percentage', 'amount') OR type = 'free'),
  discount_value DECIMAL(10,2), -- percentage (0-100) or configurable amount
  currency TEXT CHECK (currency IN ('INR', 'USD') OR discount_type = 'percentage' OR type = 'free'),
  
  -- Usage control
  usage_limit INTEGER NOT NULL DEFAULT 1,
  current_usage INTEGER NOT NULL DEFAULT 0,
  
  -- Validity control
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create coupon usage tracking table
CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  
  -- Financial tracking
  discount_applied DECIMAL(10,2),
  original_amount INTEGER, -- in paise/cents
  final_amount INTEGER,    -- in paise/cents
  currency TEXT,
  
  -- Metadata
  used_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create admin_users table for managing admin access
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);


-- ==============================================
-- INDEXES
-- ==============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- PalmAI profile indexes
CREATE INDEX IF NOT EXISTS idx_astro_profile_user_id ON public.astro_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_astro_profile_created_at ON public.astro_profile(created_at DESC);

-- Palm profile indexes
CREATE INDEX IF NOT EXISTS idx_palm_profile_user_id ON public.palm_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_palm_profile_created_at ON public.palm_profile(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_palm_profile_status ON public.palm_profile(user_id, status);

-- Horoscope profile indexes
CREATE INDEX IF NOT EXISTS idx_horoscope_profile_user_id ON public.horoscope_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_horoscope_profile_created_at ON public.horoscope_profile(created_at DESC);

-- Kundli profile indexes
CREATE INDEX IF NOT EXISTS idx_kundli_profile_user_id ON public.kundli_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_kundli_profile_created_at ON public.kundli_profile(created_at DESC);

-- Chat sessions indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON public.chat_sessions(updated_at DESC);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- User message limits indexes
CREATE INDEX IF NOT EXISTS idx_user_message_limits_user_date ON public.user_message_limits(user_id, date);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON public.feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- Coupon indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active, valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupons_usage ON public.coupons(current_usage, usage_limit);
CREATE INDEX IF NOT EXISTS idx_coupons_type ON public.coupons(type);
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON public.coupons(created_at DESC);

-- Coupon usage indexes
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user ON public.coupon_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon ON public.coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_date ON public.coupon_usages(used_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_order ON public.coupon_usages(order_id);

-- Admin users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON public.admin_users(is_active) WHERE is_active = true;

-- ==============================================
-- ROW LEVEL SECURITY
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astro_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palm_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horoscope_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kundli_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_message_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- RLS POLICIES
-- ==============================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- PalmAI profile policies
CREATE POLICY "Users can view their own astro profile" ON public.astro_profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own astro profile" ON public.astro_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own astro profile" ON public.astro_profile
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own astro profile" ON public.astro_profile
  FOR DELETE USING (auth.uid() = user_id);

-- Palm profile policies
CREATE POLICY "Users can view their own palm profile" ON public.palm_profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own palm profile" ON public.palm_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own palm profile" ON public.palm_profile
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own palm profile" ON public.palm_profile
  FOR DELETE USING (auth.uid() = user_id);

-- Horoscope profile policies
CREATE POLICY "Users can view their own horoscope profile" ON public.horoscope_profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own horoscope profile" ON public.horoscope_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own horoscope profile" ON public.horoscope_profile
  FOR UPDATE USING (auth.uid() = user_id);

-- Kundli profile policies
CREATE POLICY "Users can view their own kundli profile" ON public.kundli_profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kundli profile" ON public.kundli_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kundli profile" ON public.kundli_profile
  FOR UPDATE USING (auth.uid() = user_id);

-- Chat sessions policies
CREATE POLICY "Users can view their own chat sessions" ON public.chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" ON public.chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" ON public.chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "select_own_orders" ON public.orders
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "insert_order" ON public.orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "update_order" ON public.orders
  FOR UPDATE
  USING (true);

-- User message limits policies
CREATE POLICY "Users can view their own message limits" ON public.user_message_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own message limits" ON public.user_message_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message limits" ON public.user_message_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Feedback policies
CREATE POLICY "Users can view their own feedback" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" ON public.feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- Coupon policies (read-only for authenticated users)
CREATE POLICY "Users can view active coupons" ON public.coupons
  FOR SELECT TO authenticated
  USING (is_active = true AND NOW() BETWEEN valid_from AND COALESCE(valid_until, 'infinity'));

-- Admin policies for coupon management (service role only)
CREATE POLICY "Service role can manage coupons" ON public.coupons
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Coupon usage policies
CREATE POLICY "Users can view their own usage" ON public.coupon_usages
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage records" ON public.coupon_usages
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Admin users policies
CREATE POLICY "Admin users managed by service role only" ON public.admin_users
  FOR ALL TO service_role;

-- ==============================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at triggers
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_astro_profile_updated_at
  BEFORE UPDATE ON public.astro_profile
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_palm_profile_updated_at
  BEFORE UPDATE ON public.palm_profile
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_horoscope_profile_updated_at
  BEFORE UPDATE ON public.horoscope_profile
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_kundli_profile_updated_at
  BEFORE UPDATE ON public.kundli_profile
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create updated_at trigger for user_message_limits
CREATE OR REPLACE FUNCTION update_user_message_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_message_limits_updated_at
  BEFORE UPDATE ON public.user_message_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_user_message_limits_updated_at();

CREATE TRIGGER handle_feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for updated_at on coupons
CREATE TRIGGER handle_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to atomically increment coupon usage
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  limit_count INTEGER;
BEGIN
  -- Get current usage and limit in a single query
  SELECT current_usage, usage_limit 
  INTO current_count, limit_count
  FROM public.coupons 
  WHERE id = coupon_id 
  FOR UPDATE;
  
  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if limit would be exceeded
  IF current_count >= limit_count THEN
    RETURN FALSE;
  END IF;
  
  -- Increment usage
  UPDATE public.coupons 
  SET current_usage = current_usage + 1,
      updated_at = NOW()
  WHERE id = coupon_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate coupon
CREATE OR REPLACE FUNCTION public.validate_coupon_code(
  p_code TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
  coupon_id UUID,
  code TEXT,
  type TEXT,
  discount_type TEXT,
  discount_value DECIMAL,
  currency TEXT,
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  coupon_record RECORD;
BEGIN
  -- Get coupon details
  SELECT c.* INTO coupon_record
  FROM public.coupons c
  WHERE c.code = p_code;
  
  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      NULL::UUID, p_code, NULL::TEXT, NULL::TEXT, NULL::DECIMAL, NULL::TEXT,
      FALSE, 'Coupon code not found';
    RETURN;
  END IF;
  
  -- Check if coupon is active
  IF NOT coupon_record.is_active THEN
    RETURN QUERY SELECT 
      coupon_record.id, coupon_record.code, coupon_record.type, 
      coupon_record.discount_type, coupon_record.discount_value, coupon_record.currency,
      FALSE, 'Coupon is not active';
    RETURN;
  END IF;
  
  -- Check validity dates
  IF NOW() < coupon_record.valid_from THEN
    RETURN QUERY SELECT 
      coupon_record.id, coupon_record.code, coupon_record.type, 
      coupon_record.discount_type, coupon_record.discount_value, coupon_record.currency,
      FALSE, 'Coupon is not yet valid';
    RETURN;
  END IF;
  
  IF coupon_record.valid_until IS NOT NULL AND NOW() > coupon_record.valid_until THEN
    RETURN QUERY SELECT 
      coupon_record.id, coupon_record.code, coupon_record.type, 
      coupon_record.discount_type, coupon_record.discount_value, coupon_record.currency,
      FALSE, 'Coupon has expired';
    RETURN;
  END IF;
  
  -- Check usage limit
  IF coupon_record.current_usage >= coupon_record.usage_limit THEN
    RETURN QUERY SELECT 
      coupon_record.id, coupon_record.code, coupon_record.type, 
      coupon_record.discount_type, coupon_record.discount_value, coupon_record.currency,
      FALSE, 'Coupon usage limit reached';
    RETURN;
  END IF;
  
  -- Coupon is valid
  RETURN QUERY SELECT 
    coupon_record.id, coupon_record.code, coupon_record.type, 
    coupon_record.discount_type, coupon_record.discount_value, coupon_record.currency,
    TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- STORAGE SETUP
-- ==============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('palm-images', 'palm-images', true, 52428800, '{"image/*"}')
ON CONFLICT (id) DO NOTHING;

-- Storage policies for palm images
CREATE POLICY "Allow authenticated users to upload palm images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'palm-images');

CREATE POLICY "Allow public viewing of palm images" ON storage.objects
  FOR SELECT TO authenticated, anon
  USING (bucket_id = 'palm-images');

CREATE POLICY "Allow users to update their palm images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'palm-images');

CREATE POLICY "Allow users to delete their palm images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'palm-images');

-- ==============================================
-- PERMISSIONS
-- ==============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Grant specific permissions for new tables
GRANT ALL ON public.user_message_limits TO authenticated;
GRANT ALL ON public.feedback TO authenticated;
GRANT ALL ON public.coupons TO authenticated, service_role;
GRANT ALL ON public.coupon_usages TO authenticated, service_role;
GRANT ALL ON public.admin_users TO service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_coupon_code(TEXT, UUID) TO authenticated, service_role;

-- Grant storage permissions
GRANT ALL ON storage.objects TO anon, authenticated;
GRANT ALL ON storage.buckets TO anon, authenticated;

-- ==============================================
-- VIEWS (FOR EASIER QUERYING)
-- ==============================================

-- View for user statistics
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
  p.id,
  p.full_name,
  p.created_at as user_since,
  COUNT(DISTINCT pp.id) as total_palm_profiles,
  COUNT(DISTINCT hp.id) as total_horoscope_profiles,
  COUNT(DISTINCT kp.id) as total_kundli_profiles,
  COUNT(DISTINCT cs.id) as total_chat_sessions,
  MAX(pp.created_at) as last_palm_profile,
  MAX(hp.created_at) as last_horoscope_profile,
  MAX(cs.updated_at) as last_chat_activity
FROM public.profiles p
LEFT JOIN public.palm_profile pp ON p.id = pp.user_id
LEFT JOIN public.horoscope_profile hp ON p.id = hp.user_id
LEFT JOIN public.kundli_profile kp ON p.id = kp.user_id
LEFT JOIN public.chat_sessions cs ON p.id = cs.user_id
GROUP BY p.id, p.full_name, p.created_at;

-- Grant access to the view
GRANT SELECT ON public.user_stats TO authenticated;

-- Enable RLS on the view
ALTER VIEW public.user_stats OWNER TO postgres;

-- ==============================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================

-- Enable realtime for tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.palm_profile;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback;

-- ==============================================
-- DOCUMENTATION COMMENTS
-- ==============================================

-- Add comments for palm reading status tracking
COMMENT ON COLUMN public.palm_profile.status IS 'Tracks the current status of palm reading analysis: not_started, processing, completed, failed';
COMMENT ON COLUMN public.palm_profile.processing_started_at IS 'Timestamp when AI analysis processing began, used for timeout handling';
COMMENT ON TYPE palm_reading_status IS 'Enum for tracking palm reading analysis progress through different states';

-- Add comments for other tables
COMMENT ON CONSTRAINT astro_profile_user_id_unique ON public.astro_profile IS 'Ensures each user can only have one astro profile record';
COMMENT ON TABLE public.feedback IS 'Stores user feedback about the application';
COMMENT ON COLUMN public.feedback.rating IS 'User rating from 1-5 stars';
COMMENT ON COLUMN public.feedback.category IS 'Feedback category: bug, feature, improvement, or general';
COMMENT ON COLUMN public.feedback.status IS 'Admin tracking status: pending, reviewed, or resolved';

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

-- Add sample coupons for testing
INSERT INTO public.coupons (code, type, discount_type, discount_value, currency, usage_limit, description, is_active) VALUES
  ('WELCOME50', 'discount', 'percentage', 50.00, 'INR', 100, '50% discount for new users', true),
  ('SAVE10', 'discount', 'amount', 10.00, 'INR', 50, '₹10 off for Indian users', true),
  ('SAVE2USD', 'discount', 'amount', 2.00, 'USD', 50, '$2 off for international users', true),
  ('FREEACCESS', 'free', NULL, NULL, NULL, 10, 'Free premium access', true),
  ('EXPIRED', 'discount', 'percentage', 25.00, 'INR', 100, 'Expired coupon for testing', true)
ON CONFLICT (code) DO NOTHING;

-- Set expiry for test expired coupon
UPDATE public.coupons 
SET valid_until = NOW() - INTERVAL '1 day'
WHERE code = 'EXPIRED';

DO $$
BEGIN
  RAISE NOTICE 'PalmAI App database setup completed successfully!';
  RAISE NOTICE 'Tables created: profiles, astro_profile, palm_profile, horoscope_profile, kundli_profile, chat_sessions, orders, user_message_limits, feedback, coupons, coupon_usages, admin_users';
  RAISE NOTICE 'Enums created: palm_reading_status, feedback_status';
  RAISE NOTICE 'Storage bucket created: palm-images (50MB limit)';
  RAISE NOTICE 'All RLS policies and triggers are in place';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '  - Palm reading status tracking (not_started, processing, completed, failed)';
  RAISE NOTICE '  - Daily message limits for chat functionality';
  RAISE NOTICE '  - User feedback system with ratings and categories';
  RAISE NOTICE '  - Coupon system with discount and free access support';
  RAISE NOTICE '  - Admin users management';
  RAISE NOTICE '  - Fixed astro_profile constraints (unique user_id, updated gender options)';
  RAISE NOTICE 'Functions created: increment_coupon_usage, validate_coupon_code';
  RAISE NOTICE 'Sample coupons added for testing';
END $$;
