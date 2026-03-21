const Message = require("../models/Message");

/**
 * @desc    Get all messages between the logged-in user and another user.
 * @route   GET /api/messages/:userId
 * @access  Private
 */
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params; // The ID of the person you're chatting with
    // FIX: Changed req.user.id to req.user._id to get the logged-in user's ID
    const selfId = req.user._id; // The ID of the currently logged-in user

    const messages = await Message.find({
      // Find all messages where the sender/receiver pair matches either way
      $or: [
        { sender: selfId, receiver: userId },
        { sender: userId, receiver: selfId },
      ],
    }).sort({ timestamp: 1 }); // Sort by oldest first to display in correct order

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

/**
 * @desc    Delete a message by its ID.
 * @route   DELETE /api/messages/:messageId
 * @access  Private
 */
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    // Security check: Ensure the user requesting deletion is the original sender
    // FIX: Changed req.user.id to req.user._id for authorization check
    if (message.sender.toString() !== req.user._id) {
      return res.status(401).json({ msg: "User not authorized to delete this message" });
    }

    await message.deleteOne(); // Mongoose 6+ method to remove the document

    res.json({ msg: "Message deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};