const { memoryStore } = require('../config/prisma');

/**
 * Socket.IO Handler for Inxyme Smart Board & Live Classroom
 * Engineered for 100+ concurrent student sessions per room.
 */
function initializeSmartboardSocket(io) {
  // In-memory active room tracker
  // Map<roomId, { instructorSocketId, participants: Map<socketId, studentInfo>, strokesByPage: Map<pageNumber, stroke[]> }>
  const activeRooms = new Map();

  io.on('connection', (socket) => {
    let currentRoom = null;
    let currentUser = null;

    // --- 1. Join Classroom Room ---
    socket.on('join_room', ({ roomId, user }) => {
      currentRoom = roomId;
      currentUser = user || { id: socket.id, name: 'Guest Student', role: 'STUDENT' };

      socket.join(roomId);

      // Initialize room data if not existing
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, {
          participants: new Map(),
          instructorId: currentUser.role === 'INSTRUCTOR' ? currentUser.id : null,
          activePage: 1,
          background: 'GRID',
          isDrawingLocked: true,
          permittedStudents: new Set(),
          strokes: memoryStore.boardStates[roomId]?.pages || { 1: [] }
        });
      }

      const roomData = activeRooms.get(roomId);

      // Update instructor if instructor joined
      if (currentUser.role === 'INSTRUCTOR') {
        roomData.instructorId = currentUser.id;
      }

      // Add participant to roster
      roomData.participants.set(socket.id, {
        socketId: socket.id,
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        avatar: currentUser.avatar,
        hasDrawingPermission: currentUser.role === 'INSTRUCTOR' || roomData.permittedStudents.has(currentUser.id),
        handRaised: false,
        joinedAt: new Date().toISOString()
      });

      // Send initial room snapshot to newly joined user
      socket.emit('room_init_state', {
        roomId,
        activePage: roomData.activePage,
        background: roomData.background,
        isDrawingLocked: roomData.isDrawingLocked,
        canDraw: currentUser.role === 'INSTRUCTOR' || roomData.permittedStudents.has(currentUser.id),
        strokes: roomData.strokes[roomData.activePage] || [],
        allPages: Object.keys(roomData.strokes).map(Number),
        chatHistory: memoryStore.chatMessages[roomId] || [],
        handRaises: memoryStore.handRaises[roomId] || [],
        participantsCount: roomData.participants.size
      });

      // Broadcast updated roster and count to all 100+ students in room
      emitRosterUpdate(io, roomId, roomData);
    });

    // --- 2. Live Drawing Sync (Optimized Delta Broadcasting) ---
    socket.on('draw_stroke', (data) => {
      if (!currentRoom) return;
      const roomData = activeRooms.get(currentRoom);
      if (!roomData) return;

      const participant = roomData.participants.get(socket.id);
      const canDraw = participant && (participant.role === 'INSTRUCTOR' || participant.hasDrawingPermission);

      if (!canDraw) {
        socket.emit('error_message', 'You do not have drawing permission on the smart board.');
        return;
      }

      const pageNum = data.page || roomData.activePage || 1;
      if (!roomData.strokes[pageNum]) {
        roomData.strokes[pageNum] = [];
      }

      // Store stroke in room memory
      roomData.strokes[pageNum].push(data.stroke);

      // Broadcast stroke to all OTHER 100 students in the room with ultra-low latency
      socket.to(currentRoom).emit('stroke_received', {
        stroke: data.stroke,
        page: pageNum,
        senderId: currentUser.id
      });
    });

    // --- 3. Clear Board ---
    socket.on('clear_board', ({ page }) => {
      if (!currentRoom) return;
      const roomData = activeRooms.get(currentRoom);
      if (!roomData) return;

      if (currentUser?.role !== 'INSTRUCTOR') return;

      const pageNum = page || roomData.activePage;
      roomData.strokes[pageNum] = [];

      io.to(currentRoom).emit('board_cleared', { page: pageNum });
    });

    // --- 4. Switch Board Page / Change Background ---
    socket.on('change_page', ({ page }) => {
      if (!currentRoom) return;
      const roomData = activeRooms.get(currentRoom);
      if (!roomData || currentUser?.role !== 'INSTRUCTOR') return;

      roomData.activePage = page;
      if (!roomData.strokes[page]) {
        roomData.strokes[page] = [];
      }

      io.to(currentRoom).emit('page_changed', {
        page,
        strokes: roomData.strokes[page] || []
      });
    });

    socket.on('change_background', ({ background }) => {
      if (!currentRoom) return;
      const roomData = activeRooms.get(currentRoom);
      if (!roomData || currentUser?.role !== 'INSTRUCTOR') return;

      roomData.background = background;
      io.to(currentRoom).emit('background_changed', { background });
    });

    // --- 5. Teacher Grants/Revokes Drawing Access for a Student ---
    socket.on('toggle_student_draw_access', ({ studentId, allow }) => {
      if (!currentRoom) return;
      const roomData = activeRooms.get(currentRoom);
      if (!roomData || currentUser?.role !== 'INSTRUCTOR') return;

      if (allow) {
        roomData.permittedStudents.add(studentId);
      } else {
        roomData.permittedStudents.delete(studentId);
      }

      // Find socket for this student and update their status
      for (const [sId, p] of roomData.participants.entries()) {
        if (p.id === studentId) {
          p.hasDrawingPermission = allow;
          io.to(sId).emit('draw_permission_updated', { canDraw: allow });
          break;
        }
      }

      emitRosterUpdate(io, currentRoom, roomData);
    });

    // --- 6. Raise Hand / Lower Hand Queue ---
    socket.on('raise_hand', () => {
      if (!currentRoom) return;
      const roomData = activeRooms.get(currentRoom);
      if (!roomData) return;

      const participant = roomData.participants.get(socket.id);
      if (participant) {
        participant.handRaised = true;
      }

      const hrItem = {
        id: 'hr-' + Date.now(),
        studentId: currentUser.id,
        studentName: currentUser.name,
        avatar: currentUser.avatar,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'PENDING'
      };

      if (!memoryStore.handRaises[currentRoom]) {
        memoryStore.handRaises[currentRoom] = [];
      }
      memoryStore.handRaises[currentRoom].push(hrItem);

      io.to(currentRoom).emit('hand_raised_broadcast', hrItem);
      emitRosterUpdate(io, currentRoom, roomData);
    });

    socket.on('lower_hand', ({ studentId }) => {
      if (!currentRoom) return;
      const roomData = activeRooms.get(currentRoom);
      if (!roomData) return;

      const targetId = studentId || currentUser.id;
      for (const [, p] of roomData.participants.entries()) {
        if (p.id === targetId) {
          p.handRaised = false;
        }
      }

      if (memoryStore.handRaises[currentRoom]) {
        memoryStore.handRaises[currentRoom] = memoryStore.handRaises[currentRoom].filter(
          (hr) => hr.studentId !== targetId
        );
      }

      io.to(currentRoom).emit('hand_lowered_broadcast', { studentId: targetId });
      emitRosterUpdate(io, currentRoom, roomData);
    });

    // --- 7. Live Doubt & Chat ---
    socket.on('send_message', ({ text, isDoubt }) => {
      if (!currentRoom || !text?.trim()) return;

      const messageObj = {
        id: 'msg-' + Date.now(),
        sender: currentUser.name,
        role: currentUser.role,
        text: text.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDoubt: Boolean(isDoubt),
        isResolved: false
      };

      if (!memoryStore.chatMessages[currentRoom]) {
        memoryStore.chatMessages[currentRoom] = [];
      }
      memoryStore.chatMessages[currentRoom].push(messageObj);

      io.to(currentRoom).emit('new_message_broadcast', messageObj);
    });

    socket.on('resolve_doubt', ({ messageId }) => {
      if (!currentRoom || currentUser?.role !== 'INSTRUCTOR') return;

      if (memoryStore.chatMessages[currentRoom]) {
        const msg = memoryStore.chatMessages[currentRoom].find((m) => m.id === messageId);
        if (msg) {
          msg.isResolved = true;
          io.to(currentRoom).emit('doubt_resolved_broadcast', { messageId });
        }
      }
    });

    // --- 8. Disconnect ---
    socket.on('disconnect', () => {
      if (currentRoom && activeRooms.has(currentRoom)) {
        const roomData = activeRooms.get(currentRoom);
        roomData.participants.delete(socket.id);

        if (roomData.participants.size === 0) {
          // Keep stroke history saved in memoryStore
          memoryStore.boardStates[currentRoom] = {
            activePage: roomData.activePage,
            background: roomData.background,
            pages: roomData.strokes
          };
          activeRooms.delete(currentRoom);
        } else {
          emitRosterUpdate(io, currentRoom, roomData);
        }
      }
    });
  });
}

function emitRosterUpdate(io, roomId, roomData) {
  const participantsList = Array.from(roomData.participants.values());
  io.to(roomId).emit('roster_updated', {
    totalCount: participantsList.length,
    activeCount: participantsList.length,
    students: participantsList
  });
}

module.exports = {
  initializeSmartboardSocket
};
