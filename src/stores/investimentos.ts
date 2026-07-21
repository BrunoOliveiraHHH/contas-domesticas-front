import { defineStore } from 'pinia'
import {
  investimentosService,
  type Investimento,
  type InvestimentoRequest,
  type AporteRequest
} from 'src/services/investimentos'

interface State {
  itens: Investimento[]
  patrimonio: number
  carregando: boolean
}

export const useInvestimentosStore = defineStore('investimentos', {
  state: (): State => ({ itens: [], patrimonio: 0, carregando: false }),
  actions: {
    async carregar() {
      this.carregando = true
      try {
        this.itens = await investimentosService.listar()
        this.patrimonio = (await investimentosService.patrimonio()).total
      } finally {
        this.carregando = false
      }
    },
    async salvar(req: InvestimentoRequest, id?: number) {
      if (id) await investimentosService.atualizar(id, req)
      else await investimentosService.criar(req)
      await this.carregar()
    },
    async remover(id: number) {
      await investimentosService.remover(id)
      await this.carregar()
    },
    async adicionarAporte(id: number, req: AporteRequest) {
      await investimentosService.adicionarAporte(id, req)
      await this.carregar()
    }
  }
})
