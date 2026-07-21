import { defineStore } from 'pinia'
import { mercadosService, type Mercado, type MercadoRequest } from 'src/services/mercados'

export const useMercadoStore = defineStore('mercados', {
  state: () => ({ itens: [] as Mercado[], carregando: false }),
  actions: {
    async carregar() {
      this.carregando = true
      try {
        this.itens = await mercadosService.listar()
      } finally {
        this.carregando = false
      }
    },
    async salvar(req: MercadoRequest, id?: number) {
      if (id) await mercadosService.atualizar(id, req)
      else await mercadosService.criar(req)
      await this.carregar()
    },
    async remover(id: number) {
      await mercadosService.remover(id)
      await this.carregar()
    }
  }
})
