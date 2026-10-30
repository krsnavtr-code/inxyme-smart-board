import { NextResponse } from "next/server";

export async function GET() {
  const inxymeUrls = [
    process.env.NEXT_PUBLIC_INXYME_API_URL || "http://localhost:4002/api",
    "http://localhost:4002/api",
    "https://www.inxyme.com/api",
  ];

  for (const baseUrl of inxymeUrls) {
    try {
      const res = await fetch(`${baseUrl}/users/lms-users`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        const users = data.users || (Array.isArray(data) ? data : []);
        if (users && users.length > 0) {
          return NextResponse.json({ success: true, users });
        }
      }
    } catch {
      // try next URL
    }
  }

  // Fallback: try default /users
  for (const baseUrl of inxymeUrls) {
    try {
      const res = await fetch(`${baseUrl}/users`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        const users = Array.isArray(data) ? data : data.users || [];
        if (users && users.length > 0) {
          return NextResponse.json({ success: true, users });
        }
      }
    } catch {
      // continue
    }
  }

  return NextResponse.json(
    { success: false, users: [], message: "No inxyme-website users reachable" },
    { status: 502 }
  );
}

