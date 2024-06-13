const { WebSocket } = require('ws');
const message = require('../Tables/Message.js');

const api = new Map();
const rooms = new Map();
const roomMessages = new Map();

 const handleMessage = async (req, clients, ws, db) => {

    if (api.has(req.method)){

        let requectMethod = api.get(req.method);

        let res = await requectMethod(req, clients, ws, db)

        return res
    }

}

// When message has been send set the message to the respective room.
api.set("send-message", async (req, clients, ws) => {
    let message = req.message;
    let userId = req.author;
    let roomId = req.room;

    // Check if the room exists, if not, create a new room
    if (!roomMessages.has(roomId)) {
        roomMessages.set(roomId, []);
    }

    // Save the message to the messages array for the room
    if (message) {
        roomMessages.get(roomId).push({ userId, message });
        
        sendMessageToRoom(userId, message, clients, ws)

        console.log(`Message sent by ${userId} in room ${roomId}: ${message}`);
    }
    // return whole map to the room so we can extract data over FE.
    // console.log(roomMessages)
    // console.log("rooms",rooms)
    // const room_messageList = roomMessages.get(roomId);
    // return room_messageList
})

api.set("joinRoom", async (req, clients, websocketConnection, db) => {
    let roomId = req.room;
    let userId = req.user;

    const websocketConnectionObj = { websocketConnection }

    // If room has not available then set a new one.
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }

    // Add the user to the room
     rooms.get(roomId).add({userId, websocketConnectionObj });
    
    // only purpose to disdplay all the
    //   rooms.forEach((users, roomId) => {
    //     console.log(`Room ${roomId}: ${Array.from(users).join(', ')}`);
    //   });

    // Add the user to the room
    rooms.get(roomId).add({ userId, websocketConnectionObj });

    // Insert or update user in the database
    const usersCollection = db.collection('users');
    const user = {
        userId,
        rooms: [roomId] // Initial room assignment
    };

     // Step 1: Update the userName
     await usersCollection.updateOne(
        { userId },
        {
            $set: { userId }
        },
        { upsert: true }
    );

    // Step 2: Update the rooms array
    await usersCollection.updateOne(
        { userId },
        {
            $addToSet: { rooms: roomId }
        }
    );
    console.log(`User ${userId} joined room ${roomId}`);
})


api.set("get-chats", async (req) => {
    let chats = req.params.withUser;
})

api.set("get-messages", async (req) => {
    let roomId = req.room;

    // Return the messages for the specified room
    return roomMessages.get(roomId) || [];
});

// Function to send a message to all users in a room
function sendMessageToRoom(userId, message, clients, ws) {

    clients.forEach(function each(client) {
        // console.log(client.WebSocket == ws)
          if (client.readyState === WebSocket.OPEN) {
            const MsgObj = {
                method: 'send-message',
                author: userId,
                message: message,
                // room: roomId,
                timestamp: new Date().getHours() + new Date().getMinutes(),
              };
            client.send(JSON.stringify(MsgObj));
          }
        })
    
}

module.exports = {
    handleMessage,
    api, // if you need to use 'api' in another file
};