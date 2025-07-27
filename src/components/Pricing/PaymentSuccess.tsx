import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, navigate]);

  const handleGoToHome = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Confetti Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <div 
              className={`w-3 h-3 ${
                ['bg-yellow-400', 'bg-pink-500', 'bg-purple-500', 'bg-green-400', 'bg-blue-500', 'bg-orange-400'][Math.floor(Math.random() * 6)]
              } opacity-80`}
              style={{
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          </div>
        ))}
      </div>

      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-lg w-full">
          {/* Success Card */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-purple-400/30 rounded-3xl p-8 shadow-2xl text-center animate-bounce-in">
            {/* Success Icon */}
            <div className="text-8xl mb-6">🎉</div>
            
            {/* Main Message */}
            <h1 className="text-4xl font-bold text-white mb-4">
              Payment Successful!
            </h1>
            <p className="text-purple-200 text-lg mb-8">
              Congratulations! Your payment has been processed successfully.
              <br />
              Welcome to your premium journey!
            </p>

            {/* Action Button */}
            <button
              onClick={handleGoToHome}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-6"
            >
              Go to Home
            </button>

            {/* Auto-redirect message */}
            <p className="text-purple-300 text-sm">
              Redirecting to home in {countdown} seconds...
            </p>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes confetti {
            0% {
              transform: translateY(-100vh) rotateZ(0deg);
            }
            100% {
              transform: translateY(100vh) rotateZ(720deg);
            }
          }
          .animate-confetti {
            animation: confetti linear infinite;
          }
          
          @keyframes bounce-in {
            0% {
              transform: scale(0.3);
              opacity: 0;
            }
            50% {
              transform: scale(1.05);
            }
            70% {
              transform: scale(0.9);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-bounce-in {
            animation: bounce-in 0.8s ease-out;
          }
        `}
      </style>
    </div>
  );
}