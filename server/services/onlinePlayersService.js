const redisClient = require('../config/redis');

const ONLINE_PLAYERS_KEY = 'online:players';
const ONLINE_PLAYERS_EXPIRE = 3600;

const calculateLevel = (wins, losses, draws) => {
  const totalGames = (wins || 0) + (losses || 0) + (draws || 0);
  return Math.floor(totalGames / 10) + 1;
};

const calculateScore = (wins, losses) => {
  return 1000 + (wins || 0) * 10 - (losses || 0) * 5;
};

const onlinePlayersService = {
  async addPlayer(user) {
    const redis = redisClient.getClient();
    if (!redis) return false;
    
    try {
      const wins = user.wins || 0;
      const losses = user.losses || 0;
      const draws = user.draws || 0;
      
      const playerData = {
        id: user._id.toString(),
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        wins: wins,
        losses: losses,
        draws: draws,
        level: calculateLevel(wins, losses, draws),
        score: calculateScore(wins, losses),
        status: 'online',
        onlineAt: Date.now()
      };
      
      await redis.hset(ONLINE_PLAYERS_KEY, user._id.toString(), JSON.stringify(playerData));
      await redis.expire(ONLINE_PLAYERS_KEY, ONLINE_PLAYERS_EXPIRE);
      
      console.log(`[ONLINE_PLAYERS] 玩家上线: ${user.username}`);
      return true;
    } catch (error) {
      console.error('[ONLINE_PLAYERS] 添加在线玩家失败:', error);
      return false;
    }
  },
  
  async removePlayer(userId) {
    const redis = redisClient.getClient();
    if (!redis) return false;
    
    try {
      await redis.hdel(ONLINE_PLAYERS_KEY, userId.toString());
      console.log(`[ONLINE_PLAYERS] 玩家下线: ${userId}`);
      return true;
    } catch (error) {
      console.error('[ONLINE_PLAYERS] 移除在线玩家失败:', error);
      return false;
    }
  },
  
  async getOnlinePlayers() {
    const redis = redisClient.getClient();
    if (!redis) return [];
    
    try {
      const players = await redis.hgetall(ONLINE_PLAYERS_KEY);
      return Object.values(players).map(p => JSON.parse(p));
    } catch (error) {
      console.error('[ONLINE_PLAYERS] 获取在线玩家列表失败:', error);
      return [];
    }
  },
  
  async isPlayerOnline(userId) {
    const redis = redisClient.getClient();
    if (!redis) return false;
    
    try {
      const exists = await redis.hexists(ONLINE_PLAYERS_KEY, userId.toString());
      return exists === 1;
    } catch (error) {
      console.error('[ONLINE_PLAYERS] 检查玩家在线状态失败:', error);
      return false;
    }
  },
  
  async updatePlayerStatus(userId, status) {
    const redis = redisClient.getClient();
    if (!redis) return false;
    
    try {
      const playerDataStr = await redis.hget(ONLINE_PLAYERS_KEY, userId.toString());
      if (!playerDataStr) return false;
      
      const playerData = JSON.parse(playerDataStr);
      playerData.status = status;
      playerData.updatedAt = Date.now();
      
      await redis.hset(ONLINE_PLAYERS_KEY, userId.toString(), JSON.stringify(playerData));
      return true;
    } catch (error) {
      console.error('[ONLINE_PLAYERS] 更新玩家状态失败:', error);
      return false;
    }
  },
  
  async getPlayerInfo(userId) {
    const redis = redisClient.getClient();
    if (!redis) return null;
    
    try {
      const playerDataStr = await redis.hget(ONLINE_PLAYERS_KEY, userId.toString());
      if (!playerDataStr) return null;
      return JSON.parse(playerDataStr);
    } catch (error) {
      console.error('[ONLINE_PLAYERS] 获取玩家信息失败:', error);
      return null;
    }
  }
};

module.exports = onlinePlayersService;
