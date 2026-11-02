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

  for (const baseUrl of inxymeUrls) {
    try {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (authHeader) headers["Authorization"] = authHeader;
      if (cookieHeader) headers["Cookie"] = cookieHeader;

      const q = new URLSearchParams();
      if (userId) q.set("userId", userId);
      if (email) q.set("email", email);

      const res = await fetch(`${baseUrl}/activities/student/my-activities?${q.toString()}`, {
        cache: "no-store",
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // try next fallback
    }
  }

  // Fallback if backend is unavailable
  return NextResponse.json({
    success: true,
    activities: [],
    stats: {
      total: 0,
      completed: 0,
      pending: 0,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { activityId, userId, email, answers } = body;

    if (!activityId) {
      return NextResponse.json(
        { success: false, message: "Activity ID is required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization") || "";
    const inxymeUrls = [
      process.env.NEXT_PUBLIC_INXYME_API_URL || "http://localhost:4002/api",
      "http://localhost:4002/api",
      "https://www.inxyme.com/api",
    ];

    for (const baseUrl of inxymeUrls) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        if (authHeader) headers["Authorization"] = authHeader;

        const res = await fetch(`${baseUrl}/activities/${activityId}/submit`, {
          method: "POST",
          headers,
          body: JSON.stringify({ userId, email, answers }),
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch {
        // try next fallback
      }
    }

    return NextResponse.json(
      { success: false, message: "Failed to connect to backend service" },
      { status: 502 }
    );
  } catch (error: any) {
    console.error("Error in activity submission proxy:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

