// controllers/userController.js
const User = require("../models/User");

// GET /api/users/me
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("getUser:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    const filtered = users.filter((u) => u._id.toString() !== req.user._id);
    res.json(filtered);
  } catch (err) {
    console.error("getAllUsers:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// POST /api/users/avatar  (multipart form — field: "avatar")
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
    // req.file.path is the Cloudinary URL set by multer-storage-cloudinary
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true }
    ).select("-password");
    res.json({ avatar: user.avatar, user });
  } catch (err) {
    console.error("uploadAvatar:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};