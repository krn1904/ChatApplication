// require("dotenv").config()
const config = {
    port : process.env.REACT_APP_PORT || "",
    BaseURL : process.env.REACT_APP_BASE_URL || "ws://localhost:8001",
    WsURL : process.env.REACT_APP_WS_URL || "ws://localhost:8001",
    BackendHTTP : process.env.REACT_APP_BACKEND_HTTP_URL || "http://localhost:8001"
}

module.exports = config