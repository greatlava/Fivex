const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};

let connectionListenersSetup = false;

const setupConnectionListeners = () => {
  if (connectionListenersSetup) return;
  connectionListenersSetup = true;
  
  mongoose.connection.on('connected', () => {
    console.log('[MONGODB] 连接已建立');
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('[MONGODB] 连接错误:', err.message);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.log('[MONGODB] 连接已断开');
  });
  
  mongoose.connection.on('reconnected', () => {
    console.log('[MONGODB] 重新连接成功');
  });
};

const mongoClient = {
  connect: async () => {
    try {
      console.log('[MONGODB] 正在连接...');
      
      setupConnectionListeners();
      
      await mongoose.connect(MONGO_URI, CONNECT_OPTIONS);
      
    } catch (error) {
      console.error('[MONGODB] 连接失败:', error.message);
      throw error;
    }
  },
  
  ensureConnection: async () => {
    const readyState = mongoose.connection.readyState;
    
    if (readyState === 1) {
      return true;
    }
    
    console.log(`[MONGODB] 连接状态: ${readyState} (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`);
    console.log('[MONGODB] 检测到连接断开，强制创建新连接...');
    
    try {
      if (readyState !== 0) {
        console.log('[MONGODB] 清理现有连接状态...');
        try {
          await mongoose.disconnect();
          console.log('[MONGODB] 已断开现有连接');
        } catch (disconnectErr) {
          console.log('[MONGODB] 断开连接时忽略错误:', disconnectErr.message);
        }
      }
      
      setupConnectionListeners();
      
      console.log('[MONGODB] 尝试建立新连接...');
      await mongoose.connect(MONGO_URI, CONNECT_OPTIONS);
      
      if (mongoose.connection.readyState === 1) {
        console.log('[MONGODB] 新连接建立成功');
        return true;
      }
      
      console.log('[MONGODB] 连接后状态检查失败:', mongoose.connection.readyState);
      return false;
      
    } catch (error) {
      console.error('[MONGODB] 建立新连接失败:', error.message);
      
      try {
        await mongoose.disconnect();
      } catch (e) {
      }
      
      return false;
    }
  },
  
  getConnection: () => mongoose.connection,
  
  isConnected: () => mongoose.connection.readyState === 1,
};

module.exports = mongoClient;
