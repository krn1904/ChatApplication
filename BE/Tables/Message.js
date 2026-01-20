const mongoose = require("mongoose");
const crypto = require('crypto');

// Generate UUID v4 using crypto
function generateUUID() {
  return crypto.randomUUID();
}

const MessageSchema = mongoose.Schema({
  messageId: {
    type: String,
    unique: true,
    default: generateUUID,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  authorId: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  roomId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create index for efficient querying by room and timestamp
MessageSchema.index({ roomId: 1, timestamp: -1 });

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;