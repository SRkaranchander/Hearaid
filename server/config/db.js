const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/HearAid1';
    
    // Fallback if placeholder text was left in env
    if (uri.includes('<your-cluster-name>')) {
      console.warn('Warning: MONGODB_URI contained placeholder <your-cluster-name>. Substituting default cluster address.');
      uri = uri.replace('<your-cluster-name>', 'cluster0.mongodb.net');
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB Connected successfully');
  } catch (error) {
    console.error('MongoDB connection notice:', error.message);
    // Avoid crashing server process so backend stays up
  }
};

module.exports = connectDB;
