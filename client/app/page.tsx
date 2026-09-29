"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  LogIn,
  LogOut,
  Radio,
  Users,
  Layers,
  Activity,
  Download,
  Hand,
  MessageSquare,
  Clock,
  CheckCircle2,
  Tv,
  ChevronRight,
  Zap,
  Flame,
  LayoutGrid
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, switchDemoRole } = useAuth();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const [modalMode, setModalMode] = useState<"login" | "register">("login");
  const [roomCode, setRoomCode] = useState("INX-LIVE-401");

  const openAuth = (role: "STUDENT" | "INSTRUCTOR", mode: "login" | "register" = "login") => {
    setModalRole(role);
    setModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLaunchRoom = (asRole?: "STUDENT" | "INSTRUCTOR") => {
    if (!isAuthenticated) {
      openAuth(asRole || "STUDENT", "login");
      return;
    }
    router.push(`/live/learn-bord?room=${encodeURIComponent(roomCode)}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white font-sans relative overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-[32rem] h-[32rem] bg-indigo-600/15 rounded-full blur-[128px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-[28rem] h-[28rem] bg-emerald-500/10 rounded-full blur-[128px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/3 w-[36rem] h-[36rem] bg-violet-600/10 rounded-full blur-[128px] pointer-events-none -z-10" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 font-bold text-white text-base group-hover:scale-105 transition-transform">
              IX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">Inxyme</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Smart Board LMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">100-Student Synchronous Learning</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
            <Link href="/live/learn-bord" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
              <span>Live Classrooms</span>
            </Link>
            <a href="#features" className="hover:text-indigo-400 transition-colors">
              Platform Features
            </a>
            <a href="#rooms" className="hover:text-indigo-400 transition-colors">
              Active Sessions
            </a>
            <a href="#roles" className="hover:text-indigo-400 transition-colors">
              Role Comparison
            </a>
          </nav>
        </div>

        {/* User Account / Auth Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 pl-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center font-bold text-xs text-white shadow-md">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">{user.name}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        user.role === "INSTRUCTOR"
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {user.role === "INSTRUCTOR" ? "Teacher" : "Student"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{user.email}</p>
                </div>
              </div>

              <Link
                href="/live/learn-bord"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <Radio className="w-3 h-3 text-rose-300 animate-pulse" />
                <span className="hidden md:inline">Open Board</span>
              </Link>

              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuth("STUDENT", "login")}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuth("INSTRUCTOR", "register")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-16 sm:py-24 max-w-6xl mx-auto w-full text-center flex flex-col items-center">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-medium mb-6 shadow-xl backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-400">Live Gateway Connected</span>
          <span className="text-slate-700">•</span>
          <span className="text-indigo-400 font-semibold">100+ Concurrent Students</span>
          <span className="text-slate-700">•</span>
          <span className="text-emerald-400 font-semibold">Sub-15ms Latency</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-4xl">
          Next-Generation Smart Board for{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-indigo-300 to-emerald-400">
            Real-Time Classrooms
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          Inxyme empowers educators with synchronized vector whiteboards, live student doubt resolution,
          multi-layer grids, and instant lecture note distribution in one unified LMS workspace.
        </p>

        {/* Dual Role Quick-Action Gateway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-3xl text-left">
          {/* Teacher / Faculty Gateway */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 shadow-xl backdrop-blur-xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <GraduationCap className="w-24 h-24 text-indigo-400" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                INSTRUCTOR SUITE
              </span>
            </div>

            <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
              Teacher & Faculty Studio
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-5 leading-relaxed">
              Full drawing tools, student canvas lock control, doubt queue resolution, and lecture broadcasting.
            </p>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500 w-36"
                  placeholder="INX-LIVE-401"
                />
                <button
                  onClick={() => handleLaunchRoom("INSTRUCTOR")}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  <span>Host Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {!isAuthenticated && (
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>No login required for demo:</span>
                  <button
                    onClick={() => switchDemoRole("INSTRUCTOR")}
                    className="text-indigo-400 hover:underline font-semibold"
                  >
                    1-Click Demo Teacher
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Student Gateway */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 shadow-xl backdrop-blur-xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpen className="w-24 h-24 text-emerald-400" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                STUDENT DESK
              </span>
            </div>

            <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
              Student Classroom Portal
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-5 leading-relaxed">
              Synchronous smart board view, digital hand raise, instant doubt chat, and downloadable lecture notes.
            </p>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500 w-36"
                  placeholder="INX-LIVE-401"
                />
                <button
                  onClick={() => handleLaunchRoom("STUDENT")}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                >
                  <span>Join Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {!isAuthenticated && (
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Fast test as student:</span>
                  <button
                    onClick={() => switchDemoRole("STUDENT")}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    1-Click Demo Student
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Active Classroom Sessions Section */}
      <section id="rooms" className="px-6 py-12 max-w-6xl mx-auto w-full border-t border-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              Live & Scheduled Sessions
            </div>
            <h2 className="text-2xl font-bold text-white">Interactive Classrooms</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select an active room code or enter your custom classroom to start
            </p>
          </div>

          <Link
            href="/live/learn-bord"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <span>Launch Smart Board Direct Link (/live/learn-bord)</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Live Session 1 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  LIVE NOW
                </span>
                <span className="text-xs font-bold text-slate-300 font-mono">INX-LIVE-401</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold">
                <Users className="w-3.5 h-3.5" />
                <span>88 Students</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Concurrency & Real-Time Canvas Sync (100 Students Room)
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                Live interactive smart board derivation, sub-15ms vector broadcasting, and instructor doubt clearing.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                  RS
                </span>
                <span>Prof. Ramesh Sharma</span>
              </div>

              <Link
                href="/live/learn-bord?room=INX-LIVE-401"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
              >
                <span>Enter Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Upcoming Session 2 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                  SCHEDULED • 4:00 PM
                </span>
                <span className="text-xs font-bold text-slate-300 font-mono">INX-MATH-302</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Starts in 2h 15m</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Vector Calculus: Line Integrals & Stokes Theorem
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                Multi-page mathematical derivations on ruled & grid whiteboard backgrounds with real-time vector shapes.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-6 h-6 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  PN
                </span>
                <span>Dr. Priya Nair</span>
              </div>

              <Link
                href="/live/learn-bord?room=INX-MATH-302"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <span>Preview Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section id="features" className="px-6 py-16 max-w-6xl mx-auto w-full border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Engineering Excellence
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Architected for High-Concurrency Education
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Every layer from the canvas renderer to the WebSocket synchronization gateway was designed for scalable virtual classrooms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white mb-2">Sub-15ms Vector Sync</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Delta stroke broadcasting compresses canvas points into minimal binary payloads, allowing 100+ students to draw without lag.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Hand className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white mb-2">Doubt Resolution Queue</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Students tag questions as doubts or raise hands. Instructors can mark doubts resolved or spotlight individual students on canvas.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white mb-2">Instant PDF Notes Export</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Whiteboard pages are compiled into multi-page PDF lecture notes automatically at the end of each synchronous session.
            </p>
          </div>
        </div>
      </section>

      {/* Role Comparison Section */}
      <section id="roles" className="px-6 py-16 max-w-6xl mx-auto w-full border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-white">Role-Based Learning Environment</h2>
          <p className="text-xs text-slate-400 mt-1">
            Tailored experiences for both teachers broadcasting lectures and students participating live
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Teacher Box */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="w-6 h-6 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Teacher / Faculty Privileges</h3>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Full access to pen, highlighter, shapes (rectangle, circle, lines), and erasers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Toggle global student drawing lock with one click</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Grant individual drawing permissions to raised-hand students</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-page canvas management and instant board clear</span>
              </li>
            </ul>
          </div>

          {/* Student Box */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Student / Learner Privileges</h3>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Live synchronized viewing of faculty whiteboard derivations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Digital hand raise button with real-time instructor notification</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dedicated Doubt chat mode for targeted instructor answers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Download official lecture note PDFs and view attendance history</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-8 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              IX
            </div>
            <span>&copy; 2026 Inxyme LMS. Real-Time Educational Technology Platform.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/live/learn-bord" className="text-slate-400 hover:text-indigo-400 transition-colors">
              Smart Board Direct Link (/live/learn-bord)
            </Link>
            <Link href="/login" className="text-slate-400 hover:text-indigo-400 transition-colors">
              Auth Portal
            </Link>
          </div>
        </div>
      </footer>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultRole={modalRole}
        defaultMode={modalMode}
      />
    </div>
  );
}
