import { api } from 'boot/axios'

export interface Mercado {
  id: number
  nome?: string
  tipo?: string
  endereco?: string
  bairro?: string
}

export type MercadoRequest = {
  nome?: string
  tipo?: string
  endereco?: string
  bairro?: string
}

const base = '/mercados'

export const mercadosService = {
  listar: () => api.get<Mercado[]>(base).then((r) => r.data),
  criar: (body: MercadoRequest) => api.post<Mercado>(base, body).then((r) => r.data),
  atualizar: (id: number, body: MercadoRequest) =>
    api.put<Mercado>(`${base}/${id}`, body).then((r) => r.data),
  remover: (id: number) => api.delete(`${base}/${id}`).then(() => undefined)
}
