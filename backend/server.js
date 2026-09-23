const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const path = require('path');
const { connectDB, getDBStatus } = require('./config/db');

// Load environment variables
dotenv.config();

// Sanitize CLOUDINARY_URL if user inadvertently pasted "CLOUDINARY_URL=" twice
if (process.env.CLOUDINARY_URL) {
  process.env.CLOUDINARY_URL = process.env.CLOUDINARY_URL.replace(/^CLOUDINARY_URL=/, '').trim();
}

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.set('io', io);

// Attach io to every incoming request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to Database (with automatic graceful fallback)
connectDB();

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Founders Workspace Backend API',
    brands: 'Weblets® × StackAdda™',
    version: '2.0.0',
    db: getDBStatus(),
    timestamp: new Date().toISOString()
  });
});

// Mount Routes (Supports both /api/* and direct /* paths for maximum resilience)
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const clientRoutes = require('./routes/clientRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const activityRoutes = require('./routes/activityRoutes');

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/tasks', taskRoutes);
app.use('/tasks', taskRoutes);

app.use('/api/clients', clientRoutes);
app.use('/clients', clientRoutes);

app.use('/api/meetings', meetingRoutes);
app.use('/meetings', meetingRoutes);

app.use('/api/chat', chatRoutes);
app.use('/chat', chatRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/upload', uploadRoutes);
app.use('/upload', uploadRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);

app.use('/api/activity', activityRoutes);
app.use('/activity', activityRoutes);

// Socket.io Real-time Handlers
io.on('connection', (socket) => {
  console.log(`⚡ Client connected via WebSocket: ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('user_typing', data);
  });

  socket.on('stop_typing', (data) => {
    socket.broadcast.emit('user_stop_typing', data);
  });

  socket.on('disconnect', () => {
    // client disconnected
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server with Graceful Port Handling
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️  Port ${PORT} is temporarily in use. Please wait 2 seconds or terminate the process using port ${PORT}.`);
    process.exit(1);
  } else {
    console.error('Server execution error:', err);
  }
});

// Graceful process shutdown for nodemon & OS signals
const gracefulShutdown = () => {
  server.close(() => {
    console.log('🛑 Server gracefully closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Founders Workspace Server Running on Port ${PORT}`);
  console.log(`🌐 API Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`👥 Operating for: Weblets® × StackAdda™ Founders`);
  console.log(`====================================================`);
});
