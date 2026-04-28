<template>
  <div class="main">
    <div class="topbar">
      <div class="breadcrumb">
        <span>五子棋大厅</span>
        <svg class="sep-icon" viewBox="0 0 12 12" width="12" height="12">
          <path d="M4 2 L8 6 L4 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ currentRegion }}</span>
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
        <button class="btn-quick" @click="quickStart">快速开始</button>
      </div>
    </div>
    <div class="grid-wrap">
      <div class="table-grid">
        <TableCard
          v-for="table in tables"
          :key="table.id"
          :table="table"
          @click="handleTableClick"
        />
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
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import TableCard from './TableCard.vue'
import AuthModal from './AuthModal.vue'
import authApi from '@/api/auth'

const props = defineProps({
  currentRegion: {
    type: String,
    default: '华东一区'
  }
})

const userStore = useUserStore()

const showAuthModal = ref(false)
const authTab = ref('login')
const pendingAction = ref(null)

const generateTables = () => {
  const tables = []
  const statuses = ['empty', 'empty', 'waiting', 'playing']
  
  for (let i = 1; i <= 99; i++) {
    const statusIndex = Math.floor(Math.random() * 4)
    const status = statuses[statusIndex]
    
    const table = {
      id: i,
      number: i,
      status: status,
      rules: {
        quickStart: false,
        timeLimit: 30
      },
      player1: null,
      player2: null
    }
    
    if (status !== 'empty') {
      const hasPlayer1 = Math.random() > 0.3
      const hasPlayer2 = status === 'playing' ? true : Math.random() > 0.5
      
      if (hasPlayer1) {
        table.player1 = {
          name: `玩家${Math.floor(Math.random() * 1000)}`,
          score: Math.floor(Math.random() * 2000) + 1000,
          isHost: true,
          avatar: null
        }
      }
      
      if (hasPlayer2) {
        table.player2 = {
          name: `玩家${Math.floor(Math.random() * 1000)}`,
          score: Math.floor(Math.random() * 2000) + 1000,
          isHost: false,
          avatar: null
        }
      }
    }
    
    tables.push(table)
  }
  
  return tables
}

const tables = ref(generateTables())

const quickStart = () => {
  console.log('Quick start game')
  if (!userStore.isAuthenticated) {
    pendingAction.value = {
      type: 'quickStart',
      data: null
    }
    authTab.value = 'login'
    showAuthModal.value = true
    return
  }
  console.log('快速开始游戏，用户已登录:', userStore.userInfo)
}

const handleTableClick = (table) => {
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
  
  sitDown(table)
}

const sitDown = (table) => {
  const slot = !table.player1 ? 'player1' : 'player2'
  const user = userStore.userInfo
  
  console.log(`用户 ${user.username} 坐到桌子 ${table.number} 的 ${slot} 位置`)
  
  const tableIndex = tables.value.findIndex(t => t.id === table.id)
  if (tableIndex !== -1) {
    tables.value[tableIndex][slot] = {
      name: user.nickname || user.username,
      score: 1500,
      isHost: slot === 'player1',
      avatar: user.avatar
    }
  }
}

const handleAuthSuccess = ({ user, pendingAction: action }) => {
  console.log('认证成功:', user, '待执行操作:', action)
  
  if (action) {
    switch (action.type) {
      case 'sitDown':
        sitDown(action.data.table)
        break
      case 'quickStart':
        console.log('快速开始游戏')
        break
    }
  }
  
  pendingAction.value = null
}

const handleLogout = async () => {
  try {
    await authApi.logout()
  } catch (error) {
    console.error('Logout error:', error)
  }
  userStore.logout()
}
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

.btn-quick:hover {
  background: #c8aa92;
  border-color: #c0a080;
}

.grid-wrap {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.table-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-content: flex-start;
}
</style>
