import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'

// Instancia unica apontando para a API local do Contas Domesticas
const api = axios.create({ baseURL: (process.env.API_URL || 'http://localhost:8080') + '/api/v1' })

// Request: injeta o Bearer token (bloco de autenticacao)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cd_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response: tratamento de erro global + placeholder de refresh no 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      // TODO (bloco autenticacao): tentar /auth/refresh e repetir; senao, logout
    } else {
      Notify.create({ type: 'negative', message: error?.response?.data?.detail || 'Erro ao comunicar com a API' })
    }
    return Promise.reject(error)
  }
)

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
