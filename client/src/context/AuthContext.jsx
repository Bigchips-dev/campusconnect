import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { getSocket } from '../lib/socket';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { setLoading(false); return; }
      const { data } = await api.get('/users/me');
      setUser(data.data);
    } catch {
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await api.get('/conversations/unread/count');
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();

      const socket = getSocket();
      socket.connect();
      socket.emit('join', user.id);

      const handleUnreadUpdate = ({ count }) => {
        setUnreadCount(count);
      };

      socket.on('unreadCountUpdate', handleUnreadUpdate);

      return () => {
        socket.off('unreadCountUpdate', handleUnreadUpdate);
        socket.disconnect();
      };
    } else {
      setUnreadCount(0);
    }
  }, [user, fetchUnreadCount]);

  const login = async (email, password, rememberMe = false) => {
    const { data } = await api.post('/auth/login', { email, password, rememberMe });
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
    return data.data;
  };

  const register = async ({ firstName, lastName, email, password, roles }) => {
    const { data } = await api.post('/auth/register', { firstName, lastName, email, password, roles });
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
    return data.data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const refreshUser = fetchUser;

  const isOnboarded = user?.onboardingComplete === true;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isOnboarded,
    unreadCount,
    setUnreadCount,
    fetchUnreadCount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
