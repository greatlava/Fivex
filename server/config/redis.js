const { createClient } = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

let redisClientInstance = null;

const redisClient = {
  connect: async () => {
    try {
      redisClientInstance = createClient({
        url: `redis://${REDIS_HOST}:${REDIS_PORT}`
      });
      
      redisClientInstance.on('error', (err) => {
        console.error('Redis 连接错误:', err);
      });
      
      redisClientInstance.on('connect', () => {
        console.log('Redis 连接成功');
      });
      
      await redisClientInstance.connect();
    } catch (error) {
      console.error('Redis 连接失败:', error);
      throw error;
    }
  },
  
  getClient: () => redisClientInstance,
  
  isConnected: () => redisClientInstance && redisClientInstance.isOpen
};

module.exports = redisClient;
