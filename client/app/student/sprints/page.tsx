"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Course, LmsSprint, LmsSession, LmsTask, LmsQuestion } from "@/types/course";
import {
  Sparkles,
  BookOpen,
  Layers,
  Clock,
  Calendar,
  Video,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Radio,
  Check,
  X,
  Award,
  ListTodo,
  Play,
  Share2,
  ArrowRight,
  Target,
  FileCode,
  HelpCircle,
  Send,
  Download
} from "lucide-react";

export default function StudentSprintsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const requestedCourseId = searchParams.get("courseId");

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
  const [errorCourses, setErrorCourses] = useState<string | null>(null);

  // Sprints state
  const [sprints, setSprints] = useState<LmsSprint[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<string>("");
  const [loadingSprints, setLoadingSprints] = useState<boolean>(false);
  const [errorSprints, setErrorSprints] = useState<string | null>(null);

  // Sessions & Task view state
  const [expandedSessionIds, setExpandedSessionIds] = useState<Record<string, boolean>>({});
  const [activeSessionFilter, setActiveSessionFilter] = useState<string>("all"); // "all" or sessionId
  const [activeVideoModal, setActiveVideoModal] = useState<{ title: string; url: string } | null>(null);

  // Task Solver Modal State
  const [activeTaskModal, setActiveTaskModal] = useState<LmsTask | null>(null);
  const [taskAnswers, setTaskAnswers] = useState<Record<number, string>>({});
  const [assignmentSubmissionText, setAssignmentSubmissionText] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);
  const [taskResult, setTaskResult] = useState<{
    score: number;
    totalPoints: number;
    completed: boolean;
  } | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>({});

  // Fetch enrolled courses for the logged-in student
  const fetchStudentCourses = async () => {
    if (!user) return;
    setLoadingCourses(true);
    setErrorCourses(null);

    try {
      const params = new URLSearchParams();
      if (user.id) params.set("userId", user.id);
      if (user.email) params.set("email", user.email);

      const headers: Record<string, string> = { Accept: "application/json" };
      const token = typeof window !== "undefined" ? localStorage.getItem("inxyme_token") : null;
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/teacher/courses?${params.toString()}`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to load enrolled courses (HTTP ${res.status})`);
      }

      const data = await res.json();
      const rawList: Course[] = Array.isArray(data.courses) ? data.courses : [];
      setCourses(rawList);

      // Select requested course from query param or fallback to first course
      if (rawList.length > 0) {
        const matchingCourse = requestedCourseId
          ? rawList.find((c) => c._id === requestedCourseId)
          : null;
        const initialCourseId = matchingCourse ? matchingCourse._id : rawList[0]._id;
        setSelectedCourseId(initialCourseId);
      }
    } catch (err: any) {
      console.error("Error fetching courses for student sprints:", err);
      setErrorCourses(err.message || "Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchStudentCourses();
  }, [user]);

  // Fetch Sprints for selected course
  const fetchCourseSprints = async (courseId: string) => {
    if (!courseId) {
      setSprints([]);
      return;
    }

    setLoadingSprints(true);
    setErrorSprints(null);

    try {
      const res = await fetch(`/api/courses/${courseId}/sprints`);
      if (!res.ok) {
        throw new Error(`Failed to load sprints (HTTP ${res.status})`);
      }

      const data = await res.json();
      const sprintList: LmsSprint[] = Array.isArray(data.sprints) ? data.sprints : [];
      setSprints(sprintList);

      if (sprintList.length > 0) {
        setSelectedSprintId(sprintList[0]._id);
        // Expand first session by default if present
        if (sprintList[0].sessions && sprintList[0].sessions.length > 0) {
          setExpandedSessionIds({ [sprintList[0].sessions[0]._id]: true });
        }
      } else {
        setSelectedSprintId("");
      }
    } catch (err: any) {
      console.error("Error fetching sprints:", err);
      setErrorSprints(err.message || "Failed to load sprints");
      setSprints([]);
    } finally {
      setLoadingSprints(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseSprints(selectedCourseId);
      setActiveSessionFilter("all");
    }
  }, [selectedCourseId]);

  // Currently selected course object
  const currentCourse = useMemo(() => {
    return courses.find((c) => c._id === selectedCourseId) || null;
  }, [courses, selectedCourseId]);

  // Currently selected sprint object
  const currentSprint = useMemo(() => {
    return sprints.find((s) => s._id === selectedSprintId) || sprints[0] || null;
  }, [sprints, selectedSprintId]);

  // Sessions in current sprint (sorted by order)
  const sortedSessions = useMemo(() => {
    if (!currentSprint || !Array.isArray(currentSprint.sessions)) return [];
    return [...currentSprint.sessions].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [currentSprint]);

  // Filtered sessions based on session filter
  const displayedSessions = useMemo(() => {
    if (activeSessionFilter === "all") return sortedSessions;
    return sortedSessions.filter((s) => s._id === activeSessionFilter);
  }, [sortedSessions, activeSessionFilter]);

  // Aggregate all tasks across sessions in this sprint
  const allSprintTasks = useMemo(() => {
    const tasks: { task: LmsTask; sessionName: string; sessionId: string }[] = [];
    sortedSessions.forEach((session) => {
      if (session.tasks && Array.isArray(session.tasks)) {
        session.tasks.forEach((t) => {
          tasks.push({
            task: t,
            sessionName: session.name,
            sessionId: session._id,
          });
        });
      }
    });
    return tasks;
  }, [sortedSessions]);

  // Tasks filtered by active session selection
  const filteredSprintTasks = useMemo(() => {
    if (activeSessionFilter === "all") return allSprintTasks;
    return allSprintTasks.filter((item) => item.sessionId === activeSessionFilter);
  }, [allSprintTasks, activeSessionFilter]);

  // Toggle session expand/collapse
  const toggleSession = (sessionId: string) => {
    setExpandedSessionIds((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  // Helper to get embeddable video URL
  const getEmbedVideoUrl = (url?: string) => {
    if (!url) return "";
    const ytMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }
    return url;
  };

  // Open Task Solver Modal
  const openTaskModal = (task: LmsTask) => {
    setActiveTaskModal(task);
    setTaskAnswers({});
    setAssignmentSubmissionText("");
    setTaskResult(null);
  };

  // Handle Task Submit (quiz scoring / assignment submission)
  const handleSubmitTask = async () => {
    if (!activeTaskModal) return;
    setSubmittingTask(true);

    try {
      let score = 0;
      let totalPoints = 0;

      if (activeTaskModal.questions && activeTaskModal.questions.length > 0) {
        activeTaskModal.questions.forEach((q, idx) => {
          const qPoints = q.points || 1;
          totalPoints += qPoints;
          const studentAns = taskAnswers[idx];

          if (q.questionType === "multiple_choice" || q.questionType === "true_false") {
            const correctOpt = q.options?.find((opt) => opt.isCorrect);
            if (correctOpt && correctOpt.text === studentAns) {
              score += qPoints;
            }
          } else if (q.correctAnswer && studentAns) {
            if (q.correctAnswer.trim().toLowerCase() === studentAns.trim().toLowerCase()) {
              score += qPoints;
            }
          }
        });
      } else {
        totalPoints = activeTaskModal.points || 10;
        score = totalPoints; // Full credit for project / submission submission
      }

      const payload = {
        sessionId: activeTaskModal.sessionId,
        answers: activeTaskModal.questions?.length ? taskAnswers : { submission: assignmentSubmissionText },
        score,
        timeSpent: 5,
      };

      const token = typeof window !== "undefined" ? localStorage.getItem("inxyme_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      if (activeTaskModal._id) {
        await fetch(`/api/tasks/${activeTaskModal._id}/submit`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        }).catch(() => null);
      }

      setTaskResult({
        score,
        totalPoints,
        completed: true,
      });

      if (activeTaskModal._id) {
        setCompletedTaskIds((prev) => ({
          ...prev,
          [activeTaskModal._id as string]: true,
        }));
      }
    } catch (e) {
      console.error("Error submitting task:", e);
    } finally {
      setSubmittingTask(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header & Visual Learning Pathway Flow Banner */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Student Learning Trajectory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Sprint Sequence <span className="text-emerald-400">&rarr;</span> Sessions <span className="text-emerald-400">&rarr;</span> Tasks
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Follow your structured chronological learning roadmap. Master each sprint's core goals, access live session classes & lecture notes, and complete all required tasks.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/live/learn-board"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                <span>Join Live Class</span>
              </Link>

              <button
                onClick={() => {
                  if (selectedCourseId) fetchCourseSprints(selectedCourseId);
                }}
                disabled={loadingSprints}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSprints ? "animate-spin" : ""}`} />
                <span>Sync Flow</span>
              </button>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div>
                <p className="text-xs font-bold text-white">Sprint Sequence</p>
                <p className="text-[11px] text-slate-400">Milestone timeline & duration</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div>
                <p className="text-xs font-bold text-white">Interactive Sessions</p>
                <p className="text-[11px] text-slate-400">Lectures, videos & study notes</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <p className="text-xs font-bold text-white">Tasks & Assessments</p>
                <p className="text-[11px] text-slate-400">Quizzes, code & submissions</p>
              </div>
            </div>
          </div>
        </section>

        {/* Course Selector Bar */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Select Active Course</p>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {currentCourse?.title || "Enrolled Course"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {loadingCourses ? (
              <span className="text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading courses...
              </span>
            ) : courses.length > 0 ? (
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer min-w-[240px]"
              >
                {courses.map((course) => (
                  <option key={course._id} value={course._id} className="bg-slate-900 text-slate-200">
                    {course.title}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-amber-400">No active enrolled courses found</span>
            )}
          </div>
        </section>

        {/* Loading / Error States for Sprints */}
        {loadingSprints && (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-300">Loading Sprint Sequence & Curriculum...</p>
            <p className="text-xs text-slate-500">Fetching all sessions, lecture videos, and assessments</p>
          </div>
        )}

        {errorSprints && (
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorSprints}</span>
          </div>
        )}

        {/* Empty Sprints state */}
        {!loadingSprints && sprints.length === 0 && (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">No Sprints Published For This Course Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Your instructor is currently preparing the sprint trajectory and sessions for this course. You can check back soon or browse the curriculum overview.
            </p>
            <div className="pt-2">
              <Link
                href="/student/courses"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>View Full Course Curriculum</span>
              </Link>
            </div>
          </div>
        )}

        {/* MAIN SPRINT FLOW CONTENT */}
        {!loadingSprints && sprints.length > 0 && (
          <div className="space-y-8">
            {/* 1. SPRINT SEQUENCE (HORIZONTAL TIMELINE / SELECTOR) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white">Sprint Sequence</h2>
                    <p className="text-xs text-slate-400">Select any sprint milestone to explore its sessions</p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Total {sprints.length} Sprints
                </span>
              </div>

              {/* Sprint Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sprints.map((sprint, index) => {
                  const isSelected = sprint._id === selectedSprintId;
                  const sessionCount = sprint.sessions?.length || 0;
                  let taskCount = 0;
                  sprint.sessions?.forEach((s) => {
                    taskCount += s.tasks?.length || 0;
                  });

                  return (
                    <div
                      key={sprint._id}
                      onClick={() => {
                        setSelectedSprintId(sprint._id);
                        setActiveSessionFilter("all");
                      }}
                      className={`rounded-3xl p-5 border transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? "bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl shadow-emerald-500/10"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                      }`}
                    >
                      {/* Active Accent Tag */}
                      {isSelected && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[10px] px-3 py-0.5 rounded-bl-xl uppercase tracking-wider">
                          Active Sprint
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase">
                            Sprint {index + 1}
                          </span>
                          {sprint.durationInDays && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {sprint.durationInDays} Days
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                          {sprint.name}
                        </h3>

                        {sprint.goal && (
                          <div className="flex items-start gap-1.5 text-xs text-slate-400 line-clamp-2">
                            <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{sprint.goal}</span>
                          </div>
                        )}

                        {/* Dates & WhatsApp */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {sprint.startDate
                              ? new Date(sprint.startDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "TBD"}
                            {" - "}
                            {sprint.endDate
                              ? new Date(sprint.endDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "TBD"}
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold text-[10px]">
                              {sessionCount} Sessions
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-semibold text-[10px]">
                              {taskCount} Tasks
                            </span>
                          </div>
                        </div>

                        {sprint.whatsappGroupLink && (
                          <div className="pt-1">
                            <a
                              href={sprint.whatsappGroupLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Join Sprint WhatsApp Cohort</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SPRINT HIGHLIGHT & STATS BANNER */}
            {currentSprint && (
              <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase">
                      Selected Milestone
                    </span>
                    <h3 className="text-base font-bold text-white">{currentSprint.name}</h3>
                  </div>
                  {currentSprint.description && (
                    <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                      {currentSprint.description}
                    </p>
                  )}
                </div>

                {/* Session Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveSessionFilter("all")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeSessionFilter === "all"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    All Sessions ({sortedSessions.length})
                  </button>
                  {sortedSessions.map((s, idx) => (
                    <button
                      key={s._id}
                      onClick={() => setActiveSessionFilter(s._id)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        activeSessionFilter === s._id
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      S{idx + 1}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* 2 & 3. DUAL-COLUMN LEARNING WORKSPACE: SESSIONS & TASKS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: SESSIONS BREAKDOWN (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-white">Sessions Breakdown</h2>
                      <p className="text-xs text-slate-400">Class lectures, video recordings, and study notes</p>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400">
                    Showing {displayedSessions.length} sessions
                  </span>
                </div>

                {displayedSessions.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2">
                    <p className="text-xs text-slate-400">No sessions found in this sprint.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedSessions.map((session, index) => {
                      const isExpanded = !!expandedSessionIds[session._id];
                      const taskCount = session.tasks?.length || 0;

                      return (
                        <div
                          key={session._id}
                          className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-3xl overflow-hidden shadow-xl transition-all"
                        >
                          {/* Session Header / Accordion Trigger */}
                          <div
                            onClick={() => toggleSession(session._id)}
                            className="p-5 cursor-pointer flex items-start justify-between gap-4 hover:bg-slate-850/50 transition-colors"
                          >
                            <div className="flex items-start gap-3.5">
                              <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                {session.order !== undefined ? session.order + 1 : index + 1}
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 uppercase">
                                    Session {index + 1}
                                  </span>
                                  {session.duration && (
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-500" />
                                      {session.duration} mins
                                    </span>
                                  )}
                                  {taskCount > 0 && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                      {taskCount} Tasks
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-sm sm:text-base font-bold text-white">
                                  {session.name}
                                </h3>

                                {session.description && (
                                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                    {session.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                title="Expand Session Details"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Session Content Details */}
                          {isExpanded && (
                            <div className="px-5 pb-6 pt-2 border-t border-slate-800/80 space-y-5 bg-slate-950/40">
                              {/* Action Buttons: Live Class & Video */}
                              <div className="flex flex-wrap items-center gap-3 pt-2">
                                {session.zoomMeetingLink && (
                                  <a
                                    href={session.zoomMeetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                                  >
                                    <Radio className="w-3.5 h-3.5 animate-pulse text-blue-200" />
                                    <span>Join Live Zoom Class</span>
                                    <ExternalLink className="w-3 h-3 text-blue-200" />
                                  </a>
                                )}

                                {session.videoUrl && (
                                  <button
                                    onClick={() =>
                                      setActiveVideoModal({
                                        title: session.name,
                                        url: session.videoUrl as string,
                                      })
                                    }
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                                  >
                                    <Play className="w-3.5 h-3.5 text-purple-200" />
                                    <span>Watch Recorded Lecture</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => setActiveSessionFilter(session._id)}
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
                                >
                                  <ListTodo className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Filter Session Tasks ({taskCount})</span>
                                </button>
                              </div>

                              {/* Reading Notes / Content */}
                              {session.content && (
                                <div className="space-y-2">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Curriculum Notes & Study Material</span>
                                  </h4>
                                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono">
                                    {session.content}
                                  </div>
                                </div>
                              )}

                              {/* Learning Resources */}
                              {session.resources && session.resources.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Downloadable Resources & References ({session.resources.length})</span>
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {session.resources.map((resource, rIdx) => (
                                      <a
                                        key={rIdx}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition-all text-xs group"
                                      >
                                        <div className="flex items-center gap-2.5 truncate">
                                          <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
                                          <span className="font-semibold text-slate-200 group-hover:text-emerald-300 truncate">
                                            {resource.title || `Resource ${rIdx + 1}`}
                                          </span>
                                        </div>
                                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: TASKS & ASSESSMENTS FLOW (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-white">Tasks & Practice</h2>
                      <p className="text-xs text-slate-400">Quizzes, code challenges, and assignments</p>
                    </div>
                  </div>

                  {activeSessionFilter !== "all" && (
                    <button
                      onClick={() => setActiveSessionFilter("all")}
                      className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>

                {filteredSprintTasks.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-white">No Pending Tasks</p>
                    <p className="text-[11px] text-slate-400">
                      There are no tasks assigned for this specific session filter.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSprintTasks.map(({ task, sessionName }, tIdx) => {
                      const isCompleted =
                        task._id && (completedTaskIds[task._id] || task.status === "completed");
                      const questionCount = task.questions?.length || 0;

                      return (
                        <div
                          key={task._id || tIdx}
                          className={`p-5 rounded-3xl border transition-all ${
                            isCompleted
                              ? "bg-slate-900/40 border-emerald-500/40"
                              : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                          } shadow-lg space-y-3`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase">
                                  {task.type || "Task"}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[150px]">
                                  {sessionName}
                                </span>
                              </div>

                              <h3 className="text-sm font-bold text-white leading-snug">
                                {task.title}
                              </h3>
                            </div>

                            <div className="shrink-0 text-right">
                              <span className="text-xs font-black text-emerald-400">
                                {task.points || 10} pts
                              </span>
                              {isCompleted && (
                                <p className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 justify-end">
                                  <Check className="w-3 h-3" /> Done
                                </p>
                              )}
                            </div>
                          </div>

                          {task.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-400">
                              {questionCount > 0
                                ? `${questionCount} Questions`
                                : "Assignment / Project"}
                            </span>

                            <button
                              onClick={() => openTaskModal(task)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                isCompleted
                                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30"
                              }`}
                            >
                              <span>{isCompleted ? "Review Task" : "Start Task"}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* RECORDED VIDEO MODAL */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-lg">
                  {activeVideoModal.title}
                </h3>
              </div>

              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              {activeVideoModal.url.includes("youtube") || activeVideoModal.url.includes("youtu.be") ? (
                <iframe
                  src={getEmbedVideoUrl(activeVideoModal.url)}
                  title={activeVideoModal.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeVideoModal.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span>Inxyme Video Lecture Player</span>
              <a
                href={activeVideoModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>Open in external tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE TASK & QUIZ SOLVER MODAL */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase">
                    {activeTaskModal.type || "Assessment"}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    Max: {activeTaskModal.points || 10} Points
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{activeTaskModal.title}</h3>
                {activeTaskModal.description && (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {activeTaskModal.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => setActiveTaskModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Submission Result Banner */}
              {taskResult && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-4 animate-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Submission Recorded!</p>
                      <p className="text-xs text-emerald-400">
                        Score: {taskResult.score} / {taskResult.totalPoints} points
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500 text-slate-950 uppercase">
                    Completed
                  </span>
                </div>
              )}

              {/* Questions List (If quiz/assessment has questions) */}
              {activeTaskModal.questions && activeTaskModal.questions.length > 0 ? (
                <div className="space-y-5">
                  {activeTaskModal.questions.map((q: LmsQuestion, qIdx: number) => {
                    const isSelectedAnswer = taskAnswers[qIdx];
                    const isSubmitted = !!taskResult;

                    return (
                      <div
                        key={q._id || qIdx}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-slate-200">
                            Q{qIdx + 1}. {q.question}
                          </p>
                          <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                            {q.points || 1} pt
                          </span>
                        </div>

                        {/* Options */}
                        {q.options && q.options.length > 0 ? (
                          <div className="space-y-2 pt-1">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = isSelectedAnswer === opt.text;
                              const isCorrect = opt.isCorrect;

                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  disabled={isSubmitted}
                                  onClick={() =>
                                    setTaskAnswers((prev) => ({
                                      ...prev,
                                      [qIdx]: opt.text,
                                    }))
                                  }
                                  className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                                    isSubmitted
                                      ? isCorrect
                                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                                        : isSelected
                                        ? "bg-rose-500/20 border-rose-500 text-rose-300"
                                        : "bg-slate-900 border-slate-800 text-slate-400"
                                      : isSelected
                                      ? "bg-purple-600/20 border-purple-500 text-purple-200"
                                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                                  }`}
                                >
                                  <span>{opt.text}</span>
                                  {isSubmitted && isCorrect && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          /* Short Answer Input */
                          <div className="pt-1">
                            <input
                              type="text"
                              disabled={isSubmitted}
                              placeholder="Type your answer here..."
                              value={taskAnswers[qIdx] || ""}
                              onChange={(e) =>
                                setTaskAnswers((prev) => ({
                                  ...prev,
                                  [qIdx]: e.target.value,
                                }))
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                        )}

                        {/* Explanation on submit */}
                        {isSubmitted && q.explanation && (
                          <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                            <span className="font-bold text-slate-300">Explanation: </span>
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Assignment Submission Form */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <p className="text-xs font-bold text-white">Assignment Solution Submission</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Please enter your solution notes, GitHub repository link, or live project URL below:
                    </p>
                    <textarea
                      rows={5}
                      value={assignmentSubmissionText}
                      onChange={(e) => setAssignmentSubmissionText(e.target.value)}
                      placeholder="Paste your GitHub link or solution description here..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <button
                onClick={() => setActiveTaskModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>

              {!taskResult && (
                <button
                  onClick={handleSubmitTask}
                  disabled={submittingTask}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${submittingTask ? "animate-spin" : ""}`} />
                  <span>{submittingTask ? "Submitting..." : "Submit Answers"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

