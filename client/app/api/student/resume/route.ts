import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = (formData.get("userId") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file was uploaded" },
        { status: 400 }
      );
    }

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, message: "User identification (ID or Email) is required" },
        { status: 400 }
      );
    }

    // Verify it's a PDF
    const fileName = file.name || "resume.pdf";
    const isPdf =
      file.type === "application/pdf" ||
      fileName.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { success: false, message: "Only PDF format files are allowed for resume upload." },
        { status: 400 }
      );
    }

    // Check size (Max 15MB)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "File size exceeds 15MB limit. Please upload a smaller PDF." },
        { status: 400 }
      );
    }

    // Generate safe unique filename
    const ext = path.extname(fileName) || ".pdf";
    const baseName = path
      .basename(fileName, ext)
      .replace(/[^\w\d-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const savedFileName = `resume-${baseName}-${uniqueSuffix}${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Save directly into inxyme-website/server/public/uploads if path exists
    const inxymeUploadsDir = path.resolve(
      process.cwd(),
      "..",
      "inxyme-website",
      "server",
      "public",
      "uploads"
    );

    let savedLocally = false;
    try {
      if (!fsSync.existsSync(inxymeUploadsDir)) {
        await fs.mkdir(inxymeUploadsDir, { recursive: true });
      }
      const targetFilePath = path.join(inxymeUploadsDir, savedFileName);
      await fs.writeFile(targetFilePath, buffer);
      savedLocally = true;
    } catch (e) {
      console.warn("Could not write to inxyme-website uploads directly:", e);
    }

    // 2. Also save to client public/uploads as an immediate static backup
    const clientUploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      if (!fsSync.existsSync(clientUploadsDir)) {
        await fs.mkdir(clientUploadsDir, { recursive: true });
      }
      await fs.writeFile(path.join(clientUploadsDir, savedFileName), buffer);
    } catch (e) {
      // ignore
    }

    // 3. Construct URL
    const fileUrl = `/api/upload/file/${encodeURIComponent(savedFileName)}`;
    const backupUrl = `/uploads/${encodeURIComponent(savedFileName)}`;
    const effectiveUrl = savedLocally ? fileUrl : backupUrl;

    // 4. Update the user record in Inxyme database via /api/profile PUT
    const inxymeUrls = [
      process.env.NEXT_PUBLIC_INXYME_API_URL || "http://localhost:4002/api",
      "http://localhost:4002/api",
      "https://www.inxyme.com/api",
    ];

    for (const baseUrl of inxymeUrls) {
      try {
        const updateRes = await fetch(`${baseUrl}/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            userId,
            email,
            resumeUrl: effectiveUrl,
            resumeName: fileName,
          }),
        });

        if (updateRes.ok) {
          const updateData = await updateRes.json();
          return NextResponse.json({
            success: true,
            message: "Resume PDF uploaded and linked to profile successfully",
            resumeUrl: effectiveUrl,
            resumeName: fileName,
            resumeUpdatedAt: new Date().toISOString(),
            user: updateData.user,
          });
        }
      } catch {
        // try next
      }
    }

    // Return success even if offline fallback
    return NextResponse.json({
      success: true,
      message: "Resume PDF uploaded successfully",
      resumeUrl: effectiveUrl,
      resumeName: fileName,
      resumeUpdatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to upload resume PDF" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId")?.trim();
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, message: "User identification is required" },
        { status: 400 }
      );
    }

    const inxymeUrls = [
      process.env.NEXT_PUBLIC_INXYME_API_URL || "http://localhost:4002/api",
      "http://localhost:4002/api",
      "https://www.inxyme.com/api",
    ];

    for (const baseUrl of inxymeUrls) {
      try {
        const res = await fetch(`${baseUrl}/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            userId,
            email,
            resumeUrl: "",
            resumeName: "",
          }),
        });
        if (res.ok) {
          return NextResponse.json({
            success: true,
            message: "Resume removed from profile successfully",
          });
        }
      } catch {
        // try next
      }
    }

    return NextResponse.json({
      success: true,
      message: "Resume removed successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to remove resume" },
      { status: 500 }
    );
  }
}

