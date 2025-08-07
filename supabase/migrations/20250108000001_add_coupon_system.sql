-- Add Coupon System to PalmAI App
-- This migration adds coupon functionality with discount and free access support

-- ==============================================
-- CREATE COUPON TABLES
-- ==============================================

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

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

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

-- ==============================================
-- ROW LEVEL SECURITY
-- ==============================================

-- Enable RLS on coupon tables
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- RLS POLICIES
-- ==============================================

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

-- ==============================================
-- TRIGGERS
-- ==============================================

-- Create trigger for updated_at on coupons
CREATE TRIGGER handle_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================
-- FUNCTIONS
-- ==============================================

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
-- PERMISSIONS
-- ==============================================

-- Grant necessary permissions
GRANT ALL ON public.coupons TO authenticated, service_role;
GRANT ALL ON public.coupon_usages TO authenticated, service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_coupon_code(TEXT, UUID) TO authenticated, service_role;

-- ==============================================
-- SAMPLE DATA (FOR TESTING)
-- ==============================================

-- Insert some sample coupons for testing
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

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

DO $$
BEGIN
  RAISE NOTICE 'Coupon system migration completed successfully!';
  RAISE NOTICE 'Tables created: coupons, coupon_usages';
  RAISE NOTICE 'Functions created: increment_coupon_usage, validate_coupon_code';
  RAISE NOTICE 'Sample coupons added for testing';
  RAISE NOTICE 'All RLS policies and triggers are in place';
END $$;