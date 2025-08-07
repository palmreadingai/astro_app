import { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { validateCoupon } from '../../services/paymentService';

interface CouponInputProps {
  onCouponApplied: (coupon: AppliedCoupon) => void;
  onCouponRemoved: () => void;
  disabled?: boolean;
  appliedCoupon?: AppliedCoupon | null;
}

interface AppliedCoupon {
  code: string;
  type: 'discount' | 'free';
  discount?: {
    type: 'percentage' | 'amount' | 'free';
    value: number;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    currency: string;
  };
}

export default function CouponInput({ 
  onCouponApplied, 
  onCouponRemoved, 
  disabled = false,
  appliedCoupon = null 
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(!appliedCoupon);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || isValidating || disabled) return;

    setIsValidating(true);
    setError(null);

    try {
      console.log('🎫 Validating coupon:', couponCode.trim());
      const result = await validateCoupon(couponCode.trim());

      if (result.success && result.coupon && result.discount) {
        console.log('✅ Coupon validated successfully');
        
        const appliedCoupon: AppliedCoupon = {
          code: result.coupon.code,
          type: result.coupon.type,
          discount: result.discount
        };

        onCouponApplied(appliedCoupon);
        setShowInput(false);
        setCouponCode('');
        setError(null);
      } else {
        console.log('❌ Coupon validation failed:', result.error);
        setError(result.error || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('❌ Error validating coupon:', error);
      setError('Failed to validate coupon. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    setShowInput(true);
    setCouponCode('');
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyCoupon();
    }
  };

  // If coupon is applied, show the applied coupon display
  if (appliedCoupon && !showInput) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-purple-200">
          <Tag className="w-4 h-4" />
          <span>Coupon Applied</span>
        </div>
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-green-200 text-lg">
                  {appliedCoupon.code}
                </div>
                <div className="text-sm text-green-300">
                  {appliedCoupon.type === 'free' ? 'Free Access' : 
                   appliedCoupon.discount?.type === 'percentage' ? 
                   `${appliedCoupon.discount.value}% Discount` :
                   `${appliedCoupon.discount?.currency === 'INR' ? '₹' : '$'}${appliedCoupon.discount?.value} Off`}
                </div>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              disabled={disabled}
              className="p-2 text-green-300 hover:text-green-200 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove coupon"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show coupon input form
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-purple-200">
        <Tag className="w-4 h-4" />
        <span>Have a coupon code?</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                if (error) setError(null);
              }}
              onKeyPress={handleKeyPress}
              disabled={disabled || isValidating}
              className="w-full px-4 py-3 bg-gradient-to-r from-indigo-950/50 to-purple-950/50 border border-purple-700/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={20}
            />
          </div>
          <button
            onClick={handleApplyCoupon}
            disabled={disabled || !couponCode.trim() || isValidating}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking</span>
              </>
            ) : (
              'Apply'
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="text-xs text-purple-300/70">
          Enter your coupon code above and click "Apply" to see your discount
        </div>
      </div>
    </div>
  );
}