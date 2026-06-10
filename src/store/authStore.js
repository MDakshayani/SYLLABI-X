import { create } from 'zustand'
import { api } from '../lib/api'

const stored = () => {
  try {
    const u = localStorage.getItem('auth_user')
    return u ? JSON.parse(u) : null
  } catch { return null }
}

const useAuthStore = create((set, get) => ({
  user:    stored(),
  loading: false,
  error:   null,

  setUser: (user) => {
    set({ user, error: null })
    if (user) localStorage.setItem('auth_user', JSON.stringify(user))
    else      localStorage.removeItem('auth_user')
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null })
    try {
      const data = await api.register({ name, email, password })
      localStorage.setItem('access_token',  data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      get().setUser(data.user)
      return data
    } catch (e) {
      set({ error: e.message })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const data = await api.login({ email, password })
      localStorage.setItem('access_token',  data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      get().setUser(data.user)
      return data
    } catch (e) {
      set({ error: e.message })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  // Called by useGoogleAuth hook after Firebase popup succeeds
  // profile = { uid, name, email, photoURL } from Firebase result.user
  googleLogin: async (profile) => {
    set({ loading: true, error: null })
    try {
      const data = await api.googleAuth(profile)
      localStorage.setItem('access_token',  data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      // Merge photoURL from Firebase (backend doesn't store it)
      get().setUser({ ...data.user, photoURL: profile.photoURL || null })
      return data
    } catch (e) {
      set({ error: e.message })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    try { await api.logout() } catch (err) { console.error("Logout api error:", err) }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
    set({ user: null, error: null })
  },

  fetchProfile: async () => {
    try {
      const data = await api.profile()
      get().setUser(data.user)
      return data.user
    } catch (e) {
      if (e.status === 401) {
        get().logout()
      }
      throw e
    }
  },

  clearError: () => set({ error: null }),
  isAuthenticated: () => !!get().user && !!localStorage.getItem('access_token'),
}))

export default useAuthStore
