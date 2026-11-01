"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { InxymeWebsiteUser } from "@/types/auth";
import {
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  LogIn,
  Search,
  Users,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface AuthFormProps {
  onSuccess?: (user?: any) => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Inxyme Website Users State
  const [inxymeUsers, setInxymeUsers] = useState<InxymeWebsiteUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<
    "all" | "teacher" | "student" | "admin"
  >("all");
  const [selectedUser, setSelectedUser] = useState<InxymeWebsiteUser | null>(null);

  // Fetch users from inxyme-website
  const fetchInxymeUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch("/api/auth/users");
      if (res.ok) {
        const data = await res.json();
        const list = data.users || (Array.isArray(data) ? data : []);
        setInxymeUsers(list);
      }
    } catch (err) {
      console.error("Error loading inxyme-website users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchInxymeUsers();
  }, []);

  // Filter inxyme users
  const filteredUsers = useMemo(() => {
    return inxymeUsers.filter((u) => {
      // Search
      if (userSearchTerm.trim()) {
        const query = userSearchTerm.toLowerCase().trim();
        const nameMatch = u.fullname?.toLowerCase().includes(query);
        const emailMatch = u.email?.toLowerCase().includes(query);
        if (!nameMatch && !emailMatch) return false;
      }
      // Role
      if (selectedRoleFilter !== "all") {
        const r = String(u.role || "").toLowerCase();
        if (r !== selectedRoleFilter) return false;
      }
      return true;
    });
  }, [inxymeUsers, userSearchTerm, selectedRoleFilter]);

  const handleSelectUser = (u: InxymeWebsiteUser) => {
    setSelectedUser(u);
    setEmail(u.email);
    setPassword("");
    setErrorMsg(null);
    setSuccessMsg(null);

    const rawRole = String(u.role || "").toLowerCase();
    const isTeacherOrAdmin =
      rawRole === "teacher" || rawRole === "instructor" || rawRole === "admin";

    // Check Role
    if (!isTeacherOrAdmin) {
      setErrorMsg(
        `Notice: ${u.fullname} has role 'Student'. The student learn-board is temporarily offline. Only Teachers can log in to open the Teacher Panel.`
      );
      return;
    }

    // Check Status
    if (u.isActive === false) {
      setErrorMsg(
        `Access Denied: ${u.fullname} is currently Inactive (Status: Inactive). Account must be activated in Inxyme Admin to log in.`
      );
      return;
    }

    // Check LMS Status
    if (u.isApproved === false || !u.isApproved) {
      setErrorMsg(
        `Access Denied: ${u.fullname} has LMS Status: Not Approved. Account must be approved for LMS in Users Management before logging in.`
      );
      return;
    }

    setSuccessMsg(
      `Selected Faculty: ${u.fullname} (${u.role}). Click 'Open Teacher Panel' or enter password to sign in.`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg("Email address is required.");
      return;
    }

    try {
      // Pre-check against fetched inxyme users if available for instant validation
      const matched = inxymeUsers.find(
        (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
      );

      if (matched) {
        if (matched.isActive === false) {
          setErrorMsg(
            "Access Denied: Your account has been deactivated (Status: Inactive). Please contact the administrator."
          );
          return;
        }

        if (matched.isApproved === false || !matched.isApproved) {
          setErrorMsg(
            "Access Denied: Your LMS access has not been approved yet. Please contact your administrator."
          );
          return;
        }
      }

      const user = await login({
        email: email.trim().toLowerCase(),
        password: password.trim() || undefined,
      });

      const isStudent =
        user.role === "STUDENT" ||
        user.role === "student" ||
        user.originalRole === "student";

      setSuccessMsg(
        `Welcome back, ${user.name}! ${isStudent ? "Opening Learning Board..." : "Opening Faculty Panel..."}`
      );

      if (onSuccess) {
        setTimeout(() => onSuccess(user), 400);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Authentication failed.";
      setErrorMsg(message);
    }
  };

  return (
    <div className="w-full">
      {/* Messages */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{successMsg}</div>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            LMS Account Email <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@inxyme.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Password
            </label>
            <span className="text-[10px] text-slate-500">
              (Inxyme Account Password)
            </span>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Selected User Info Banner */}
        {selectedUser && (
          <div className="p-3 bg-slate-950/80 rounded-xl border border-indigo-500/30 flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="text-xs font-bold text-slate-200 block truncate">
                {selectedUser.fullname}
              </span>
              <span className="text-[10px] text-slate-400 truncate block">
                {selectedUser.email}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${selectedUser.role === "teacher"
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    : selectedUser.role === "admin"
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                  }`}
              >
                {selectedUser.role}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${selectedUser.isApproved
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
              >
                {selectedUser.isApproved ? "LMS Approved" : "LMS Pending"}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold text-xs shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5" />
              <span>{selectedUser?.role === "student" ? "Sign In as Student" : "Sign In to LMS Portal"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
