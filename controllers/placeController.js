import Place from "../models/Place.js";

// Get all places or filter by city (case-insensitive)
export const getPlaces = async (req, res) => {
  try {
    const { city } = req.query; // e.g., ?city=Lucknow
    let query = {};

    if (city) {
      // Case-insensitive, trim spaces
      query.city = { $regex: `^${city.trim()}$`, $options: "i" };
    }

    const places = await Place.find(query);
    res.json(places);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single place by id
export const getPlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: "Place not found" });
    res.json(place);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new place (admin only)
export const createPlace = async (req, res) => {
  const { city, name, description } = req.body;
  const image = req.file ? req.file.filename : ""; // store filename only
  try {
    const place = await Place.create({
      city: city.trim().toLowerCase(), // normalize city
      name,
      description,
      image,
    });
    res.status(201).json(place);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update place (admin only)
export const updatePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: "Place not found" });

    if (req.body.city) place.city = req.body.city.trim().toLowerCase(); // normalize city
    place.name = req.body.name || place.name;
    place.description = req.body.description || place.description;
    if (req.file) place.image = req.file.filename;

    await place.save();
    res.json(place);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete place (admin only)
export const deletePlace = async (req, res) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);
    if (!place) return res.status(404).json({ message: "Place not found" });
    res.json({ message: "Place deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
