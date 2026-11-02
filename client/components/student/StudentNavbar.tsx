"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LogOut,
  ChevronDown,
  User as UserIcon,
  GraduationCap,
  Sparkles,
  BookOpen,
  Layers,
  Radio,
  Gift
} from "lucide-react";

export default function StudentNavbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left side: Brand & Portal Badge */}
      <div className="flex items-center gap-3 pl-12 lg:pl-0">
        <span className="font-extrabold text-white text-base tracking-tight hidden sm:inline-block">
          Student Portal
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Inxyme LMS
        </span>
      </div>

      {/* Center Quick Navigation */}
      <div className="hidden md:flex items-center gap-1 bg-slate-900/60 border border-slate-800/80 rounded-xl p-1 text-xs">
        <Link
          href="/student/dashboard"
          className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/student/sprints"
          className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Sprints Flow
        </Link>
        <Link
          href="/student/batches"
          className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          My Batches
        </Link>
        <Link
          href="/student/courses"
          className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Courses
        </Link>
        <Link
          href="/student/refer"
          className="px-3 py-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-600/20 transition-colors flex items-center gap-1 font-semibold"
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Refer &amp; Earn</span>
        </Link>
        <Link
          href="/live/learn-board"
          className="px-3 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1 font-semibold"
        >
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Live Class</span>
        </Link>
      </div>

      {/* Right side: User Profile Dropdown */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shadow-md shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
            </div>

            <div className="hidden sm:block text-left max-w-[140px]">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {user?.name || "Student"}
              </p>
              <p className="text-[10px] text-emerald-400 font-semibold truncate leading-tight mt-0.5">
                Enrolled Student
              </p>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 p-2 animate-in fade-in zoom-in-95">
              <div className="p-3 border-b border-slate-800/80 mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center font-bold text-sm text-white shadow-md shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {user?.name || "Student"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user?.email || "student@inxyme.com"}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                      Active Student
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-0.5">
                <Link
                  href="/student/batches"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>My Batches</span>
                </Link>

                <Link
                  href="/student/courses"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>My Courses</span>
                </Link>

                <Link
                  href="/live/learn-board"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Join Live Smart Board</span>
                </Link>
              </div>

              <div className="border-t border-slate-800/80 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

