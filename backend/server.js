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
  origin: [
    'http://localhost:5173', 
    'http://localhost:8081', 
    'exp://localhost:8081', 
    'http://10.0.2.2:8081',
    'https://frontappathon.pranavshende.online'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Passport Middleware
app.use(passport.initialize());

// Routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/requests', employeeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// Basic health check route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to TruliaCare API' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
    // Start Escalation Background Job
    const { startEscalationJob } = require('./escalationJob');
    startEscalationJob();
});
