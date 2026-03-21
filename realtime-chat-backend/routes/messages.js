const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getMessages, deleteMessage } = require("../controllers/messageController");

// @route   GET api/messages/:userId
// @desc    Get chat history with a specific user
// @access  Private
router.get("/:userId", auth, getMessages);

// @route   DELETE api/messages/:messageId
// @desc    Delete a specific message
// @access  Private
router.delete("/:messageId", auth, deleteMessage);

module.exports = router;