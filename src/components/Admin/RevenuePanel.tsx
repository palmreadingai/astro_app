import React from 'react';
import { Card, CardContent } from '../UI/card';

interface RevenuePanelProps {
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
}

export const RevenuePanel: React.FC<RevenuePanelProps> = ({ revenueMetrics }) => {
  const {
    totalRevenue,
    revenueThisMonth,
    revenueGrowth,
    averageOrderValue,
    paymentSuccessRate,
    couponImpact
  } = revenueMetrics;

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const revenueCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      subtitle: 'All time earnings',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'This Month',
      value: formatCurrency(revenueThisMonth),
      subtitle: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% vs last month`,
      color: revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: revenueGrowth >= 0 ? 'bg-green-50' : 'bg-red-50',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(averageOrderValue),
      subtitle: 'Per successful payment',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Payment Success',
      value: `${paymentSuccessRate.toFixed(1)}%`,
      subtitle: 'Successful payments',
      color: paymentSuccessRate >= 90 ? 'text-green-600' : paymentSuccessRate >= 75 ? 'text-yellow-600' : 'text-red-600',
      bgColor: paymentSuccessRate >= 90 ? 'bg-green-50' : paymentSuccessRate >= 75 ? 'bg-yellow-50' : 'bg-red-50',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Revenue & Business Analytics</h3>
      
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueCards.map((card, index) => (
          <Card key={index} className={`${card.bgColor} border-0`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className={`text-xl font-bold ${card.color} mb-1`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500">
                    {card.subtitle}
                  </p>
                </div>
                <div className={`${card.color} opacity-20`}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth Indicator */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Revenue Growth Trend</h4>
            
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(revenueThisMonth)}
                </div>
                <div className="text-sm text-gray-500">This Month</div>
              </div>
              
              <div className="flex items-center">
                {revenueGrowth >= 0 ? (
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                )}
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Growth</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Growth Status</div>
              <div className={`text-sm font-medium ${
                revenueGrowth >= 10 ? 'text-green-600' : 
                revenueGrowth >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {revenueGrowth >= 10 ? '🚀 Excellent growth' : 
                 revenueGrowth >= 5 ? '📈 Good growth' :
                 revenueGrowth >= 0 ? '📊 Steady growth' : '📉 Needs attention'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Success Analysis */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Payment Performance</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className={`text-lg font-semibold ${
                  paymentSuccessRate >= 90 ? 'text-green-600' : 
                  paymentSuccessRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {paymentSuccessRate.toFixed(1)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    paymentSuccessRate >= 90 ? 'bg-green-500' : 
                    paymentSuccessRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${paymentSuccessRate}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Order</span>
                <span className="text-lg font-semibold text-blue-600">
                  {formatCurrency(averageOrderValue)}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Performance Status</div>
              <div className={`text-sm font-medium ${
                paymentSuccessRate >= 90 ? 'text-green-600' : 
                paymentSuccessRate >= 75 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {paymentSuccessRate >= 90 ? '✅ Excellent' : 
                 paymentSuccessRate >= 75 ? '⚠️ Good' : '🔴 Needs improvement'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupon Impact (if data available) */}
      {(couponImpact.totalDiscountGiven > 0 || couponImpact.ordersWithCoupons > 0) && (
        <Card>
          <CardContent className="p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Coupon Impact Analysis</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {formatCurrency(couponImpact.totalDiscountGiven)}
                </div>
                <div className="text-sm text-gray-500">Total Discounts Given</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {couponImpact.ordersWithCoupons.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Orders with Coupons</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {formatCurrency(couponImpact.averageDiscount)}
                </div>
                <div className="text-sm text-gray-500">Average Discount</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};