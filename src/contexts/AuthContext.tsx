import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = apiService.getToken();
      if (token) {
        const response = await apiService.getCurrentUser();
        if (response.success) {
          setUser(response.data);
        } else {
          apiService.clearToken();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiService.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      if (response.success) {
        apiService.setToken(response.data.token);
        setUser({
          _id: response.data._id,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          profilePicture: response.data.profilePicture,
          fullName: `${response.data.firstName} ${response.data.lastName}`,
          followerCount: 0,
          followingCount: 0,
          connectionCount: 0,
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      const response = await apiService.register(userData);
      if (response.success) {
        apiService.setToken(response.data.token);
        setUser({
          _id: response.data._id,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          profilePicture: response.data.profilePicture,
          fullName: `${response.data.firstName} ${response.data.lastName}`,
          followerCount: 0,
          followingCount: 0,
          connectionCount: 0,
        });
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    apiService.clearToken();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 