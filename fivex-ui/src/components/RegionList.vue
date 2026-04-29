<template>
  <div class="sidebar">
    <div class="sidebar-label">游戏大区</div>
    <div
      v-for="region in regions"
      :key="region.code"
      class="sidebar-item"
      :class="{ active: modelValue === region.code }"
      @click="selectRegion(region.code)"
    >
      <span class="name">{{ region.name }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import regionApi from '../api/region'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'HD1'
  }
})

const emit = defineEmits(['update:modelValue', 'update:regions'])

const regions = ref([])

const fetchRegions = async () => {
  try {
    const response = await regionApi.getRegions()
    if (response.success && response.data?.regions) {
      regions.value = response.data.regions
      emit('update:regions', regions.value)
    }
  } catch (error) {
    console.error('获取大区列表失败:', error)
  }
}

const selectRegion = (regionCode) => {
  emit('update:modelValue', regionCode)
}

onMounted(() => {
  fetchRegions()
})
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