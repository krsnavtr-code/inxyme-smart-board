"use client";

import React from "react";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import TeacherNavbar from "@/components/teacher/TeacherNavbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function TeacherLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["INSTRUCTOR", "ADMIN"]} redirectTo="/login">
      <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-600 selection:text-white">
        {/* Left Sidebar */}
        <TeacherSidebar />

        {/* Right Main Content Area with responsive margin matching sidebar width */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
          {/* Top LMS Navbar with Login Details & Dropdown on the Right */}
          <TeacherNavbar />

          {/* Page Contents */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
