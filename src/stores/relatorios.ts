import { defineStore } from 'pinia'
import { relatoriosService, type SaldoMes, type PorCategoriaItem } from 'src/services/relatorios'
import { investimentosService } from 'src/services/investimentos'

interface State {
  periodo: string
  saldo: SaldoMes | null
  despesasPorCategoria: PorCategoriaItem[]
  patrimonio: number
  carregando: boolean
}

function periodoAtual(): string {
  return new Date().toISOString().slice(0, 7)
}

export const useRelatoriosStore = defineStore('relatorios', {
  state: (): State => ({
    periodo: periodoAtual(),
    saldo: null,
    despesasPorCategoria: [],
    patrimonio: 0,
    carregando: false
  }),
  actions: {
    async carregar(periodo?: string) {
      if (periodo) this.periodo = periodo
      this.carregando = true
      try {
        const [saldo, porCategoria, patrimonio] = await Promise.all([
          relatoriosService.saldo(this.periodo),
          relatoriosService.porCategoria(this.periodo, 'DESPESA'),
          investimentosService.patrimonio()
        ])
        this.saldo = saldo
        this.despesasPorCategoria = porCategoria
        this.patrimonio = patrimonio.total
      } finally {
        this.carregando = false
      }
    }
  }
})
