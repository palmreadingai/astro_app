import React from 'react';
import { Card, CardContent } from '../UI/card';

interface FeedbackPanelProps {
  feedbackMetrics: {
    totalFeedback: number;
    averageRating: number;
    ratingDistribution: Array<{ rating: number; count: number }>;
    categoryBreakdown: Array<{ category: string; count: number }>;
    pendingFeedback: number;
  };
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedbackMetrics }) => {
  const {
    totalFeedback,
    averageRating,
    ratingDistribution,
    categoryBreakdown,
    pendingFeedback
  } = feedbackMetrics;

  const maxRatingCount = Math.max(...ratingDistribution.map(r => r.count), 1);
  const maxCategoryCount = Math.max(...categoryBreakdown.map(c => c.count), 1);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug':
        return '🐛';
      case 'feature':
        return '💡';
      case 'improvement':
        return '⚡';
      case 'general':
        return '💬';
      default:
        return '📝';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug':
        return 'text-red-600';
      case 'feature':
        return 'text-blue-600';
      case 'improvement':
        return 'text-green-600';
      case 'general':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderStars = (rating: number, filled: boolean = false) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${
          filled && index < rating
            ? 'text-yellow-400 fill-current'
            : index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
        fill={filled && index < rating ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">User Feedback & Satisfaction</h3>
        {pendingFeedback > 0 && (
          <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-red-600">
              {pendingFeedback} pending review
            </span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Satisfaction */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Overall Satisfaction</h4>
            
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-yellow-500 mb-2">
                {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
              </div>
              <div className="flex justify-center mb-2">
                {averageRating > 0 && renderStars(Math.round(averageRating), true)}
              </div>
              <div className="text-sm text-gray-500">
                Based on {totalFeedback.toLocaleString()} reviews
              </div>
            </div>

            <div className="space-y-3">
              {ratingDistribution.slice().reverse().map((rating) => (
                <div key={rating.rating} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 w-6">
                    {rating.rating}★
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${totalFeedback ? (rating.count / totalFeedback * 100) : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">
                    {rating.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Satisfaction Level</div>
              <div className={`text-sm font-medium ${
                averageRating >= 4.5 ? 'text-green-600' :
                averageRating >= 4.0 ? 'text-blue-600' :
                averageRating >= 3.5 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {averageRating >= 4.5 ? '🎉 Excellent' :
                 averageRating >= 4.0 ? '😊 Very Good' :
                 averageRating >= 3.5 ? '🙂 Good' :
                 averageRating >= 3.0 ? '😐 Fair' : '😟 Needs Improvement'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Categories */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Feedback Categories</h4>
            
            <div className="space-y-4">
              {categoryBreakdown.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getCategoryIcon(category.category)}</span>
                      <span className="text-sm text-gray-600 capitalize">
                        {category.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-semibold ${getCategoryColor(category.category)}`}>
                        {category.count}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({totalFeedback ? (category.count / totalFeedback * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        category.category === 'bug' ? 'bg-red-400' :
                        category.category === 'feature' ? 'bg-blue-400' :
                        category.category === 'improvement' ? 'bg-green-400' : 'bg-purple-400'
                      }`}
                      style={{
                        width: `${maxCategoryCount ? (category.count / maxCategoryCount * 100) : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {totalFeedback === 0 && (
              <div className="text-center text-gray-500 py-6">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No feedback received yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feedback Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {totalFeedback.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Feedback</div>
          </CardContent>
        </Card>

        <Card className={`border-0 ${pendingFeedback > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold mb-1 ${
              pendingFeedback > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {pendingFeedback}
            </div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      {(pendingFeedback > 0 || averageRating < 3.5) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <h5 className="font-medium text-orange-800 mb-1">Action Items</h5>
                <ul className="text-sm text-orange-700 space-y-1">
                  {pendingFeedback > 0 && (
                    <li>• Review and respond to {pendingFeedback} pending feedback items</li>
                  )}
                  {averageRating < 3.5 && averageRating > 0 && (
                    <li>• Average rating is below 3.5 - consider addressing common user concerns</li>
                  )}
                  {categoryBreakdown.find(c => c.category === 'bug')?.count && (
                    <li>• {categoryBreakdown.find(c => c.category === 'bug')?.count} bug reports need attention</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};