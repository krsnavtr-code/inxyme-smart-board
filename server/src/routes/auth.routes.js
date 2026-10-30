const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/demo-accounts', authController.getDemoAccounts);
router.get('/users', authController.getLmsUsers);
router.get('/lms-users', authController.getLmsUsers);
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;
