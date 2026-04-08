// routes/users.js
const express  = require("express");
const router   = express.Router();
const auth     = require("../middleware/auth");
const {
  getUser,
  getAllUsers,
  uploadAvatar,
  updateProfile,
  changePassword,
} = require("../controllers/userController");
const { avatarUploadMiddleware } = require("../middleware/upload");

// GET  /api/users      — all users except me (for contact list)
router.get("/",          auth, getAllUsers);

// GET  /api/users/me   — my own profile
router.get("/me",        auth, getUser);

// POST /api/users/avatar    — upload profile picture to Cloudinary
router.post("/avatar",   auth, avatarUploadMiddleware, uploadAvatar);

// PUT  /api/users/profile   — update name / bio
router.put("/profile",   auth, updateProfile);

// PUT  /api/users/password  — change password
router.put("/password",  auth, changePassword);

module.exports = router;