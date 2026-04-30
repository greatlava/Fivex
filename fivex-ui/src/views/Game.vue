<template>
  <div class="game-container">
    <header class="game-header">
      <div class="header-left">
        <button class="back-btn" @click="handleBack">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M15 18L9 12L15 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          返回大厅
        </button>
      </div>
      <div class="header-center">
        <span class="room-info">{{ regionName }} · 桌号 {{ tableNumber }}</span>
      </div>
      <div class="header-right">
        <span class="game-status">{{ gameStatusText }}</span>
      </div>
    </header>

    <main class="game-main">
      <aside class="game-left">
        <GameLeftPanel 
          :player1="roomInfo.player1" 
          :player2="roomInfo.player2"
          :myColor="gameStore.playerColor"
          :isGameStarted="isGameStarted"
        />
      </aside>

      <section class="game-center">
        <div class="board-container">
          <GameBoard 
            v-if="isBoardReady" 
            @move="handleMove"
            :isGameStarted="isGameStarted"
          />
          <div v-else class="board-loading">
            <span>棋盘加载中...</span>
          </div>
        </div>
        <div class="action-bar">
          <button 
            class="action-btn start-btn" 
            :class="{ active: canStart }"
            :disabled="!canStart"
            @click="handleStart"
          >
            开始游戏
          </button>
          <button 
            class="action-btn undo-btn" 
            :class="{ active: canUndo }"
            :disabled="!canUndo"
            @click="handleUndo"
          >
            悔棋
          </button>
          <button 
            class="action-btn resign-btn" 
            :class="{ active: canResign }"
            :disabled="!canResign"
            @click="handleResign"
          >
            认输
          </button>
        </div>
      </section>

      <aside class="game-right">
        <GameRightPanel />
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import GameLeftPanel from '@/components/GameLeftPanel.vue'
import GameRightPanel from '@/components/GameRightPanel.vue'
import GameBoard from '@/components/GameBoard.vue'
import lobbyApi from '@/api/lobby'

const props = defineProps({
  region: {
    type: String,
    required: true
  },
  tableNumber: {
    type: [String, Number],
    required: true
  }
})

const router = useRouter()
const route = useRoute()
const gameStore = useGameStore()
const userStore = useUserStore()

const regionName = computed(() => {
  const regionMap = {
    'HD1': '华北一区',
    'HD2': '华北二区',
    'HD3': '华北三区'
  }
  return regionMap[props.region] || props.region
})

const isBoardReady = ref(false)
const gameStatus = ref('waiting')
const isGameStarted = ref(false)
const roomInfo = ref({
  player1: null,
  player2: null
})

let refreshInterval = null

const gameStatusText = computed(() => {
  switch (gameStatus.value) {
    case 'waiting':
      return '等待对手...'
    case 'ready':
      return '准备开始'
    case 'playing':
      return gameStore.isMyTurn ? '轮到你了' : '对手思考中...'
    case 'gameover':
      return gameStore.winner ? (gameStore.winner === gameStore.playerColor ? '你赢了！' : '你输了') : '平局'
    default:
      return '等待中'
  }
})

const canStart = computed(() => {
  return gameStatus.value === 'ready' && gameStore.hasBothPlayers && !isGameStarted.value
})

const canUndo = computed(() => {
  return gameStatus.value === 'playing' && gameStore.moveCount > 0 && gameStore.isMyTurn
})

const canResign = computed(() => {
  return gameStatus.value === 'playing' && gameStore.moveCount > 0
})

const handleBack = () => {
  router.push('/lobby')
}

const handleStart = () => {
  gameStatus.value = 'playing'
  isGameStarted.value = true
  gameStore.currentTurn = 'black'
  console.log('游戏开始')
}

const handleMove = ({ row, col }) => {
  if (!gameStore.isMyTurn || gameStatus.value !== 'playing') return
  
  const success = gameStore.makeMove(row, col, gameStore.playerColor)
  if (success) {
    console.log(`落子: (${row}, ${col})`)
    checkGameOver(row, col)
  }
}

const handleUndo = () => {
  console.log('悔棋请求')
}

const handleResign = () => {
  console.log('认输请求')
  gameStatus.value = 'gameover'
  gameStore.setGameOver(gameStore.playerColor === 'black' ? 'white' : 'black')
}

const checkGameOver = (row, col) => {
  const winner = checkWin(row, col, gameStore.board)
  if (winner) {
    gameStatus.value = 'gameover'
    gameStore.setGameOver(winner)
  }
}

const checkWin = (row, col, board) => {
  const color = board[row][col]
  if (!color) return null

  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ]

  for (const [dx, dy] of directions) {
    let count = 1
    
    for (let i = 1; i <= 4; i++) {
      const r = row + dx * i
      const c = col + dy * i
      if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] === color) {
        count++
      } else {
        break
      }
    }
    
    for (let i = 1; i <= 4; i++) {
      const r = row - dx * i
      const c = col - dy * i
      if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] === color) {
        count++
      } else {
        break
      }
    }

    if (count >= 5) {
      return color
    }
  }

  return null
}

const fetchRoomInfo = async () => {
  if (!props.tableNumber || !props.region) return
  
  try {
    const result = await lobbyApi.getRoom(props.tableNumber, props.region)
    if (result.success && result.data) {
      const room = result.data
      gameStore.roomId = room.id
      
      roomInfo.value.player1 = room.player1
      roomInfo.value.player2 = room.player2
      
      if (room.player1 && room.player2) {
        gameStore.hasBothPlayers = true
        if (!isGameStarted.value) {
          gameStatus.value = 'ready'
        }
        
        if (userStore.userInfo) {
          if (room.player1 && room.player1.id === userStore.userInfo.id) {
            gameStore.playerColor = 'black'
          } else if (room.player2 && room.player2.id === userStore.userInfo.id) {
            gameStore.playerColor = 'white'
          }
        }
      } else {
        gameStore.hasBothPlayers = false
        if (!isGameStarted.value) {
          gameStatus.value = 'waiting'
        }
      }
    }
  } catch (error) {
    console.error('获取房间信息失败:', error)
  }
}

onMounted(() => {
  fetchRoomInfo()
  
  refreshInterval = setInterval(() => {
    fetchRoomInfo()
  }, 2000)
  
  setTimeout(() => {
    isBoardReady.value = true
  }, 500)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
})

watch(
  () => [route.params.region, route.params.tableNumber],
  () => {
    fetchRoomInfo()
  }
)
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--bg-page);
  color: var(--txt-primary);
  overflow: hidden;
}

.game-header {
  height: 52px;
  background: var(--bg-titlebar);
  border-bottom: 1px solid var(--border-sidebar);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 13px;
  color: var(--txt-secondary);
  background: transparent;
  border: 1px solid var(--border-sidebar);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.back-btn:hover {
  color: var(--txt-primary);
  border-color: var(--border-card);
  background: rgba(255, 255, 255, 0.5);
}

.header-center {
  display: flex;
  align-items: center;
}

.room-info {
  font-size: 14px;
  font-weight: 500;
  color: var(--txt-primary);
  letter-spacing: 0.02em;
}

.header-right {
  display: flex;
  align-items: center;
}

.game-status {
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
  padding: 4px 12px;
  background: rgba(224, 120, 64, 0.1);
  border-radius: var(--radius-full);
}

.game-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 16px;
  gap: 16px;
}

.game-left {
  width: 220px;
  flex-shrink: 0;
  background: var(--bg-main);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-card);
  overflow: hidden;
}

.game-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: var(--bg-main);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-card);
  padding: 20px;
}

.board-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 400px;
}

.board-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--txt-muted);
  font-size: 14px;
}

.action-bar {
  display: flex;
  gap: 16px;
  padding: 8px 0;
}

.action-btn {
  padding: 10px 32px;
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-sidebar);
  background: var(--bg-card-empty);
  color: var(--txt-muted);
  cursor: not-allowed;
  transition: all var(--transition-fast);
}

.action-btn.active {
  cursor: pointer;
}

.start-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.start-btn.active:hover {
  background: var(--accent-light);
}

.undo-btn.active,
.resign-btn.active {
  background: var(--accent-btn);
  border-color: var(--accent-btn);
  color: var(--accent-btn-txt);
}

.undo-btn.active:hover,
.resign-btn.active:hover {
  background: #c8aa92;
}

.game-right {
  width: 240px;
  flex-shrink: 0;
  background: var(--bg-main);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-card);
  overflow: hidden;
}
</style>