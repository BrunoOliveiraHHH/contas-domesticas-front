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
  dataInicio?: string | null
  dataFim?: string | null
}

export interface ReceitaRequest {
  descricao: string
  valor: number
  dataCompetencia: string
  carteiraId: number
  categoriaId: number
  formaPagamentoId?: number | null
  observacao?: string | null
  dataInicio?: string | null
  dataFim?: string | null
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

export interface ParcelamentoRequest {
  descricao: string
  valorTotal: number
  parcelas: number
  primeiroVencimento: string
  carteiraId: number
  categoriaId: number
  formaPagamentoId?: number | null
}

export type TipoRateio = 'IGUAL' | 'PROPORCIONAL' | 'CUSTOM'

export interface RateioParticipanteRequest {
  usuarioId: number
  percentual?: number | null
}

export interface RateioRequest {
  tipo: TipoRateio
  participantes: RateioParticipanteRequest[]
}

export interface RateioParticipante {
  usuarioId: number
  usuarioLogin: string
  percentual: number
  valor: number
}

export interface Rateio {
  id: number
  lancamentoId: number
  tipo: TipoRateio
  participantes: RateioParticipante[]
}

export interface AcertoItem {
  usuarioId: number
  usuarioLogin: string
  total: number
}

export const despesasService = {
  listar: () => api.get<Lancamento[]>('/despesas').then((r) => r.data),
  criar: (b: DespesaRequest) => api.post<Lancamento>('/despesas', b).then((r) => r.data),
  atualizar: (id: number, b: DespesaRequest) =>
    api.put<Lancamento>(`/despesas/${id}`, b).then((r) => r.data),
  pagar: (id: number) => api.post<Lancamento>(`/despesas/${id}/pagar`, {}).then((r) => r.data),
  remover: (id: number) => api.delete(`/despesas/${id}`).then(() => undefined),
  parcelar: (b: ParcelamentoRequest) =>
    api.post<Lancamento[]>('/despesas/parceladas', b).then((r) => r.data),
  ratear: (id: number, b: RateioRequest) =>
    api.post<Rateio>(`/despesas/${id}/rateio`, b).then((r) => r.data)
}

export const rateiosService = {
  acerto: (periodo: string) =>
    api.get<AcertoItem[]>('/rateios/acerto', { params: { periodo } }).then((r) => r.data)
}
