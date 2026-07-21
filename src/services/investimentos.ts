import { api } from 'boot/axios'

export type TipoInvestimento =
  | 'RENDA_FIXA'
  | 'RENDA_VARIAVEL'
  | 'FUNDO'
  | 'CRIPTO'
  | 'PREVIDENCIA'
  | 'POUPANCA'
  | 'RESERVA_EMERGENCIA'

export type Indexador = 'SELIC' | 'CDI' | 'IPCA' | 'PRE'

export type TipoAporte = 'APORTE' | 'RESGATE'

export interface Investimento {
  id: number
  nome: string
  tipoInvestimento: TipoInvestimento
  instituicao: string | null
  carteiraId: number
  indexador: Indexador | null
  taxaContratada: number | null
  dataAplicacao: string
  dataVencimento: string | null
}

export interface InvestimentoRequest {
  nome: string
  tipoInvestimento: TipoInvestimento
  instituicao?: string | null
  carteiraId: number
  indexador?: Indexador | null
  taxaContratada?: number | null
  dataAplicacao: string
  dataVencimento?: string | null
}

export interface SaldoInvestimento {
  investimentoId: number
  nome: string
  saldoAplicado: number
}

export interface Patrimonio {
  total: number
}

export interface Aporte {
  id: number
  investimentoId: number
  valor: number
  data: string
  tipo: TipoAporte
}

export interface AporteRequest {
  valor: number
  data: string
  tipo: TipoAporte
}

const base = '/investimentos'

export const investimentosService = {
  listar: () => api.get<Investimento[]>(base).then((r) => r.data),
  obter: (id: number) => api.get<Investimento>(`${base}/${id}`).then((r) => r.data),
  criar: (body: InvestimentoRequest) => api.post<Investimento>(base, body).then((r) => r.data),
  atualizar: (id: number, body: InvestimentoRequest) =>
    api.put<Investimento>(`${base}/${id}`, body).then((r) => r.data),
  remover: (id: number) => api.delete(`${base}/${id}`).then(() => undefined),
  saldo: (id: number) => api.get<SaldoInvestimento>(`${base}/${id}/saldo`).then((r) => r.data),
  patrimonio: () => api.get<Patrimonio>(`${base}/patrimonio`).then((r) => r.data),
  aportes: (id: number) => api.get<Aporte[]>(`${base}/${id}/aportes`).then((r) => r.data),
  adicionarAporte: (id: number, body: AporteRequest) =>
    api.post<Aporte>(`${base}/${id}/aportes`, body).then((r) => r.data)
}
