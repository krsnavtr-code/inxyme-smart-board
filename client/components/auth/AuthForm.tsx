"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RoleType, DemoAccount } from "@/types/auth";
import {
  GraduationCap,
  BookOpen,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  LogIn,
  UserPlus,
  Laptop,
  ChevronDown
} from "lucide-react";

interface AuthFormProps {
  onSuccess?: () => void;
  defaultRole?: RoleType;
  defaultMode?: "login" | "register";
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: "Prof. Ramesh Sharma",
    email: "ramesh.sharma@inxyme.com",
    role: "INSTRUCTOR",
    headline: "Lead Faculty & LMS Architect",
    tag: "Teacher Demo"
  },
  {
    name: "Aarav Patel",
    email: "aarav.patel@student.inxyme.com",
    role: "STUDENT",
    headline: "B.Tech CS - Year 3",
    tag: "Student Demo"
  },
  {
    name: "Dr. Priya Nair",
    email: "priya.nair@inxyme.com",
    role: "INSTRUCTOR",
    headline: "Professor of Mathematics",
    tag: "Teacher Demo"
  },
  {
    name: "Diya Deshmukh",
    email: "diya.deshmukh@student.inxyme.com",
    role: "STUDENT",
    headline: "B.Tech CS - Section A",
    tag: "Student Demo"
  }
];

export default function AuthForm({
  onSuccess,
  defaultRole = "STUDENT",
  defaultMode = "login"
}: AuthFormProps) {
  const router = useRouter();
  const { login, register, isLoading } = useAuth();

  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  // Role is only selected by dropdown on Create Account
  const [role, setRole] = useState<RoleType>(defaultRole);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [headline, setHeadline] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSelectDemo = (acc: DemoAccount) => {
    setEmail(acc.email);
    setPassword("demo123");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg("Email address is required.");
      return;
    }

    if (mode === "register" && !name.trim()) {
      setErrorMsg("Full name is required.");
      return;
    }

    try {
      if (mode === "login") {
        // In login, we do NOT ask user to choose role; backend identifies user role!
        const user = await login({
          email: email.trim().toLowerCase(),
          password: password.trim() || undefined
        });

        const roleLabel = user.role === "INSTRUCTOR" ? "Teacher / Faculty" : "Student";
        setSuccessMsg(`Welcome back, ${user.name} (${roleLabel})! Redirecting...`);
      } else {
        // In register, role comes from the dropdown selection
        const user = await register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim() || undefined,
          role,
          headline: headline.trim() || undefined
        });

        const roleLabel = user.role === "INSTRUCTOR" ? "Teacher" : "Student";
        setSuccessMsg(`Account created for ${user.name} as ${roleLabel}! Redirecting...`);
      }

      if (onSuccess) {
        setTimeout(onSuccess, 700);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed.";
      setErrorMsg(message);
    }
  };

  return (
    <div className="w-full">
      {/* Mode Switch (Sign In vs Create Account) */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            mode === "login"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("register");
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            mode === "register"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Create Account</span>
        </button>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* On Create Account: Select Role from Dropdown */}
        {mode === "register" && (
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Select Role <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RoleType)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none font-medium"
              >
                <option value="STUDENT">🎓 Student (Enrolled Learner)</option>
                <option value="INSTRUCTOR">👨‍🏫 Teacher / Faculty (Instructor)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {role === "INSTRUCTOR"
                ? "Teacher privileges: smart board drawing, broadcasting, and session control."
                : "Student privileges: live board viewing, doubt asking, and lecture notes access."}
            </p>
          </div>
        )}

        {/* Full Name for Register */}
        {mode === "register" && (
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === "INSTRUCTOR" ? "e.g. Prof. Arvind Kumar" : "e.g. Rohan Sharma"}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                required={mode === "register"}
              />
            </div>
          </div>
        )}

        {/* Email Address */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Email Address <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@inxyme.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            {mode === "login" && (
              <span className="text-[10px] text-slate-500">(Optional for demo)</span>
            )}
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

        {/* Designation / Branch (for Register) */}
        {mode === "register" && (
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              {role === "INSTRUCTOR" ? "Department & Designation" : "Branch & Year"}
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder={role === "INSTRUCTOR" ? "e.g. Professor of Physics" : "e.g. Computer Science - Year 3"}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold text-xs shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{mode === "login" ? "Sign In to LMS" : `Create ${role === "INSTRUCTOR" ? "Teacher" : "Student"} Account`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* 1-Click Fast Demo Credentials (In Login Mode) */}
      {mode === "login" && (
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
            <Laptop className="w-3 h-3 text-indigo-400" />
            Quick 1-Click Demo Profiles
          </span>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleSelectDemo(acc)}
                className="text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-300 truncate">
                    {acc.name}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      acc.role === "INSTRUCTOR"
                        ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {acc.role === "INSTRUCTOR" ? "Teacher" : "Student"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">{acc.email}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
