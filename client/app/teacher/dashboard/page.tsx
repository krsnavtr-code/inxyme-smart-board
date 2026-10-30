"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  GraduationCap,
  Tv,
  ArrowRight,
  Sparkles,
  Layers,
  Radio,
  Clock
} from "lucide-react";

export default function TeacherDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState("INX-LIVE-401");

  const handleLaunchBoard = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!roomCode.trim()) return;
    router.push(`/live/learn-board?room=${encodeURIComponent(roomCode.trim().toUpperCase())}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100">
      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8">
        {/* Welcome & Teacher Profile Hero */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-xl shadow-indigo-600/25 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center font-bold text-2xl text-white">
                {user?.name ? user.name.charAt(0) : "T"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {user?.name || "Teacher Faculty"}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
                  Faculty Instructor
                </span>
              </div>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <p className="text-xs text-indigo-300 font-medium">
                {user?.headline || "Senior Faculty Member"}
              </p>
            </div>
          </div>
        </section>

        {/* Smart Board Quick Launcher */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Radio className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Interactive Smart Board Studio</h2>
              <p className="text-xs text-slate-400">
                Enter your live room code to broadcast lectures, derive formulas, and sync canvas in real time.
              </p>
            </div>
          </div>

          <form onSubmit={handleLaunchBoard} className="pt-2 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center max-w-lg">
            <div className="flex-1">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code (e.g. INX-LIVE-401)"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-white uppercase placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </section>

        {/* Clean Ready State */}
        <section className="border border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 mb-2">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-300">Teacher LMS Modules Ready</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Ready to build next features step by step (Courses, Live Sessions, Students, Doubts, Lecture Notes).
          </p>
        </section>
      </main>
    </div>
  );
}
