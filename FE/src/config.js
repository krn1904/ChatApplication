// require("dotenv").config()
const config = {
    port: process.env.port || '8000',
    BaseURL: process.env.REACT_APP_BASE_URL || "http://localhost:8001",
    WsURL: process.env.REACT_APP_WS_URL || "ws://localhost:8001"
}

export default config