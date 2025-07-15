// models/otp.model.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otpCode: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('OTP', otpSchema);
