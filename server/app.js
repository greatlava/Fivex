require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoClient = require('./config/mongodb');
const redisClient = require('./config/redis');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api/test', require('./routes/test'));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
  });
});

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    await mongoClient.connect();
    console.log('MongoDB 连接成功');
    
    await redisClient.connect();
    console.log('Redis 连接成功');
    
    server.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

startServer();
