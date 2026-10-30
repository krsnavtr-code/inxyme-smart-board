"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RoleType } from "@/types/auth";
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  Sparkles,
  GraduationCap,
  BookOpen,
  LogIn
} from "lucide-react";
import AuthModal from "./AuthModal";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleType[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login"
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, switchDemoRole } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Auto redirect to /login if unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      router.replace(`${redirectTo}${currentPath ? `?redirect=${encodeURIComponent(currentPath)}` : ""}`);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  // 1. Loading State Skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="flex items-center justify-center mb-5">
          <img
            src="https://www.inxyme.com/api/upload/file/Inxyme-png-logo-2232.png"
            alt="Inxyme Logo"
            className="h-10 w-auto object-contain animate-pulse filter drop-shadow-[0_4px_12px_rgba(79,70,229,0.25)]"
          />
        </div>
        <p className="text-sm font-semibold text-slate-300">Verifying LMS Security Credentials...</p>
        <p className="text-xs text-slate-500 mt-1">Connecting to Inxyme Security Vault</p>
      </div>
    );
  }

  // 2. Unauthenticated Interceptor (Fallback while redirecting)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center">
          <div className="flex items-center justify-center mx-auto mb-4">
            <img
              src="https://www.inxyme.com/api/upload/file/Inxyme-png-logo-2232.png"
              alt="Inxyme Logo"
              className="h-9 w-auto object-contain filter drop-shadow-[0_4px_12px_rgba(79,70,229,0.2)]"
            />
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">Authentication Required</h2>
          <p className="text-sm text-slate-400 mt-2">
            Please sign in as a <span className="text-indigo-400 font-semibold">Teacher</span> or{" "}
            <span className="text-purple-400 font-semibold">Faculty Admin</span> to access the Teacher Panel.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href="/login"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] block"
            >
              <LogIn className="w-4 h-4" />
              <span>Go to Teacher Login</span>
            </Link>
          </div>
        </div>

        {/* Modal */}
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  // 3. Role Authorization Guard (if specific roles are required)
  const isRoleAllowed = () => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    const current = String(user.role || "").toUpperCase();
    return allowedRoles.some((r) => {
      const target = String(r).toUpperCase();
      if (current === target) return true;
      if (
        (target === "INSTRUCTOR" || target === "ADMIN" || target === "TEACHER") &&
        (current === "TEACHER" || current === "ADMIN" || current === "INSTRUCTOR")
      ) {
        return true;
      }
      if (target === "STUDENT" && current === "STUDENT") {
        return true;
      }
      return false;
    });
  };

  if (!isRoleAllowed()) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5 text-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white">Role Permission Notice</h2>
          <p className="text-sm text-slate-400 mt-2">
            Your account role is <span className="text-amber-400 font-semibold">{user.role}</span>. This specific section requires{" "}
            <span className="text-indigo-400 font-semibold">{allowedRoles.join(" or ")}</span> privileges.
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Switch to an Authorized Role
            </button>
            <Link
              href="/login"
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  // 4. Authorized: Render content
  return <>{children}</>;
}
