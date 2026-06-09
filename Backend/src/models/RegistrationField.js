const mongoose = require('mongoose');

const registrationFieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  name: { type: String, required: true }, // camelCase field identifier
  type: { type: String, enum: ['text', 'number', 'select', 'checkbox'], required: true },
  options: [{ type: String }], // options if type is select
  role: { type: String, enum: ['all', 'driver', 'mechanic', 'towing', 'rto', 'legal', 'owner'], default: 'all' },
  required: { type: Boolean, default: false },
  placeholder: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('RegistrationField', registrationFieldSchema);
