
const User = require('../Tables/User')
const bcrypt = require('bcrypt');

const CreateUser = async (req, res) => {
    try {
      const { email, password, name, username } = req.body;
      console.log(req.body);
  
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
        name: name || username,
        username,
        userId
      });
  
      await newUser.save();
  
      res.json({ 
        message: 'User registered successfully',
        user: {
          userId: newUser.userId,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  const AllUsers = async (req, res) => {
    try {
     console.log("hello from allusers")
      const AllUser = await User.find()
      console.log("🚀 ~ file: Users.js:39 ~ AllUsers ~ AllUser:", AllUser)
      res.json({ users: AllUser });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  const LoginUser = async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const user = await User.findOne({ username });
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Compare hashed password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      res.json({
        message: 'Login successful',
        user: {
          userId: user.userId,
          username: user.username,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  module.exports = { CreateUser, AllUsers, LoginUser }