import { defineStore } from 'pinia'
import { api } from 'boot/axios'

interface Tokens {
  accessToken: string
  refreshToken?: string
}

interface LoginRequest {
  login: string
  senha: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    refreshToken: null as string | null,
    usuario: null as unknown
  }),
  getters: {
    autenticado: (s): boolean => !!s.accessToken
  },
  actions: {
    setTokens(t: Tokens) {
      this.accessToken = t.accessToken
      this.refreshToken = t.refreshToken ?? null
      // espelho para o interceptor do Axios
      localStorage.setItem('cd_access_token', t.accessToken)
    },
    async login(req: LoginRequest) {
      const { data } = await api.post<Tokens>('/auth/login', req)
      this.setTokens(data)
      return data
    },
    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.usuario = null
      localStorage.removeItem('cd_access_token')
    }
  },
  persist: true
})
