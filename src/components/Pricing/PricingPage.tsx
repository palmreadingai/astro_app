import { Crown, Check, Star, Sparkles, ChevronDown, ChevronUp, Loader2, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { processPayment } from '../../services/paymentService';
import { usePayment } from '../../context/PaymentContext';
import Footer from '../Layout/Footer';

export default function PricingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAppStore((state) => state.user);
  const { hasPaid, isLoading: isCheckingPayment, error: paymentError } = usePayment();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIndia, setIsIndia] = useState(true);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // Detect user's country/currency
  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Location detection timeout')), 3000);
        });

        // Race between fetch and timeout
        const fetchPromise = fetch('https://ipapi.co/json/').then(res => res.json());
        const data = await Promise.race([fetchPromise, timeoutPromise]);
        
        setIsIndia(data.country_code === 'IN');
      } catch {
        // Default to India if detection fails or times out
        setIsIndia(true);
      } finally {
        setIsLocationLoading(false);
      }
    };
    detectCountry();
  }, []);

  // Handle legacy success redirects
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      navigate('/payment-success');
    }
  }, [navigate, searchParams]);

  const handleGetStarted = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (hasPaid) {
      navigate('/home');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await processPayment();
      
      if (result.success) {
        // Payment successful, navigate to success page
        navigate('/payment-success');
      } else {
        setError(result.error || 'Payment failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isCheckingPayment) return 'Checking...';
    if (!user) return 'Sign In to Continue';
    if (hasPaid) return 'Go to Dashboard';
    if (isLoading) return 'Processing...';
    return 'Get Started Now';
  };

  const getButtonIcon = () => {
    if (isCheckingPayment || isLoading) {
      return <Loader2 className="w-5 h-5 animate-spin mr-2" />;
    }
    return null;
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "What's included in the premium package?",
      answer: (
        <span>
          You get lifetime access to all features including complete palm reading analysis, lifetime access to Samadhan AI Chat*
          <div className="relative group inline-block ml-1 mr-2">
            <Info className="w-3 h-3 text-purple-300 cursor-help hover:text-purple-200 transition-colors inline" />
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
              *10 messages per day
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          , daily horoscope*
          <div className="relative group inline-block ml-1 mr-2">
            <Info className="w-3 h-3 text-purple-300 cursor-help hover:text-purple-200 transition-colors inline" />
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
              *First 2 weeks included
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <span className="text-yellow-300">(coming soon)</span>, full kundli analysis <span className="text-yellow-300">(coming soon)</span>, and premium support.
        </span>
      )
    },
    {
      question: "How accurate are the palm readings?",
      answer: "Our AI-powered palm reading system is trained on thousands of palm reading samples and traditional palmistry knowledge from ancient palmistry books, combining AI technology with centuries-old wisdom to provide highly accurate insights into your personality and life patterns."
    },
    {
      question: "How does the chat feature work?",
      answer: "The Samadhan Chat provides personalized astrology guidance through AI-powered conversations. You can ask questions about your life, relationships, career, and receive tailored astrological advice."
    },
    {
      question: "Will new features be included?",
      answer: "Yes! Your lifetime access includes all current features plus many of the new features we will add in the future, including the upcoming Daily Horoscope and Full Kundli Analysis."
    }
  ];

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-bounce"></div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 animate-float">
          <Star className="w-6 h-6 text-yellow-300/60" />
        </div>
        <div className="absolute top-40 right-32 animate-float delay-1000">
          <Sparkles className="w-8 h-8 text-purple-300/60" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            {hasPaid ? 'Your Premium Plan' : 'Unlock Your Destiny'}
          </h1>
          <p className="text-lg mb-2 text-purple-200">
            {hasPaid ? 'Manage your premium astrology subscription' : 'Get complete access to all astrology services'}
          </p>
          <p className="text-sm text-yellow-300">
            {hasPaid ? 'Active lifetime access' : 'One-time payment • Lifetime access'}
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <div className={`backdrop-blur-lg rounded-3xl p-8 shadow-2xl relative overflow-hidden ${
            hasPaid 
              ? 'bg-gradient-to-b from-slate-900/95 to-indigo-900/95 border border-amber-500/50 shadow-2xl shadow-amber-500/20' 
              : 'bg-gradient-to-b from-indigo-950/90 to-purple-950/90 border border-purple-700/30'
          }`}>
            {/* Badge */}
            <div className={`absolute top-0 right-0 text-white px-4 py-1 rounded-bl-2xl text-sm font-semibold flex items-center gap-1 ${
              hasPaid 
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg shadow-amber-500/30' 
                : 'bg-gradient-to-r from-yellow-400 to-orange-500'
            }`}>
              <Crown className="w-4 h-4" />
              {hasPaid ? 'Active Plan' : 'Premium'}
            </div>

            {/* Price/Plan Status */}
            <div className="text-center mb-8 mt-4">
              {hasPaid ? (
                <div className="text-6xl font-bold text-white mb-2">Premium</div>
              ) : isLocationLoading ? (
                <div className="mb-2">
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="flex flex-col items-end">
                      <div className="h-6 w-16 bg-gray-600/50 rounded animate-pulse"></div>
                    </div>
                    <div className="h-16 w-32 bg-gray-600/50 rounded animate-pulse"></div>
                    <div className="w-16"></div>
                  </div>
                  <div className="h-6 w-20 bg-gray-600/50 rounded-full animate-pulse mx-auto"></div>
                </div>
              ) : (
                <div className="mb-2">
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="flex flex-col items-end">
                      <span className="text-lg text-gray-400 line-through leading-none">
                        {isIndia ? '₹999' : '$9.99'}
                      </span>
                    </div>
                    <span className="text-6xl font-bold text-white">
                      {isIndia ? '₹99' : '$1.99'}
                    </span>
                    <div className="w-16"></div>
                  </div>
                  <div className="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    90% OFF
                  </div>
                </div>
              )}
              <p className={`text-lg ${hasPaid ? 'text-amber-200' : 'text-purple-300'}`}>
                {hasPaid ? 'Lifetime Access' : 'One-time payment'}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {[
                { name: 'Complete Palm Reading Analysis', available: true },
                { name: 'Lifetime Access to Samadhan AI Chat*', available: true, tooltip: '10 messages per day' },
                { name: 'Daily Horoscope*', available: false, tooltip: 'First 2 weeks included' },
                { name: 'Full Kundli Analysis', available: false },
                { name: 'Premium Support', available: true },
                { name: 'Lifetime Access', available: true }
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    hasPaid 
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500' 
                      : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  }`}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-sm ${hasPaid ? 'text-slate-100' : 'text-purple-100'}`}>
                      <div>{feature.name}</div>
                      {!feature.available && (
                        <div className="text-xs text-yellow-300">(Coming Soon)</div>
                      )}
                    </div>
                    {feature.tooltip && (
                      <div className="relative group">
                        <Info className="w-4 h-4 text-purple-300 cursor-help hover:text-purple-200 transition-colors" />
                        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          *{feature.tooltip}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>


            {/* CTA Button */}
            {!hasPaid && (
              <button
                onClick={handleGetStarted}
                disabled={isLoading || isCheckingPayment}
                className="w-full disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
              >
                {getButtonIcon()}
                {getButtonText()}
              </button>
            )}

            {/* Error Message */}
            {(error || paymentError) && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-300 text-sm text-center">{error || paymentError}</p>
              </div>
            )}

            {/* Plan info */}
            <div className="text-center mt-6">
              <p className={`text-sm ${hasPaid ? 'text-amber-100' : 'text-purple-200'}`}>
                {hasPaid 
                  ? '🎉 Thank you for being a premium member!' 
                  : '🔒 Secure payment via Razorpay'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 mb-16">
          <p className="text-purple-200 text-sm mb-4">
            Join thousands of satisfied customers who've discovered their true potential
          </p>
          <div className="flex justify-center items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
            <span className="text-white ml-2 text-sm">4.9/5 from 2,847 reviews</span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-purple-200">
              Everything you need to know about our premium service
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 backdrop-blur-lg border border-purple-700/30 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-purple-800/20 transition-colors"
                >
                  <span className="text-white font-medium text-sm">{faq.question}</span>
                  {openFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-purple-300 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-purple-300 flex-shrink-0" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4">
                    <div className="text-purple-100 text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}