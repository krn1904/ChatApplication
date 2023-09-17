const mongoose = require("mongoose");

const MessagesEntity = mongoose.Schema({
  senderId: {
    type: Number,
  },
  recieverId:{
    type: Number,
  },
  message:{
    type: JSON
  },
},
{timestamps : true})

const message = mongoose.model("message", MessagesEntity);

module.exports = message;

//  "mongodb+srv://karanssoni2002:KaranMongo2002@karanscluster.j4ai1as.mongodb.net/"