# Database Implementation Plan - Chat Application

## Current State Analysis

### ✅ What's Working
- WebSocket real-time messaging
- Room-based chat system
- User authentication routes (POST /api/auth/register, /api/auth/login)
- MongoDB connection setup (connection string exists but currently failing)

### ❌ What's Missing
- **Users**: Stored in-memory, lost on server restart
- **Messages**: Stored in-memory Map, lost on server restart
- **Sessions**: No JWT tokens, no persistent authentication
- **Password Security**: Plain text passwords (security risk)
- **Message History**: Can't retrieve old messages after reconnect

---

## Implementation Roadmap

### Phase 1: Database Setup & User Management ✅ COMPLETED
**Priority**: HIGH | **Complexity**: LOW | **Time**: 1-2 hours | **Status**: 100% Complete

#### Tasks:
1. ✅ **Fix MongoDB Connection** - COMPLETED
   - ✅ Update connection string with valid MongoDB Atlas credentials
   - ✅ Add proper error handling
   - ✅ Test connection on startup

2. ✅ **Implement Password Hashing** - COMPLETED
   - ✅ Install bcrypt: `npm install bcrypt`
   - ✅ Hash passwords before saving
   - ✅ Compare hashed passwords on login

3. ✅ **Add JWT Authentication** - COMPLETED
   - ✅ Install jsonwebtoken: `npm install jsonwebtoken`
   - ✅ Generate JWT tokens on login
   - ✅ Add authentication middleware for protected routes

4. ✅ **Update User Schema** - COMPLETED
   - ✅ Add fields: `createdAt`, `lastLogin`, `isActive`
   - ✅ Update lastLogin timestamp on each login
   - ✅ Ensure unique username and email

#### Why First?
- Foundation for all other features
- Security critical
- Easiest to implement
- No breaking changes to frontend

---

### Phase 2: Message Persistence
**Priority**: HIGH | **Complexity**: MEDIUM | **Time**: 2-3 hours

#### Tasks:
1. **Create Message Schema**
   ```javascript
   {
     messageId: String (unique),
     author: String (username),
     content: String,
     roomId: String,
     timestamp: Date,
     isEdited: Boolean,
     editedAt: Date
   }
   ```

2. **Save Messages to Database**
   - On 'send-message': Save to MongoDB
   - Return saved message to sender
   - Broadcast to room

3. **Load Message History**
   - On 'join-room': Fetch last 50 messages
   - Implement pagination for older messages
   - Send history to newly joined user

4. **Update WebSocket Handler**
   - Replace in-memory `roomMessages` Map
   - Query database for messages
   - Add message metadata (read receipts, reactions - optional)

#### Why Second?
- Requires working user authentication
- Core feature for chat persistence
- Improves user experience significantly

---

### Phase 3: Room/Channel Management
**Priority**: MEDIUM | **Complexity**: MEDIUM | **Time**: 2-3 hours

#### Tasks:
1. **Create Room Schema**
   ```javascript
   {
     roomId: String (unique),
     name: String,
     description: String,
     createdBy: String (userId),
     members: [String] (array of userIds),
     isPrivate: Boolean,
     createdAt: Date,
     lastActivity: Date
   }
   ```

2. **Room CRUD Operations**
   - Create room: POST /api/rooms
   - List rooms: GET /api/rooms
   - Join room: POST /api/rooms/:roomId/join
   - Leave room: POST /api/rooms/:roomId/leave
   - Get room details: GET /api/rooms/:roomId

3. **Room Permissions**
   - Private rooms: Only members can join
   - Public rooms: Anyone can join
   - Room admins: Can delete messages, kick users

4. **Update Frontend**
   - Room list component
   - Create room modal
   - Room settings page

#### Why Third?
- Depends on user and message systems
- Adds significant functionality
- Optional for MVP but valuable

---

### Phase 4: Account Management & Security (Future Enhancement)
**Priority**: LOW | **Complexity**: LOW | **Time**: 1-2 hours

#### Tasks:
1. **Implement isActive Field Management** 📝 *Note: Field already added, enforcement pending*
   - Prevent inactive users from logging in (add check in LoginUser function)
   - Add POST `/api/users/deactivate` endpoint (allow users to soft delete own account)
   - Add POST `/api/admin/users/:userId/toggle-active` endpoint (admin management)
   - Filter inactive users from GET `/api/users` endpoint
   
   **Use Cases:**
   - Soft account deletion (preserves chat history)
   - Account suspension/moderation
   - Compliance with data retention policies

2. **Password Reset Flow**
   - Email-based password reset tokens
   - Use plain `password` field for admin recovery (if user forgets password)

3. **Admin Features**
   - Role-based access control
   - User management dashboard

---

### Phase 5: Advanced Features (Optional)
**Priority**: LOW | **Complexity**: HIGH | **Time**: 4-6 hours

#### Features to Consider:
1. **User Presence**
   - Online/offline status
   - Last seen timestamp
   - Typing indicators

2. **Direct Messages**
   - One-on-one private chats
   - Conversation list
   - Unread message counts

3. **File Uploads**
   - Image sharing
   - File attachments
   - Cloud storage integration (AWS S3, Cloudinary)

4. **Search & Filters**
   - Search messages
   - Filter by date/user
   - Full-text search (MongoDB Atlas Search)

5. **Notifications**
   - Browser notifications
   - Email notifications
   - Push notifications (Firebase Cloud Messaging)

---

## Technology Stack (Industry Standard)

### Backend
- ✅ **Node.js + Express**: Already implemented
- ✅ **MongoDB**: Already configured (needs fixing)
- ⬜ **bcrypt**: For password hashing
- ⬜ **jsonwebtoken (JWT)**: For authentication tokens
- ⬜ **mongoose**: Already installed for MongoDB ODM
- Optional: **Redis** for session management and caching

### Frontend
- ✅ **React**: Already implemented
- ✅ **React Router**: Already implemented
- ✅ **WebSocket**: Already implemented
- Optional: **React Query** for data fetching
- Optional: **Zustand/Redux** for state management

### Deployment Options
1. **Easy & Free** (Recommended for learning)
   - Frontend: Vercel/Netlify
   - Backend: Render/Railway
   - Database: MongoDB Atlas (Free tier)

2. **Production Grade**
   - Frontend: AWS S3 + CloudFront
   - Backend: AWS EC2/ECS or Azure App Service
   - Database: MongoDB Atlas (Paid tier)
   - Load Balancer: AWS ELB

3. **Container Based**
   - Docker containers
   - Kubernetes (K8s)
   - Cloud providers: AWS EKS, Azure AKS, GCP GKE

---

## Database Schema Design

### Users Collection
```javascript
{
  _id: ObjectId,
  userId: Number (auto-increment),
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  createdAt: Date (default: now),
  lastLogin: Date,
  isActive: Boolean (default: true),
  avatar: String (URL, optional)
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  messageId: String (UUID, unique),
  author: String (username, required),
  authorId: Number (userId reference),
  content: String (required),
  roomId: String (required, indexed),
  timestamp: Date (default: now, indexed),
  isEdited: Boolean (default: false),
  editedAt: Date,
  isDeleted: Boolean (default: false),
  reactions: [{
    emoji: String,
    users: [String]
  }]
}
```

### Rooms Collection
```javascript
{
  _id: ObjectId,
  roomId: String (unique, required),
  name: String (required),
  description: String,
  createdBy: Number (userId),
  members: [Number] (array of userIds),
  admins: [Number] (array of userIds),
  isPrivate: Boolean (default: false),
  createdAt: Date (default: now),
  lastActivity: Date,
  settings: {
    allowFileUploads: Boolean,
    maxMembers: Number,
    retentionDays: Number
  }
}
```

---

## Security Considerations

### Must-Have
1. ✅ **HTTPS**: Use SSL/TLS in production
2. ⬜ **Password Hashing**: bcrypt with salt rounds ≥ 10
3. ⬜ **JWT Tokens**: Short expiry (1h), refresh tokens for longer sessions
4. ✅ **CORS**: Already configured
5. ⬜ **Rate Limiting**: Prevent brute force attacks
6. ⬜ **Input Validation**: Sanitize all user inputs
7. ⬜ **Environment Variables**: Store secrets in .env

### Nice-to-Have
- Two-factor authentication (2FA)
- OAuth integration (Google, GitHub login)
- IP-based rate limiting
- MongoDB field encryption for sensitive data
- SQL injection prevention (using Mongoose protects against this)

---

## Implementation Order (Recommended)

### Week 1: Foundation
1. ✅ Day 1: Fix MongoDB connection
2. ✅ Day 2: Implement bcrypt password hashing
3. ✅ Day 3: Add JWT authentication
4. ✅ Day 4: Test user registration/login with database

### Week 2: Core Features
1. ✅ Day 5: Create Message schema and save messages
2. ✅ Day 6: Load message history on room join
3. ✅ Day 7: Implement message pagination

### Week 3: Enhanced Features
1. ✅ Day 8: Create Room schema and CRUD operations
2. ✅ Day 9: Update frontend for room management
3. ✅ Day 10: Add room permissions

### Week 4: Polish & Deploy
1. ✅ Day 11-12: Testing and bug fixes
2. ✅ Day 13: Deploy to Render + MongoDB Atlas
3. ✅ Day 14: Monitor and optimize

---

## Environment Variables Needed

Create `.env` file in Backend folder:

```env
# Server
PORT=8001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/chatapp?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Optional: Email service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## Testing Strategy

### Unit Tests
- User registration/login logic
- Password hashing/verification
- JWT token generation/validation
- Message CRUD operations

### Integration Tests
- WebSocket connection flow
- Message sending and receiving
- Room join/leave functionality
- Authentication middleware

### Manual Testing Checklist
- [ ] User can register with valid credentials
- [ ] User cannot register with duplicate username/email
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong password
- [ ] Messages are saved to database
- [ ] Messages persist after server restart
- [ ] Room members can see each other's messages
- [ ] Users outside room cannot see messages
- [ ] JWT tokens expire correctly
- [ ] Refresh token flow works

---

## Next Steps

**Ready to start?** Reply with:
- "Let's start Phase 1" - I'll guide you through database setup
- "I need MongoDB setup help" - I'll help you create/fix MongoDB Atlas
- "Show me the code for [specific feature]" - I'll implement that feature

**Questions to clarify:**
1. Do you already have a MongoDB Atlas account?
2. Do you want to use free tier (good enough for learning)?
3. Should we start with Phase 1 (User Management)?
4. Any specific features you want prioritized?

Let me know and we'll tackle this step-by-step! 🚀
