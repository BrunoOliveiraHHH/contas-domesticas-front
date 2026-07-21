import { api } from 'boot/axios'

export interface Produto {
  id: number
  nome?: string
  descricao?: string
  codigoBarras?: string
}

export type ProdutoRequest = {
  nome?: string
  descricao?: string
  codigoBarras?: string
}

const base = '/produtos'

export const produtosService = {
  listar: () => api.get<Produto[]>(base).then((r) => r.data),
  criar: (body: ProdutoRequest) => api.post<Produto>(base, body).then((r) => r.data),
  atualizar: (id: number, body: ProdutoRequest) =>
    api.put<Produto>(`${base}/${id}`, body).then((r) => r.data),
  remover: (id: number) => api.delete(`${base}/${id}`).then(() => undefined)
}
