const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const prisma = require('../prismaClient');

// Register Handle
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword
      }
    });

    // Log the user in after registration
    req.login(newUser, (err) => {
      if (err) throw err;
      res.json({ message: 'Registered and logged in successfully', user: { id: newUser.id, email: newUser.email } });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!user) return res.status(400).json({ message: info.message || 'Login failed' });
    
    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      return res.json({ message: 'Logged in successfully', user: { id: user.id, email: user.email } });
    });
  })(req, res, next);
});

// Logout Handle
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Check Current User Handle
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: { id: req.user.id, email: req.user.email } });
  } else {
    res.json({ isAuthenticated: false, user: null });
  }
});

module.exports = router;
