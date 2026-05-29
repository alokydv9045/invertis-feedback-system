import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const handler = (e) => {
      setIsMobile(e.matches);
      setIsOpen(!e.matches); // Desktop: open, Mobile: closed
    };
    handler(mql);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);
  const toggleProfile = useCallback(() => setProfileOpen(prev => !prev), []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);

  return (
    <SidebarContext.Provider value={{
      isOpen, toggle, closeSidebar, isMobile,
      profileOpen, toggleProfile, closeProfile
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

// Keep backward compatibility
export function useSidebarItems() {
  return useContext(SidebarContext);
}
