import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../UI/card';
import { Button } from '../UI/button';
import { CouponStats } from './CouponStats';
import { CouponTable } from './CouponTable';
import { CouponForm } from './CouponForm';
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

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'coupons' | 'create'>('overview');
  const [analytics, setAnalytics] = useState<CouponAnalytics | null>(null);
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
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/manage-coupons?action=analytics`, {
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
      console.log('📊 Analytics response:', data);
      
      setAnalytics(data.analytics);
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
        <CouponStats 
          analytics={analytics} 
          onRefresh={() => loadAnalytics(true)}
          isRefreshing={isRefreshingAnalytics}
        />
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