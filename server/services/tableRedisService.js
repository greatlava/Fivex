const redisClient = require('../config/redis');

const TABLES_KEY_PREFIX = 'tables';
const PLAYER_TABLE_KEY_PREFIX = 'player:table';
const TOTAL_TABLES = 99;
const TABLE_EXPIRE = 86400;

const calculateLevel = (wins, losses, draws) => {
  const totalGames = (wins || 0) + (losses || 0) + (draws || 0);
  return Math.floor(totalGames / 10) + 1;
};

const calculateScore = (wins, losses) => {
  return 1000 + (wins || 0) * 10 - (losses || 0) * 5;
};

const getTablesKey = (region) => {
  return `${TABLES_KEY_PREFIX}:${region}`;
};

const getPlayerTableKey = (userId) => {
  return `${PLAYER_TABLE_KEY_PREFIX}:${userId}`;
};

const createEmptyTable = (tableNumber, region) => {
  return {
    id: `virtual-${region}-${tableNumber}`,
    number: tableNumber,
    status: 'empty',
    region: region,
    player1: null,
    player2: null,
    rules: { timeLimit: 30, quickStart: false }
  };
};

const tableRedisService = {
  async getTables(region = 'HD1') {
    const redis = redisClient.getClient();
    if (!redis) {
      const fallbackTables = [];
      for (let i = 1; i <= TOTAL_TABLES; i++) {
        fallbackTables.push(createEmptyTable(i, region));
      }
      return fallbackTables;
    }
    
    try {
      const tablesKey = getTablesKey(region);
      const tablesData = await redis.hgetall(tablesKey);
      
      const tableMap = new Map();
      Object.keys(tablesData).forEach(key => {
        const tableNumber = parseInt(key);
        tableMap.set(tableNumber, JSON.parse(tablesData[key]));
      });
      
      const allTables = [];
      for (let i = 1; i <= TOTAL_TABLES; i++) {
        if (tableMap.has(i)) {
          allTables.push(tableMap.get(i));
        } else {
          allTables.push(createEmptyTable(i, region));
        }
      }
      
      return allTables;
    } catch (error) {
      console.error('[TABLE_REDIS_SERVICE] 获取桌位列表失败:', error);
      const fallbackTables = [];
      for (let i = 1; i <= TOTAL_TABLES; i++) {
        fallbackTables.push(createEmptyTable(i, region));
      }
      return fallbackTables;
    }
  },
  
  async getTable(tableNumber, region = 'HD1') {
    const redis = redisClient.getClient();
    if (!redis) {
      return createEmptyTable(tableNumber, region);
    }
    
    try {
      if (tableNumber < 1 || tableNumber > TOTAL_TABLES) {
        return null;
      }
      
      const tablesKey = getTablesKey(region);
      const tableData = await redis.hget(tablesKey, tableNumber.toString());
      
      if (tableData) {
        return JSON.parse(tableData);
      }
      
      return createEmptyTable(tableNumber, region);
    } catch (error) {
      console.error('[TABLE_REDIS_SERVICE] 获取桌位失败:', error);
      return createEmptyTable(tableNumber, region);
    }
  },
  
  async saveTable(table, region = 'HD1') {
    const redis = redisClient.getClient();
    if (!redis) {
      return false;
    }
    
    try {
      const tablesKey = getTablesKey(region);
      await redis.hset(tablesKey, table.number.toString(), JSON.stringify(table));
      await redis.expire(tablesKey, TABLE_EXPIRE);
      return true;
    } catch (error) {
      console.error('[TABLE_REDIS_SERVICE] 保存桌位失败:', error);
      return false;
    }
  },
  
  async deleteTable(tableNumber, region = 'HD1') {
    const redis = redisClient.getClient();
    if (!redis) {
      return false;
    }
    
    try {
      const tablesKey = getTablesKey(region);
      await redis.hdel(tablesKey, tableNumber.toString());
      return true;
    } catch (error) {
      console.error('[TABLE_REDIS_SERVICE] 删除桌位失败:', error);
      return false;
    }
  },
  
  async getPlayerCurrentTable(userId) {
    const redis = redisClient.getClient();
    if (!redis) {
      return null;
    }
    
    try {
      const playerTableKey = getPlayerTableKey(userId);
      const tableInfo = await redis.get(playerTableKey);
      if (tableInfo) {
        return JSON.parse(tableInfo);
      }
      return null;
    } catch (error) {
      console.error('[TABLE_REDIS_SERVICE] 获取玩家当前桌位失败:', error);
      return null;
    }
  },
  
  async setPlayerCurrentTable(userId, tableNumber, region, slot) {
    const redis = redisClient.getClient();
    if (!redis) {
      return false;
    }
    
    try {
      const playerTableKey = getPlayerTableKey(userId);
      const tableInfo = {
        tableNumber,
        region,
        slot,
        joinedAt: Date.now()
      };
      await redis.set(playerTableKey, JSON.stringify(tableInfo), 'EX', TABLE_EXPIRE);
      return true;
    } catch (error) {
      console.error('[TABLE_REDIS_SERVICE] 设置玩家当前桌位失败:', error);
      return false;
    }
  },
  
  async clearPlayerCurrentTable(userId) {
    const redis = redisClient.getClient();
    if (!redis) {
      return false;
    }
    
    try {
      const playerTableKey = getPlayerTableKey(userId);
      await redis.del(playerTableKey);
      return true;
    } catch (error) {
      console.error('[TABLE_REDIS_SERVICE] 清除玩家当前桌位失败:', error);
      return false;
    }
  },
  
  formatPlayerData(user) {
    if (!user) return null;
    
    const wins = user.wins || 0;
    const losses = user.losses || 0;
    const draws = user.draws || 0;
    
    return {
      id: user._id ? user._id.toString() : user.id,
      name: user.nickname || user.username || null,
      username: user.username || null,
      avatar: user.avatar || 'avatar-1',
      wins: wins,
      losses: losses,
      draws: draws,
      level: calculateLevel(wins, losses, draws),
      score: calculateScore(wins, losses)
    };
  },
  
  calculateTableStatus(table) {
    if (table.player1 && table.player2) {
      return 'playing';
    } else if (table.player1 || table.player2) {
      return 'waiting';
    } else {
      return 'empty';
    }
  },
  
  async getWaitingTables(region = 'HD1') {
    const allTables = await this.getTables(region);
    return allTables.filter(table => table.status === 'waiting');
  },
  
  async getAvailableTableNumbers(region = 'HD1') {
    const allTables = await this.getTables(region);
    const availableNumbers = [];
    
    for (let i = 0; i < allTables.length; i++) {
      const table = allTables[i];
      if (table.status === 'empty' || (!table.player1 || !table.player2)) {
        availableNumbers.push(table.number);
      }
    }
    
    return availableNumbers;
  }
};

module.exports = tableRedisService;
