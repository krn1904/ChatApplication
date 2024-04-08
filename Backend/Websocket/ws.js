// import wsConnection from "../server";
// import  message  from "../Tables/Message.js";
const { WebSocket } = require('ws');
// const message = require('../Tables/Message.js');
const message = require('../Tables/Message.js');


// const messages = {}
const api = new Map();
const rooms = new Map();
const roomMessages = new Map();

 const handleMessage = async (req, clients, ws) => {

    if (api.has(req.method)){

        let requectMethod = api.get(req.method);

        let res = await requectMethod(req, clients, ws)

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

// api.set("groupSend", async (req) => {
//     console.log("inside groupSend");
//     let message = req.message;
//     // let userId = req.author;
//     let roomId = req.room;
//     let currentRoom  = rooms.get(roomId)

//     clients.forEach((client)=>{
//         console.log("client",client)
//         client.send(message)
//     })
//     // const room_messageList = roomMessages.get(roomId);
//     // return room_messageList
// })


// Room has been setted up : all the users has been joined in the room will be managd by Map

api.set("joinRoom", async (req, clients, websocketConnection) => {
    let roomId = req.room;
    let userId = req.user;

    const websocketConnectionObj = { websocketConnection }

    // If room has not available then set a new one.
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }

    // Add the user to the room
     rooms.get(roomId).add({userId, websocketConnectionObj });
    
     //  only purpose to disdplay all the
    // rooms.forEach((users, roomId) => {
    //     console.log(`Room ${roomId}: ${Array.from(users).join(', ')}`);
    //   });
    
    console.log(rooms)
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
    
    // const usersInRoom = rooms.get(roomId) || new Set();
    
    // return usersInRoom
    // console.log("userInroom",usersInRoom);

    clients.forEach(function each(client) {
        console.log(client.WebSocket == ws)
          if (client.readyState === WebSocket.OPEN) {
            const obj = {
                method: 'send-message',
                author: userId,
                message: message,
                // room: roomId,
                timestamp: new Date().getHours() + new Date().getMinutes(),
              };
            client.send(JSON.stringify(obj));
          }
        })
    
//     usersInRoom.forEach((user) => {
//         const { ws } = user
//         // console.log("ws", ws)
//         // const ws = user.websocketConnection;
//         if (ws.readyState === WebSocket.OPEN) {
//             console.log("indide if ready")
          
//             //   console.log("ws.send()",ws.send)
//               try {
//                 console.log("Calling ws.send()");
//                 ws.send(JSON.stringify(message));
//             } catch (error) {
//                 console.error("Error sending message:", error);
//             }
//             // console.log(ws)
//         }
//   });
}

module.exports = {
    handleMessage,
    api, // if you need to use 'api' in another file
};