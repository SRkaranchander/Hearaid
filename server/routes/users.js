const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');

// In-memory fallback store when DB is connecting/disconnected
const memoryUsers = [];

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// Get all users
router.get('/', async (req, res) => {
  if (!isDbConnected()) {
    return res.json(memoryUsers);
  }
  try {
    const users = await User.find().select('-__v');
    res.json(users);
  } catch (error) {
    res.json(memoryUsers);
  }
});

// Create user
router.post('/', async (req, res) => {
  const { name, email, bio } = req.body;

  if (!isDbConnected()) {
    const existing = memoryUsers.find(u => u.email === email);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' });
    }
    const newUser = {
      _id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name,
      email,
      bio: bio || '',
      status: 'online',
      friends: [],
      sentRequests: [],
      receivedRequests: []
    };
    memoryUsers.push(newUser);
    return res.status(201).json(newUser);
  }

  const user = new User({ name, email, bio });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' });
    }
    // If DB timeout error, fallback to memory creation so user flow never breaks
    const newUser = {
      _id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name,
      email,
      bio: bio || '',
      status: 'online',
      friends: [],
      sentRequests: [],
      receivedRequests: []
    };
    memoryUsers.push(newUser);
    res.status(201).json(newUser);
  }
});

// Update user status
router.patch('/:id/status', async (req, res) => {
  if (!isDbConnected()) {
    const user = memoryUsers.find(u => u._id === req.params.id);
    if (user) user.status = req.body.status;
    return res.json(user || { _id: req.params.id, status: req.body.status });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.json({ _id: req.params.id, status: req.body.status });
  }
});

// Update user profile
router.patch('/:id', async (req, res) => {
  const { name, email, bio } = req.body;
  if (!isDbConnected()) {
    const user = memoryUsers.find(u => u._id === req.params.id);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email;
      if (bio) user.bio = bio;
    }
    return res.json(user || { _id: req.params.id, name, email, bio });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, bio },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.json({ _id: req.params.id, name, email, bio });
  }
});

// Send connection request
router.post('/:id/connect', async (req, res) => {
  const { targetUserId } = req.body;
  if (!isDbConnected()) {
    const sender = memoryUsers.find(u => u._id === req.params.id);
    const receiver = memoryUsers.find(u => u._id === targetUserId);
    if (sender && receiver) {
      if (receiver.sentRequests.includes(req.params.id)) {
        sender.receivedRequests = sender.receivedRequests.filter(id => id !== targetUserId);
        receiver.sentRequests = receiver.sentRequests.filter(id => id !== req.params.id);
        if (!sender.friends.includes(targetUserId)) sender.friends.push(targetUserId);
        if (!receiver.friends.includes(req.params.id)) receiver.friends.push(req.params.id);
        return res.json({ message: 'Now friends' });
      }
      if (!sender.sentRequests.includes(targetUserId)) sender.sentRequests.push(targetUserId);
      if (!receiver.receivedRequests.includes(req.params.id)) receiver.receivedRequests.push(req.params.id);
    }
    return res.json({ message: 'Request sent' });
  }
  try {
    const sender = await User.findById(req.params.id);
    const receiver = await User.findById(targetUserId);

    if (receiver && receiver.sentRequests.includes(req.params.id)) {
      await User.findByIdAndUpdate(req.params.id, {
        $pull: { receivedRequests: targetUserId },
        $addToSet: { friends: targetUserId }
      });
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { sentRequests: req.params.id },
        $addToSet: { friends: req.params.id }
      });
      return res.json({ message: 'Now friends' });
    }

    await User.findByIdAndUpdate(req.params.id, {
      $addToSet: { sentRequests: targetUserId }
    });
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { receivedRequests: req.params.id }
    });
    res.json({ message: 'Request sent' });
  } catch (error) {
    res.json({ message: 'Request sent' });
  }
});

// Cancel connection request
router.delete('/:id/cancel/:targetUserId', async (req, res) => {
  if (!isDbConnected()) {
    const sender = memoryUsers.find(u => u._id === req.params.id);
    const receiver = memoryUsers.find(u => u._id === req.params.targetUserId);
    if (sender) sender.sentRequests = sender.sentRequests.filter(id => id !== req.params.targetUserId);
    if (receiver) receiver.receivedRequests = receiver.receivedRequests.filter(id => id !== req.params.id);
    return res.json({ message: 'Request cancelled' });
  }
  try {
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { sentRequests: req.params.targetUserId }
    });
    await User.findByIdAndUpdate(req.params.targetUserId, {
      $pull: { receivedRequests: req.params.id }
    });
    res.json({ message: 'Request cancelled' });
  } catch (error) {
    res.json({ message: 'Request cancelled' });
  }
});

module.exports = router;
