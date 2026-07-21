import { api } from 'boot/axios'
import type { Lancamento } from 'src/services/lancamentos'

export type Frequencia = 'SEMANAL' | 'MENSAL' | 'ANUAL'
export type TipoLancamento = 'RECEITA' | 'DESPESA'

export interface Recorrencia {
  id: number
  descricao: string
  valor: number
  tipo: TipoLancamento
  carteiraId: number
  categoriaId: number
  formaPagamentoId: number | null
  frequencia: Frequencia
  diaVencimento: number | null
  dataInicio: string
  dataFim: string | null
  ativa: boolean
}

export interface RecorrenciaRequest {
  descricao: string
  valor: number
  tipo: TipoLancamento
  carteiraId: number
  categoriaId: number
  formaPagamentoId?: number | null
  frequencia: Frequencia
  diaVencimento?: number | null
  dataInicio: string
  dataFim?: string | null
  ativa?: boolean
}

const base = '/recorrencias'

export const recorrenciasService = {
  listar: () => api.get<Recorrencia[]>(base).then((r) => r.data),
  criar: (body: RecorrenciaRequest) => api.post<Recorrencia>(base, body).then((r) => r.data),
  atualizar: (id: number, body: RecorrenciaRequest) =>
    api.put<Recorrencia>(`${base}/${id}`, body).then((r) => r.data),
  gerar: (id: number, competencia: string) =>
    api
      .post<Lancamento>(`${base}/${id}/gerar`, null, { params: { competencia } })
      .then((r) => r.data),
  remover: (id: number) => api.delete(`${base}/${id}`).then(() => undefined)
}
