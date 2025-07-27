import { AlertCircle, ArrowLeft, CreditCard, Mail } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';

export default function PaymentFailure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAppStore((state) => state.user);

  // Get error details from URL params if available
  const errorCode = searchParams.get('error');
  const errorMessage = searchParams.get('message');

  const handleRetryPayment = () => {
    navigate('/pricing');
  };

  const handleGoToHome = () => {
    navigate('/home');
  };

  const handleContactSupport = () => {
    // You can replace this with your actual support email or contact form
    window.location.href = 'mailto:support@palmai.com?subject=Payment Issue&body=I encountered a payment issue. Please help.';
  };

  const getErrorTitle = () => {
    switch (errorCode) {
      case 'card_declined':
        return 'Card Declined';
      case 'insufficient_funds':
        return 'Insufficient Funds';
      case 'expired_card':
        return 'Card Expired';
      case 'incorrect_cvc':
        return 'Invalid CVC';
      case 'processing_error':
        return 'Processing Error';
      default:
        return 'Payment Failed';
    }
  };

  const getErrorDescription = () => {
    if (errorMessage) return errorMessage;
    
    switch (errorCode) {
      case 'card_declined':
        return 'Your card was declined. Please try a different payment method or contact your bank.';
      case 'insufficient_funds':
        return 'Your card has insufficient funds. Please use a different card or add funds to your account.';
      case 'expired_card':
        return 'Your card has expired. Please use a different card or update your payment method.';
      case 'incorrect_cvc':
        return 'The CVC code you entered is incorrect. Please try again with the correct code.';
      case 'processing_error':
        return 'There was an error processing your payment. Please try again.';
      default:
        return 'We encountered an issue processing your payment. Please try again or contact support if the problem persists.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-lg w-full">
          {/* Failure Card */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-purple-400/30 rounded-3xl p-8 shadow-2xl text-center">
            {/* Error Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Main Message */}
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {getErrorTitle()}
            </h1>
            <p className="text-purple-200 text-lg mb-8">
              {getErrorDescription()}
            </p>

            {/* Error Details */}
            {(errorCode || errorMessage) && (
              <div className="bg-purple-500/20 border border-purple-400/30 rounded-2xl p-4 mb-8">
                <div className="text-purple-200 text-sm">
                  <p className="font-semibold mb-2">Error Details:</p>
                  {errorCode && <p>Code: {errorCode}</p>}
                  {errorMessage && <p>Message: {errorMessage}</p>}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4 mb-8">
              {/* Retry Payment Button */}
              <button
                onClick={handleRetryPayment}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Try Again
              </button>

              {/* Go to Home Button */}
              <button
                onClick={handleGoToHome}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go to Home
              </button>

              {/* Contact Support Button */}
              <button
                onClick={handleContactSupport}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact Support
              </button>
            </div>


            {/* Help Text */}
            <div className="text-purple-200 text-sm space-y-2">
              <p className="font-semibold">Common solutions:</p>
              <ul className="text-left space-y-1">
                <li>• Check your card details and try again</li>
                <li>• Ensure your card has sufficient funds</li>
                <li>• Try a different payment method</li>
                <li>• Contact your bank if the issue persists</li>
              </ul>
            </div>
          </div>

          {/* Additional Help */}
          <div className="text-center mt-8">
            <p className="text-purple-200 text-lg mb-2">
              Need help with your payment?
            </p>
            <p className="text-purple-300 text-sm">
              Our support team is here to assist you with any payment issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}