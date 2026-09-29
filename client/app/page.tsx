"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/live/learn-bord");
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
      <div className="flex items-center justify-center mb-4">
        <img
          src="https://www.inxyme.com/api/upload/file/Inxyme-png-logo-2232.png"
          alt="Inxyme Logo"
          className="h-9 w-auto object-contain animate-pulse filter drop-shadow-[0_4px_12px_rgba(79,70,229,0.25)]"
        />
      </div>
      <p className="text-sm font-semibold text-slate-300">Inxyme LMS Security Gateway</p>
      <p className="text-xs text-slate-500 mt-1">Redirecting to login portal...</p>
    </div>
  );
}
