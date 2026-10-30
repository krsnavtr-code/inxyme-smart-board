"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Course } from "@/types/course";
import {
  BookOpen,
  Search,
  Tv,
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
  DollarSign
} from "lucide-react";

export default function TeacherCoursesPage() {
  const router = useRouter();

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Selected Course for Syllabus Modal
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);

  // Fetch Published Courses
  const fetchPublishedCourses = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("https://www.inxyme.com/api/courses");
      if (!res.ok) {
        throw new Error(`Failed to fetch courses (HTTP ${res.status})`);
      }

      const data = await res.json();
      const rawList: Course[] = Array.isArray(data) ? data : data.courses || [];

      // Filter only published courses
      const publishedOnly = rawList.filter((course) => course.isPublished === true);
      setCourses(publishedOnly);
    } catch (err: unknown) {
      console.error("Error fetching published courses:", err);
      const msg = err instanceof Error ? err.message : "Unable to load courses from API";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishedCourses();
  }, []);

  // Extract distinct categories
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

  // Filtered courses
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

  const handleTeachCourse = (course: Course) => {
    // Generate a clean room code based on the course slug or ID
    const roomSuffix = course.slug
      ? course.slug.split("-")[0].toUpperCase()
      : course._id.slice(-4).toUpperCase();
    const roomCode = `INX-${roomSuffix}`;

    router.push(`/live/learn-board?room=${encodeURIComponent(roomCode)}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <div className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-4 sm:px-8 py-6">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat
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
            <h3 className="text-base font-bold text-white mb-1">Failed to Load Courses</h3>
            <p className="text-xs text-slate-400 mb-5">{error}</p>
            <button
              onClick={fetchPublishedCourses}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <BookOpen className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No Published Courses Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              {searchQuery
                ? `No courses matching "${searchQuery}" in ${selectedCategory === "ALL" ? "any category" : selectedCategory}.`
                : "No published courses are currently available."}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Published Courses Grid */}
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
                      onError={(e) => {
                        // Fallback image on broken URL
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                    {/* Published Status & Level Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Published
                      </span>
                      {course.level && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700/60 backdrop-blur-md">
                          {course.level}
                        </span>
                      )}
                    </div>

                    {/* Category Tag */}
                    {course.category?.name && (
                      <div className="absolute bottom-3 left-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-600/90 text-white backdrop-blur-md">
                          {course.category.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
                        {course.title}
                      </h3>

                      {course.shortDescription && (
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {course.shortDescription}
                        </p>
                      )}

                      {/* Meta stats */}
                      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
                        {course.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{course.duration} Weeks</span>
                          </div>
                        )}
                        {course.totalHours && (
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span>{course.totalHours} hrs</span>
                          </div>
                        )}
                        {course.curriculum && course.curriculum.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span>{course.curriculum.length} Modules</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                            Enrollment Fee
                          </span>
                          <span className="text-sm font-extrabold text-white">
                            {course.isFree || !course.price
                              ? "Free"
                              : `₹${course.price.toLocaleString("en-IN")}`}
                          </span>
                        </div>

                        {/* View Syllabus Modal Trigger */}
                        {course.curriculum && course.curriculum.length > 0 && (
                          <button
                            onClick={() => setSelectedCourseForModal(course)}
                            className="text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
                          >
                            <span>Syllabus</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Direct Action: Teach on Smart Board */}
                      <button
                        onClick={() => handleTeachCourse(course)}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>Teach on Smart Board</span>
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
            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedCourseForModal(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const course = selectedCourseForModal;
                  setSelectedCourseForModal(null);
                  handleTeachCourse(course);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Launch This Course on Smart Board</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
