require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    await User.deleteMany({});
    console.log('Database cleared - ready for user registrations');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
