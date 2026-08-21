const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register Handle
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const hashedPassword = await argon2.hash(password);
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword
      }
    });

    const token = generateToken(newUser);
    const { password: _, ...userWithoutPassword } = newUser;

    res.json({
      success: true,
      message: 'Registered successfully',
      user: userWithoutPassword,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error', error: err.message || err.toString() });
    if (!user) return res.status(401).json({ success: false, message: info?.message || 'Invalid credentials' });
    
    const token = generateToken(user);
    
    return res.json({
      success: true,
      message: 'Logged in successfully',
      user,
      token
    });
  })(req, res, next);
});

// Logout Handle (Stateless)
router.post('/logout', (req, res) => {
  // In a stateless JWT architecture, the client removes the token.
  res.json({ success: true, message: 'Logged out successfully' });
});

// Check Current User Handle
router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (req.user) {
    res.json({ success: true, isAuthenticated: true, user: req.user });
  } else {
    res.status(401).json({ success: false, isAuthenticated: false, user: null });
  }
});

module.exports = router;
