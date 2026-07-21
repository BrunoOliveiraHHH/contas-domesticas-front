import { defineStore } from 'pinia'
import { carteirasService, type Carteira, type CarteiraRequest } from 'src/services/carteiras'

interface State {
  itens: Carteira[]
  carregando: boolean
}

export const useCarteirasStore = defineStore('carteiras', {
  state: (): State => ({ itens: [], carregando: false }),
  actions: {
    async carregar() {
      this.carregando = true
      try {
        this.itens = await carteirasService.listar()
      } finally {
        this.carregando = false
      }
    },
    async salvar(req: CarteiraRequest, id?: number) {
      if (id) await carteirasService.atualizar(id, req)
      else await carteirasService.criar(req)
      await this.carregar()
    },
    async remover(id: number) {
      await carteirasService.remover(id)
      await this.carregar()
    }
  }
})
