
const config = {
 MongoDb_URL: process.env.MongoDb_URL || 'mongodb+srv://admin:admin@chat-app.quig9nl.mongodb.net/?retryWrites=true&w=majority',
 Port: process.env.SERVER_PORT || '8001'
};
// export default config;
module.exports = config;