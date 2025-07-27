import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';

interface PaymentRequiredModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  feature?: string;
}

export default function PaymentRequiredModal({ 
  isOpen, 
  title = "Premium Access Required",
  message = "To access this feature, you need to upgrade to premium. Get lifetime access to all premium features!",
  feature = "this feature"
}: PaymentRequiredModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <div className="text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Crown className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-4">
            {title}
          </h3>

          {/* Message */}
          <p className="text-purple-200 mb-6 leading-relaxed">
            {message}
          </p>


          {/* Action Button */}
          <button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            Upgrade to Premium
          </button>

          {/* Additional Info */}
          <p className="text-purple-300 text-xs mt-4">
            One-time payment • Lifetime access • No recurring charges
          </p>
        </div>
      </div>
    </div>
  );
}