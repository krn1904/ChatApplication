const express = require('express');
const router = express.Router();
const { CreateUser, LoginUser } = require('../UserController/Users');
const { rooms } = require('../Websocket/ws');

router.post('/register', CreateUser);
router.post('/login', LoginUser);

/**
 * Get users in a specific room
 * Used by Slider (hamburger menu) to fetch room users via HTTP
 * Note: UsersList panel uses WebSocket for real-time updates instead
 */
router.get('/room/:roomId/users', (req, res) => {
    try {
        const { roomId } = req.params;
        
        const room = rooms.get(roomId);
        if (!room) {
            return res.status(404).json({ 
                message: 'Room not found',
                users: [] 
            });
        }

        // Get list of users in the room
        const users = Array.from(room).map(user => ({
            username: user.userId,
            id: user.userId
        }));

        res.json({ users });
    } catch (error) {
        console.error('[API] Error getting room users:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            users: [] 
        });
    }
});

module.exports = router; 