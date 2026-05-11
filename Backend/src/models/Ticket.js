const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    default: ''
  },
  userName: String,
  userEmail: String,
  subject: {
    type: String,
    required: [true, 'Please add a subject']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'Pending', 'Resolved'],
    default: 'Open'
  },
  userType: {
    type: String,
    enum: ['customer', 'vendor'],
    default: 'customer'
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['user', 'admin'],
        required: true
      },
      text: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);
