"use client";

import React, { useState } from "react";
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
import AuthModal from "@/components/auth/AuthModal";

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

  // 1. Loading State Skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-lg animate-ping" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Verifying LMS Security Credentials...</p>
        <p className="text-xs text-slate-500 mt-1">Connecting to Inxyme Security Vault</p>
      </div>
    );
  }

  // 2. Unauthenticated Interceptor
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 relative overflow-hidden font-sans">
        {/* Glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-5 text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">Authentication Required</h2>
          <p className="text-sm text-slate-400 mt-2">
            You must be signed in as a <span className="text-indigo-400 font-semibold">Teacher</span> or{" "}
            <span className="text-emerald-400 font-semibold">Student</span> to access this interactive classroom smart board.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Your Account</span>
            </button>

            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 text-slate-400 hover:text-white border border-slate-800 text-xs font-medium flex items-center justify-center gap-2 transition-colors block"
            >
              <span>Return to LMS Home Portal</span>
            </Link>
          </div>

          {/* Quick Demo Instant Bypass */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">
              Or Fast Demo Sign In
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={switching}
                onClick={async () => {
                  setSwitching(true);
                  await switchDemoRole("INSTRUCTOR");
                  setSwitching(false);
                }}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-left transition-all text-xs font-medium text-slate-300 hover:text-indigo-300 flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="truncate">As Teacher</span>
              </button>

              <button
                disabled={switching}
                onClick={async () => {
                  setSwitching(true);
                  await switchDemoRole("STUDENT");
                  setSwitching(false);
                }}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition-all text-xs font-medium text-slate-300 hover:text-emerald-300 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">As Student</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  // 3. Role Authorization Guard (if specific roles are required)
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
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
              href="/"
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Back to Home
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
