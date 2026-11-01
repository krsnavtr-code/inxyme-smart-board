"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Course, LmsSprint } from "@/types/course";
import {
  BookOpen,
  Search,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Layers,
  ChevronRight,
  X,
  FileText,
  AlertCircle,
  Video,
  CheckCircle2,
  Calendar,
  Zap,
  Info
} from "lucide-react";

export default function StudentCoursesPage() {
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Syllabus Modal
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);
  const [sprints, setSprints] = useState<LmsSprint[]>([]);
  const [sprintsLoading, setSprintsLoading] = useState(false);
  const [syllabusTab, setSyllabusTab] = useState<"curriculum" | "sprints" | "overview">("curriculum");

  const fetchStudentCourses = async () => {
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

      const res = await fetch(`/api/teacher/courses?${params.toString()}`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to load courses (HTTP ${res.status})`);
      }
      const data = await res.json();
      const rawList: Course[] = Array.isArray(data.courses) ? data.courses : [];
      setCourses(rawList);
    } catch (err: any) {
      console.error("Error loading student courses:", err);
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentCourses();
  }, [user]);

  // Load sprints for modal
  const openSyllabusModal = async (course: Course) => {
    setSelectedCourseForModal(course);
    setSyllabusTab("curriculum");
    setSprintsLoading(true);
    try {
      const res = await fetch(`/api/courses/${course._id}/sprints`);
      if (res.ok) {
        const data = await res.json();
        setSprints(Array.isArray(data.sprints) ? data.sprints : []);
      }
    } catch {
      setSprints([]);
    } finally {
      setSprintsLoading(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = (c.title || "").toLowerCase().includes(q);
    const descMatch = (c.description || "").toLowerCase().includes(q);
    return titleMatch || descMatch;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                Academic Curriculum
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">My Enrolled Courses</h1>
              <p className="text-xs text-slate-400">
                Browse detailed syllabus, module breakdowns, learning outcomes, and course materials.
              </p>
            </div>

            <button
              onClick={fetchStudentCourses}
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
              placeholder="Search by course name or keyword..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400 pr-2 font-medium">
            {filteredCourses.length} {filteredCourses.length === 1 ? "Course" : "Courses"} Enrolled
          </span>
        </section>

        {/* Loading */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Loading your enrolled courses...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <p className="text-sm font-bold">Failed to load courses</p>
              <p className="text-xs text-rose-400/90">{error}</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-4 bg-slate-900/30">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-white">No Enrolled Courses Found</h3>
              <p className="text-xs text-slate-400">
                You do not have any active course enrollments yet. Contact your administrator to enroll in courses.
              </p>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const curriculumCount = Array.isArray(course.curriculum) ? course.curriculum.length : 0;
              return (
                <div
                  key={course._id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                        {typeof course.category === "object" ? course.category?.name : course.category || "Course"}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Enrolled</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {course.description || "Comprehensive hands-on curriculum with real-world projects."}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{course.duration || "Self-Paced"}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        <span>{curriculumCount} Modules</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center gap-2">
                    <button
                      onClick={() => openSyllabusModal(course)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View Full Syllabus</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Syllabus Modal */}
      {selectedCourseForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 uppercase">
                  Course Syllabus
                </span>
                <h2 className="text-lg font-bold text-white">{selectedCourseForModal.title}</h2>
                <p className="text-xs text-slate-400 line-clamp-1">{selectedCourseForModal.description}</p>
              </div>

              <button
                onClick={() => setSelectedCourseForModal(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 pt-3 border-b border-slate-800 bg-slate-950/40 flex items-center gap-3">
              <button
                onClick={() => setSyllabusTab("curriculum")}
                className={`pb-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  syllabusTab === "curriculum"
                    ? "border-indigo-500 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Curriculum Modules ({selectedCourseForModal.curriculum?.length || 0})
              </button>
              <button
                onClick={() => setSyllabusTab("sprints")}
                className={`pb-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  syllabusTab === "sprints"
                    ? "border-indigo-500 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Learning Sprints ({sprints.length})
              </button>
              <button
                onClick={() => setSyllabusTab("overview")}
                className={`pb-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  syllabusTab === "overview"
                    ? "border-indigo-500 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Course Overview
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              {syllabusTab === "curriculum" && (
                <div className="space-y-3">
                  {Array.isArray(selectedCourseForModal.curriculum) &&
                  selectedCourseForModal.curriculum.length > 0 ? (
                    selectedCourseForModal.curriculum.map((topic, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">
                              {topic.week || idx + 1}
                            </span>
                            <span>{topic.title}</span>
                          </span>
                          {topic.duration && (
                            <span className="text-slate-400 text-[11px] font-normal">{topic.duration}</span>
                          )}
                        </div>
                        {topic.description && (
                          <p className="text-xs text-slate-400 pl-7">{topic.description}</p>
                        )}
                        {Array.isArray(topic.topics) && topic.topics.length > 0 && (
                          <div className="pl-7 pt-1 flex flex-wrap gap-1.5">
                            {topic.topics.map((sub, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-500">
                      Curriculum outline is being updated by the academic director.
                    </div>
                  )}
                </div>
              )}

              {syllabusTab === "sprints" && (
                <div className="space-y-3">
                  {sprintsLoading ? (
                    <div className="py-12 text-center text-xs text-slate-400">Loading sprints...</div>
                  ) : sprints.length > 0 ? (
                    sprints.map((sprint) => (
                      <div
                        key={sprint._id}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{sprint.name}</h4>
                          <span className="text-[10px] text-slate-400">
                            {sprint.durationInDays ? `${sprint.durationInDays} Days` : "Sprint"}
                          </span>
                        </div>
                        {sprint.goal && (
                          <p className="text-xs text-indigo-300">Goal: {sprint.goal}</p>
                        )}
                        {sprint.description && (
                          <p className="text-xs text-slate-400">{sprint.description}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-500">
                      No active sprints published for this course.
                    </div>
                  )}
                </div>
              )}

              {syllabusTab === "overview" && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                    <h4 className="font-bold text-white">About the Course</h4>
                    <p className="text-slate-400">{selectedCourseForModal.description}</p>
                  </div>

                  {Array.isArray(selectedCourseForModal.whatYouWillLearn || selectedCourseForModal.highlights) &&
                    ((selectedCourseForModal.whatYouWillLearn || selectedCourseForModal.highlights)?.length ?? 0) > 0 && (
                      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                        <h4 className="font-bold text-white">What You Will Learn</h4>
                        <ul className="space-y-1 list-disc list-inside text-slate-400">
                          {(selectedCourseForModal.whatYouWillLearn || selectedCourseForModal.highlights || []).map((h: string, i: number) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
              <button
                onClick={() => setSelectedCourseForModal(null)}
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

