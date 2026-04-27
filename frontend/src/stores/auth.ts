import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type UserRole = 'admin' | 'user' | 'guest'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const login = (userData: User) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
  }

  const checkAuth = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser && savedUser !== 'undefined' && savedUser !== '') {
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        console.error('Error parsing user from localStorage', e)
        localStorage.removeItem('user')
      }
    }
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    checkAuth
  }
})
