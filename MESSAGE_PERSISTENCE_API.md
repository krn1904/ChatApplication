# Message Persistence API Documentation

**Feature:** Message Persistence with MongoDB  
**Status:** ✅ Implemented  
**Last Updated:** January 23, 2026  
**Branch:** feature/message-persistence

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Message Schema](#message-schema)
3. [REST API Endpoints](#rest-api-endpoints)
4. [WebSocket Integration](#websocket-integration)
5. [Pagination](#pagination)
6. [Usage Examples](#usage-examples)
7. [Testing](#testing)

---

## Overview

The message persistence feature enables:
- ✅ **Persistent Storage**: Messages are saved to MongoDB
- ✅ **Message History**: Load past messages when joining a room
- ✅ **Pagination**: Efficiently load messages in chunks
- ✅ **Real-time + REST**: Both WebSocket and REST API support
- ✅ **Soft Delete**: Messages can be marked as deleted without removal

---

## Message Schema

### Database Structure

**Collection:** `messages`

```javascript
{
  messageId: String,        // UUID v4 (auto-generated)
  author: String,           // Username of sender
  authorId: Number,         // User ID (foreign key to users)
  content: String,          // Message text
  roomId: String,           // Room identifier
  timestamp: Date,          // Message creation time (auto-generated)
  isEdited: Boolean,        // Flag for edited messages (default: false)
  editedAt: Date,          // Timestamp of last edit (null if not edited)
  isDeleted: Boolean,       // Soft delete flag (default: false)
  createdAt: Date,          // Auto-managed by Mongoose
  updatedAt: Date           // Auto-managed by Mongoose
}
```

### Indexes

For optimal query performance:
- **Compound Index**: `{ roomId: 1, timestamp: -1 }`
- **Unique Index**: `messageId` (auto-created)

---

## REST API Endpoints

### 1. Get Message History (with Pagination)

**Endpoint:** `GET /api/messages/:roomId`

**Authentication:** Optional (uses `optionalAuth` middleware)

**Query Parameters:**
- `page` (optional): Page number, default: 1
- `limit` (optional): Messages per page, default: 50, max: 100
- `before` (optional): Get messages before this ISO timestamp
- `after` (optional): Get messages after this ISO timestamp

**Example Request:**
```bash
GET /api/messages/room123?page=2&limit=20
```

**Response:**
```json
{
  "success": true,
  "roomId": "room123",
  "messages": [
    {
      "messageId": "550e8400-e29b-41d4-a716-446655440000",
      "author": "johndoe",
      "authorId": 1001,
      "content": "Hello everyone!",
      "timestamp": "2026-01-23T10:30:00.000Z",
      "isEdited": false,
      "editedAt": null,
      "formattedTime": "10:30 AM"
    }
  ],
  "pagination": {
    "currentPage": 2,
    "totalPages": 5,
    "totalMessages": 95,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

---

### 2. Get Latest Messages

**Endpoint:** `GET /api/messages/:roomId/latest`

**Authentication:** Optional

**Query Parameters:**
- `limit` (optional): Number of messages to fetch, default: 50, max: 100

**Use Case:** Initial room load - get the most recent messages

**Example Request:**
```bash
GET /api/messages/room123/latest?limit=30
```

**Response:**
```json
{
  "success": true,
  "roomId": "room123",
  "messages": [
    {
      "messageId": "550e8400-e29b-41d4-a716-446655440000",
      "author": "johndoe",
      "authorId": 1001,
      "content": "Hello!",
      "timestamp": "2026-01-23T10:30:00.000Z",
      "isEdited": false,
      "editedAt": null,
      "formattedTime": "10:30 AM"
    }
  ],
  "count": 30
}
```

---

### 3. Get Message Count

**Endpoint:** `GET /api/messages/:roomId/count`

**Authentication:** Optional

**Use Case:** Display total message count in UI

**Example Request:**
```bash
GET /api/messages/room123/count
```

**Response:**
```json
{
  "success": true,
  "roomId": "room123",
  "count": 247
}
```

---

### 4. Send Message (REST Alternative)

**Endpoint:** `POST /api/messages`

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "content": "Hello from REST API!",
  "roomId": "room123"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "messageId": "550e8400-e29b-41d4-a716-446655440000",
    "author": "johndoe",
    "authorId": 1001,
    "content": "Hello from REST API!",
    "roomId": "room123",
    "timestamp": "2026-01-23T10:30:00.000Z",
    "isEdited": false,
    "isDeleted": false
  }
}
```

**Note:** This is an alternative to WebSocket. Real-time chat should use WebSocket for better performance.

---

## WebSocket Integration

### Sending Messages

Messages sent via WebSocket are automatically saved to MongoDB.

**Client Sends:**
```javascript
ws.send(JSON.stringify({
  method: 'send-message',
  message: 'Hello!',
  author: 'johndoe',
  room: 'room123'
}));
```

**Backend Process:**
1. Validates message fields
2. Looks up user ID from username
3. Saves message to MongoDB with auto-generated UUID
4. Broadcasts to all room members

---

### Joining Room (Load History)

When a user joins a room, they automatically receive message history.

**Client Sends:**
```javascript
ws.send(JSON.stringify({
  method: 'join-room',
  room: 'room123',
  username: 'johndoe'
}));
```

**Server Responds:**
```javascript
{
  method: 'message-history',
  roomId: 'room123',
  messages: [
    {
      messageId: "550e8400-e29b-41d4-a716-446655440000",
      author: "alice",
      message: "Welcome!",
      timestamp: "2026-01-23T10:00:00.000Z",
      formattedTime: "10:00 AM"
    }
  ],
  count: 50
}
```

**Default Behavior:**
- Loads last 50 messages on join
- Messages sorted chronologically (oldest first)
- Only non-deleted messages are shown

---

### Getting More Messages (Pagination)

**Client Sends:**
```javascript
ws.send(JSON.stringify({
  method: 'get-messages',
  room: 'room123',
  limit: 20,
  skip: 50  // Skip first 50 messages (page 2)
}));
```

**Server Returns:**
```javascript
[
  {
    messageId: "uuid",
    author: "username",
    message: "content",
    timestamp: "ISO date",
    formattedTime: "HH:MM AM/PM"
  }
]
```

---

## Pagination

### Strategy 1: Offset-Based (WebSocket)

**Use `skip` and `limit`:**
```javascript
// Page 1: skip=0, limit=50
// Page 2: skip=50, limit=50
// Page 3: skip=100, limit=50
```

**Pros:** Simple to implement  
**Cons:** Can be slow with large offsets

---

### Strategy 2: Cursor-Based (REST API)

**Use timestamp cursors:**
```javascript
// Initial load
GET /api/messages/room123?limit=50

// Load older messages
GET /api/messages/room123?before=2026-01-23T10:00:00.000Z&limit=50

// Load newer messages (infinite scroll up)
GET /api/messages/room123?after=2026-01-23T11:00:00.000Z&limit=50
```

**Pros:** Consistent results, efficient  
**Cons:** More complex frontend logic

---

## Usage Examples

### Frontend: Load Initial Messages

```javascript
// Method 1: REST API
const loadMessages = async (roomId) => {
  const response = await fetch(
    `https://api.example.com/api/messages/${roomId}/latest?limit=50`
  );
  const data = await response.json();
  
  if (data.success) {
    setMessages(data.messages);
  }
};

// Method 2: WebSocket (on room join)
ws.send(JSON.stringify({
  method: 'join-room',
  room: roomId,
  username: currentUser
}));

// Listen for history
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.method === 'message-history') {
    setMessages(data.messages);
  }
};
```

---

### Frontend: Load More Messages (Infinite Scroll)

```javascript
const loadMoreMessages = async (roomId, page) => {
  const response = await fetch(
    `https://api.example.com/api/messages/${roomId}?page=${page}&limit=20`
  );
  const data = await response.json();
  
  if (data.success) {
    // Prepend to existing messages (older messages at top)
    setMessages(prev => [...data.messages, ...prev]);
    return data.pagination.hasNextPage;
  }
  return false;
};

// Trigger on scroll to top
const handleScroll = (e) => {
  if (e.target.scrollTop === 0 && hasMoreMessages) {
    setPage(prev => prev + 1);
  }
};
```

---

### Frontend: Send Message

```javascript
// Recommended: WebSocket
const sendMessage = (message, room, author) => {
  ws.send(JSON.stringify({
    method: 'send-message',
    message,
    room,
    author
  }));
};

// Alternative: REST API (if WebSocket unavailable)
const sendMessageREST = async (message, roomId, token) => {
  const response = await fetch('https://api.example.com/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      content: message,
      roomId
    })
  });
  
  return await response.json();
};
```

---

## Testing

### Manual Testing Checklist

#### WebSocket Message Saving
- [ ] Send message via WebSocket
- [ ] Check MongoDB to verify message saved
- [ ] Verify messageId is UUID format
- [ ] Confirm timestamp is auto-generated
- [ ] Check authorId matches user

#### Message History on Join
- [ ] Join room with existing messages
- [ ] Verify last 50 messages are received
- [ ] Check messages are in chronological order
- [ ] Confirm only non-deleted messages shown

#### REST API Pagination
- [ ] GET /api/messages/:roomId (default page 1)
- [ ] GET with page=2, check different messages
- [ ] GET with limit=10, verify only 10 returned
- [ ] Check pagination metadata is correct

#### Timestamp Filtering
- [ ] GET with `before` parameter
- [ ] GET with `after` parameter
- [ ] Verify filtered results are correct

#### Edge Cases
- [ ] Room with 0 messages
- [ ] Room with exactly 50 messages
- [ ] Room with 1000+ messages (performance)
- [ ] Invalid roomId (should return empty array)

---

### Automated Testing

```javascript
// Example test with Jest
describe('Message Persistence API', () => {
  test('GET /api/messages/:roomId returns paginated messages', async () => {
    const response = await request(app)
      .get('/api/messages/test-room?page=1&limit=10')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.messages).toHaveLength(10);
    expect(response.body.pagination.currentPage).toBe(1);
  });
  
  test('POST /api/messages requires authentication', async () => {
    await request(app)
      .post('/api/messages')
      .send({ content: 'Test', roomId: 'test' })
      .expect(401);
  });
});
```

---

## Performance Considerations

### Indexing
- ✅ Compound index on `{ roomId: 1, timestamp: -1 }` ensures fast queries
- ✅ Unique index on `messageId` prevents duplicates

### Query Optimization
- Limit message fetches to 50-100 per request
- Use cursor-based pagination for large datasets
- Consider caching frequently accessed rooms

### Scaling
- Consider sharding by `roomId` for horizontal scaling
- Implement message archival for old messages (>6 months)
- Use Redis for real-time message caching

---

## Future Enhancements

### Planned Features
- [ ] Message editing (update `isEdited` and `editedAt`)
- [ ] Message deletion (soft delete with `isDeleted`)
- [ ] Message reactions (emoji reactions)
- [ ] File attachments (images, documents)
- [ ] Message search (full-text search)
- [ ] Read receipts (track who read messages)
- [ ] Message threading (replies)

---

## Error Handling

### Common Errors

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Failed to fetch messages",
  "message": "MongoDB connection failed"
}
```

**400 Bad Request (POST)**
```json
{
  "success": false,
  "error": "Content and roomId are required"
}
```

**401 Unauthorized (POST)**
```json
{
  "error": "No authorization token provided"
}
```

---

## Environment Variables

No additional environment variables needed. Uses existing MongoDB connection.

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp
```

---

## Summary

✅ **Message Schema**: Comprehensive schema with UUID, soft delete, edit tracking  
✅ **REST API**: 4 endpoints with pagination support  
✅ **WebSocket**: Auto-save on send, history on join  
✅ **Pagination**: Both offset and cursor-based strategies  
✅ **Performance**: Optimized indexes for fast queries

**Next Steps:**
1. Test all endpoints thoroughly
2. Implement frontend pagination UI
3. Add message editing/deletion features
4. Deploy to production

---

*Documentation maintained by: Chat Application Team*  
*Last Updated: January 23, 2026*
