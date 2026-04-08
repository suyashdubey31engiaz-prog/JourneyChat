// routes/auth.js
const express    = require("express");
const router     = express.Router();
const jwt        = require("jsonwebtoken");
const bcrypt     = require("bcryptjs");
const User       = require("../models/User");
const authMiddle = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// ── Helper: sign a token ───────────────────────────────────────────────────────
const signToken = (user, remember) => jwt.sign(
  { _id: user._id, name: user.name, email: user.email },
  JWT_SECRET,
  // remember=true  → 15 days (stays logged in across browser restarts)
  // remember=false → 24 hours (session-style, logs out if they don't visit)
  { expiresIn: remember ? "15d" : "24h" }
);

// ── REGISTER ──────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ msg: "Please fill all fields" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const user  = new User({ name, email, password });
    await user.save();

    // New registrations always get a 15-day token
    const token = signToken(user, true);
    res.json({ token, user: { _id:user._id, name:user.name, email:user.email, avatar:user.avatar } });
  } catch (err) {
    console.error("register:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password, remember = false } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Enter email and password" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Auto-expire status if it was set with a timer and it's passed
    if (user.statusExpiry && new Date() > user.statusExpiry) {
      user.status       = "online";
      user.statusExpiry = null;
      await user.save();
    }

    const token = signToken(user, remember);
    res.json({
      token,
      remember,
      // expiresAt lets the frontend know exactly when to force-logout
      expiresAt: remember
        ? Date.now() + 15 * 24 * 60 * 60 * 1000
        : Date.now() +      24 * 60 * 60 * 1000,
      user: {
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        avatar: user.avatar,
        bio:    user.bio,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("login:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ── REFRESH TOKEN ─────────────────────────────────────────────────────────────
// Called silently by the frontend when the token is close to expiry.
// Returns a fresh token with the same "remember" window (15d or 24h).
router.post("/refresh", authMiddle, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Keep the same expiry window as the original token
    const original = req.headers.authorization?.split(" ")[1];
    let remember = false;
    try {
      const decoded = jwt.decode(original);
      if (decoded?.exp && decoded?.iat) {
        const duration = decoded.exp - decoded.iat;
        remember = duration > 86400; // > 1 day means it was a "remember me" token
      }
    } catch {}

    const token = signToken(user, remember);
    res.json({
      token,
      expiresAt: remember
        ? Date.now() + 15 * 24 * 60 * 60 * 1000
        : Date.now() +      24 * 60 * 60 * 1000,
    });
  } catch (err) {
    console.error("refresh:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ── UPDATE STATUS ─────────────────────────────────────────────────────────────
// Body: { status: "away", durationHours: 8 }
// durationHours is optional — if omitted the status stays until manually changed
router.post("/status", authMiddle, async (req, res) => {
  try {
    const { status, durationHours } = req.body;
    const allowed = ["online","away","busy","invisible"];
    if (!allowed.includes(status))
      return res.status(400).json({ msg: "Invalid status" });

    const expiry = durationHours
      ? new Date(Date.now() + durationHours * 60 * 60 * 1000)
      : null;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { status, statusExpiry: expiry } },
      { new: true }
    ).select("-password");

    res.json({ status: user.status, statusExpiry: user.statusExpiry });
  } catch (err) {
    console.error("status:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;