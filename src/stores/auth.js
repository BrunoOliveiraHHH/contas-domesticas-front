import { defineStore } from 'pinia'
import { api } from 'boot/axios'

// Store de autenticacao (bloco autenticacao). Persiste o token em localStorage.
export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('cd_access_token') || null,
    refreshToken: localStorage.getItem('cd_refresh_token') || null,
    usuario: null
  }),
  getters: {
    autenticado: (s) => !!s.accessToken
  },
  actions: {
    setTokens({ accessToken, refreshToken }) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      localStorage.setItem('cd_access_token', accessToken)
      if (refreshToken) localStorage.setItem('cd_refresh_token', refreshToken)
    },
    async login(loginReq) {
      const { data } = await api.post('/auth/login', loginReq)
      this.setTokens(data)
      return data
    },
    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.usuario = null
      localStorage.removeItem('cd_access_token')
      localStorage.removeItem('cd_refresh_token')
    }
  }
})
