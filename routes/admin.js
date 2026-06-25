// routes/admin.js
const express = require("express");
const router = express.Router();
const { adminLogin, createAdmin } = require("../controllers/adminController");

// ONE-TIME ADMIN CREATION ROUTE (POST version with dynamic email/password)
router.post("/setup", async (req, res) => {
  try {
    const Admin = require("../models/Admin");
    const bcrypt = require("bcrypt");

    const { email, password } = req.body; // read from frontend

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Check if an admin already exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin
    const admin = await Admin.create({ email, password: hashedPassword });

    res.status(201).json({
      message: "One-time admin created successfully",
      admin: { id: admin._id, email: admin.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Admin Login
// ====================
router.post("/login", async (req, res) => {
  // Pass the request to adminController
  await adminLogin(req, res);
});

// ====================
// Create Admin (Optional / Use Carefully)
// ====================
router.post("/create", async (req, res) => {
  // Pass the request to adminController
  await createAdmin(req, res);
});

module.exports = router;
