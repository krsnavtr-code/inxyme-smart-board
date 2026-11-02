"use client";

import React, { useState, useEffect } from "react";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentNavbar from "@/components/student/StudentNavbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("student_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("student_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <ProtectedRoute allowedRoles={["STUDENT", "INSTRUCTOR", "ADMIN"]} redirectTo="/login">
      <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-600 selection:text-white">
        {/* Left Sidebar */}
        <StudentSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Right Main Content Area with dynamic responsive padding matching sidebar width */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            isCollapsed ? "lg:pl-16" : "lg:pl-64"
          }`}
        >
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
