import { api } from 'boot/axios'

export interface UnidadeMedida {
  id: number
  nome?: string
  sigla?: string
  tipo?: string
  fatorParaBase?: number
}

export type UnidadeMedidaRequest = {
  nome?: string
  sigla?: string
  tipo?: string
  fatorParaBase?: number
}

const base = '/unidades-medida'

export const unidadesMedidaService = {
  listar: () => api.get<UnidadeMedida[]>(base).then((r) => r.data),
  criar: (body: UnidadeMedidaRequest) => api.post<UnidadeMedida>(base, body).then((r) => r.data),
  atualizar: (id: number, body: UnidadeMedidaRequest) =>
    api.put<UnidadeMedida>(`${base}/${id}`, body).then((r) => r.data),
  remover: (id: number) => api.delete(`${base}/${id}`).then(() => undefined)
}
