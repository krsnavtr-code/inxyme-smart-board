"use client";

import React, { useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import AuthForm from "./AuthForm";
import { RoleType } from "@/types/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: RoleType;
  defaultMode?: "login" | "register";
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultRole = "STUDENT",
  defaultMode = "login"
}: AuthModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Inxyme Security Authentication
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Role-Based LMS Access
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log in or create your account to unlock synchronous learning features
          </p>
        </div>

        {/* Reusable Form */}
        <AuthForm
          defaultRole={defaultRole}
          defaultMode={defaultMode}
          onSuccess={onClose}
        />
      </div>
    </div>
  );
}
