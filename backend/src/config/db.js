const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`\n⚠️  Could not connect to MongoDB Atlas (likely IP whitelist issue).`);
    console.warn(`⚠️  Falling back to Persistent Local Database...`);
    
    // Create a local directory to store DB data
    const dbPath = path.join(__dirname, '..', '..', 'local_db_data');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    // Start a persistent local MongoDB instance
    const mongoServer = await MongoMemoryServer.create({
      instance: {
        dbPath: dbPath,
        storageEngine: 'wiredTiger'
      }
    });
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri);
    console.log(`✅ Persistent Local MongoDB Connected! Data will be saved to: ${dbPath}`);
  }
};

module.exports = connectDB;
