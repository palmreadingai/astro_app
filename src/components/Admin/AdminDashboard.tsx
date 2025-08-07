import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../UI/card';
import { Button } from '../UI/button';
import { CouponStats } from './CouponStats';
import { CouponTable } from './CouponTable';
import { CouponForm } from './CouponForm';
import { MetricsCards } from './MetricsCards';
import { UserAnalyticsPanel } from './UserAnalyticsPanel';
import { ServiceUsagePanel } from './ServiceUsagePanel';
import { RevenuePanel } from './RevenuePanel';
import { FeedbackPanel } from './FeedbackPanel';
import { SystemHealthPanel } from './SystemHealthPanel';
import { supabase } from '../../integrations/supabase/client';

interface Coupon {
  id: string;
  code: string;
  type: 'discount' | 'free';
  discount_type?: 'percentage' | 'amount';
  discount_value?: number;
  currency?: string;
  usage_limit: number;
  current_usage: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface CouponAnalytics {
  totalCoupons: number;
  activeCoupons: number;
  inactiveCoupons: number;
  discountCoupons: number;
  freeCoupons: number;
  totalUsage: number;
  totalCapacity: number;
  utilizationRate: string;
}

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

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'coupons' | 'create'>('overview');
  const [analytics, setAnalytics] = useState<CouponAnalytics | null>(null);
  const [adminAnalytics, setAdminAnalytics] = useState<AdminAnalytics | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingAnalytics, setIsRefreshingAnalytics] = useState(false);
  const [isRefreshingCoupons, setIsRefreshingCoupons] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadAnalytics(),
        loadCoupons()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async (showLoading = false) => {
    if (showLoading) setIsRefreshingAnalytics(true);
    
    try {
      console.log('📊 Loading analytics...');
      const session = await supabase.auth.getSession();
      
      // Load both coupon analytics and comprehensive admin analytics
      const [couponResponse, adminResponse] = await Promise.all([
        fetch(`${supabase.supabaseUrl}/functions/v1/manage-coupons?action=analytics`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.data.session?.access_token}`,
          },
        }),
        fetch(`${supabase.supabaseUrl}/functions/v1/admin-analytics`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.data.session?.access_token}`,
          },
        })
      ]);

      if (!couponResponse.ok) {
        throw new Error(`Coupon analytics error! status: ${couponResponse.status}`);
      }
      
      if (!adminResponse.ok) {
        throw new Error(`Admin analytics error! status: ${adminResponse.status}`);
      }

      const couponData = await couponResponse.json();
      const adminData = await adminResponse.json();
      
      console.log('📊 Coupon analytics response:', couponData);
      console.log('📊 Admin analytics response:', adminData);
      
      setAnalytics(couponData.analytics);
      setAdminAnalytics(adminData.analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set default analytics if API fails
      setAnalytics({
        totalCoupons: 0,
        activeCoupons: 0,
        inactiveCoupons: 0,
        discountCoupons: 0,
        freeCoupons: 0,
        totalUsage: 0,
        totalCapacity: 0,
        utilizationRate: '0'
      });
      setAdminAnalytics(null);
    } finally {
      if (showLoading) setIsRefreshingAnalytics(false);
    }
  };

  const loadCoupons = async (showLoading = false) => {
    if (showLoading) setIsRefreshingCoupons(true);
    
    try {
      console.log('📄 Loading coupons...');
      const session = await supabase.auth.getSession();
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/manage-coupons?action=list&limit=50`, {
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
      console.log('📄 Coupons response:', data);
      
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
      setCoupons([]);
    } finally {
      if (showLoading) setIsRefreshingCoupons(false);
    }
  };

  const handleCouponCreated = () => {
    loadData();
    setActiveTab('coupons');
    setEditingCoupon(null);
  };

  const handleCouponUpdated = () => {
    loadData();
    setEditingCoupon(null);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setActiveTab('create');
  };

  const handleCancelEdit = () => {
    setEditingCoupon(null);
    setActiveTab('coupons');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'coupons', label: 'Coupons' },
            { key: 'create', label: editingCoupon ? 'Edit Coupon' : 'Create Coupon' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {adminAnalytics ? (
            <>
              <MetricsCards 
                userMetrics={adminAnalytics.userMetrics}
                revenueMetrics={adminAnalytics.revenueMetrics}
                serviceUsage={adminAnalytics.serviceUsage}
                feedbackMetrics={adminAnalytics.feedbackMetrics}
                onRefresh={() => loadAnalytics(true)}
                isRefreshing={isRefreshingAnalytics}
              />
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <UserAnalyticsPanel userMetrics={adminAnalytics.userMetrics} />
                <ServiceUsagePanel serviceUsage={adminAnalytics.serviceUsage} />
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <RevenuePanel revenueMetrics={adminAnalytics.revenueMetrics} />
                <FeedbackPanel feedbackMetrics={adminAnalytics.feedbackMetrics} />
              </div>
              
              <SystemHealthPanel 
                systemHealth={adminAnalytics.systemHealth}
                serviceUsage={adminAnalytics.serviceUsage}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'coupons' && (
        <CouponTable 
          coupons={coupons} 
          onRefresh={() => loadCoupons(true)}
          onEdit={handleEditCoupon}
          isRefreshing={isRefreshingCoupons}
        />
      )}

      {activeTab === 'create' && (
        <CouponForm 
          coupon={editingCoupon}
          onSave={editingCoupon ? handleCouponUpdated : handleCouponCreated}
          onCancel={editingCoupon ? handleCancelEdit : undefined}
        />
      )}
    </div>
  );
};

export default AdminDashboard;