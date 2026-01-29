/**
 * Message Model
 * 
 * MongoDB schema for chat messages with UUID support, soft delete, and edit tracking.
 * Implements efficient querying with compound indexes on roomId and timestamp.
 * 
 * @module Tables/Message
 */

const mongoose = require("mongoose");
const crypto = require('crypto');

/**
 * Generate UUID v4 using Node.js crypto module
 * @returns {string} UUID v4 string
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Message Schema
 * 
 * @property {string} messageId - Unique UUID v4 identifier
 * @property {string} author - Username of message author
 * @property {number} authorId - Numeric user ID
 * @property {string} content - Message text content
 * @property {string} roomId - Room/channel identifier (indexed)
 * @property {Date} timestamp - Message creation time (indexed)
 * @property {boolean} isEdited - Whether message has been edited
 * @property {Date} editedAt - Last edit timestamp (null if never edited)
 * @property {boolean} isDeleted - Soft delete flag (for message history)
 */
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

// Create compound index for efficient querying by room and timestamp
MessageSchema.index({ roomId: 1, timestamp: -1 });

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;