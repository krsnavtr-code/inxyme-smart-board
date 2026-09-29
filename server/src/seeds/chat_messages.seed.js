const pool = require('../config/db');

async function seedChatMessages(connection = null) {
  const conn = connection || (await pool.getConnection());
  const shouldRelease = !connection;

  try {
    console.log('💬 [7/9] Seeding Chat Messages & Doubts table...');

    const messages = [
      {
        id: 'msg-01',
        sessionId: 'sess-live-01',
        userId: 'inst-001',
        message: 'Welcome everyone! Today we demonstrate synchronous canvas vectors across 100 concurrent nodes.',
        isDoubt: 0,
        isResolved: 0
      },
      {
        id: 'msg-02',
        sessionId: 'sess-live-01',
        userId: 'stud-101',
        message: 'Sir, what is the broadcast latency when 100 students receive a stroke update?',
        isDoubt: 1,
        isResolved: 1
      },
      {
        id: 'msg-03',
        sessionId: 'sess-live-01',
        userId: 'inst-001',
        message: 'Our WebSocket delta packets are under 1KB, maintaining ~24ms sync latency even at full room capacity.',
        isDoubt: 0,
        isResolved: 0
      },
      {
        id: 'msg-04',
        sessionId: 'sess-live-01',
        userId: 'stud-102',
        message: 'Will the whiteboard derivations be automatically exported as downloadable PDF notes after class?',
        isDoubt: 1,
        isResolved: 0
      }
    ];

    for (const m of messages) {
      await conn.query(`
        INSERT INTO chat_messages (id, sessionId, userId, message, isDoubt, isResolved, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
          message = VALUES(message),
          isResolved = VALUES(isResolved);
      `, [m.id, m.sessionId, m.userId, m.message, m.isDoubt, m.isResolved]);
    }

    console.log(`✅ Chat Messages seeded successfully (${messages.length} messages).`);
  } catch (err) {
    console.error('❌ Failed seeding Chat Messages:', err.message);
    throw err;
  } finally {
    if (shouldRelease) conn.release();
  }
}

// Allow running directly: node src/seeds/chat_messages.seed.js
if (require.main === module) {
  seedChatMessages()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedChatMessages;
