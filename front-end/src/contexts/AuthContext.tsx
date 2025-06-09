"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // Using jwt-decode to extract info from token

// Define the shape of the user object from the token
export interface AuthUser {
  id: string;
  email: string;
  roles: string[]; // e.g., ['user', 'admin', 'manager', 'pic']
  first_name?: string;
  last_name?: string;
  // Add other fields from your JWT payload as needed
  exp?: number; // Expiration time
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean; // To handle initial auth state loading
  login: (token: string) => void;
  logout: () => void;
  hasRole: (roleOrRoles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start as true

  useEffect(() => {
    // Try to load token from localStorage on initial load
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        const decodedUser = jwtDecode<AuthUser>(storedToken);
        // Check if token is expired
        if (decodedUser.exp && decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser);
          setIsAuthenticated(true);
        } else {
          // Token expired
          localStorage.removeItem('authToken');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error("Error processing stored token:", error);
      localStorage.removeItem('authToken'); // Clear invalid token
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (token: string) => {
    setIsLoading(true);
    try {
      const decodedUser = jwtDecode<AuthUser>(token);
      localStorage.setItem('authToken', token);
      setUser(decodedUser);
      setIsAuthenticated(true);
    } catch (error) {
        console.error("Failed to decode token on login:", error);
        // Potentially clear token and set user to null if decode fails
        localStorage.removeItem('authToken');
        setUser(null);
        setIsAuthenticated(false);
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
    // Optionally redirect to login page or home page
    // window.location.href = '/auth/login'; // Or use Next.js router if available here
  };

  const hasRole = (roleOrRoles: string | string[]): boolean => {
    if (!user || !user.roles) {
      return false;
    }
    if (Array.isArray(roleOrRoles)) {
      return roleOrRoles.some(role => user.roles.includes(role.toLowerCase()));
    }
    return user.roles.includes(roleOrRoles.toLowerCase());
  };


  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
