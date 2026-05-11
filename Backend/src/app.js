const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

const app = express(); // Backend server refresh for FAQ/Tickets

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Sootit API' });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const faqRoutes = require('./routes/faqRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const walletRoutes = require('./routes/walletRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/wallet', walletRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
