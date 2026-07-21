import { defineStore } from 'pinia'
import { produtosService, type Produto, type ProdutoRequest } from 'src/services/produtos'

export const useProdutoStore = defineStore('produtos', {
  state: () => ({ itens: [] as Produto[], carregando: false }),
  actions: {
    async carregar() {
      this.carregando = true
      try {
        this.itens = await produtosService.listar()
      } finally {
        this.carregando = false
      }
    },
    async salvar(req: ProdutoRequest, id?: number) {
      if (id) await produtosService.atualizar(id, req)
      else await produtosService.criar(req)
      await this.carregar()
    },
    async remover(id: number) {
      await produtosService.remover(id)
      await this.carregar()
    }
  }
})
