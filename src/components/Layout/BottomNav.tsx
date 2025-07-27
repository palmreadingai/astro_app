import React from 'react';
import { Home, Hand, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home', isActive: true },
    { path: '/palm', icon: Hand, label: 'Palm', isActive: true },
    { path: '/chat', icon: MessageCircle, label: 'Chat', isActive: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-2">
        {navItems.map(({ path, icon: Icon, label, isActive }) => (
          <button
            key={path}
            onClick={() => isActive ? navigate(path) : null}
            disabled={!isActive}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${
              location.pathname === path && isActive
                ? 'text-astro-primary bg-astro-primary/10'
                : isActive
                ? 'text-gray-500 hover:text-gray-700'
                : 'text-gray-400 opacity-60 cursor-not-allowed'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">
              {isActive ? label : 'Soon'}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}