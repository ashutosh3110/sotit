const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String },
  role: { 
    type: String, 
    required: true, 
    enum: ['driver', 'mechanic', 'towing', 'rto', 'legal'] 
  },
  profileImage: {
    public_id: String,
    url: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  liveLocation: {
    lat: Number,
    lng: Number
  },
  
  // Role Specific Details
  professionalDetails: {
    dlNumber: String,
    dlExpiry: Date,
    vehicleClasses: [String],
    experience: String,
    bgCheck: { type: Boolean, default: false },
    availability: String,
    languages: [String]
  },

  mechanicDetails: {
    specialties: [String],
    garageName: String,
    garageLocation: { lat: Number, lng: Number },
    vehicleExpertise: [String],
    experienceRange: String,
    workingHours: String,
    serviceRadius: String,
    emergencySupport: { type: Boolean, default: false }
  },

  rtoDetails: {
    rtoOffice: String,
    services: [String],
    officeAddress: String,
    officeLocation: { lat: Number, lng: Number }
  },

  legalDetails: {
    barRegNumber: String,
    practiceAreas: [String],
    experience: String,
    officeName: String,
    visitingAddress: String,
    city: String,
    gpsLocation: { lat: Number, lng: Number },
    consultationType: String
  },

  bankDetails: {
    accountHolderName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String
  },

  kycDocuments: {
    aadhaar: String,
    pan: String,
    selfie: String,
    policeVerification: String,
    dlFile: String,
    garagePhoto: String,
    shopLicense: String,
    barCertificate: String,
    advocateId: String
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  fcmToken: {
    type: String,
    default: null
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  otp: String,
  otpExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password
vendorSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

vendorSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Vendor', vendorSchema);
