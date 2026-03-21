// routes/whiteboard.js
const express = require("express");
const router = express.Router();
const { getWhiteboard, saveWhiteboard, deleteWhiteboard } = require("../controllers/whiteboardController");
// optional: const auth = require("../middleware/auth"); // protect if you want

router.get("/:boardId", /* auth, */ getWhiteboard);
router.post("/:boardId", /* auth, */ saveWhiteboard);
router.delete("/:boardId", /* auth, */ deleteWhiteboard);

module.exports = router;
