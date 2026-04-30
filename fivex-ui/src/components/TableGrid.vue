<template>
  <div class="main">
    <div class="topbar">
      <div class="breadcrumb">
        <span>五子棋大厅</span>
        <svg class="sep-icon" viewBox="0 0 12 12" width="12" height="12">
          <path d="M4 2 L8 6 L4 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ currentRegionName }}</span>
      </div>
      <div class="topbar-right">
        <div class="user-info" v-if="userStore.isAuthenticated && userStore.userInfo">
          <div class="user-avatar">
            <span class="avatar-text">{{ userStore.userInfo.nickname?.charAt(0) || userStore.userInfo.username?.charAt(0) }}</span>
          </div>
          <span class="user-name">{{ userStore.userInfo.nickname || userStore.userInfo.username }}</span>
          <button class="logout-btn" @click="handleLogout">退出</button>
        </div>
        <button class="btn-login" v-else @click="showAuthModal = true">登录 / 注册</button>
        <button class="btn-quick" @click="quickStart" :disabled="isProcessing">
          {{ isProcessing ? '处理中...' : '快速开始' }}
        </button>
      </div>
    </div>
    <div class="grid-wrap" ref="gridWrapRef">
      <div class="table-grid">
        <TableCard
          v-for="table in tables"
          :key="table.id"
          :table="table"
          @click="handleTableClick"
        />
      </div>
      <div v-if="tables.length === 0 && !isLoading" class="empty-message">
        暂无房间数据
      </div>
      <div v-if="isLoading" class="loading-message">
        加载中...
      </div>
    </div>
    
    <AuthModal
      v-model:visible="showAuthModal"
      :initialTab="authTab"
      :pendingAction="pendingAction"
      @login-success="handleAuthSuccess"
      @register-success="handleAuthSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGameStore } from '@/stores/game'
import TableCard from './TableCard.vue'
import AuthModal from './AuthModal.vue'
import authApi from '@/api/auth'
import lobbyApi from '@/api/lobby'

const props = defineProps({
  currentRegion: {
    type: String,
    default: 'HD1'
  },
  currentRegionName: {
    type: String,
    default: ''
  }
})

const router = useRouter()
const userStore = useUserStore()
const gameStore = useGameStore()

const tables = ref([])
const showAuthModal = ref(false)
const authTab = ref('login')
const pendingAction = ref(null)
const isProcessing = ref(false)
const isLoading = ref(false)
const gridWrapRef = ref(null)

let refreshInterval = null

const scrollToTable = (tableNumber) => {
  if (!gridWrapRef.value) return
  
  nextTick(() => {
    const tableElement = gridWrapRef.value.querySelector(`[data-table-number="${tableNumber}"]`)
    if (tableElement) {
      tableElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  })
}

const scrollToTop = () => {
  if (!gridWrapRef.value) return
  
  gridWrapRef.value.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const fetchRooms = async () => {
  isLoading.value = true
  try {
    const result = await lobbyApi.getRooms(props.currentRegion)
    if (result.success) {
      tables.value = result.data.rooms || []
    }
  } catch (error) {
    console.error('[TableGrid] 获取房间列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

const quickStart = async () => {
  if (isProcessing.value) return
  
  console.log('快速开始游戏')
  if (!userStore.isAuthenticated) {
    pendingAction.value = {
      type: 'quickStart',
      data: null
    }
    authTab.value = 'login'
    showAuthModal.value = true
    return
  }
  
  isProcessing.value = true
  try {
    const result = await lobbyApi.quickStart(props.currentRegion)
    if (result.success) {
      console.log('快速开始成功:', result.data)
      await fetchRooms()
      if (result.data.room) {
        scrollToTable(result.data.room.number)
      }
    } else {
      console.error('快速开始失败:', result.message)
    }
  } catch (error) {
    console.error('快速开始错误:', error)
  } finally {
    isProcessing.value = false
  }
}

const handleTableClick = async (table) => {
  console.log('Table clicked:', table)
  
  const hasEmptySlot = !table.player1 || !table.player2
  
  if (!hasEmptySlot) {
    console.log('桌子已满，无法坐下')
    return
  }
  
  if (!userStore.isAuthenticated) {
    const slot = !table.player1 ? 'player1' : 'player2'
    
    pendingAction.value = {
      type: 'sitDown',
      data: {
        table,
        slot
      }
    }
    
    authTab.value = 'login'
    showAuthModal.value = true
    return
  }
  
  await sitDown(table)
}

const sitDown = async (table) => {
  if (isProcessing.value) return
  
  isProcessing.value = true
  try {
    const result = await lobbyApi.sitDown(table.number, props.currentRegion)
    if (result.success) {
      console.log('坐下成功:', result.data)
      
      if (result.data.room) {
        gameStore.resetGame()
        gameStore.roomId = result.data.room.id
        
        if (result.data.slot === 'player1') {
          gameStore.playerColor = 'black'
        } else if (result.data.slot === 'player2') {
          gameStore.playerColor = 'white'
        }
        
        if (result.data.room.player1 && result.data.room.player2) {
          gameStore.hasBothPlayers = true
        }
      }
      
      router.push({
        name: 'Game',
        params: { tableNumber: table.number }
      })
    } else {
      console.error('坐下失败:', result.message)
    }
  } catch (error) {
    console.error('坐下错误:', error)
  } finally {
    isProcessing.value = false
  }
}

const handleAuthSuccess = async ({ user, pendingAction: action }) => {
  console.log('认证成功:', user, '待执行操作:', action)
  
  if (action) {
    switch (action.type) {
      case 'sitDown':
        await sitDown(action.data.table)
        break
      case 'quickStart':
        await quickStart()
        break
    }
  }
  
  pendingAction.value = null
  await fetchRooms()
}

const handleLogout = async () => {
  try {
    await authApi.logout()
  } catch (error) {
    console.error('Logout error:', error)
  }
  userStore.logout()
  await fetchRooms()
}

onMounted(() => {
  fetchRooms()
  refreshInterval = setInterval(fetchRooms, 5000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

watch(
  () => props.currentRegion,
  () => {
    scrollToTop()
    fetchRooms()
  }
)

watch(
  () => userStore.isAuthenticated,
  () => {
    fetchRooms()
  }
)
</script>

<style scoped>
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-main);
  overflow: hidden;
}

.topbar {
  height: 52px;
  background: var(--bg-topbar);
  border-bottom: 1px solid var(--border-card);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  flex-shrink: 0;
}

.breadcrumb {
  font-size: 13px;
  color: var(--txt-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.breadcrumb .sep-icon {
  color: rgba(154, 136, 120, 0.6);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.user-name {
  font-size: 13px;
  color: var(--txt-secondary);
  font-weight: 500;
}

.logout-btn {
  padding: 4px 10px;
  font-size: 11px;
  color: var(--txt-muted);
  background: transparent;
  border: 1px solid var(--border-sidebar);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  color: var(--txt-secondary);
  border-color: var(--border-card);
}

.btn-login {
  font-size: 12px;
  font-weight: 500;
  padding: 6px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  letter-spacing: .02em;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.btn-login:hover {
  background: rgba(224, 120, 64, 0.1);
}

.btn-quick {
  font-size: 12px;
  font-weight: 500;
  padding: 6px 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-sidebar);
  background: var(--accent-btn);
  color: #706050;
  cursor: pointer;
  letter-spacing: .04em;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.btn-quick:hover:not(:disabled) {
  background: #c8aa92;
  border-color: #c0a080;
}

.btn-quick:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.grid-wrap {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.table-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-content: flex-start;
}

.empty-message, .loading-message {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  font-size: 13px;
  color: var(--txt-muted);
}
</style>
