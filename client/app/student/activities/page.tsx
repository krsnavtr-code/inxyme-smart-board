"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  BookOpen,
  Search,
  Filter,
  X,
  ChevronRight,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Send,
  Award,
  RefreshCw,
  FileQuestion,
  Layers
} from "lucide-react";

interface Question {
  _id?: string;
  questionText: string;
  maxMarks?: number;
  hint?: string;
}

interface SubmittedAnswer {
  questionIndex: number;
  questionText: string;
  studentAnswer: string;
}

interface Submission {
  _id?: string;
  answers: SubmittedAnswer[];
  submittedAt: string;
  status: string;
  marksObtained?: number;
  feedback?: string;
}

interface Activity {
  _id: string;
  title: string;
  description?: string;
  course: {
    _id: string;
    title: string;
    description?: string;
    image?: string;
  };
  batch?: {
    _id: string;
    name: string;
    code: string;
  };
  activityType: string;
  questions: Question[];
  deadline?: string;
  status: string;
  createdAt: string;
  hasSubmitted: boolean;
  submission: Submission | null;
}

export default function StudentActivitiesPage() {
  const { user } = useAuth();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");

  // Quiz Modal State
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [answersMap, setAnswersMap] = useState<Record<number, string>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (user.id) params.set("userId", user.id);
      if (user.email) params.set("email", user.email);

      const token = typeof window !== "undefined" ? localStorage.getItem("inxyme_token") : null;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/student/activities?${params.toString()}`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to load activities (HTTP ${res.status})`);
      }

      const resData = await res.json();
      setActivities(Array.isArray(resData.activities) ? resData.activities : []);
    } catch (err: any) {
      console.error("Error fetching student activities:", err);
      setError(err.message || "Failed to load course activities");
    } finally {
      setLoading(false);
    }
  };

  // Open Quiz Modal
  const handleOpenQuiz = (act: Activity) => {
    setSelectedActivity(act);
    setSubmissionSuccess(false);

    // If student already submitted, populate previous answers for review
    if (act.hasSubmitted && act.submission?.answers) {
      const prefill: Record<number, string> = {};
      act.submission.answers.forEach((ans, idx) => {
        prefill[ans.questionIndex ?? idx] = ans.studentAnswer;
      });
      setAnswersMap(prefill);
    } else {
      setAnswersMap({});
    }
  };

  const handleCloseQuiz = () => {
    setSelectedActivity(null);
    setAnswersMap({});
    setSubmissionSuccess(false);
  };

  // Submit typed answers
  const handleSubmitQuiz = async () => {
    if (!selectedActivity || !user) return;

    const questions = selectedActivity.questions || [];

    // Check that each question has an answer typed
    for (let i = 0; i < questions.length; i++) {
      const ans = (answersMap[i] || "").trim();
      if (!ans) {
        alert(`Please write an answer for Question ${i + 1} before submitting.`);
        return;
      }
    }

    setSubmittingQuiz(true);
    try {
      const formattedAnswers = questions.map((q, idx) => ({
        questionIndex: idx,
        questionText: q.questionText,
        studentAnswer: (answersMap[idx] || "").trim(),
      }));

      const token = typeof window !== "undefined" ? localStorage.getItem("inxyme_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/student/activities", {
        method: "POST",
        headers,
        body: JSON.stringify({
          activityId: selectedActivity._id,
          userId: user.id,
          email: user.email,
          answers: formattedAnswers,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || "Failed to submit answers");
      }

      setSubmissionSuccess(true);
      fetchActivities(); // Refresh activities to mark as submitted
    } catch (err: any) {
      console.error("Error submitting quiz:", err);
      alert(err.message || "Failed to submit quiz answers");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Unique courses for filter
  const courseMap = new Map<string, { _id: string; title: string }>();
  activities.forEach((a) => {
    if (a.course?._id) {
      courseMap.set(a.course._id, { _id: a.course._id, title: a.course.title || "Course" });
    }
  });
  const uniqueCourses = Array.from(courseMap.values());

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    // 1. Tab filter
    if (activeTab === "pending" && act.hasSubmitted) return false;
    if (activeTab === "completed" && !act.hasSubmitted) return false;

    // 2. Course filter
    if (selectedCourseFilter !== "all") {
      const courseId = act.course?._id || "";
      if (courseId !== selectedCourseFilter) return false;
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchCourse = act.course?.title?.toLowerCase().includes(q);
      const matchDesc = act.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchCourse && !matchDesc) return false;
    }

    return true;
  });

  const totalCount = activities.length;
  const completedCount = activities.filter((a) => a.hasSubmitted).length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Course Academic Activities &amp; Quizzes
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Test Your Knowledge With <span className="text-indigo-400">Course Quizzes</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Assignments and quizzes curated by your course instructors. Answer 1 to 3 conceptual questions in the blank answer box to test your practical understanding.
            </p>
          </div>

          <button
            onClick={fetchActivities}
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Activities</p>
            <p className="text-2xl font-black text-white">{totalCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Pending Quizzes</p>
            <p className="text-2xl font-black text-amber-400">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Completed &amp; Submitted</p>
            <p className="text-2xl font-black text-emerald-400">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filtering Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tab buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Quizzes ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "pending"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "completed"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Course Dropdown & Search Input */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {uniqueCourses.length > 0 && (
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="w-full sm:w-56 text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium"
            >
              <option value="all">All Enrolled Courses</option>
              {uniqueCourses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          )}

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quiz by title or keyword..."
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Activities Grid */}
      {loading ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-16 text-center text-slate-400">
          <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold">Loading your course activities &amp; quizzes...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 text-center text-red-400 space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p className="text-sm font-bold">Failed to load activities</p>
          <p className="text-xs text-red-400/80">{error}</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-16 text-center shadow-inner space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <FileQuestion className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No Activities Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {activeTab === "pending"
              ? "Awesome! You have completed all assigned quizzes for your enrolled courses."
              : activeTab === "completed"
              ? "You haven't submitted any quizzes yet. Check the Pending tab to get started!"
              : "No activities have been published for your enrolled courses yet. Check back soon!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredActivities.map((act) => {
            const hasSubmitted = act.hasSubmitted;
            const isGraded = act.submission?.status === "Graded";
            const qCount = act.questions?.length || 0;

            return (
              <div
                key={act._id}
                className="bg-slate-900/70 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl group"
              >
                <div className="space-y-3">
                  {/* Top Tags */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 truncate max-w-[180px]">
                      {act.course?.title || "Enrolled Course"}
                    </span>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        hasSubmitted
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {hasSubmitted ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          {isGraded ? "Graded" : "Submitted"}
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          Pending Quiz
                        </>
                      )}
                    </span>
                  </div>

                  {/* Activity Title */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {act.title}
                    </h3>
                    {act.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {act.description}
                      </p>
                    )}
                  </div>

                  {/* Quiz Details bar */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 font-medium">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{qCount} Questions (1 - 3)</span>
                    </div>

                    {act.deadline && (
                      <div className="text-[11px] text-slate-400">
                        Due: {new Date(act.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Submission evaluation preview if graded */}
                  {isGraded && act.submission?.marksObtained !== undefined && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
                      <span className="text-emerald-300 font-semibold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        Score: {act.submission.marksObtained} Marks
                      </span>
                      <span className="text-[11px] text-emerald-400 font-bold">Feedback Available</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action Button */}
                <div className="pt-4 mt-2">
                  <button
                    onClick={() => handleOpenQuiz(act)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      hasSubmitted
                        ? "bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25"
                    }`}
                  >
                    {hasSubmitted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        View Your Answers
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Start Quiz ({qCount} Questions)
                      </>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUIZ TAKING / REVIEW MODAL */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Top Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                  {selectedActivity.course?.title || "Course Quiz"}
                </div>
                <h2 className="text-lg font-bold text-white">{selectedActivity.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedActivity.hasSubmitted
                    ? "Review your submitted answers and teacher evaluation below."
                    : "Type your answer for each question in the blank box below and click submit."}
                </p>
              </div>

              <button
                onClick={handleCloseQuiz}
                className="p-1.5 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Scrollable Questions */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Instructions banner */}
              {selectedActivity.description && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-200">Instructions: </span>
                    {selectedActivity.description}
                  </div>
                </div>
              )}

              {/* Success Banner if just submitted */}
              {submissionSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-emerald-200">Quiz Submitted Successfully!</p>
                    <p className="text-emerald-400/90 text-xs mt-0.5">
                      Your answers have been recorded and will be evaluated by your course instructor.
                    </p>
                  </div>
                </div>
              )}

              {/* Questions List with Typed Answer Boxes */}
              <div className="space-y-6">
                {selectedActivity.questions?.map((q, idx) => {
                  const hasSubmitted = selectedActivity.hasSubmitted || submissionSuccess;
                  const currentAnswer = answersMap[idx] || "";

                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3.5"
                    >
                      {/* Question Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                            Question {idx + 1} of {selectedActivity.questions.length}
                          </span>
                        </div>

                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          Max Marks: {q.maxMarks || 10}
                        </span>
                      </div>

                      {/* Question Text */}
                      <p className="text-sm font-semibold text-slate-100 leading-relaxed pl-1">
                        {q.questionText}
                      </p>

                      {/* Optional Hint */}
                      {q.hint && (
                        <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
                          <span className="font-bold text-indigo-400">💡 Hint:</span>
                          <span>{q.hint}</span>
                        </div>
                      )}

                      {/* THE BLANK ANSWER BOX */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-300">
                            {hasSubmitted ? "Your Submitted Answer:" : "Your Answer (Type below): *"}
                          </label>

                          {!hasSubmitted && (
                            <span className="text-[10px] text-slate-500">
                              {currentAnswer.length} characters
                            </span>
                          )}
                        </div>

                        {hasSubmitted ? (
                          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
                            {currentAnswer || "(No answer recorded)"}
                          </div>
                        ) : (
                          <textarea
                            value={currentAnswer}
                            onChange={(e) =>
                              setAnswersMap({ ...answersMap, [idx]: e.target.value })
                            }
                            rows={4}
                            placeholder="Type your complete answer here. You can write explanations, logic, or bullet points..."
                            className="w-full text-xs p-3.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Evaluation and Feedback Banner if Graded */}
              {selectedActivity.hasSubmitted && selectedActivity.submission?.status === "Graded" && (
                <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-400" />
                      Instructor Evaluation
                    </span>
                    <span className="text-xs font-black text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                      Marks: {selectedActivity.submission.marksObtained ?? "N/A"}
                    </span>
                  </div>
                  {selectedActivity.submission.feedback && (
                    <p className="text-xs text-slate-300 italic bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                      "{selectedActivity.submission.feedback}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {selectedActivity.hasSubmitted || submissionSuccess ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Answers recorded on {new Date().toLocaleDateString()}
                  </span>
                ) : (
                  <span>All {selectedActivity.questions?.length || 0} questions required.</span>
                )}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseQuiz}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {selectedActivity.hasSubmitted || submissionSuccess ? "Close" : "Cancel"}
                </button>

                {!selectedActivity.hasSubmitted && !submissionSuccess && (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={submittingQuiz}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingQuiz ? "Submitting Answers..." : "Submit Quiz Answers"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
