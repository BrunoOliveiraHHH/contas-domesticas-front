<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">Categorias</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Novo" @click="abrirNovo" />
    </div>

    <q-table
      :rows="store.itens"
      :columns="colunas"
      row-key="id"
      :loading="store.carregando"
      flat
      bordered
    >
      <template #body-cell-acoes="props">
        <q-td :props="props" class="text-right">
          <q-btn flat dense round icon="edit" @click="abrirEdicao(props.row)" />
          <q-btn
            flat
            dense
            round
            icon="delete"
            color="negative"
            @click="confirmarRemocao(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 340px">
        <q-card-section class="text-h6">{{ editando ? 'Editar' : 'Novo' }}</q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md" @submit="salvar">
            <q-input v-model="form.nome" label="Nome" :rules="[(v) => !!v || 'Informe nome']" />
            <q-select
              v-model="form.tipo"
              :options="['RECEITA', 'DESPESA', 'INVESTIMENTO']"
              label="Tipo"
            />
            <q-input v-model="form.cor" label="Cor" />
            <div class="row justify-end q-gutter-sm">
              <q-btn v-close-popup flat label="Cancelar" />
              <q-btn type="submit" color="primary" label="Salvar" :loading="salvando" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useCategoriaStore } from 'stores/categorias'
import type { Categoria, CategoriaRequest } from 'src/services/categorias'

const $q = useQuasar()
const store = useCategoriaStore()

const colunas = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' as const, sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' as const, sortable: true },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' as const }
]

const dialog = ref(false)
const salvando = ref(false)
const editando = ref<number | null>(null)
const form = reactive<CategoriaRequest>({ nome: '', tipo: 'RECEITA', cor: '' })

function abrirNovo() {
  editando.value = null
  Object.assign(form, { nome: '', tipo: 'RECEITA', cor: '' })
  dialog.value = true
}

function abrirEdicao(row: Categoria) {
  editando.value = row.id
  Object.assign(form, { nome: row.nome, tipo: row.tipo, cor: row.cor })
  dialog.value = true
}

async function salvar() {
  salvando.value = true
  try {
    await store.salvar({ ...form }, editando.value ?? undefined)
    dialog.value = false
    $q.notify({ type: 'positive', message: 'Salvo' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar' })
  } finally {
    salvando.value = false
  }
}

function confirmarRemocao(row: Categoria) {
  $q.dialog({ title: 'Remover', message: 'Remover este registro?', cancel: true }).onOk(
    async () => {
      try {
        await store.remover(row.id)
        $q.notify({ type: 'positive', message: 'Removido' })
      } catch {
        $q.notify({ type: 'negative', message: 'Nao foi possivel remover' })
      }
    }
  )
}

onMounted(() => store.carregar())
</script>
