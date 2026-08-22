import { useState, useEffect, type ReactNode } from 'react';
import { apiFetch, setAuthToken, getAuthToken, onUnauthorized } from '../services/api';
import { AuthContext, type User } from './auth-context';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  const setToken = (newToken: string | null) => {
    setAuthToken(newToken);
    setTokenState(newToken);
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const currentToken = getAuthToken();
      if (!currentToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await apiFetch('/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.isAuthenticated) {
            setUser(data.user);
          } else {
            setToken(null);
          }
        } else {
          setToken(null);
        }
      } catch (err) {
        console.error(err);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    // A background request (e.g. a dashboard poll) can hit a 401 after the
    // token expires. Clear the signed-in user here so ProtectedRoute drops
    // back to /login instead of leaving a stale session on screen.
    const unsubscribe = onUnauthorized(() => setUser(null));
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
