<template>
  <div class="right-panel">
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
          <div class="dot" :class="user.status" v-if="user.status === 'online'"></div>
        </div>
        <div class="player-info">
          <div class="player-name">
            {{ user.name }}
            <span v-if="user.isVip" class="vip-badge">VIP</span>
          </div>
          <div class="player-meta">Lv.{{ user.level }} · {{ user.score }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')

const generateUsers = () => {
  const users = []
  const statuses = ['online', 'playing', 'idle']
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', 
                 '郑十一', '王十二', '冯十三', '陈十四', '褚十五', '卫十六', 
                 '蒋十七', '沈十八', '韩十九', '杨二十', '朱二十一', '秦二十二']
  
  for (let i = 1; i <= 50; i++) {
    const nameIndex = (i - 1) % names.length
    users.push({
      id: i,
      name: `${names[nameIndex]}${i}`,
      avatar: null,
      status: statuses[Math.floor(Math.random() * 3)],
      level: Math.floor(Math.random() * 30) + 1,
      score: Math.floor(Math.random() * 3000) + 1000,
      isVip: Math.random() > 0.7
    })
  }
  
  return users
}

const onlineUsers = ref(generateUsers())

const filteredUsers = computed(() => {
  let users = [...onlineUsers.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    users = users.filter(u => u.name.toLowerCase().includes(query))
  }
  
  return users
})

const handleUserClick = (user) => {
  console.log('User clicked:', user)
}
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

.vip-badge {
  font-size: 8px;
  padding: 1px 4px;
  border-radius: var(--radius-sm);
  background: var(--vip-bg);
  color: #fff;
  font-weight: 600;
  letter-spacing: .02em;
}

.player-meta {
  font-size: 10px;
  color: var(--txt-muted);
  margin-top: 1px;
}
</style>