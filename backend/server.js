const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const prisma = require('./prismaClient');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Passport Config
require('./config/passport')(passport);

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8081', 'exp://localhost:8081', 'http://10.0.2.2:8081'], // Typical Expo/Web ports
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Passport Middleware
app.use(passport.initialize());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Basic health check route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to TruliaCare API' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
