<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

onMounted(() => {
  const userStore = useUserStore()
  userStore.initSocketOnStartup()
})
</script>

<style>
#app {
  width: 100%;
  height: 100%;
}
</style>
