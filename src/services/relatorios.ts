import { api } from 'boot/axios'

export interface SaldoMes {
  periodo: string
  receitas: number
  despesas: number
  saldo: number
  aPagar: number
  atrasadas: number
  assinaturas: number
}

export interface PorCategoriaItem {
  categoriaId: number
  categoriaNome: string
  total: number
  percentual: number
}

export const relatoriosService = {
  saldo: (periodo: string, carteira?: number) =>
    api
      .get<SaldoMes>('/relatorios/saldo', {
        params: { periodo, ...(carteira ? { carteira } : {}) }
      })
      .then((r) => r.data),
  porCategoria: (periodo: string, tipo?: 'RECEITA' | 'DESPESA') =>
    api
      .get<PorCategoriaItem[]>('/relatorios/por-categoria', {
        params: { periodo, ...(tipo ? { tipo } : {}) }
      })
      .then((r) => r.data)
}
