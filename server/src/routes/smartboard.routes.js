const express = require('express');
const router = express.Router();
const smartboardController = require('../controllers/smartboard.controller');

router.get('/notes', smartboardController.getLectureNotes);
router.get('/export/pdf/:sessionId', smartboardController.exportSessionPdf);

module.exports = router;
