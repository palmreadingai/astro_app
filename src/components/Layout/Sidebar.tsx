import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Hand, 
  Stars, 
  MessageCircle, 
  Calendar,
  FileText,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Crown,
  ThumbsUp
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name?: string;
    email?: string;
  };
  onLogout: () => void;
}

export default function Sidebar({ isCollapsed, onToggle, isMobile, isOpen, onClose, user, onLogout }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasPaid = useAppStore((state) => state.hasPaid);
  
  const navItems = [
    { to: '/home', icon: Home, label: 'Home', isActive: true },
    { to: '/palm', icon: Hand, label: 'Palm Reading', isActive: true },
    { to: '/chat', icon: MessageCircle, label: 'Chat', isActive: true },
    { to: '/horoscope', icon: Calendar, label: 'Daily Horoscope', isActive: false },
    { to: '/kundli', icon: FileText, label: 'Kundli Analysis', isActive: false },
    { 
      to: '/pricing', 
      icon: Crown, 
      label: hasPaid ? 'My Plan' : 'Pricing', 
      isActive: true 
    },
    { to: '/feedback', icon: ThumbsUp, label: 'Feedback', isActive: true },
  ];

  const handleMenuClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  // Mobile Sidebar (Overlay)
  if (isMobile) {
    return (
      <>
        {/* Mobile Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div className={`
          mobile-full-height fixed top-0 left-0 w-64 bg-gradient-to-b from-indigo-950 to-purple-900 shadow-lg z-[60] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <img src="/logo.webp" alt="Palm AI Logo" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-bold text-white">Palm AI</span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md transition-colors">
              <X size={20} className="text-white" />
            </button>
          </div>
          
          {/* Mobile Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto min-h-0">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                
                return (
                  <li key={item.to}>
                    {item.isActive ? (
                      <Link
                        to={item.to}
                        onClick={handleMenuClick}
                        className={`
                          flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors text-sm font-medium
                          ${isActive
                            ? 'bg-yellow-400/20 text-yellow-300 border-l-4 border-yellow-400' 
                            : 'text-white hover:bg-white/10'
                          }
                        `}
                      >
                        <Icon size={20} />
                        <div className="flex items-center justify-between flex-1">
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-400 opacity-60 cursor-not-allowed">
                        <Icon size={20} />
                        <div className="flex items-center justify-between flex-1">
                          <span>{item.label}</span>
                          <span className="text-xs bg-yellow-400/30 text-yellow-200 px-2 py-1 rounded-full ml-2 font-medium">
                            Soon
                          </span>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile User Profile Footer */}
          <div className="border-t border-white/20 p-4 flex-shrink-0">
            <button
              onClick={() => {
                navigate('/profile');
                handleMenuClick();
              }}
              className="flex items-center space-x-3 mb-3 w-full p-2 rounded-md hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-purple-200 truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-purple-200 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className={`
      hidden lg:flex flex-col bg-gradient-to-b from-indigo-950 to-purple-900 border-r border-white/20 transition-all duration-300 ease-in-out h-screen fixed left-0 top-0 overflow-hidden z-[60]
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Desktop Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20 h-16 flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <img src="/logo.webp" alt="Palm AI Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold text-white">Palm AI</span>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-2 hover:bg-white/10 rounded-md transition-colors flex-shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} className="text-white" /> : <ChevronLeft size={18} className="text-white" />}
        </button>
      </div>

      {/* Desktop Navigation */}
      <nav className="flex-1 p-4 min-h-0">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            
            return (
              <li key={item.to} className="relative group">
                {item.isActive ? (
                  <Link
                    to={item.to}
                    className={`
                      flex items-center px-3 py-3 rounded-lg transition-colors text-sm font-medium w-full
                      ${isCollapsed ? 'justify-center' : 'space-x-3'}
                      ${isActive
                        ? 'bg-yellow-400/20 text-yellow-300' 
                        : 'text-white hover:bg-white/10'
                      }
                    `}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="truncate">{item.label}</span>
                      </div>
                    )}
                    
                    {/* Active indicator for collapsed state */}
                    {isActive && isCollapsed && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-yellow-400 rounded-l"></div>
                    )}
                  </Link>
                ) : (
                  <div className={`
                    flex items-center px-3 py-3 rounded-lg text-sm font-medium w-full cursor-not-allowed text-gray-400
                    ${isCollapsed ? 'justify-center' : 'space-x-3'}
                  `}>
                    <Icon size={20} className="flex-shrink-0" />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="truncate">{item.label}</span>
                        <span className="text-xs bg-yellow-400/30 text-yellow-200 px-2 py-1 rounded-full ml-2 flex-shrink-0 font-medium">
                          Soon
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="
                    absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-md
                    opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                    whitespace-nowrap z-10 top-1/2 transform -translate-y-1/2
                  ">
                    {item.label}{!item.isActive ? ' (Coming Soon)' : ''}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop User Profile Footer */}
      <div className="border-t border-white/20 p-4 flex-shrink-0">
        {isCollapsed ? (
          <div className="relative group">
            <button
              onClick={() => navigate('/profile')}
              className="flex justify-center mb-3 w-full p-2 rounded-md hover:bg-white/10 transition-colors"
              title="Profile"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-white" />
              </div>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex justify-center p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
            
            {/* Tooltip for collapsed state */}
            <div className="
              absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-md
              opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
              whitespace-nowrap z-10 bottom-4
            ">
              {user?.name || 'User'} • Profile
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-3 mb-3 w-full p-2 rounded-md hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-purple-200 truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-purple-200 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <LogOut size={16} className="flex-shrink-0" />
              <span className="truncate">Logout</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}