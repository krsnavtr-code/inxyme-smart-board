"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Course, LmsSprint, LmsSession, LmsTask } from "@/types/course";
import {
  BookOpen,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Tag,
  DollarSign,
  GraduationCap,
  Video,
  Users,
  Target,
  Award,
  Check,
  Calendar,
  Zap,
  Folder,
  Link2,
  ListTodo,
  Info,
  PlayCircle,
  ArrowRight,
  MessageSquare,
  ArrowUpRight
} from "lucide-react";

export default function TeacherCoursesPage() {
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Selected Course for Syllabus Modal
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);

  // Modal State & Sprints
  const [sprints, setSprints] = useState<LmsSprint[]>([]);
  const [sprintsLoading, setSprintsLoading] = useState(false);
  const [syllabusTab, setSyllabusTab] = useState<"curriculum" | "sprints" | "outcomes" | "overview">("curriculum");
  const [syllabusSearch, setSyllabusSearch] = useState("");
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});

  // Fetch only enrolled and active courses for the logged-in teacher
  const fetchEnrolledCourses = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (user.id) params.set("userId", user.id);
      if (user.email) params.set("email", user.email);

      const headers: Record<string, string> = { Accept: "application/json" };
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("inxyme_token") : null;
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }

      const res = await fetch(`/api/teacher/courses?${params.toString()}`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to fetch enrolled courses (HTTP ${res.status})`);
      }

      const data = await res.json();
      const rawList: Course[] = Array.isArray(data.courses) ? data.courses : [];

      // Strict Active & Enrolled filter:
      // 1. Must be enrolled (handled by /api/teacher/courses)
      // 2. Course must be active/published (isPublished !== false && status !== 'inactive')
      const activeEnrolledOnly = rawList.filter((course) => {
        const isPublished = course.isPublished !== false;
        const statusVal = course.status;
        const isNotInactive = !statusVal || String(statusVal).toLowerCase() !== "inactive";
        return isPublished && isNotInactive;
      });

      setCourses(activeEnrolledOnly);
    } catch (err: unknown) {
      console.error("Error fetching teacher enrolled courses:", err);
      const msg = err instanceof Error ? err.message : "Unable to load enrolled courses from API";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user?.id, user?.email]);

  // Load LMS Sprints whenever a course modal is opened
  useEffect(() => {
    if (!selectedCourseForModal) {
      setSprints([]);
      setSyllabusTab("curriculum");
      setSyllabusSearch("");
      setExpandedModules({});
      setExpandedSessions({});
      return;
    }

    // Default expand first two modules
    setExpandedModules({ 0: true, 1: true });

    const fetchCourseSprints = async () => {
      setSprintsLoading(true);
      try {
        const cId = selectedCourseForModal._id;
        const res = await fetch(`/api/courses/${cId}/sprints`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sprints)) {
            setSprints(data.sprints);
            // If the course has sprints but no standard curriculum array, default to sprints tab
            if (
              (!selectedCourseForModal.curriculum || selectedCourseForModal.curriculum.length === 0) &&
              data.sprints.length > 0
            ) {
              setSyllabusTab("sprints");
            }
          }
        }
      } catch (err) {
        console.warn("Could not load sprints for syllabus modal:", err);
      } finally {
        setSprintsLoading(false);
      }
    };

    fetchCourseSprints();
  }, [selectedCourseForModal?._id]);

  // Extract distinct categories from enrolled courses
  const categories = [
    "ALL",
    ...Array.from(
      new Set(
        courses
          .map((c) => c.category?.name)
          .filter((name): name is string => Boolean(name))
      )
    )
  ];

  // Filtered courses based on search & category
  const filteredCourses = courses.filter((c) => {
    const matchesCategory =
      selectedCategory === "ALL" || c.category?.name === selectedCategory;

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      c.title.toLowerCase().includes(query) ||
      (c.category?.name && c.category.name.toLowerCase().includes(query)) ||
      (c.level && c.level.toLowerCase().includes(query)) ||
      (c.skills && c.skills.some((s) => s.toLowerCase().includes(query)));

    return matchesCategory && matchesSearch;
  });

  // Modal Accordion Helpers
  const toggleModule = (index: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleAllModules = (expand: boolean) => {
    if (!selectedCourseForModal?.curriculum) return;
    const newState: Record<number, boolean> = {};
    selectedCourseForModal.curriculum.forEach((_, idx) => {
      newState[idx] = expand;
    });
    setExpandedModules(newState);
  };

  const toggleSession = (sessionId: string) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  // Filtered Curriculum Topics within the Modal
  const filteredCurriculum = (selectedCourseForModal?.curriculum || []).filter((mod) => {
    if (!syllabusSearch.trim()) return true;
    const q = syllabusSearch.toLowerCase().trim();
    const titleMatch = mod.title?.toLowerCase().includes(q);
    const descMatch = mod.description?.toLowerCase().includes(q);
    const topicsMatch = mod.topics?.some((t) => t.toLowerCase().includes(q));
    return titleMatch || descMatch || topicsMatch;
  });

  // Filtered Sprints within the Modal
  const filteredSprints = sprints.filter((sprint) => {
    if (!syllabusSearch.trim()) return true;
    const q = syllabusSearch.toLowerCase().trim();
    const nameMatch = sprint.name?.toLowerCase().includes(q);
    const descMatch = sprint.description?.toLowerCase().includes(q);
    const goalMatch = sprint.goal?.toLowerCase().includes(q);
    const sessionMatch = sprint.sessions?.some(
      (sess) =>
        sess.name?.toLowerCase().includes(q) ||
        sess.description?.toLowerCase().includes(q) ||
        sess.content?.toLowerCase().includes(q)
    );
    return nameMatch || descMatch || goalMatch || sessionMatch;
  });

  const totalSyllabusTopics = (selectedCourseForModal?.curriculum || []).reduce(
    (acc, m) => acc + (m.topics?.length || 0),
    0
  );
  const totalLmsSessions = sprints.reduce(
    (acc, s) => acc + (s.sessions?.length || 0),
    0
  );
  const totalLiveClasses = sprints.reduce(
    (acc, s) =>
      acc + (s.sessions?.filter((sess) => Boolean(sess.zoomMeetingLink))?.length || 0),
    0
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      {/* Top Header / Page Hero */}
      <header className="bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Enrolled & Active Curriculum
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Teacher Enrolled Courses
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Access full syllabus details, weekly curriculum breakdowns, and sprint architectures for your assigned courses.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchEnrolledCourses}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700/80 transition-all cursor-pointer disabled:opacity-50"
                title="Refresh enrolled courses"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
                <span>Refresh</span>
              </button>

              <Link
                href="/teacher/dashboard"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
              >
                Dashboard
              </Link>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search enrolled courses by title, topic, or skills..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Selector */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Course Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading your enrolled courses & active syllabus...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">Error Loading Courses</h3>
            <p className="text-xs text-rose-300">{error}</p>
            <button
              onClick={fetchEnrolledCourses}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center gap-2 border border-slate-700 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {courses.length === 0
                  ? "No Active Enrolled Courses Found"
                  : "No Courses Matching Filters"}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                {courses.length === 0
                  ? "You have not been enrolled in any active courses yet. Courses assigned to you in the Inxyme Admin Panel will appear here automatically."
                  : "Try clearing your search query or selecting a different category to view your enrolled courses."}
              </p>
            </div>
            {courses.length > 0 ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={fetchEnrolledCourses}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Again</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const modulesCount = course.curriculum?.length || 0;
              const hasModules = modulesCount > 0;

              return (
                <div
                  key={course._id}
                  className="bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all flex flex-col group"
                >
                  {/* Course Thumbnail Banner */}
                  <div className="h-44 w-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
                    {course.thumbnail || course.image ? (
                      <img
                        src={course.thumbnail || course.image}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 text-center">
                        <GraduationCap className="w-10 h-10 text-indigo-400 mb-2" />
                        <span className="text-xs font-bold text-slate-300 line-clamp-2">
                          {course.title}
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600/90 text-white backdrop-blur-md shadow-md">
                        {course.category?.name || "General Course"}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/90 text-white backdrop-blur-md shadow-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Active Enrolled
                      </span>
                    </div>

                    {/* Bottom Floating Stats */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 font-medium">
                      <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/50">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>
                          {course.totalHours
                            ? `${course.totalHours} hrs`
                            : course.duration || "Self-Paced"}
                        </span>
                      </div>

                      {course.level && (
                        <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/50 text-[10px] uppercase font-bold text-indigo-300">
                          {course.level}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Course Details Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                        {course.title}
                      </h3>

                      {course.shortDescription && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {course.shortDescription}
                        </p>
                      )}

                      {/* Skills Chips */}
                      {course.skills && course.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {course.skills.slice(0, 3).map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 font-medium border border-slate-700/60"
                            >
                              {skill}
                            </span>
                          ))}
                          {course.skills.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 font-medium border border-slate-700/60">
                              +{course.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="space-y-3 pt-3 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <span>
                            {hasModules
                              ? `${modulesCount} Module${modulesCount > 1 ? "s" : ""}`
                              : "Modular Syllabus"}
                          </span>
                        </div>

                        {/* Direct Syllabus link trigger */}
                        <button
                          onClick={() => setSelectedCourseForModal(course)}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Full Syllabus</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Course Syllabus & LMS Modal Trigger Button */}
                      <button
                        onClick={() => setSelectedCourseForModal(course)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 hover:border-indigo-500/50 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-indigo-500/10"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>View Syllabus & LMS Curriculum</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* Syllabus & LMS Curriculum Modal (LmsManagement architecture)  */}
      {/* ============================================================== */}
      {selectedCourseForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedCourseForModal(null)}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Top Close Button */}
            <button
              onClick={() => setSelectedCourseForModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20 cursor-pointer"
              title="Close Syllabus"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header & Metrics Bar */}
            <div className="p-5 sm:p-6 pb-4 border-b border-slate-800 bg-slate-900/90 pr-14">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {selectedCourseForModal.category?.name || "Curriculum"}
                </span>
                {selectedCourseForModal.level && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedCourseForModal.level}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Active Enrolled
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                {selectedCourseForModal.title}
              </h2>
              {selectedCourseForModal.shortDescription && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {selectedCourseForModal.shortDescription}
                </p>
              )}

              {/* Metrics Summary (matching LmsManagement Sessions metrics) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 pt-3 border-t border-slate-800/80">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Modules
                    </span>
                    <span className="text-sm font-bold text-white">
                      {selectedCourseForModal.curriculum?.length || 0} Modules
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      LMS Sprints
                    </span>
                    <span className="text-sm font-bold text-white">
                      {sprintsLoading ? "..." : `${sprints.length} Sprints`}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Duration
                    </span>
                    <span className="text-sm font-bold text-white">
                      {selectedCourseForModal.totalHours
                        ? `${selectedCourseForModal.totalHours} hrs`
                        : selectedCourseForModal.duration || "Self-Paced"}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Total Sessions
                    </span>
                    <span className="text-sm font-bold text-white">
                      {totalLmsSessions > 0 ? `${totalLmsSessions} Sessions` : "Interactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-none pb-0.5">
                <button
                  type="button"
                  onClick={() => setSyllabusTab("curriculum")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    syllabusTab === "curriculum"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>
                    Modules & Topics ({selectedCourseForModal.curriculum?.length || 0})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSyllabusTab("sprints")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    syllabusTab === "sprints"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    LMS Sprints & Timeline {sprints.length > 0 && `(${sprints.length})`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSyllabusTab("outcomes")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    syllabusTab === "outcomes"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Skills & Outcomes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSyllabusTab("overview")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    syllabusTab === "overview"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Overview & Details</span>
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              {/* ============================================================== */}
              {/* TAB 1: Structured Curriculum Modules & Topics                   */}
              {/* ============================================================== */}
              {syllabusTab === "curriculum" && (
                <div className="space-y-4">
                  {/* Search within curriculum & Expand all toggles */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={syllabusSearch}
                        onChange={(e) => setSyllabusSearch(e.target.value)}
                        placeholder="Search modules, concepts, or topics..."
                        className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      {syllabusSearch && (
                        <button
                          onClick={() => setSyllabusSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => toggleAllModules(true)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-800 cursor-pointer"
                      >
                        Expand All
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAllModules(false)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-800 cursor-pointer"
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>

                  {/* Modules Accordion List */}
                  {filteredCurriculum.length === 0 ? (
                    <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-slate-400 space-y-2">
                      <Info className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs font-semibold text-white">
                        {syllabusSearch
                          ? `No curriculum topics matching "${syllabusSearch}"`
                          : "No structured modules published in standard curriculum."}
                      </p>
                      {sprints.length > 0 && (
                        <button
                          onClick={() => setSyllabusTab("sprints")}
                          className="mt-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer inline-flex items-center gap-1"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>View {sprints.length} LMS Sprints Instead</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredCurriculum.map((mod, idx) => {
                        const isExpanded =
                          Boolean(expandedModules[idx]) || Boolean(syllabusSearch.trim());
                        const topicCount = mod.topics?.length || 0;

                        return (
                          <div
                            key={idx}
                            className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-200 hover:border-slate-700"
                          >
                            {/* Module Accordion Header */}
                            <button
                              type="button"
                              onClick={() => toggleModule(idx)}
                              className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-black text-xs flex items-center justify-center shrink-0">
                                  {mod.week || idx + 1 < 10 ? `0${mod.week || idx + 1}` : mod.week || idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                                      Module {mod.week || idx + 1}
                                    </span>
                                    {mod.duration && (
                                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                        • <Clock className="w-3 h-3 inline" /> {mod.duration} hrs
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-bold text-white truncate">
                                    {mod.title}
                                  </h4>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 hidden sm:inline-block">
                                  {topicCount} topic{topicCount === 1 ? "" : "s"}
                                </span>
                                <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </div>
                              </div>
                            </button>

                            {/* Module Accordion Expanded Content */}
                            {isExpanded && (
                              <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-150">
                                {mod.description && (
                                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                                    {mod.description}
                                  </p>
                                )}

                                {topicCount > 0 ? (
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                                      Covered Topics ({topicCount}):
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {mod.topics?.map((topic, tidx) => (
                                        <div
                                          key={tidx}
                                          className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 text-xs text-slate-200"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                                          <span className="leading-snug">{topic}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-500 italic">
                                    No topic details specified for this module.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 2: LMS Sprints Architecture & Timeline (LmsManagement)     */}
              {/* ============================================================== */}
              {syllabusTab === "sprints" && (
                <div className="space-y-6">
                  {/* Sprint Architecture Header Notice */}
                  <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 p-4 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                        <Zap className="w-4 h-4" />
                        <span>Curriculum Sprint Architecture</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Configured in Inxyme LMS Management. Chronological sessions, daily milestones, and active tasks.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
                        {sprints.length} Sprint{sprints.length === 1 ? "" : "s"} Active
                      </span>
                    </div>
                  </div>

                  {sprintsLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-3">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                        Fetching LMS Sprints & Sessions...
                      </span>
                    </div>
                  ) : filteredSprints.length === 0 ? (
                    <div className="text-center py-16 bg-slate-950/40 rounded-3xl border border-dashed border-slate-800 text-slate-400 space-y-3">
                      <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">
                          No LMS Sprints Configured for this Course
                        </p>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Sprints and daily sessions can be designed in the Admin Panel under LMS Management &gt; Sprint Architecture.
                        </p>
                      </div>
                      <button
                        onClick={() => setSyllabusTab("curriculum")}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-2"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>View Modules & Topics</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredSprints.map((sprint, sprintIdx) => {
                        const sessionsList = sprint.sessions || [];

                        return (
                          <div
                            key={sprint._id || sprintIdx}
                            className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-lg"
                          >
                            {/* Sprint Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                    Sprint {sprintIdx + 1}
                                  </span>

                                  {sprint.durationInDays && (
                                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                                      {sprint.durationInDays} Days Duration
                                    </span>
                                  )}

                                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    {sprint.isActive ? "Active" : "Draft"}
                                  </span>
                                </div>

                                <h3 className="text-base font-bold text-white">{sprint.name}</h3>

                                {sprint.description && (
                                  <p className="text-xs text-slate-400">{sprint.description}</p>
                                )}
                              </div>

                              {/* Sprint Actions / WhatsApp Link */}
                              <div className="flex items-center gap-2 shrink-0">
                                {sprint.whatsappGroupLink && (
                                  <a
                                    href={sprint.whatsappGroupLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>WhatsApp Batch</span>
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Sprint Goal Banner */}
                            {sprint.goal && (
                              <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-indigo-200">
                                <Target className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-indigo-300 font-semibold uppercase tracking-wider text-[10px] block">
                                    Sprint Learning Milestone:
                                  </strong>
                                  <span>{sprint.goal}</span>
                                </div>
                              </div>
                            )}

                            {/* Sessions Timeline (Pattern from Sessions.jsx) */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>Chronological Sessions ({sessionsList.length})</span>
                                </span>
                              </div>

                              {sessionsList.length === 0 ? (
                                <p className="text-xs text-slate-500 italic bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-center">
                                  No sessions assigned to this sprint yet.
                                </p>
                              ) : (
                                <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-4">
                                  {sessionsList.map((session, sIdx) => {
                                    const isExpanded = Boolean(expandedSessions[session._id]);
                                    const tasksList = session.tasks || [];
                                    const resourcesList = session.resources || [];

                                    return (
                                      <div key={session._id || sIdx} className="relative">
                                        {/* Sequence Circle (like Sessions.jsx) */}
                                        <div className="absolute -left-[35px] top-1.5 w-7 h-7 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center font-black text-[11px] text-white shadow-md">
                                          {sIdx + 1 < 10 ? `0${sIdx + 1}` : sIdx + 1}
                                        </div>

                                        {/* Session Card Detail */}
                                        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all space-y-3">
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="space-y-1">
                                              <div className="flex flex-wrap items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center gap-1">
                                                  <Clock className="w-3 h-3 text-indigo-400" />
                                                  {session.duration || 60} mins
                                                </span>

                                                {session.zoomMeetingLink && (
                                                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30 flex items-center gap-1">
                                                    <Video className="w-3 h-3" />
                                                    Live Interactive
                                                  </span>
                                                )}

                                                {session.videoUrl && (
                                                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                                                    <PlayCircle className="w-3 h-3" />
                                                    Video Recording
                                                  </span>
                                                )}
                                              </div>

                                              <h4 className="text-sm font-bold text-white">
                                                {session.name}
                                              </h4>
                                            </div>

                                            {/* Action links */}
                                            <div className="flex items-center gap-2 shrink-0">
                                              {session.zoomMeetingLink && (
                                                <a
                                                  href={session.zoomMeetingLink}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1"
                                                >
                                                  <span>Join Class</span>
                                                  <ArrowUpRight className="w-3 h-3" />
                                                </a>
                                              )}

                                              {session.videoUrl && (
                                                <a
                                                  href={session.videoUrl}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-semibold flex items-center gap-1 border border-amber-500/30"
                                                >
                                                  <span>Video</span>
                                                  <ExternalLink className="w-3 h-3" />
                                                </a>
                                              )}

                                              {(session.content || tasksList.length > 0 || resourcesList.length > 0) && (
                                                <button
                                                  type="button"
                                                  onClick={() => toggleSession(session._id)}
                                                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                                                  title="Toggle Session Notes"
                                                >
                                                  {isExpanded ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                  ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                  )}
                                                </button>
                                              )}
                                            </div>
                                          </div>

                                          {session.description && (
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                              {session.description}
                                            </p>
                                          )}

                                          {/* Session Expanded Notes & Tasks */}
                                          {isExpanded && (
                                            <div className="pt-3 border-t border-slate-800 space-y-3 animate-in fade-in duration-150">
                                              {session.content && (
                                                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                                    Session Notes & Outline:
                                                  </span>
                                                  <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                                                    {session.content}
                                                  </div>
                                                </div>
                                              )}

                                              {/* Resources */}
                                              {resourcesList.length > 0 && (
                                                <div>
                                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                                                    Session Resources ({resourcesList.length}):
                                                  </span>
                                                  <div className="flex flex-wrap gap-2">
                                                    {resourcesList.map((resItem, rIdx) => (
                                                      <a
                                                        key={rIdx}
                                                        href={resItem.url || "#"}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 text-xs text-indigo-300 flex items-center gap-1.5"
                                                      >
                                                        <Folder className="w-3 h-3 text-indigo-400" />
                                                        <span>{resItem.title || "Resource File"}</span>
                                                        <ExternalLink className="w-3 h-3 text-slate-500" />
                                                      </a>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}

                                              {/* Tasks */}
                                              {tasksList.length > 0 && (
                                                <div>
                                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                                                    Learner Tasks ({tasksList.length}):
                                                  </span>
                                                  <div className="space-y-1.5">
                                                    {tasksList.map((taskItem: any, tIdx: number) => (
                                                      <div
                                                        key={tIdx}
                                                        className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
                                                      >
                                                        <div className="flex items-center gap-2">
                                                          <ListTodo className="w-3.5 h-3.5 text-indigo-400" />
                                                          <span className="text-xs font-semibold text-slate-200">
                                                            {taskItem.title || "Assignment Task"}
                                                          </span>
                                                        </div>
                                                        {taskItem.points !== undefined && (
                                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
                                                            {taskItem.points} pts
                                                          </span>
                                                        )}
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 3: Skills & Learning Outcomes                              */}
              {/* ============================================================== */}
              {syllabusTab === "outcomes" && (
                <div className="space-y-6">
                  {/* What you will learn */}
                  {selectedCourseForModal.whatYouWillLearn &&
                  selectedCourseForModal.whatYouWillLearn.length > 0 ? (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <Target className="w-4 h-4" />
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          Key Learning Takeaways & Objectives
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {selectedCourseForModal.whatYouWillLearn.map((item, oIdx) => (
                          <div
                            key={oIdx}
                            className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-200"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-snug">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Skills acquired */}
                  {selectedCourseForModal.skills &&
                  selectedCourseForModal.skills.length > 0 ? (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <Award className="w-4 h-4" />
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          Target Skills & Tech Stack
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {selectedCourseForModal.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            <span>{skill}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Benefits & Certification */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <GraduationCap className="w-4 h-4" />
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                          Certificate of Completion
                        </h5>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Learners receive an authenticated, verifiable Inxyme Course Completion Certificate upon meeting all syllabus sprint requirements.
                      </p>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Layers className="w-4 h-4" />
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                          Prerequisites & Level
                        </h5>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Course Level: <strong className="text-slate-200 capitalize">{selectedCourseForModal.level || "All Levels"}</strong>.
                        {selectedCourseForModal.prerequisites && selectedCourseForModal.prerequisites.length > 0
                          ? ` Prerequisites: ${selectedCourseForModal.prerequisites.join(", ")}.`
                          : " No strict prerequisites required."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 4: Overview & Details                                       */}
              {/* ============================================================== */}
              {syllabusTab === "overview" && (
                <div className="space-y-4">
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Instructor
                      </span>
                      <span className="text-xs font-bold text-white mt-0.5 block">
                        {selectedCourseForModal.instructor || user?.name || "Inxyme Faculty"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Language
                      </span>
                      <span className="text-xs font-bold text-white mt-0.5 block">
                        {selectedCourseForModal.language || "English"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Enrollment Status
                      </span>
                      <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                        Active Enrolled
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Course Slug / ID
                      </span>
                      <span className="text-xs font-mono text-slate-400 mt-0.5 block truncate">
                        {selectedCourseForModal.slug || selectedCourseForModal._id}
                      </span>
                    </div>
                  </div>

                  {/* Course Full Description */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-indigo-400">
                      <FileText className="w-4 h-4" />
                      <span>Full Course Description</span>
                    </span>
                    <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed pt-1">
                      {selectedCourseForModal.description ||
                        selectedCourseForModal.shortDescription ||
                        "Comprehensive curriculum covering industry-standard engineering, development, and system design patterns."}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="p-4 sm:px-6 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  Active Syllabus: <strong className="text-white">{selectedCourseForModal.title}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedCourseForModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close Syllabus
                </button>

                <Link
                  href="/teacher/dashboard"
                  onClick={() => setSelectedCourseForModal(null)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                >
                  <span>Teacher Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
