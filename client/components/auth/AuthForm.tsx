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
  Sparkles,
  LogIn,
  UserPlus,
  Laptop
} from "lucide-react";

interface AuthFormProps {
  onSuccess?: () => void;
  defaultRole?: RoleType;
  defaultMode?: "login" | "register";
}

const DEMO_ACCOUNTS: Record<"INSTRUCTOR" | "STUDENT", DemoAccount[]> = {
  INSTRUCTOR: [
    {
      name: "Prof. Ramesh Sharma",
      email: "ramesh.sharma@inxyme.com",
      role: "INSTRUCTOR",
      headline: "Lead Faculty & LMS Architect",
      tag: "Computer Science"
    },
    {
      name: "Dr. Priya Nair",
      email: "priya.nair@inxyme.com",
      role: "INSTRUCTOR",
      headline: "Professor of Mathematics & Calculus",
      tag: "Mathematics"
    }
  ],
  STUDENT: [
    {
      name: "Aarav Patel",
      email: "aarav.patel@student.inxyme.com",
      role: "STUDENT",
      headline: "B.Tech CS - Year 3",
      tag: "Section A"
    },
    {
      name: "Diya Deshmukh",
      email: "diya.deshmukh@student.inxyme.com",
      role: "STUDENT",
      headline: "B.Tech CS - Section A",
      tag: "Section A"
    }
  ]
};

export default function AuthForm({
  onSuccess,
  defaultRole = "STUDENT",
  defaultMode = "login"
}: AuthFormProps) {
  const router = useRouter();
  const { login, register, isLoading } = useAuth();

  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [role, setRole] = useState<RoleType>(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [headline, setHeadline] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSelectDemo = (acc: DemoAccount) => {
    setRole(acc.role);
    setName(acc.name);
    setEmail(acc.email);
    setPassword("demo123");
    setHeadline(acc.headline);
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
        const user = await login({
          email: email.trim().toLowerCase(),
          password: password.trim() || undefined,
          role
        });
        setSuccessMsg(`Welcome back, ${user.name}!`);
      } else {
        const user = await register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim() || undefined,
          role,
          headline: headline.trim() || undefined
        });
        setSuccessMsg(`Account created for ${user.name}!`);
      }

      if (onSuccess) {
        setTimeout(onSuccess, 600);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed.";
      setErrorMsg(message);
    }
  };

  return (
    <div className="w-full">
      {/* Role Picker (Student vs Teacher) */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          type="button"
          onClick={() => {
            setRole("STUDENT");
            setErrorMsg(null);
          }}
          className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center ${
            role === "STUDENT"
              ? "bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-600/20 text-white"
              : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-transform ${
              role === "STUDENT"
                ? "bg-indigo-600 text-white scale-105 shadow-md shadow-indigo-600/40"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs">Student</span>
          <span className="text-[10px] text-slate-400">Enrolled Learner</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRole("INSTRUCTOR");
            setErrorMsg(null);
          }}
          className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center ${
            role === "INSTRUCTOR"
              ? "bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-600/20 text-white"
              : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-transform ${
              role === "INSTRUCTOR"
                ? "bg-indigo-600 text-white scale-105 shadow-md shadow-indigo-600/40"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs">Teacher / Faculty</span>
          <span className="text-[10px] text-slate-400">Host & Broadcast</span>
        </button>
      </div>

      {/* Mode Switch (Sign In vs Register) */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-5">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setErrorMsg(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
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
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
            mode === "register"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Create Account</span>
        </button>
      </div>

      {/* Fast Demo Accounts */}
      <div className="mb-5 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Laptop className="w-3 h-3 text-indigo-400" />
          Quick 1-Click Demo Profiles ({role === "INSTRUCTOR" ? "Teacher" : "Student"})
        </span>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS[role === "INSTRUCTOR" ? "INSTRUCTOR" : "STUDENT"].map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => handleSelectDemo(acc)}
              className="text-left p-2 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-300 truncate">
                  {acc.name}
                </span>
                <span className="text-[9px] font-medium px-1 rounded bg-slate-800 text-slate-400">
                  {acc.tag}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{acc.email}</p>
            </button>
          ))}
        </div>
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
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === "register" && (
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === "INSTRUCTOR" ? "e.g. Prof. Arvind Kumar" : "e.g. Rohan Sharma"}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                required={mode === "register"}
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === "INSTRUCTOR" ? "faculty@inxyme.com" : "student@inxyme.com"}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-300">Password</label>
            {mode === "login" && (
              <span className="text-[10px] text-slate-500">(Optional for demo)</span>
            )}
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {mode === "register" && (
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              {role === "INSTRUCTOR" ? "Department / Designation" : "Branch / Year"}
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold text-xs shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>
                {mode === "login"
                  ? `Sign In as ${role === "INSTRUCTOR" ? "Teacher" : "Student"}`
                  : `Create ${role === "INSTRUCTOR" ? "Teacher" : "Student"} Account`}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
