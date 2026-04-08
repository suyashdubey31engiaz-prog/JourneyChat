// controllers/userController.js
const User   = require("../models/User");
const bcrypt = require("bcryptjs");

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
    const filtered = users.filter(u => u._id.toString() !== req.user._id);
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

// PUT /api/users/profile  — update name and/or bio
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const updates = {};
    if (name?.trim()) updates.name = name.trim();
    if (typeof bio === "string") updates.bio = bio.trim();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: "Profile updated", user });
  } catch (err) {
    console.error("updateProfile:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// PUT /api/users/password  — change password (requires current password)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ msg: "Both current and new password are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ msg: "New password must be at least 6 characters" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const match = await user.matchPassword(currentPassword);
    if (!match) return res.status(400).json({ msg: "Current password is incorrect" });

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error("changePassword:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};