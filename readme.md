# ChatApplication

This is a real-time chat app with a React frontend and a Node/Express backend. It uses WebSockets for live messaging and MongoDB for user accounts and message history.

## What it does

- Sign up and log in (JWT-based auth)
- Join a room by ID and chat in real time
- Get recent message history when you join a room
- See who is currently in the room (updates live)
- Typing indicator + join/leave presence messages
- Light/dark theme toggle

## How it works (high level)

- **HTTP** is used for authentication and message history endpoints.
- **WebSocket** is used for joining rooms and sending/receiving messages.
- The WebSocket events are authenticated using the same **JWT token** you get on login/signup (the frontend stores it in `localStorage`).

## Tech stack

**Frontend**
- React (Create React App)
- React Router
- Bootstrap + React Bootstrap

**Backend**
- Node.js + Express
- `ws` (WebSocket server)
- MongoDB + Mongoose
- bcrypt + JWT

## Project layout

```
ChatApplication/
  Backend/                 Node/Express + WebSocket server
  FE/                      React frontend
  API_REFERENCE.md         Complete API documentation (REST + WebSocket)
  DEPLOYMENT.md            Render/Vercel deployment guide
  README.md / readme.md    Project overview (duplicate files)
```

## Local setup

### Prereqs
- Node.js 16+ (18+ is fine)
- A MongoDB connection string (Atlas or local MongoDB)

### 1) Backend

```bash
cd Backend
npm install
```

Copy `Backend/.env.example` to `Backend/.env` and update the values.

Minimum you should set:
```env
PORT=8001
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret
```

Start the server:
```bash
# dev (auto reload)
npm run dev

# or production style
npm start
```

The backend listens on `http://localhost:8001` and the WebSocket server uses the same host/port: `ws://localhost:8001`.

### 2) Frontend

```bash
cd FE
npm install
```

Create `FE/.env.local`:
```env
REACT_APP_WS_URL=ws://localhost:8001
REACT_APP_BACKEND_HTTP_URL=http://localhost:8001
```

Start the frontend:
```bash
npm start
```

Open `http://localhost:3000`.

## Using the app

1. Sign up (email + username + password)
2. Log in (username + password) and enter a room ID
3. Start chatting

## Environment variables

### Backend (`Backend/.env`)
- `PORT` (default: `8001`)
- `MONGODB_URI` (preferred) or `MongoDb_URL` (older name, still supported)
- `JWT_SECRET` (used for both HTTP and WebSocket auth)
- `JWT_EXPIRES_IN` (default: `1h`)
- `FRONTEND_URL` (currently unused by `Backend/index.js`)
- `RENDER_EXTERNAL_URL` (optional; enables the keep-alive ping on Render free tier)

**CORS note (current implementation):** `Backend/index.js` allows `origin: '*'` and only `Content-Type` in `allowedHeaders`. If you call protected HTTP endpoints from the browser using `Authorization: Bearer <token>`, you may need to add `Authorization` to CORS `allowedHeaders`.

### Frontend (`FE/.env.local` / Vercel env)
- `REACT_APP_WS_URL` (WebSocket URL, e.g. `ws://localhost:8001` or `wss://<render-app>.onrender.com`)
- `REACT_APP_BACKEND_HTTP_URL` (HTTP base URL, e.g. `http://localhost:8001` or `https://<render-app>.onrender.com`)
- `REACT_APP_BASE_URL` / `REACT_APP_PORT` (older vars; kept for compatibility with existing config)

## Documentation

For complete API documentation including all REST and WebSocket endpoints, authentication, and usage examples:

- **[API_REFERENCE.md](API_REFERENCE.md)** - Complete API documentation

For deployment instructions:

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deploy to Render/Vercel
