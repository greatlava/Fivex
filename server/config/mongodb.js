const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const mongoClient = {
  connect: async () => {
    try {
      console.log('[MONGODB] 正在连接...');
      await mongoose.connect(MONGO_URI);
      
      mongoose.connection.on('connected', () => {
        console.log('[MONGODB] 连接已建立');
      });
      
      mongoose.connection.on('error', (err) => {
        console.error('[MONGODB] 连接错误:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('[MONGODB] 连接已断开');
      });
      
    } catch (error) {
      console.error('[MONGODB] 连接失败:', error);
      throw error;
    }
  },
  
  getConnection: () => mongoose.connection,
  
  isConnected: () => mongoose.connection.readyState === 1
};

module.exports = mongoClient;
