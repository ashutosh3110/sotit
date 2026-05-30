const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  target: {
    type: String,
    enum: ['customer', 'vendor'],
    default: 'customer'
  }
}, { timestamps: true });

module.exports = mongoose.model('Page', pageSchema);
