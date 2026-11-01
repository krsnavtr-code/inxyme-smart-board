import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId")?.trim();
  const email = searchParams.get("email")?.trim().toLowerCase();
  const statusFilter = searchParams.get("status")?.trim().toLowerCase();

  const authHeader = req.headers.get("authorization") || "";
  const cookieHeader = req.headers.get("cookie") || "";

  const inxymeUrls = [
    process.env.NEXT_PUBLIC_INXYME_API_URL || "http://localhost:4002/api",
    "http://localhost:4002/api",
    "https://www.inxyme.com/api",
  ];

  const fetchFromInxyme = async (endpoint: string) => {
    for (const baseUrl of inxymeUrls) {
      try {
        const headers: Record<string, string> = { Accept: "application/json" };
        if (authHeader) headers["Authorization"] = authHeader;
        if (cookieHeader) headers["Cookie"] = cookieHeader;

        const res = await fetch(`${baseUrl}${endpoint}`, {
          cache: "no-store",
          headers,
        });
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch {
        // try next
      }
    }
    return null;
  };

  try {
    let effectiveUserId = userId;
    let effectiveEmail = email;

    // Look up student in LMS users directory to ensure exact MongoDB ID
    if (effectiveEmail) {
      try {
        const lmsUsersData = await fetchFromInxyme("/users/lms-users");
        const lmsUserList =
          lmsUsersData?.users || (Array.isArray(lmsUsersData) ? lmsUsersData : []);
        const matchedUser = lmsUserList.find(
          (u: any) => u.email && u.email.toLowerCase() === effectiveEmail
        );
        if (matchedUser) {
          effectiveUserId = matchedUser._id || matchedUser.id || effectiveUserId;
        }
      } catch {
        // continue
      }
    }

    let allBatches: any[] = [];

    // 1. Try student-specific endpoint if available
    if (effectiveUserId) {
      const studentBatchesRes = await fetchFromInxyme(
        `/batches/student/${effectiveUserId}${statusFilter ? `?status=${statusFilter}` : ""}`
      );
      if (studentBatchesRes?.success && Array.isArray(studentBatchesRes.data)) {
        allBatches = studentBatchesRes.data;
      }
    }

    // 2. Fallback: fetch all batches and filter where this student is enrolled
    if (allBatches.length === 0) {
      const batchesData = await fetchFromInxyme(
        `/batches${statusFilter ? `?status=${statusFilter}` : ""}`
      );

      let rawList: any[] = [];
      if (Array.isArray(batchesData?.data)) {
        rawList = batchesData.data;
      } else if (Array.isArray(batchesData?.batches)) {
        rawList = batchesData.batches;
      } else if (Array.isArray(batchesData)) {
        rawList = batchesData;
      }

      allBatches = rawList.filter((b: any) => {
        if (!b) return false;
        const students = Array.isArray(b.students) ? b.students : [];
        return students.some((s: any) => {
          const sId = typeof s === "object" ? (s._id || s.id) : String(s);
          const sEmail = typeof s === "object" && s.email ? String(s.email).toLowerCase() : "";

          const idMatches =
            effectiveUserId && String(sId).toLowerCase() === String(effectiveUserId).toLowerCase();
          const emailMatches =
            effectiveEmail && sEmail && sEmail === effectiveEmail;

          return Boolean(idMatches || emailMatches);
        });
      });
    }

    // 3. Normalize batch structure
    const normalized = allBatches.map((b: any) => ({
      _id: b._id || b.id,
      batchName: b.batchName || b.name || "Enrolled Cohort",
      name: b.name || b.batchName || "Enrolled Cohort",
      batchCode: b.batchCode || b.code || "BATCH",
      code: b.code || b.batchCode || "BATCH",
      course: b.course || null,
      teacher: b.teacher || null,
      students: Array.isArray(b.students) ? b.students : [],
      startDate: b.startDate,
      endDate: b.endDate,
      schedule: b.schedule || {},
      maxCapacity: b.maxCapacity || 30,
      currentEnrollment:
        b.currentEnrollment !== undefined
          ? b.currentEnrollment
          : Array.isArray(b.students)
          ? b.students.length
          : 0,
      status: (b.status || "ongoing").toLowerCase(),
      liveClass: b.liveClass || {},
      whatsappGroupLink: b.whatsappGroupLink || "",
      isActive: b.isActive !== false,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      count: normalized.length,
      batches: normalized,
    });
  } catch (error: any) {
    console.error("Error in /api/student/batches:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch student batches",
        batches: [],
      },
      { status: 500 }
    );
  }
}

