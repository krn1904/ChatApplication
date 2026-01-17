const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get messages for a room
router.get('/:roomId', async (req, res) => {
    try {
        const messages = await Message.find({ room: req.params.roomId })
            .sort({ createdAt: 1 })
            .limit(100); // Limit to last 100 messages
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 