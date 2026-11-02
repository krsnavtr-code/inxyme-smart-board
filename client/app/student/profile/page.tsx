"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Wallet,
  CheckCircle2,
  Clock,
  Layers,
  BookOpen,
  Edit3,
  X,
  Save,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Gift,
  FileText,
  UploadCloud,
  Eye,
  Trash2,
  RefreshCw,
  Download
} from "lucide-react";

interface EnrolledCourse {
  _id?: string;
  id?: string;
  title: string;
  thumbnail?: string;
  slug?: string;
  category?: string;
  price?: number;
  level?: string;
  status?: string;
}

interface EnrolledBatch {
  _id?: string;
  id?: string;
  batchName: string;
  batchCode?: string;
  timing?: string;
}

interface ProfileData {
  _id?: string;
  fullname: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  designation: string;
  upiId: string;
  studentId: string;
  referralCode: string;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt?: string;
  resumeUrl?: string;
  resumeName?: string;
  resumeUpdatedAt?: string;
  enrolledCourses: EnrolledCourse[];
  enrolledBatches: EnrolledBatch[];
}

export default function StudentProfilePage() {
  const router = useRouter();
  const { user, updateUser, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Resume Upload State
  const [uploadingResume, setUploadingResume] = useState<boolean>(false);
  const [resumeError, setResumeError] = useState<string>("");

  // Form State
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    address: "",
    department: "",
    designation: "",
    upiId: "",
  });

  // Fetch student profile from API
  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const q = new URLSearchParams();
      if (user.id) q.set("userId", user.id);
      if (user.email) q.set("email", user.email);

      const res = await fetch(`/api/student/profile?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const p = data.user || {};
        const profileObj: ProfileData = {
          _id: p._id || p.id || user.id,
          fullname: p.fullname || p.name || user.name || "",
          email: p.email || user.email || "",
          phone: p.phone || user.phone || "",
          address: p.address || user.address || "",
          department: p.department || user.department || "Computer Science & IT",
          designation: p.designation || user.headline || "Student",
          upiId: p.upiId || user.upiId || "",
          studentId: p.studentId || `INX-STU-${String(user.id).slice(-4).toUpperCase()}`,
          referralCode: p.referralCode || user.referralCode || `INX-${(user.name || "STU").slice(0, 3).toUpperCase()}${String(user.id).slice(-3).toUpperCase()}`,
          role: p.role || "student",
          isActive: p.isActive !== false,
          isApproved: p.isApproved !== false,
          createdAt: p.createdAt,
          resumeUrl: p.resumeUrl || user.resumeUrl || "",
          resumeName: p.resumeName || user.resumeName || "",
          resumeUpdatedAt: p.resumeUpdatedAt || user.resumeUpdatedAt || "",
          enrolledCourses: p.enrolledCourses || [],
          enrolledBatches: p.enrolledBatches || [],
        };

        setProfile(profileObj);
        setFormData({
          fullname: profileObj.fullname,
          phone: profileObj.phone,
          address: profileObj.address,
          department: profileObj.department,
          designation: profileObj.designation,
          upiId: profileObj.upiId,
        });
      } else {
        // Fallback to auth context user
        const fallbackObj: ProfileData = {
          _id: user.id,
          fullname: user.name || "Enrolled Student",
          email: user.email || "student@inxyme.com",
          phone: user.phone || "",
          address: user.address || "",
          department: user.department || "Computer Science",
          designation: user.headline || "Enrolled Student",
          upiId: user.upiId || "",
          studentId: `INX-STU-${String(user.id).slice(-4).toUpperCase()}`,
          referralCode: `INX-${(user.name || "STU").slice(0, 3).toUpperCase()}99`,
          role: "student",
          isActive: true,
          isApproved: true,
          resumeUrl: user.resumeUrl || "",
          resumeName: user.resumeName || "",
          resumeUpdatedAt: user.resumeUpdatedAt || "",
          enrolledCourses: [],
          enrolledBatches: [],
        };
        setProfile(fallbackObj);
        setFormData({
          fullname: fallbackObj.fullname,
          phone: fallbackObj.phone,
          address: fallbackObj.address,
          department: fallbackObj.department,
          designation: fallbackObj.designation,
          upiId: fallbackObj.upiId,
        });
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setErrorMessage("Could not load full profile from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const payload = {
        userId: user.id || profile?._id,
        email: user.email,
        fullname: formData.fullname.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        department: formData.department.trim(),
        designation: formData.designation.trim(),
        upiId: formData.upiId.trim(),
      };

      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage("Your profile details have been successfully updated!");
        setIsEditing(false);

        // Update local context so navbar/sidebar immediately update
        updateUser({
          name: formData.fullname.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          department: formData.department.trim(),
          upiId: formData.upiId.trim(),
        });

        // Update local profile state
        if (profile) {
          setProfile({
            ...profile,
            fullname: formData.fullname.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            department: formData.department.trim(),
            designation: formData.designation.trim(),
            upiId: formData.upiId.trim(),
          });
        }

        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        throw new Error(data.message || "Failed to update profile details.");
      }
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setErrorMessage(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Resume PDF Upload
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate PDF
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setResumeError("Invalid format: Only PDF documents (.pdf) are allowed.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setResumeError("File size exceeds 15MB limit. Please upload a smaller PDF.");
      return;
    }

    setUploadingResume(true);
    setResumeError("");
    setSuccessMessage("");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("userId", user.id || profile?._id || "");
      uploadData.append("email", user.email || "");

      const res = await fetch("/api/student/resume", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage("Resume PDF uploaded successfully!");
        const updatedResumeUrl = data.resumeUrl;
        const updatedResumeName = data.resumeName || file.name;
        const updatedResumeTime = data.resumeUpdatedAt || new Date().toISOString();

        setProfile((prev) =>
          prev
            ? {
                ...prev,
                resumeUrl: updatedResumeUrl,
                resumeName: updatedResumeName,
                resumeUpdatedAt: updatedResumeTime,
              }
            : null
        );

        updateUser({
          resumeUrl: updatedResumeUrl,
          resumeName: updatedResumeName,
          resumeUpdatedAt: updatedResumeTime,
        });

        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        throw new Error(data.message || "Failed to upload resume PDF.");
      }
    } catch (err: any) {
      console.error("Resume upload error:", err);
      setResumeError(err.message || "Could not upload resume PDF.");
    } finally {
      setUploadingResume(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle Remove Resume
  const handleRemoveResume = async () => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to remove your resume PDF?")) {
      return;
    }

    setUploadingResume(true);
    setResumeError("");
    setSuccessMessage("");

    try {
      const q = new URLSearchParams();
      if (user.id) q.set("userId", user.id);
      if (user.email) q.set("email", user.email);

      const res = await fetch(`/api/student/resume?${q.toString()}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage("Resume removed successfully.");
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                resumeUrl: "",
                resumeName: "",
                resumeUpdatedAt: "",
              }
            : null
        );

        updateUser({
          resumeUrl: "",
          resumeName: "",
          resumeUpdatedAt: "",
        });

        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        throw new Error(data.message || "Failed to remove resume.");
      }
    } catch (err: any) {
      console.error("Resume remove error:", err);
      setResumeError(err.message || "Could not remove resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleCopy = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (!isAuthenticated && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
        <p className="text-slate-400 text-sm mb-4">Please log in to view and manage your student profile.</p>
        <Link
          href="/login"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const referralLink = profile?.referralCode
    ? `https://www.inxyme.com/courses?ref=${profile.referralCode}`
    : `https://www.inxyme.com/courses`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/student/dashboard" className="hover:text-emerald-400 transition-colors">
              Student Portal
            </Link>
            <span>/</span>
            <span className="text-slate-200">Student Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>My Profile</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
              Inxyme LMS
            </span>
          </h1>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md ${
              isEditing
                ? "bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
            }`}
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                <span>Cancel Editing</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile Details</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hero Profile Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 p-1 shadow-2xl flex items-center justify-center">
                <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-emerald-400 to-teal-200">
                  {profile?.fullname ? profile.fullname.charAt(0).toUpperCase() : user?.name ? user.name.charAt(0).toUpperCase() : "S"}
                </div>
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-md" title="Active" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {profile?.fullname || user?.name || "Student"}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Student
                </span>
                {profile?.resumeUrl && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    Resume Attached
                  </span>
                )}
              </div>

              <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{profile?.email || user?.email || "student@inxyme.com"}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                {profile?.department && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{profile.department}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>ID: {profile?.studentId || "INX-STU"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6 justify-between md:justify-start">
            <div className="text-center px-3">
              <div className="text-2xl font-extrabold text-white">
                {profile?.enrolledCourses?.length || 0}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Courses</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center px-3">
              <div className="text-2xl font-extrabold text-white">
                {profile?.enrolledBatches?.length || 0}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Batches</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center px-3">
              <div className="text-2xl font-extrabold text-emerald-400">Active</div>
              <div className="text-[11px] text-slate-400 font-medium">LMS Status</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details Form & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Personal Details & Resume Upload */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resume PDF Upload Section */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rose-400" />
                  Resume (PDF)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload your updated resume PDF for job referrals, internships and career services.
                </p>
              </div>

              {profile?.resumeUrl ? (
                <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resume Linked
                </span>
              ) : (
                <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  No Resume
                </span>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf,.pdf"
              onChange={handleResumeUpload}
              className="hidden"
            />

            {/* Resume Upload Error */}
            {resumeError && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{resumeError}</span>
              </div>
            )}

            {profile?.resumeUrl ? (
              /* Already Uploaded Resume Box */
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 shadow-md">
                    <FileText className="w-6 h-6 text-rose-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">
                        {profile.resumeName || "My_Resume.pdf"}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                        PDF
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>
                        {profile.resumeUpdatedAt
                          ? `Last updated: ${new Date(profile.resumeUpdatedAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}`
                          : "Active Resume File"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                  {/* View/Open Resume Button */}
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all border border-slate-700/80 cursor-pointer shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>View PDF</span>
                  </a>

                  {/* Replace/Update Resume Button */}
                  <button
                    type="button"
                    disabled={uploadingResume}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 text-xs font-semibold transition-all border border-indigo-500/30 cursor-pointer disabled:opacity-50"
                  >
                    {uploadingResume ? (
                      <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>Replace</span>
                  </button>

                  {/* Remove Resume Button */}
                  <button
                    type="button"
                    disabled={uploadingResume}
                    onClick={handleRemoveResume}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-all border border-rose-500/20 cursor-pointer disabled:opacity-50"
                    title="Remove Resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Drag & Drop / Click to Upload Box */
              <div
                onClick={() => !uploadingResume && fileInputRef.current?.click()}
                className={`group border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer ${
                  uploadingResume
                    ? "border-emerald-500/50 bg-emerald-500/5 cursor-wait"
                    : "border-slate-800 hover:border-emerald-500/50 hover:bg-slate-950/60 bg-slate-950/30"
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3.5 group-hover:scale-110 transition-transform shadow-lg">
                  {uploadingResume ? (
                    <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UploadCloud className="w-7 h-7" />
                  )}
                </div>

                <h4 className="text-sm font-bold text-white mb-1">
                  {uploadingResume ? "Uploading your Resume PDF..." : "Click to Upload Resume (PDF only)"}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
                  Upload your CV in standard PDF format. Maximum file size is 15MB.
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/20">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Choose PDF File</span>
                </div>
              </div>
            )}
          </div>

          {/* Personal Information Form */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-400" />
                  Personal Information
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your personal profile details synchronized with Inxyme Learning Network
                </p>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              ) : (
                <span className="text-[11px] font-bold text-amber-400 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  Editing Mode
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-all ${
                      isEditing
                        ? "bg-slate-950 border-emerald-500/40 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        : "bg-slate-950/50 border-slate-800 text-slate-300 cursor-not-allowed"
                    }`}
                    required
                  />
                </div>

                {/* Email Address (Read-only for security) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profile?.email || user?.email || ""}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-950/50 border border-slate-800 text-slate-400 cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Phone Number (Editable) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="+91 98765 43210"
                    className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-all ${
                      isEditing
                        ? "bg-slate-950 border-emerald-500/40 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        : "bg-slate-950/50 border-slate-800 text-slate-300 cursor-not-allowed"
                    }`}
                  />
                </div>

                {/* Department / Stream */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                    Department / College Stream
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g. Computer Science, BCA, B.Tech"
                    className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-all ${
                      isEditing
                        ? "bg-slate-950 border-emerald-500/40 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        : "bg-slate-950/50 border-slate-800 text-slate-300 cursor-not-allowed"
                    }`}
                  />
                </div>

                {/* Headline / Designation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    Student Headline / Title
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g. Full-Stack Web Development Aspirant"
                    className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-all ${
                      isEditing
                        ? "bg-slate-950 border-emerald-500/40 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        : "bg-slate-950/50 border-slate-800 text-slate-300 cursor-not-allowed"
                    }`}
                  />
                </div>

                {/* UPI ID (For Referral Rewards & Payouts) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-indigo-400" />
                    UPI ID (For Referral Rewards)
                  </label>
                  <input
                    type="text"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g. username@okhdfcbank"
                    className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-all ${
                      isEditing
                        ? "bg-slate-950 border-emerald-500/40 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        : "bg-slate-950/50 border-slate-800 text-slate-300 cursor-not-allowed"
                    }`}
                  />
                  <p className="text-[10px] text-slate-500">
                    Used to deposit your cash rewards directly from Refer & Earn.
                  </p>
                </div>
              </div>

              {/* Residential Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  Address / City
                </label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your city, state or residential address"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-all resize-none ${
                    isEditing
                      ? "bg-slate-950 border-emerald-500/40 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      : "bg-slate-950/50 border-slate-800 text-slate-300 cursor-not-allowed"
                  }`}
                />
              </div>

              {/* Action Buttons when Editing */}
              {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      if (profile) {
                        setFormData({
                          fullname: profile.fullname,
                          phone: profile.phone,
                          address: profile.address,
                          department: profile.department,
                          designation: profile.designation,
                          upiId: profile.upiId,
                        });
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving Changes...</span>
                      </div>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Enrolled Courses Section */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                My Enrolled Courses ({profile?.enrolledCourses?.length || 0})
              </h3>
              <Link
                href="/student/courses"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <span>View All Courses</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : profile?.enrolledCourses && profile.enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.enrolledCourses.map((c, idx) => (
                  <div
                    key={c._id || c.id || idx}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-3.5 group"
                  >
                    {c.thumbnail ? (
                      <img
                        src={c.thumbnail}
                        alt={c.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-800 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6 text-blue-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                        {c.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {c.category || "Full Stack Track"}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active Course
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No enrolled courses found linked to this account.</p>
                <Link
                  href="/student/courses"
                  className="inline-block mt-3 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-600/30 transition-colors"
                >
                  Explore Courses
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Account Badges, Batches, Refer & Earn */}
        <div className="space-y-6">
          {/* Account Status Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Account Verification
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs text-slate-400">Account Status</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs text-slate-400">LMS Approval</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Approved
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs text-slate-400">Resume Status</span>
                <span className="text-xs font-bold flex items-center gap-1.5">
                  {profile?.resumeUrl ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                    </span>
                  ) : (
                    <span className="text-amber-400">Pending</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs text-slate-400">Student ID</span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {profile?.studentId || "INX-STU"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs text-slate-400">Member Since</span>
                <span className="text-xs text-slate-300">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Active Student"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Refer & Earn Card */}
          <div className="bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-indigo-400" />
                Refer & Earn
              </h3>
              <Link
                href="/student/refer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Share your referral code with friends and earn cash rewards deposited to your UPI ID.
            </p>

            {/* Referral Code Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">
                Your Referral Code
              </label>
              <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-mono text-sm font-bold text-indigo-400 tracking-wider">
                  {profile?.referralCode || "INXYME"}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(profile?.referralCode || "INXYME", "code")}
                  className="ml-auto p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors cursor-pointer"
                  title="Copy Code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Referral Link Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">
                Referral Link
              </label>
              <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 truncate">
                  {referralLink}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(referralLink, "link")}
                  className="ml-auto p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors cursor-pointer"
                  title="Copy Link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Enrolled Batches */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Assigned Batches ({profile?.enrolledBatches?.length || 0})
              </h3>
              <Link
                href="/student/batches"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                View
              </Link>
            </div>

            {profile?.enrolledBatches && profile.enrolledBatches.length > 0 ? (
              <div className="space-y-2.5">
                {profile.enrolledBatches.map((b, idx) => (
                  <div
                    key={b._id || b.id || idx}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-white">{b.batchName}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {b.timing || "Regular Batch"}
                      </p>
                    </div>
                    {b.batchCode && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {b.batchCode}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  You are registered under default student intake batch.
                </p>
                <Link
                  href="/student/batches"
                  className="inline-block mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Check Batches Schedule
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
