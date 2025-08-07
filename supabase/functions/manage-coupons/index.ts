import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CouponCreateRequest {
  code: string;
  type: 'discount' | 'free';
  discount_type?: 'percentage' | 'amount';
  discount_value?: number;
  currency?: 'INR' | 'USD';
  usage_limit: number;
  valid_from?: string;
  valid_until?: string;
  description?: string;
}

interface CouponUpdateRequest {
  id: string;
  is_active?: boolean;
  usage_limit?: number;
  valid_until?: string;
  description?: string;
}

interface CouponListQuery {
  page?: number;
  limit?: number;
  type?: 'discount' | 'free';
  is_active?: boolean;
  search?: string;
}

interface CouponUsageStats {
  coupon_id: string;
  code: string;
  total_usage: number;
  usage_limit: number;
  usage_percentage: number;
  revenue_impact: number;
  currency: string;
}

// Validate admin privileges (basic check - in real app you'd have proper role management)
async function validateAdminAccess(authHeader: string): Promise<{ valid: boolean; user?: any }> {
  if (!authHeader) {
    return { valid: false };
  }

  const { data: { user }, error } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (error || !user) {
    return { valid: false };
  }

  // For now, we'll use a simple email-based check
  // In production, you should implement proper role-based access control
  const adminEmails = Deno.env.get('ADMIN_EMAILS')?.split(',') || [];
  const isAdmin = adminEmails.includes(user.email || '');

  return { valid: isAdmin, user };
}

serve(async (req) => {
  console.log('🛠️ Manage coupons function called', req.method, req.url);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔑 Checking admin authorization...');
    const authHeader = req.headers.get('Authorization');
    const { valid: isAdmin, user } = await validateAdminAccess(authHeader || '');
    
    if (!isAdmin) {
      console.error('❌ Unauthorized access attempt');
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('✅ Admin authenticated:', user.email);

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';

    // Handle different actions
    switch (req.method) {
      case 'GET':
        return await handleGetRequests(action, url.searchParams);
      case 'POST':
        return await handleCreateCoupon(req, user.id);
      case 'PUT':
        return await handleUpdateCoupon(req, user.id);
      case 'DELETE':
        return await handleDeleteCoupon(url.searchParams);
      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('❌ Error in manage coupons:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleGetRequests(action: string, params: URLSearchParams) {
  console.log('📋 Handling GET request, action:', action);

  switch (action) {
    case 'list':
      return await listCoupons(params);
    case 'stats':
      return await getCouponStats(params);
    case 'usage':
      return await getCouponUsageDetails(params);
    case 'analytics':
      return await getCouponAnalytics(params);
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }
}

async function listCoupons(params: URLSearchParams) {
  console.log('📄 Listing coupons...');
  
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '20');
  const type = params.get('type');
  const isActive = params.get('is_active');
  const search = params.get('search');
  
  let query = supabase
    .from('coupons')
    .select(`
      id, code, type, discount_type, discount_value, currency,
      usage_limit, current_usage, valid_from, valid_until, is_active,
      description, created_at, updated_at
    `);

  // Apply filters
  if (type) {
    query = query.eq('type', type);
  }
  if (isActive !== null) {
    query = query.eq('is_active', isActive === 'true');
  }
  if (search) {
    query = query.or(`code.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  query = query.range(from, to).order('created_at', { ascending: false });

  const { data: coupons, error, count } = await query;

  if (error) {
    console.error('❌ Error listing coupons:', error);
    return new Response(JSON.stringify({ error: 'Failed to list coupons' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log(`✅ Listed ${coupons?.length || 0} coupons`);
  return new Response(JSON.stringify({
    coupons,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getCouponStats(params: URLSearchParams) {
  console.log('📊 Getting coupon statistics...');
  
  const couponId = params.get('coupon_id');
  
  let query = `
    SELECT 
      c.id, c.code, c.type, c.usage_limit, c.current_usage,
      COALESCE(usage_stats.total_used, 0) as verified_usage,
      COALESCE(usage_stats.total_discount, 0) as total_discount_given,
      COALESCE(usage_stats.avg_discount, 0) as avg_discount_per_use
    FROM coupons c
    LEFT JOIN (
      SELECT 
        coupon_id,
        COUNT(*) as total_used,
        SUM(discount_applied) as total_discount,
        AVG(discount_applied) as avg_discount
      FROM coupon_usages
      GROUP BY coupon_id
    ) usage_stats ON c.id = usage_stats.coupon_id
  `;
  
  const queryParams: any[] = [];
  if (couponId) {
    query += ' WHERE c.id = $1';
    queryParams.push(couponId);
  }

  const { data: stats, error } = await supabase.rpc('exec_sql', {
    sql: query,
    params: queryParams
  }) as any;

  if (error) {
    console.error('❌ Error getting coupon stats:', error);
    return new Response(JSON.stringify({ error: 'Failed to get statistics' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log('✅ Got coupon statistics');
  return new Response(JSON.stringify({ stats }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getCouponUsageDetails(params: URLSearchParams) {
  console.log('📈 Getting coupon usage details...');
  
  const couponId = params.get('coupon_id');
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '20');
  
  if (!couponId) {
    return new Response(JSON.stringify({ error: 'coupon_id is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: usages, error, count } = await supabase
    .from('coupon_usages')
    .select(`
      id, user_id, discount_applied, original_amount, final_amount,
      currency, used_at, ip_address,
      profiles!coupon_usages_user_id_fkey(full_name)
    `)
    .eq('coupon_id', couponId)
    .range(from, to)
    .order('used_at', { ascending: false });

  if (error) {
    console.error('❌ Error getting usage details:', error);
    return new Response(JSON.stringify({ error: 'Failed to get usage details' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log(`✅ Got ${usages?.length || 0} usage records`);
  return new Response(JSON.stringify({
    usages,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getCouponAnalytics(params: URLSearchParams) {
  console.log('📈 Getting coupon analytics...');
  
  // Get overall analytics
  const { data: analytics, error } = await supabase
    .from('coupons')
    .select(`
      type,
      is_active,
      current_usage,
      usage_limit
    `);

  if (error) {
    console.error('❌ Error getting analytics:', error);
    return new Response(JSON.stringify({ error: 'Failed to get analytics' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Calculate summary statistics
  const totalCoupons = analytics?.length || 0;
  const activeCoupons = analytics?.filter(c => c.is_active).length || 0;
  const discountCoupons = analytics?.filter(c => c.type === 'discount').length || 0;
  const freeCoupons = analytics?.filter(c => c.type === 'free').length || 0;
  const totalUsage = analytics?.reduce((sum, c) => sum + (c.current_usage || 0), 0) || 0;
  const totalCapacity = analytics?.reduce((sum, c) => sum + (c.usage_limit || 0), 0) || 0;

  const summary = {
    totalCoupons,
    activeCoupons,
    inactiveCoupons: totalCoupons - activeCoupons,
    discountCoupons,
    freeCoupons,
    totalUsage,
    totalCapacity,
    utilizationRate: totalCapacity > 0 ? ((totalUsage / totalCapacity) * 100).toFixed(2) : '0'
  };

  console.log('✅ Got coupon analytics');
  return new Response(JSON.stringify({ analytics: summary }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleCreateCoupon(req: Request, adminUserId: string) {
  console.log('➕ Creating new coupon...');
  
  let requestBody: CouponCreateRequest;
  try {
    const bodyText = await req.text();
    requestBody = JSON.parse(bodyText);
    console.log('📥 Create request:', requestBody);
  } catch (error) {
    console.error('❌ Invalid request body:', error);
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Validate required fields
  const { code, type, usage_limit } = requestBody;
  if (!code || !type || !usage_limit) {
    return new Response(JSON.stringify({ 
      error: 'Missing required fields: code, type, usage_limit' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Validate discount coupon fields
  if (type === 'discount') {
    const { discount_type, discount_value } = requestBody;
    if (!discount_type || discount_value === undefined) {
      return new Response(JSON.stringify({ 
        error: 'Discount coupons require discount_type and discount_value' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (discount_type === 'amount' && !requestBody.currency) {
      return new Response(JSON.stringify({ 
        error: 'Amount-based discounts require currency' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Create coupon
  const couponData = {
    code: code.toUpperCase().trim(),
    type,
    discount_type: requestBody.discount_type || null,
    discount_value: requestBody.discount_value || null,
    currency: requestBody.currency || null,
    usage_limit,
    valid_from: requestBody.valid_from || null,
    valid_until: requestBody.valid_until || null,
    description: requestBody.description || null,
    created_by: adminUserId,
    is_active: true
  };

  const { data: newCoupon, error } = await supabase
    .from('coupons')
    .insert(couponData)
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating coupon:', error);
    if (error.code === '23505') { // Unique violation
      return new Response(JSON.stringify({ error: 'Coupon code already exists' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ error: 'Failed to create coupon' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log('✅ Coupon created:', newCoupon.code);
  return new Response(JSON.stringify({ coupon: newCoupon }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleUpdateCoupon(req: Request, adminUserId: string) {
  console.log('📝 Updating coupon...');
  
  let requestBody: CouponUpdateRequest;
  try {
    const bodyText = await req.text();
    requestBody = JSON.parse(bodyText);
    console.log('📥 Update request:', requestBody);
  } catch (error) {
    console.error('❌ Invalid request body:', error);
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { id, ...updateData } = requestBody;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Coupon ID is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { data: updatedCoupon, error } = await supabase
    .from('coupons')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('❌ Error updating coupon:', error);
    return new Response(JSON.stringify({ error: 'Failed to update coupon' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (!updatedCoupon) {
    return new Response(JSON.stringify({ error: 'Coupon not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log('✅ Coupon updated:', updatedCoupon.code);
  return new Response(JSON.stringify({ coupon: updatedCoupon }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleDeleteCoupon(params: URLSearchParams) {
  console.log('🗑️ Deleting coupon...');
  
  const id = params.get('id');
  if (!id) {
    return new Response(JSON.stringify({ error: 'Coupon ID is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('❌ Error deleting coupon:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete coupon' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log('✅ Coupon deleted');
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}