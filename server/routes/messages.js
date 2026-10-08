const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');

const memoryMessages = [];

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// Get messages between two users
router.get('/:userId', async (req, res) => {
  if (!isDbConnected()) {
    const list = memoryMessages.filter(m => m.senderId === req.params.userId || m.receiverId === req.params.userId);
    return res.json(list);
  }
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.params.userId },
        { receiverId: req.params.userId }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.json(memoryMessages);
  }
});

// Get conversation between two specific users
router.get('/:userId1/:userId2', async (req, res) => {
  if (!isDbConnected()) {
    const list = memoryMessages.filter(m => 
      (m.senderId === req.params.userId1 && m.receiverId === req.params.userId2) ||
      (m.senderId === req.params.userId2 && m.receiverId === req.params.userId1)
    );
    return res.json(list);
  }
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.params.userId1, receiverId: req.params.userId2 },
        { senderId: req.params.userId2, receiverId: req.params.userId1 }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.json(memoryMessages);
  }
});

// Send message
router.post('/', async (req, res) => {
  const { text, senderId, receiverId } = req.body;

  if (!isDbConnected()) {
    const newMsg = {
      _id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      text,
      senderId,
      receiverId,
      timestamp: new Date()
    };
    memoryMessages.push(newMsg);
    return res.status(201).json(newMsg);
  }

  const message = new Message({ text, senderId, receiverId });

  try {
    const newMessage = await message.save();
    res.status(201).json(newMessage);
  } catch (error) {
    const newMsg = {
      _id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      text,
      senderId,
      receiverId,
      timestamp: new Date()
    };
    memoryMessages.push(newMsg);
    res.status(201).json(newMsg);
  }
});

module.exports = router;
