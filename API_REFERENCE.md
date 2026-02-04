# API Reference - Chat Application

**Last Updated:** February 4, 2026  
**Version:** 2.0

Complete API documentation for the real-time chat application with WebSocket and REST endpoints.

---

## 📑 Table of Contents

1. [Authentication](#authentication)
2. [REST API Endpoints](#rest-api-endpoints)
3. [WebSocket API](#websocket-api)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)

---

## Authentication

### Overview

The application uses **JWT (JSON Web Token)** based authentication for both HTTP and WebSocket connections.

**Authentication Flow:**
1. User registers via `/api/auth/register` → Receives JWT token
2. User logs in via `/api/auth/login` → Receives JWT token
3. Token stored in `localStorage` by frontend
4. Token included in:
   - HTTP requests: `Authorization: Bearer <token>` header
   - WebSocket messages: `token` field in JSON payload

**CORS note (current implementation):** `Backend/index.js` only allows `Content-Type` in CORS `allowedHeaders`. Browser requests that include an `Authorization` header may be blocked unless CORS is updated.

**Security Features:**
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT tokens expire after 1 hour
- ✅ Password verification on login
- ✅ User existence validation

---

## REST API Endpoints

### Base URLs

- **Development:** `http://localhost:8001`
- **Production:** Your deployed backend URL

---

### User Authentication

**Note on route aliases:** The backend also exposes `/api/users/register` and `/api/users/login` as aliases to the same handlers. The recommended paths are `/api/auth/register` and `/api/auth/login`.

#### Register New User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `409` - Username or email already exists
- `500` - Server error

---

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400` - Missing username or password
- `404` - User not found
- `401` - Invalid password
- `500` - Server error

---

#### Get Room Users

```http
GET /api/users/room/:roomId/users
```

**URL Parameters:**
- `roomId` (required): The room identifier

**Use Case:** Get list of users currently active in a specific room (used by Slider component)

**Response (200):**
```json
{
  "users": [
    {
      "username": "johndoe",
      "id": "johndoe"
    },
    {
      "username": "janesmith",
      "id": "janesmith"
    }
  ]
}
```

**Response (404) - Room Not Found:**
```json
{
  "message": "Room not found",
  "users": []
}
```

**Error Responses:**
- `404` - Room not found or no users in room
- `500` - Server error

**Note:** This endpoint provides HTTP access to room users. The UsersList panel uses WebSocket `room-users-update` events for real-time updates.

---

### Message Endpoints

#### Get Message History (Paginated)

```http
GET /api/messages/:roomId?page=1&limit=50
Authorization: Bearer <token> (optional)
```

**Query Parameters:**
- `page` (optional): Page number, default: 1
- `limit` (optional): Messages per page, default: 50, max: 100
- `before` (optional): Get messages before this ISO timestamp
- `after` (optional): Get messages after this ISO timestamp

**Response (200):**
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
      "timestamp": "2026-02-04T10:30:00.000Z",
      "isEdited": false,
      "editedAt": null,
      "formattedTime": "10:30 AM"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalMessages": 247,
    "limit": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### Get Latest Messages

```http
GET /api/messages/:roomId/latest?limit=50
Authorization: Bearer <token> (optional)
```

**Use Case:** Initial room load - get the most recent messages

**Response (200):**
```json
{
  "success": true,
  "roomId": "room123",
  "messages": [...],
  "count": 50
}
```

---

#### Get Message Count

```http
GET /api/messages/:roomId/count
Authorization: Bearer <token> (optional)
```

**Response (200):**
```json
{
  "success": true,
  "roomId": "room123",
  "count": 247
}
```

---

#### Send Message (REST)

```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello from REST API!",
  "roomId": "room123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": {
    "_id": "507f1f77bcf86cd799439011",
    "messageId": "550e8400-e29b-41d4-a716-446655440000",
    "author": "johndoe",
    "authorId": 1001,
    "content": "Hello from REST API!",
    "roomId": "room123",
    "timestamp": "2026-02-04T10:30:00.000Z",
    "isEdited": false,
    "editedAt": null,
    "isDeleted": false,
    "createdAt": "2026-02-04T10:30:00.000Z",
    "updatedAt": "2026-02-04T10:30:00.000Z",
    "__v": 0
  }
}
```

**Note:** WebSocket is preferred for real-time messaging

---

### System Endpoints

#### Health Check

```http
GET /health
```

**Response (200):**
```json
{
  "status": "OK",
  "server": "running",
  "timestamp": "2026-02-04T10:30:00.000Z",
  "uptime": 123.45,
  "connections": 3,
  "database": {
    "connected": true,
    "readyState": 1,
    "host": "cluster0.mongodb.net",
    "name": "chatapp"
  }
}
```

---

## WebSocket API

### Connection

**URL:** 
- Development: `ws://localhost:8001`
- Production: `wss://your-backend-url.com`

**Protocol:** WebSocket

### Connection Setup

```javascript
const ws = new WebSocket('ws://localhost:8001');

ws.onopen = () => {
  console.log('Connected to chat server');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle incoming messages
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from server');
};
```

---

### Message Format

All WebSocket messages are JSON objects with a `method` field.

Unlike some APIs that wrap payloads under a `data` key, this server expects **method-specific fields at the top level** (for example: `room`, `token`, `message`).

```json
{
  "method": "action-name"
}
```

---

### WebSocket Methods

#### 1. Join Room

**Method:** `join-room`

**Client Sends:**
```json
{
  "method": "join-room",
  "username": "johndoe",
  "room": "room123",
  "token": "jwt-token-here"
}
```

**Note:** The server authenticates using `token`. The `username` field is accepted for client convenience but is not used for authentication.

**Server Responds:**
```json
{
  "method": "message-history",
  "roomId": "room123",
  "messages": [
    {
      "messageId": "uuid",
      "author": "alice",
      "message": "Welcome!",
      "timestamp": "2026-02-04T10:00:00.000Z",
      "formattedTime": "10:00 AM"
    }
  ],
  "count": 50
}
```

**Additional Broadcasts:**
- `room-users-update`: Updated list of users in the room
- `user-presence`: Notification that user joined

**Default:** Loads last 50 messages on join

---

#### 2. Leave Room

**Method:** `leave-room`

**Client Sends:**
```json
{
  "method": "leave-room",
  "username": "johndoe",
  "room": "room123",
  "token": "jwt-token-here"
}
```

**Server Broadcasts:**
```json
{
  "method": "user-presence",
  "user": "johndoe",
  "status": "offline",
  "roomId": "room123"
}
```

---

#### 3. Send Message

**Method:** `send-message`

**Client Sends:**
```json
{
  "method": "send-message",
  "message": "Hello everyone!",
  "room": "room123",
  "token": "jwt-token-here"
}
```

**Server Broadcasts to All in Room:**
```json
{
  "method": "new-message",
  "author": "johndoe",
  "message": "Hello everyone!",
  "messageId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-02-04T10:30:00.000Z",
  "formattedTime": "10:30 AM"
}
```

**Backend Process:**
1. Validates token and message
2. Saves message to MongoDB
3. Broadcasts to all users in the room
4. Includes auto-generated UUID and timestamp

---

#### 4. Get Messages (Pagination)

**Method:** `get-messages` *(legacy / not wired for client replies)*

This method exists server-side but is **not sent back to the requesting client** in the current implementation. For message pagination/history, use the REST endpoints:

- `GET /api/messages/:roomId`
- `GET /api/messages/:roomId/latest`

---

#### 5. Typing Indicator

**Method:** `typing` / `stop-typing`

**Client Sends (Start Typing):**
```json
{
  "method": "typing",
  "room": "room123",
  "token": "jwt-token-here"
}
```

**Client Sends (Stop Typing):**
```json
{
  "method": "stop-typing",
  "room": "room123",
  "token": "jwt-token-here"
}
```

**Server Broadcasts:**
```json
{
  "method": "typing",
  "user": "johndoe",
  "roomId": "room123",
  "isTyping": true
}
```

---

### WebSocket Events (Received from Server)

#### Room Users Update

```json
{
  "method": "room-users-update",
  "roomId": "room123",
  "users": ["johndoe", "janesmith", "alice"]
}
```

**Triggered:** When user joins/leaves room

---

#### User Presence

```json
{
  "method": "user-presence",
  "user": "johndoe",
  "status": "online",
  "roomId": "room123"
}
```

**Status Values:**
- `online` - User joined the room
- `offline` - User left the room

---

#### Room Full Error

```json
{
  "method": "room-full",
  "roomId": "room123",
  "maxUsers": 100,
  "message": "Room room123 is full. Max users: 100."
}
```

**Triggered:** When room reaches 100 users

---

#### Auth Error

```json
{
  "method": "auth-error",
  "message": "Authentication required to join rooms."
}
```

**Triggered:** Invalid or missing JWT token

---

## Data Models

### User Schema

```javascript
{
  _id: ObjectId,
  userId: Number,              // Monotonic counter (starts at 1)
  username: String,            // Unique, required
  email: String,               // Unique, required
  password: String,            // Plain text (legacy; auth uses hashedPassword)
  hashedPassword: String,      // Bcrypt hashed for authentication
  createdAt: Date,             // Auto-generated
  updatedAt: Date,             // Auto-generated
  lastLogin: Date,             // Updated on each login
  isActive: Boolean            // Default: true
}
```

**Indexes:**
- Unique on `username`
- Unique on `email`
- Index on `userId`

---

### Message Schema

```javascript
{
  _id: ObjectId,
  messageId: String,           // UUID v4 (unique)
  author: String,              // Username
  authorId: Number,            // User ID reference
  content: String,             // Message text
  roomId: String,              // Room identifier (indexed)
  timestamp: Date,             // Auto-generated (indexed)
  isEdited: Boolean,           // Default: false
  editedAt: Date,              // Null if not edited
  isDeleted: Boolean,          // Soft delete, default: false
  createdAt: Date,             // Mongoose auto-managed
  updatedAt: Date              // Mongoose auto-managed
}
```

**Indexes:**
- Compound: `{ roomId: 1, timestamp: -1 }`
- Unique: `messageId`

---

## Error Handling

### HTTP Status Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| `200` | OK | Successful GET request |
| `201` | Created | Successful POST (resource created) |
| `400` | Bad Request | Missing required fields, invalid data |
| `401` | Unauthorized | Invalid/missing JWT token |
| `404` | Not Found | User/resource doesn't exist |
| `409` | Conflict | Duplicate username/email |
| `500` | Internal Server Error | Database errors, server issues |

---

### WebSocket Errors

**Connection Errors:**
```javascript
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  // ECONNREFUSED: Server not running
  // ETIMEDOUT: Network timeout
  // ENOTFOUND: Invalid server URL
};
```

**Message Parsing Errors:**
```javascript
try {
  const data = JSON.parse(event.data);
  // Process message
} catch (error) {
  console.error('Invalid JSON from server');
}
```

---

### Common Error Responses

**Authentication Required:**
```json
{
  "error": "No authorization token provided"
}
```

**Invalid Token:**
```json
{
  "error": "Invalid or expired token"
}
```

**Missing Fields:**
```json
{
  "error": "Username and password are required"
}
```

**User Not Found:**
```json
{
  "error": "User not found"
}
```

---

## Changelog

### Version 2.0 (Current)
- ✅ JWT authentication for WebSocket
- ✅ Message persistence with MongoDB
- ✅ User presence tracking
- ✅ Typing indicators
- ✅ Room capacity limits (100 users)
- ✅ Message pagination
- ✅ Password hashing

### Version 1.0
- Basic WebSocket messaging
- In-memory message storage
- Simple user management

---

## Support & Contact

For issues or questions:
- Check the [README.md](readme.md) for setup instructions
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guides
- Open an issue in the project repository

---

**Documentation Last Updated:** February 4, 2026  
**API Version:** 2.0  
**Status:** ✅ Production Ready
