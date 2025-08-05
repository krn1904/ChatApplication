# API Documentation

This document provides comprehensive information about the Chat Application's API endpoints and WebSocket events.

## 🔌 WebSocket API

The application uses WebSocket connections for real-time communication. All WebSocket messages are JSON objects with a `method` field indicating the action to perform.

### Connection

**URL:** `ws://localhost:8001` (development) or `wss://your-backend-url.com` (production)

**Protocol:** WebSocket

### Message Format

All WebSocket messages follow this structure:

```json
{
  "method": "action-name",
  "data": {
    // Action-specific data
  }
}
```

### Events

#### 1. Join Room

**Method:** `joinRoom`

**Description:** Allows a user to join a specific chat room.

**Request:**
```json
{
  "method": "joinRoom",
  "user": "username",
  "room": "room-id"
}
```

**Response:** No direct response, but user is added to the room.

**Example:**
```javascript
// Frontend implementation
const joinRoomMessage = {
  method: 'joinRoom',
  user: 'john_doe',
  room: 'general'
};
websocket.send(JSON.stringify(joinRoomMessage));
```

#### 2. Send Message

**Method:** `send-message`

**Description:** Sends a message to all users in the current room.

**Request:**
```json
{
  "method": "send-message",
  "message": "Hello, everyone!",
  "author": "username",
  "room": "room-id"
}
```

**Response:** Message is broadcast to all users in the room.

**Broadcast Format:**
```json
{
  "method": "send-message",
  "author": "username",
  "message": "Hello, everyone!",
  "timestamp": "14:30"
}
```

**Example:**
```javascript
// Frontend implementation
const sendMessage = {
  method: 'send-message',
  message: 'Hello, everyone!',
  author: 'john_doe',
  room: 'general'
};
websocket.send(JSON.stringify(sendMessage));
```

#### 3. Get Messages

**Method:** `get-messages`

**Description:** Retrieves all messages for a specific room.

**Request:**
```json
{
  "method": "get-messages",
  "room": "room-id"
}
```

**Response:**
```json
[
  {
    "userId": "john_doe",
    "message": "Hello, everyone!",
    "timestamp": "14:30"
  },
  {
    "userId": "jane_smith",
    "message": "Hi there!",
    "timestamp": "14:31"
  }
]
```

**Example:**
```javascript
// Frontend implementation
const getMessages = {
  method: 'get-messages',
  room: 'general'
};
websocket.send(JSON.stringify(getMessages));
```

### WebSocket Connection States

| State | Description |
|-------|-------------|
| `CONNECTING` | Connection is being established |
| `OPEN` | Connection is ready for communication |
| `CLOSING` | Connection is being closed |
| `CLOSED` | Connection is closed |

### Error Handling

**Connection Errors:**
```javascript
websocket.onerror = (error) => {
  console.error('WebSocket error:', error);
  // Handle connection errors
};
```

**Message Parsing Errors:**
```javascript
try {
  const data = JSON.parse(message);
  // Process message
} catch (error) {
  console.error('Error parsing WebSocket message:', error);
}
```

## 🌐 REST API

### Base URL

- **Development:** `http://localhost:8001`
- **Production:** `https://your-backend-url.com`

### Authentication

Currently, the API uses simple username-based authentication. Future versions will implement JWT tokens.

### Endpoints

#### 1. Create User

**Endpoint:** `POST /createUser`

**Description:** Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully"
}
```

**Error Responses:**
```json
// 400 - Missing required fields
{
  "error": "Email and password are required"
}

// 409 - User already exists
{
  "error": "User with this email already exists"
}

// 500 - Server error
{
  "error": "Internal server error"
}
```

**Example:**
```javascript
// Frontend implementation
const createUser = async (email, password, name) => {
  try {
    const response = await fetch('/createUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
```

#### 2. Get All Users

**Endpoint:** `GET /users`

**Description:** Retrieves all registered users.

**Response:**
```json
[
  {
    "email": "user1@example.com",
    "name": "John Doe",
    "userId": 221
  },
  {
    "email": "user2@example.com",
    "name": "Jane Smith",
    "userId": 222
  }
]
```

**Example:**
```javascript
// Frontend implementation
const getAllUsers = async () => {
  try {
    const response = await fetch('/users');
    const users = await response.json();
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};
```

## 📊 Data Models

### User Model

```javascript
{
  email: String,        // User's email address (unique)
  password: String,     // User's password (should be hashed)
  name: String,         // User's display name
  userId: Number        // Unique user identifier
}
```

### Message Model

```javascript
{
  userId: String,       // ID of the message sender
  message: String,      // Message content
  roomId: String,       // ID of the room where message was sent
  timestamp: Date       // When the message was sent
}
```

### Room Model (In-Memory)

```javascript
{
  roomId: String,       // Unique room identifier
  users: Set,          // Set of users in the room
  messages: Array      // Array of messages in the room
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8001` |
| `MongoDb_URL` | MongoDB connection string | `mongodb+srv://...` |
| `NODE_ENV` | Environment mode | `development` |

### CORS Configuration

The backend is configured to allow cross-origin requests:

```javascript
app.use(cors()); // Allows all origins
```

For production, consider restricting to specific domains:

```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

## 🚀 Usage Examples

### Complete Frontend Integration

```javascript
class ChatService {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.websocket = null;
    this.messageHandlers = [];
  }

  // Connect to WebSocket server
  connect() {
    this.websocket = new WebSocket(this.serverUrl);
    
    this.websocket.onopen = () => {
      console.log('Connected to chat server');
    };
    
    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.websocket.onclose = () => {
      console.log('Disconnected from chat server');
    };
  }

  // Join a chat room
  joinRoom(username, roomId) {
    const message = {
      method: 'joinRoom',
      user: username,
      room: roomId
    };
    this.sendMessage(message);
  }

  // Send a message
  sendChatMessage(message, author, roomId) {
    const chatMessage = {
      method: 'send-message',
      message: message,
      author: author,
      room: roomId
    };
    this.sendMessage(chatMessage);
  }

  // Get room messages
  getRoomMessages(roomId) {
    const message = {
      method: 'get-messages',
      room: roomId
    };
    this.sendMessage(message);
  }

  // Send WebSocket message
  sendMessage(message) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  // Handle incoming messages
  handleMessage(data) {
    this.messageHandlers.forEach(handler => handler(data));
  }

  // Add message handler
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  // Disconnect
  disconnect() {
    if (this.websocket) {
      this.websocket.close();
    }
  }
}

// Usage example
const chatService = new ChatService('ws://localhost:8001');
chatService.connect();

chatService.onMessage((data) => {
  if (data.method === 'send-message') {
    console.log(`${data.author}: ${data.message}`);
  }
});

// Join room
chatService.joinRoom('john_doe', 'general');

// Send message
chatService.sendChatMessage('Hello, everyone!', 'john_doe', 'general');
```

## 🐛 Error Codes

### WebSocket Errors

| Error | Description | Solution |
|-------|-------------|----------|
| `ECONNREFUSED` | Connection refused | Check if server is running |
| `ENOTFOUND` | Host not found | Verify server URL |
| `ETIMEDOUT` | Connection timeout | Check network connectivity |

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Bad Request |
| `404` | Not Found |
| `409` | Conflict |
| `500` | Internal Server Error |

## 📈 Rate Limiting

Currently, the API doesn't implement rate limiting. For production use, consider implementing:

- Request rate limiting per IP
- WebSocket connection limits
- Message frequency limits

## 🔒 Security Considerations

### Current Security Measures

1. **Input Validation**: Basic validation on user inputs
2. **CORS Configuration**: Cross-origin request handling
3. **Error Handling**: Proper error responses

### Recommended Security Enhancements

1. **JWT Authentication**: Implement token-based authentication
2. **Password Hashing**: Hash passwords before storing
3. **Input Sanitization**: Sanitize all user inputs
4. **Rate Limiting**: Implement API rate limiting
5. **HTTPS/WSS**: Use secure protocols in production

## 📝 Changelog

### Version 1.0.0
- Initial WebSocket implementation
- Basic user management
- Room-based messaging
- Real-time communication

### Planned Features
- JWT authentication
- Message encryption
- File sharing
- User profiles
- Message reactions
- Read receipts 