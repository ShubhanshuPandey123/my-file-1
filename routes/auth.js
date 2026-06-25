// routes/auth.js
const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

// ====================
// User Registration
// ====================
router.post("/register", async (req, res) => {
  // Pass the request to authController
  await registerUser(req, res);
});

// ====================
// User Login
// ====================
router.post("/login", async (req, res) => {
  // Pass the request to authController
  await loginUser(req, res);
});

module.exports = router;
