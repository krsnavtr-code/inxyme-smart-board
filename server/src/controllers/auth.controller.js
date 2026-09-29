const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { memoryStore, prisma } = require('../config/prisma');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_lms_jwt_key_2026';

function normalizeRole(role) {
  if (!role) return 'STUDENT';
  const upper = String(role).toUpperCase();
  if (upper === 'TEACHER' || upper === 'FACULTY' || upper === 'PROFESSOR' || upper === 'INSTRUCTOR') {
    return 'INSTRUCTOR';
  }
  return 'STUDENT';
}

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const targetRole = normalizeRole(role);

    let user = null;

    // 1. Try finding in DB if pool is available
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [cleanEmail]);
      if (rows && rows.length > 0) {
        const dbUser = rows[0];
        // If password supplied and hash exists, verify password
        if (password && dbUser.passwordHash && !dbUser.passwordHash.startsWith('$2a$10$demoHash')) {
          const match = await bcrypt.compare(password, dbUser.passwordHash);
          if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials. Password does not match.' });
          }
        }
        user = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          avatar: dbUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          headline: dbUser.headline || (dbUser.role === 'INSTRUCTOR' ? 'Lead Faculty' : 'Enrolled Student')
        };
      }
    } catch (dbErr) {
      // DB connection failed or table not found; will fallback to memoryStore
    }

    // 2. Try memoryStore
    if (!user) {
      user = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    // 3. If still not found, create new on-the-fly user (resilient demo/test mode)
    if (!user) {
      let inferredRole = 'STUDENT';
      if (
        cleanEmail.includes('faculty') ||
        cleanEmail.includes('instructor') ||
        cleanEmail.includes('teacher') ||
        cleanEmail.includes('prof') ||
        cleanEmail.includes('ramesh') ||
        cleanEmail.includes('priya') ||
        (role && normalizeRole(role) === 'INSTRUCTOR')
      ) {
        inferredRole = 'INSTRUCTOR';
      }

      const defaultName = cleanEmail.split('@')[0].replace(/[\._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      user = {
        id: (inferredRole === 'INSTRUCTOR' ? 'inst-' : 'stud-') + Date.now(),
        name: defaultName || (inferredRole === 'INSTRUCTOR' ? 'Faculty Instructor' : 'Student Learner'),
        email: cleanEmail,
        role: inferredRole,
        avatar: inferredRole === 'INSTRUCTOR'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        headline: inferredRole === 'INSTRUCTOR' ? 'Senior Faculty Member' : 'Enrolled Student'
      };
      memoryStore.users.push(user);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, headline } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = normalizeRole(role);
    const id = (cleanRole === 'INSTRUCTOR' ? 'inst-' : 'stud-') + Date.now();
    const defaultAvatar = cleanRole === 'INSTRUCTOR'
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
      : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150';
    const finalHeadline = headline || (cleanRole === 'INSTRUCTOR' ? 'Professor & Subject Expert' : 'Batch 2026 Student');

    let passwordHash = '$2a$10$demoHashForUser12345678';
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    let newUser = {
      id,
      name: name.trim(),
      email: cleanEmail,
      role: cleanRole,
      avatar: defaultAvatar,
      headline: finalHeadline
    };

    // Try saving to DB
    try {
      await pool.query(
        `INSERT INTO users (id, email, passwordHash, name, role, avatar, headline, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), headline = VALUES(headline)`,
        [id, cleanEmail, passwordHash, newUser.name, cleanRole, defaultAvatar, finalHeadline]
      );
    } catch (dbErr) {
      // Memory fallback
    }

    // Save to memory store
    const existingIdx = memoryStore.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (existingIdx >= 0) {
      memoryStore.users[existingIdx] = newUser;
    } else {
      memoryStore.users.push(newUser);
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration' });
  }
};

exports.getCurrentUser = async (req, res) => {
  res.json({
    success: true,
    user: req.user || memoryStore.users[0]
  });
};

exports.getDemoAccounts = async (req, res) => {
  res.json({
    success: true,
    instructors: [
      {
        name: 'Prof. Ramesh Sharma',
        email: 'ramesh.sharma@inxyme.com',
        role: 'INSTRUCTOR',
        headline: 'Lead Faculty & LMS Architect',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      },
      {
        name: 'Dr. Priya Nair',
        email: 'priya.nair@inxyme.com',
        role: 'INSTRUCTOR',
        headline: 'Professor of Mathematics & Calculus',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
      }
    ],
    students: [
      {
        name: 'Aarav Patel',
        email: 'aarav.patel@student.inxyme.com',
        role: 'STUDENT',
        headline: 'B.Tech CS - Year 3',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
      },
      {
        name: 'Diya Deshmukh',
        email: 'diya.deshmukh@student.inxyme.com',
        role: 'STUDENT',
        headline: 'B.Tech CS - Section A',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
      }
    ]
  });
};
