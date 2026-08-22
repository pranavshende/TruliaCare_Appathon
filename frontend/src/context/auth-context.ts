import { createContext } from 'react';

export type User = {
  id: string;
  email: string;
  name?: string;
  role: string;
} | null;

export interface AuthContextType {
  user: User;
  setUser: (user: User) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
  token: string | null;
  setToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  logout: async () => {},
  token: null,
  setToken: () => {},
});
