const pool = require('../config/db');

async function seedLectureNotes(connection = null) {
  const conn = connection || (await pool.getConnection());
  const shouldRelease = !connection;

  try {
    console.log('📄 [9/9] Seeding Lecture Notes table...');

    const notes = [
      {
        id: 'note-01',
        sessionId: 'sess-live-01',
        title: 'Lecture 12 Notes - Distributed Synchronization & Smart Board Vectoring',
        pdfUrl: '/api/smartboard/export/pdf/sess-live-01',
        pageCount: 3
      },
      {
        id: 'note-02',
        sessionId: 'sess-ended-03',
        title: 'Lecture 08 Notes - Graph Traversals & DAG Topological Order',
        pdfUrl: '/api/smartboard/export/pdf/sess-ended-03',
        pageCount: 5
      }
    ];

    for (const n of notes) {
      await conn.query(`
        INSERT INTO lecture_notes (id, sessionId, title, pdfUrl, pageCount, generatedAt)
        VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
          title = VALUES(title),
          pdfUrl = VALUES(pdfUrl),
          pageCount = VALUES(pageCount);
      `, [n.id, n.sessionId, n.title, n.pdfUrl, n.pageCount]);
    }

    console.log(`✅ Lecture Notes seeded successfully (${notes.length} notes).`);
  } catch (err) {
    console.error('❌ Failed seeding Lecture Notes:', err.message);
    throw err;
  } finally {
    if (shouldRelease) conn.release();
  }
}

// Allow running directly: node src/seeds/lecture_notes.seed.js
if (require.main === module) {
  seedLectureNotes()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedLectureNotes;
