import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const userId = ref(Number(localStorage.getItem('userId') || 0))
  const role = ref(localStorage.getItem('role') || '')
  const avatarUrl = ref(localStorage.getItem('avatarUrl') || '')

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => role.value === 'admin')

  function login(userData: { access_token: string; username: string; user_id: number; role: string }) {
    token.value = userData.access_token
    username.value = userData.username
    userId.value = userData.user_id
    role.value = userData.role

    localStorage.setItem('token', userData.access_token)
    localStorage.setItem('username', userData.username)
    localStorage.setItem('userId', String(userData.user_id))
    localStorage.setItem('role', userData.role)
  }

  function setAvatar(url: string) {
    avatarUrl.value = url
    localStorage.setItem('avatarUrl', url)
  }

  function logout() {
    token.value = ''
    username.value = ''
    userId.value = 0
    role.value = ''
    avatarUrl.value = ''
    localStorage.clear()
  }

  return { token, username, userId, role, avatarUrl, isLoggedIn, isAdmin, login, logout, setAvatar }
})