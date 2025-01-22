const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, 
{ timestamps: true });

// Create a static method to get the next userId
userSchema.statics.getNextUserId = async function() {
  const lastUser = await this.findOne({}, {}, { sort: { userId: -1 } });
  return lastUser ? lastUser.userId + 1 : 1000; // Start from 1000 if no users exist
};

const User = mongoose.model('User', userSchema);

module.exports = User;
