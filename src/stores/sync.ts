import { defineStore } from 'pinia'
import { syncService, type SyncMercado } from 'src/services/sync'

interface State {
  ultimaSync: string | null
  registros: SyncMercado[]
  sincronizando: boolean
}

export const useSyncStore = defineStore('sync', {
  state: (): State => ({ ultimaSync: null, registros: [], sincronizando: false }),
  persist: true,
  actions: {
    // Puxa o delta desde a ultima sincronizacao e avanca o carimbo.
    async sincronizar() {
      this.sincronizando = true
      try {
        const registros = await syncService.delta(this.ultimaSync ?? undefined)
        this.registros = registros
        const maiorCarimbo = registros
          .map((r) => r.atualizadoEm)
          .filter((v): v is string => !!v)
          .sort()
          .pop()
        if (maiorCarimbo) this.ultimaSync = maiorCarimbo
        return registros
      } finally {
        this.sincronizando = false
      }
    },
    // Envia os registros locais para merge (last-write-wins por versao).
    async enviar(registros: SyncMercado[]) {
      return syncService.merge(registros)
    }
  }
})
