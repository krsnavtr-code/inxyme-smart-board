import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId")?.trim();
  const email = searchParams.get("email")?.trim().toLowerCase();

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
    // 1. Fetch all courses
    const coursesData = await fetchFromInxyme("/courses");
    let allCourses: any[] = [];
    if (Array.isArray(coursesData)) {
      allCourses = coursesData;
    } else if (Array.isArray(coursesData?.data)) {
      allCourses = coursesData.data;
    } else if (Array.isArray(coursesData?.courses)) {
      allCourses = coursesData.courses;
    }

    // 2. Identify effective target user ID and email from users directory
    let effectiveUserId = userId;
    let effectiveEmail = email;

    const enrolledCourseIds = new Set<string>();
    const courseEnrollmentDetails = new Map<string, any>();

    // 3. Look up user in LMS users directory (which includes user.enrolledCourses)
    const lmsUsersData = await fetchFromInxyme("/users/lms-users");
    const lmsUserList = lmsUsersData?.users || (Array.isArray(lmsUsersData) ? lmsUsersData : []);
    const matchedUser = lmsUserList.find(
      (u: any) =>
        (effectiveUserId && (u._id === effectiveUserId || u.id === effectiveUserId)) ||
        (effectiveEmail && u.email && u.email.toLowerCase() === effectiveEmail)
    );

    if (matchedUser) {
      if (!effectiveUserId) effectiveUserId = matchedUser._id || matchedUser.id;
      if (!effectiveEmail && matchedUser.email) effectiveEmail = matchedUser.email.toLowerCase();

      if (Array.isArray(matchedUser.enrolledCourses)) {
        matchedUser.enrolledCourses.forEach((c: any) => {
          if (!c) return;
          const cId = (c._id || c.id || c).toString();
          enrolledCourseIds.add(cId);
          courseEnrollmentDetails.set(cId, {
            status: "active",
            enrolledAt: matchedUser.createdAt,
          });
          if (typeof c === "object" && !allCourses.some((ac) => (ac._id || ac.id)?.toString() === cId)) {
            allCourses.push(c);
          }
        });
      }
    }

    // 4. Fetch enrollments from LMS dedicated endpoint (/enrollments/lms-user/:id)
    if (effectiveUserId || effectiveEmail) {
      const lmsEnrollmentsData =
        (effectiveUserId
          ? await fetchFromInxyme(`/enrollments/lms-user/${effectiveUserId}?email=${effectiveEmail || ""}`)
          : null) ||
        (await fetchFromInxyme(
          `/enrollments/lms-user?userId=${effectiveUserId || ""}&email=${effectiveEmail || ""}`
        ));

      if (lmsEnrollmentsData?.success) {
        if (Array.isArray(lmsEnrollmentsData.enrolledCourseIds)) {
          lmsEnrollmentsData.enrolledCourseIds.forEach((id: string) => enrolledCourseIds.add(String(id)));
        }

        if (Array.isArray(lmsEnrollmentsData.courses)) {
          lmsEnrollmentsData.courses.forEach((c: any) => {
            const cId = (c._id || c.id)?.toString();
            if (cId) {
              enrolledCourseIds.add(cId);
              if (!allCourses.some((ac) => (ac._id || ac.id)?.toString() === cId)) {
                allCourses.push(c);
              }
            }
          });
        }

        if (Array.isArray(lmsEnrollmentsData.data)) {
          lmsEnrollmentsData.data.forEach((e: any) => {
            const cId = (e.course?._id || e.course || e.courseId)?.toString();
            if (cId) {
              enrolledCourseIds.add(cId);
              courseEnrollmentDetails.set(cId, {
                status: e.status || "active",
                progress: e.progress ?? 0,
                enrolledAt: e.enrollmentDate || e.createdAt,
              });
              if (e.course && typeof e.course === "object") {
                if (!allCourses.some((ac) => (ac._id || ac.id)?.toString() === cId)) {
                  allCourses.push(e.course);
                }
              }
            }
          });
        }
      }
    }

    // 5. Fallback fetch from standard Enrollment collection endpoints
    if (effectiveUserId) {
      const enrollmentsData =
        (await fetchFromInxyme(`/enrollments/user/${effectiveUserId}`)) ||
        (await fetchFromInxyme(`/enrollments/my-enrollments?userId=${effectiveUserId}&limit=100`));

      const enrollmentsList =
        enrollmentsData?.data ||
        (Array.isArray(enrollmentsData) ? enrollmentsData : []);

      if (Array.isArray(enrollmentsList)) {
        enrollmentsList.forEach((e: any) => {
          const cId = (e.course?._id || e.course || e.courseId)?.toString();
          if (!cId) return;

          const status = String(e.status || "active").toLowerCase();
          if (status !== "rejected" && status !== "inactive") {
            enrolledCourseIds.add(cId);
            courseEnrollmentDetails.set(cId, {
              status: e.status || "active",
              progress: e.progress ?? 0,
              enrolledAt: e.enrollmentDate || e.createdAt,
              certificateIssued: Boolean(e.certificateIssued),
            });
            if (e.course && typeof e.course === "object") {
              if (!allCourses.some((ac) => (ac._id || ac.id)?.toString() === cId)) {
                allCourses.push(e.course);
              }
            }
          }
        });
      }
    }

    // 6. Filter for ONLY Enrolled Courses AND Active Courses
    const enrolledActiveCourses = allCourses
      .filter((course) => {
        const cId = (course._id || course.id)?.toString();
        if (!cId) return false;

        // Condition 1: Must be enrolled
        if (!enrolledCourseIds.has(cId)) return false;

        // Condition 2: Course must be Active / Published
        if (course.isPublished === false) return false;
        if (course.status && String(course.status).toLowerCase() === "inactive") return false;
        if (course.isActive === false) return false;

        // Condition 3: Enrollment itself must not be rejected/inactive
        const enrollment = courseEnrollmentDetails.get(cId);
        if (enrollment && (enrollment.status === "rejected" || enrollment.status === "inactive")) {
          return false;
        }

        return true;
      })
      .map((course) => {
        const cId = (course._id || course.id)?.toString();
        const enrollment = courseEnrollmentDetails.get(cId) || {};
        return {
          ...course,
          isEnrolled: true,
          enrollmentStatus: enrollment.status || "active",
          enrolledAt: enrollment.enrolledAt,
          progress: enrollment.progress ?? 0,
          certificateIssued: enrollment.certificateIssued ?? false,
        };
      });

    return NextResponse.json({
      success: true,
      count: enrolledActiveCourses.length,
      courses: enrolledActiveCourses,
      user: {
        id: effectiveUserId,
        email: effectiveEmail,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/teacher/courses:", error);
    return NextResponse.json(
      {
        success: false,
        courses: [],
        message: error?.message || "Failed to load teacher enrolled courses",
      },
      { status: 500 }
    );
  }
}
