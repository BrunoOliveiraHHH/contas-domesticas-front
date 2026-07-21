import { api } from 'boot/axios'

export interface Categoria {
  id: number
  nome?: string
  tipo?: string
  cor?: string
}

export type CategoriaRequest = {
  nome?: string
  tipo?: string
  cor?: string
}

const base = '/categorias'

export const categoriasService = {
  listar: () => api.get<Categoria[]>(base).then((r) => r.data),
  criar: (body: CategoriaRequest) => api.post<Categoria>(base, body).then((r) => r.data),
  atualizar: (id: number, body: CategoriaRequest) =>
    api.put<Categoria>(`${base}/${id}`, body).then((r) => r.data),
  remover: (id: number) => api.delete(`${base}/${id}`).then(() => undefined)
}
