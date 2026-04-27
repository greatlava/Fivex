const Redis = require('ioredis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

let redisClientInstance = null;

const redisClient = {
  connect: async () => {
    try {
      console.log('[REDIS] 正在连接...');
      
      redisClientInstance = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        lazyConnect: true,
        retryStrategy: (times) => {
          if (times > 3) {
            console.error('[REDIS] 重连次数超过 3 次，停止重连');
            return null;
          }
          const delay = Math.min(times * 500, 5000);
          console.log(`[REDIS] 连接失败，${delay/1000} 秒后重试... (第 ${times} 次)`);
          return delay;
        }
      });

      redisClientInstance.on('error', (err) => {
        console.error('[REDIS] 错误:', err.message);
      });

      redisClientInstance.on('connect', () => {
        console.log('[REDIS] 连接已建立');
      });

      redisClientInstance.on('ready', () => {
        console.log('[REDIS] 服务就绪');
      });

      redisClientInstance.on('end', () => {
        console.log('[REDIS] 连接已断开');
      });

      await redisClientInstance.connect();
      
    } catch (error) {
      console.error('[REDIS] 连接失败:', error.message);
      throw error;
    }
  },

  getClient: () => redisClientInstance,

  isConnected: () => redisClientInstance && redisClientInstance.status === 'ready'
};

module.exports = redisClient;
