<template>
  <div class="lobby-container">
    <header class="logo-bar">
      <div class="logo-icon"></div>
      <span class="logo-text">橙众五子棋</span>
    </header>
    <main class="body-wrap">
      <aside class="lobby-left">
        <RegionList v-model="currentRegion" @update:regions="handleRegionsUpdate" />
      </aside>
      <section class="lobby-center">
        <TableGrid :currentRegion="currentRegion" :currentRegionName="currentRegionName" />
      </section>
      <aside class="lobby-right">
        <UserList />
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import RegionList from '@/components/RegionList.vue'
import TableGrid from '@/components/TableGrid.vue'
import UserList from '@/components/UserList.vue'

const currentRegion = ref('HD1')
const regions = ref([])

const currentRegionName = computed(() => {
  const region = regions.value.find(r => r.code === currentRegion.value)
  return region ? region.name : currentRegion.value
})

const handleRegionsUpdate = (newRegions) => {
  regions.value = newRegions
}
</script>

<style scoped>
.lobby-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--bg-page);
  color: var(--txt-primary);
  overflow: hidden;
}

.logo-bar {
  height: 48px;
  background: var(--bg-titlebar);
  border-bottom: 1px solid var(--border-sidebar);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 10px;
  flex-shrink: 0;
}

.logo-icon {
  width: 18px;
  height: 18px;
  background: var(--accent);
  border-radius: var(--radius-sm);
}

.logo-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--txt-primary);
  letter-spacing: .05em;
}

.body-wrap {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.lobby-left {
  width: 148px;
  flex-shrink: 0;
}

.lobby-center {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.lobby-right {
  width: 160px;
  flex-shrink: 0;
}
</style>