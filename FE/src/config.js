// require("dotenv").config()
const config = {
    port : process.env.port || ':3001',
    BaseURL : process.env.BaseURL || "https://chatapp-backend-fa2x.onrender.com",
}

module.exports = config