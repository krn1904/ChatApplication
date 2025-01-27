const express = require('express');
const router = express.Router();
const { CreateUser, LoginUser, AllUsers, UpdateUser } = require('../UserController/Users');

router.post('/register', CreateUser);
router.post('/login', LoginUser);
router.get('/all', AllUsers);
router.put('/:userId', UpdateUser);

// Get users in a room
router.get('/room/:roomId/users', (req, res) => {
    try {
        const { roomId } = req.params;
        const rooms = req.app.get('rooms');
        
        const room = rooms.get(roomId);
        if (!room) {
            console.log('Room not found:', roomId);
            return res.status(404).json({ 
                message: 'Room not found',
                users: [] 
            });
        }

        // Get list of users in the room
        const users = Array.from(room).map(user => ({
            username: user.username,
            id: user.id
        }));

        console.log('Users in room:', users);
        res.json({ users });
    } catch (error) {
        console.error('Error getting room users:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            users: [] 
        });
    }
});

module.exports = router; 