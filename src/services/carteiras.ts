import { api } from 'boot/axios'

export type TipoCarteira = 'FAMILIAR' | 'INDIVIDUAL'

export interface Carteira {
  id: number
  nome: string
  tipo: TipoCarteira
  donoId: number | null
  saldoInicial: number
  moeda: string
  cor: string | null
  icone: string | null
  ativa: boolean
}

export interface CarteiraRequest {
  nome: string
  tipo: TipoCarteira
  donoId?: number | null
  saldoInicial?: number
  moeda?: string
  cor?: string | null
  icone?: string | null
  ativa?: boolean
}

const base = '/carteiras'

export const carteirasService = {
  listar: () => api.get<Carteira[]>(base).then((r) => r.data),
  obter: (id: number) => api.get<Carteira>(`${base}/${id}`).then((r) => r.data),
  criar: (body: CarteiraRequest) => api.post<Carteira>(base, body).then((r) => r.data),
  atualizar: (id: number, body: CarteiraRequest) =>
    api.put<Carteira>(`${base}/${id}`, body).then((r) => r.data),
  remover: (id: number) => api.delete(`${base}/${id}`).then(() => undefined)
}
