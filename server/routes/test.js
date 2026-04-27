const express = require('express');
const router = express.Router();
const mongoClient = require('../config/mongodb');
const redisClient = require('../config/redis');

router.get('/status', async (req, res) => {
  try {
    const mongoStatus = mongoClient.isConnected();
    const redisStatus = redisClient.isConnected();
    
    const status = {
      mongodb: {
        connected: mongoStatus,
        uri: process.env.MONGO_URI.replace(/:([^:@]+)@/, ':***@')
      },
      redis: {
        connected: redisStatus,
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(status);
  } catch (error) {
    res.status(500).json({
      error: '获取连接状态失败',
      message: error.message
    });
  }
});

router.get('/mongo-test', async (req, res) => {
  try {
    const db = mongoClient.getConnection().db;
    
    const testCollection = db.collection('test');
    await testCollection.insertOne({
      test: 'success',
      timestamp: new Date()
    });
    
    const result = await testCollection.findOne({ test: 'success' });
    await testCollection.deleteMany({ test: 'success' });
    
    res.json({
      success: true,
      message: 'MongoDB 读写测试成功',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'MongoDB 测试失败',
      error: error.message
    });
  }
});

router.get('/redis-test', async (req, res) => {
  try {
    const client = redisClient.getClient();
    
    await client.set('test:key', 'success', {
      EX: 60
    });
    
    const value = await client.get('test:key');
    await client.del('test:key');
    
    res.json({
      success: true,
      message: 'Redis 读写测试成功',
      data: {
        key: 'test:key',
        value: value
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Redis 测试失败',
      error: error.message
    });
  }
});

module.exports = router;
