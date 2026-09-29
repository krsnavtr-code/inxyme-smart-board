const pool = require('../config/db');

async function seedSessionAttendances(connection = null) {
  const conn = connection || (await pool.getConnection());
  const shouldRelease = !connection;

  try {
    console.log('⏱️ [6/9] Seeding Session Attendances table...');

    const attendances = [
      { id: 'att-01', sessionId: 'sess-live-01', userId: 'stud-101', durationMins: 25, status: 'PRESENT' },
      { id: 'att-02', sessionId: 'sess-live-01', userId: 'stud-102', durationMins: 20, status: 'PRESENT' },
      { id: 'att-03', sessionId: 'sess-live-01', userId: 'stud-103', durationMins: 12, status: 'LATE' },
      { id: 'att-04', sessionId: 'sess-ended-03', userId: 'stud-101', durationMins: 60, status: 'PRESENT' },
      { id: 'att-05', sessionId: 'sess-ended-03', userId: 'stud-102', durationMins: 58, status: 'PRESENT' }
    ];

    for (const a of attendances) {
      await conn.query(`
        INSERT INTO session_attendances (id, sessionId, userId, durationMins, status, joinedAt)
        VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
          durationMins = VALUES(durationMins),
          status = VALUES(status);
      `, [a.id, a.sessionId, a.userId, a.durationMins, a.status]);
    }

    console.log(`✅ Session Attendances seeded successfully (${attendances.length} records).`);
  } catch (err) {
    console.error('❌ Failed seeding Session Attendances:', err.message);
    throw err;
  } finally {
    if (shouldRelease) conn.release();
  }
}

// Allow running directly: node src/seeds/session_attendances.seed.js
if (require.main === module) {
  seedSessionAttendances()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedSessionAttendances;
