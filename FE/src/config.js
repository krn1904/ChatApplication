// require("dotenv").config()
const config = {
    port : process.env.port || '8000',
    BaseURL : process.env.BaseURL || "http://localhost:8001",
}

module.exports = config