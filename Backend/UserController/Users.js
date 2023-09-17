
const User = require('../Tables/User')

const CreateUser = async (req, res) => {
    try {
      const { email, password, name } = req.body;
      console.log(req.body);
  
      // Add validation and error handling as needed
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }
  
      const newUser = new User({
        email,
        password,
        name,
        userId:221//change manually
      });
  
      await newUser.save();
  
      res.json({ message: 'User registered successfully' });
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
      // res.json({ AllUser });
      return AllUser;
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  module.exports = { CreateUser, AllUsers }