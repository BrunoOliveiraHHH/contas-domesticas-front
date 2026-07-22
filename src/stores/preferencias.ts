import { defineStore } from 'pinia'
import { preferenciasService } from 'src/services/configuracao'

interface State {
  moeda: string
  locale: string
}

// Preferencias de exibicao (moeda base BRL). Persistidas e carregadas da API no login.
export const usePreferenciasStore = defineStore('preferencias', {
  state: (): State => ({ moeda: 'BRL', locale: 'pt-BR' }),
  persist: true,
  actions: {
    async carregar() {
      try {
        const m = await preferenciasService.resolver('MOEDA_PADRAO')
        if (m?.valor) this.moeda = m.valor
      } catch {
        /* mantem o default */
      }
      try {
        const l = await preferenciasService.resolver('LOCALE')
        if (l?.valor) this.locale = l.valor
      } catch {
        /* mantem o default */
      }
    },
    async definirMoeda(moeda: string) {
      this.moeda = moeda
      await preferenciasService.gravar('MOEDA_PADRAO', { valor: moeda })
    }
  }
})
