const pool = require('../config/db');
const { memoryStore } = require('../config/prisma');

exports.getAllCourses = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id, c.title, c.code, c.description, c.thumbnail, c.category, c.instructorId,
        u.name AS instructorName,
        98 AS enrolledCount
      FROM courses c
      LEFT JOIN users u ON c.instructorId = u.id
      ORDER BY c.createdAt DESC;
    `);

    if (rows && rows.length > 0) {
      return res.json({ success: true, courses: rows });
    }

    res.json({
      success: true,
      courses: memoryStore.courses
    });
  } catch (error) {
    console.warn('MySQL courses query note:', error.message);
    res.json({ success: true, courses: memoryStore.courses });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT c.*, u.name AS instructorName
      FROM courses c
      LEFT JOIN users u ON c.instructorId = u.id
      WHERE c.id = ?
      LIMIT 1;
    `, [id]);

    if (rows && rows.length > 0) {
      return res.json({ success: true, course: rows[0] });
    }

    const course = memoryStore.courses.find((c) => c.id === id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
