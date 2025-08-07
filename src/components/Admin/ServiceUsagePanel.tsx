import React from 'react';
import { Card, CardContent } from '../UI/card';

interface ServiceUsagePanelProps {
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
}

export const ServiceUsagePanel: React.FC<ServiceUsagePanelProps> = ({ serviceUsage }) => {
  const { palmReadings, chatSessions, profiles, messageUsage } = serviceUsage;

  const palmStatusData = [
    { 
      label: 'Completed', 
      count: palmReadings.completed, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100' 
    },
    { 
      label: 'Processing', 
      count: palmReadings.processing, 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100' 
    },
    { 
      label: 'Failed', 
      count: palmReadings.failed, 
      color: 'text-red-600', 
      bgColor: 'bg-red-100' 
    }
  ];

  const profileData = [
    { 
      label: 'Astro Profiles', 
      count: profiles.astroProfiles, 
      icon: '🔮',
      color: 'text-purple-600' 
    },
    { 
      label: 'Horoscope Profiles', 
      count: profiles.horoscopeProfiles, 
      icon: '⭐',
      color: 'text-blue-600' 
    },
    { 
      label: 'Kundli Profiles', 
      count: profiles.kundliProfiles, 
      icon: '📊',
      color: 'text-indigo-600' 
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Service Usage Analytics</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Palm Reading Pipeline */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-900">Palm Reading Pipeline</h4>
              <div className="text-sm text-gray-500">
                {palmReadings.successRate.toFixed(1)}% success rate
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {palmReadings.total.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total palm readings</div>
            </div>

            <div className="space-y-3">
              {palmStatusData.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${status.bgColor}`}></div>
                    <span className="text-sm text-gray-600">{status.label}</span>
                  </div>
                  <span className={`text-sm font-semibold ${status.color}`}>
                    {status.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Visual progress bar */}
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div className="flex h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500"
                  style={{ width: `${palmReadings.total ? (palmReadings.completed / palmReadings.total * 100) : 0}%` }}
                ></div>
                <div 
                  className="bg-yellow-500"
                  style={{ width: `${palmReadings.total ? (palmReadings.processing / palmReadings.total * 100) : 0}%` }}
                ></div>
                <div 
                  className="bg-red-500"
                  style={{ width: `${palmReadings.total ? (palmReadings.failed / palmReadings.total * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Sessions */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Chat Activity</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Sessions</span>
                <span className="text-lg font-semibold text-blue-600">
                  {chatSessions.total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Messages/Session</span>
                <span className="text-lg font-semibold text-green-600">
                  {chatSessions.averageMessagesPerSession.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active This Week</span>
                <span className="text-lg font-semibold text-purple-600">
                  {chatSessions.activeSessionsThisWeek.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Weekly Engagement</div>
              <div className="text-sm font-medium text-gray-900">
                {chatSessions.total ? 
                  `${(chatSessions.activeSessionsThisWeek / chatSessions.total * 100).toFixed(1)}%` : 
                  '0%'} of sessions active
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Types */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">User Profiles</h4>
            
            <div className="space-y-4">
              {profileData.map((profile, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{profile.icon}</span>
                    <span className="text-sm text-gray-600">{profile.label}</span>
                  </div>
                  <span className={`text-lg font-semibold ${profile.color}`}>
                    {profile.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Total Profile Engagement</div>
              <div className="text-sm font-medium text-gray-900">
                {(profiles.astroProfiles + profiles.horoscopeProfiles + profiles.kundliProfiles).toLocaleString()} profiles created
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Usage */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Message Usage</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Messages</span>
                <span className="text-lg font-semibold text-blue-600">
                  {messageUsage.totalMessages.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Daily Usage</span>
                <span className="text-lg font-semibold text-green-600">
                  {messageUsage.averageDailyUsage.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Users at Limit</span>
                <span className={`text-lg font-semibold ${
                  messageUsage.usersHittingLimits > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {messageUsage.usersHittingLimits}
                </span>
              </div>
            </div>

            {messageUsage.usersHittingLimits > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-xs text-red-600">
                    {messageUsage.usersHittingLimits} users have reached their daily message limit
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};