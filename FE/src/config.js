// require("dotenv").config()
const config = {
    port : process.env.port,
    BaseURL : process.env.BaseURL || "wss://chatapp-backend-fa2x.onrender.com"
}

module.exports = config