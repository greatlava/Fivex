require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoClient = require('./config/mongodb');
const redisClient = require('./config/redis');
const socketAuthMiddleware = require('./middlewares/socketAuth');
const { ensureDbConnection } = require('./middlewares/dbConnection');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api/test', require('./routes/test'));
app.use('/api/auth', ensureDbConnection, require('./routes/auth'));

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

io.use(socketAuthMiddleware);

io.on('connection', (socket) => {
  console.log(`[SOCKET] 用户连接: ${socket.id}, 用户: ${socket.user?.username || '未知'}`);
  
  socket.on('disconnect', (reason) => {
    console.log(`[SOCKET] 用户断开连接: ${socket.id}, 用户: ${socket.user?.username || '未知'}, 原因: ${reason}`);
  });
  
  socket.on('error', (error) => {
    console.error(`[SOCKET] 错误: ${socket.id}, 用户: ${socket.user?.username || '未知'}`, error);
  });
});

app.use((error, req, res, next) => {
  console.error('[EXPRESS] 错误:', error);
  
  if (res.headersSent) {
    return next(error);
  }
  
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: error.message
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[PROCESS] 未处理的 Promise 拒绝:', promise, '原因:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[PROCESS] 未捕获的异常:', error);
  process.exit(1);
});

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    console.log('[SERVER] 正在启动服务器...');
    
    await mongoClient.connect();
    console.log('[SERVER] MongoDB 连接成功');
    
    await redisClient.connect();
    console.log('[SERVER] Redis 连接成功');
    
    server.listen(PORT, () => {
      console.log(`[SERVER] 服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[SERVER] 启动服务器失败:', error);
    process.exit(1);
  }
}

startServer();
