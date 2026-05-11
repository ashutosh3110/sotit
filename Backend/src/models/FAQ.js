const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please add a question'],
  },
  answer: {
    type: String,
    required: [true, 'Please add an answer'],
  },
  type: {
    type: String,
    enum: ['customer', 'vendor'],
    default: 'customer',
  },
  role: {
    type: String,
    default: 'all', // 'all', 'driver', 'mechanic', etc.
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('FAQ', faqSchema);
