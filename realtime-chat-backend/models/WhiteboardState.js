// models/WhiteboardState.js
const mongoose = require("mongoose");

const WhiteboardStateSchema = new mongoose.Schema({
  boardId: { type: String, required: true, unique: true },
  imageData: { type: String },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: "whiteboardstates"
});

// NOTE: no TTL here — board persists until explicit delete.
module.exports = mongoose.model("WhiteboardState", WhiteboardStateSchema);
