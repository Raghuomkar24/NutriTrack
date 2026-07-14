const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    // Try local DB with short timeout
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB connection failed. Falling back to In-Memory MongoDB for demonstration...`);
    
    // Start In-Memory MongoDB
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri);
    console.log(`In-Memory MongoDB Connected: ${uri}`);
  }
};

module.exports = connectDB;
