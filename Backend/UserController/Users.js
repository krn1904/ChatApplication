/**
 * User Controller
 * 
 * Handles user registration and authentication operations.
 * Implements JWT-based authentication with bcrypt password hashing.
 * 
 * @module UserController/Users
 */

const User = require('../Tables/User')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Register a new user
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User email (unique)
 * @param {string} req.body.username - Username (unique)
 * @param {string} req.body.password - Plain text password (will be hashed)
 * @param {Object} res - Express response object
 * @returns {Object} JWT token and user data
 */
const CreateUser = async (req, res) => {
    try {
      const { email, password, username } = req.body;
  
      // Add validation and error handling as needed
      if (!email || !password || !username) {
        return res.status(400).json({ error: 'Email, username and password are required' });
      }
  
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email or username already exists' });
      }

      // Generate unique userId
      const userCount = await User.countDocuments();
      const userId = userCount + 1;

      // Hash password with bcrypt (salt rounds = 10)
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({
        email,
        password, // Kept for backup/recovery purposes
        hashedPassword, // Encrypted password for authentication
        username,
        userId
      });
  
      await newUser.save();

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: newUser.userId, 
          username: newUser.username,
          email: newUser.email 
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
      );
  
      res.json({ 
        message: 'User registered successfully',
        token,
        user: {
          userId: newUser.userId,
          username: newUser.username,
          email: newUser.email
        }
      });
    } catch (error) {
      console.error('[Auth] Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Authenticate user login
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.username - Username
   * @param {string} req.body.password - Plain text password
   * @param {Object} res - Express response object
   * @returns {Object} JWT token and user data
   */
  const LoginUser = async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const user = await User.findOne({ username });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found. Please register first.' });
      }

      // Compare hashed password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.userId, 
          username: user.username,
          email: user.email 
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
      );

      // Update lastLogin timestamp
      user.lastLogin = new Date();
      await user.save();

      res.json({
        message: 'Login successful',
        token,
        user: {
          userId: user.userId,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('[Auth] Error logging in:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  module.exports = { CreateUser, LoginUser }