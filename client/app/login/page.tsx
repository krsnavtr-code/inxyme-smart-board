"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { Sparkles, ArrowLeft, Radio, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/live/learn-bord";
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, redirectUrl, router]);

  return (
    <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Inxyme Security Gateway
        </span>
      </div>

      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/30 text-white font-black text-xl">
          IX
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Sign In to Inxyme LMS</h1>
        <p className="text-xs text-slate-400 mt-1">
          Access high-concurrency smart boards and synchronous lecture sessions
        </p>
      </div>

      <AuthForm
        onSuccess={() => {
          router.push(redirectUrl);
        }}
      />
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
