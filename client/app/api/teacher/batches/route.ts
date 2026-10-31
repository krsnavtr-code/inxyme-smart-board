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

  // Helper to fetch from inxyme-website endpoints with fallbacks
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
        // try next baseUrl
      }
    }
    return null;
  };

  try {
    // 1. Resolve effective teacher user ID & email
    let effectiveUserId = userId;
    let effectiveEmail = email;

    // Check LMS users directory to ensure we have the exact MongoDB ID for this email
    if (effectiveEmail) {
      try {
        const lmsUsersData = await fetchFromInxyme("/users/lms-users");
        const lmsUserList =
          lmsUsersData?.users || (Array.isArray(lmsUsersData) ? lmsUsersData : []);
        const matchedUser = lmsUserList.find(
          (u: any) =>
            u.email && u.email.toLowerCase() === effectiveEmail
        );
        if (matchedUser) {
          effectiveUserId = matchedUser._id || matchedUser.id || effectiveUserId;
        }
      } catch {
        // continue
      }
    }

    let allBatches: any[] = [];

    // 2. Try fetching from dedicated teacher endpoint if effectiveUserId is known
    if (effectiveUserId) {
      const teacherBatchesRes = await fetchFromInxyme(
        `/batches/teacher/${effectiveUserId}${statusFilter ? `?status=${statusFilter}` : ""}`
      );
      if (teacherBatchesRes?.success && Array.isArray(teacherBatchesRes.data)) {
        allBatches = teacherBatchesRes.data;
      }
    }

    // 3. If teacher batches endpoint yielded no results or wasn't available, fetch all batches and filter
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

      // Filter batches where teacher matches effectiveUserId or effectiveEmail
      allBatches = rawList.filter((b: any) => {
        if (!b) return false;
        const teacher = b.teacher;
        if (!teacher) return false;

        const teacherId =
          typeof teacher === "object" ? (teacher._id || teacher.id) : String(teacher);
        const teacherEmail =
          typeof teacher === "object" && teacher.email
            ? String(teacher.email).toLowerCase()
            : "";

        const idMatches =
          effectiveUserId &&
          String(teacherId).toLowerCase() === String(effectiveUserId).toLowerCase();
        const emailMatches =
          effectiveEmail &&
          teacherEmail &&
          teacherEmail === effectiveEmail;

        return Boolean(idMatches || emailMatches);
      });
    }

    // 4. Normalize batch fields for smooth frontend consumption
    const normalizedBatches = allBatches.map((b: any) => ({
      _id: b._id || b.id,
      batchName: b.batchName || b.name || "Untitled Cohort",
      name: b.name || b.batchName || "Untitled Cohort",
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
      count: normalizedBatches.length,
      batches: normalizedBatches,
    });
  } catch (error: any) {
    console.error("Error in /api/teacher/batches:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch teacher batches",
        batches: [],
      },
      { status: 500 }
    );
  }
}

