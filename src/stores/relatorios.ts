import { defineStore } from 'pinia'
import { relatoriosService, type SaldoMes, type PorCategoriaItem } from 'src/services/relatorios'
import { investimentosService } from 'src/services/investimentos'

interface State {
  periodo: string
  saldo: SaldoMes | null
  despesasPorCategoria: PorCategoriaItem[]
  evolucao: SaldoMes[]
  patrimonio: number
  carregando: boolean
}

function periodoAtual(): string {
  return new Date().toISOString().slice(0, 7)
}

// Retorna os N periodos (YYYY-MM) terminando em `fim`, em ordem cronologica.
function ultimosMeses(fim: string, n: number): string[] {
  const [ay, am] = fim.split('-').map(Number)
  const out: string[] = []
  let y = ay as number
  let m = am as number
  for (let i = 0; i < n; i++) {
    out.unshift(`${y}-${String(m).padStart(2, '0')}`)
    m -= 1
    if (m === 0) {
      m = 12
      y -= 1
    }
  }
  return out
}

export const useRelatoriosStore = defineStore('relatorios', {
  state: (): State => ({
    periodo: periodoAtual(),
    saldo: null,
    despesasPorCategoria: [],
    evolucao: [],
    patrimonio: 0,
    carregando: false
  }),
  actions: {
    async carregar(periodo?: string) {
      if (periodo) this.periodo = periodo
      this.carregando = true
      try {
        const meses = ultimosMeses(this.periodo, 6)
        const [saldo, porCategoria, patrimonio, ...evolucao] = await Promise.all([
          relatoriosService.saldo(this.periodo),
          relatoriosService.porCategoria(this.periodo, 'DESPESA'),
          investimentosService.patrimonio(),
          ...meses.map((m) => relatoriosService.saldo(m))
        ])
        this.saldo = saldo
        this.despesasPorCategoria = porCategoria
        this.patrimonio = patrimonio.total
        this.evolucao = evolucao
      } finally {
        this.carregando = false
      }
    }
  }
})
