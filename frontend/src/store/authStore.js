import { create } from 'zustand'
import api from '../api/axios'

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,

  login: async (email, password) => {
  set({ loading: true })
  try {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    set({ user: data.user, token: data.token, loading: false })
    return data.user
  } catch (err) {
    set({ loading: false })   // ← this was missing, button was stuck
    throw err
  }
},

register: async (name, email, password, role) => {
  set({ loading: true })
  try {
    const { data } = await api.post('/auth/register', { name, email, password, role })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    set({ user: data.user, token: data.token, loading: false })
    return data.user
  } catch (err) {
    set({ loading: false })   // ← same fix for register
    throw err
  }
},

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  }
}))

export default useAuthStore