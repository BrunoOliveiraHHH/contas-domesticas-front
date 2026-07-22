import { defineStore } from 'pinia'
import { relatoriosService, type SaldoMes, type PorCategoriaItem } from 'src/services/relatorios'
import { investimentosService } from 'src/services/investimentos'

export type ModoPeriodo = 'MES' | 'SEMESTRE' | 'ANO'

interface State {
  periodo: string // ancora YYYY-MM
  modo: ModoPeriodo
  saldo: SaldoMes | null
  despesasPorCategoria: PorCategoriaItem[]
  evolucao: SaldoMes[]
  patrimonio: number
  carregando: boolean
}

function periodoAtual(): string {
  return new Date().toISOString().slice(0, 7)
}

// N periodos (YYYY-MM) terminando em `fim`, em ordem cronologica.
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

// Meses de agregacao conforme o modo.
function mesesDoModo(anchor: string, modo: ModoPeriodo): string[] {
  const [y] = anchor.split('-').map(Number)
  if (modo === 'ANO') {
    return Array.from({ length: 12 }, (_, i) => `${y}-${String(i + 1).padStart(2, '0')}`)
  }
  return ultimosMeses(anchor, modo === 'SEMESTRE' ? 6 : 1)
}

function rotuloPeriodo(anchor: string, modo: ModoPeriodo): string {
  const [y, m] = anchor.split('-')
  if (modo === 'ANO') return String(y)
  if (modo === 'SEMESTRE') return `Semestre ate ${m}/${y}`
  return `${m}/${y}`
}

export const useRelatoriosStore = defineStore('relatorios', {
  state: (): State => ({
    periodo: periodoAtual(),
    modo: 'MES',
    saldo: null,
    despesasPorCategoria: [],
    evolucao: [],
    patrimonio: 0,
    carregando: false
  }),
  actions: {
    async carregar(anchor?: string, modo?: ModoPeriodo) {
      if (anchor) this.periodo = anchor
      if (modo) this.modo = modo

      const mesesAgg = mesesDoModo(this.periodo, this.modo)
      const mesesEvo = this.modo === 'ANO' ? mesesAgg : ultimosMeses(this.periodo, 6)

      this.carregando = true
      try {
        const [patrimonio, saldosAgg, categoriasAgg, saldosEvo] = await Promise.all([
          investimentosService.patrimonio(),
          Promise.all(mesesAgg.map((m) => relatoriosService.saldo(m))),
          Promise.all(mesesAgg.map((m) => relatoriosService.porCategoria(m, 'DESPESA'))),
          Promise.all(mesesEvo.map((m) => relatoriosService.saldo(m)))
        ])

        const receitas = saldosAgg.reduce((a, s) => a + s.receitas, 0)
        const despesas = saldosAgg.reduce((a, s) => a + s.despesas, 0)
        this.saldo = {
          periodo: rotuloPeriodo(this.periodo, this.modo),
          receitas,
          despesas,
          saldo: receitas - despesas
        }

        const mapa = new Map<number, { nome: string; total: number }>()
        for (const arr of categoriasAgg) {
          for (const c of arr) {
            const e = mapa.get(c.categoriaId) ?? { nome: c.categoriaNome, total: 0 }
            e.total += c.total
            mapa.set(c.categoriaId, e)
          }
        }
        const totalGeral = [...mapa.values()].reduce((a, e) => a + e.total, 0)
        this.despesasPorCategoria = [...mapa.entries()]
          .map(([id, e]) => ({
            categoriaId: id,
            categoriaNome: e.nome,
            total: e.total,
            percentual: totalGeral > 0 ? (e.total / totalGeral) * 100 : 0
          }))
          .sort((a, b) => b.total - a.total)

        this.evolucao = saldosEvo
        this.patrimonio = patrimonio.total
      } finally {
        this.carregando = false
      }
    }
  }
})
