import { api } from 'boot/axios'

export interface Lancamento {
  id: number
  tipo: 'RECEITA' | 'DESPESA'
  descricao: string
  valor: number
  dataCompetencia: string
  dataVencimento?: string | null
  dataPagamento?: string | null
  status?: 'PAGO' | 'PENDENTE' | 'ATRASADO' | null
  carteiraId: number
  categoriaId: number
}

export interface ReceitaRequest {
  descricao: string
  valor: number
  dataCompetencia: string
  carteiraId: number
  categoriaId: number
  formaPagamentoId?: number | null
  observacao?: string | null
}

export interface DespesaRequest extends ReceitaRequest {
  dataVencimento?: string | null
  dataPagamento?: string | null
}

export const receitasService = {
  listar: () => api.get<Lancamento[]>('/receitas').then((r) => r.data),
  criar: (b: ReceitaRequest) => api.post<Lancamento>('/receitas', b).then((r) => r.data),
  atualizar: (id: number, b: ReceitaRequest) =>
    api.put<Lancamento>(`/receitas/${id}`, b).then((r) => r.data),
  remover: (id: number) => api.delete(`/receitas/${id}`).then(() => undefined)
}

export const despesasService = {
  listar: () => api.get<Lancamento[]>('/despesas').then((r) => r.data),
  criar: (b: DespesaRequest) => api.post<Lancamento>('/despesas', b).then((r) => r.data),
  atualizar: (id: number, b: DespesaRequest) =>
    api.put<Lancamento>(`/despesas/${id}`, b).then((r) => r.data),
  pagar: (id: number) => api.post<Lancamento>(`/despesas/${id}/pagar`, {}).then((r) => r.data),
  remover: (id: number) => api.delete(`/despesas/${id}`).then(() => undefined)
}
