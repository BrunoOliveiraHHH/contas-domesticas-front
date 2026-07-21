import { api } from 'boot/axios'

export interface Parametro {
  id: number
  chave: string
  valor: number
  vigenciaInicio: string
  descricao: string | null
}

export interface ParametroRequest {
  chave: string
  valor: number
  vigenciaInicio: string
  descricao?: string | null
}

export interface Preferencia {
  id: number | null
  chave: string
  valor: string
  usuarioId: number | null
}

export interface PreferenciaRequest {
  valor: string
  usuarioId?: number | null
}

const base = '/parametros'

export const parametrosService = {
  listar: () => api.get<Parametro[]>(base).then((r) => r.data),
  vigente: (chave: string, data?: string) =>
    api
      .get<Parametro>(`${base}/vigente/${chave}`, { params: data ? { data } : {} })
      .then((r) => r.data),
  criar: (body: ParametroRequest) => api.post<Parametro>(base, body).then((r) => r.data),
  atualizar: (id: number, body: ParametroRequest) =>
    api.put<Parametro>(`${base}/${id}`, body).then((r) => r.data),
  remover: (id: number) => api.delete(`${base}/${id}`).then(() => undefined)
}

export const preferenciasService = {
  resolver: (chave: string, usuarioId?: number) =>
    api
      .get<Preferencia>(`/preferencias/${chave}`, { params: usuarioId ? { usuarioId } : {} })
      .then((r) => r.data),
  gravar: (chave: string, body: PreferenciaRequest) =>
    api.put<Preferencia>(`/preferencias/${chave}`, body).then((r) => r.data)
}
