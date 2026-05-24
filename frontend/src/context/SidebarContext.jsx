import { createContext, useContext, useState, useCallback } from 'react';

const SidebarContext = createContext({ items: [], setItems: () => {} });

export function SidebarProvider({ children }) {
  const [items, setItems] = useState([]);
  return (
    <SidebarContext.Provider value={{ items, setItems }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarItems() {
  return useContext(SidebarContext);
}
