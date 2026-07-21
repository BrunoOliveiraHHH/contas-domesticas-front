import { defineStore } from 'pinia'
import {
  formasPagamentoService,
  type FormaPagamento,
  type FormaPagamentoRequest
} from 'src/services/formasPagamento'

export const useFormaPagamentoStore = defineStore('formasPagamento', {
  state: () => ({ itens: [] as FormaPagamento[], carregando: false }),
  actions: {
    async carregar() {
      this.carregando = true
      try {
        this.itens = await formasPagamentoService.listar()
      } finally {
        this.carregando = false
      }
    },
    async salvar(req: FormaPagamentoRequest, id?: number) {
      if (id) await formasPagamentoService.atualizar(id, req)
      else await formasPagamentoService.criar(req)
      await this.carregar()
    },
    async remover(id: number) {
      await formasPagamentoService.remover(id)
      await this.carregar()
    }
  }
})
