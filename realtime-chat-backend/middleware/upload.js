// middleware/upload.js
const multer   = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          "journeychat/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation:  [{ width: 300, height: 300, crop: "fill", gravity: "face" }],
    public_id:       (req) => `avatar_${req.user._id}_${Date.now()}`,
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("avatar");

// Wraps multer so Express error handling works cleanly
const avatarUploadMiddleware = (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err instanceof multer.MulterError)
      return res.status(400).json({ msg: `Upload error: ${err.message}` });
    if (err)
      return res.status(400).json({ msg: err.message });
    next();
  });
};

module.exports = { avatarUploadMiddleware };