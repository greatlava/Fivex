const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const MAX_RECONNECT_ATTEMPTS_PER_CALL = 3;
const RECONNECT_INTERVAL = 2000;
const COOLDOWN_PERIOD = 5000;

let lastReconnectAttempt = 0;
let isInCooldown = false;

const mongoClient = {
  connect: async () => {
    try {
      console.log('[MONGODB] 正在连接...');
      
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
      });
      
      mongoose.connection.on('connected', () => {
        console.log('[MONGODB] 连接已建立');
        lastReconnectAttempt = 0;
        isInCooldown = false;
      });
      
      mongoose.connection.on('error', (err) => {
        console.error('[MONGODB] 连接错误:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('[MONGODB] 连接已断开');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('[MONGODB] 重新连接成功');
        lastReconnectAttempt = 0;
        isInCooldown = false;
      });
      
    } catch (error) {
      console.error('[MONGODB] 连接失败:', error.message);
      throw error;
    }
  },
  
  ensureConnection: async () => {
    if (mongoose.connection.readyState === 1) {
      return true;
    }
    
    const now = Date.now();
    
    if (isInCooldown && (now - lastReconnectAttempt) < COOLDOWN_PERIOD) {
      const remainingTime = Math.ceil((COOLDOWN_PERIOD - (now - lastReconnectAttempt)) / 1000);
      console.log(`[MONGODB] 重连冷却中，${remainingTime}秒后可重试`);
      return false;
    }
    
    isInCooldown = false;
    console.log('[MONGODB] 检测到连接断开，尝试重新连接...');
    
    for (let attempt = 1; attempt <= MAX_RECONNECT_ATTEMPTS_PER_CALL; attempt++) {
      try {
        console.log(`[MONGODB] 重连尝试 ${attempt}/${MAX_RECONNECT_ATTEMPTS_PER_CALL}...`);
        
        if (mongoose.connection.readyState === 0) {
          await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
          });
        } else if (mongoose.connection.readyState === 2 || mongoose.connection.readyState === 3) {
          await mongoose.connection.asPromise();
        }
        
        if (mongoose.connection.readyState === 1) {
          lastReconnectAttempt = 0;
          isInCooldown = false;
          console.log('[MONGODB] 重连成功');
          return true;
        }
        
      } catch (error) {
        console.error(`[MONGODB] 重连尝试 ${attempt} 失败:`, error.message);
        
        if (attempt < MAX_RECONNECT_ATTEMPTS_PER_CALL) {
          console.log(`[MONGODB] ${RECONNECT_INTERVAL / 1000}秒后再次尝试...`);
          await new Promise(resolve => setTimeout(resolve, RECONNECT_INTERVAL));
        }
      }
    }
    
    lastReconnectAttempt = Date.now();
    isInCooldown = true;
    console.error(`[MONGODB] 重连失败，进入${COOLDOWN_PERIOD / 1000}秒冷却期`);
    return false;
  },
  
  getConnection: () => mongoose.connection,
  
  isConnected: () => mongoose.connection.readyState === 1,
  
  resetCooldown: () => {
    isInCooldown = false;
    lastReconnectAttempt = 0;
    console.log('[MONGODB] 重连冷却已重置');
  }
};

module.exports = mongoClient;
