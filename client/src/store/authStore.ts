import { create } from 'zustand'
import { api } from '../shared/api'

type User = {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
}

type AuthState = {
  user: User | null
  token: string | null
  loading: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
  loadFromStorage: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,

  setAuth: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null, loading: false })
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    if (token && user) {
      set({
        token,
        user: JSON.parse(user),
      })
    } else {
      set({
        token: null,
        user: null,
      })
    }
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token')

      if (!token) {
        set({ token: null, user: null, loading: false })
        return
      }

      const res = await api.get('/auth/me')

      localStorage.setItem('user', JSON.stringify(res.data))

      set({
        token,
        user: res.data,
        loading: false,
      })
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      set({
        token: null,
        user: null,
        loading: false,
      })
    }
  },
}))