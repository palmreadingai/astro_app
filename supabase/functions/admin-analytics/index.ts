import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AdminAnalytics {
  userMetrics: {
    totalUsers: number;
    newUsersThisMonth: number;
    paidUsers: number;
    freeUsers: number;
    activeUsersThisWeek: number;
    userGrowthData: Array<{ date: string; users: number }>;
  };
  serviceUsage: {
    palmReadings: {
      total: number;
      completed: number;
      processing: number;
      failed: number;
      successRate: number;
    };
    chatSessions: {
      total: number;
      averageMessagesPerSession: number;
      activeSessionsThisWeek: number;
    };
    profiles: {
      astroProfiles: number;
      horoscopeProfiles: number;
      kundliProfiles: number;
    };
    messageUsage: {
      totalMessages: number;
      averageDailyUsage: number;
      usersHittingLimits: number;
    };
  };
  revenueMetrics: {
    totalRevenue: number;
    revenueThisMonth: number;
    revenueGrowth: number;
    averageOrderValue: number;
    paymentSuccessRate: number;
    couponImpact: {
      totalDiscountGiven: number;
      ordersWithCoupons: number;
      averageDiscount: number;
    };
  };
  feedbackMetrics: {
    totalFeedback: number;
    averageRating: number;
    ratingDistribution: Array<{ rating: number; count: number }>;
    categoryBreakdown: Array<{ category: string; count: number }>;
    pendingFeedback: number;
  };
  systemHealth: {
    palmReadingFailures: number;
    usersAtMessageLimit: number;
    storageUsage: {
      palmImages: number;
      totalStorage: number;
    };
  };
}

// Validate admin privileges using database admin_users table
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

  // Check if user email exists in admin_users table
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('id, email, is_active')
    .eq('email', user.email)
    .eq('is_active', true)
    .single();

  if (adminError || !adminUser) {
    console.log('User not found in admin_users table:', user.email);
    return { valid: false, user };
  }

  console.log('Admin user validated:', adminUser.email);
  return { valid: true, user };
}

serve(async (req) => {
  console.log('📊 Admin analytics function called', req.method, req.url);
  
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

    if (req.method === 'GET') {
      return await getComprehensiveAnalytics();
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Error in admin analytics:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function getComprehensiveAnalytics(): Promise<Response> {
  console.log('📈 Gathering comprehensive analytics...');
  
  try {
    const [
      userMetrics,
      serviceUsage,
      revenueMetrics,
      feedbackMetrics,
      systemHealth
    ] = await Promise.all([
      getUserMetrics(),
      getServiceUsage(),
      getRevenueMetrics(),
      getFeedbackMetrics(),
      getSystemHealth()
    ]);

    const analytics: AdminAnalytics = {
      userMetrics,
      serviceUsage,
      revenueMetrics,
      feedbackMetrics,
      systemHealth
    };

    console.log('✅ Analytics compiled successfully');
    return new Response(JSON.stringify({ analytics }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error compiling analytics:', error);
    return new Response(JSON.stringify({ error: 'Failed to compile analytics' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function getUserMetrics() {
  console.log('👥 Getting user metrics...');
  
  // Total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // New users this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const { count: newUsersThisMonth } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString());

  // Paid vs Free users
  const { count: paidUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('has_paid', true);

  const freeUsers = (totalUsers || 0) - (paidUsers || 0);

  // Active users this week (users with recent activity)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { count: activeUsersThisWeek } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('updated_at', oneWeekAgo.toISOString());

  // User growth data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: userGrowthRaw } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at');

  // Group by date for growth chart
  const userGrowthData = [];
  const growthMap = new Map();
  
  userGrowthRaw?.forEach(profile => {
    const date = new Date(profile.created_at).toISOString().split('T')[0];
    growthMap.set(date, (growthMap.get(date) || 0) + 1);
  });

  for (const [date, users] of growthMap.entries()) {
    userGrowthData.push({ date, users });
  }

  return {
    totalUsers: totalUsers || 0,
    newUsersThisMonth: newUsersThisMonth || 0,
    paidUsers: paidUsers || 0,
    freeUsers,
    activeUsersThisWeek: activeUsersThisWeek || 0,
    userGrowthData: userGrowthData.sort((a, b) => a.date.localeCompare(b.date))
  };
}

async function getServiceUsage() {
  console.log('🔮 Getting service usage metrics...');
  
  // Palm readings
  const { count: totalPalmReadings } = await supabase
    .from('palm_profile')
    .select('*', { count: 'exact', head: true });

  const { count: completedPalmReadings } = await supabase
    .from('palm_profile')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  const { count: processingPalmReadings } = await supabase
    .from('palm_profile')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'processing');

  const { count: failedPalmReadings } = await supabase
    .from('palm_profile')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed');

  const successRate = totalPalmReadings ? 
    ((completedPalmReadings || 0) / totalPalmReadings * 100) : 0;

  // Chat sessions
  const { count: totalChatSessions } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true });

  const { data: chatSessionsData } = await supabase
    .from('chat_sessions')
    .select('messages');

  const totalMessages = chatSessionsData?.reduce((sum, session) => {
    let messages;
    try {
      // Handle both JSON string and object cases
      if (typeof session.messages === 'string') {
        messages = JSON.parse(session.messages || '[]');
      } else if (Array.isArray(session.messages)) {
        messages = session.messages;
      } else {
        messages = [];
      }
    } catch (error) {
      console.warn('Error parsing messages for session:', error);
      messages = [];
    }
    return sum + messages.length;
  }, 0) || 0;

  const averageMessagesPerSession = totalChatSessions ? 
    (totalMessages / totalChatSessions) : 0;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { count: activeSessionsThisWeek } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true })
    .gte('updated_at', oneWeekAgo.toISOString());

  // Profile counts
  const { count: astroProfiles } = await supabase
    .from('astro_profile')
    .select('*', { count: 'exact', head: true });

  const { count: horoscopeProfiles } = await supabase
    .from('horoscope_profile')
    .select('*', { count: 'exact', head: true });

  const { count: kundliProfiles } = await supabase
    .from('kundli_profile')
    .select('*', { count: 'exact', head: true });

  // Message usage
  const { data: messageLimitsData } = await supabase
    .from('user_message_limits')
    .select('message_count, daily_limit');

  const totalMessageUsage = messageLimitsData?.reduce((sum, limit) => 
    sum + limit.message_count, 0) || 0;

  const averageDailyUsage = messageLimitsData?.length ? 
    (totalMessageUsage / messageLimitsData.length) : 0;

  const usersHittingLimits = messageLimitsData?.filter(limit => 
    limit.message_count >= limit.daily_limit).length || 0;

  return {
    palmReadings: {
      total: totalPalmReadings || 0,
      completed: completedPalmReadings || 0,
      processing: processingPalmReadings || 0,
      failed: failedPalmReadings || 0,
      successRate: Math.round(successRate * 100) / 100
    },
    chatSessions: {
      total: totalChatSessions || 0,
      averageMessagesPerSession: Math.round(averageMessagesPerSession * 100) / 100,
      activeSessionsThisWeek: activeSessionsThisWeek || 0
    },
    profiles: {
      astroProfiles: astroProfiles || 0,
      horoscopeProfiles: horoscopeProfiles || 0,
      kundliProfiles: kundliProfiles || 0
    },
    messageUsage: {
      totalMessages: totalMessageUsage,
      averageDailyUsage: Math.round(averageDailyUsage * 100) / 100,
      usersHittingLimits
    }
  };
}

async function getRevenueMetrics() {
  console.log('💰 Getting revenue metrics...');
  
  // Total revenue from paid orders
  const { data: allOrders } = await supabase
    .from('orders')
    .select('amount, currency, status, created_at')
    .eq('status', 'paid');

  const totalRevenue = allOrders?.reduce((sum, order) => 
    sum + (order.amount || 0), 0) || 0;

  // Revenue this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyOrders } = await supabase
    .from('orders')
    .select('amount')
    .eq('status', 'paid')
    .gte('created_at', startOfMonth.toISOString());

  const revenueThisMonth = monthlyOrders?.reduce((sum, order) => 
    sum + (order.amount || 0), 0) || 0;

  // Revenue growth (this month vs last month)
  const startOfLastMonth = new Date();
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
  startOfLastMonth.setDate(1);
  startOfLastMonth.setHours(0, 0, 0, 0);

  const endOfLastMonth = new Date();
  endOfLastMonth.setDate(0);
  endOfLastMonth.setHours(23, 59, 59, 999);

  const { data: lastMonthOrders } = await supabase
    .from('orders')
    .select('amount')
    .eq('status', 'paid')
    .gte('created_at', startOfLastMonth.toISOString())
    .lte('created_at', endOfLastMonth.toISOString());

  const revenueLastMonth = lastMonthOrders?.reduce((sum, order) => 
    sum + (order.amount || 0), 0) || 0;

  const revenueGrowth = revenueLastMonth ? 
    ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100) : 0;

  // Average order value
  const averageOrderValue = allOrders?.length ? 
    (totalRevenue / allOrders.length) : 0;

  // Payment success rate
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  const paymentSuccessRate = totalOrders ? 
    ((allOrders?.length || 0) / totalOrders * 100) : 0;

  // Coupon impact (from coupon_usages table if it exists)
  // For now, we'll return placeholder data
  const couponImpact = {
    totalDiscountGiven: 0,
    ordersWithCoupons: 0,
    averageDiscount: 0
  };

  return {
    totalRevenue: Math.round(totalRevenue / 100), // Convert paise to rupees
    revenueThisMonth: Math.round(revenueThisMonth / 100),
    revenueGrowth: Math.round(revenueGrowth * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue / 100),
    paymentSuccessRate: Math.round(paymentSuccessRate * 100) / 100,
    couponImpact
  };
}

async function getFeedbackMetrics() {
  console.log('📝 Getting feedback metrics...');
  
  const { count: totalFeedback } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true });

  const { data: allFeedback } = await supabase
    .from('feedback')
    .select('rating, category, status');

  // Average rating
  const ratingsSum = allFeedback?.reduce((sum, feedback) => 
    sum + (feedback.rating || 0), 0) || 0;
  const averageRating = totalFeedback ? (ratingsSum / totalFeedback) : 0;

  // Rating distribution
  const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: allFeedback?.filter(f => f.rating === rating).length || 0
  }));

  // Category breakdown
  const categories = ['bug', 'feature', 'improvement', 'general'];
  const categoryBreakdown = categories.map(category => ({
    category,
    count: allFeedback?.filter(f => f.category === category).length || 0
  }));

  // Pending feedback
  const pendingFeedback = allFeedback?.filter(f => f.status === 'pending').length || 0;

  return {
    totalFeedback: totalFeedback || 0,
    averageRating: Math.round(averageRating * 100) / 100,
    ratingDistribution: ratingCounts,
    categoryBreakdown,
    pendingFeedback
  };
}

async function getSystemHealth() {
  console.log('🏥 Getting system health metrics...');
  
  // Palm reading failures
  const { count: palmReadingFailures } = await supabase
    .from('palm_profile')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed');

  // Users at message limit
  const { data: messageLimits } = await supabase
    .from('user_message_limits')
    .select('message_count, daily_limit')
    .eq('date', new Date().toISOString().split('T')[0]);

  const usersAtMessageLimit = messageLimits?.filter(limit => 
    limit.message_count >= limit.daily_limit).length || 0;

  // Storage usage (placeholder - would need actual storage API calls)
  const storageUsage = {
    palmImages: 0, // This would require storage API calls
    totalStorage: 0
  };

  return {
    palmReadingFailures: palmReadingFailures || 0,
    usersAtMessageLimit,
    storageUsage
  };
}