# Fivex — 五子棋在线对战

> 基于 **Vue3 + Pixi.js** 前端 / **Node.js + Socket.io** 后端的实时五子棋对战游戏，支持断线重连、回合倒计时与棋局快照恢复。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 · Pixi.js · Vite |
| 后端 | Node.js 20 · Socket.io · Express |
| 数据库 | MongoDB 7 |
| 缓存 / 会话 | Redis 7 |

---

## 核心功能

- **实时对战** — Socket.io 双向通信，落子即时同步
- **断线重连** — 玩家重新连接后自动恢复房间与棋局状态
- **回合倒计时** — 每步默认 30 秒，超时自动判负
- **棋局快照** — 每隔 N 步将棋盘状态写入 Redis，断线后秒级恢复

---

## 项目结构

```
Fivex/
├── README.md
├── docker/
│   ├── docker-compose.yml      # 开发环境基础设施（MongoDB + Redis）
│   ├── mongo/
│   │   ├── Dockerfile
│   │   ├── conf/mongo-init.js  # 初始化数据库和用户
│   │   └── logs/
│   └── redis/
│       ├── Dockerfile
│       └── conf/redis.conf
├── fivex-ui/                   # Vue3 + Pixi.js 前端
└── server/                     # Node.js + Socket.io 后端
```

---

## 快速开始

### 前置条件

- Docker >= 24
- Docker Compose >= 2.20
- Node.js 20+

### 启动开发环境基础设施

```bash
cd docker
docker compose up -d
```

| 服务 | 端口 |
|------|------|
| MongoDB | `27017` |
| Redis | `6379` |

### 停止 / 清理

```bash
cd docker
docker compose down          # 停止并移除容器（数据卷保留）
docker compose down -v       # 同时清除数据卷
```

---

## 本地开发

### 前端 (Vue3 + Pixi.js)

```bash
cd fivex-ui
npm install
npm run dev       # http://localhost:5173
```

### 后端 (Node.js + Socket.io)

```bash
cd server
npm install
npm run dev       # http://localhost:8080
```

后端连接配置（`.env`）：

```env
MONGO_URI=mongodb://fivex:fivex123@localhost:27017/fivex?authSource=fivex
REDIS_HOST=localhost
REDIS_PORT=6379
GAME_TURN_TIMEOUT=30
SNAPSHOT_INTERVAL=5
```

---

## 断线重连 / 快照恢复机制

```
玩家断线
  └─► 服务端保留房间 60 秒
        └─► 玩家携带 sessionId 重连
              └─► 从 Redis 读取最新快照
                    └─► 恢复棋盘状态并继续倒计时
```

快照格式（Redis key: `game:{roomId}:snapshot`）：

```json
{
  "board": [[0,0,...], ...],
  "currentTurn": "black",
  "moveCount": 12,
  "timerRemaining": 18,
  "updatedAt": 1714200000000
}
```

---

## License

MIT
