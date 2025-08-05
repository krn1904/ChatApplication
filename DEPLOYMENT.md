# Deployment Guide

This guide provides detailed instructions for deploying the Chat Application to various hosting platforms.

## 🚀 Quick Deployment Options

| Platform | Frontend | Backend | WebSocket Support | Free Tier |
|----------|----------|---------|-------------------|-----------|
| **Render** | ✅ | ✅ | ✅ | ✅ |
| **Railway** | ✅ | ✅ | ✅ | ❌ |
| **Heroku** | ✅ | ✅ | ✅ | ❌ |
| **Vercel** | ✅ | ❌ | ❌ | ✅ |
| **Netlify** | ✅ | ❌ | ❌ | ✅ |

## 🌐 Render.com (Recommended)

### Prerequisites
- GitHub account
- Render account
- MongoDB database (MongoDB Atlas recommended)

### Step 1: Prepare Your Repository

1. **Ensure your code is pushed to GitHub**
2. **Verify environment variables are properly configured**
3. **Check that all dependencies are in package.json**

### Step 2: Deploy Backend

1. **Go to [render.com](https://render.com) and sign in**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**

   ```
   Name: chat-app-backend
   Root Directory: Backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

5. **Add Environment Variables:**

   ```env
   PORT=10000
   MongoDb_URL=mongodb+srv://username:password@cluster.mongodb.net/chat-app
   NODE_ENV=production
   ```

6. **Click "Create Web Service"**
7. **Wait for deployment to complete**
8. **Note your backend URL** (e.g., `https://chat-app-backend.onrender.com`)

### Step 3: Deploy Frontend

1. **Click "New +" → "Static Site"**
2. **Connect your GitHub repository**
3. **Configure the service:**

   ```
   Name: chat-app-frontend
   Root Directory: FE
   Build Command: npm install && npm run build
   Publish Directory: build
   ```

4. **Add Environment Variables:**

   ```env
   REACT_APP_BASE_URL=wss://chat-app-backend.onrender.com
   REACT_APP_PORT=
   ```

5. **Click "Create Static Site"**
6. **Wait for deployment to complete**

### Step 4: Test Your Deployment

1. **Open your frontend URL**
2. **Test WebSocket connection**
3. **Send test messages**
4. **Verify room functionality**


## ⚡ Vercel (Frontend Only)

### Limitations
- **No WebSocket support** for backend
- **Requires separate backend hosting**

### Frontend Deployment

1. **Go to [vercel.com](https://vercel.com)**
2. **Import your GitHub repository**
3. **Configure settings:**
   ```
   Framework Preset: Create React App
   Root Directory: FE
   Build Command: npm run build
   Output Directory: build
   ```

4. **Add environment variables:**
   ```env
   REACT_APP_BASE_URL=wss://your-backend-url.com
   ```

5. **Deploy**

### Backend Alternatives for Vercel
- Deploy backend on Render/Railway
- Use external WebSocket services (Pusher, Ably)
- Convert to REST API with polling

## 🎯 Netlify (Frontend Only)

### Limitations
- **No WebSocket support** for backend
- **Requires separate backend hosting**

### Frontend Deployment

1. **Go to [netlify.com](https://netlify.com)**
2. **Click "New site from Git"**
3. **Connect your GitHub repository**
4. **Configure build settings:**
   ```
   Base directory: FE
   Build command: npm run build
   Publish directory: build
   ```

5. **Add environment variables**
6. **Deploy**

## 🔧 Environment Variables Reference

### Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8001` |
| `MongoDb_URL` | MongoDB connection string | `mongodb+srv://...` |
| `NODE_ENV` | Environment mode | `production` |

### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_BASE_URL` | WebSocket server URL | `wss://backend.onrender.com` |
| `REACT_APP_PORT` | Server port (optional) | `` |

## 🐛 Common Deployment Issues

### WebSocket Connection Failed

**Symptoms:**
- Frontend can't connect to backend
- Console shows WebSocket errors

**Solutions:**
1. **Check URL format:** Use `wss://` for production
2. **Verify CORS settings:** Ensure backend allows frontend domain
3. **Check firewall settings:** Ensure port is open
4. **Verify environment variables:** Check `REACT_APP_BASE_URL`

### Build Failures

**Symptoms:**
- Deployment fails during build
- Missing dependencies

**Solutions:**
1. **Check package.json:** Ensure all dependencies are listed
2. **Verify Node.js version:** Use compatible version
3. **Check build commands:** Ensure they're correct
4. **Review build logs:** Look for specific error messages

### Database Connection Issues

**Symptoms:**
- Backend can't connect to MongoDB
- User creation fails

**Solutions:**
1. **Check connection string:** Verify MongoDB URL format
2. **Network access:** Ensure MongoDB allows connections from deployment IP
3. **Credentials:** Verify username/password
4. **Database name:** Ensure database exists


## 🎉 Post-Deployment Checklist

- [ ] WebSocket connection works
- [ ] Messages send and receive correctly
- [ ] User authentication works
- [ ] Database operations work
- [ ] Responsive design on mobile
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Security measures are in place
- [ ] Monitoring is set up
- [ ] Documentation is updated

## 🆘 Getting Help

If you encounter issues during deployment:

1. **Check platform documentation**
2. **Review build logs carefully**
3. **Test locally first**
4. **Ask in community forums**
5. **Create detailed issue reports**

Happy deploying! 🚀 