# Deployment Guide

## Overview

This guide covers deploying the chat application using:
- **Render** - Backend (Node.js + WebSocket server)
- **Vercel** - Frontend (React application)

## Why This Stack?

**Render** handles the backend because:
- Supports WebSocket connections (Vercel doesn't - it's serverless with 10-60s execution limits, can't maintain persistent WebSocket connections)
- Free tier includes 750 hours/month
- Automatic HTTPS/WSS support
- Traditional server model required for stateful, long-running WebSocket server

**Vercel** handles the frontend because:
- Optimized for React applications
- Global CDN for fast loading
- Unlimited deployments
- Automatic SSL certificates

---

## Prerequisites

Before starting deployment:
1. GitHub account with your code pushed
2. MongoDB Atlas account (free tier) with database created
3. Render account (sign up at [render.com](https://render.com))
4. Vercel account (sign up at [vercel.com](https://vercel.com))

---

## Part 1: Backend Deployment (Render)

### Step 1: Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → Select **"Web Service"**
3. Connect your GitHub repository
4. Select the repository containing your chat application

### Step 2: Configure Service

**Basic Settings:**
- **Name:** `chat-backend` (or your preferred name)
- **Region:** Choose closest to your target users
- **Branch:** `main` (or your production branch)
- **Root Directory:** `Backend`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** Free

### Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

**Required Variables:**

| Variable | Value | Notes |
|----------|-------|-------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/chatapp` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `your-secure-random-string-here` | **Generate a secure random string** |
| `JWT_EXPIRES_IN` | `1h` | Token expiration time (optional, defaults to 1h) |
| `PORT` | `10000` | Render uses port 10000 (optional) |
| `NODE_ENV` | `production` | Sets production mode (optional) |
| `RENDER_EXTERNAL_URL` | `https://your-app-name.onrender.com` | **Add after first deployment** |

**Important Notes:**
- Replace `username:password@cluster` with your MongoDB credentials
- Generate a strong JWT_SECRET (use a password generator)
- The `RENDER_EXTERNAL_URL` enables keep-alive functionality
- You'll set `RENDER_EXTERNAL_URL` after deployment completes

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment to complete (2-5 minutes)
3. **Copy your backend URL:** `https://your-app-name.onrender.com`
4. Go back to **Environment Variables** and add `RENDER_EXTERNAL_URL` with your backend URL
5. Render will automatically redeploy with the new variable

### Step 5: Verify Backend

Test these endpoints in your browser:
- Health check: `https://your-app-name.onrender.com/health`
- Root endpoint: `https://your-app-name.onrender.com/`

Both should return JSON responses.

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Create Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Select the repository

### Step 2: Configure Build Settings

**Framework Preset:** Create React App (auto-detected)

**Build & Development Settings:**
- **Root Directory:** `FE`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `build` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### Step 3: Add Environment Variables

Before deploying, click **"Environment Variables"**

**Required Variables:**

| Variable | Value | Notes |
|----------|-------|-------|
| `REACT_APP_WS_URL` | `wss://your-app-name.onrender.com` | WebSocket URL (use **wss://** not ws://) |
| `REACT_APP_BACKEND_HTTP_URL` | `https://your-app-name.onrender.com` | HTTP API URL |

**Important:**
- Replace `your-app-name.onrender.com` with your actual Render backend URL
- Use `wss://` for WebSocket (secure WebSocket)
- Use `https://` for HTTP endpoints

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (1-3 minutes)
3. **Copy your frontend URL:** `https://your-app-name.vercel.app`

### Step 5: Verify Frontend

1. Open your Vercel URL in a browser
2. Wait 10-30 seconds for backend to wake up (first time only)
3. Try signing up and logging in
4. Test sending messages in a room

---

## Understanding Free Tier Behavior

### Render Backend

**Sleep Behavior:**
- Spins down after 15 minutes of inactivity
- Takes 10-30 seconds to wake up on first request
- Stays awake while users are active

**Keep-Alive System:**
- Backend pings itself every 14 minutes when `RENDER_EXTERNAL_URL` is set
- Frontend automatically wakes backend when users visit
- Users see loading state during wake-up

**Monthly Limits:**
- 750 hours/month (sufficient for 24/7 operation with some downtime)
- Unlimited HTTP requests
- Unlimited WebSocket connections

### Vercel Frontend

**Performance:**
- Instant loading via global CDN
- No sleep time
- Always available

**Monthly Limits:**
- Unlimited deployments
- 100GB bandwidth (sufficient for most apps)
- Unlimited requests

---

## Troubleshooting

### Backend Issues

**Problem:** Can't access backend URL
- **Check:** Deployment completed successfully in Render dashboard
- **Check:** Environment variables are set correctly
- **Check:** MongoDB connection string is valid

**Problem:** Health check returns error
- **Check:** MongoDB database allows connections from anywhere (0.0.0.0/0)
- **Check:** MongoDB credentials are correct
- **Check:** `MONGODB_URI` variable is properly formatted

**Problem:** Backend sleeps too often
- **Check:** `RENDER_EXTERNAL_URL` is set correctly
- **Check:** Keep-alive pings are working (check Render logs)

### Frontend Issues

**Problem:** WebSocket connection failed
- **Check:** `REACT_APP_WS_URL` uses `wss://` (not `ws://`)
- **Check:** Backend URL is correct
- **Check:** Backend is awake (visit health endpoint first)

**Problem:** API calls fail
- **Check:** `REACT_APP_BACKEND_HTTP_URL` uses `https://` (not `http://`)
- **Check:** Both frontend and backend are deployed
- **Check:** CORS is configured correctly (already set in code)

**Problem:** Long loading time
- **Expected behavior:** First visit after backend sleep takes 10-30 seconds
- **Solution:** Wait for wake-up, or keep backend active with usage

### MongoDB Issues

**Problem:** Connection timeout
- **Check:** Network Access in MongoDB Atlas allows all IPs (0.0.0.0/0)
- **Check:** Database user has read/write permissions
- **Check:** Connection string includes database name

**Problem:** Authentication failed
- **Check:** Username and password are correct
- **Check:** Special characters in password are URL-encoded
- **Check:** Database user exists in MongoDB Atlas

---

## Post-Deployment Checklist

- [ ] Backend health endpoint responds: `https://your-backend.onrender.com/health`
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] WebSocket connection establishes
- [ ] Messages send and receive successfully
- [ ] Room functionality works
- [ ] No console errors in browser
- [ ] Environment variables are set in both platforms
- [ ] MongoDB connection is stable

---

## Environment Variables Reference

### Backend (Render)

```env
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp
JWT_SECRET=your-secure-random-string-minimum-32-characters

# Optional
JWT_EXPIRES_IN=1h
PORT=10000
NODE_ENV=production

# Keep-Alive (add after first deployment)
RENDER_EXTERNAL_URL=https://your-app-name.onrender.com
```

### Frontend (Vercel)

```env
# Required
REACT_APP_WS_URL=wss://your-backend-url.onrender.com
REACT_APP_BACKEND_HTTP_URL=https://your-backend-url.onrender.com
```

---

## Next Steps After Deployment

1. **Test all features** thoroughly
2. **Monitor Render logs** for errors
3. **Check MongoDB Atlas metrics** for connection issues
4. **Share your app URL** with users
5. **Set up custom domain** (optional, requires DNS configuration)

---

## Upgrading to Paid Tiers

### When to Upgrade

Consider upgrading when:
- Backend sleep time affects user experience
- You need faster cold start times
- You exceed free tier limits
- You want custom domains
- You need better performance

### Render Pro ($7/month)

- No sleep time
- Persistent connections
- Faster startup
- Better performance
- Multiple instances

### Vercel Pro ($20/month)

- Higher bandwidth limits
- Priority support
- Advanced analytics
- Team collaboration

---

## Support Resources

- **Render Documentation:** [render.com/docs](https://render.com/docs)
- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas:** [mongodb.com/docs/atlas](https://mongodb.com/docs/atlas)
- **Project API Reference:** [API_REFERENCE.md](API_REFERENCE.md)

---

**Deployment Complete!** 🎉

Your chat application is now live and accessible worldwide.
