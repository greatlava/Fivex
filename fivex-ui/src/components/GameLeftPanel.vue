<template>
  <div class="left-panel">
    <div class="panel-section self-section" :class="{ active: isMyTurn }">
      <div class="section-header">
        <span class="section-title">你</span>
        <span class="color-indicator" :class="myColor">
          {{ myColor === 'black' ? '黑方' : '白方' }}
        </span>
      </div>
      
      <div class="player-card">
        <div class="player-avatar" :style="selfPlayerAvatar.style">
          <svg :viewBox="selfPlayerAvatar.svgData.viewBox" class="avatar-svg">
            <defs>
              <linearGradient v-if="selfPlayerAvatar.svgData.gradient" id="grad-me" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" :style="'stop-color:' + selfPlayerAvatar.svgData.gradient.start" />
                <stop offset="100%" :style="'stop-color:' + selfPlayerAvatar.svgData.gradient.end" />
              </linearGradient>
            </defs>
            <path
              v-for="(path, index) in selfPlayerAvatar.svgData.paths"
              :key="index"
              :d="path.d"
              :fill="path.fill || 'url(#grad-me)'"
              :stroke="path.stroke"
              :stroke-width="path.strokeWidth || 0"
            />
            <circle
              v-for="(circle, index) in selfPlayerAvatar.svgData.circles"
              :key="'circle-me-' + index"
              :cx="circle.cx"
              :cy="circle.cy"
              :r="circle.r"
              :fill="circle.fill"
              :opacity="circle.opacity"
            />
          </svg>
        </div>
        
        <div class="player-info">
          <div class="player-name">{{ selfPlayerName }}</div>
          <div class="timer-display" :class="{ warning: isTimeLow }">
            <svg viewBox="0 0 24 24" width="16" height="16" class="timer-icon">
              <path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2ZM12 20C7.6 20 4 16.4 4 12S7.6 4 12 4 20 7.6 20 12 16.4 20 12 20ZM12.5 7H11V13L16.2 16.1L17 14.9L12.5 12.2V7Z" 
                fill="currentColor"/>
            </svg>
            <span class="timer-value">{{ gameStore.formattedTime }}</span>
          </div>
        </div>
      </div>
      
      <div class="score-display">
        <span class="score-label">比分</span>
        <span class="score-value">{{ selfScore }}</span>
      </div>
    </div>

    <div class="panel-divider"></div>

    <div class="panel-section opponent-section" :class="{ active: !isMyTurn && hasOpponent }">
      <div class="section-header">
        <span class="section-title">对手</span>
        <span class="color-indicator" :class="opponentColor">
          {{ opponentColor === 'black' ? '黑方' : '白方' }}
        </span>
      </div>
      
      <div class="player-card">
        <div class="player-avatar" :style="opponentPlayerAvatar.style">
          <svg v-if="hasOpponent" :viewBox="opponentPlayerAvatar.svgData.viewBox" class="avatar-svg">
            <defs>
              <linearGradient v-if="opponentPlayerAvatar.svgData.gradient" id="grad-opp" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" :style="'stop-color:' + opponentPlayerAvatar.svgData.gradient.start" />
                <stop offset="100%" :style="'stop-color:' + opponentPlayerAvatar.svgData.gradient.end" />
              </linearGradient>
            </defs>
            <path
              v-for="(path, index) in opponentPlayerAvatar.svgData.paths"
              :key="index"
              :d="path.d"
              :fill="path.fill || 'url(#grad-opp)'"
              :stroke="path.stroke"
              :stroke-width="path.strokeWidth || 0"
            />
            <circle
              v-for="(circle, index) in opponentPlayerAvatar.svgData.circles"
              :key="'circle-opp-' + index"
              :cx="circle.cx"
              :cy="circle.cy"
              :r="circle.r"
              :fill="circle.fill"
              :opacity="circle.opacity"
            />
          </svg>
          <div v-else class="avatar-placeholder">
            <svg viewBox="0 0 24 24" width="32" height="32" class="placeholder-icon">
              <path d="M12 12C14.2 12 16 10.2 16 8C16 5.8 14.2 4 12 4C9.8 4 8 5.8 8 8C8 10.2 9.8 12 12 12ZM12 14C9.3 14 4 15.3 4 18V20H20V18C20 15.3 14.7 14 12 14Z" 
                fill="currentColor"/>
            </svg>
          </div>
        </div>
        
        <div class="player-info">
          <div class="player-name">{{ opponentPlayerName || '等待对手...' }}</div>
          <div class="timer-display" :class="{ warning: isTimeLow }">
            <svg viewBox="0 0 24 24" width="16" height="16" class="timer-icon">
              <path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2ZM12 20C7.6 20 4 16.4 4 12S7.6 4 12 4 20 7.6 20 12 16.4 20 12 20ZM12.5 7H11V13L16.2 16.1L17 14.9L12.5 12.2V7Z" 
                fill="currentColor"/>
            </svg>
            <span class="timer-value">{{ hasOpponent ? gameStore.formattedTime : '--:--' }}</span>
          </div>
        </div>
      </div>
      
      <div class="score-display">
        <span class="score-label">比分</span>
        <span class="score-value">{{ opponentScore }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import { getAvatarById, avatars } from '@/config/avatars'

const props = defineProps({
  player1: {
    type: Object,
    default: null
  },
  player2: {
    type: Object,
    default: null
  },
  myColor: {
    type: String,
    default: 'black'
  },
  isGameStarted: {
    type: Boolean,
    default: false
  }
})

const gameStore = useGameStore()
const userStore = useUserStore()

const defaultAvatar = avatars[0]

const opponentColor = computed(() => {
  return props.myColor === 'black' ? 'white' : 'black'
})

const isMyTurn = computed(() => {
  return gameStore.isMyTurn
})

const isTimeLow = computed(() => {
  return gameStore.timerRemaining < 60
})

const selfPlayer = computed(() => {
  if (props.myColor === 'black') {
    return props.player1
  }
  return props.player2
})

const opponentPlayer = computed(() => {
  if (props.myColor === 'black') {
    return props.player2
  }
  return props.player1
})

const hasOpponent = computed(() => {
  return !!opponentPlayer.value
})

const selfPlayerName = computed(() => {
  if (selfPlayer.value && selfPlayer.value.name) {
    return selfPlayer.value.name
  }
  if (userStore.userInfo) {
    return userStore.userInfo.nickname || userStore.userInfo.username || '玩家'
  }
  return '玩家'
})

const selfPlayerAvatar = computed(() => {
  if (selfPlayer.value && selfPlayer.value.avatar) {
    return getAvatarById(selfPlayer.value.avatar)
  }
  if (userStore.userInfo && userStore.userInfo.avatar) {
    return getAvatarById(userStore.userInfo.avatar)
  }
  return defaultAvatar
})

const opponentPlayerName = computed(() => {
  if (opponentPlayer.value && opponentPlayer.value.name) {
    return opponentPlayer.value.name
  }
  return null
})

const opponentPlayerAvatar = computed(() => {
  if (opponentPlayer.value && opponentPlayer.value.avatar) {
    return getAvatarById(opponentPlayer.value.avatar)
  }
  return defaultAvatar
})

const selfScore = computed(() => {
  if (props.myColor === 'black') {
    return gameStore.currentScore.player1
  }
  return gameStore.currentScore.player2
})

const opponentScore = computed(() => {
  if (opponentColor.value === 'black') {
    return gameStore.currentScore.player1
  }
  return gameStore.currentScore.player2
})
</script>

<style scoped>
.left-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-main);
}

.panel-section {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all var(--transition-fast);
}

.panel-section.active {
  background: rgba(224, 120, 64, 0.05);
}

.self-section.active {
  border-left: 3px solid var(--accent);
}

.opponent-section.active {
  border-left: 3px solid var(--accent-btn);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--txt-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.color-indicator {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: var(--radius-full);
}

.color-indicator.black {
  background: #1A1A1A;
  color: white;
}

.color-indicator.white {
  background: #F5F0E8;
  color: #1A1A1A;
  border: 1px solid #D0C5B5;
}

.player-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid var(--accent);
  box-shadow: 0 0 0 2px rgba(224, 120, 64, 0.2);
  flex-shrink: 0;
}

.avatar-svg {
  width: 100%;
  height: 100%;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card-empty);
}

.placeholder-icon {
  color: var(--txt-faint);
}

.player-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.player-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--txt-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.timer-display {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--bg-card-empty);
  border-radius: var(--radius-md);
  width: fit-content;
}

.timer-display.warning {
  background: rgba(239, 83, 80, 0.1);
  color: var(--color-error);
}

.timer-icon {
  color: var(--txt-muted);
}

.timer-display.warning .timer-icon {
  color: var(--color-error);
}

.timer-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--txt-secondary);
  font-family: 'SF Mono', 'Monaco', monospace;
}

.timer-display.warning .timer-value {
  color: var(--color-error);
}

.score-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-card);
}

.score-label {
  font-size: 12px;
  color: var(--txt-muted);
}

.score-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
}

.panel-divider {
  height: 1px;
  background: var(--border-card);
  margin: 0 16px;
}
</style>