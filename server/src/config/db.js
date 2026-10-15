import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri && uri.trim() !== '') {
      console.log('Connecting to specified MongoDB URI...');
      await mongoose.connect(uri);
      console.log('Connected to External MongoDB successfully.');
      return;
    }

    console.log('No external MongoDB URI specified or detected. Starting embedded MongoDB Memory Server...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memUri = mongoMemoryServer.getUri();
    await mongoose.connect(memUri);
    console.log(`Connected to In-Memory MongoDB successfully at ${memUri}`);
  } catch (error) {
    console.error('Failed to connect to MongoDB URI:', error.message);
    if (!mongoMemoryServer) {
      console.log('Falling back to In-Memory MongoDB server for zero-config local development...');
      try {
        mongoMemoryServer = await MongoMemoryServer.create();
        const memUri = mongoMemoryServer.getUri();
        await mongoose.connect(memUri);
        console.log(`Fallback connected to In-Memory MongoDB successfully at ${memUri}`);
      } catch (innerError) {
        console.error('Fatal: Could not initialize database:', innerError.message);
        process.exit(1);
      }
    }
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
