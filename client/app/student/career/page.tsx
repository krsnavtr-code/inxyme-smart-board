"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { JobOpportunity, CareerServicesData } from "@/types/career";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Award,
  TrendingUp,
  FileText,
  UserCheck,
  Send,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Video,
  X,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  BookOpen,
  MessageSquare,
  HelpCircle,
  FileCode
} from "lucide-react";

export default function StudentCareerPage() {
  const { user } = useAuth();

  const [data, setData] = useState<CareerServicesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"referred" | "all" | "services">("referred");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");

  // Selected job for detail modal
  const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applicationSuccess, setApplicationSuccess] = useState<string | null>(null);

  // Mock interview booking modal
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  const [mockDomain, setMockDomain] = useState("Full Stack MERN");
  const [mockDate, setMockDate] = useState("");
  const [bookingMock, setBookingMock] = useState(false);
  const [mockSuccess, setMockSuccess] = useState(false);

  // Resume review modal
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [resumeUrlInput, setResumeUrlInput] = useState("");
  const [submittingResume, setSubmittingResume] = useState(false);
  const [resumeSuccess, setResumeSuccess] = useState(false);

  const fetchCareerData = async () => {
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

      const res = await fetch(`/api/student/career?${params.toString()}`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to load career services data (HTTP ${res.status})`);
      }

      const resData = await res.json();
      setData(resData);
    } catch (err: any) {
      console.error("Error loading student career services:", err);
      setError(err.message || "Failed to load career services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareerData();
  }, [user]);

  const handleApply = async (jobId: string) => {
    setApplyingJobId(jobId);
    setApplicationSuccess(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("inxyme_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/student/career", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "apply",
          jobId,
          userId: user?.id,
          notes: "Applied via Inxyme Student Portal",
        }),
      });

      const resData = await res.json();
      setApplicationSuccess(resData.message || "Application submitted successfully!");
      fetchCareerData();
    } catch (err: any) {
      console.error("Error applying:", err);
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleBookMockInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingMock(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("inxyme_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch("/api/student/career", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "mock_interview",
          userId: user?.id,
          domain: mockDomain,
          date: mockDate,
        }),
      });

      setMockSuccess(true);
      setTimeout(() => {
        setIsMockModalOpen(false);
        setMockSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("Mock booking error:", err);
    } finally {
      setBookingMock(false);
    }
  };

  const handleResumeReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingResume(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("inxyme_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch("/api/student/career", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "resume_review",
          userId: user?.id,
          resumeUrl: resumeUrlInput,
        }),
      });

      setResumeSuccess(true);
      setTimeout(() => {
        setIsResumeModalOpen(false);
        setResumeSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("Resume review error:", err);
    } finally {
      setSubmittingResume(false);
    }
  };

  // Filtered jobs
  const referredJobs = data?.referredJobs || [];
  const otherOpenJobs = data?.otherOpenJobs || [];

  const currentList = activeTab === "referred" ? referredJobs : otherOpenJobs;

  const filteredJobs = currentList.filter((job) => {
    const q = searchQuery.toLowerCase().trim();
    const titleMatch = (job.title || "").toLowerCase().includes(q);
    const companyMatch = (job.companyName || "").toLowerCase().includes(q);
    const locationMatch = (job.location || "").toLowerCase().includes(q);
    const textMatches = !q || titleMatch || companyMatch || locationMatch;

    const typeMatches =
      jobTypeFilter === "all" ||
      job.jobType.toLowerCase() === jobTypeFilter.toLowerCase();

    return textMatches && typeMatches;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* HERO BANNER */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>Inxyme Career &amp; Placement Services</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Job Referrals &amp;{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-300">
                  Placement Support
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Explore exclusive hiring partner referrals assigned directly from your batch cohorts. Access 1-on-1 mock interviews, ATS resume reviews, and verified tech company drives.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsMockModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Book Mock Interview</span>
              </button>

              <button
                onClick={() => setIsResumeModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs sm:text-sm border border-slate-700 shadow-lg transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>ATS Resume Review</span>
              </button>
            </div>
          </div>
        </section>

        {/* STATS OVERVIEW */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Referrals */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Batch Job Referrals</span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {data?.stats?.totalReferred || 0}
            </p>
            <p className="text-[11px] text-indigo-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Recommended by Inxyme Academic Cell</span>
            </p>
          </div>

          {/* Shortlisted */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Profiles Shortlisted</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {data?.stats?.shortlistedCount || 0}
            </p>
            <p className="text-[11px] text-emerald-400 font-medium">
              Passed initial hiring partner screening
            </p>
          </div>

          {/* Interviews Scheduled */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2 relative overflow-hidden group hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Interviews Scheduled</span>
              <div className="w-9 h-9 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {data?.stats?.interviewCount || 0}
            </p>
            <p className="text-[11px] text-purple-300 font-medium">
              Technical / HR round active
            </p>
          </div>

          {/* Placement Preparedness */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2 relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Offers &amp; Selections</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {data?.stats?.selectedCount || 0}
            </p>
            <p className="text-[11px] text-amber-300 font-medium">
              Official company offers received
            </p>
          </div>
        </section>

        {/* TABS NAVIGATION */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab("referred")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "referred"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>My Batch Referrals ({referredJobs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Open Hiring Drives ({otherOpenJobs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "services"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Placement Prep Hub</span>
            </button>
          </div>

          {activeTab !== "services" && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-60">
                <input
                  type="text"
                  placeholder="Search role, company, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              </div>

              {/* Type Filter */}
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>

              <button
                onClick={fetchCareerData}
                disabled={loading}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Refresh jobs"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          )}
        </section>

        {/* TAB 1 & 2: JOBS GRID (REFERRED OR OPEN) */}
        {activeTab !== "services" && (
          <section className="space-y-4">
            {loading ? (
              <div className="p-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                <span>Loading career opportunities...</span>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {activeTab === "referred"
                    ? "No Direct Referrals Assigned Yet"
                    : "No Hiring Drives Match Your Search"}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  {activeTab === "referred"
                    ? "Your instructors and placement cell review your sprint milestones and projects to assign company referrals directly from your batch cohorts."
                    : "Try adjusting your search query or check back soon for fresh partner listings."}
                </p>
                {activeTab === "referred" && (
                  <button
                    onClick={() => setActiveTab("all")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    <span>Browse All Open Hiring Drives</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredJobs.map((job) => {
                  const isReferredTab = activeTab === "referred";
                  const status = job.referralStatus || "Referred";

                  return (
                    <div
                      key={job._id}
                      className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                        isReferredTab
                          ? "bg-slate-900/90 border-indigo-500/40 shadow-xl shadow-indigo-500/5 hover:border-indigo-400"
                          : "bg-slate-900/70 border-slate-800 hover:border-slate-700 shadow-lg"
                      } space-y-5`}
                    >
                      <div className="space-y-3">
                        {/* Top Badge Bar */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                              {job.jobType}
                            </span>
                            {job.batchName && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                {job.batchName}
                              </span>
                            )}
                          </div>

                          {isReferredTab && (
                            <span
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                status === "Offer Received"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : status === "Interview Scheduled"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  : status === "Shortlisted"
                                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                                  : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                              }`}
                            >
                              {status}
                            </span>
                          )}
                        </div>

                        {/* Title & Company */}
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>{job.companyName || "Inxyme Hiring Partner"}</span>
                            <span>•</span>
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{job.location}</span>
                          </p>
                        </div>

                        {/* Salary & Deadline */}
                        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                          {job.salary && (
                            <div className="flex items-center gap-1 text-emerald-400 font-bold">
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>{job.salary}</span>
                            </div>
                          )}
                          {job.applicationDeadline && (
                            <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>
                                Deadline:{" "}
                                {new Date(job.applicationDeadline).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Admin Referral Notes */}
                        {isReferredTab && job.referralNotes && (
                          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 text-xs text-indigo-200 space-y-0.5">
                            <span className="font-bold text-[10px] text-indigo-400 uppercase tracking-wider block">
                              Faculty Referral Remark
                            </span>
                            <p className="leading-relaxed">{job.referralNotes}</p>
                          </div>
                        )}

                        {/* Description */}
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Skills / Requirements tags */}
                        {job.requirements && job.requirements.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {job.requirements.slice(0, 4).map((req, rIdx) => (
                              <span
                                key={rIdx}
                                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 text-slate-300 border border-slate-800"
                              >
                                {req}
                              </span>
                            ))}
                            {job.requirements.length > 4 && (
                              <span className="text-[10px] px-1.5 py-0.5 text-slate-500">
                                +{job.requirements.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                        >
                          View Full Job Profile &rarr;
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApply(job._id)}
                            disabled={applyingJobId === job._id || job.referralStatus === "Applied"}
                            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              job.referralStatus === "Applied"
                                ? "bg-slate-800 text-slate-400 cursor-default"
                                : "bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white shadow-md shadow-indigo-600/30"
                            }`}
                          >
                            {applyingJobId === job._id
                              ? "Submitting..."
                              : job.referralStatus === "Applied"
                              ? "Application Sent"
                              : isReferredTab
                              ? "Accept & Confirm"
                              : "Apply Now"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: PLACEMENT PREP SERVICES HUB */}
        {activeTab === "services" && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1-on-1 Mock Interview */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">1-on-1 Mock Technical Interview</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Practice real technical interview questions with senior engineering mentors simulating top product company hiring rounds.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMockModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  Schedule Interview Slot
                </button>
              </div>

              {/* ATS Resume Review */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">ATS Resume Review &amp; Optimization</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Get your CV audited for ATS parsers, keyword density, project impact metrics, and role-specific formatting.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsResumeModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  Submit Resume for Audit
                </button>
              </div>

              {/* Placement Helpline */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Placement Officer Consultation</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Connect directly with Inxyme career advisors for salary negotiation guidance, company culture insights, and referral queries.
                    </p>
                  </div>
                </div>

                <a
                  href="mailto:placements@inxyme.com?subject=Placement Support Request"
                  className="w-full text-center py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                >
                  Contact Placement Cell
                </a>
              </div>
            </div>

            {/* Preparation Roadmap Resources */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>Placement Preparation Kits &amp; Cheat Sheets</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-xs font-bold text-white">MERN &amp; React 19 Interview Guide</p>
                  <p className="text-[11px] text-slate-400">Core architecture, state, lifecycle &amp; hooks</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-xs font-bold text-white">Node.js, Express &amp; MongoDB</p>
                  <p className="text-[11px] text-slate-400">REST APIs, JWT auth, pipelines &amp; indexing</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-xs font-bold text-white">System Design for Juniors</p>
                  <p className="text-[11px] text-slate-400">Caching, load balancing, databases &amp; scale</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* JOB DETAIL & APPLY MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[88vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase">
                    {selectedJob.jobType}
                  </span>
                  {selectedJob.referralStatus && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase">
                      Status: {selectedJob.referralStatus}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">{selectedJob.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedJob.companyName || "Inxyme Hiring Partner"}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedJob.location}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed flex-1">
              {applicationSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{applicationSuccess}</span>
                </div>
              )}

              {selectedJob.referralNotes && (
                <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-900/60 space-y-1">
                  <span className="font-bold text-[10px] text-indigo-400 uppercase tracking-wider block">
                    Faculty Referral Remark
                  </span>
                  <p className="text-indigo-200">{selectedJob.referralNotes}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Role Overview
                </h4>
                <p className="whitespace-pre-line text-slate-400">{selectedJob.description}</p>
              </div>

              {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    Responsibilities
                  </h4>
                  <ul className="space-y-1 list-disc list-inside text-slate-400">
                    {selectedJob.responsibilities.map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    Skills &amp; Requirements
                  </h4>
                  <ul className="space-y-1 list-disc list-inside text-slate-400">
                    {selectedJob.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Compensation / CTC</span>
                  <span className="font-black text-emerald-400 text-sm">
                    {selectedJob.salary || "Competitive Market Standard"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase">Deadline</span>
                  <span className="font-semibold text-slate-300">
                    {new Date(selectedJob.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => handleApply(selectedJob._id)}
                disabled={applyingJobId === selectedJob._id || selectedJob.referralStatus === "Applied"}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {applyingJobId === selectedJob._id
                  ? "Submitting..."
                  : selectedJob.referralStatus === "Applied"
                  ? "Application Submitted"
                  : "Confirm & Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOCK INTERVIEW BOOKING MODAL */}
      {isMockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Book 1-on-1 Mock Interview</h3>
              </div>
              <button
                onClick={() => setIsMockModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookMockInterview} className="p-6 space-y-4">
              {mockSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Mock session requested! Mentor will confirm timing via email.</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Technical Domain</label>
                <select
                  value={mockDomain}
                  onChange={(e) => setMockDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Full Stack MERN">Full Stack MERN Stack</option>
                  <option value="Frontend React">Frontend React &amp; Next.js</option>
                  <option value="Backend Node">Backend Node.js &amp; Microservices</option>
                  <option value="Data Analytics">Data Analytics &amp; Python</option>
                  <option value="HR / Cultural Fit">HR &amp; Behavioral Round</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={mockDate}
                  onChange={(e) => setMockDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                You will receive a Google Meet link and interview briefing 4 hours prior to the session.
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMockModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingMock}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {bookingMock ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATS RESUME AUDIT MODAL */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">ATS Resume Optimization</h3>
              </div>
              <button
                onClick={() => setIsResumeModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResumeReviewSubmit} className="p-6 space-y-4">
              {resumeSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Resume submitted! Inxyme placement review report will be emailed within 24 hours.</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Google Drive / PDF Link to Resume
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  value={resumeUrlInput}
                  onChange={(e) => setResumeUrlInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <p className="text-[10px] text-slate-500">
                  Please ensure link sharing permissions are set to &quot;Anyone with the link can view&quot;.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResume}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingResume ? "Submitting..." : "Submit for Audit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

