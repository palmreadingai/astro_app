import React from 'react';
import { Sparkles, Eye, Heart, Star, ArrowRight, Zap, BookOpen, Brain, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { Button } from '../UI/button';
import { Card, CardContent } from '../UI/card';
import BlurImage from "../BlurImage";
import Footer from '../Layout/Footer';

export default function LandingPage() {
  const navigate = useNavigate();
  const { setAuthMode } = useAppStore();

  const onGetStarted = () => {
    setAuthMode('signup');
    navigate('/auth');
  };

  const onSignIn = () => {
    setAuthMode('signin');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Enhanced animated background particles */}
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

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6 flex justify-between items-start animate-fade-in">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative">
            <img src="/logo.webp" alt="Palm AI Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-lg" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Palm AI
          </h1>
        </div>
        <Button
          onClick={onSignIn}
          className="bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 px-4 py-2.5 md:px-5 md:py-3 text-sm md:text-base font-medium rounded-xl min-h-[44px] min-w-[88px]"
        >
          Sign In
        </Button>
      </div>

      <div className="relative z-10 container mx-auto px-6 md:px-8 py-6 md:py-8">
        {/* Palm Reading Animation with Real Hand Image */}
        <div className="flex justify-center mb-16 md:mb-20 -mt-8 md:-mt-12 animate-fade-in">
          <div className="relative">
            {/* Real Hand Image with blur/shimmer effect */}
            <div className="relative w-36 h-44 md:w-44 md:h-56 mx-auto mb-6 md:mb-8">
              <BlurImage
                src="/hand.webp"
                alt="Palm for reading"
                className="w-full h-full object-contain relative z-10"
                skeletonClassName="rounded-lg"
              />

              {/* Scanning beam effects - NOW IN FRONT */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 10 }}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan opacity-80"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-scan delay-1000 opacity-60"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-scan delay-2000 opacity-40"></div>
              </div>

              {/* Mystical particles around hand */}
              <div className="absolute -top-4 -left-4 w-4 h-4 bg-yellow-400 rounded-full animate-float blur-sm opacity-80"></div>
              <div className="absolute top-8 -right-6 w-3 h-3 bg-pink-400 rounded-full animate-float delay-500 blur-sm opacity-70"></div>
              <div className="absolute top-20 -left-6 w-2 h-2 bg-blue-400 rounded-full animate-float delay-1000 blur-sm opacity-60"></div>
              <div className="absolute bottom-16 -right-4 w-3 h-3 bg-purple-400 rounded-full animate-float delay-1500 blur-sm opacity-80"></div>
              <div className="absolute bottom-8 -left-3 w-2 h-2 bg-green-400 rounded-full animate-float delay-2000 blur-sm opacity-70"></div>
              <div className="absolute top-32 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-float delay-700 blur-sm opacity-60"></div>
              <div className="absolute bottom-24 left-4 w-3 h-3 bg-orange-400 rounded-full animate-float delay-1200 blur-sm opacity-75"></div>

              {/* Glowing aura around the hand */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-400/60 to-pink-400/60 blur-3xl animate-pulse scale-125" style={{ zIndex: 0 }}></div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-cyan-400/60 to-yellow-400/60 blur-3xl animate-pulse delay-500 scale-120" style={{ zIndex: 0 }}></div>

            </div>

            {/* AI Analysis Text - Centered relative to hand */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <p className="text-xs md:text-sm text-purple-200 animate-pulse whitespace-nowrap text-center">
                ✨ AI Analyzing Palm Lines ✨
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Hero Section - Mobile Optimized */}
        <div className="text-center mb-16 md:mb-24">
          <div className="mb-2 md:mb-4 animate-fade-in">
            {/* Main Headline */}
            <h2
              className={`
                text-4xl
                sm:text-5xl
                md:text-7xl
                lg:text-8xl
                font-bold
                text-white 
                mb-2
                md:mb-4
                bg-gradient-to-r
                from-white
                via-purple-100
                to-pink-100
                bg-clip-text
                text-transparent
                animate-fade-in
                delay-300
                leading-tight
                tracking-tight
                drop-shadow-2xl
              `}
              style={{
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
              }}
            >
              AI Palm Reading
            </h2>

            {/* Updated supporting text */}
            <div className="max-w-3xl mx-auto mb-8 md:mb-12 animate-fade-in delay-500 px-2 mt-6 md:mt-8">
              <p className="text-lg md:text-2xl text-white mb-0 md:mb-1 leading-relaxed md:leading-relaxed font-semibold drop-shadow-lg">
                Reveal your{' '}
                <span className="text-yellow-300 font-extrabold drop-shadow-lg">
                  Life's Path
                </span>{' '}
                with our{' '}
                <span className="text-pink-400 font-extrabold drop-shadow-lg">
                  Advanced AI
                </span>{' '}
                Technology
              </p>
              <p className="text-base md:text-xl text-gray-100 leading-relaxed md:leading-loose font-normal mt-2 drop-shadow-md">
                Rooted in Traditional Palmistry Texts and Validated by Modern Research.
              </p>
            </div>

            {/* Scientific credibility badges - Mobile Optimized */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-4 md:mb-6 animate-fade-in delay-700 px-4">
              <div className="flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 md:px-4 md:py-2">
                <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-blue-300" />
                <span className="text-xs md:text-base text-blue-100">Research-Based</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 md:px-4 md:py-2">
                <Brain className="w-3 h-3 md:w-4 md:h-4 text-purple-300" />
                <span className="text-xs md:text-base text-purple-100">AI-Powered</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 md:px-4 md:py-2">
                <Award className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
                <span className="text-xs md:text-base text-yellow-100">Authenticated</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="animate-fade-in delay-1000 px-2">
            <Button 
              onClick={onGetStarted}
              className="w-full md:w-auto bg-gradient-to-r from-purple-600 via-pink-500 to-pink-600 hover:from-purple-700 hover:via-pink-600 hover:to-pink-700 text-white font-bold py-6 md:py-8 px-12 md:px-16 text-lg md:text-xl transition-all duration-1000 ease-in-out transform hover:scale-105 relative overflow-hidden group"
              style={{
                borderRadius: '50px',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.3), 0 4px 15px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Eye className="w-5 h-5 md:w-6 md:h-6 mr-3 relative z-10" />
              <span className="hidden md:inline relative z-10">Read My Palm</span>
              <span className="md:hidden relative z-10">Read My Palm</span>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-3 relative z-10 group-hover:translate-x-2 transition-transform duration-800 ease-in-out animate-slide-right" />
            </Button>
            <p className="text-gray-100 mt-4 text-sm md:text-base px-2 leading-relaxed font-medium drop-shadow-md">
              No fake predictions • Science-backed analysis • Authentic insights
            </p>
          </div>
        </div>

        {/* Enhanced Features Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-24 px-2">
          <Card className="bg-white/15 backdrop-blur-lg border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 animate-fade-in delay-300 rounded-2xl">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="relative mb-4 md:mb-5">
                <Heart className="w-14 h-14 md:w-16 md:h-16 text-pink-400 mx-auto animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-pink-500 rounded-full animate-ping"></div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-5 drop-shadow-lg">Love & Relationships</h3>
              <p className="text-base md:text-lg text-gray-100 leading-relaxed drop-shadow-md">
                AI analysis of your heart line, mount of Venus, and relationship indicators 
                based on documented palmistry research.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/15 backdrop-blur-lg border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 animate-fade-in delay-500 rounded-2xl">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="relative mb-4 md:mb-5">
                <Zap className="w-14 h-14 md:w-16 md:h-16 text-yellow-400 mx-auto animate-pulse delay-300" />
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-yellow-500 rounded-full animate-ping delay-300"></div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-5 drop-shadow-lg">Career & Success</h3>
              <p className="text-base md:text-lg text-gray-100 leading-relaxed drop-shadow-md">
                Professional potential analysis using authenticated palmistry studies 
                on success lines and career indication patterns.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/15 backdrop-blur-lg border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 animate-fade-in delay-700 rounded-2xl">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="relative mb-4 md:mb-5">
                <Sparkles className="w-14 h-14 md:w-16 md:h-16 text-purple-400 mx-auto animate-pulse delay-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-purple-500 rounded-full animate-ping delay-600"></div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-5 drop-shadow-lg">Spiritual Journey</h3>
              <p className="text-base md:text-lg text-gray-100 leading-relaxed drop-shadow-md">
                Discover your spiritual path through AI interpretation of intuition lines, 
                mystic crosses, and other spiritual markers.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scientific Approach Section */}
        <div className="text-center mb-12 md:mb-20 animate-fade-in delay-900 px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg border-white/20 rounded-3xl p-6 md:p-12">
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="relative">
                <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-blue-300 animate-pulse" />
                <div className="absolute -top-1 md:-top-2 -right-1 md:-right-2">
                  <Award className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 animate-bounce" />
                </div>
              </div>
            </div>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">Scientifically Grounded Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-left">
              <div>
                <h4 className="text-lg md:text-xl font-semibold text-purple-200 mb-2 md:mb-3">📚 Research Foundation</h4>
                <ul className="text-sm md:text-base text-purple-100 space-y-1 md:space-y-2">
                  <li>• Published academic studies on palmistry</li>
                  <li>• Traditional texts and historical documentation</li>
                  <li>• Cross-cultural palmistry research</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-semibold text-purple-200 mb-2 md:mb-3">🧠 AI Technology</h4>
                <ul className="text-sm md:text-base text-purple-100 space-y-1 md:space-y-2">
                  <li>• Advanced computer vision analysis</li>
                  <li>• Pattern recognition algorithms</li>
                  <li>• Authenticated source integration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works with enhanced animations */}
        <div className="text-center mb-16 md:mb-24 px-2">
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-10 md:mb-16 animate-fade-in drop-shadow-lg">Your Palm Reading Journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="flex flex-col items-center animate-fade-in delay-300">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl mb-4 md:mb-6 animate-bounce">
                1
              </div>
              <h4 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Capture Your Palm</h4>
              <p className="text-sm md:text-lg text-purple-200">Upload a clear photo using our guided capture system with optimal lighting detection</p>
            </div>
            <div className="flex flex-col items-center animate-fade-in delay-500">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl mb-4 md:mb-6 animate-bounce delay-300">
                2
              </div>
              <h4 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Answer a Few Quick Questions</h4>
              <p className="text-sm md:text-lg text-purple-200">For the most accurate analysis, just answer a few questions to fine-tune your palm reading</p>
            </div>
            <div className="flex flex-col items-center animate-fade-in delay-700">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl mb-4 md:mb-6 animate-bounce delay-600">
                3
              </div>
              <h4 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Personalized Insights</h4>
              <p className="text-sm md:text-lg text-purple-200">Receive detailed, research-backed interpretations with interactive guidance</p>
            </div>
          </div>
        </div>

        {/* Enhanced CTA Section with better contrast */}
        <div className="text-center animate-fade-in delay-1000 px-4">
          <Card className="bg-black/40 backdrop-blur-xl border-white/30 max-w-3xl mx-auto shadow-2xl">
            <CardContent className="p-7 md:p-12">
              <div className="flex justify-center mb-4 md:mb-6">
                <div className="relative">
                  <Brain className="w-12 h-12 md:w-16 md:h-16 text-purple-300 animate-pulse" />
                  <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 absolute -top-1 md:-top-2 -right-1 md:-right-2 animate-spin" />
                </div>
              </div>
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6 drop-shadow-lg">Ready for Authentic AI Palm Reading?</h3>
              <p className="text-base md:text-xl text-gray-100 mb-6 md:mb-10 leading-relaxed drop-shadow-md">
                Join thousands discovering their authentic destiny through our scientifically-informed, 
                AI-powered palmistry analysis. No fake predictions - just research-backed insights.
              </p>
              <Button 
                onClick={onGetStarted}
                className="w-full md:w-auto bg-gradient-to-r from-purple-600 via-pink-500 to-pink-600 hover:from-purple-700 hover:via-pink-600 hover:to-pink-700 text-white font-bold py-6 md:py-8 px-12 md:px-16 text-lg md:text-xl transition-all duration-1000 ease-in-out transform hover:scale-105 relative overflow-hidden group"
                style={{
                  borderRadius: '50px',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.3), 0 4px 15px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Eye className="w-5 h-5 md:w-6 md:h-6 mr-3 relative z-10" />
                <span className="hidden md:inline relative z-10">Read My Palm</span>
                <span className="md:hidden relative z-10">Read My Palm</span>
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-3 relative z-10 group-hover:translate-x-2 transition-transform duration-800 ease-in-out animate-slide-right" />
              </Button>
              <p className="text-gray-200 mt-4 md:mt-6 text-xs md:text-sm drop-shadow-md">
                Research-validated • AI-powered • Authentic insights
              </p>
            </CardContent>
          </Card>
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
          .animate-spin-slow {
            animation: spin 8s linear infinite;
          }
          @keyframes scan {
            0% { transform: translateY(0) scaleX(0); opacity: 0; }
            50% { transform: translateY(200px) scaleX(1); opacity: 1; }
            100% { transform: translateY(240px) scaleX(0); opacity: 0; }
          }
          .animate-scan {
            animation: scan 3s ease-in-out infinite;
          }
          @keyframes slide-right {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(8px); }
          }
          .animate-slide-right {
            animation: slide-right 2s ease-in-out infinite;
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
          }
          .delay-300 { animation-delay: 300ms; }
          .delay-500 { animation-delay: 500ms; }
          .delay-700 { animation-delay: 700ms; }
          .delay-1000 { animation-delay: 1000ms; }
          .delay-1200 { animation-delay: 1200ms; }
          .delay-1500 { animation-delay: 1500ms; }
          .delay-2000 { animation-delay: 2000ms; }
        `}
      </style>
    </div>
  );
}