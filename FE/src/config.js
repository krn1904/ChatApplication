// require("dotenv").config()
const config = {
    port: process.env.REACT_APP_PORT || '8001',
    // BaseURL: process.env.REACT_APP_BASE_URL || "http://localhost:8001",
    BaseURL: process.env.REACT_APP_BASE_URL || "ws://localhost:8001"
}

export default config