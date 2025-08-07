import React from 'react';
import { Card, CardContent } from '../UI/card';
import { Button } from '../UI/button';

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

interface CouponStatsProps {
  analytics: CouponAnalytics | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const CouponStats: React.FC<CouponStatsProps> = ({ analytics, onRefresh, isRefreshing = false }) => {
  if (!analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Coupons',
      value: analytics.totalCoupons,
      description: `${analytics.activeCoupons} active, ${analytics.inactiveCoupons} inactive`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Coupon Types',
      value: `${analytics.discountCoupons}+${analytics.freeCoupons}`,
      description: `${analytics.discountCoupons} discount, ${analytics.freeCoupons} free`,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Usage Stats',
      value: analytics.totalUsage,
      description: `Out of ${analytics.totalCapacity} capacity`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Utilization Rate',
      value: `${analytics.utilizationRate}%`,
      description: 'Overall usage efficiency',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Analytics Overview</h2>
        <Button 
          variant="outline" 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
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
              Refresh Data
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className={`${stat.bgColor} border-0`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className={`text-3xl font-bold ${stat.color} mb-2`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stat.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {analytics.totalCoupons === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons yet</h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first coupon to see analytics here.
            </p>
          </CardContent>
        </Card>
      )}

      {analytics.totalCoupons > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Coupons</span>
                  <span className="font-semibold text-green-600">
                    {analytics.activeCoupons}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Usage</span>
                  <span className="font-semibold">
                    {analytics.totalUsage}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Available Capacity</span>
                  <span className="font-semibold">
                    {analytics.totalCapacity - analytics.totalUsage}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Utilization Rate</span>
                    <span>{analytics.utilizationRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, parseFloat(analytics.utilizationRate))}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.discountCoupons}
                    </div>
                    <div className="text-xs text-gray-500">Discount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.freeCoupons}
                    </div>
                    <div className="text-xs text-gray-500">Free</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};