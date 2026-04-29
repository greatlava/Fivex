<template>
  <div class="right-panel">
    <div class="user-info-section" v-if="userStore.isAuthenticated && userStore.userInfo">
      <div class="user-info-header">
        <div class="user-avatar-large">
          <span class="avatar-text-large">{{ userStore.userInfo.nickname?.charAt(0) || userStore.userInfo.username?.charAt(0) }}</span>
        </div>
        <div class="user-name-level">
          <div class="user-nickname">{{ userStore.userInfo.nickname || userStore.userInfo.username }}</div>
          <div class="user-level-score">Lv.{{ userLevel }} · {{ userScore }}分</div>
        </div>
      </div>
      <div class="user-stats">
        <div class="stat-item">
          <span class="stat-value">{{ userStore.userInfo.wins || 0 }}</span>
          <span class="stat-label">胜</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ userStore.userInfo.losses || 0 }}</span>
          <span class="stat-label">负</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ userStore.userInfo.draws || 0 }}</span>
          <span class="stat-label">平</span>
        </div>
      </div>
    </div>
    
    <div class="rp-header-wrap">
      <div class="rp-header">
        <span>在线玩家</span>
        <span class="count">{{ onlineUsers.length }}人</span>
      </div>
      <input class="rp-search" type="text" placeholder="搜索玩家..." v-model="searchQuery">
    </div>
    <div class="player-list">
      <div 
        v-for="user in filteredUsers" 
        :key="user.id"
        class="player-row"
        @click="handleUserClick(user)"
      >
        <div class="player-avatar">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="#A09080"/>
          </svg>
          <div class="dot" :class="user.status" v-if="user.status === 'online' || user.status === 'playing'"></div>
        </div>
        <div class="player-info">
          <div class="player-name">
            {{ user.nickname || user.username }}
          </div>
          <div class="player-meta">Lv.{{ user.level }} · {{ user.score }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import lobbyApi from '@/api/lobby'

const userStore = useUserStore()
const searchQuery = ref('')
const onlineUsers = ref([])

const userLevel = computed(() => {
  const wins = userStore.userInfo?.wins || 0
  const losses = userStore.userInfo?.losses || 0
  const draws = userStore.userInfo?.draws || 0
  const totalGames = wins + losses + draws
  return Math.floor(totalGames / 10) + 1
})

const userScore = computed(() => {
  const wins = userStore.userInfo?.wins || 0
  const losses = userStore.userInfo?.losses || 0
  return 1000 + wins * 10 - losses * 5
})

const filteredUsers = computed(() => {
  let users = [...onlineUsers.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    users = users.filter(u => 
      (u.nickname?.toLowerCase().includes(query)) || 
      (u.username?.toLowerCase().includes(query))
    )
  }
  
  return users
})

const fetchOnlinePlayers = async () => {
  try {
    const result = await lobbyApi.getOnlinePlayers()
    if (result.success) {
      onlineUsers.value = result.data.players || []
    }
  } catch (error) {
    console.error('[UserList] 获取在线玩家列表失败:', error)
  }
}

const handleUserClick = (user) => {
  console.log('User clicked:', user)
}

let refreshInterval = null

onMounted(() => {
  fetchOnlinePlayers()
  refreshInterval = setInterval(fetchOnlinePlayers, 10000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

watch(
  () => userStore.isAuthenticated,
  () => {
    fetchOnlinePlayers()
  }
)
</script>

<style scoped>
.right-panel {
  width: 100%;
  height: 100%;
  background: var(--bg-rp);
  border-left: 1px solid var(--border-sidebar);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-info-section {
  flex-shrink: 0;
  padding: 12px 10px;
  background: var(--bg-main);
  border-bottom: 1px solid var(--border-sidebar);
}

.user-info-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.user-avatar-large {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text-large {
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.user-name-level {
  flex: 1;
  min-width: 0;
}

.user-nickname {
  font-size: 13px;
  font-weight: 600;
  color: var(--txt-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-level-score {
  font-size: 11px;
  color: var(--txt-muted);
}

.user-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--txt-primary);
}

.stat-label {
  font-size: 10px;
  color: var(--txt-muted);
}

.stat-divider {
  width: 1px;
  height: 20px;
  background: var(--border-sidebar);
}

.rp-header-wrap {
  flex-shrink: 0;
  padding: 12px 10px 0;
  background: var(--bg-rp);
  z-index: 1;
}

.rp-header {
  font-size: 11px;
  color: var(--txt-muted);
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rp-header .count {
  color: var(--accent);
  font-weight: 500;
}

.rp-search {
  width: 100%;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-card);
  background: var(--bg-main);
  color: var(--txt-primary);
  margin-bottom: 10px;
  outline: none;
}

.rp-search::placeholder {
  color: var(--txt-faint);
}

.player-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px 12px;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 0;
  border-bottom: 1px solid rgba(0,0,0,.04);
  cursor: pointer;
}

.player-row:last-child {
  border-bottom: none;
}

.player-row:hover {
  background: rgba(255,255,255,.3);
  margin: 0 -10px;
  padding-left: 10px;
  padding-right: 10px;
}

.player-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #D0C5B5;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.player-avatar .dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--online-dot);
  border: 1.5px solid var(--bg-rp);
}

.player-avatar .dot.playing {
  background: var(--accent);
}

.player-info {
  flex: 1;
  min-width: 0;
}

.player-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--txt-primary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.player-meta {
  font-size: 10px;
  color: var(--txt-muted);
  margin-top: 1px;
}
</style>
