/**
 * User Model
 * 
 * MongoDB schema for user accounts with authentication support.
 * Implements dual password storage (plain + hashed) for backup/recovery.
 * 
 * @module Tables/User
 */

const mongoose = require('mongoose');

/**
 * User Schema
 * 
 * @property {number} userId - Unique numeric identifier
 * @property {string} username - Unique username for login (indexed)
 * @property {string} email - Unique email address (indexed)
 * @property {string} password - Plain text password (backup/recovery only)
 * @property {string} hashedPassword - Bcrypt hashed password for authentication
 * @property {string} name - Display name (optional)
 * @property {Date} lastLogin - Last successful login timestamp
 * @property {boolean} isActive - Account active status (default: true)
 */
const userSchema = new mongoose.Schema({
  userId : {
    type: Number,
    required: true,
    unique : true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique : true
  },
  password: {
    type: String,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  name : {
    type : String
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
},
{timestamps : true});

const User = mongoose.model('User', userSchema);

module.exports = User;
