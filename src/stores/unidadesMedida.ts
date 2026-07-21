import { defineStore } from 'pinia'
import {
  unidadesMedidaService,
  type UnidadeMedida,
  type UnidadeMedidaRequest
} from 'src/services/unidadesMedida'

export const useUnidadeMedidaStore = defineStore('unidadesMedida', {
  state: () => ({ itens: [] as UnidadeMedida[], carregando: false }),
  actions: {
    async carregar() {
      this.carregando = true
      try {
        this.itens = await unidadesMedidaService.listar()
      } finally {
        this.carregando = false
      }
    },
    async salvar(req: UnidadeMedidaRequest, id?: number) {
      if (id) await unidadesMedidaService.atualizar(id, req)
      else await unidadesMedidaService.criar(req)
      await this.carregar()
    },
    async remover(id: number) {
      await unidadesMedidaService.remover(id)
      await this.carregar()
    }
  }
})
