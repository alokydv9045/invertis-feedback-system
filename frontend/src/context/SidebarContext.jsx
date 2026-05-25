import { createContext, useContext, useState, useCallback } from 'react';

const SidebarContext = createContext({
  items: [],
  setItems: () => {},
  isOpen: false,
  setIsOpen: () => {},
  toggle: () => {}
});

export function SidebarProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <SidebarContext.Provider value={{ items, setItems, isOpen, setIsOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarItems() {
  return useContext(SidebarContext);
}

