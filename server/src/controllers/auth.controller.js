const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { memoryStore, prisma } = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_lms_jwt_key_2026';

exports.login = async (req, res) => {
  try {
    const { email, role } = req.body;

    // Fast login / demo auth
    let user = memoryStore.users.find((u) => u.email === email);
    if (!user) {
      user = {
        id: 'user-' + Date.now(),
        name: email ? email.split('@')[0].replace('.', ' ').toUpperCase() : 'Student Demo',
        email: email || 'student@inxyme.com',
        role: role || 'STUDENT',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        headline: role === 'INSTRUCTOR' ? 'Senior Faculty Member' : 'Enrolled Student'
      };
      memoryStore.users.push(user);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getCurrentUser = async (req, res) => {
  res.json({
    success: true,
    user: req.user || memoryStore.users[0]
  });
};
