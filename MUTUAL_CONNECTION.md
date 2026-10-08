# Mutual Connection System

## How It Works

### Connection Flow
1. **User A** clicks "Connect" on **User B** → Status: "Waiting to connect..."
2. **User B** sees "Wants to connect" on **User A** → Can click "Connect Back"
3. When **User B** clicks "Connect Back" → Both become **Friends** automatically
4. Only **Friends** can chat with each other

### User States
- **None**: No connection → Shows "Connect" button
- **Waiting**: You sent request → Shows "Waiting to connect..." + "Cancel" button
- **Received**: They sent request → Shows "Wants to connect" + "Connect Back" button
- **Friends**: Mutual connection → Shows "✓ Friends" + Can chat

### UI Features
- **Friends Tab**: Shows only friends (can chat)
- **All Users Tab**: Shows everyone with connection status
- Friends counter badge

### Database Schema
```javascript
User {
  sentRequests: [userId],      // Requests you sent
  receivedRequests: [userId],  // Requests you received
  friends: [userId]            // Mutual connections
}
```

### API Endpoints
- `POST /api/users/:id/connect` - Send request or auto-friend if mutual
- `DELETE /api/users/:id/cancel/:targetUserId` - Cancel sent request

## Setup
Run `npm run seed` in server folder to clear old data before testing.
