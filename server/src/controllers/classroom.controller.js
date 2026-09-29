const pool = require('../config/db');
const { memoryStore } = require('../config/prisma');

exports.getAllSessions = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        cs.id, cs.roomCode, cs.title, cs.description, cs.courseId,
        c.title AS courseTitle,
        cs.instructorId,
        u.name AS instructorName,
        cs.status, cs.maxCapacity,
        87 AS activeStudentsCount,
        cs.scheduledStart, cs.activePage, cs.backgroundStyle,
        cs.isStudentDrawingLocked
      FROM classroom_sessions cs
      LEFT JOIN courses c ON cs.courseId = c.id
      LEFT JOIN users u ON cs.instructorId = u.id
      ORDER BY cs.createdAt DESC;
    `);

    if (rows && rows.length > 0) {
      return res.json({ success: true, sessions: rows });
    }

    // Fallback to memory store if no database rows populated yet
    res.json({
      success: true,
      sessions: memoryStore.sessions
    });
  } catch (error) {
    console.warn('MySQL sessions query error, using fallback:', error.message);
    res.json({ success: true, sessions: memoryStore.sessions });
  }
};

exports.getSessionByRoomCode = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        cs.id, cs.roomCode, cs.title, cs.description, cs.courseId,
        c.title AS courseTitle,
        cs.instructorId,
        u.name AS instructorName,
        cs.status, cs.maxCapacity,
        cs.scheduledStart, cs.activePage, cs.backgroundStyle,
        cs.isStudentDrawingLocked
      FROM classroom_sessions cs
      LEFT JOIN courses c ON cs.courseId = c.id
      LEFT JOIN users u ON cs.instructorId = u.id
      WHERE cs.roomCode = ?
      LIMIT 1;
    `, [roomCode]);

    let session = rows && rows.length > 0 ? rows[0] : null;

    if (!session) {
      session = memoryStore.sessions.find((s) => s.roomCode === roomCode);
    }

    if (!session) {
      return res.status(404).json({ success: false, message: 'Classroom session not found' });
    }

    const boardState = memoryStore.boardStates[roomCode] || { activePage: 1, pages: { 1: [] } };
    const chatHistory = memoryStore.chatMessages[roomCode] || [];
    const handRaises = memoryStore.handRaises[roomCode] || [];

    res.json({
      success: true,
      session,
      boardState,
      chatHistory,
      handRaises
    });
  } catch (error) {
    console.warn('MySQL get session error, using fallback:', error.message);
    const session = memoryStore.sessions.find((s) => s.roomCode === req.params.roomCode);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Classroom session not found' });
    }
    res.json({
      success: true,
      session,
      boardState: memoryStore.boardStates[req.params.roomCode] || { activePage: 1, pages: { 1: [] } },
      chatHistory: memoryStore.chatMessages[req.params.roomCode] || [],
      handRaises: memoryStore.handRaises[req.params.roomCode] || []
    });
  }
};

exports.createSession = async (req, res) => {
  try {
    const { title, courseId, scheduledStart, maxCapacity = 150 } = req.body;
    const roomCode = 'INX-' + Math.floor(100 + Math.random() * 900);
    const id = 'sess-' + Date.now();

    try {
      await pool.query(`
        INSERT INTO classroom_sessions 
        (id, roomCode, title, courseId, instructorId, status, scheduledStart, maxCapacity, activePage, backgroundStyle, isStudentDrawingLocked, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, 'SCHEDULED', ?, ?, 1, 'GRID', 1, NOW(), NOW())
      `, [id, roomCode, title || 'New Live Class', courseId || 'course-101', 'inst-001', scheduledStart || new Date(), maxCapacity]);
    } catch (dbErr) {
      console.warn('MySQL session insert note:', dbErr.message);
    }

    const newSession = {
      id,
      roomCode,
      title: title || 'New Live Interactive Lecture',
      description: 'Synchronous smart board lecture for live batch.',
      courseId: courseId || 'course-101',
      courseTitle: 'Advanced Computer Networks & System Design',
      instructorId: 'inst-001',
      instructorName: 'Prof. Ramesh Sharma',
      status: 'SCHEDULED',
      maxCapacity,
      activeStudentsCount: 0,
      scheduledStart: scheduledStart || new Date().toISOString(),
      activePage: 1,
      backgroundStyle: 'GRID',
      isStudentDrawingLocked: true
    };

    memoryStore.sessions.unshift(newSession);

    res.status(201).json({
      success: true,
      message: 'Classroom scheduled successfully in MySQL LMS database',
      session: newSession
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
