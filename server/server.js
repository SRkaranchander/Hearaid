require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');

const allowedOrigins = process.env.CLIENT_ORIGIN 
  ? process.env.CLIENT_ORIGIN.split(',').map(origin => origin.trim()) 
  : ["http://localhost:3000"];

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in deployment if origin differs slightly
    }
  },
  credentials: true
}));
app.use(express.json());

const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const voiceRoutes = require('./routes/voice');

// Base API route
app.get(['/api', '/'], (req, res) => {
  res.json({ status: 'ok', message: 'HearAid API is running' });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/users', userRoutes);

app.use('/api/messages', messageRoutes);
app.use('/messages', messageRoutes);

app.use('/api/voice', voiceRoutes);
app.use('/voice', voiceRoutes);

const User = require('./models/User');

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('New client connected');
  let joinedUserId = null;

  socket.on('join', (userId) => {
    joinedUserId = userId;
    socket.join(userId);
    User.findByIdAndUpdate(userId, { status: 'online' }).catch(() => {});
  });

  socket.on('sendMessage', (message) => {
    io.to(message.receiverId).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    if (joinedUserId) {
      User.findByIdAndUpdate(joinedUserId, { status: 'offline' }).catch(() => {});
    }
  });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
module.exports.server = server;
module.exports.io = io;
