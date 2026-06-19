import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { logout as logoutApi } from '@/api/user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(sessionStorage.getItem('token') || '')

  const isLoggedIn = computed(() => !!token.value)

  function login(newToken) {
    token.value = newToken
    sessionStorage.setItem('token', newToken)
  }

  async function logout() {
    try {
      await logoutApi()
    } catch (e) {
      // 即使接口失败也要清除本地状态
    }
    token.value = ''
    sessionStorage.removeItem('token')
  }

  return {
    token,
    isLoggedIn,
    login,
    logout
  }
})
