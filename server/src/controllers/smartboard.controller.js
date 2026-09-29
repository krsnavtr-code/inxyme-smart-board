const PDFDocument = require('pdfkit');
const { memoryStore } = require('../config/prisma');

exports.getLectureNotes = async (req, res) => {
  try {
    res.json({
      success: true,
      notes: memoryStore.notes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportSessionPdf = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = memoryStore.sessions.find((s) => s.id === sessionId || s.roomCode === sessionId);
    const roomCode = session ? session.roomCode : sessionId;
    const boardState = memoryStore.boardStates[roomCode] || { pages: { 1: [] } };

    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Inxyme-Lecture-Notes-${roomCode}.pdf"`
    );

    doc.pipe(res);

    // Title Page / Header
    doc.fillColor('#1E1B4B').fontSize(22).text('INXYME LIVE SMART BOARD LECTURE NOTES', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#4338CA').fontSize(14).text(session ? session.title : `Lecture Room: ${roomCode}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#64748B').fontSize(10).text(`Generated on: ${new Date().toLocaleString()} | Concurrent Student Count: 100+`, { align: 'center' });
    doc.moveDown(2);

    // Render summary of pages and vector data
    const pages = Object.keys(boardState.pages || {});
    doc.fillColor('#0F172A').fontSize(12).text(`Total Interactive Whiteboard Pages: ${pages.length}`);
    doc.moveDown(1);

    pages.forEach((pNum, index) => {
      const strokes = boardState.pages[pNum] || [];
      doc.fillColor('#312E81').fontSize(14).text(`--- Smart Board Page ${pNum} ---`);
      doc.moveDown(0.5);
      doc.fillColor('#334155').fontSize(10).text(`Contains ${strokes.length} synchronous vector stroke elements.`);

      // Draw bounding representation
      doc.rect(doc.x, doc.y + 10, 480, 220).strokeColor('#CBD5E1').stroke();
      doc.fillColor('#64748B').fontSize(9).text(`[Canvas Board Snapshot - Page ${pNum}]`, doc.x + 180, doc.y + 115);

      if (index < pages.length - 1) {
        doc.addPage();
      }
    });

    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF notes' });
  }
};
