# ChatApplication

A real-time chat application built with React, Node.js, Express, WebSockets, and MongoDB.

## 🚀 Features

- Real-time messaging with WebSocket connections
- Multiple chat rooms support
- User registration and login
- Message history persistence
- Responsive design with Bootstrap
- Theme support (light/dark mode)

## 🏗️ Architecture

### Frontend (React)
- **Location**: `/FE` directory
- **Port**: 3000 (default)
- **Tech Stack**: React, React Router, Bootstrap, WebSocket

### Backend (Node.js)
- **Location**: `/BE` directory  
- **Port**: 8001 (default)
- **Tech Stack**: Express, WebSocket (ws), MongoDB, Mongoose

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or cloud service like MongoDB Atlas)
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ChatApplication
```

### 2. Backend Setup
```bash
cd BE
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your MongoDB connection string
# Example: MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chat_app
```

### 3. Frontend Setup
```bash
cd ../FE
npm install
```

## 🔧 Configuration

### Backend Environment Variables (BE/.env)
```bash
# MongoDB connection string
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Server port (default: 8001)
PORT=8001

# Frontend URL for CORS (default: http://localhost:3000)
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables (FE/.env) - Optional
```bash
# Backend API URL (default: http://localhost:8001)
REACT_APP_BASE_URL=http://localhost:8001

# WebSocket URL (default: ws://localhost:8001)
REACT_APP_WS_URL=ws://localhost:8001
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd BE
npm start
# Server will start on http://localhost:8001
```

### Start Frontend Development Server
```bash
cd FE
npm start
# Application will open at http://localhost:3000
```

### Production Build (Frontend)
```bash
cd FE
npm run build
# Creates optimized production build in /build directory
```

## 📁 Project Structure

```
ChatApplication/
├── BE/                     # Backend (Node.js/Express)
│   ├── config/            # Database configuration
│   ├── models/            # MongoDB models (User, Message)
│   ├── routes/            # API routes
│   ├── UserController/    # User management logic
│   ├── Websocket/         # WebSocket handling
│   ├── index.js           # Main server file
│   ├── .env.example       # Environment template
│   └── package.json       # Dependencies
├── FE/                     # Frontend (React)
│   ├── public/            # Static files
│   ├── src/
│   │   ├── Components/    # React components
│   │   ├── Styles/        # CSS files
│   │   ├── config.js      # Frontend configuration
│   │   └── api.js         # API utility functions
│   └── package.json       # Dependencies
└── DEBUG_REPORT.md        # Comprehensive debugging report
```

## 🔒 Security Notes

### ✅ Fixed Security Issues
- All backend security vulnerabilities resolved
- Frontend vulnerabilities reduced from 40 to 9
- Environment variable protection implemented
- Database credential security improved

### ⚠️ Remaining Considerations
- JWT authentication not yet implemented
- Some frontend dependencies need updating (requires breaking changes)
- Rate limiting not implemented
- HTTPS/WSS not configured

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd BE && npm test

# Frontend tests  
cd FE && npm test
```

### Security Audit
```bash
# Check for vulnerabilities
npm audit

# Fix fixable vulnerabilities
npm audit fix
```

## 🚧 Development Status

### ✅ Working Features
- Backend server starts successfully
- Frontend builds and runs without errors
- WebSocket infrastructure in place
- User registration/login API endpoints
- Message persistence with MongoDB

### 🔄 In Progress / Needs Testing
- Real-time messaging (requires MongoDB connection)
- User authentication flow
- Room-based chat functionality
- Message history loading

## 📝 API Endpoints

### User Routes
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/all` - Get all users
- `PUT /api/users/:userId` - Update user

### Message Routes
- `GET /api/messages/:roomId` - Get messages for a room

### WebSocket Events
- `join-room` - Join a chat room
- `send-message` - Send a message
- `new-message` - Receive a message
- `room-users` - Update room user list

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Known Issues

See [DEBUG_REPORT.md](DEBUG_REPORT.md) for a comprehensive list of identified issues and their resolution status.

## 📞 Support

For issues, questions, or contributions, please open an issue on the GitHub repository.