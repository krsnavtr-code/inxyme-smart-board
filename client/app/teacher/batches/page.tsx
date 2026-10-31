"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Batch, BatchStudent } from "@/types/batch";
import {
  Users,
  Video,
  Calendar,
  Clock,
  Search,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  GraduationCap,
  Sparkles,
  Layers,
  ChevronRight,
  X,
  Mail,
  Phone,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default function TeacherBatchesPage() {
  const { user } = useAuth();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ongoing" | "scheduled" | "completed">("ALL");

  // Student Roster Modal
  const [selectedBatchForRoster, setSelectedBatchForRoster] = useState<Batch | null>(null);
  const [rosterSearch, setRosterSearch] = useState("");

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchTeacherBatches = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (user.id) params.set("userId", user.id);
      if (user.email) params.set("email", user.email);

      const headers: Record<string, string> = { Accept: "application/json" };
      const storedToken =
        typeof window !== "undefined" ? localStorage.getItem("inxyme_token") : null;
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }

      const res = await fetch(`/api/teacher/batches?${params.toString()}`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to load batches (HTTP ${res.status})`);
      }

      const data = await res.json();
      const list: Batch[] = Array.isArray(data.batches) ? data.batches : [];
      setBatches(list);
    } catch (err: any) {
      console.error("Error loading teacher batches:", err);
      setError(err.message || "Failed to fetch batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherBatches();
  }, [user]);

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Metrics Calculation
  const totalBatches = batches.length;
  const activeBatches = batches.filter(
    (b) => b.status === "ongoing" || b.status === "active"
  ).length;
  const upcomingBatches = batches.filter((b) => b.status === "scheduled").length;
  const totalAllocatedStudents = batches.reduce(
    (sum, b) => sum + (Array.isArray(b.students) ? b.students.length : 0),
    0
  );

  // Filtered Batches
  const filteredBatches = batches.filter((b) => {
    // Status Filter
    if (statusFilter !== "ALL") {
      const normalizedStatus = (b.status || "").toLowerCase();
      if (statusFilter === "ongoing" && normalizedStatus !== "ongoing" && normalizedStatus !== "active") {
        return false;
      }
      if (statusFilter === "scheduled" && normalizedStatus !== "scheduled") {
        return false;
      }
      if (statusFilter === "completed" && normalizedStatus !== "completed") {
        return false;
      }
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (b.batchName || b.name || "").toLowerCase().includes(q);
      const codeMatch = (b.batchCode || b.code || "").toLowerCase().includes(q);
      const courseTitle =
        typeof b.course === "object" && b.course?.title
          ? b.course.title.toLowerCase()
          : "";
      const courseMatch = courseTitle.includes(q);
      const studentMatch = (b.students || []).some(
        (s) =>
          (s.fullname || s.name || "").toLowerCase().includes(q) ||
          (s.email || "").toLowerCase().includes(q)
      );

      return nameMatch || codeMatch || courseMatch || studentMatch;
    }

    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Hero Section */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                  Live Cohorts & Classes
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-400">Faculty Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                My Assigned Batches
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                View your active learning cohorts, manage scheduled class timings, launch live sessions, and interact with enrolled students assigned to your batches.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchTeacherBatches}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>

              <Link
                href="/teacher/courses"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>View Courses</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Real-time Metrics Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-lg shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Batches
              </span>
              <span className="text-2xl font-black text-white">{totalBatches}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-lg shrink-0">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Active / Ongoing
              </span>
              <span className="text-2xl font-black text-emerald-400">{activeBatches}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-lg shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Upcoming Cohorts
              </span>
              <span className="text-2xl font-black text-blue-400">{upcomingBatches}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center text-lg shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Allocated Students
              </span>
              <span className="text-2xl font-black text-purple-400">{totalAllocatedStudents}</span>
            </div>
          </div>
        </section>

        {/* Filters and Search Bar */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 self-start overflow-x-auto max-w-full">
            {(
              [
                { id: "ALL", label: "All Batches", count: totalBatches },
                { id: "ongoing", label: "Active", count: activeBatches },
                { id: "scheduled", label: "Upcoming", count: upcomingBatches },
                {
                  id: "completed",
                  label: "Completed",
                  count: batches.filter((b) => b.status === "completed").length
                }
              ] as const
            ).map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      active ? "bg-indigo-900 text-indigo-100" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px] md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search batch, code or student..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Loading your assigned batches...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <div className="space-y-1">
              <p className="text-sm font-bold">Failed to load batches</p>
              <p className="text-xs text-rose-400/90">{error}</p>
              <button
                onClick={fetchTeacherBatches}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 underline hover:text-white"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBatches.length === 0 && (
          <div className="border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-4 bg-slate-900/30">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Layers className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-white">No Batches Found</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {searchQuery || statusFilter !== "ALL"
                  ? "No batches match your selected search criteria. Try resetting your filters."
                  : "You currently have no batches assigned to your instructor profile. Once an administrator assigns you to a batch in the Admin Panel, it will show up here."}
              </p>
            </div>
            {(searchQuery || statusFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        )}

        {/* Batches Grid */}
        {!loading && !error && filteredBatches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch) => {
              const courseTitle =
                typeof batch.course === "object" && batch.course?.title
                  ? batch.course.title
                  : "Assigned Course";
              const courseId =
                typeof batch.course === "object" && batch.course?._id
                  ? batch.course._id
                  : typeof batch.course === "string"
                  ? batch.course
                  : "";

              const studentsCount = Array.isArray(batch.students)
                ? batch.students.length
                : batch.currentEnrollment || 0;
              const maxCap = batch.maxCapacity || 30;
              const fillPercentage = Math.min(100, Math.round((studentsCount / maxCap) * 100));

              const isOngoing =
                batch.status === "ongoing" || batch.status === "active";
              const isScheduled = batch.status === "scheduled";

              const scheduleDays =
                Array.isArray(batch.schedule?.days) && batch.schedule.days.length > 0
                  ? batch.schedule.days.join(", ")
                  : "Regular Schedule";
              const timingText =
                batch.schedule?.startTime && batch.schedule?.endTime
                  ? `${batch.schedule.startTime} - ${batch.schedule.endTime}`
                  : batch.schedule?.timeSlot || "Flexible Timings";

              return (
                <div
                  key={batch._id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 hover:shadow-indigo-500/5 hover:-translate-y-1 relative group"
                >
                  {/* Top Header: Code badge & Status */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tracking-wider uppercase">
                        {batch.batchCode || batch.code || "BATCH"}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                          isOngoing
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : isScheduled
                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOngoing
                              ? "bg-emerald-400 animate-ping"
                              : isScheduled
                              ? "bg-blue-400"
                              : "bg-slate-500"
                          }`}
                        />
                        <span>{batch.status || "Ongoing"}</span>
                      </span>
                    </div>

                    {/* Batch Name & Course */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {batch.batchName || batch.name || "Untitled Batch"}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate font-medium">{courseTitle}</span>
                      </div>
                    </div>

                    {/* Schedule & Timing Info */}
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="font-medium">{timingText}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[120px]">
                          {scheduleDays}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800/60">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>
                            {batch.startDate
                              ? new Date(batch.startDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric"
                                })
                              : "TBD"}{" "}
                            -{" "}
                            {batch.endDate
                              ? new Date(batch.endDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })
                              : "TBD"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Enrolled Students Capacity Meter */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-purple-400" />
                          <span>Students Allocated</span>
                        </span>
                        <span className="font-bold text-white">
                          {studentsCount} <span className="text-slate-500 font-normal">/ {maxCap}</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-6 space-y-3 border-t border-slate-800/80 mt-6">
                    {/* Live Class Button if Link exists */}
                    {batch.liveClass?.meetingLink ? (
                      <div className="space-y-2">
                        <a
                          href={batch.liveClass.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01] cursor-pointer"
                        >
                          <Video className="w-4 h-4" />
                          <span>Launch Live Class ({batch.liveClass.platform || "Online"})</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                        </a>

                        {(batch.liveClass.meetingId || batch.liveClass.passcode) && (
                          <div className="flex items-center justify-between text-[11px] bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
                            {batch.liveClass.meetingId && (
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    batch.liveClass?.meetingId || "",
                                    `mid_${batch._id}`
                                  )
                                }
                                className="hover:text-white flex items-center gap-1 cursor-pointer"
                                title="Copy Meeting ID"
                              >
                                <span>ID: {batch.liveClass.meetingId}</span>
                                {copiedKey === `mid_${batch._id}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3 opacity-60" />
                                )}
                              </button>
                            )}

                            {batch.liveClass.passcode && (
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    batch.liveClass?.passcode || "",
                                    `pass_${batch._id}`
                                  )
                                }
                                className="hover:text-white flex items-center gap-1 cursor-pointer"
                                title="Copy Passcode"
                              >
                                <span>Pass: {batch.liveClass.passcode}</span>
                                {copiedKey === `pass_${batch._id}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3 opacity-60" />
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
                        Live meeting link will appear here before class
                      </div>
                    )}

                    {/* Secondary Actions: View Roster & WhatsApp */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedBatchForRoster(batch)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        <span>Students ({studentsCount})</span>
                      </button>

                      {batch.whatsappGroupLink ? (
                        <a
                          href={batch.whatsappGroupLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold border border-emerald-800/50 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <Link
                          href="/teacher/courses"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-800 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Syllabus</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Student Roster Modal */}
      {selectedBatchForRoster && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                    {selectedBatchForRoster.batchCode || selectedBatchForRoster.code}
                  </span>
                  <span className="text-xs text-slate-400">• Student Roster</span>
                </div>
                <h2 className="text-lg font-bold text-white">
                  {selectedBatchForRoster.batchName || selectedBatchForRoster.name}
                </h2>
                <p className="text-xs text-slate-400">
                  {Array.isArray(selectedBatchForRoster.students)
                    ? selectedBatchForRoster.students.length
                    : 0}{" "}
                  students allocated to this live cohort
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedBatchForRoster(null);
                  setRosterSearch("");
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/40">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Search students by name, email or phone..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Students List */}
            <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-800/60">
              {(() => {
                const students = Array.isArray(selectedBatchForRoster.students)
                  ? selectedBatchForRoster.students
                  : [];
                const filtered = students.filter((s: BatchStudent) => {
                  if (!rosterSearch.trim()) return true;
                  const q = rosterSearch.toLowerCase();
                  const name = (s.fullname || s.name || "").toLowerCase();
                  const email = (s.email || "").toLowerCase();
                  const phone = (s.phone || "").toLowerCase();
                  return name.includes(q) || email.includes(q) || phone.includes(q);
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      {students.length === 0
                        ? "No students have been allocated to this batch yet by the administrator."
                        : "No students match your search filter."}
                    </div>
                  );
                }

                return filtered.map((student: BatchStudent, idx: number) => {
                  const studentName = student.fullname || student.name || "Student";
                  return (
                    <div
                      key={student._id || idx}
                      className="pt-3 first:pt-0 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md shrink-0">
                          {studentName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {studentName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {student.email}
                          </p>
                          {student.phone && (
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {student.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {student.phone && (
                          <a
                            href={`https://wa.me/${student.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a
                          href={`mailto:${student.email}`}
                          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-xs"
                          title="Send Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Total Allocated: {selectedBatchForRoster.students?.length || 0} Students
              </span>
              <button
                onClick={() => {
                  setSelectedBatchForRoster(null);
                  setRosterSearch("");
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

