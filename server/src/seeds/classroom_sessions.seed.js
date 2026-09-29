const pool = require('../config/db');

async function seedClassroomSessions(connection = null) {
  const conn = connection || (await pool.getConnection());
  const shouldRelease = !connection;

  try {
    console.log('🏫 [4/9] Seeding Classroom Sessions table...');

    const sessions = [
      {
        id: 'sess-live-01',
        roomCode: 'INX-LIVE-401',
        title: 'Live Derivation: Low Latency Canvas Sync (100 Students Batch)',
        description: 'Interactive lecture with synchronous smart board demonstrations, live doubt clearing, and real-time attendance.',
        courseId: 'course-101',
        instructorId: 'inst-001',
        status: 'LIVE',
        scheduledStart: new Date(Date.now() - 25 * 60 * 1000), // Started 25 mins ago
        maxCapacity: 150,
        activePage: 1,
        backgroundStyle: 'GRID',
        isStudentDrawingLocked: 1
      },
      {
        id: 'sess-sched-02',
        roomCode: 'INX-MATH-302',
        title: 'Vector Calculus: Line Integrals & Surface Parametrization',
        description: 'Derivations on engineering grid smartboard with student doubt resolution.',
        courseId: 'course-102',
        instructorId: 'inst-002',
        status: 'SCHEDULED',
        scheduledStart: new Date(Date.now() + 2 * 60 * 60 * 1000), // Starts in 2 hours
        maxCapacity: 150,
        activePage: 1,
        backgroundStyle: 'RULED',
        isStudentDrawingLocked: 1
      },
      {
        id: 'sess-ended-03',
        roomCode: 'INX-ALG-201',
        title: 'Graph Theory & Topological Sorting on Blackboard',
        description: 'Complete trace of DAGs and cycle detection with auto-compiled PDF notes.',
        courseId: 'course-103',
        instructorId: 'inst-001',
        status: 'ENDED',
        scheduledStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
        maxCapacity: 150,
        activePage: 3,
        backgroundStyle: 'BLACKBOARD',
        isStudentDrawingLocked: 1
      }
    ];

    for (const s of sessions) {
      await conn.query(`
        INSERT INTO classroom_sessions 
        (id, roomCode, title, description, courseId, instructorId, status, scheduledStart, maxCapacity, activePage, backgroundStyle, isStudentDrawingLocked, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
          title = VALUES(title),
          description = VALUES(description),
          status = VALUES(status),
          scheduledStart = VALUES(scheduledStart),
          maxCapacity = VALUES(maxCapacity),
          activePage = VALUES(activePage),
          backgroundStyle = VALUES(backgroundStyle),
          isStudentDrawingLocked = VALUES(isStudentDrawingLocked),
          updatedAt = NOW();
      `, [
        s.id,
        s.roomCode,
        s.title,
        s.description,
        s.courseId,
        s.instructorId,
        s.status,
        s.scheduledStart,
        s.maxCapacity,
        s.activePage,
        s.backgroundStyle,
        s.isStudentDrawingLocked
      ]);
    }

    console.log(`✅ Classroom Sessions seeded successfully (${sessions.length} sessions).`);
  } catch (err) {
    console.error('❌ Failed seeding Classroom Sessions:', err.message);
    throw err;
  } finally {
    if (shouldRelease) conn.release();
  }
}

// Allow running directly: node src/seeds/classroom_sessions.seed.js
if (require.main === module) {
  seedClassroomSessions()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedClassroomSessions;
