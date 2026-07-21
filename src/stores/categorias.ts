import { defineStore } from 'pinia'
import { categoriasService, type Categoria, type CategoriaRequest } from 'src/services/categorias'

export const useCategoriaStore = defineStore('categorias', {
  state: () => ({ itens: [] as Categoria[], carregando: false }),
  actions: {
    async carregar() {
      this.carregando = true
      try {
        this.itens = await categoriasService.listar()
      } finally {
        this.carregando = false
      }
    },
    async salvar(req: CategoriaRequest, id?: number) {
      if (id) await categoriasService.atualizar(id, req)
      else await categoriasService.criar(req)
      await this.carregar()
    },
    async remover(id: number) {
      await categoriasService.remover(id)
      await this.carregar()
    }
  }
})
