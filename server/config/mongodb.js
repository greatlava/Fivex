const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000;

const mongoClient = {
  connect: async () => {
    try {
      console.log('[MONGODB] 正在连接...');
      
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      reconnectAttempts = 0;
      
      mongoose.connection.on('connected', () => {
        console.log('[MONGODB] 连接已建立');
        reconnectAttempts = 0;
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
  
  ensureConnection: async () => {
    if (mongoose.connection.readyState === 1) {
      return true;
    }
    
    console.log('[MONGODB] 检测到连接断开，尝试重新连接...');
    
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('[MONGODB] 重连次数已达上限');
      return false;
    }
    
    try {
      reconnectAttempts++;
      
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGO_URI, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
      } else {
        await mongoose.connection.asPromise();
      }
      
      reconnectAttempts = 0;
      console.log('[MONGODB] 重连成功');
      return true;
      
    } catch (error) {
      console.error(`[MONGODB] 重连失败 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}):`, error.message);
      
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        console.log(`[MONGODB] ${RECONNECT_INTERVAL / 1000}秒后再次尝试...`);
        await new Promise(resolve => setTimeout(resolve, RECONNECT_INTERVAL));
        return await mongoClient.ensureConnection();
      }
      
      return false;
    }
  },
  
  getConnection: () => mongoose.connection,
  
  isConnected: () => mongoose.connection.readyState === 1
};

module.exports = mongoClient;
