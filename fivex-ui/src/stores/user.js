import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import authApi from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || null)
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  function setUserInfo(info) {
    userInfo.value = info
    if (info) {
      localStorage.setItem('userInfo', JSON.stringify(info))
    } else {
      localStorage.removeItem('userInfo')
    }
  }

  function logout() {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  async function fetchUserInfo() {
    if (!token.value) return false

    try {
      isLoading.value = true
      const result = await authApi.getCurrentUser()
      if (result.success) {
        setUserInfo(result.data)
        return true
      }
      return false
    } catch (error) {
      console.error('[UserStore] 获取用户信息失败:', error)
      logout()
      return false
    } finally {
      isLoading.value = false
    }
  }

  watch(
    () => token.value,
    (newToken) => {
      if (newToken && !userInfo.value) {
        fetchUserInfo()
      }
    },
    { immediate: true }
  )

  return {
    token,
    userInfo,
    isLoading,
    isAuthenticated,
    setToken,
    setUserInfo,
    logout,
    fetchUserInfo
  }
})
