const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

const app = express(); 

// 1. CORS FIRST
app.use(cors({
  origin: true,
  credentials: true
}));

// 2. OTHER MIDDLEWARES
app.use(express.json());
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
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
const serviceRoutes = require('./routes/serviceRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const contactRoutes = require('./routes/contactRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const pageRoutes = require('./routes/pageRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pages', pageRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
