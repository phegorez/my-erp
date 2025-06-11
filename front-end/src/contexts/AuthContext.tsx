"use client";

import { fetchMyProfile, logoutUser } from "@/services/api";
import { AuthUser } from "@/types";
import { useRouter } from "next/navigation";
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

  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async () => {
    await checkAuth();
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch { }
    setUser(null);
    setIsAuthenticated(false);
  };

  const checkAuth = async () => {
    try {
      const res = await fetchMyProfile();
      if (res.ok) {
        setUser(res.data);
        setIsAuthenticated(true);
        return true
      } else {
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      router.push('/auth/login'); // Redirect to login if not authenticated
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
