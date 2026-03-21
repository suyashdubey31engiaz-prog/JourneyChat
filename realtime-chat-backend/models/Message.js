const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  // Create a TTL index on this field. MongoDB will auto-delete documents
  // 86400 seconds (24 hours) after their timestamp.
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 86400, // 24 hours in seconds
  },
});

module.exports = mongoose.model("Message", MessageSchema);