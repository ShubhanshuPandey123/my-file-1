const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  city: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String }, // store filename/path
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Place", placeSchema);
