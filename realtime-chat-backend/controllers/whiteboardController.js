// controllers/whiteboardController.js
const WhiteboardState = require("../models/WhiteboardState");

exports.getWhiteboard = async (req, res) => {
  const { boardId } = req.params;
  if (!boardId || boardId === "null" || boardId === "undefined")
    return res.status(400).json({ msg: "Invalid boardId" });
  try {
    const doc = await WhiteboardState.findOne({ boardId });
    if (!doc) return res.status(404).json({ msg: "No whiteboard saved" });
    return res.json({ imageData: doc.imageData, updatedAt: doc.updatedAt });
  } catch (err) {
    console.error("getWhiteboard error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.saveWhiteboard = async (req, res) => {
  const { boardId } = req.params;
  const { imageData } = req.body;

  // Guard against null/undefined boardId — this was the root cause of E11000
  // (a stale unique index on conversationId field treated null boardId as a key)
  if (!boardId || boardId === "null" || boardId === "undefined") {
    return res.status(400).json({ msg: "Invalid boardId — cannot save whiteboard" });
  }

  try {
    const doc = await WhiteboardState.findOneAndUpdate(
      { boardId },
      { $set: { imageData, updatedAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.json({ ok: true, boardId });
  } catch (err) {
    // E11000 duplicate key — the stale conversationId_1 index is still in MongoDB.
    // We handle it gracefully: try a plain findOne + save instead of upsert.
    if (err.code === 11000) {
      console.warn("saveWhiteboard: E11000 caught — falling back to find-then-save. Run the index migration script to fix permanently.");
      try {
        let doc = await WhiteboardState.findOne({ boardId });
        if (doc) {
          doc.imageData = imageData;
          doc.updatedAt = new Date();
          await doc.save();
        } else {
          doc = await WhiteboardState.create({ boardId, imageData });
        }
        return res.json({ ok: true, boardId });
      } catch (inner) {
        console.error("saveWhiteboard fallback error:", inner);
        return res.status(500).json({ msg: "Server error saving whiteboard" });
      }
    }
    console.error("saveWhiteboard error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.deleteWhiteboard = async (req, res) => {
  const { boardId } = req.params;
  if (!boardId || boardId === "null" || boardId === "undefined")
    return res.status(400).json({ msg: "Invalid boardId" });
  try {
    await WhiteboardState.findOneAndDelete({ boardId });
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteWhiteboard error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};