import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    localStorage.removeItem('tlfq_theme');
  }, []);


  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('tlfq_platform_session');
      if (!token || token === 'null' || token === 'undefined' || token.length < 10) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async ({ identifier, password }) => {
    const res = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('tlfq_platform_session', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  function logout() {
    localStorage.removeItem('tlfq_platform_session');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
