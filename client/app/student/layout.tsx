"use client";

import React from "react";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentNavbar from "@/components/student/StudentNavbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function StudentLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["STUDENT", "INSTRUCTOR", "ADMIN"]} redirectTo="/login">
      <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-600 selection:text-white">
        {/* Left Sidebar */}
        <StudentSidebar />

        {/* Right Main Content Area with responsive margin matching sidebar width */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
          {/* Top LMS Navbar */}
          <StudentNavbar />

          {/* Page Contents */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

