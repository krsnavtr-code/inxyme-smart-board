"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Course } from "@/types/course";
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
  X,
  FileText,
  Tag,
  DollarSign,
  GraduationCap
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

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <div className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-4 sm:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                My Enrolled Courses
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Enrolled
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active courses enrolled for <span className="text-slate-200 font-semibold">{user?.name || "your faculty profile"}</span> ({courses.length} courses).
            </p>
          </div>

          <button
            onClick={fetchEnrolledCourses}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course title, skill, or level..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80"
                }`}
              >
                {cat === "ALL" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content / Courses Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 space-y-4 animate-pulse"
              >
                <div className="w-full h-44 rounded-2xl bg-slate-800/60" />
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800/50 rounded w-1/2" />
                <div className="h-9 bg-slate-800/70 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-md mx-auto text-center p-8 bg-slate-900 border border-rose-500/30 rounded-3xl shadow-2xl my-12">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Failed to Load Enrolled Courses</h3>
            <p className="text-xs text-slate-400 mb-5">{error}</p>
            <button
              onClick={fetchEnrolledCourses}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <BookOpen className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No Active Enrolled Courses Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">
              {searchQuery
                ? `No enrolled courses match "${searchQuery}" in ${selectedCategory === "ALL" ? "any category" : selectedCategory}.`
                : "You are not currently enrolled in any active courses. Contact the administrator in Users Management to enroll your faculty account."}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 cursor-pointer"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        )}

        {/* Active Enrolled Courses Grid */}
        {!loading && !error && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const thumbnailSrc =
                course.thumbnail ||
                course.image ||
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600";

              return (
                <div
                  key={course._id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group"
                >
                  {/* Top Thumbnail Section */}
                  <div className="relative w-full h-44 bg-slate-950 overflow-hidden">
                    <img
                      src={thumbnailSrc}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                    {/* Active Enrolled Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Active Enrolled
                      </span>
                    </div>

                    {/* Level / Duration Tag */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-medium text-slate-300">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-900/90 border border-slate-700/80 backdrop-blur-md">
                        {course.level || "All Levels"}
                      </span>
                      {course.duration && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/90 border border-slate-700/80 backdrop-blur-md">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          <span>{course.duration}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Category Pill */}
                      {course.category?.name && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                          {course.category.name}
                        </span>
                      )}

                      <h3
                        className="text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors"
                        title={course.title}
                      >
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {course.shortDescription ||
                          course.description ||
                          "Comprehensive curriculum covering core principles, hands-on derivations, and practice."}
                      </p>
                    </div>

                    {/* Skills Covered Pills */}
                    {course.skills && course.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {course.skills.slice(0, 3).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] text-slate-400 border border-slate-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {course.skills.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-950 text-[10px] text-slate-500 border border-slate-800">
                            +{course.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bottom Metadata & Action Buttons */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          <span>
                            {course.curriculum?.length
                              ? `${course.curriculum.length} Learning Modules`
                              : "Structured Modules"}
                          </span>
                        </div>

                        {/* View Syllabus Trigger */}
                        {course.curriculum && course.curriculum.length > 0 && (
                          <button
                            onClick={() => setSelectedCourseForModal(course)}
                            className="text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>Syllabus</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Course Syllabus Action */}
                      <button
                        onClick={() => setSelectedCourseForModal(course)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 hover:border-indigo-500/50 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>View Syllabus & Curriculum</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Syllabus / Curriculum Modal */}
      {selectedCourseForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedCourseForModal(null)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
          />

          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setSelectedCourseForModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-4 pr-8">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
                {selectedCourseForModal.category?.name || "Curriculum"}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5 leading-snug">
                {selectedCourseForModal.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Course Syllabus & Structured Learning Modules
              </p>
            </div>

            {/* Modules List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {selectedCourseForModal.curriculum?.map((mod, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
                        {mod.week || idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-white">{mod.title}</h4>
                    </div>
                    {mod.duration && (
                      <span className="text-[10px] text-slate-500">{mod.duration} hrs</span>
                    )}
                  </div>

                  {mod.description && (
                    <p className="text-xs text-slate-400 leading-relaxed">{mod.description}</p>
                  )}

                  {mod.topics && mod.topics.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1.5">
                        Key Topics Covered:
                      </span>
                      <ul className="space-y-1">
                        {mod.topics.map((t, tidx) => (
                          <li
                            key={tidx}
                            className="text-xs text-slate-300 flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Bottom CTA */}
            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-end">
              <button
                onClick={() => setSelectedCourseForModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Syllabus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
