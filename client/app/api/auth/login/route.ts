import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const inxymeUrls = [
      process.env.NEXT_PUBLIC_INXYME_API_URL || "http://localhost:4002/api",
      "http://localhost:4002/api",
      "https://www.inxyme.com/api",
    ];

    interface WebsiteUser {
      _id?: string;
      id?: string;
      fullname?: string;
      name?: string;
      email: string;
      role?: string;
      isActive?: boolean;
      isApproved?: boolean;
      department?: string;
      avatar?: string;
    }

    let user: WebsiteUser | null = null;
    let token: string | null = null;

    // 1. Fetch user record from inxyme-website to check status and LMS status
    for (const baseUrl of inxymeUrls) {
      try {
        const usersRes = await fetch(`${baseUrl}/users/lms-users`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const list: WebsiteUser[] =
            usersData.users || (Array.isArray(usersData) ? usersData : []);
          const match = list.find(
            (u) => u.email?.toLowerCase() === cleanEmail
          );
          if (match) {
            user = match;
            break;
          }
        }
      } catch {
        // try next
      }
    }

    // 2. Authenticate against inxyme-website backend login endpoints
    let loginSucceeded = false;
    for (const baseUrl of inxymeUrls) {
      try {
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok && loginData.user) {
          user = { ...user, ...loginData.user };
          token = loginData.token || null;
          loginSucceeded = true;
          break;
        }
      } catch {
        // continue
      }
    }

    if (!loginSucceeded) {
      for (const baseUrl of inxymeUrls) {
        try {
          const loginRes = await fetch(`${baseUrl}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail, password }),
          });
          const loginData = await loginRes.json();
          if (loginRes.ok && loginData.user) {
            user = { ...user, ...loginData.user };
            token = loginData.token || null;
            loginSucceeded = true;
            break;
          }
        } catch {
          // continue
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User not found. Please check your email and password.",
        },
        { status: 404 }
      );
    }

    // 3. Status Validation: user.isActive must be true
    if (user.isActive === false) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access Denied: Your account has been deactivated (Status: Inactive). Please contact the administrator.",
          status: "inactive",
          lmsStatus: user.isApproved ? "approved" : "not_approved",
        },
        { status: 403 }
      );
    }

    // 4. LMS Status Validation: user.isApproved must be true
    if (user.isApproved === false || !user.isApproved) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access Denied: Your LMS access is not approved yet (LMS Status: Not Approved). Please get approval from the administrator in Users Management.",
          status: "active",
          lmsStatus: "not_approved",
        },
        { status: 403 }
      );
    }

    // 5. Role Mapping (Supports both Teachers and Students)
    const rawRole = String(user.role || "").toLowerCase();
    const isTeacherOrAdmin =
      rawRole === "teacher" ||
      rawRole === "instructor" ||
      rawRole === "admin" ||
      rawRole === "employee";

    const mappedRole = isTeacherOrAdmin ? "INSTRUCTOR" : "STUDENT";

    const formattedUser = {
      id: user._id || user.id || `user_${Date.now()}`,
      name: user.fullname || user.name || cleanEmail.split("@")[0],
      email: user.email,
      role: mappedRole,
      originalRole: user.role,
      isActive: true,
      isApproved: true,
      department: user.department || (isTeacherOrAdmin ? "Faculty" : "Student"),
      avatar:
        user.avatar ||
        (isTeacherOrAdmin
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
          : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"),
      headline: isTeacherOrAdmin ? "Faculty Instructor" : "Enrolled Student",
    };

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      token: token || `inxyme_token_${Date.now()}`,
      user: formattedUser,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Authentication error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

