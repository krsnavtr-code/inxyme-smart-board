import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await Promise.resolve(context.params);
  const courseId = resolvedParams.id;

  if (!courseId) {
    return NextResponse.json(
      { success: false, message: "Course ID is required" },
      { status: 400 }
    );
  }

  const inxymeUrls = [
    process.env.NEXT_PUBLIC_INXYME_API_URL || "http://localhost:4002/api",
    "http://localhost:4002/api",
    "https://www.inxyme.com/api",
  ];

  const authHeader = req.headers.get("authorization") || "";
  const cookieHeader = req.headers.get("cookie") || "";

  for (const baseUrl of inxymeUrls) {
    try {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (authHeader) headers["Authorization"] = authHeader;
      if (cookieHeader) headers["Cookie"] = cookieHeader;

      // Try LMS public endpoint first
      let res = await fetch(`${baseUrl}/sprints/lms/${courseId}`, {
        cache: "no-store",
        headers,
      });

      if (!res.ok) {
        // Fallback to course endpoint
        res = await fetch(`${baseUrl}/sprints/course/${courseId}`, {
          cache: "no-store",
          headers,
        });
      }

      if (res.ok) {
        const data = await res.json();
        const sprints =
          data?.data?.sprints ||
          (Array.isArray(data?.data) ? data.data : []) ||
          (Array.isArray(data?.sprints) ? data.sprints : []);

        return NextResponse.json({
          success: true,
          count: sprints.length,
          sprints,
        });
      }
    } catch {
      // try next URL
    }
  }

  return NextResponse.json({
    success: true,
    count: 0,
    sprints: [],
  });
}

