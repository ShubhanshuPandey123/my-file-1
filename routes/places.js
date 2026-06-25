const express = require("express");
const router = express.Router();
const Place = require("../models/Place");
const Admin = require("../models/Admin"); // added for DB verification
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// --------------------
// Multer setup for image uploads
// --------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// --------------------
// GET places by city (public)
// --------------------
router.get("/", async (req, res) => {
  const city = req.query.city; // from ?city=kanpur

  try {
    const query = {};
    if (city) {
      query.city = { $regex: `^${city.trim()}$`, $options: "i" }; // case-insensitive match
    }

    const places = await Place.find(query);
    return res.json(places);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// --------------------
// Middleware: verify admin JWT
// --------------------
const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    const adminExists = await Admin.findById(decoded.id);
    if (!adminExists) return res.status(403).json({ message: "Forbidden" });

    req.admin = adminExists;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Token invalid" });
  }
};

// --------------------
// ADD place (admin only)
// --------------------
router.post("/admin/places", verifyAdmin, upload.single("image"), async (req, res) => {
  const { name, city, description } = req.body;

  if (!name || !city) return res.status(400).json({ message: "Name and City are required" });

  try {
    // Store only filename for consistency with frontend
    const image = req.file ? req.file.filename : null;

    const newPlace = await Place.create({ name, city, description, image });
    return res.status(201).json({ message: "Place added successfully", place: newPlace });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// --------------------
// DELETE place (admin only)
// --------------------
router.delete("/admin/places/:id", verifyAdmin, async (req, res) => {
  try {
    const deleted = await Place.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Place not found" });

    return res.json({ message: "Place deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// --------------------
// GET all unique cities (admin only)
// --------------------
router.get("/admin/cities", verifyAdmin, async (req, res) => {
  try {
    const places = await Place.find({}, "city"); // fetch only city field
    const cities = [...new Set(places.map(p => p.city))]; // get unique cities
    return res.json(cities);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
