"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LogOut,
  ChevronDown,
  User as UserIcon,
  ShieldCheck
} from "lucide-react";

export default function TeacherNavbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
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
      {/* Left side (Leave space for mobile menu toggle on small screens) */}
      <div className="flex items-center gap-3 pl-12 lg:pl-0">
        <span className="font-extrabold text-white text-base tracking-tight hidden sm:inline-block">
          Teacher Portal
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Faculty LMS
        </span>
      </div>

      {/* Right side: User Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* User Login Details & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 transition-all text-left group"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-xs text-white shadow-md shrink-0">
              {user?.name ? user.name.charAt(0) : "T"}
            </div>

            {/* User Name & Role */}
            <div className="hidden sm:block text-left max-w-[140px]">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {user?.name || "Teacher Faculty"}
              </p>
              <p className="text-[10px] text-indigo-400 font-semibold truncate leading-tight mt-0.5">
                {user?.role === "INSTRUCTOR" ? "Teacher / Faculty" : user?.role || "Instructor"}
              </p>
            </div>

            {/* Dropdown Chevron */}
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-white" : ""
                }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 p-2 animate-in fade-in zoom-in-95">
              {/* User Details Header */}
              <div className="p-3 border-b border-slate-800/80 mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-sm text-white shadow-md shrink-0">
                    {user?.name ? user.name.charAt(0) : "T"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {user?.name || "Teacher"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user?.email || "faculty@inxyme.com"}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      Faculty Instructor
                    </span>
                  </div>
                </div>
              </div>

              {/* Status info */}
              <div className="space-y-0.5">
                <div className="px-3 py-1.5 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Faculty Session Active</span>
                </div>
              </div>

              {/* Divider */}
              <div className="my-1 border-t border-slate-800/80" />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of LMS</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
