// realtime-chat-backend/routes/agora.js
const express = require("express");
const router = express.Router();
const { getToken } = require("../controllers/agoraController");
const auth = require("../middleware/auth");
router.get("/token", auth, getToken);
module.exports = router;
//007eJxTYKhb77HvXtPrnYbKjLFyb62fNgq5pDx5rvT+ffrKmR59EnsVGAxTUkwNTMzSjEzMTE0MjBOTUpJTDc0s0iwTE03TTA0N2888z2gIZGSYLfiJiZEBAkF8ZobMlDwGBgCAsyCO
