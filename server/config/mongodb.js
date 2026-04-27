const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const mongoClient = {
  connect: async () => {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('MongoDB 连接成功');
    } catch (error) {
      console.error('MongoDB 连接失败:', error);
      throw error;
    }
  },
  
  getConnection: () => mongoose.connection,
  
  isConnected: () => mongoose.connection.readyState === 1
};

module.exports = mongoClient;
