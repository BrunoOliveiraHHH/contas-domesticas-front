import { defineStore } from 'pinia'
import {
  listasCompraService,
  itensCompraService,
  cotacoesProdutoService,
  type ListaCompra,
  type ListaCompraRequest,
  type ItemCompra,
  type ItemCompraRequest,
  type CotacaoProduto,
  type CotacaoProdutoRequest,
  type StatusLista
} from 'src/services/compras'

interface State {
  itens: ListaCompra[]
  carregando: boolean
  listaAtual: ListaCompra | null
  itensLista: ItemCompra[]
}

export const useComprasStore = defineStore('compras', {
  state: (): State => ({ itens: [], carregando: false, listaAtual: null, itensLista: [] }),
  actions: {
    async carregar(status?: StatusLista) {
      this.carregando = true
      try {
        this.itens = await listasCompraService.listar(status)
      } finally {
        this.carregando = false
      }
    },
    async salvar(req: ListaCompraRequest, id?: number) {
      if (id) await listasCompraService.atualizar(id, req)
      else await listasCompraService.criar(req)
      await this.carregar()
    },
    async duplicar(id: number) {
      await listasCompraService.duplicar(id)
      await this.carregar()
    },
    async fechar(id: number, categoriaId: number) {
      const despesas = await listasCompraService.fechar(id, categoriaId)
      await this.carregar()
      return despesas
    },
    async remover(id: number) {
      await listasCompraService.remover(id)
      await this.carregar()
    },
    async abrir(id: number) {
      this.listaAtual = await listasCompraService.obter(id)
      await this.carregarItens(id)
    },
    async carregarItens(listaId: number) {
      this.itensLista = await itensCompraService.listar(listaId)
    },
    async adicionarItem(listaId: number, req: ItemCompraRequest) {
      await itensCompraService.adicionar(listaId, req)
      await this.carregarItens(listaId)
    },
    async reporEstoque(listaId: number) {
      const adicionados = await itensCompraService.reporEstoque(listaId)
      await this.carregarItens(listaId)
      return adicionados
    },
    async escolherMercado(listaId: number, itemId: number, mercadoId: number) {
      await itensCompraService.escolher(itemId, mercadoId)
      await this.carregarItens(listaId)
    },
    async removerItem(listaId: number, itemId: number) {
      await itensCompraService.remover(itemId)
      await this.carregarItens(listaId)
    },
    cotacoes(produtoId: number): Promise<CotacaoProduto[]> {
      return cotacoesProdutoService.listar(produtoId)
    },
    async adicionarCotacao(produtoId: number, req: CotacaoProdutoRequest) {
      return cotacoesProdutoService.adicionar(produtoId, req)
    }
  }
})
