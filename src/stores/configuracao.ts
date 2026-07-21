import { defineStore } from 'pinia'
import {
  parametrosService,
  preferenciasService,
  type Parametro,
  type ParametroRequest,
  type PreferenciaRequest
} from 'src/services/configuracao'

interface State {
  parametros: Parametro[]
  carregando: boolean
}

export const useConfiguracaoStore = defineStore('configuracao', {
  state: (): State => ({ parametros: [], carregando: false }),
  actions: {
    async carregar() {
      this.carregando = true
      try {
        this.parametros = await parametrosService.listar()
      } finally {
        this.carregando = false
      }
    },
    async salvar(req: ParametroRequest, id?: number) {
      if (id) await parametrosService.atualizar(id, req)
      else await parametrosService.criar(req)
      await this.carregar()
    },
    async remover(id: number) {
      await parametrosService.remover(id)
      await this.carregar()
    },
    resolverPreferencia(chave: string, usuarioId?: number) {
      return preferenciasService.resolver(chave, usuarioId)
    },
    gravarPreferencia(chave: string, req: PreferenciaRequest) {
      return preferenciasService.gravar(chave, req)
    }
  }
})
