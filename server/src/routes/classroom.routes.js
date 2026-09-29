const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroom.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.get('/', classroomController.getAllSessions);
router.get('/:roomCode', classroomController.getSessionByRoomCode);
router.post('/', verifyToken, classroomController.createSession);

module.exports = router;
