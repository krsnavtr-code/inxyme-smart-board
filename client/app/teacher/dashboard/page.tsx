"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();

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
                {user?.headline || "Faculty Member • Inxyme LMS"}
              </p>
            </div>
          </div>
        </section>

        {/* Faculty Panel Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Batches Card */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">My Live Batches</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  View your assigned cohorts, access live Zoom/Meet class links, check student rosters, and track schedules.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/teacher/batches"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01]"
              >
                <span>View My Batches</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Courses Card */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Course Curriculum</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Browse enrolled courses, detailed syllabus outlines, session breakdowns, sprints, and learning outcomes.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/teacher/courses"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-all hover:scale-[1.01]"
              >
                <span>Browse Syllabus</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">LMS Verification Status</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Your instructor profile is synchronized with Inxyme Website database with LMS Approved status.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Authorized Teacher Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ready State */}
        <section className="border border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 mb-2">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-300">Teacher LMS Modules Active</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Manage your courses, view syllabus modules, and coordinate curriculum from this teacher panel.
          </p>
        </section>
      </main>
    </div>
  );
}
