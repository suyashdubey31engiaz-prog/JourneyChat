// middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const secret = process.env.JWT_SECRET;
  const authHeader = req.headers.authorization;

  // If no secret configured, skip enforcement (local dev)
  if (!secret) {
    return next();
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Authorization token missing", code: "NO_TOKEN" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (err) {
    // Distinguish expired vs truly invalid — frontend uses the code to show the right message
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Session expired. Please sign in again.", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ msg: "Invalid token. Please sign in again.", code: "TOKEN_INVALID" });
  }
};