import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../UI/card';
import { Button } from '../UI/button';
import { supabase } from '../../integrations/supabase/client';

interface Coupon {
  id: string;
  code: string;
  type: 'discount' | 'free';
  discount_type?: 'percentage' | 'amount';
  discount_value?: number;
  currency?: string;
  usage_limit: number;
  current_usage: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface CouponFormProps {
  coupon?: Coupon | null;
  onSave: () => void;
  onCancel?: () => void;
}

interface FormData {
  code: string;
  type: 'discount' | 'free';
  discount_type: 'percentage' | 'amount';
  discount_value: string;
  currency: 'INR' | 'USD';
  usage_limit: string;
  valid_from: string;
  valid_until: string;
  description: string;
}

export const CouponForm: React.FC<CouponFormProps> = ({ coupon, onSave, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    code: '',
    type: 'discount',
    discount_type: 'percentage',
    discount_value: '',
    currency: 'INR',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    description: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (coupon) {
      const today = new Date().toISOString().split('T')[0];
      const validUntil = coupon.valid_until 
        ? new Date(coupon.valid_until).toISOString().split('T')[0]
        : '';
      const validFrom = coupon.valid_from 
        ? new Date(coupon.valid_from).toISOString().split('T')[0]
        : today;

      setFormData({
        code: coupon.code,
        type: coupon.type,
        discount_type: coupon.discount_type || 'percentage',
        discount_value: coupon.discount_value?.toString() || '',
        currency: coupon.currency as 'INR' | 'USD' || 'INR',
        usage_limit: coupon.usage_limit.toString(),
        valid_from: validFrom,
        valid_until: validUntil,
        description: coupon.description || ''
      });
    } else {
      // Set default valid_from to today for new coupons
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, valid_from: today }));
    }
  }, [coupon]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Coupon code must be at least 3 characters';
    }

    if (formData.type === 'discount') {
      if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
        newErrors.discount_value = 'Discount value must be greater than 0';
      } else if (formData.discount_type === 'percentage' && parseFloat(formData.discount_value) > 100) {
        newErrors.discount_value = 'Percentage discount cannot exceed 100%';
      }
    }

    if (!formData.usage_limit || parseInt(formData.usage_limit) <= 0) {
      newErrors.usage_limit = 'Usage limit must be greater than 0';
    }

    if (formData.valid_until && formData.valid_from && 
        new Date(formData.valid_until) <= new Date(formData.valid_from)) {
      newErrors.valid_until = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const payload: any = {
        code: formData.code.toUpperCase().trim(),
        type: formData.type,
        usage_limit: parseInt(formData.usage_limit),
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null,
        description: formData.description.trim() || null
      };

      if (formData.type === 'discount') {
        payload.discount_type = formData.discount_type;
        payload.discount_value = parseFloat(formData.discount_value);
        if (formData.discount_type === 'amount') {
          payload.currency = formData.currency;
        }
      }

      const session = await supabase.auth.getSession();

      if (coupon) {
        // Update existing coupon
        payload.action = 'update';
        payload.id = coupon.id;
      } else {
        // Create new coupon
        payload.action = 'create';
      }

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/manage-coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${coupon ? 'update' : 'create'} coupon`);
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      if (error.message?.includes('already exists')) {
        setErrors({ code: 'This coupon code already exists' });
      } else {
        alert(`Error saving coupon: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleInputChange('code', result);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          {coupon ? 'Edit Coupon' : 'Create New Coupon'}
        </h2>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Coupon Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coupon Code *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <Button type="button" variant="outline" onClick={generateRandomCode}>
                  Generate
                </Button>
              </div>
              {errors.code && (
                <p className="text-red-500 text-sm mt-1">{errors.code}</p>
              )}
            </div>

            {/* Coupon Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coupon Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="discount"
                    checked={formData.type === 'discount'}
                    onChange={(e) => handleInputChange('type', e.target.value as 'discount' | 'free')}
                    className="mr-2"
                  />
                  Discount Coupon
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="free"
                    checked={formData.type === 'free'}
                    onChange={(e) => handleInputChange('type', e.target.value as 'discount' | 'free')}
                    className="mr-2"
                  />
                  Free Service
                </label>
              </div>
            </div>

            {/* Discount Settings */}
            {formData.type === 'discount' && (
              <div className="bg-gray-50 p-4 rounded-md space-y-4">
                <h3 className="font-medium text-gray-900">Discount Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => handleInputChange('discount_type', e.target.value as 'percentage' | 'amount')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="amount">Fixed Amount</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      step={formData.discount_type === 'percentage' ? '0.1' : '1'}
                      min="0"
                      max={formData.discount_type === 'percentage' ? '100' : undefined}
                      value={formData.discount_value}
                      onChange={(e) => handleInputChange('discount_value', e.target.value)}
                      placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.discount_value ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.discount_value && (
                      <p className="text-red-500 text-sm mt-1">{errors.discount_value}</p>
                    )}
                  </div>

                  {formData.discount_type === 'amount' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency *
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value as 'INR' | 'USD')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Usage Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usage Limit *
              </label>
              <input
                type="number"
                min="1"
                value={formData.usage_limit}
                onChange={(e) => handleInputChange('usage_limit', e.target.value)}
                placeholder="100"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.usage_limit ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.usage_limit && (
                <p className="text-red-500 text-sm mt-1">{errors.usage_limit}</p>
              )}
            </div>

            {/* Validity Period */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid From
                </label>
                <input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => handleInputChange('valid_from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => handleInputChange('valid_until', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.valid_until ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.valid_until && (
                  <p className="text-red-500 text-sm mt-1">{errors.valid_until}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the coupon..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400"
              >
                {isSubmitting 
                  ? (coupon ? 'Updating...' : 'Creating...') 
                  : (coupon ? 'Update Coupon' : 'Create Coupon')
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};