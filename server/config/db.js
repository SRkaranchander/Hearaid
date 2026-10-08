const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/HearAid';
    
    // Fallback if placeholder text was left in env
    if (uri.includes('<your-cluster-name>')) {
      console.warn('Warning: MONGODB_URI contained placeholder <your-cluster-name>. Substituting default cluster address.');
      uri = uri.replace('<your-cluster-name>', 'cluster0.mongodb.net');
    }

    cachedConnection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB Connected successfully');
    return cachedConnection;
  } catch (error) {
    console.error('MongoDB connection notice:', error.message);
    // Avoid crashing server process so backend stays up
  }
};

module.exports = connectDB;
