"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import io, { Socket } from "socket.io-client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  Pen,
  Highlighter,
  Square,
  Circle,
  Minus,
  Eraser,
  Trash2,
  Download,
  Users,
  MessageSquare,
  Hand,
  Settings,
  Grid,
  AlignJustify,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Radio,
  BookOpen,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Lock,
  Unlock,
  Volume2,
  FileText,
  Activity,
  Layers,
  ArrowRight,
  Home,
  LogOut
} from "lucide-react";

interface Stroke {
  tool: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  role: "INSTRUCTOR" | "STUDENT" | "ADMIN";
  text: string;
  time: string;
  isDoubt: boolean;
  isResolved?: boolean;
}

interface StudentParticipant {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  hasDrawingPermission: boolean;
  handRaised: boolean;
  joinedAt: string;
}

export default function LMSPage() {
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5007";

  const { user, logout } = useAuth();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "classroom">("classroom");

  // User State
  const [userRole, setUserRole] = useState<"INSTRUCTOR" | "STUDENT">("INSTRUCTOR");
  const [currentStudentId, setCurrentStudentId] = useState("stud-" + Math.floor(100 + Math.random() * 900));
  const [currentStudentName, setCurrentStudentName] = useState("Aarav Patel (Student)");

  useEffect(() => {
    if (user) {
      if (user.role === "INSTRUCTOR" || user.role === "STUDENT") {
        setUserRole(user.role);
      }
      if (user.name) {
        setCurrentStudentName(user.name);
      }
      if (user.id) {
        setCurrentStudentId(user.id);
      }
    }
  }, [user]);

  // Live Classroom Room
  const [roomCode] = useState("INX-LIVE-401");
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Smart Board Tools
  const [activeTool, setActiveTool] = useState<"pen" | "highlighter" | "rect" | "circle" | "line" | "eraser">("pen");
  const [strokeColor, setStrokeColor] = useState("#4F46E5");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [backgroundStyle, setBackgroundStyle] = useState<"GRID" | "RULED" | "PLAIN" | "BLACKBOARD">("GRID");
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(3);
  const [strokesByPage, setStrokesByPage] = useState<Record<number, Stroke[]>>({ 1: [], 2: [], 3: [] });
  const [canDraw, setCanDraw] = useState(true);

  // Live Interactions & 100-Student Roster
  const [participantsCount, setParticipantsCount] = useState(88);
  const [roster, setRoster] = useState<StudentParticipant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isDoubtMode, setIsDoubtMode] = useState(false);
  const [chatFilter, setChatFilter] = useState<"all" | "doubts">("all");
  const [myHandRaised, setMyHandRaised] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<"roster" | "chat">("chat");

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef<{ x: number; y: number }[]>([]);

  // 1. Initialize Socket.IO connection
  useEffect(() => {
    const s = io(SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5
    });

    s.on("connect", () => {
      setIsConnected(true);
      s.emit("join_room", {
        roomId: roomCode,
        user: {
          id: userRole === "INSTRUCTOR" ? "inst-001" : currentStudentId,
          name: userRole === "INSTRUCTOR" ? "Prof. Ramesh Sharma" : currentStudentName,
          role: userRole,
          avatar: userRole === "INSTRUCTOR" ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" : undefined
        }
      });
    });

    s.on("disconnect", () => {
      setIsConnected(false);
    });

    s.on("room_init_state", (state) => {
      if (state.strokes) {
        setStrokesByPage((prev) => ({ ...prev, [state.activePage || 1]: state.strokes }));
      }
      if (state.activePage) setActivePage(state.activePage);
      if (state.background) setBackgroundStyle(state.background);
      if (state.chatHistory) setChatMessages(state.chatHistory);
      if (state.participantsCount) setParticipantsCount(Math.max(state.participantsCount, 88));
      if (userRole === "INSTRUCTOR") {
        setCanDraw(true);
      } else {
        setCanDraw(Boolean(state.canDraw));
      }
    });

    s.on("stroke_received", ({ stroke, page }) => {
      setStrokesByPage((prev) => {
        const pageStrokes = prev[page] || [];
        return {
          ...prev,
          [page]: [...pageStrokes, stroke]
        };
      });
    });

    s.on("board_cleared", ({ page }) => {
      setStrokesByPage((prev) => ({
        ...prev,
        [page]: []
      }));
    });

    s.on("page_changed", ({ page, strokes }) => {
      setActivePage(page);
      if (strokes) {
        setStrokesByPage((prev) => ({ ...prev, [page]: strokes }));
      }
    });

    s.on("background_changed", ({ background }) => {
      setBackgroundStyle(background);
    });

    s.on("roster_updated", (data) => {
      if (data.students) {
        setRoster(data.students);
        setParticipantsCount(Math.max(data.totalCount, 88));
      }
    });

    s.on("new_message_broadcast", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    s.on("doubt_resolved_broadcast", ({ messageId }) => {
      setChatMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isResolved: true } : m))
      );
    });

    s.on("draw_permission_updated", ({ canDraw: perm }) => {
      if (userRole === "STUDENT") {
        setCanDraw(perm);
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [SERVER_URL, roomCode, userRole, currentStudentId, currentStudentName]);

  // Update permissions when role switches
  useEffect(() => {
    if (userRole === "INSTRUCTOR") {
      setCanDraw(true);
    }
  }, [userRole]);

  // 2. Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI scaling
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Render Canvas Background
    renderBackground(ctx, rect.width, rect.height, backgroundStyle);

    // Render all saved strokes for active page
    const currentStrokes = strokesByPage[activePage] || [];
    currentStrokes.forEach((st) => drawStrokeOnContext(ctx, st));
  }, [strokesByPage, activePage, backgroundStyle]);

  const renderBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    bg: string
  ) => {
    if (bg === "BLACKBOARD") {
      ctx.fillStyle = "#18202F";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      const step = 28;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      return;
    }

    // Default light modes
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    if (bg === "GRID") {
      ctx.strokeStyle = "rgba(79, 70, 229, 0.08)";
      ctx.lineWidth = 1;
      const step = 25;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (bg === "RULED") {
      ctx.strokeStyle = "rgba(59, 130, 246, 0.12)";
      ctx.lineWidth = 1;
      const step = 32;
      for (let y = 40; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      // Red margin line
      ctx.strokeStyle = "rgba(239, 68, 68, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(60, 0);
      ctx.lineTo(60, height);
      ctx.stroke();
    }
  };

  const drawStrokeOnContext = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (!stroke.points || stroke.points.length === 0) return;

    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (stroke.tool === "highlighter") {
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = stroke.width * 2.5;
    } else if (stroke.tool === "eraser") {
      ctx.strokeStyle = backgroundStyle === "BLACKBOARD" ? "#18202F" : "#FFFFFF";
      ctx.lineWidth = stroke.width * 3;
    }

    const pts = stroke.points;

    if (stroke.tool === "rect" && pts.length >= 2) {
      const p0 = pts[0];
      const p1 = pts[pts.length - 1];
      ctx.strokeRect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y);
    } else if (stroke.tool === "circle" && pts.length >= 2) {
      const p0 = pts[0];
      const p1 = pts[pts.length - 1];
      const rx = Math.abs(p1.x - p0.x) / 2;
      const ry = Math.abs(p1.y - p0.y) / 2;
      const cx = Math.min(p0.x, p1.x) + rx;
      const cy = Math.min(p0.y, p1.y) + ry;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (stroke.tool === "line" && pts.length >= 2) {
      const p0 = pts[0];
      const p1 = pts[pts.length - 1];
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    } else {
      // Freehand drawing with quadratic smoothing
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
    }

    ctx.restore();
  };

  // Mouse / Pointer Event Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawingRef.current = true;
    currentPointsRef.current = [{ x, y }];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canDraw) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentPointsRef.current.push({ x, y });

    // Live intermediate rendering
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentStroke: Stroke = {
      tool: activeTool,
      points: currentPointsRef.current,
      color: strokeColor,
      width: strokeWidth
    };

    // Fast local preview stroke
    drawStrokeOnContext(ctx, currentStroke);
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current || !canDraw) return;
    isDrawingRef.current = false;

    if (currentPointsRef.current.length < 2) return;

    const newStroke: Stroke = {
      tool: activeTool,
      points: [...currentPointsRef.current],
      color: strokeColor,
      width: strokeWidth
    };

    // Commit to page state
    setStrokesByPage((prev) => {
      const list = prev[activePage] || [];
      return {
        ...prev,
        [activePage]: [...list, newStroke]
      };
    });

    // Broadcast stroke to all 100 students in the room via WebSocket
    if (socket && isConnected) {
      socket.emit("draw_stroke", {
        roomId: roomCode,
        stroke: newStroke,
        page: activePage
      });
    }

    currentPointsRef.current = [];
  };

  // Smart Board Actions
  const handleClearBoard = () => {
    if (userRole !== "INSTRUCTOR") return;
    setStrokesByPage((prev) => ({ ...prev, [activePage]: [] }));
    if (socket && isConnected) {
      socket.emit("clear_board", { roomId: roomCode, page: activePage });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setActivePage(newPage);
    if (userRole === "INSTRUCTOR" && socket && isConnected) {
      socket.emit("change_page", { roomId: roomCode, page: newPage });
    }
  };

  const handleAddPage = () => {
    const nextP = totalPages + 1;
    setTotalPages(nextP);
    setStrokesByPage((prev) => ({ ...prev, [nextP]: [] }));
    handlePageChange(nextP);
  };

  const handleBackgroundChange = (bg: "GRID" | "RULED" | "PLAIN" | "BLACKBOARD") => {
    setBackgroundStyle(bg);
    if (userRole === "INSTRUCTOR" && socket && isConnected) {
      socket.emit("change_background", { roomId: roomCode, background: bg });
    }
  };

  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `Inxyme-SmartBoard-Page${activePage}-${roomCode}.png`;
    a.click();
  };

  // Chat & Doubts
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (socket && isConnected) {
      socket.emit("send_message", {
        roomId: roomCode,
        text: chatInput,
        isDoubt: isDoubtMode
      });
    } else {
      const localMsg: ChatMessage = {
        id: "msg-" + Date.now(),
        sender: userRole === "INSTRUCTOR" ? "Prof. Ramesh Sharma" : currentStudentName,
        role: userRole,
        text: chatInput,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isDoubt: isDoubtMode
      };
      setChatMessages((prev) => [...prev, localMsg]);
    }

    setChatInput("");
  };

  const handleToggleHandRaise = () => {
    const nextState = !myHandRaised;
    setMyHandRaised(nextState);

    if (socket && isConnected) {
      if (nextState) {
        socket.emit("raise_hand", { roomId: roomCode });
      } else {
        socket.emit("lower_hand", { roomId: roomCode, studentId: currentStudentId });
      }
    }
  };

  const handleToggleStudentDrawing = (studentId: string, currentPerm: boolean) => {
    if (userRole !== "INSTRUCTOR") return;
    if (socket && isConnected) {
      socket.emit("toggle_student_draw_access", {
        roomId: roomCode,
        studentId,
        allow: !currentPerm
      });
    }
  };

  const handleResolveDoubt = (messageId: string) => {
    if (userRole !== "INSTRUCTOR") return;
    if (socket && isConnected) {
      socket.emit("resolve_doubt", { roomId: roomCode, messageId });
    } else {
      setChatMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isResolved: true } : m))
      );
    }
  };

  const filteredChat = chatMessages.filter((m) => {
    if (chatFilter === "doubts") return m.isDoubt;
    return true;
  });

  return (
    <ProtectedRoute allowedRoles={["INSTRUCTOR", "STUDENT", "ADMIN"]}>
      <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-6 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-bold text-lg text-white">
              IX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-tight text-lg">Inxyme</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  LMS Smart Board
                </span>
              </div>
              <p className="text-[11px] text-slate-400">100-Student Real-Time Synchronous Engine</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("classroom")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "classroom"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-300" />
              Live Classroom ({roomCode})
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Student Portal & Courses
            </button>
          </nav>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all"
            title="Return to Home / Auth"
          >
            <Home className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Auth / Home</span>
          </Link>
        </div>

        {/* Server & Role Control */}
        <div className="flex items-center gap-4">
          {/* Concurrency Telemetry */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
              <span className="text-slate-300 font-medium">
                {isConnected ? "Gateway Online (Port 5007)" : "Reconnecting Gateway..."}
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>{participantsCount} Students Live</span>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 pl-2">Role:</span>
            <button
              onClick={() => setUserRole("INSTRUCTOR")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                userRole === "INSTRUCTOR"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Instructor Studio
            </button>
            <button
              onClick={() => setUserRole("STUDENT")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                userRole === "STUDENT"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Student View
            </button>
          </div>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center font-bold text-xs text-white shadow-md">
                {user.name.charAt(0)}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-white leading-tight truncate max-w-[130px]">{user.name}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{user.role === "INSTRUCTOR" ? "Teacher" : "Student"}</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Sign out of LMS"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      {activeTab === "classroom" ? (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Smart Board Work Area */}
          <div className="flex-1 flex flex-col bg-slate-950 p-4 gap-3 relative">
            {/* Top Whiteboard Control Bar */}
            <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
              {/* Tool Selection */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-400 mr-1">Tools:</span>
                <button
                  disabled={!canDraw}
                  onClick={() => setActiveTool("pen")}
                  className={`p-2 rounded-xl transition-all ${
                    activeTool === "pen"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-40"
                  }`}
                  title="Pen Tool"
                >
                  <Pen className="w-4 h-4" />
                </button>
                <button
                  disabled={!canDraw}
                  onClick={() => setActiveTool("highlighter")}
                  className={`p-2 rounded-xl transition-all ${
                    activeTool === "highlighter"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-40"
                  }`}
                  title="Highlighter"
                >
                  <Highlighter className="w-4 h-4" />
                </button>
                <button
                  disabled={!canDraw}
                  onClick={() => setActiveTool("rect")}
                  className={`p-2 rounded-xl transition-all ${
                    activeTool === "rect"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-40"
                  }`}
                  title="Rectangle"
                >
                  <Square className="w-4 h-4" />
                </button>
                <button
                  disabled={!canDraw}
                  onClick={() => setActiveTool("circle")}
                  className={`p-2 rounded-xl transition-all ${
                    activeTool === "circle"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-40"
                  }`}
                  title="Circle"
                >
                  <Circle className="w-4 h-4" />
                </button>
                <button
                  disabled={!canDraw}
                  onClick={() => setActiveTool("line")}
                  className={`p-2 rounded-xl transition-all ${
                    activeTool === "line"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-40"
                  }`}
                  title="Straight Line"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  disabled={!canDraw}
                  onClick={() => setActiveTool("eraser")}
                  className={`p-2 rounded-xl transition-all ${
                    activeTool === "eraser"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-40"
                  }`}
                  title="Eraser"
                >
                  <Eraser className="w-4 h-4" />
                </button>

                {userRole === "INSTRUCTOR" && (
                  <button
                    onClick={handleClearBoard}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-all ml-1"
                    title="Clear Active Board"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Color & Stroke Width */}
              <div className="flex items-center gap-3">
                {/* Palette */}
                <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
                  {["#4F46E5", "#10B981", "#EF4444", "#3B82F6", "#F59E0B", "#1E293B", "#FFFFFF"].map((col) => (
                    <button
                      key={col}
                      onClick={() => setStrokeColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-5 h-5 rounded-full border-2 transition-transform ${
                        strokeColor === col ? "scale-125 border-white shadow-md" : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>

                {/* Width Picker */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Size:</span>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-20 accent-indigo-500 cursor-pointer"
                  />
                  <span className="font-mono text-slate-300 w-4">{strokeWidth}</span>
                </div>
              </div>

              {/* Background Styles & Multi-Page Navigation */}
              <div className="flex items-center gap-3">
                {/* Background selector */}
                <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => handleBackgroundChange("GRID")}
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      backgroundStyle === "GRID" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                    title="Engineering Grid"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleBackgroundChange("RULED")}
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      backgroundStyle === "RULED" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                    title="Ruled Notebook"
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleBackgroundChange("PLAIN")}
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      backgroundStyle === "PLAIN" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                    title="Plain Whiteboard"
                  >
                    <Sun className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleBackgroundChange("BLACKBOARD")}
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      backgroundStyle === "BLACKBOARD" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                    title="Dark Blackboard"
                  >
                    <Moon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Page Manager */}
                <div className="flex items-center gap-1.5 bg-slate-950/60 px-2 py-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => handlePageChange(activePage - 1)}
                    disabled={activePage <= 1}
                    className="p-1 rounded hover:bg-slate-800 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-semibold text-slate-300">
                    Page {activePage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(activePage + 1)}
                    disabled={activePage >= totalPages}
                    className="p-1 rounded hover:bg-slate-800 disabled:opacity-30"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  {userRole === "INSTRUCTOR" && (
                    <button
                      onClick={handleAddPage}
                      className="p-1 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 ml-1"
                      title="Add New Board Page"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Export / Notes Download */}
                <button
                  onClick={handleDownloadSnapshot}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-all border border-slate-700"
                  title="Export Current Board Page"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Notes</span>
                </button>
              </div>
            </div>

            {/* Smart Board Canvas Area */}
            <div className="flex-1 relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-white flex items-center justify-center">
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={`w-full h-full touch-none select-none ${
                  canDraw ? "cursor-crosshair" : "cursor-default"
                }`}
              />

              {/* Status Overlay Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-200 text-xs font-medium border border-slate-700/60 shadow-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Interactive Smart Board • {backgroundStyle} Mode
                </span>
                {!canDraw && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/90 text-slate-950 text-xs font-bold shadow-lg flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Read-Only Mode (Instructor Presenting)
                  </span>
                )}
              </div>

              {/* Student Raise Hand Button Float */}
              {userRole === "STUDENT" && (
                <div className="absolute bottom-6 left-6 z-20">
                  <button
                    onClick={handleToggleHandRaise}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm shadow-2xl transition-all transform active:scale-95 ${
                      myHandRaised
                        ? "bg-amber-500 text-slate-950 animate-bounce"
                        : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/40"
                    }`}
                  >
                    <Hand className="w-5 h-5" />
                    <span>{myHandRaised ? "Hand Raised (Waiting for Teacher)" : "Raise Hand to Speak"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Live Interaction Panel (Roster & Chat) */}
          <div className="w-full lg:w-96 border-l border-slate-800 bg-slate-950 flex flex-col h-auto lg:h-full">
            {/* Panel Header Tabs */}
            <div className="flex items-center border-b border-slate-800 px-4 pt-3 pb-2 gap-2">
              <button
                onClick={() => setRightPanelTab("chat")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
                  rightPanelTab === "chat"
                    ? "bg-slate-800 text-white border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                Live Doubts & Chat
              </button>
              <button
                onClick={() => setRightPanelTab("roster")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
                  rightPanelTab === "roster"
                    ? "bg-slate-800 text-white border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                100 Students Roster ({participantsCount})
              </button>
            </div>

            {/* TAB 1: Live Chat & Doubts */}
            {rightPanelTab === "chat" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Chat Filters */}
                <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setChatFilter("all")}
                      className={`px-3 py-1 rounded-lg font-medium transition-all ${
                        chatFilter === "all" ? "bg-indigo-600 text-white" : "text-slate-400"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setChatFilter("doubts")}
                      className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                        chatFilter === "doubts" ? "bg-amber-500 text-slate-950 font-bold" : "text-amber-400"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      Doubts Only
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500">{filteredChat.length} Messages</span>
                </div>

                {/* Messages List */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {filteredChat.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        msg.isDoubt
                          ? msg.isResolved
                            ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-200"
                            : "bg-amber-950/30 border-amber-500/40 text-amber-200 shadow-lg shadow-amber-500/5"
                          : msg.role === "INSTRUCTOR"
                          ? "bg-indigo-950/30 border-indigo-500/30 text-indigo-100"
                          : "bg-slate-900 border-slate-800 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold flex items-center gap-1.5">
                          {msg.sender}
                          {msg.role === "INSTRUCTOR" && (
                            <span className="px-1.5 py-0.2 bg-indigo-500 text-white text-[9px] font-extrabold rounded">
                              TEACHER
                            </span>
                          )}
                          {msg.isDoubt && (
                            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[9px] font-extrabold rounded">
                              DOUBT
                            </span>
                          )}
                        </span>
                        <span className="text-slate-500">{msg.time}</span>
                      </div>
                      <p className="text-xs leading-relaxed">{msg.text}</p>

                      {/* Instructor doubt resolve button */}
                      {msg.isDoubt && userRole === "INSTRUCTOR" && !msg.isResolved && (
                        <button
                          onClick={() => handleResolveDoubt(msg.id)}
                          className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Doubt as Answered
                        </button>
                      )}
                      {msg.isResolved && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Resolved in lecture
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Send Message Form */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDoubtMode}
                        onChange={(e) => setIsDoubtMode(e.target.checked)}
                        className="rounded accent-amber-500 cursor-pointer"
                      />
                      <span className={isDoubtMode ? "text-amber-400 font-semibold" : ""}>
                        Ask as a Question / Doubt
                      </span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={isDoubtMode ? "Type your doubt for the teacher..." : "Message 100 students in room..."}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: 100 Students Roster */}
            {rightPanelTab === "roster" && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">Class Concurrency Capacity:</span>
                    <p className="font-extrabold text-indigo-400 text-sm">{participantsCount} / 150 Seats Active</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Sync Latency:</span>
                    <p className="font-semibold text-emerald-400 text-xs">~24 ms (WebSocket)</p>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-400 tracking-wide uppercase px-1">
                  Active Classroom Participants
                </div>

                {/* Instructor Item */}
                <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs text-white">
                      RS
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">Prof. Ramesh Sharma</h4>
                      <p className="text-[10px] text-indigo-300">Host & Presenter (Drawing Master)</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                    Instructor
                  </span>
                </div>

                {/* Sample Concurrent Students List */}
                {[
                  { id: "stud-101", name: "Aarav Patel", handRaised: true, canDraw: true },
                  { id: "stud-102", name: "Diya Deshmukh", handRaised: false, canDraw: false },
                  { id: "stud-103", name: "Vikram Singhania", handRaised: true, canDraw: false },
                  { id: "stud-104", name: "Ananya Iyer", handRaised: false, canDraw: false },
                  { id: "stud-105", name: "Rohan Verma", handRaised: false, canDraw: false },
                  { id: "stud-106", name: "Sneha Mukherjee", handRaised: false, canDraw: false }
                ].map((st) => (
                  <div
                    key={st.id}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-semibold text-[11px] text-slate-300">
                        {st.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          {st.name}
                          {st.handRaised && (
                            <span className="flex items-center gap-0.5 text-amber-400 font-bold text-[10px]">
                              <Hand className="w-3 h-3 animate-bounce" /> Hand
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">ID: #{st.id}</p>
                      </div>
                    </div>

                    {/* Teacher can grant/revoke board drawing permissions */}
                    {userRole === "INSTRUCTOR" ? (
                      <button
                        onClick={() => handleToggleStudentDrawing(st.id, st.canDraw)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[10px] transition-all ${
                          st.canDraw
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                        title="Toggle student board drawing access"
                      >
                        {st.canDraw ? (
                          <>
                            <Unlock className="w-3 h-3" /> Can Draw
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" /> Locked
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500">
                        {st.canDraw ? "Drawing Granted" : "Listening"}
                      </span>
                    )}
                  </div>
                ))}

                <div className="text-center py-2 text-slate-500 text-[11px]">
                  + 82 more enrolled students synchronously connected
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB: Student LMS Dashboard & Courses */
        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
          {/* Welcome Banner */}
          <div className="rounded-3xl p-8 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-800/40 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                100+ Concurrent Student LMS Active
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Welcome to Inxyme Live LMS & Smart Classroom
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed">
                Connect seamlessly with high-resolution digital whiteboards, synchronous vector derivations,
                interactive doubts, and auto-compiled lecture notes.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setActiveTab("classroom")}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/40 flex items-center gap-2"
                >
                  <Radio className="w-4 h-4 text-emerald-400" />
                  Join Live Lecture #{roomCode}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-slate-400 text-xs font-medium">Active Live Classes</span>
              <h3 className="text-2xl font-extrabold text-white">2 Live</h3>
              <p className="text-[11px] text-emerald-400 font-semibold">100 Students Connected</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-slate-400 text-xs font-medium">Enrolled Courses</span>
              <h3 className="text-2xl font-extrabold text-white">4 Courses</h3>
              <p className="text-[11px] text-indigo-400 font-semibold">Semester IV Full Access</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-slate-400 text-xs font-medium">Lecture Notes Available</span>
              <h3 className="text-2xl font-extrabold text-white">18 PDFs</h3>
              <p className="text-[11px] text-slate-400 font-semibold">Auto-Compiled from Smart Board</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-slate-400 text-xs font-medium">Attendance Score</span>
              <h3 className="text-2xl font-extrabold text-emerald-400">96.8%</h3>
              <p className="text-[11px] text-slate-400 font-semibold">Tracked via Real-Time Heartbeat</p>
            </div>
          </div>

          {/* Courses & Lectures Catalog */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Your Courses & Live Smart Board Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course 1 */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                    CS-401 • Real-Time Systems
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE NOW
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Advanced Computer Networks & Synchronous Canvas Engineering
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deep dive into real-time multiplexing, WebSocket protocol buffers, and low-latency digital whiteboard broadcasts for 100+ concurrent students.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>88 Students in Classroom</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("classroom")}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                  >
                    Enter Live Studio <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Course 2 */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                    MATH-302 • Calculus III
                  </span>
                  <span className="text-slate-400 text-xs font-medium">Starts in 2h 15m</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Engineering Mathematics: Vector Calculus & Stokes Theorem
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interactive multi-dimensional surface derivations on Inxyme grid whiteboard with synchronous equation plotting.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Scheduled 4:00 PM</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("classroom")}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5"
                  >
                    Preview Board
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
