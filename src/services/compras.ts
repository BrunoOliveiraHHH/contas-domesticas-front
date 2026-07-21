import { api } from 'boot/axios'
import type { Lancamento } from 'src/services/lancamentos'

export type TipoLista = 'MANTIMENTOS' | 'CONSTRUCAO'
export type StatusLista = 'ABERTA' | 'FECHADA' | 'ARQUIVADA'
export type OrigemCotacao = 'COTACAO' | 'COMPRA'

export interface ListaCompra {
  id: number
  nome: string
  tipo: TipoLista
  carteiraId: number
  data: string | null
  status: StatusLista
}

export interface ListaCompraRequest {
  nome: string
  tipo: TipoLista
  carteiraId: number
  data?: string | null
}

export interface ItemCompra {
  id: number
  listaCompraId: number
  produtoId: number
  produtoNome: string
  quantidade: number
  unidadeMedidaId: number | null
  mercadoEscolhidoId: number | null
  precoUnitario: number | null
  comprado: boolean
}

export interface ItemCompraRequest {
  produtoId: number
  quantidade: number
  unidadeMedidaId?: number | null
}

export interface CotacaoProduto {
  id: number
  produtoId: number
  mercadoId: number
  precoUnitario: number
  data: string | null
  origem: OrigemCotacao
}

export interface CotacaoProdutoRequest {
  mercadoId: number
  precoUnitario: number
  data?: string | null
}

const base = '/listas-compra'

export const listasCompraService = {
  listar: (status?: StatusLista) =>
    api.get<ListaCompra[]>(base, { params: status ? { status } : {} }).then((r) => r.data),
  obter: (id: number) => api.get<ListaCompra>(`${base}/${id}`).then((r) => r.data),
  criar: (body: ListaCompraRequest) => api.post<ListaCompra>(base, body).then((r) => r.data),
  atualizar: (id: number, body: ListaCompraRequest) =>
    api.put<ListaCompra>(`${base}/${id}`, body).then((r) => r.data),
  fechar: (id: number, categoriaId: number) =>
    api.post<Lancamento[]>(`${base}/${id}/fechar`, { categoriaId }).then((r) => r.data),
  duplicar: (id: number) => api.post<ListaCompra>(`${base}/${id}/duplicar`, {}).then((r) => r.data),
  remover: (id: number) => api.delete(`${base}/${id}`).then(() => undefined)
}

export const itensCompraService = {
  listar: (listaId: number) =>
    api.get<ItemCompra[]>(`${base}/${listaId}/itens`).then((r) => r.data),
  adicionar: (listaId: number, body: ItemCompraRequest) =>
    api.post<ItemCompra>(`${base}/${listaId}/itens`, body).then((r) => r.data),
  escolher: (itemId: number, mercadoId: number) =>
    api.put<ItemCompra>(`/itens/${itemId}/escolha`, { mercadoId }).then((r) => r.data),
  remover: (itemId: number) => api.delete(`/itens/${itemId}`).then(() => undefined)
}

export const cotacoesProdutoService = {
  listar: (produtoId: number) =>
    api.get<CotacaoProduto[]>(`/produtos/${produtoId}/cotacoes`).then((r) => r.data),
  adicionar: (produtoId: number, body: CotacaoProdutoRequest) =>
    api.post<CotacaoProduto>(`/produtos/${produtoId}/cotacoes`, body).then((r) => r.data)
}
