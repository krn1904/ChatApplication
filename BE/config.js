require('dotenv').config();

const config = {
  // Server
  PORT: process.env.PORT || 8001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB - IMPORTANT: Set MONGODB_URI in .env file
  MONGODB_URI: process.env.MONGODB_URI || process.env.MongoDb_URL,
  
  // JWT (for Phase 1)
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
};

module.exports = config;