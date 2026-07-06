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
    enum: ['driver', 'mechanic', 'towing', 'rto', 'legal', 'owner'] 
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
    languages: [String],
    serviceStates: [{
      name: String,
      isoCode: String,
      districts: [String]
    }]
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

  ownerDetails: {
    ownerType: String,           // 'Car Owner', 'Truck Owner', 'Bus Owner', 'Tempo Owner', 'Other'
    vehicleTypes: [String],      // e.g. ['Car', 'SUV']
    fleetSize: String,           // '1', '2-5', '6-10', '10+'
    rcNumber: String,            // Vehicle Registration Number
    availableFor: [String],      // e.g. ['Self Drive', 'With Driver', 'Towing', 'Goods Transport']
    operatingCity: String,
    vehicleType: String,         // Added for Driver Owner requirements
    jobType: String,             // Added for Driver Owner requirements (Permanent / Part Time)
    language: String,            // Added for Driver Owner requirements
    state: String,               // Added for Driver Owner requirements
    district: String,            // Added for Driver Owner requirements
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
  isOnline: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  otp: String,
  otpExpire: Date,
  remark: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password
vendorSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

vendorSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Vendor', vendorSchema);
