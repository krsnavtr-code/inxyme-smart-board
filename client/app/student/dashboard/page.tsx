"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Batch } from "@/types/batch";
import { Course } from "@/types/course";
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Video,
  Calendar,
  Radio,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  RefreshCw,
  Sparkles
} from "lucide-react";

export default function StudentDashboardPage() {
  const { user } = useAuth();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchStudentData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (user.id) params.set("userId", user.id);
      if (user.email) params.set("email", user.email);

      const headers: Record<string, string> = { Accept: "application/json" };
      const token = typeof window !== "undefined" ? localStorage.getItem("inxyme_token") : null;
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const [batchesRes, coursesRes] = await Promise.all([
        fetch(`/api/student/batches?${params.toString()}`, { headers }).catch(() => null),
        fetch(`/api/teacher/courses?${params.toString()}`, { headers }).catch(() => null)
      ]);

      if (batchesRes && batchesRes.ok) {
        const bData = await batchesRes.json();
        setBatches(Array.isArray(bData.batches) ? bData.batches : []);
      }

      if (coursesRes && coursesRes.ok) {
        const cData = await coursesRes.json();
        setCourses(Array.isArray(cData.courses) ? cData.courses : []);
      }
    } catch (e) {
      console.error("Error loading student dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const activeBatch = batches.find(
    (b) => b.status === "ongoing" || b.status === "active"
  ) || batches[0];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Hero Banner */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 p-0.5 shadow-xl shadow-emerald-500/20 shrink-0">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center font-bold text-2xl text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Welcome back, {user?.name || "Student"}!
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                    Enrolled Student
                  </span>
                </div>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authorized Student Access • Inxyme LMS</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchStudentData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>

              <Link
                href="/live/learn-board"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Join Smart Board</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Action Tiles */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Learning Sprints Flow */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Learning Sprints
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Sprint sequence &rarr; sessions &rarr; tasks complete trajectory with recorded lectures and quizzes.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/student/sprints"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.01]"
              >
                <span>Launch Sprints</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Batches & Live Classes */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  My Live Batches
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  View your allocated cohorts, check live meeting links, schedule timings, and connect with faculty.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/student/batches"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all hover:scale-[1.01]"
              >
                <span>View Batches ({batches.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  My Enrolled Courses
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Explore course syllabus, modules, learning goals, sprint timelines, and session study material.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/student/courses"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01]"
              >
                <span>Browse Syllabus ({courses.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Live Smart Board Classroom */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  Interactive Smart Board
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Join real-time whiteboard lectures, chat with faculty, raise student doubts, and download lecture notes.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/live/learn-board"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition-all hover:scale-[1.01]"
              >
                <span>Open Classroom</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Active Batch Spotlight */}
        {activeBatch ? (
          <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Active Live Cohort
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {activeBatch.batchName || activeBatch.name}
                </h2>
                <p className="text-xs text-slate-400">
                  Course:{" "}
                  <span className="text-slate-200 font-semibold">
                    {typeof activeBatch.course === "object"
                      ? activeBatch.course?.title
                      : "Enrolled Course"}
                  </span>
                </p>
              </div>

              <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-950 text-indigo-400 border border-slate-800 uppercase tracking-wider">
                {activeBatch.batchCode || activeBatch.code}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Timing */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Class Timings</span>
                </span>
                <p className="font-bold text-white">
                  {activeBatch.schedule?.startTime && activeBatch.schedule?.endTime
                    ? `${activeBatch.schedule.startTime} - ${activeBatch.schedule.endTime}`
                    : activeBatch.schedule?.timeSlot || "Regular Batch Hours"}
                </p>
                <p className="text-[11px] text-slate-400">
                  {Array.isArray(activeBatch.schedule?.days)
                    ? activeBatch.schedule.days.join(", ")
                    : "Scheduled Days"}
                </p>
              </div>

              {/* Teacher */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Assigned Faculty</span>
                </span>
                <p className="font-bold text-white truncate">
                  {typeof activeBatch.teacher === "object"
                    ? activeBatch.teacher?.fullname || activeBatch.teacher?.name
                    : "Assigned Instructor"}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {typeof activeBatch.teacher === "object" ? activeBatch.teacher?.email : ""}
                </p>
              </div>

              {/* Dates */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Batch Duration</span>
                </span>
                <p className="font-bold text-white">
                  {activeBatch.startDate
                    ? new Date(activeBatch.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric"
                      })
                    : "TBD"}{" "}
                  -{" "}
                  {activeBatch.endDate
                    ? new Date(activeBatch.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                    : "TBD"}
                </p>
                <p className="text-[11px] text-emerald-400 font-semibold">Active & Ongoing</p>
              </div>
            </div>

            {/* Live Class Links & WhatsApp */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {activeBatch.liveClass?.meetingLink && (
                <a
                  href={activeBatch.liveClass.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Live Class ({activeBatch.liveClass.platform || "Online"})</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              )}

              {activeBatch.whatsappGroupLink && (
                <a
                  href={activeBatch.whatsappGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-semibold text-xs border border-emerald-800/50 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Batch WhatsApp Group</span>
                </a>
              )}

              <Link
                href="/student/batches"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors ml-auto"
              >
                <span>View All Batches</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        ) : (
          <section className="border border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-2 bg-slate-900/30">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 mb-2">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No Batch Assigned Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your enrollment is active! Once the administrator allocates you to an active batch cohort, your class timing and live class links will appear here.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

