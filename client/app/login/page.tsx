"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get("redirect");
  const { isAuthenticated, user } = useAuth();

  // If already authenticated, redirect based on role
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (explicitRedirect) {
        router.push(explicitRedirect);
      } else if (user.role === "INSTRUCTOR" || user.role === "ADMIN") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/live/learn-bord");
      }
    }
  }, [isAuthenticated, user, explicitRedirect, router]);

  const handleAuthSuccess = () => {
    if (explicitRedirect) {
      router.push(explicitRedirect);
      return;
    }

    try {
      const stored = localStorage.getItem("inxyme_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role === "INSTRUCTOR" || u.role === "ADMIN") {
          router.push("/teacher/dashboard");
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    router.push("/live/learn-bord");
  };

  return (
    <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Inxyme Educational Suite</span>
        </div>

        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Inxyme Security Gateway
        </span>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-center justify-center mx-auto mb-4">
          <img
            src="https://www.inxyme.com/api/upload/file/Inxyme-png-logo-2232.png"
            alt="Inxyme Logo"
            className="h-10 sm:h-12 w-auto object-contain filter drop-shadow-[0_4px_12px_rgba(79,70,229,0.25)]"
          />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Sign In to Smart Learning</h1>
        <p className="text-xs text-slate-400 mt-1">
          Access high-concurrency smart boards and synchronous lecture sessions
        </p>
      </div>

      <AuthForm onSuccess={handleAuthSuccess} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 selection:bg-indigo-600 selection:text-white relative overflow-hidden font-sans">
      {/* Glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="flex-1 flex items-center justify-center py-10 z-10">
        <Suspense
          fallback={
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
              Loading security portal...
            </div>
          }
        >
          <LoginContent />
        </Suspense>
      </div>

      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
        <span>&copy; 2026 Inxyme LMS</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Encrypted Authentication
        </span>
      </footer>
    </main>
  );
}
