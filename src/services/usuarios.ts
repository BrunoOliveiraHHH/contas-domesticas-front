import { api } from 'boot/axios'

export interface Usuario {
  id: number
  login: string
  nomeExibicao: string
}

export const usuariosService = {
  listar: () => api.get<Usuario[]>('/usuarios').then((r) => r.data)
}
