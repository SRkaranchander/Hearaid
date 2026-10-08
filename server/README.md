# HearAid Backend Server

## Features
- RESTful API for users and messages
- Real-time chat with Socket.io
- MongoDB database integration
- CORS enabled for frontend communication

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)

## Installation

### 1. Install MongoDB
**Windows:**
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB service
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### 2. Install Dependencies
```bash
cd server
npm install
```

### 3. Configure Environment
Edit `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/HearAid
```

For MongoDB Atlas, use:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/HearAid
```

### 4. Seed Database
```bash
npm run seed
```
This creates 5 initial users.

### 5. Start Server
```bash
npm start
```
Or for development with auto-restart:
```bash
npm run dev
```

Server runs on http://localhost:5000

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PATCH /api/users/:id/status` - Update user status

### Messages
- `GET /api/messages/:userId` - Get all messages for a user
- `GET /api/messages/:userId1/:userId2` - Get conversation between two users
- `POST /api/messages` - Send a message

## Socket.io Events
- `join` - User joins with their ID
- `sendMessage` - Send message to another user
- `receiveMessage` - Receive message from another user

## Frontend Setup

### 1. Install Socket.io Client
```bash
cd client
npm install socket.io-client
```

### 2. Start Frontend
```bash
npm start
```

Frontend runs on http://localhost:3000

## Testing
1. Start MongoDB
2. Start backend server: `cd server && npm start`
3. Start frontend: `cd client && npm start`
4. Navigate to http://localhost:3000/hearaid/community
5. Select a user and start chatting

## Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- For Windows: Check MongoDB service in Services

**Port Already in Use:**
- Change PORT in .env file
- Update communityURL in client/src/Config/config.js

**CORS Error:**
- Ensure backend is running on port 5000
- Check frontend is on port 3000
