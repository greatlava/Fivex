const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      console.error('[SOCKET_AUTH] 未提供 Token');
      return next(new Error('未授权，请登录'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      console.error('[SOCKET_AUTH] 用户不存在:', decoded.userId);
      return next(new Error('用户不存在'));
    }

    socket.user = user;
    console.log(`[SOCKET_AUTH] 用户认证成功: ${user.username}`);
    
    next();

  } catch (error) {
    console.error('[SOCKET_AUTH] Token 验证失败:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Token 无效'));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Token 已过期'));
    }

    return next(new Error('认证失败'));
  }
};

module.exports = socketAuthMiddleware;
