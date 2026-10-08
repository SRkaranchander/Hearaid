# Quick Start Guide - Community Feature with Backend

## 🚀 Setup Instructions

### Step 1: Install MongoDB

**Option A: Local MongoDB (Recommended for Development)**
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a Windows service automatically

**Option B: MongoDB Atlas (Cloud - Free)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `server/.env` with your connection string

### Step 2: Install Dependencies

Open terminal in project root:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies (if not already done)
cd ../client
npm install socket.io-client
```

### Step 3: Seed Database

```bash
cd server
npm run seed
```
This creates 5 test users in the database.

### Step 4: Start Backend Server

```bash
cd server
npm start
```
You should see:
```
Server running on port 5000
MongoDB Connected
```

### Step 5: Start Frontend

Open a NEW terminal:
```bash
cd client
npm start
```

### Step 6: Test the Community Feature

1. Open browser: http://localhost:3000
2. Click "Community" in navbar
3. Click on any user from the list
4. Type a message and click "Send"
5. Open another browser window (incognito) to test real-time chat

## ✅ Verification Checklist

- [ ] MongoDB is running (check Windows Services or Atlas dashboard)
- [ ] Backend server running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can see 5 users in Community page
- [ ] Can send messages
- [ ] Messages appear in real-time

## 🔧 Troubleshooting

### MongoDB Connection Failed
**Error:** `MongooseServerSelectionError`
**Solution:** 
- Check if MongoDB service is running (Windows Services)
- Or verify MongoDB Atlas connection string in `.env`

### Port 5000 Already in Use
**Solution:**
1. Change PORT in `server/.env` to 5001
2. Update `client/src/Config/config.js`:
   ```javascript
   export const communityURL = 'http://localhost:5001/api'
   ```

### Socket.io Connection Error
**Solution:**
- Ensure backend is running first
- Check browser console for errors
- Verify CORS settings in `server/server.js`

### No Users Showing
**Solution:**
```bash
cd server
npm run seed
```

## 📁 Project Structure

```
AI-Powered-Sign-Language/
├── client/
│   ├── src/
│   │   ├── Pages/
│   │   │   └── Community.js          # Main community page
│   │   ├── Components/
│   │   │   └── Community/
│   │   │       ├── UserCard.js       # User list item
│   │   │       └── ChatBox.js        # Chat interface
│   │   └── Config/
│   │       └── config.js             # API URLs
│   └── package.json
│
└── server/
    ├── models/
    │   ├── User.js                   # User schema
    │   └── Message.js                # Message schema
    ├── routes/
    │   ├── users.js                  # User API routes
    │   └── messages.js               # Message API routes
    ├── config/
    │   └── db.js                     # Database connection
    ├── server.js                     # Main server file
    ├── seed.js                       # Database seeder
    └── .env                          # Environment variables
```

## 🎯 Features Implemented

### Backend
✅ Express REST API
✅ MongoDB database with Mongoose
✅ User management (CRUD)
✅ Message storage and retrieval
✅ Socket.io for real-time messaging
✅ CORS enabled
✅ Environment configuration

### Frontend
✅ User list with online/offline status
✅ Real-time chat interface
✅ Socket.io client integration
✅ Message history
✅ Responsive design
✅ Auto-scroll to latest messages

## 🔐 Environment Variables

**server/.env:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/HearAid
```

**For MongoDB Atlas:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/HearAid
```

## 📝 API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PATCH /api/users/:id/status` - Update status

### Messages
- `GET /api/messages/:userId1/:userId2` - Get conversation
- `POST /api/messages` - Send message

### Socket.io Events
- `join` - Join chat room
- `sendMessage` - Send message
- `receiveMessage` - Receive message

## 🎉 Success!

If everything is working:
1. You can see 5 users in the Community page
2. Clicking a user opens the chat
3. Messages send and appear instantly
4. Real-time updates work across browser tabs

Need help? Check the troubleshooting section above!
