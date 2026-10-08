# Community Feature Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                    (React - Port 3000)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │ Community.js │──────│  UserCard.js │                    │
│  │   (Page)     │      │ (Component)  │                    │
│  └──────┬───────┘      └──────────────┘                    │
│         │                                                    │
│         │              ┌──────────────┐                    │
│         └──────────────│  ChatBox.js  │                    │
│                        │ (Component)  │                    │
│                        └──────┬───────┘                    │
│                               │                             │
└───────────────────────────────┼─────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
              HTTP (Axios)            WebSocket
              REST API              (Socket.io)
                    │                       │
┌───────────────────┴───────────────────────┴─────────────────┐
│                         BACKEND                              │
│                  (Node.js/Express - Port 5000)              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │  users.js    │      │ messages.js  │                    │
│  │  (Routes)    │      │  (Routes)    │                    │
│  └──────┬───────┘      └──────┬───────┘                    │
│         │                     │                             │
│         │                     │                             │
│  ┌──────┴───────┐      ┌─────┴────────┐                   │
│  │   User.js    │      │  Message.js  │                    │
│  │   (Model)    │      │   (Model)    │                    │
│  └──────┬───────┘      └──────┬───────┘                    │
│         │                     │                             │
│         └──────────┬──────────┘                            │
│                    │                                         │
└────────────────────┼─────────────────────────────────────────┘
                     │
                     │ Mongoose ODM
                     │
┌────────────────────┴─────────────────────────────────────────┐
│                      DATABASE                                │
│                 (MongoDB - Port 27017)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │    users     │      │   messages   │                    │
│  │ (Collection) │      │ (Collection) │                    │
│  └──────────────┘      └──────────────┘                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User List Loading
```
Frontend (Community.js)
    │
    ├─→ GET /api/users
    │
Backend (users.js)
    │
    ├─→ User.find()
    │
MongoDB (users collection)
    │
    └─→ Returns user array
    │
Frontend displays users
```

### 2. Opening Chat
```
User clicks on UserCard
    │
    ├─→ GET /api/messages/:userId1/:userId2
    │
Backend (messages.js)
    │
    ├─→ Message.find({ senderId, receiverId })
    │
MongoDB (messages collection)
    │
    └─→ Returns message history
    │
ChatBox displays messages
```

### 3. Sending Message (Real-time)
```
User types and sends message
    │
    ├─→ POST /api/messages
    │   └─→ Saves to MongoDB
    │
    └─→ socket.emit('sendMessage')
        │
        └─→ socket.to(receiverId).emit('receiveMessage')
            │
            └─→ Receiver's browser updates instantly
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  bio: String,
  status: String (enum: ['online', 'offline']),
  createdAt: Date,
  updatedAt: Date
}
```

### Message Collection
```javascript
{
  _id: ObjectId,
  text: String,
  senderId: String,
  receiverId: String,
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Users API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | Get all users |
| POST | /api/users | Create new user |
| PATCH | /api/users/:id/status | Update user status |

### Messages API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/messages/:userId | Get all messages for user |
| GET | /api/messages/:userId1/:userId2 | Get conversation |
| POST | /api/messages | Send message |

## Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| join | userId | User joins their room |
| sendMessage | message object | Send message to another user |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| receiveMessage | message object | Receive message from another user |

## Technology Stack

### Frontend
- **React 17** - UI framework
- **Axios** - HTTP client
- **Socket.io-client** - WebSocket client
- **Bootstrap 5** - CSS framework
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Mongoose** - MongoDB ODM
- **Socket.io** - WebSocket server
- **CORS** - Cross-origin support
- **dotenv** - Environment variables

### Database
- **MongoDB** - NoSQL database

## Security Considerations

### Current Implementation
- CORS enabled for localhost:3000
- No authentication (development only)
- No input validation
- No rate limiting

### Production Recommendations
1. Add JWT authentication
2. Implement input validation (express-validator)
3. Add rate limiting (express-rate-limit)
4. Use HTTPS
5. Sanitize user inputs
6. Add password hashing (bcrypt)
7. Implement proper error handling
8. Add logging (winston/morgan)
9. Use environment-specific configs
10. Add API documentation (Swagger)

## Scalability Considerations

### Current Limitations
- Single server instance
- In-memory Socket.io (doesn't scale horizontally)
- No message pagination
- No caching

### Future Improvements
1. Use Redis for Socket.io adapter (multi-server)
2. Implement message pagination
3. Add Redis caching for user data
4. Use message queues (RabbitMQ/Kafka)
5. Implement database indexing
6. Add CDN for static assets
7. Use load balancer
8. Implement microservices architecture
9. Add monitoring (Prometheus/Grafana)
10. Use container orchestration (Kubernetes)
