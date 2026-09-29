let prisma = null;

try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} catch (err) {
  console.log('ℹ️ Running in resilient memory store mode (DB initialization pending):', err.message);
  prisma = null;
}

// In-Memory Seed State for instant development and high-concurrency testing
const memoryStore = {
  users: [
    {
      id: 'inst-001',
      name: 'Prof. Ramesh Sharma',
      email: 'ramesh.sharma@inxyme.com',
      role: 'INSTRUCTOR',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      headline: 'Senior Faculty & LMS Lead'
    },
    {
      id: 'stud-101',
      name: 'Aarav Patel',
      email: 'aarav.patel@student.inxyme.com',
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      headline: 'Full-Stack Engineering Batch A'
    }
  ],
  courses: [
    {
      id: 'course-101',
      title: 'Advanced Computer Networks & System Design',
      code: 'CS-401',
      description: 'Distributed protocols, WebSocket streaming, low latency data pipelines, and scalable LMS architecture.',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
      category: 'Computer Science',
      instructorId: 'inst-001',
      enrolledCount: 98
    },
    {
      id: 'course-102',
      title: 'Engineering Mathematics & Calculus III',
      code: 'MATH-302',
      description: 'Vector calculus, differential forms, and Fourier transforms with real-time interactive smart board derivations.',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
      category: 'Mathematics',
      instructorId: 'inst-001',
      enrolledCount: 104
    }
  ],
  sessions: [
    {
      id: 'sess-live-01',
      roomCode: 'INX-LIVE-401',
      title: 'Live Derivation: Concurrency & Real-Time Canvas Sync (100 Students Room)',
      description: 'Interactive lecture with smart board demonstrations, live doubt clearing, and synchronous canvas broadcasting.',
      courseId: 'course-101',
      courseTitle: 'Advanced Computer Networks & System Design',
      instructorId: 'inst-001',
      instructorName: 'Prof. Ramesh Sharma',
      status: 'LIVE',
      maxCapacity: 150,
      activeStudentsCount: 87,
      scheduledStart: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      activePage: 1,
      backgroundStyle: 'GRID',
      isStudentDrawingLocked: true
    },
    {
      id: 'sess-upcoming-02',
      roomCode: 'INX-MATH-302',
      title: 'Vector Calculus: Line Integrals & Stokes Theorem',
      description: 'Visualizing surfaces and multi-layer vector paths on the Inxyme digital whiteboard.',
      courseId: 'course-102',
      courseTitle: 'Engineering Mathematics & Calculus III',
      instructorId: 'inst-001',
      instructorName: 'Prof. Ramesh Sharma',
      status: 'SCHEDULED',
      maxCapacity: 150,
      activeStudentsCount: 0,
      scheduledStart: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      activePage: 1,
      backgroundStyle: 'RULED',
      isStudentDrawingLocked: true
    }
  ],
  boardStates: {
    'INX-LIVE-401': {
      activePage: 1,
      background: 'GRID',
      pages: {
        1: [
          // Sample initial vector strokes for preview
          {
            type: 'path',
            points: [{ x: 120, y: 150 }, { x: 340, y: 150 }, { x: 340, y: 280 }, { x: 120, y: 280 }, { x: 120, y: 150 }],
            color: '#4F46E5',
            width: 3,
            tool: 'rect'
          },
          {
            type: 'text',
            x: 135,
            y: 190,
            text: 'Inxyme WebSocket Gateway (100 Concurrent Nodes)',
            color: '#1E293B',
            fontSize: 16
          }
        ],
        2: [],
        3: []
      }
    }
  },
  chatMessages: {
    'INX-LIVE-401': [
      {
        id: 'msg-1',
        sender: 'Prof. Ramesh Sharma',
        role: 'INSTRUCTOR',
        text: 'Welcome everyone! Today we demonstrate 100-student synchronous drawing and doubt resolution.',
        time: '13:40',
        isDoubt: false
      },
      {
        id: 'msg-2',
        sender: 'Aarav Patel',
        role: 'STUDENT',
        text: 'Sir, what is the broadcast latency when 100 students receive a stroke update?',
        time: '13:42',
        isDoubt: true,
        isResolved: false
      }
    ]
  },
  handRaises: {
    'INX-LIVE-401': [
      {
        id: 'hr-1',
        studentId: 'stud-101',
        studentName: 'Aarav Patel',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        time: '13:43',
        status: 'PENDING'
      }
    ]
  },
  notes: [
    {
      id: 'note-01',
      sessionId: 'sess-live-01',
      title: 'Lecture 12 Notes - Distributed Synchronization & Smart Board Vectoring',
      date: '2026-09-29',
      pageCount: 6,
      size: '2.4 MB',
      downloadUrl: '/api/smartboard/export/pdf/sess-live-01'
    }
  ]
};

module.exports = {
  prisma,
  memoryStore
};
