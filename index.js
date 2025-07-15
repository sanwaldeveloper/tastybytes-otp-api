const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const OTP = require("./models/otp.model");

const app = express();
app.use(bodyParser.json());

// ✅ MongoDB Connection (SIRF YAHI BLOCK RAKHO)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    console.log("Current DB in use:", mongoose.connection.name); // ← Now shows actual DB
  })
  .catch(err => console.log("MongoDB error:", err));

// ✅ Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
// generate 4 digite code
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}


// ✅ Send OTP API
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otpCode = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otpCode}`
    });

    // ✅ Save OTP in MongoDB
    await OTP.create({
      email,
      otpCode,
      expiresAt
    });

    return res.status(200).send("OTP sent and saved successfully");
  } catch (err) {
    console.error("Send OTP error:", err);
    return res.status(500).send("Failed to send OTP");
  }
});

// ✅ Verify OTP API
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await OTP.findOne({ email, otpCode: otp });

    if (!record) return res.status(400).send("Invalid OTP");

    if (record.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(400).send("OTP expired");
    }

    await OTP.deleteOne({ _id: record._id }); // Optional
    return res.status(200).send("OTP verified successfully");
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).send("Failed to verify OTP");
  }
});

// ✅ Start Server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
