const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['main', 'service'], 
    default: 'main' 
  },
  role: { 
    type: String, 
    enum: ['driver', 'mechanic', 'towing', 'rto', 'legal', 'none'],
    default: 'none'
  },
  title: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
