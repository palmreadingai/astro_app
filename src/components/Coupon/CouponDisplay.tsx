import { Tag, Percent, Gift, DollarSign } from 'lucide-react';
import { formatPrice, formatDiscount } from '../../services/paymentService';

interface CouponDisplayProps {
  coupon: AppliedCoupon;
  originalAmount: number;
  finalAmount: number;
  currency: string;
  onRemove: () => void;
  showRemove?: boolean;
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

export default function CouponDisplay({ 
  coupon, 
  originalAmount, 
  finalAmount, 
  currency,
  onRemove,
  showRemove = true 
}: CouponDisplayProps) {
  const getDiscountIcon = () => {
    if (coupon.type === 'free') {
      return <Gift className="w-5 h-5 text-green-400" />;
    }
    if (coupon.discount?.type === 'percentage') {
      return <Percent className="w-5 h-5 text-blue-400" />;
    }
    return <DollarSign className="w-5 h-5 text-purple-400" />;
  };

  const getDiscountText = () => {
    if (coupon.type === 'free') {
      return 'FREE ACCESS - No payment required!';
    }
    if (coupon.discount?.type === 'percentage') {
      return `${coupon.discount.value}% discount applied`;
    }
    if (coupon.discount?.type === 'amount') {
      const symbol = currency === 'INR' ? '₹' : '$';
      return `${symbol}${coupon.discount.value} discount applied`;
    }
    return 'Discount applied';
  };

  const getSavingsAmount = () => {
    if (coupon.type === 'free') {
      return formatPrice(originalAmount, currency);
    }
    const savingsAmount = originalAmount - finalAmount;
    return formatPrice(savingsAmount, currency);
  };

  const getBackgroundColor = () => {
    if (coupon.type === 'free') {
      return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
    }
    if (coupon.discount?.type === 'percentage') {
      return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
    }
    return 'from-purple-500/20 to-indigo-500/20 border-purple-500/30';
  };

  const getTextColor = () => {
    if (coupon.type === 'free') {
      return 'text-green-200';
    }
    if (coupon.discount?.type === 'percentage') {
      return 'text-blue-200';
    }
    return 'text-purple-200';
  };

  return (
    <div className={`bg-gradient-to-r ${getBackgroundColor()} border rounded-xl p-4 space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-purple-300" />
          <span className="text-sm font-medium text-purple-200">Coupon Applied</span>
        </div>
        {showRemove && (
          <button
            onClick={onRemove}
            className="text-xs text-purple-300 hover:text-purple-200 transition-colors underline"
          >
            Remove
          </button>
        )}
      </div>

      {/* Coupon Info */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {getDiscountIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-lg text-white">{coupon.code}</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTextColor()} bg-white/10`}>
              {formatDiscount(coupon.discount)}
            </span>
          </div>
          <p className="text-sm text-gray-300">{getDiscountText()}</p>
        </div>
      </div>

      {/* Savings Summary */}
      <div className="bg-black/20 rounded-lg p-3 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-300">Original Price</span>
          <span className="text-gray-300 line-through">{formatPrice(originalAmount, currency)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-300">Discount</span>
          <span className={getTextColor()}>-{getSavingsAmount()}</span>
        </div>
        <hr className="border-gray-600" />
        <div className="flex justify-between items-center">
          <span className="font-semibold text-white">
            {coupon.type === 'free' ? 'You Pay' : 'Final Price'}
          </span>
          <div className="text-right">
            {coupon.type === 'free' ? (
              <div>
                <div className="text-2xl font-bold text-green-400">FREE</div>
                <div className="text-xs text-green-300">No payment required</div>
              </div>
            ) : (
              <div className="text-xl font-bold text-white">
                {formatPrice(finalAmount, currency)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Message for Free Coupons */}
      {coupon.type === 'free' && (
        <div className="text-center p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-300 text-sm font-medium">
            🎉 Congratulations! This coupon gives you free access to all premium features.
          </p>
        </div>
      )}
    </div>
  );
}