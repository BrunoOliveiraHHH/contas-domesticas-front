import { defineStore } from 'pinia'
import {
  recorrenciasService,
  type Recorrencia,
  type RecorrenciaRequest
} from 'src/services/recorrencias'

interface State {
  itens: Recorrencia[]
  carregando: boolean
}

export const useRecorrenciasStore = defineStore('recorrencias', {
  state: (): State => ({ itens: [], carregando: false }),
  actions: {
    async carregar() {
      this.carregando = true
      try {
        this.itens = await recorrenciasService.listar()
      } finally {
        this.carregando = false
      }
    },
    async salvar(req: RecorrenciaRequest, id?: number) {
      if (id) await recorrenciasService.atualizar(id, req)
      else await recorrenciasService.criar(req)
      await this.carregar()
    },
    gerar(id: number, competencia: string) {
      return recorrenciasService.gerar(id, competencia)
    },
    async remover(id: number) {
      await recorrenciasService.remover(id)
      await this.carregar()
    }
  }
})
