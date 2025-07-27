import { Hand, Stars, MessageCircle, Calendar, Heart, Sparkles, Star, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import Footer from '../Layout/Footer';

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);

  const services = [
    {
      path: '/palm',
      title: 'Palm Analysis',
      description: 'Discover your personality through palm reading',
      icon: Hand,
      gradient: 'from-pink-500 to-rose-500',
      color: 'text-pink-600',
      isActive: true,
    },
    {
      path: '/chat',
      title: 'Samadhan Chat',
      description: 'Get personalized astrology guidance',
      icon: MessageCircle,
      gradient: 'from-blue-500 to-cyan-500',
      color: 'text-blue-600',
      isActive: true,
    },
    {
      path: '/horoscope',
      title: 'Daily Horoscope',
      description: 'Coming Soon',
      icon: Calendar,
      gradient: 'from-amber-500 to-orange-500',
      color: 'text-amber-600',
      isActive: false,
    },
    {
      path: '/kundli',
      title: 'Kundli Analysis',
      description: 'Coming Soon',
      icon: FileText,
      gradient: 'from-purple-500 to-indigo-500',
      color: 'text-purple-600',
      isActive: false,
    },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative overflow-hidden flex flex-col">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-green-400/10 rounded-full blur-xl animate-bounce delay-700"></div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 animate-float">
          <Star className="w-6 h-6 text-yellow-300/60" />
        </div>
        <div className="absolute top-40 right-32 animate-float delay-1000">
          <Sparkles className="w-8 h-8 text-purple-300/60" />
        </div>
        <div className="absolute bottom-32 left-32 animate-float delay-2000">
          <Heart className="w-6 h-6 text-pink-300/60" />
        </div>
      </div>

      <div className="relative z-10 px-6 py-8 flex-1">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Hello, {user?.name || 'Seeker'} 👋
          </h1>
          <p className="text-purple-200">Welcome to your astrology journey</p>
        </div>
        {/* Zodiac Sign Card */}
        {user?.zodiacSign && (
          <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1">Your Sign</h2>
                <p className="text-lg text-yellow-300">{user.zodiacSign}</p>
              </div>
              <div className="relative">
                <Stars className="w-12 h-12 text-yellow-400 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        )}

        {/* Main Services Grid */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Explore Services</h3>
          <div className="grid grid-cols-2 gap-4">
            {services.map((service) => (
              <button
                key={service.path}
                onClick={() => service.isActive ? navigate(service.path) : null}
                disabled={!service.isActive}
                className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg transition-all duration-300 ${
                  service.isActive 
                    ? 'hover:shadow-xl hover:bg-white/20 transform hover:-translate-y-1 cursor-pointer' 
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${service.gradient} rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg ${!service.isActive ? 'opacity-70' : ''}`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">{service.title}</h4>
                <p className={`text-sm leading-relaxed ${service.isActive ? 'text-purple-200' : 'text-yellow-300 font-medium'}`}>
                  {service.description}
                </p>
              </button>
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