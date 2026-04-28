const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};

let connectionListenersSetup = false;
let connectPromise = null;

const setupConnectionListeners = () => {
  if (connectionListenersSetup) return;
  connectionListenersSetup = true;

  mongoose.connection.on('connected', () => {
    console.log('[MONGODB] connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MONGODB] connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('[MONGODB] disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MONGODB] reconnected');
  });
};

const connectMongo = async () => {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  setupConnectionListeners();

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    return mongoose.connection.asPromise();
  }

  if (mongoose.connection.readyState === 3) {
    await mongoose.disconnect().catch(() => {});
  }

  if (connectPromise) {
    return connectPromise;
  }

  console.log('[MONGODB] connecting...');
  connectPromise = mongoose.connect(MONGO_URI, CONNECT_OPTIONS);

  try {
    await connectPromise;
    return mongoose.connection;
  } finally {
    connectPromise = null;
  }
};

const mongoClient = {
  connect: async () => {
    try {
      return await connectMongo();
    } catch (error) {
      console.error('[MONGODB] connect failed:', error.message);
      throw error;
    }
  },

  ensureConnection: async () => {
    const readyState = mongoose.connection.readyState;

    if (readyState === 1) {
      return true;
    }

    console.log(`[MONGODB] not connected, readyState=${readyState}`);

    try {
      if (readyState === 3) {
        await mongoose.disconnect().catch(() => {});
      }

      await connectMongo();
      return mongoose.connection.readyState === 1;
    } catch (error) {
      console.error('[MONGODB] reconnect failed:', error.message);
      await mongoose.disconnect().catch(() => {});
      return false;
    }
  },

  getConnection: () => mongoose.connection,

  isConnected: () => mongoose.connection.readyState === 1,
};

module.exports = mongoClient;
