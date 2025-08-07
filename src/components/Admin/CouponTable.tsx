import React, { useState } from 'react';
import { Card, CardContent } from '../UI/card';
import { Button } from '../UI/button';
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

interface CouponTableProps {
  coupons: Coupon[];
  onRefresh: () => void;
  onEdit: (coupon: Coupon) => void;
  isRefreshing?: boolean;
}

export const CouponTable: React.FC<CouponTableProps> = ({ coupons, onRefresh, onEdit, isRefreshing = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'discount' | 'free'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || coupon.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && coupon.is_active) ||
      (filterStatus === 'inactive' && !coupon.is_active);

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/manage-coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'toggle-status',
          id: coupon.id,
          is_active: !coupon.is_active
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onRefresh();
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      alert('Failed to update coupon status. Please try again.');
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(couponId);
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/manage-coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'delete',
          id: couponId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onRefresh();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Failed to delete coupon. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.type === 'free') return 'FREE';
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    }
    return `${coupon.currency} ${coupon.discount_value}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Coupon Management</h2>
        <Button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          {isRefreshing ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              Refreshing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by code or description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="discount">Discount</option>
                <option value="free">Free</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredCoupons.length} of {coupons.length} coupons
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredCoupons.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons found</h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters or search term.'
                  : 'Create your first coupon to get started.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valid Until
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {coupon.code}
                          </div>
                          {coupon.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {coupon.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          coupon.type === 'free' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {formatDiscount(coupon)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.current_usage} / {coupon.usage_limit}
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                          <div
                            className={`h-1 rounded-full ${
                              coupon.current_usage >= coupon.usage_limit
                                ? 'bg-red-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (coupon.current_usage / coupon.usage_limit) * 100)}%`
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          coupon.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {coupon.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {coupon.valid_until ? (
                          <div className="flex flex-col">
                            <span>{formatDate(coupon.valid_until)}</span>
                            <span className={`text-xs ${
                              new Date(coupon.valid_until) < new Date() 
                                ? 'text-red-500' 
                                : 'text-green-500'
                            }`}>
                              {new Date(coupon.valid_until) < new Date() ? 'Expired' : 'Valid'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No expiry</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(coupon.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(coupon)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(coupon)}
                        >
                          {coupon.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(coupon.id)}
                          disabled={isDeleting === coupon.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          {isDeleting === coupon.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};