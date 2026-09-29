const pool = require('../config/db');

async function seedHandRaises(connection = null) {
  const conn = connection || (await pool.getConnection());
  const shouldRelease = !connection;

  try {
    console.log('✋ [8/9] Seeding Hand Raises table...');

    const handRaises = [
      { id: 'hr-01', sessionId: 'sess-live-01', userId: 'stud-101', status: 'PENDING' },
      { id: 'hr-02', sessionId: 'sess-live-01', userId: 'stud-103', status: 'ACCEPTED' }
    ];

    for (const h of handRaises) {
      await conn.query(`
        INSERT INTO hand_raises (id, sessionId, userId, status, raisedAt)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
          status = VALUES(status);
      `, [h.id, h.sessionId, h.userId, h.status]);
    }

    console.log(`✅ Hand Raises seeded successfully (${handRaises.length} hand raises).`);
  } catch (err) {
    console.error('❌ Failed seeding Hand Raises:', err.message);
    throw err;
  } finally {
    if (shouldRelease) conn.release();
  }
}

// Allow running directly: node src/seeds/hand_raises.seed.js
if (require.main === module) {
  seedHandRaises()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedHandRaises;
