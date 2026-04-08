// models/User.js
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar:   { type: String, default: "" },
  bio:      { type: String, default: "", maxlength: 200 },

  // ── Status system ────────────────────────────────────────────────────────
  // "online" | "away" | "busy" | "invisible" — managed by the user manually
  // statusExpiry: when the status auto-resets back to "online" (null = never)
  status:       { type: String, default: "online", enum: ["online","away","busy","invisible"] },
  statusExpiry: { type: Date,   default: null },

  createdAt: { type: Date, default: Date.now },
});

// Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt    = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password check helper
UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", UserSchema);