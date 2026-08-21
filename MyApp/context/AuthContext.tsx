import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch, setAuthToken, getAuthToken } from '../services/api';

type User = {
  id: string;
  email: string;
  name?: string;
  role: string;
} | null;

interface AuthContextType {
  user: User;
  setUser: (user: User) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
  token: string | null;
  setToken: (token: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  logout: async () => {},
  token: null,
  setToken: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setToken = async (newToken: string | null) => {
    await setAuthToken(newToken);
    setTokenState(newToken);
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      await setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const currentToken = await getAuthToken();
      if (!currentToken) {
        setIsLoading(false);
        return;
      }
      setTokenState(currentToken);

      try {
        const res = await apiFetch('/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.isAuthenticated) {
            setUser(data.user);
          } else {
            await setToken(null);
          }
        } else {
          await setToken(null);
        }
      } catch (err) {
        console.error(err);
        await setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
