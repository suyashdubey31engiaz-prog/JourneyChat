// middleware/auth.js
const jwt = require("jsonwebtoken");

/**
 * Dev-friendly auth middleware:
 * - If process.env.JWT_SECRET is NOT set -> skip auth (convenient for local testing).
 * - If JWT_SECRET is set -> require a Bearer token and verify it.
 *
 * Adjust req.user assignment to match your JWT payload shape if needed.
 */
module.exports = function (req, res, next) {
  const secret = process.env.JWT_SECRET;
  const authHeader = req.headers.authorization;

  // If no secret configured, skip enforcement (local dev)
  if (!secret) {
    return next();
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // adapt if your token payload differs
    return next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ msg: "Token invalid or expired" });
  }
};
