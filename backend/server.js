const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const prisma = require('./prismaClient');
const supabase = require('./services/supabase');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

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

// Attach socket.io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/requests', employeeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// Basic health check route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to resolveX API' });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
    // Start Escalation Background Job
    const { startEscalationJob } = require('./escalationJob');
    startEscalationJob();

    // Ensure photos bucket exists and is public
    (async () => {
      try {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (!listError) {
          const bucketExists = buckets.find(b => b.name === 'photos');
          if (!bucketExists) {
            await supabase.storage.createBucket('photos', { public: true });
            console.log('Created public "photos" bucket in Supabase');
          } else {
            // Update to public just in case
            await supabase.storage.updateBucket('photos', { public: true });
          }
        }
      } catch (err) {
        console.error('Failed to initialize Supabase buckets:', err);
      }
    })();
});
