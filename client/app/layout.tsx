import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inxyme LMS - Synchronous Smart Board & Live Classrooms",
  description: "High-concurrency virtual classroom with 100+ concurrent students, real-time smart board synchronization, and role-based learning.",
  icons: {
    icon: [
      {
        rel: "icon",
        type: "image/png",
        url: "/images/inxyme-logo.png",
      },
      {
        rel: "icon",
        type: "image/x-icon",
        url: "/favicon.ico",
      },
      {
        rel: "icon",
        type: "image/png",
        url: "https://www.inxyme.com/api/upload/file/Inxyme-png-logo-2232.png",
      },
    ],
    shortcut: "/images/inxyme-logo.png",
    apple: "/images/inxyme-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
