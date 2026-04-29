<template>
  <div class="table-card" @click="handleClick" :data-table-number="table.number">
    <div class="slot left-slot">
      <div class="avatar-wrapper">
        <div v-if="table.player1" class="player-avatar" :style="player1Avatar.style">
          <svg :viewBox="player1Avatar.svgData.viewBox" class="avatar-svg">
            <defs>
              <linearGradient v-if="player1Avatar.svgData.gradient" id="grad-p1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" :style="'stop-color:' + player1Avatar.svgData.gradient.start" />
                <stop offset="100%" :style="'stop-color:' + player1Avatar.svgData.gradient.end" />
              </linearGradient>
            </defs>
            <path
              v-for="(path, index) in player1Avatar.svgData.paths"
              :key="index"
              :d="path.d"
              :fill="path.fill || 'url(#grad-p1)'"
              :stroke="path.stroke"
              :stroke-width="path.strokeWidth || 0"
            />
            <circle
              v-for="(circle, index) in player1Avatar.svgData.circles"
              :key="'circle-p1-' + index"
              :cx="circle.cx"
              :cy="circle.cy"
              :r="circle.r"
              :fill="circle.fill"
              :opacity="circle.opacity"
            />
          </svg>
        </div>
        <div v-else class="avatar-wrapper-empty">
          <svg class="avatar-svg" viewBox="0 0 36 36" width="36" height="36">
            <defs>
              <circle id="avatar-circle-empty-l" cx="18" cy="18" r="16.5"/>
            </defs>
            <use 
              xlink:href="#avatar-circle-empty-l" 
              class="avatar-border dashed"
            />
            <g class="avatar-icon faint" transform="translate(10, 8)">
              <path d="M8 8c1.8 0 3.2-1.4 3.2-3.2S9.8 1.6 8 1.6 4.8 3 4.8 4.8 6.2 8 8 8zm0 1.6c-2.1 0-6.4 1.1-6.4 3.2v1.6h12.8V12.8c0-2.1-4.3-3.2-6.4-3.2z" 
                fill="#D0C5B5"/>
            </g>
          </svg>
        </div>
      </div>
      <div class="player-name" v-if="table.player1">{{ table.player1.name }}</div>
      <div class="player-name empty" v-else>&nbsp;</div>
    </div>
    
    <div class="table-center">
      <div class="table-icon" :class="boardClass">
        <div class="table-grid">
          <div class="grid-h-line" v-for="n in 5" :key="n"></div>
        </div>
      </div>
      <div class="table-num">— {{ table.number }} —</div>
    </div>
    
    <div class="slot right-slot">
      <div class="avatar-wrapper">
        <div v-if="table.player2" class="player-avatar" :style="player2Avatar.style">
          <svg :viewBox="player2Avatar.svgData.viewBox" class="avatar-svg">
            <defs>
              <linearGradient v-if="player2Avatar.svgData.gradient" id="grad-p2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" :style="'stop-color:' + player2Avatar.svgData.gradient.start" />
                <stop offset="100%" :style="'stop-color:' + player2Avatar.svgData.gradient.end" />
              </linearGradient>
            </defs>
            <path
              v-for="(path, index) in player2Avatar.svgData.paths"
              :key="index"
              :d="path.d"
              :fill="path.fill || 'url(#grad-p2)'"
              :stroke="path.stroke"
              :stroke-width="path.strokeWidth || 0"
            />
            <circle
              v-for="(circle, index) in player2Avatar.svgData.circles"
              :key="'circle-p2-' + index"
              :cx="circle.cx"
              :cy="circle.cy"
              :r="circle.r"
              :fill="circle.fill"
              :opacity="circle.opacity"
            />
          </svg>
        </div>
        <div v-else class="avatar-wrapper-empty">
          <svg class="avatar-svg" viewBox="0 0 36 36" width="36" height="36">
            <defs>
              <circle id="avatar-circle-empty-r" cx="18" cy="18" r="16.5"/>
            </defs>
            <use 
              xlink:href="#avatar-circle-empty-r" 
              class="avatar-border dashed"
            />
            <g class="avatar-icon faint" transform="translate(10, 8)">
              <path d="M8 8c1.8 0 3.2-1.4 3.2-3.2S9.8 1.6 8 1.6 4.8 3 4.8 4.8 6.2 8 8 8zm0 1.6c-2.1 0-6.4 1.1-6.4 3.2v1.6h12.8V12.8c0-2.1-4.3-3.2-6.4-3.2z" 
                fill="#D0C5B5"/>
            </g>
          </svg>
        </div>
      </div>
      <div class="player-name" v-if="table.player2">{{ table.player2.name }}</div>
      <div class="player-name empty" v-else>&nbsp;</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getAvatarById, avatars } from '@/config/avatars'

const props = defineProps({
  table: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const hasBothPlayers = computed(() => {
  return props.table.player1 && props.table.player2
})

const boardClass = computed(() => {
  if (hasBothPlayers.value) {
    return 'active'
  }
  return 'inactive'
})

const defaultAvatar = computed(() => avatars[0])

const player1Avatar = computed(() => {
  if (props.table.player1 && props.table.player1.avatar) {
    return getAvatarById(props.table.player1.avatar)
  }
  return defaultAvatar.value
})

const player2Avatar = computed(() => {
  if (props.table.player2 && props.table.player2.avatar) {
    return getAvatarById(props.table.player2.avatar)
  }
  return defaultAvatar.value
})

const handleClick = () => {
  emit('click', props.table)
}
</script>

<style scoped>
.table-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 8px;
  background: transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.table-card:hover {
  background: rgba(255,250,246,0.5);
}

.slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 52px;
}

.avatar-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-wrapper-empty {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid var(--accent);
  box-shadow: 0 0 0 2px rgba(224, 120, 64, 0.2);
}

.avatar-svg {
  width: 100%;
  height: 100%;
}

.avatar-border {
  stroke-width: 1;
  fill: none;
}

.avatar-border.dashed {
  stroke: rgba(208, 197, 181, 0.6);
  stroke-dasharray: 5 2;
}

.avatar-border.solid {
  stroke: var(--accent);
  stroke-dasharray: none;
}

.avatar-icon.faint {
  opacity: 0.6;
}

.avatar-icon.active {
  opacity: 1;
}

.player-name {
  font-size: 10px;
  color: var(--txt-secondary);
  margin-top: 4px;
  max-width: 52px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-name.empty {
  visibility: hidden;
}

.table-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.table-icon {
  width: 60px;
  height: 44px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-icon.active {
  background: var(--accent);
}

.table-icon.inactive {
  background: #E8E0D4;
}

.table-grid {
  width: 48px;
  height: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.grid-h-line {
  height: 1px;
  background: rgba(255,255,255,.6);
}

.table-icon.inactive .grid-h-line {
  background: rgba(160, 144, 128, 0.4);
}

.table-num {
  font-size: 10px;
  color: var(--txt-faint);
  letter-spacing: .04em;
}
</style>
