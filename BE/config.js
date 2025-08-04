
require('dotenv').config();

const config = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://karanssoni2002:karanssoni2002@chatapp.eweag9y.mongodb.net/chat_app',
    SERVER_PORT: process.env.PORT || 8001,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
};

module.exports = config;