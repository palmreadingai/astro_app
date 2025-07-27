import { useState, useEffect } from 'react';

interface UseSidebarOptions {
  onShortcutUsed?: (message: string) => void;
}

export function useSidebar(options?: UseSidebarOptions) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Auto-close mobile sidebar when switching to desktop
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save sidebar state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const openMobile = () => setIsMobileOpen(true);
  const closeMobile = () => setIsMobileOpen(false);

  // Keyboard shortcut for toggling sidebar (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        if (!isMobile) {
          toggleCollapsed();
          options?.onShortcutUsed?.('Sidebar toggled (Ctrl+B)');
        } else {
          setIsMobileOpen(prev => !prev);
          options?.onShortcutUsed?.('Mobile sidebar toggled (Ctrl+B)');
        }
      }
      
      // ESC key to close mobile sidebar
      if (event.key === 'Escape' && isMobile && isMobileOpen) {
        setIsMobileOpen(false);
        options?.onShortcutUsed?.('Sidebar closed (ESC)');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isCollapsed, isMobileOpen, options]);

  return {
    isCollapsed,
    isMobileOpen,
    isMobile,
    toggleCollapsed,
    openMobile,
    closeMobile
  };
}