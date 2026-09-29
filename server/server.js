require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const { initializeSmartboardSocket } = require('./src/sockets/smartboardSocket');
const authRoutes = require('./src/routes/auth.routes');
const classroomRoutes = require('./src/routes/classroom.routes');
const courseRoutes = require('./src/routes/course.routes');
const smartboardRoutes = require('./src/routes/smartboard.routes');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Setup Socket.IO with high concurrency optimizations (buffer limits, ping intervals)
const io = new Server(server, {
  cors: {
    origin: '*', // Allow development origins including Next.js
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 20000,
  pingInterval: 10000,
  maxHttpBufferSize: 1e6 // 1MB buffer max for stroke packet protection
});

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Inxyme Smart Board & Live Classroom LMS Gateway',
    concurrencyTarget: '100+ Concurrent Students per Room',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/smartboard', smartboardRoutes);

// Initialize Socket.IO Handlers
initializeSmartboardSocket(io);

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 INXYME SMART BOARD & LMS SERVER RUNNING`);
  console.log(`📍 Port: http://localhost:${PORT}`);
  console.log(`📡 WebSocket Engine: READY for 100+ concurrent students`);
  console.log(`🎯 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
