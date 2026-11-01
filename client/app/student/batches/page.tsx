"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Batch } from "@/types/batch";
import {
  Layers,
  Clock,
  Calendar,
  Video,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Search,
  RefreshCw,
  BookOpen,
  GraduationCap,
  Users,
  AlertCircle,
  Sparkles
} from "lucide-react";

export default function StudentBatchesPage() {
  const { user } = useAuth();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchStudentBatches = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (user.id) params.set("userId", user.id);
      if (user.email) params.set("email", user.email);

      const headers: Record<string, string> = { Accept: "application/json" };
      const token = typeof window !== "undefined" ? localStorage.getItem("inxyme_token") : null;
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/student/batches?${params.toString()}`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to load batches (HTTP ${res.status})`);
      }

      const data = await res.json();
      setBatches(Array.isArray(data.batches) ? data.batches : []);
    } catch (err: any) {
      console.error("Error loading student batches:", err);
      setError(err.message || "Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentBatches();
  }, [user]);

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredBatches = batches.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (b.batchName || b.name || "").toLowerCase().includes(q);
    const codeMatch = (b.batchCode || b.code || "").toLowerCase().includes(q);
    const courseTitle =
      typeof b.course === "object" && b.course?.title
        ? b.course.title.toLowerCase()
        : "";
    const teacherName =
      typeof b.teacher === "object"
        ? (b.teacher?.fullname || b.teacher?.name || "").toLowerCase()
        : "";

    return nameMatch || codeMatch || courseTitle.includes(q) || teacherName.includes(q);
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                My Learning Cohorts
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">My Live Batches</h1>
              <p className="text-xs text-slate-400">
                View your scheduled batch timings, live class links, and connect with faculty instructors.
              </p>
            </div>

            <button
              onClick={fetchStudentBatches}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </section>

        {/* Search */}
        <section className="flex items-center justify-between gap-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-3">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by batch name, code or course..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-400 pr-2 font-medium">
            {filteredBatches.length} {filteredBatches.length === 1 ? "Batch" : "Batches"}
          </span>
        </section>

        {/* Loading */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Loading your enrolled batches...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <p className="text-sm font-bold">Failed to load batches</p>
              <p className="text-xs text-rose-400/90">{error}</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredBatches.length === 0 && (
          <div className="border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-4 bg-slate-900/30">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Layers className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-white">No Batches Found</h3>
              <p className="text-xs text-slate-400">
                You are not currently allocated to any batch cohort. The administrator will allocate you to a batch based on your course enrollment.
              </p>
            </div>
          </div>
        )}

        {/* Batches Grid */}
        {!loading && !error && filteredBatches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBatches.map((batch) => {
              const courseTitle =
                typeof batch.course === "object" && batch.course?.title
                  ? batch.course.title
                  : "Enrolled Course";

              const teacherName =
                typeof batch.teacher === "object"
                  ? batch.teacher?.fullname || batch.teacher?.name
                  : "Assigned Faculty";

              const teacherEmail =
                typeof batch.teacher === "object" ? batch.teacher?.email : "";

              const scheduleDays =
                Array.isArray(batch.schedule?.days) && batch.schedule.days.length > 0
                  ? batch.schedule.days.join(", ")
                  : "Regular Schedule";

              const timingText =
                batch.schedule?.startTime && batch.schedule?.endTime
                  ? `${batch.schedule.startTime} - ${batch.schedule.endTime}`
                  : batch.schedule?.timeSlot || "Scheduled Hours";

              return (
                <div
                  key={batch._id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                        {batch.batchCode || batch.code}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                        {batch.status || "Ongoing"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {batch.batchName || batch.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="font-medium truncate">{courseTitle}</span>
                      </div>
                    </div>

                    {/* Schedule & Faculty Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Timings</span>
                        </span>
                        <p className="font-bold text-white">{timingText}</p>
                        <p className="text-[10px] text-slate-400 truncate">{scheduleDays}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Instructor</span>
                        </span>
                        <p className="font-bold text-white truncate">{teacherName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{teacherEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 space-y-3 border-t border-slate-800/80 mt-6">
                    {batch.liveClass?.meetingLink ? (
                      <div className="space-y-2">
                        <a
                          href={batch.liveClass.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01]"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Live Class ({batch.liveClass.platform || "Online"})</span>
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
                                title="Copy ID"
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
                                title="Copy Pass"
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
                        Live meeting link will be activated when class starts
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {batch.whatsappGroupLink ? (
                        <a
                          href={batch.whatsappGroupLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold border border-emerald-800/50 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <Link
                          href="/student/courses"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Syllabus</span>
                        </Link>
                      )}

                      <Link
                        href={`/student/sprints?courseId=${typeof batch.course === "object" ? batch.course?._id : batch.course || ""
                          }`}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Sprint Flow</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

