const pool = require('../config/db');

async function seedUsers(connection = null) {
  const conn = connection || (await pool.getConnection());
  const shouldRelease = !connection;

  try {
    console.log('👤 [1/9] Seeding Users table...');

    const users = [
      {
        id: 'inst-001',
        email: 'ramesh.sharma@inxyme.com',
        passwordHash: '$2a$10$demoHashForInstructor12345678',
        name: 'Prof. Ramesh Sharma',
        role: 'INSTRUCTOR',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        headline: 'Lead Faculty & Real-Time Classroom Architect'
      },
      {
        id: 'inst-002',
        email: 'priya.nair@inxyme.com',
        passwordHash: '$2a$10$demoHashForInstructor12345678',
        name: 'Dr. Priya Nair',
        role: 'INSTRUCTOR',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        headline: 'Professor of Mathematics & Calculus'
      },
      {
        id: 'stud-101',
        email: 'aarav.patel@student.inxyme.com',
        passwordHash: '$2a$10$demoHashForStudent12345678',
        name: 'Aarav Patel',
        role: 'STUDENT',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        headline: 'B.Tech CS - Year 3 (Section A)'
      },
      {
        id: 'stud-102',
        email: 'diya.deshmukh@student.inxyme.com',
        passwordHash: '$2a$10$demoHashForStudent12345678',
        name: 'Diya Deshmukh',
        role: 'STUDENT',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        headline: 'B.Tech CS - Year 3 (Section A)'
      },
      {
        id: 'stud-103',
        email: 'vikram.singh@student.inxyme.com',
        passwordHash: '$2a$10$demoHashForStudent12345678',
        name: 'Vikram Singhania',
        role: 'STUDENT',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        headline: 'B.Tech CS - Year 3 (Section B)'
      },
      {
        id: 'admin-001',
        email: 'admin@inxyme.com',
        passwordHash: '$2a$10$demoHashForAdmin12345678',
        name: 'Inxyme LMS Super Admin',
        role: 'ADMIN',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        headline: 'System Administrator'
      }
    ];

    for (const u of users) {
      await conn.query(`
        INSERT INTO users (id, email, passwordHash, name, role, avatar, headline, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          role = VALUES(role),
          avatar = VALUES(avatar),
          headline = VALUES(headline),
          updatedAt = NOW();
      `, [u.id, u.email, u.passwordHash, u.name, u.role, u.avatar, u.headline]);
    }

    console.log(`✅ Users seeded successfully (${users.length} users).`);
  } catch (err) {
    console.error('❌ Failed seeding Users:', err.message);
    throw err;
  } finally {
    if (shouldRelease) conn.release();
  }
}

// Allow running directly: node src/seeds/users.seed.js
if (require.main === module) {
  seedUsers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedUsers;
