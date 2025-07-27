import { User, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AstroProfileService, GetProfileResponse } from '../../services/astroProfileService';
import { useState, useEffect } from 'react';
import Breadcrumb from '../Layout/Breadcrumb';

export default function ProfilePage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<GetProfileResponse['profile'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await AstroProfileService.getProfile();
        setProfile(response.profile);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-200">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-200 mb-4">Error loading profile:</p>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const userInfo = [
    {
      icon: User,
      label: 'Full Name',
      value: profile?.fullName || 'Not provided',
    },
    {
      icon: Calendar,
      label: 'Date of Birth',
      value: formatDate(profile?.dateOfBirth),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative overflow-hidden pb-20">
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/3 left-1/6 w-3 h-3 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
        <div className="absolute top-1/4 right-1/6 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-cyan-300 rounded-full animate-bounce opacity-70"></div>
        <div className="absolute top-1/6 left-1/3 w-1 h-1 bg-pink-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/6 right-1/6 w-2 h-2 bg-purple-300 rounded-full animate-bounce"></div>
      </div>

      <Breadcrumb
        items={[
          { label: 'Home', path: '/home' },
          { label: 'Profile' }
        ]}
      />

      <div className="px-6 py-6 relative z-10">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{profile?.fullName}</h2>
              <p className="text-purple-200">{profile?.email}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            {userInfo.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Icon className="w-4 h-4 text-purple-200" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-purple-300">{label}</p>
                  <p className="font-medium text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500/20 backdrop-blur-md border border-red-400/50 text-red-200 py-4 rounded-xl font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}