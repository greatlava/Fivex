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
      <button class="btn-quick" @click="quickStart">快速开始</button>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TableCard from './TableCard.vue'

const props = defineProps({
  currentRegion: {
    type: String,
    default: '华东一区'
  }
})

const quickStart = () => {
  console.log('Quick start game')
}

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

const handleTableClick = (table) => {
  console.log('Table clicked:', table)
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