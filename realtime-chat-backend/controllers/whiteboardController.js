// controllers/whiteboardController.js
const WhiteboardState = require("../models/WhiteboardState");

exports.getWhiteboard = async (req, res) => {
  const { boardId } = req.params;
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
  try {
    const doc = await WhiteboardState.findOneAndUpdate(
      { boardId },
      { imageData, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    return res.json({ ok: true, boardId });
  } catch (err) {
    console.error("saveWhiteboard error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.deleteWhiteboard = async (req, res) => {
  const { boardId } = req.params;
  try {
    await WhiteboardState.findOneAndDelete({ boardId });
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteWhiteboard error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};
