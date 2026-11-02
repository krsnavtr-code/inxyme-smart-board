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

  // 1. Try dedicated /profile endpoint
  for (const baseUrl of inxymeUrls) {
    try {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (authHeader) headers["Authorization"] = authHeader;
      if (cookieHeader) headers["Cookie"] = cookieHeader;

      const q = new URLSearchParams();
      if (userId) q.set("userId", userId);
      if (email) q.set("email", email);

      const res = await fetch(`${baseUrl}/profile?${q.toString()}`, {
        cache: "no-store",
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          return NextResponse.json({ success: true, user: data.user });
        }
      }
    } catch {
      // try next
    }
  }

  // 2. Fallback: Try /users/lms-users
  for (const baseUrl of inxymeUrls) {
    try {
      const res = await fetch(`${baseUrl}/users/lms-users`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        const users = data.users || [];
        const matched = users.find(
          (u: any) =>
            (userId && String(u._id || u.id) === String(userId)) ||
            (email && u.email && u.email.toLowerCase() === email)
        );

        if (matched) {
          return NextResponse.json({ success: true, user: matched });
        }
      }
    } catch {
      // try next
    }
  }

  return NextResponse.json(
    { success: false, message: "User profile not found in Inxyme database" },
    { status: 404 }
  );
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, fullname, phone, address, upiId, department, designation, resumeUrl, resumeName } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, message: "User identification (ID or Email) is required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization") || "";
    const cookieHeader = req.headers.get("cookie") || "";

    const inxymeUrls = [
      process.env.NEXT_PUBLIC_INXYME_API_URL || "http://localhost:4002/api",
      "http://localhost:4002/api",
      "https://www.inxyme.com/api",
    ];

    // 1. Send update to inxyme-website /profile endpoint
    for (const baseUrl of inxymeUrls) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        if (authHeader) headers["Authorization"] = authHeader;
        if (cookieHeader) headers["Cookie"] = cookieHeader;

        const res = await fetch(`${baseUrl}/profile`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            userId,
            email,
            fullname,
            phone,
            address,
            upiId,
            department,
            designation,
            resumeUrl,
            resumeName,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch {
        // try next
      }
    }

    return NextResponse.json(
      { success: false, message: "Could not reach Inxyme website server to update profile" },
      { status: 502 }
    );
  } catch (error: any) {
    console.error("Error in profile update route:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

