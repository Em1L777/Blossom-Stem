// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { axiosClient } from '../api/axiosClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  register: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('blossom_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('blossom_token');
      if (storedToken) {
        try {
          const response = await axiosClient.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.data);
            setToken(storedToken);
          }
        } catch {
          // В случае ошибки (401/403) очищаем просроченную сессию
          localStorage.removeItem('blossom_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('blossom_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const register = (newToken: string, newUser: User) => {
    login(newToken, newUser);
  };

  const logout = () => {
    localStorage.removeItem('blossom_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};