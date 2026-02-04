/**
 * MongoDB Connection Manager
 * 
 * Handles database connection lifecycle with automatic reconnection.
 * Implements singleton pattern to reuse existing connections.
 * 
 * @module database/connection
 */

const mongoose = require('mongoose');

let isConnected = false;

/**
 * Establish MongoDB connection with retry logic
 * 
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If MongoDB URI is not defined or connection fails
 */
const connectDB = async () => {
  if (isConnected) {
    console.log('📦 Using existing MongoDB connection');
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MongoDb_URL;
    
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    // MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(mongoURI, options);

    isConnected = true;
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log('🔗 MongoDB connection established');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
      isConnected = false;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔴 MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    isConnected = false;
    console.error('❌ MongoDB Connection Failed:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('ENOTFOUND')) {
      console.error('🔍 DNS Resolution Failed: Check your MongoDB cluster URL');
    } else if (error.message.includes('Authentication failed')) {
      console.error('🔑 Authentication Failed: Check your username and password');
    } else if (error.message.includes('network error')) {
      console.error('🌐 Network Error: Check your internet connection and firewall settings');
    }
    
    console.log('\n💡 Troubleshooting Tips:');
    console.log('   1. Verify your MongoDB Atlas connection string');
    console.log('   2. Check username and password are URL-encoded');
    console.log('   3. Ensure IP address is whitelisted in MongoDB Atlas');
    console.log('   4. Test connection at: https://cloud.mongodb.com\n');
    
    throw error;
  }
};

const getConnectionStatus = () => {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
};

const closeConnection = async () => {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('🔴 MongoDB connection closed');
  }
};

module.exports = {
  connectDB,
  getConnectionStatus,
  closeConnection
};
