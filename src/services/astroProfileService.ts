import { supabase } from '../integrations/supabase/client';

export interface AstroProfileData {
  dateOfBirth: string;
  timeOfBirth?: string | null;
  placeOfBirth?: string | null;
  gender: 'male' | 'female' | 'other';
}

export interface ProfileStatusResponse {
  success: boolean;
  isComplete: boolean;
  profile?: {
    hasDateOfBirth: boolean;
    hasGender: boolean;
  } | null;
  error?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  profile?: {
    id: string;
    dateOfBirth: string;
    timeOfBirth: string | null;
    placeOfBirth: string | null;
    gender: string;
    updatedAt: string;
  };
  error?: string;
}

export interface GetProfileResponse {
  success: boolean;
  profile: {
    id: string;
    email: string;
    fullName: string;
    dateOfBirth: string | null;
    timeOfBirth: string | null;
    placeOfBirth: string | null;
    gender: string | null;
    phone: string | null;
    preferences: any;
    createdAt: string | null;
    updatedAt: string | null;
    isComplete: boolean;
  };
  error?: string;
}

export class AstroProfileService {
  private static async getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }
    return session.access_token;
  }

  private static getSupabaseUrl(): string {
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (!url) {
      throw new Error('Supabase URL not configured');
    }
    return url;
  }

  static async isProfileComplete(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const supabaseUrl = this.getSupabaseUrl();
      
      const response = await fetch(`${supabaseUrl}/functions/v1/get-profile-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check profile status');
      }

      const data: ProfileStatusResponse = await response.json();
      return data.isComplete;
    } catch (error) {
      console.error('Error checking profile completion:', error);
      throw error;
    }
  }

  static async createOrUpdateProfile(profileData: AstroProfileData): Promise<UpdateProfileResponse> {
    try {
      const token = await this.getAuthToken();
      const supabaseUrl = this.getSupabaseUrl();
      
      const response = await fetch(`${supabaseUrl}/functions/v1/update-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data: UpdateProfileResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  static async getProfile(): Promise<GetProfileResponse> {
    try {
      const token = await this.getAuthToken();
      const supabaseUrl = this.getSupabaseUrl();
      
      const response = await fetch(`${supabaseUrl}/functions/v1/get-profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }

      const data: GetProfileResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  // Legacy methods for backward compatibility - now use Edge Functions
  static async getProfileByUserId(userId: string): Promise<any> {
    console.warn('getProfileByUserId is deprecated. Use isProfileComplete() instead.');
    return null;
  }
}