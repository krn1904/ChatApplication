# Real-Time Chat Application

A modern, real-time chat application built with React and Node.js, featuring WebSocket-based communication, room-based messaging, and user management.

## 🚀 Live Demo

- **Frontend**: [Your Render Frontend URL]
- **Backend**: [Your Render Backend URL]

## ✨ Features

- **Real-time Messaging**: Instant message delivery using WebSocket connections
- **Room-based Chat**: Join different chat rooms for organized conversations
- **User Management**: Simple username-based authentication
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Live Connection Status**: Real-time connection monitoring
- **Message History**: View previous messages in each room

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - UI framework
- **React Router DOM 6.15.0** - Client-side routing
- **Bootstrap 5.3.1** - CSS framework
- **React Bootstrap 2.8.0** - Bootstrap components for React
- **Native WebSocket API** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js 4.18.2** - Web framework
- **WebSocket (ws) 8.16.0** - WebSocket server implementation
- **MongoDB 5.8.0** - Database
- **Mongoose 7.4.3** - MongoDB ODM
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
ChatApplication/
├── Backend/                 # Backend server
│   ├── index.js            # Main server file
│   ├── config.js           # Configuration settings
│   ├── package.json        # Backend dependencies
│   ├── Tables/             # Database models
│   │   ├── User.js         # User model
│   │   └── Message.js      # Message model
│   ├── UserController/     # User management
│   │   └── Users.js        # User CRUD operations
│   └── Websocket/          # WebSocket handling
│       └── ws.js           # WebSocket message handlers
├── FE/                     # Frontend application
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── api.js          # API service layer
│   │   ├── config.js       # Frontend configuration
│   │   ├── Components/     # React components
│   │   │   ├── LoginPage/  # Login/join room component
│   │   │   ├── Main/       # Main chat interface
│   │   │   └── TopnavBar/  # Navigation component
│   │   └── Styles/         # CSS stylesheets
│   └── package.json        # Frontend dependencies
├── README.md               # Main documentation
├── DEPLOYMENT.md           # Deployment guide
├── API.md                  # API documentation
└── package.json            # Root package.json
```

**Note:** The project structure has been cleaned up to remove redundant directories and ensure a clear separation between frontend and backend components.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** database (local or cloud)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/chat-application.git
   cd chat-application
   ```

2. **Setup Backend**
   ```bash
   cd Backend
   npm install
   ```

3. **Configure Backend Environment**
   Create a `.env` file in the `Backend` directory:
   ```env
   PORT=8001
   MongoDb_URL=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/chat-app
   NODE_ENV=development
   ```

4. **Start Backend Server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

5. **Setup Frontend** (in a new terminal)
   ```bash
   cd FE
   npm install
   ```

6. **Configure Frontend Environment**
   Create a `.env` file in the `FE` directory:
   ```env
   REACT_APP_BASE_URL=ws://localhost:8001
   REACT_APP_PORT=
   ```

7. **Start Frontend Development Server**
   ```bash
   npm start
   ```

8. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8001

## 🌐 Production Deployment

### Deploy to Render.com

#### Backend Deployment
1. **Create Web Service** on Render
2. **Connect GitHub repository**
3. **Configure settings:**
   - **Name**: `chat-app-backend`
   - **Root Directory**: `Backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Environment Variables:**
   ```env
   PORT=10000
   MongoDb_URL=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/chat-app
   NODE_ENV=production
   ```

#### Frontend Deployment
1. **Create Static Site** on Render
2. **Connect GitHub repository**
3. **Configure settings:**
   - **Name**: `chat-app-frontend`
   - **Root Directory**: `FE`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. **Environment Variables:**
   ```env
   REACT_APP_BASE_URL=wss://your-backend-service-name.onrender.com
   REACT_APP_PORT=
   ```

## 📖 Usage Guide

### Joining a Chat Room

1. **Open the application** in your browser
2. **Enter your username** in the first input field
3. **Enter a room ID** in the second input field
4. **Click "Join Room"** to enter the chat

### Sending Messages

1. **Type your message** in the input field at the bottom
2. **Press Enter** or click the send button
3. **Messages appear instantly** for all users in the same room

### Features

- **Real-time Updates**: Messages appear instantly without page refresh
- **Room Isolation**: Messages are only visible to users in the same room
- **Connection Status**: The app shows your WebSocket connection status
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🔧 Configuration

### Backend Configuration (`Backend/config.js`)

```javascript
const config = {
  MongoDb_URL: process.env.MongoDb_URL || 'your-mongodb-connection-string'
};
```

### Frontend Configuration (`FE/src/config.js`)

```javascript
const config = {
  port: process.env.REACT_APP_PORT || "",
  BaseURL: process.env.REACT_APP_BASE_URL || "ws://localhost:8001"
};
```

## 🗄️ Database Schema

### User Model
```javascript
{
  email: String,
  password: String,
  name: String,
  userId: Number
}
```

### Message Model
```javascript
{
  userId: String,
  message: String,
  roomId: String,
  timestamp: Date
}
```

## 🔌 API Endpoints

### WebSocket Events

| Event | Description | Payload |
|-------|-------------|---------|
| `joinRoom` | Join a chat room | `{user: string, room: string}` |
| `send-message` | Send a message | `{message: string, author: string, room: string}` |
| `get-messages` | Get room messages | `{room: string}` |

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/createUser` | Create a new user |
| GET | `/users` | Get all users |

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if backend server is running
   - Verify WebSocket URL in frontend config
   - Ensure CORS is properly configured

2. **Messages Not Appearing**
   - Verify you're in the correct room
   - Check browser console for errors
   - Ensure WebSocket connection is established

3. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check network connectivity
   - Ensure database is accessible

### Development Commands

```bash
# Backend
npm start          # Start production server
npm run dev        # Start development server with auto-reload

# Frontend
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.