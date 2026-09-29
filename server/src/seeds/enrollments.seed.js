const pool = require('../config/db');

async function seedEnrollments(connection = null) {
  const conn = connection || (await pool.getConnection());
  const shouldRelease = !connection;

  try {
    console.log('🎓 [3/9] Seeding Enrollments table...');

    const enrollments = [
      { id: 'enr-01', userId: 'stud-101', courseId: 'course-101', progress: 68 },
      { id: 'enr-02', userId: 'stud-101', courseId: 'course-102', progress: 42 },
      { id: 'enr-03', userId: 'stud-102', courseId: 'course-101', progress: 85 },
      { id: 'enr-04', userId: 'stud-102', courseId: 'course-103', progress: 91 },
      { id: 'enr-05', userId: 'stud-103', courseId: 'course-101', progress: 54 },
      { id: 'enr-06', userId: 'stud-103', courseId: 'course-102', progress: 30 }
    ];

    for (const e of enrollments) {
      await conn.query(`
        INSERT INTO enrollments (id, userId, courseId, progress, enrolledAt)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
          progress = VALUES(progress);
      `, [e.id, e.userId, e.courseId, e.progress]);
    }

    console.log(`✅ Enrollments seeded successfully (${enrollments.length} enrollments).`);
  } catch (err) {
    console.error('❌ Failed seeding Enrollments:', err.message);
    throw err;
  } finally {
    if (shouldRelease) conn.release();
  }
}

// Allow running directly: node src/seeds/enrollments.seed.js
if (require.main === module) {
  seedEnrollments()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedEnrollments;
