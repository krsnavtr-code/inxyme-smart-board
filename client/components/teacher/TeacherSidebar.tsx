"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react";

export default function TeacherSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/teacher/dashboard"
    },
    {
      id: "courses",
      label: "Enrolled Courses",
      icon: BookOpen,
      href: "/teacher/courses"
    }
  ];

  return (
    <>
      {/* Mobile Menu Trigger */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-3.5 left-4 z-50 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shadow-lg"
        title="Toggle Teacher Navigation"
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
          } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Top Section */}
        <div className="flex flex-col">
          {/* Logo & Brand Header */}
          <div className="h-16 border-b border-slate-800/80 px-4 flex items-center justify-between">
            <Link
              href="/teacher/dashboard"
              className="flex items-center gap-3 overflow-hidden group"
              onClick={() => setIsMobileOpen(false)}
            >
              <img
                src="https://www.inxyme.com/api/upload/file/Inxyme-png-logo-2232.png"
                alt="Inxyme Logo"
                className="h-8 w-auto object-contain shrink-0"
              />
            </Link>

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-900 transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Teacher Profile Widget */}
          <div className="p-3 border-b border-slate-800/80">
            <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-2.5 flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center font-bold text-xs text-white shadow-md">
                  {user?.name ? user.name.charAt(0) : "T"}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {user?.name || "Teacher"}
                  </p>
                  <p className="text-[10px] text-indigo-400 font-semibold truncate leading-tight mt-0.5">
                    {user?.headline || "Faculty Instructor"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/80"
                    }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                      }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}

                  {/* Tooltip on collapsed state */}
                  {isCollapsed && (
                    <div className="hidden lg:group-hover:flex absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium whitespace-nowrap shadow-xl z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Logout Action */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={logout}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ${isCollapsed ? "justify-center" : ""
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
