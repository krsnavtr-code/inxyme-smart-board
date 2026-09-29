const pool = require('../config/db');

async function seedWhiteboardPages(connection = null) {
  const conn = connection || (await pool.getConnection());
  const shouldRelease = !connection;

  try {
    console.log('🎨 [5/9] Seeding Whiteboard Pages table...');

    const sampleStrokes = JSON.stringify([
      {
        tool: 'rect',
        points: [{ x: 100, y: 120 }, { x: 380, y: 120 }, { x: 380, y: 260 }, { x: 100, y: 260 }, { x: 100, y: 120 }],
        color: '#4F46E5',
        width: 3
      },
      {
        tool: 'pen',
        points: [{ x: 140, y: 180 }, { x: 320, y: 180 }],
        color: '#10B981',
        width: 4
      }
    ]);

    const pages = [
      { id: 'page-01', sessionId: 'sess-live-01', pageNumber: 1, background: 'GRID', strokes: sampleStrokes },
      { id: 'page-02', sessionId: 'sess-live-01', pageNumber: 2, background: 'GRID', strokes: '[]' },
      { id: 'page-03', sessionId: 'sess-live-01', pageNumber: 3, background: 'GRID', strokes: '[]' },
      { id: 'page-04', sessionId: 'sess-sched-02', pageNumber: 1, background: 'RULED', strokes: '[]' },
      { id: 'page-05', sessionId: 'sess-ended-03', pageNumber: 1, background: 'BLACKBOARD', strokes: sampleStrokes }
    ];

    for (const p of pages) {
      await conn.query(`
        INSERT INTO whiteboard_pages (id, sessionId, pageNumber, background, strokes, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
          background = VALUES(background),
          strokes = VALUES(strokes),
          updatedAt = NOW();
      `, [p.id, p.sessionId, p.pageNumber, p.background, p.strokes]);
    }

    console.log(`✅ Whiteboard Pages seeded successfully (${pages.length} pages).`);
  } catch (err) {
    console.error('❌ Failed seeding Whiteboard Pages:', err.message);
    throw err;
  } finally {
    if (shouldRelease) conn.release();
  }
}

// Allow running directly: node src/seeds/whiteboard_pages.seed.js
if (require.main === module) {
  seedWhiteboardPages()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedWhiteboardPages;
