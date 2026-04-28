<template>
  <div class="sidebar">
    <div class="sidebar-label">游戏大区</div>
    <div
      v-for="region in regions"
      :key="region.id"
      class="sidebar-item"
      :class="{ active: selectedRegionId === region.id }"
      @click="selectRegion(region.id)"
    >
      <span class="name">{{ region.name }}</span>
      <span class="num">{{ region.onlineCount }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedRegionId = ref(1)

const regions = ref([
  { id: 1, name: '华东一区', onlineCount: 1256 },
  { id: 2, name: '华东二区', onlineCount: 987 },
  { id: 3, name: '华北一区', onlineCount: 2134 },
  { id: 4, name: '华南一区', onlineCount: 1876 },
  { id: 5, name: '华北二区', onlineCount: 654 },
  { id: 6, name: '华南二区', onlineCount: 432 }
])

const selectRegion = (regionId) => {
  selectedRegionId.value = regionId
}
</script>

<style scoped>
.sidebar {
  width: 100%;
  height: 100%;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-sidebar);
  padding: 14px 0 0;
  display: flex;
  flex-direction: column;
}

.sidebar-label {
  font-size: 10px;
  color: var(--txt-muted);
  padding: 0 14px 8px;
  letter-spacing: .06em;
}

.sidebar-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  font-size: 12px;
  color: var(--txt-secondary);
  cursor: pointer;
  transition: background var(--transition-fast);
  border-left: 3px solid transparent;
}

.sidebar-item:hover {
  background: rgba(255,255,255,.3);
}

.sidebar-item.active {
  background: var(--bg-main);
  color: var(--txt-primary);
  font-weight: 500;
  border-left-color: var(--accent);
}

.sidebar-item .name {
  color: inherit;
}

.sidebar-item .num {
  font-size: 11px;
  color: var(--accent-light);
}

.sidebar-item.active .num {
  color: var(--accent);
}
</style>