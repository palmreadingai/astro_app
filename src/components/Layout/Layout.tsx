import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Stars } from 'lucide-react';
import Sidebar from './Sidebar';
import LoadingSpinner from '../UI/LoadingSpinner';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '../../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  // Sidebar state management
  const {
    isCollapsed,
    isMobileOpen,
    isMobile,
    toggleCollapsed,
    openMobile,
    closeMobile
  } = useSidebar();
  
  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/');
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col lg:block">
      {/* Mobile Header - Only visible on mobile */}
      <header className="lg:hidden bg-gradient-to-r from-indigo-950 to-purple-900 shadow-sm relative z-30 flex-shrink-0">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Mobile menu button */}
            <button
              onClick={openMobile}
              className="p-2 hover:bg-white/10 rounded-md transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={20} className="text-white" />
            </button>
            
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img src="/logo.webp" alt="Palm AI Logo" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-bold text-white">Palm AI</span>
            </div>
            
            {/* Spacer for centering logo */}
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={toggleCollapsed}
        isMobile={isMobile}
        isOpen={isMobileOpen}
        onClose={closeMobile}
        user={user ? { 
          name: user.user_metadata?.full_name || user.email || 'User',
          email: user.email || 'user@example.com'
        } : undefined}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className={`
        transition-all duration-300 ease-in-out flex-1 lg:h-screen lg:flex lg:flex-col
        ${isMobile 
          ? 'lg:ml-64' 
          : isCollapsed 
            ? 'ml-16' 
            : 'ml-64'
        }
      `}>
        <div className="h-full lg:flex-1 lg:overflow-auto">
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}