require("dotenv").config()
const config = {
    port : process.env.port || ':3001',
    BaseURL : process.env.BaseURL ,
}

module.exports = config