const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'requesterType'
    },
    requesterType: {
        type: String,
        required: true,
        enum: ['User', 'Vendor']
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: false // Optional for broadcast leads
    },
    role: {
        type: String,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'hired', 'completed', 'cancelled', 'rejected'],
        default: 'pending'
    },
    hiredAt: { type: Date },
    ratingRequested: { type: Boolean, default: false },
  customerDeduction: {
    type: Number,
    default: 5
  },
  paymentId: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  vendorDeduction: {
    type: Number,
    default: 5
  },
  isVendorPaid: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
