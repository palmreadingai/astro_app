import { Star, FileText, Shield, HelpCircle, Mail, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative z-50 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 border-t border-gray-700/30 py-12" style={{ userSelect: 'text', pointerEvents: 'auto' }}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.webp" alt="Palm AI Logo" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-bold text-white">Palm AI</span>
            </div>
            <p className="text-purple-200 text-sm leading-relaxed">
              Discover your destiny through AI-powered palm reading and personalized astrology guidance.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-slate-700/30 rounded-full flex items-center justify-center hover:bg-slate-600/30 transition-colors cursor-pointer">
                <span className="text-white text-sm">f</span>
              </div>
              <div className="w-8 h-8 bg-slate-700/30 rounded-full flex items-center justify-center hover:bg-slate-600/30 transition-colors cursor-pointer">
                <span className="text-white text-sm">t</span>
              </div>
              <div className="w-8 h-8 bg-slate-700/30 rounded-full flex items-center justify-center hover:bg-slate-600/30 transition-colors cursor-pointer">
                <span className="text-white text-sm">in</span>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Legal</h3>
            <div className="space-y-2">
              <Link to="/terms" className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors text-sm">
                <FileText className="w-4 h-4" />
                <span>Terms of Service</span>
              </Link>
              <Link to="/privacy" className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors text-sm">
                <Shield className="w-4 h-4" />
                <span>Privacy Policy</span>
              </Link>
              <Link to="/refund" className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors text-sm">
                <HelpCircle className="w-4 h-4" />
                <span>Refund Policy</span>
              </Link>
              <Link to="/pricing-policy" className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors text-sm">
                <DollarSign className="w-4 h-4" />
                <span>Pricing Policy</span>
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Contact Us</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-purple-200 text-sm">
                <Mail className="w-4 h-4" />
                <span>support@palmai.live</span>
              </div>
              <Link to="/contact" className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors text-sm">
                <Mail className="w-4 h-4" />
                <span>Contact Page</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700/30 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-300 text-sm">
              © 2024 Palm AI. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 text-gray-300 text-sm">
              <span>🔒 SSL Secured</span>
              <span>•</span>
              <span>💳 Secure Payments</span>
              <span>•</span>
              <span>✨ AI Powered</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}