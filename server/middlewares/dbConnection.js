const mongoClient = require('../config/mongodb');

const ensureDbConnection = async (req, res, next) => {
  try {
    const isConnected = await mongoClient.ensureConnection();
    
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: '数据库连接失败，请稍后重试',
        data: null
      });
    }
    
    next();
  } catch (error) {
    console.error('[DB] 数据库连接检查失败:', error);
    return res.status(503).json({
      success: false,
      message: '数据库服务不可用，请稍后重试',
      data: null
    });
  }
};

module.exports = {
  ensureDbConnection
};
