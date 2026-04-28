const Log = require('../models/Log');

const logTypes = {
  REGISTER: 'register',
  LOGIN: 'login',
  LOGOUT: 'logout',
  ACTION: 'action',
  SYSTEM: 'system'
};

const createLog = async (type, action, details = {}, req = null) => {
  try {
    const logData = {
      type,
      action,
      details
    };

    if (req) {
      logData.ip = req.ip || 
                   req.connection?.remoteAddress || 
                   req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                   null;
      
      logData.userAgent = req.headers['user-agent'] || null;
      logData.sessionId = req.headers['authorization'] || null;

      if (req.user) {
        logData.userId = req.user._id || null;
        logData.username = req.user.username || null;
      } else if (details.username) {
        logData.username = details.username;
      }
    }

    const log = new Log(logData);
    await log.save();

    console.log(`[LOG][${type.toUpperCase()}] ${action}`, details.username || '');
    
    return log;
  } catch (error) {
    console.error('[LOG] 创建日志失败:', error);
    return null;
  }
};

const logRegister = (username, details = {}, req = null) => {
  return createLog(
    logTypes.REGISTER,
    '用户注册',
    { username, ...details },
    req
  );
};

const logLogin = (username, details = {}, req = null) => {
  return createLog(
    logTypes.LOGIN,
    '用户登录',
    { username, ...details },
    req
  );
};

const logLogout = (username, details = {}, req = null) => {
  return createLog(
    logTypes.LOGOUT,
    '用户登出',
    { username, ...details },
    req
  );
};

const logAction = (username, action, details = {}, req = null) => {
  return createLog(
    logTypes.ACTION,
    action,
    { username, ...details },
    req
  );
};

const logSystem = (action, details = {}, req = null) => {
  return createLog(
    logTypes.SYSTEM,
    action,
    details,
    req
  );
};

module.exports = {
  logTypes,
  createLog,
  logRegister,
  logLogin,
  logLogout,
  logAction,
  logSystem
};
