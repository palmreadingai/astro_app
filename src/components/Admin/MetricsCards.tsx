import React from 'react';
import { Card, CardContent } from '../UI/card';
import { Button } from '../UI/button';

interface MetricsCardsProps {
  userMetrics: {
    totalUsers: number;
    newUsersThisMonth: number;
  };
  revenueMetrics: {
    revenueThisMonth: number;
    revenueGrowth: number;
  };
  serviceUsage: {
    palmReadings: { total: number };
    chatSessions: { total: number };
    profiles: { astroProfiles: number; horoscopeProfiles: number; kundliProfiles: number };
  };
  feedbackMetrics: {
    averageRating: number;
  };
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  userMetrics,
  revenueMetrics,
  serviceUsage,
  feedbackMetrics,
  onRefresh,
  isRefreshing
}) => {
  const totalActiveServices = 
    serviceUsage.palmReadings.total + 
    serviceUsage.chatSessions.total + 
    serviceUsage.profiles.astroProfiles + 
    serviceUsage.profiles.horoscopeProfiles + 
    serviceUsage.profiles.kundliProfiles;

  const metricsCards = [
    {
      title: 'Total Users',
      value: userMetrics.totalUsers.toLocaleString(),
      change: `+${userMetrics.newUsersThisMonth} this month`,
      changeType: userMetrics.newUsersThisMonth > 0 ? 'positive' : 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Revenue This Month',
      value: `₹${revenueMetrics.revenueThisMonth.toLocaleString()}`,
      change: `${revenueMetrics.revenueGrowth >= 0 ? '+' : ''}${revenueMetrics.revenueGrowth.toFixed(1)}% vs last month`,
      changeType: revenueMetrics.revenueGrowth >= 0 ? 'positive' : 'negative',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Active Services',
      value: totalActiveServices.toLocaleString(),
      change: `Palm readings, chats, profiles`,
      changeType: 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Customer Satisfaction',
      value: feedbackMetrics.averageRating ? `${feedbackMetrics.averageRating.toFixed(1)}/5` : 'N/A',
      change: `Average user rating`,
      changeType: 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsCards.map((metric, index) => (
          <Card key={index} className={`${metric.bgColor} border-0`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {metric.title}
                  </p>
                  <p className={`text-3xl font-bold ${metric.color} mb-2`}>
                    {metric.value}
                  </p>
                  <p className={`text-xs ${
                    metric.changeType === 'positive' ? 'text-green-600' : 
                    metric.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {metric.change}
                  </p>
                </div>
                <div className={`${metric.color} opacity-20`}>
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};