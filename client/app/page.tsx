"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  LogIn,
  UserPlus,
  LogOut,
  Radio,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Laptop
} from "lucide-react";

type RoleType = "STUDENT" | "INSTRUCTOR";
type AuthMode = "login" | "register";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  avatar?: string;
  headline?: string;
}

export default function AuthPage() {
  const router = useRouter();
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5007";

  // Auth State
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [selectedRole, setSelectedRole] = useState<RoleType>("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [headline, setHeadline] = useState("");
  const [roomCode, setRoomCode] = useState("INX-LIVE-401");

  // UI State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Load existing session on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("inxyme_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        if (parsed.role) setSelectedRole(parsed.role);
      }
    } catch (e) {
      console.error("Error reading stored user session:", e);
    }
  }, []);

  // Quick 1-Click Demo Profiles
  const demoAccounts = {
    INSTRUCTOR: [
      {
        name: "Prof. Ramesh Sharma",
        email: "ramesh.sharma@inxyme.com",
        headline: "Lead Faculty & LMS Architect",
        role: "INSTRUCTOR" as RoleType,
        tag: "Default Faculty"
      },
      {
        name: "Dr. Priya Nair",
        email: "priya.nair@inxyme.com",
        headline: "Professor of Mathematics & Calculus",
        role: "INSTRUCTOR" as RoleType,
        tag: "Mathematics"
      }
    ],
    STUDENT: [
      {
        name: "Aarav Patel",
        email: "aarav.patel@student.inxyme.com",
        headline: "B.Tech CS - Year 3",
        role: "STUDENT" as RoleType,
        tag: "Section A"
      },
      {
        name: "Diya Deshmukh",
        email: "diya.deshmukh@student.inxyme.com",
        headline: "B.Tech CS - Section A",
        role: "STUDENT" as RoleType,
        tag: "Section A"
      }
    ]
  };

  const handleSelectDemo = (acc: { name: string; email: string; headline: string; role: RoleType }) => {
    setSelectedRole(acc.role);
    setName(acc.name);
    setEmail(acc.email);
    setPassword("demo123");
    setHeadline(acc.headline);
    setErrorMsg(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (authMode === "register" && !name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim() || undefined,
        role: selectedRole,
        headline: headline.trim() || undefined
      };

      const res = await fetch(`${SERVER_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Authentication failed. Please check credentials.");
      }

      // Save token and user details to localStorage
      localStorage.setItem("inxyme_token", data.token);
      localStorage.setItem("inxyme_user", JSON.stringify(data.user));
      setCurrentUser(data.user);

      setSuccessMsg(`Welcome, ${data.user.name}! Redirecting to Live Smart Board...`);

      // Auto redirect to /live/learn-bord after successful auth
      setTimeout(() => {
        router.push("/live/learn-bord");
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to reach server gateway";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("inxyme_token");
    localStorage.removeItem("inxyme_user");
    setCurrentUser(null);
    setSuccessMsg("Logged out successfully.");
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-[28rem] h-[28rem] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 font-bold text-white text-base">
            IX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-lg tracking-tight">Inxyme</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                LMS & Smart Board
              </span>
            </div>
            <p className="text-[11px] text-slate-400">High-Concurrency Live Virtual Classroom</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-medium">Gateway: Active (Port 5007)</span>
          </div>

          <Link
            href="/live/learn-bord"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-all hover:border-slate-500"
          >
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Live Classroom</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 z-10">
        <div className="w-full max-w-xl">
          {/* Active Session Card (If User Already Authenticated) */}
          {currentUser ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <ShieldCheck className="w-36 h-36 text-indigo-400" />
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 shadow-xl shadow-indigo-600/30">
                  <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center font-bold text-2xl text-white">
                    {currentUser.name ? currentUser.name.charAt(0) : "U"}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        currentUser.role === "INSTRUCTOR"
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {currentUser.role === "INSTRUCTOR" ? "Teacher / Faculty" : "Student Learner"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{currentUser.email}</p>
                  <p className="text-xs text-indigo-300 mt-0.5">{currentUser.headline || "Active Member"}</p>
                </div>
              </div>

              {/* Quick Launch Room Section */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 mb-6">
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Target Classroom Room Code
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold tracking-wider text-white focus:outline-none focus:border-indigo-500"
                    placeholder="INX-LIVE-401"
                  />
                  <Link
                    href={`/live/learn-bord?room=${roomCode}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                  >
                    <span>Launch Board</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Role: {currentUser.role === "INSTRUCTOR" ? "Instructor Privileges (Draw & Broadcast)" : "Student Mode (Real-Time Canvas & Doubt Raise)"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors py-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out / Switch Account</span>
                </button>

                <Link
                  href="/live/learn-bord"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                >
                  Direct Smart Board Link (/live/learn-bord)
                </Link>
              </div>
            </div>
          ) : (
            /* Auth Login / Register Card */
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              {/* Header Title */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  Role-Based Authentication
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome to Inxyme LMS
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Choose your role to access synchronized classroom smart boards
                </p>
              </div>

              {/* Role Selection Tabs */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Student Option */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("STUDENT")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center ${
                    selectedRole === "STUDENT"
                      ? "bg-indigo-600/15 border-indigo-500 shadow-lg shadow-indigo-600/20 text-white"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 transition-transform ${
                      selectedRole === "STUDENT" ? "bg-indigo-600 text-white scale-110 shadow-md shadow-indigo-600/40" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm">Student</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Enrolled Learner</span>
                </button>

                {/* Teacher / Instructor Option */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("INSTRUCTOR")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center ${
                    selectedRole === "INSTRUCTOR"
                      ? "bg-indigo-600/15 border-indigo-500 shadow-lg shadow-indigo-600/20 text-white"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 transition-transform ${
                      selectedRole === "INSTRUCTOR" ? "bg-indigo-600 text-white scale-110 shadow-md shadow-indigo-600/40" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm">Teacher / Faculty</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Host & Broadcast</span>
                </button>
              </div>

              {/* Login / Register Toggle */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                    authMode === "login"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                    authMode === "register"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Account</span>
                </button>
              </div>

              {/* Quick Demo Accounts Selection */}
              <div className="mb-6 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                    Quick 1-Click Demo Profiles ({selectedRole === "INSTRUCTOR" ? "Teacher" : "Student"})
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {demoAccounts[selectedRole].map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSelectDemo(acc)}
                      className="text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                          {acc.name}
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {acc.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{acc.email}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Alerts */}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {authMode === "register" && (
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={selectedRole === "INSTRUCTOR" ? "e.g. Prof. Arvind Kumar" : "e.g. Rohan Sharma"}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                        required={authMode === "register"}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={selectedRole === "INSTRUCTOR" ? "faculty@inxyme.com" : "student@inxyme.com"}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    {authMode === "login" && (
                      <span className="text-[11px] text-slate-500">(Optional for demo login)</span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {authMode === "register" && (
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">
                      {selectedRole === "INSTRUCTOR" ? "Department / Designation" : "Branch / Year"}
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder={selectedRole === "INSTRUCTOR" ? "e.g. Professor of Physics" : "e.g. Computer Science - Year 3"}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {authMode === "login"
                          ? `Sign In as ${selectedRole === "INSTRUCTOR" ? "Teacher" : "Student"}`
                          : `Create ${selectedRole === "INSTRUCTOR" ? "Teacher" : "Student"} Account`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Direct Link to live smart board */}
              <div className="mt-6 text-center pt-4 border-t border-slate-800/80">
                <Link
                  href="/live/learn-bord"
                  className="text-xs text-slate-400 hover:text-indigo-400 inline-flex items-center gap-1.5 transition-colors"
                >
                  <Radio className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Direct link to Live Smart Board (/live/learn-bord)</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <span>&copy; 2026 Inxyme LMS. Real-Time Educational Technology Platform.</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            JWT Role Protected
          </span>
          <span className="flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            100-Concurrent Nodes Room
          </span>
        </div>
      </footer>
    </main>
  );
}
