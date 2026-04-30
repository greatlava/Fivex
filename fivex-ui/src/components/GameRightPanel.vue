<template>
  <div class="right-panel">
    <div class="user-profile-section">
      <div class="profile-header">
        <span class="section-title">个人信息</span>
      </div>
      
      <div class="profile-card">
        <div class="profile-avatar" :style="userAvatar.style">
          <svg :viewBox="userAvatar.svgData.viewBox" class="avatar-svg">
            <defs>
              <linearGradient v-if="userAvatar.svgData.gradient" id="grad-profile" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" :style="'stop-color:' + userAvatar.svgData.gradient.start" />
                <stop offset="100%" :style="'stop-color:' + userAvatar.svgData.gradient.end" />
              </linearGradient>
            </defs>
            <path
              v-for="(path, index) in userAvatar.svgData.paths"
              :key="index"
              :d="path.d"
              :fill="path.fill || 'url(#grad-profile)'"
              :stroke="path.stroke"
              :stroke-width="path.strokeWidth || 0"
            />
            <circle
              v-for="(circle, index) in userAvatar.svgData.circles"
              :key="'circle-profile-' + index"
              :cx="circle.cx"
              :cy="circle.cy"
              :r="circle.r"
              :fill="circle.fill"
              :opacity="circle.opacity"
            />
          </svg>
        </div>
        
        <div class="profile-info">
          <div class="profile-name">{{ userName }}</div>
          <div class="profile-username">@{{ username }}</div>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <div class="section-header">
        <span class="section-title">对战统计</span>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-value">{{ totalGames }}</div>
          <div class="stat-label">总盘数</div>
        </div>
        
        <div class="stat-card points">
          <div class="stat-value">{{ points }}</div>
          <div class="stat-label">积分</div>
        </div>
      </div>
      
      <div class="record-section">
        <div class="record-item win">
          <span class="record-label">胜</span>
          <span class="record-value">{{ wins }}</span>
        </div>
        <div class="record-divider"></div>
        <div class="record-item draw">
          <span class="record-label">平</span>
          <span class="record-value">{{ draws }}</span>
        </div>
        <div class="record-divider"></div>
        <div class="record-item lose">
          <span class="record-label">负</span>
          <span class="record-value">{{ losses }}</span>
        </div>
      </div>
      
      <div class="win-rate-section">
        <div class="win-rate-bar">
          <div class="win-rate-fill" :style="{ width: winRatePercent }"></div>
        </div>
        <div class="win-rate-text">胜率: {{ winRatePercent }}</div>
      </div>
    </div>

    <div class="action-section">
      <button class="exit-btn" @click="handleExit">
        <svg viewBox="0 0 24 24" width="18" height="18" class="exit-icon">
          <path d="M17 7L15.6 8.4L18.2 11H4V13H18.2L15.6 15.6L17 17L22 12L17 7ZM19 3H5C3.9 3 3 3.9 3 5V9H5V5H19V19H5V15H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" 
            fill="currentColor"/>
        </svg>
        退出游戏
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getAvatarById, avatars } from '@/config/avatars'
import lobbyApi from '@/api/lobby'

const router = useRouter()
const userStore = useUserStore()

const defaultAvatar = avatars[0]

const userAvatar = computed(() => {
  if (userStore.userInfo && userStore.userInfo.avatar) {
    return getAvatarById(userStore.userInfo.avatar)
  }
  return defaultAvatar
})

const userName = computed(() => {
  if (userStore.userInfo) {
    return userStore.userInfo.nickname || userStore.userInfo.username || '玩家'
  }
  return '玩家'
})

const username = computed(() => {
  if (userStore.userInfo) {
    return userStore.userInfo.username || 'player'
  }
  return 'player'
})

const wins = computed(() => {
  if (userStore.userInfo) {
    return userStore.userInfo.wins || 0
  }
  return 0
})

const losses = computed(() => {
  if (userStore.userInfo) {
    return userStore.userInfo.losses || 0
  }
  return 0
})

const draws = computed(() => {
  if (userStore.userInfo) {
    return userStore.userInfo.draws || 0
  }
  return 0
})

const totalGames = computed(() => {
  return wins.value + losses.value + draws.value
})

const points = computed(() => {
  return wins.value * 10 + draws.value * 3 - losses.value * 2
})

const winRatePercent = computed(() => {
  if (totalGames.value === 0) {
    return '0%'
  }
  const rate = Math.round((wins.value / totalGames.value) * 100)
  return `${rate}%`
})

const handleExit = async () => {
  try {
    await lobbyApi.leaveRoom('HD1')
  } catch (error) {
    console.error('离开房间失败:', error)
  }
  router.push('/lobby')
}
</script>

<style scoped>
.right-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-main);
  padding: 16px;
  gap: 16px;
}

.user-profile-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  align-items: center;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--txt-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-card);
}

.profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid var(--accent);
  box-shadow: 0 0 0 2px rgba(224, 120, 64, 0.2);
  flex-shrink: 0;
}

.avatar-svg {
  width: 100%;
  height: 100%;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--txt-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-username {
  font-size: 12px;
  color: var(--txt-muted);
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 10px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-card);
}

.stat-card.total {
  border-left: 3px solid var(--accent);
}

.stat-card.points {
  border-left: 3px solid var(--color-success);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--txt-primary);
}

.stat-label {
  font-size: 11px;
  color: var(--txt-muted);
  margin-top: 4px;
}

.record-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-card);
}

.record-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
}

.record-label {
  font-size: 11px;
  color: var(--txt-muted);
}

.record-value {
  font-size: 18px;
  font-weight: 700;
}

.record-item.win .record-value {
  color: var(--color-success);
}

.record-item.draw .record-value {
  color: var(--color-info);
}

.record-item.lose .record-value {
  color: var(--color-error);
}

.record-divider {
  width: 1px;
  height: 30px;
  background: var(--border-card);
  margin: 0 16px;
}

.win-rate-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.win-rate-bar {
  height: 8px;
  background: var(--bg-card-empty);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.win-rate-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.win-rate-text {
  font-size: 11px;
  color: var(--txt-muted);
  text-align: right;
}

.action-section {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--border-card);
}

.exit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-error);
  background: rgba(239, 83, 80, 0.05);
  border: 1px solid rgba(239, 83, 80, 0.3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.exit-btn:hover {
  background: rgba(239, 83, 80, 0.1);
  border-color: rgba(239, 83, 80, 0.5);
}

.exit-icon {
  flex-shrink: 0;
}
</style>