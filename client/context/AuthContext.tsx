"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, RoleType, LoginCredentials, RegisterCredentials, AuthResponse } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: RoleType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInstructor: boolean;
  isStudent: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  switchDemoRole: (targetRole: RoleType) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5007";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("inxyme_token");
      const storedUser = localStorage.getItem("inxyme_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Failed to restore auth session:", err);
      localStorage.removeItem("inxyme_token");
      localStorage.removeItem("inxyme_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      let res: Response;
      try {
        res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials)
        });
      } catch {
        res = await fetch(`${SERVER_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials)
        });
      }

      const data: AuthResponse = await res.json();
      if (!res.ok || !data.success || !data.user || !data.token) {
        throw new Error(data.message || "Login failed. Please verify your credentials.");
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("inxyme_token", data.token);
      localStorage.setItem("inxyme_user", JSON.stringify(data.user));

      return data.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });

      const data: AuthResponse = await res.json();
      if (!res.ok || !data.success || !data.user || !data.token) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("inxyme_token", data.token);
      localStorage.setItem("inxyme_user", JSON.stringify(data.user));

      return data.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("inxyme_token");
    localStorage.removeItem("inxyme_user");
  }, []);

  const updateUser = useCallback((updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      try {
        localStorage.setItem("inxyme_user", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to update stored user:", err);
      }
      return updated;
    });
  }, []);

  const switchDemoRole = useCallback(async (targetRole: RoleType): Promise<User> => {
    const demoEmail =
      targetRole === "INSTRUCTOR"
        ? "ramesh.sharma@inxyme.com"
        : "aarav.patel@student.inxyme.com";

    return login({ email: demoEmail, role: targetRole });
  }, [login]);

  const value: AuthContextType = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!user && !!token,
    isLoading,
    isInstructor:
      user?.role === "INSTRUCTOR" ||
      user?.role === "ADMIN" ||
      user?.role === "teacher" ||
      user?.role === "admin",
    isStudent: user?.role === "STUDENT" || user?.role === "student",
    login,
    register,
    logout,
    updateUser,
    switchDemoRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
