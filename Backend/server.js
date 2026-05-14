require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Create HTTP Server
const server = http.createServer(app);
const initCronJobs = require('./src/utils/cronJobs');

// Start Cron Jobs
initCronJobs();

// Initialize Socket.io with explicit path and CORS
const io = new Server(server, {
  path: '/socket.io/',
  cors: {
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Attach io to app so it can be used in controllers
app.set('io', io);

// Socket logic
io.on('connection', (socket) => {
  console.log('Socket Connected:', socket.id);

  socket.on('join_ticket', (ticketId) => {
    socket.join(ticketId);
    console.log(`Socket ${socket.id} joined ticket: ${ticketId}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.ticketId).emit('receive_message', data);
  });

  // Event for status update
  socket.on('update_status', (data) => {
    // data: { ticketId, status }
    io.to(data.ticketId).emit('status_changed', data);
  });

  socket.on('join_vendor', (vendorId) => {
    socket.join(vendorId);
    console.log(`[SOCKET] Vendor ${socket.id} joined personal room: ${vendorId}`);
  });

  socket.on('join_role', (role) => {
    if (role) {
      const room = `role_${role.toLowerCase()}`;
      socket.join(room);
      console.log(`[SOCKET] Expert ${socket.id} joined role room: ${room}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket Disconnected:', socket.id);
  });
});

// Important: Listen on 'server', not 'app'
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
