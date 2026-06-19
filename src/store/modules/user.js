import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserMe } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)

  async function fetchUserInfo() {
    try {
      const res = await getUserMe()
      userInfo.value = res.data
      return res.data
    } catch (e) {
      userInfo.value = null
      throw e
    }
  }

  function clearUserInfo() {
    userInfo.value = null
  }

  return {
    userInfo,
    fetchUserInfo,
    clearUserInfo
  }
})
