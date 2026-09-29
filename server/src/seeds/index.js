const pool = require('../config/db');

const seedUsers = require('./users.seed');
const seedCourses = require('./courses.seed');
const seedEnrollments = require('./enrollments.seed');
const seedClassroomSessions = require('./classroom_sessions.seed');
const seedWhiteboardPages = require('./whiteboard_pages.seed');
const seedSessionAttendances = require('./session_attendances.seed');
const seedChatMessages = require('./chat_messages.seed');
const seedHandRaises = require('./hand_raises.seed');
const seedLectureNotes = require('./lecture_notes.seed');

async function runAllSeeds() {
  console.log('===============================================================');
  console.log('🌱 [INXYME LMS] STARTING MODULAR DATABASE SEEDING SEQUENCE');
  console.log('===============================================================');

  const startTime = Date.now();
  const conn = await pool.getConnection();

  try {
    // Run sequentially to strictly respect MySQL Foreign Key constraints
    await seedUsers(conn);
    await seedCourses(conn);
    await seedEnrollments(conn);
    await seedClassroomSessions(conn);
    await seedWhiteboardPages(conn);
    await seedSessionAttendances(conn);
    await seedChatMessages(conn);
    await seedHandRaises(conn);
    await seedLectureNotes(conn);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('===============================================================');
    console.log(`✨ ALL 9 LMS TABLES SEEDED SUCCESSFULLY IN ${elapsed}s!`);
    console.log('===============================================================');
  } catch (error) {
    console.error('❌ Database seeding halted due to error:', error.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

if (require.main === module) {
  runAllSeeds();
}

module.exports = runAllSeeds;
