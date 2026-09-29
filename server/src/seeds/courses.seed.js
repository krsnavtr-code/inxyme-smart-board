const pool = require('../config/db');

async function seedCourses(connection = null) {
  const conn = connection || (await pool.getConnection());
  const shouldRelease = !connection;

  try {
    console.log('📚 [2/9] Seeding Courses table...');

    const courses = [
      {
        id: 'course-101',
        title: 'Advanced Computer Networks & Real-Time Distributed Systems',
        code: 'CS-401',
        description: 'Covers WebSocket protocol streaming, delta canvas compression, room multiplexing, and building scalable live e-learning platforms for 100+ concurrent users.',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
        category: 'Computer Science',
        instructorId: 'inst-001'
      },
      {
        id: 'course-102',
        title: 'Engineering Mathematics: Multivariable Calculus & Vector Analysis',
        code: 'MATH-302',
        description: 'Step-by-step 3D vector fields, line integrals, Stokes Theorem, and coordinate transforms derived interactively on digital whiteboard grids.',
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
        category: 'Mathematics',
        instructorId: 'inst-002'
      },
      {
        id: 'course-103',
        title: 'Data Structures & Algorithmic Problem Solving',
        code: 'CS-201',
        description: 'Binary trees, graph traversals, dynamic programming, and visual trace diagrams on live interactive blackboard.',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
        category: 'Computer Science',
        instructorId: 'inst-001'
      }
    ];

    for (const c of courses) {
      await conn.query(`
        INSERT INTO courses (id, title, code, description, thumbnail, category, instructorId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
          title = VALUES(title),
          description = VALUES(description),
          thumbnail = VALUES(thumbnail),
          category = VALUES(category),
          instructorId = VALUES(instructorId),
          updatedAt = NOW();
      `, [c.id, c.title, c.code, c.description, c.thumbnail, c.category, c.instructorId]);
    }

    console.log(`✅ Courses seeded successfully (${courses.length} courses).`);
  } catch (err) {
    console.error('❌ Failed seeding Courses:', err.message);
    throw err;
  } finally {
    if (shouldRelease) conn.release();
  }
}

// Allow running directly: node src/seeds/courses.seed.js
if (require.main === module) {
  seedCourses()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedCourses;
