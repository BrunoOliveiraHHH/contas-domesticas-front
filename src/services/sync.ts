import { api } from 'boot/axios'

export type TipoMercado =
  'SUPERMERCADO' | 'ARMAZEM' | 'MERCEARIA' | 'CONSTRUCAO' | 'FARMACIA' | 'OUTRO'

/** Registro sincronizavel de Mercado (entidade de referencia da sincronizacao). */
export interface SyncMercado {
  uuid: string
  nome: string
  tipo: TipoMercado
  endereco: string | null
  bairro: string | null
  ativo: boolean | null
  versao: number | null
  deletado: boolean
  atualizadoEm: string | null
}

export const syncService = {
  // delta pull: alteracoes desde o carimbo informado (ou tudo, se ausente)
  delta: (desde?: string) =>
    api
      .get<SyncMercado[]>('/sync/mercados', { params: desde ? { desde } : {} })
      .then((r) => r.data),
  // merge push: last-write-wins por versao + tombstone via deletado
  merge: (registros: SyncMercado[]) =>
    api.post<SyncMercado[]>('/sync/mercados', registros).then((r) => r.data)
}
