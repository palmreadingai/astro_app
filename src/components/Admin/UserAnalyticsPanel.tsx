import React from 'react';
import { Card, CardContent } from '../UI/card';

interface UserAnalyticsPanelProps {
  userMetrics: {
    totalUsers: number;
    newUsersThisMonth: number;
    paidUsers: number;
    freeUsers: number;
    activeUsersThisWeek: number;
    userGrowthData: Array<{ date: string; users: number }>;
  };
}

export const UserAnalyticsPanel: React.FC<UserAnalyticsPanelProps> = ({ userMetrics }) => {
  const userTypeData = [
    { 
      label: 'Paid Users', 
      count: userMetrics.paidUsers, 
      percentage: userMetrics.totalUsers ? (userMetrics.paidUsers / userMetrics.totalUsers * 100).toFixed(1) : '0',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      label: 'Free Users', 
      count: userMetrics.freeUsers, 
      percentage: userMetrics.totalUsers ? (userMetrics.freeUsers / userMetrics.totalUsers * 100).toFixed(1) : '0',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ];

  // Calculate max for simple bar chart
  const maxGrowthValue = Math.max(...userMetrics.userGrowthData.map(d => d.users), 1);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">User Analytics</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Types Breakdown */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">User Types</h4>
            <div className="space-y-4">
              {userTypeData.map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${type.bgColor}`}></div>
                    <span className="text-sm text-gray-600">{type.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${type.color}`}>
                      {type.count}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({type.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Visual representation */}
            <div className="mt-4 space-y-2">
              {userTypeData.map((type, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 w-16">{type.label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${type.bgColor.replace('bg-', 'bg-').replace('-100', '-500')}`}
                      style={{ width: `${type.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-8">{type.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Activity Summary */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">User Activity</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="text-lg font-semibold text-blue-600">
                  {userMetrics.totalUsers.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New This Month</span>
                <span className="text-lg font-semibold text-green-600">
                  {userMetrics.newUsersThisMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active This Week</span>
                <span className="text-lg font-semibold text-purple-600">
                  {userMetrics.activeUsersThisWeek.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Activity Rate */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Weekly Activity Rate</div>
              <div className="text-sm font-medium text-gray-900">
                {userMetrics.totalUsers ? 
                  `${(userMetrics.activeUsersThisWeek / userMetrics.totalUsers * 100).toFixed(1)}%` : 
                  '0%'} of total users
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">User Growth (Last 30 Days)</h4>
          
          {userMetrics.userGrowthData.length > 0 ? (
            <div className="space-y-2">
              {/* Simple bar chart */}
              <div className="flex items-end space-x-1 h-32">
                {userMetrics.userGrowthData.slice(-15).map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="bg-blue-500 w-full rounded-t transition-all duration-300 hover:bg-blue-600"
                      style={{
                        height: `${(data.users / maxGrowthValue) * 100}%`,
                        minHeight: data.users > 0 ? '4px' : '0px'
                      }}
                      title={`${data.date}: ${data.users} users`}
                    ></div>
                  </div>
                ))}
              </div>
              
              {/* Date labels */}
              <div className="flex space-x-1 text-xs text-gray-400 mt-2">
                {userMetrics.userGrowthData.slice(-15).map((data, index) => (
                  <div key={index} className="flex-1 text-center">
                    {index % 3 === 0 ? new Date(data.date).getDate() : ''}
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Total new users in this period: {userMetrics.userGrowthData.reduce((sum, d) => sum + d.users, 0)}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>No growth data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};