import React from 'react';
import { Card, CardContent } from '../UI/card';

interface SystemHealthPanelProps {
  systemHealth: {
    palmReadingFailures: number;
    usersAtMessageLimit: number;
    storageUsage: {
      palmImages: number;
      totalStorage: number;
    };
  };
  serviceUsage: {
    palmReadings: {
      total: number;
      successRate: number;
    };
  };
}

export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({
  systemHealth,
  serviceUsage
}) => {
  const {
    palmReadingFailures,
    usersAtMessageLimit,
    storageUsage
  } = systemHealth;

  const { palmReadings } = serviceUsage;

  const healthMetrics = [
    {
      title: 'Palm Reading Health',
      value: `${palmReadings.successRate.toFixed(1)}%`,
      subtitle: `${palmReadingFailures} failures`,
      status: palmReadings.successRate >= 95 ? 'excellent' : 
              palmReadings.successRate >= 90 ? 'good' : 
              palmReadings.successRate >= 80 ? 'warning' : 'critical',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      title: 'Message System',
      value: usersAtMessageLimit === 0 ? 'Healthy' : `${usersAtMessageLimit} Limited`,
      subtitle: usersAtMessageLimit === 0 ? 'No users at limit' : 'Users at daily limit',
      status: usersAtMessageLimit === 0 ? 'excellent' : 
              usersAtMessageLimit <= 5 ? 'good' : 
              usersAtMessageLimit <= 20 ? 'warning' : 'critical',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      title: 'Storage Usage',
      value: storageUsage.palmImages > 0 ? 
        `${(storageUsage.palmImages / 1024 / 1024).toFixed(1)}MB` : 
        'N/A',
      subtitle: 'Palm images storage',
      status: storageUsage.palmImages < 1024 * 1024 * 100 ? 'excellent' : // < 100MB
              storageUsage.palmImages < 1024 * 1024 * 500 ? 'good' : // < 500MB
              storageUsage.palmImages < 1024 * 1024 * 1000 ? 'warning' : 'critical', // < 1GB
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      )
    },
    {
      title: 'Overall Status',
      value: getOverallStatus(palmReadings.successRate, usersAtMessageLimit),
      subtitle: 'System performance',
      status: getOverallHealthStatus(palmReadings.successRate, usersAtMessageLimit),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  function getOverallStatus(successRate: number, limitedUsers: number): string {
    if (successRate >= 95 && limitedUsers === 0) return 'Excellent';
    if (successRate >= 90 && limitedUsers <= 5) return 'Good';
    if (successRate >= 80 && limitedUsers <= 20) return 'Fair';
    return 'Needs Attention';
  }

  function getOverallHealthStatus(successRate: number, limitedUsers: number): 'excellent' | 'good' | 'warning' | 'critical' {
    if (successRate >= 95 && limitedUsers === 0) return 'excellent';
    if (successRate >= 90 && limitedUsers <= 5) return 'good';
    if (successRate >= 80 && limitedUsers <= 20) return 'warning';
    return 'critical';
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return {
          text: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200'
        };
      case 'good':
        return {
          text: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200'
        };
      case 'warning':
        return {
          text: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200'
        };
      case 'critical':
        return {
          text: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200'
        };
      default:
        return {
          text: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200'
        };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return '🟢';
      case 'good':
        return '🔵';
      case 'warning':
        return '🟡';
      case 'critical':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">System Health Monitoring</h3>
      
      {/* Health Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthMetrics.map((metric, index) => {
          const colors = getStatusColor(metric.status);
          return (
            <Card key={index} className={`${colors.bg} ${colors.border} border`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm">{getStatusIcon(metric.status)}</span>
                      <p className="text-sm font-medium text-gray-600">
                        {metric.title}
                      </p>
                    </div>
                    <p className={`text-xl font-bold ${colors.text} mb-1`}>
                      {metric.value}
                    </p>
                    <p className="text-xs text-gray-500">
                      {metric.subtitle}
                    </p>
                  </div>
                  <div className={`${colors.text} opacity-20`}>
                    {metric.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detailed Health Status */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Detailed Status</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    palmReadings.successRate >= 95 ? 'bg-green-500' :
                    palmReadings.successRate >= 90 ? 'bg-blue-500' :
                    palmReadings.successRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">Palm Reading Service</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {palmReadings.successRate.toFixed(1)}% Success
                  </div>
                  <div className="text-xs text-gray-500">
                    {palmReadingFailures} failures total
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    usersAtMessageLimit === 0 ? 'bg-green-500' :
                    usersAtMessageLimit <= 5 ? 'bg-blue-500' :
                    usersAtMessageLimit <= 20 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">Message Limits</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {usersAtMessageLimit} Users
                  </div>
                  <div className="text-xs text-gray-500">
                    At daily limit
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">Storage Health</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {storageUsage.palmImages > 0 ? 
                      `${(storageUsage.palmImages / 1024 / 1024).toFixed(1)}MB` : 
                      'No data'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Palm images
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">System Alerts</h4>
            
            <div className="space-y-3">
              {palmReadings.successRate < 90 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <h5 className="font-medium text-red-800">Low Palm Reading Success Rate</h5>
                    <p className="text-sm text-red-700">
                      Success rate is {palmReadings.successRate.toFixed(1)}%. Investigate API issues or processing failures.
                    </p>
                  </div>
                </div>
              )}

              {usersAtMessageLimit > 10 && (
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <h5 className="font-medium text-yellow-800">High Message Limit Usage</h5>
                    <p className="text-sm text-yellow-700">
                      {usersAtMessageLimit} users have reached their daily limit. Consider increasing limits or monitoring usage patterns.
                    </p>
                  </div>
                </div>
              )}

              {palmReadings.successRate >= 95 && usersAtMessageLimit <= 5 && (
                <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h5 className="font-medium text-green-800">All Systems Operational</h5>
                    <p className="text-sm text-green-700">
                      System is running smoothly with high success rates and minimal issues.
                    </p>
                  </div>
                </div>
              )}

              {/* If no alerts, show status */}
              {palmReadings.successRate >= 90 && usersAtMessageLimit <= 10 && !(palmReadings.successRate >= 95 && usersAtMessageLimit <= 5) && (
                <div className="text-center text-gray-500 py-4">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">No critical alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="flex-1">
              <h5 className="font-medium text-blue-800 mb-1">Quick Actions</h5>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Monitor system health regularly</p>
                <p>• Check logs for palm reading failures</p>
                <p>• Review user message patterns for limit optimization</p>
                <p>• Set up automated alerts for critical thresholds</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};