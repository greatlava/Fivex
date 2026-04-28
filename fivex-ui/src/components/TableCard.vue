<template>
  <div class="table-card" @click="handleClick">
    <div class="slot left-slot">
      <div class="avatar-wrapper">
        <svg class="avatar-svg" viewBox="0 0 36 36" width="36" height="36">
          <defs>
            <circle id="avatar-circle" cx="18" cy="18" r="16.5"/>
          </defs>
          <use 
            xlink:href="#avatar-circle" 
            class="avatar-border"
            :class="{ dashed: !table.player1, solid: table.player1 }"
          />
          <g class="avatar-icon" :class="{ faint: !table.player1 }" transform="translate(10, 8)">
            <path d="M8 8c1.8 0 3.2-1.4 3.2-3.2S9.8 1.6 8 1.6 4.8 3 4.8 4.8 6.2 8 8 8zm0 1.6c-2.1 0-6.4 1.1-6.4 3.2v1.6h12.8V12.8c0-2.1-4.3-3.2-6.4-3.2z" 
              :fill="table.player1 ? '#A09080' : '#D0C5B5'"/>
          </g>
        </svg>
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
        <svg class="avatar-svg" viewBox="0 0 36 36" width="36" height="36">
          <defs>
            <circle id="avatar-circle-r" cx="18" cy="18" r="16.5"/>
          </defs>
          <use 
            xlink:href="#avatar-circle-r" 
            class="avatar-border"
            :class="{ dashed: !table.player2, solid: table.player2 }"
          />
          <g class="avatar-icon" :class="{ faint: !table.player2 }" transform="translate(10, 8)">
            <path d="M8 8c1.8 0 3.2-1.4 3.2-3.2S9.8 1.6 8 1.6 4.8 3 4.8 4.8 6.2 8 8 8zm0 1.6c-2.1 0-6.4 1.1-6.4 3.2v1.6h12.8V12.8c0-2.1-4.3-3.2-6.4-3.2z" 
              :fill="table.player2 ? '#A09080' : '#D0C5B5'"/>
          </g>
        </svg>
      </div>
      <div class="player-name" v-if="table.player2">{{ table.player2.name }}</div>
      <div class="player-name empty" v-else>&nbsp;</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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

.avatar-svg {
  width: 36px;
  height: 36px;
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
  stroke: #C8BFB0;
  stroke-dasharray: none;
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