const express = require('express');
const router = express.Router();
const Message = require('../Tables/Message');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

/**
 * GET /api/messages/:roomId
 * Get message history for a room with pagination
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Messages per page (default: 50, max: 100)
 *   - before: Get messages before this timestamp (ISO string)
 *   - after: Get messages after this timestamp (ISO string)
 */
router.get('/:roomId', optionalAuth, async (req, res) => {
    try {
        const { roomId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const skip = (page - 1) * limit;
        
        // Build query
        const query = { 
            roomId,
            isDeleted: false // Don't show deleted messages
        };
        
        // Filter by timestamp if provided
        if (req.query.before) {
            query.timestamp = { $lt: new Date(req.query.before) };
        }
        if (req.query.after) {
            query.timestamp = { ...query.timestamp, $gt: new Date(req.query.after) };
        }
        
        // Get total count for pagination metadata
        const totalMessages = await Message.countDocuments(query);
        const totalPages = Math.ceil(totalMessages / limit);
        
        // Fetch messages
        const messages = await Message.find(query)
            .sort({ timestamp: -1 }) // Newest first
            .skip(skip)
            .limit(limit)
            .select('-__v') // Exclude version key
            .lean();
        
        // Reverse to get chronological order (oldest to newest)
        messages.reverse();
        
        res.json({
            success: true,
            roomId,
            messages: messages.map(msg => ({
                messageId: msg.messageId,
                author: msg.author,
                authorId: msg.authorId,
                content: msg.content,
                timestamp: msg.timestamp,
                isEdited: msg.isEdited,
                editedAt: msg.editedAt,
                formattedTime: new Date(msg.timestamp).toLocaleTimeString('en-AU', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'Australia/Melbourne' 
                })
            })),
            pagination: {
                currentPage: page,
                totalPages,
                totalMessages,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('[API] Error fetching messages:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch messages',
            message: error.message 
        });
    }
});

/**
 * GET /api/messages/:roomId/latest
 * Get the latest N messages from a room (for initial load)
 */
router.get('/:roomId/latest', optionalAuth, async (req, res) => {
    try {
        const { roomId } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        
        const messages = await Message.find({ 
            roomId,
            isDeleted: false 
        })
            .sort({ timestamp: -1 })
            .limit(limit)
            .select('-__v')
            .lean();
        
        // Reverse to get chronological order
        messages.reverse();
        
        res.json({
            success: true,
            roomId,
            messages: messages.map(msg => ({
                messageId: msg.messageId,
                author: msg.author,
                authorId: msg.authorId,
                content: msg.content,
                timestamp: msg.timestamp,
                isEdited: msg.isEdited,
                editedAt: msg.editedAt,
                formattedTime: new Date(msg.timestamp).toLocaleTimeString('en-AU', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'Australia/Melbourne' 
                })
            })),
            count: messages.length
        });
    } catch (error) {
        console.error('[API] Error fetching latest messages:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch latest messages',
            message: error.message 
        });
    }
});

/**
 * GET /api/messages/:roomId/count
 * Get total message count for a room
 */
router.get('/:roomId/count', optionalAuth, async (req, res) => {
    try {
        const { roomId } = req.params;
        const count = await Message.countDocuments({ 
            roomId,
            isDeleted: false 
        });
        
        res.json({
            success: true,
            roomId,
            count
        });
    } catch (error) {
        console.error('[API] Error counting messages:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to count messages',
            message: error.message 
        });
    }
});

/**
 * POST /api/messages (Optional - for REST-based message sending)
 * Send a message via REST API (alternative to WebSocket)
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { content, roomId } = req.body;
        const { username, userId } = req.user;
        
        if (!content || !roomId) {
            return res.status(400).json({
                success: false,
                error: 'Content and roomId are required'
            });
        }
        
        const newMessage = new Message({
            author: username,
            authorId: userId,
            content,
            roomId
        });
        
        const savedMessage = await newMessage.save();
        
        res.status(201).json({
            success: true,
            message: savedMessage
        });
    } catch (error) {
        console.error('[API] Error creating message:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create message',
            message: error.message 
        });
    }
});

module.exports = router; 