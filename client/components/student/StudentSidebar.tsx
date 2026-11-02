"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Radio,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  Gift,
  Briefcase,
  ClipboardCheck
} from "lucide-react";

interface StudentSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function StudentSidebar({
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}: StudentSidebarProps = {}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isCollapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/student/dashboard"
    },
    {
      id: "sprints",
      label: "Learning Sprints",
      icon: Sparkles,
      href: "/student/sprints"
    },
    {
      id: "batches",
      label: "My Batches",
      icon: Layers,
      href: "/student/batches"
    },
    {
      id: "courses",
      label: "Enrolled Courses",
      icon: BookOpen,
      href: "/student/courses"
    },
    {
      id: "activities",
      label: "Activities & Quizzes",
      icon: ClipboardCheck,
      href: "/student/activities"
    },
    {
      id: "refer",
      label: "Refer & Earn",
      icon: Gift,
      href: "/student/refer"
    },
    {
      id: "career",
      label: "Career Services",
      icon: Briefcase,
      href: "/student/career"
    },
  ];

  return (
    <>
      {/* Mobile Menu Trigger */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-3.5 left-4 z-50 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shadow-lg cursor-pointer"
        title="Toggle Student Navigation"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 animate-in fade-in"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
          } ${isCollapsed ? "lg:w-16" : "lg:w-64"}`}
      >
        {/* Top Section */}
        <div className="flex flex-col">
          {/* Logo & Header */}
          <div className={`h-16 border-b border-slate-800/80 flex items-center transition-all ${isCollapsed ? "justify-center px-1" : "justify-between px-4"}`}>
            {!isCollapsed && (
              <Link
                href="/student/dashboard"
                className="flex items-center gap-3 overflow-hidden group"
                onClick={() => setIsMobileOpen(false)}
              >
                <img
                  src="https://www.inxyme.com/api/upload/file/Inxyme-png-logo-2232.png"
                  alt="Inxyme Logo"
                  className="h-8 w-auto object-contain shrink-0"
                />
              </Link>
            )}

            {/* Collapse Toggle */}
            <button
              onClick={handleToggle}
              className={`hidden lg:flex rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer ${isCollapsed ? "p-2" : "p-1.5"}`}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-indigo-400" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Student Profile Widget */}
          <div className={`border-b border-slate-800/80 transition-all ${isCollapsed ? "p-1.5 flex justify-center" : "p-2"}`}>
            <div className={`bg-slate-900/80 border border-slate-800/90 rounded-2xl flex items-center transition-all ${isCollapsed ? "p-1.5 justify-center" : "p-1 gap-3"}`}>
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shadow-md">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {user?.name || "Student"}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-semibold truncate leading-tight mt-0.5">
                    Enrolled Student
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className={`transition-all ${isCollapsed ? "p-1.5 space-y-1.5" : "p-2.5 space-y-1"}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center rounded-xl text-xs font-semibold transition-all group relative ${
                    isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
                  } ${isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/80"
                    }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400"
                      }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}

                  {isCollapsed && (
                    <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium whitespace-nowrap shadow-xl z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Logout */}
        <div className={`border-t border-slate-800/80 transition-all ${isCollapsed ? "p-1.5 flex justify-center" : "p-3"}`}>
          <button
            onClick={logout}
            className={`w-full flex items-center rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ${
              isCollapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2"
            }`}
            title="Sign out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

