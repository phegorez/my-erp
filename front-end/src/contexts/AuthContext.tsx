"use client";

import { fetchMyProfile } from "@/services/api";
import { AuthUser } from "@/types";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>; // แก้ไขให้ใช้ server-side cookie
  logout: () => Promise<void>;
  hasRole: (roleOrRoles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const res = await fetchMyProfile();

        if (!res) throw new Error("Not authenticated");

        const data = res.data
        setUser(data);
        setIsAuthenticated(true);
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await checkAuth();
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch { }
    setUser(null);
    setIsAuthenticated(false);
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const res = await fetchMyProfile();

      if (!res) throw new Error("Not authenticated");

      setUser(res);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (roleOrRoles: string | string[]) => {
    if (!user?.UserRole) return false;
    const roles = user.UserRole.map((item) => item.role.role_name.toLowerCase());
    if (Array.isArray(roleOrRoles)) {
      return roleOrRoles.some((r) => roles.includes(r.toLowerCase()));
    }
    return roles.includes(roleOrRoles.toLowerCase());
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
