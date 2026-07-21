import { defineStore } from 'pinia'
import {
  receitasService,
  despesasService,
  type Lancamento,
  type ReceitaRequest,
  type DespesaRequest
} from 'src/services/lancamentos'

export const useReceitasStore = defineStore('receitas', {
  state: () => ({ itens: [] as Lancamento[], carregando: false }),
  actions: {
    async carregar() {
      this.carregando = true
      try {
        this.itens = await receitasService.listar()
      } finally {
        this.carregando = false
      }
    },
    async salvar(req: ReceitaRequest, id?: number) {
      if (id) await receitasService.atualizar(id, req)
      else await receitasService.criar(req)
      await this.carregar()
    },
    async remover(id: number) {
      await receitasService.remover(id)
      await this.carregar()
    }
  }
})

export const useDespesasStore = defineStore('despesas', {
  state: () => ({ itens: [] as Lancamento[], carregando: false }),
  actions: {
    async carregar() {
      this.carregando = true
      try {
        this.itens = await despesasService.listar()
      } finally {
        this.carregando = false
      }
    },
    async salvar(req: DespesaRequest, id?: number) {
      if (id) await despesasService.atualizar(id, req)
      else await despesasService.criar(req)
      await this.carregar()
    },
    async pagar(id: number) {
      await despesasService.pagar(id)
      await this.carregar()
    },
    async remover(id: number) {
      await despesasService.remover(id)
      await this.carregar()
    }
  }
})
