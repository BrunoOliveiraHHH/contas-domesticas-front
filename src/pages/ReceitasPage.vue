<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">Receitas</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Nova" @click="abrirNova" />
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
          <q-btn flat dense round icon="delete" color="negative" @click="remover(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 360px">
        <q-card-section class="text-h6">Nova receita</q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md" @submit="salvar">
            <q-input
              v-model="form.descricao"
              label="Descricao"
              :rules="[(v) => !!v || 'Informe']"
            />
            <q-input v-model.number="form.valor" type="number" step="0.01" label="Valor" />
            <q-input v-model="form.dataCompetencia" type="date" label="Competencia" />
            <q-select
              v-model="form.carteiraId"
              :options="carteiraOpcoes"
              label="Carteira"
              emit-value
              map-options
            />
            <q-select
              v-model="form.categoriaId"
              :options="categoriaOpcoes"
              label="Categoria (receita)"
              emit-value
              map-options
            />
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
import { formatarMoeda, formatarData } from 'src/utils/format'
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useReceitasStore } from 'stores/lancamentos'
import { useCarteirasStore } from 'stores/carteiras'
import { useCategoriaStore } from 'stores/categorias'
import type { Lancamento, ReceitaRequest } from 'src/services/lancamentos'

const $q = useQuasar()
const store = useReceitasStore()
const carteiras = useCarteirasStore()
const categorias = useCategoriaStore()

const colunas = [
  {
    name: 'descricao',
    label: 'Descricao',
    field: 'descricao',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'valor',
    label: 'Valor',
    field: 'valor',
    align: 'right' as const,
    sortable: true,
    format: (v: number) => formatarMoeda(v)
  },
  {
    name: 'dataCompetencia',
    label: 'Competencia',
    field: 'dataCompetencia',
    align: 'left' as const,
    format: (v: string) => formatarData(v)
  },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' as const }
]

const carteiraOpcoes = computed(() => carteiras.itens.map((c) => ({ label: c.nome, value: c.id })))
const categoriaOpcoes = computed(() =>
  categorias.itens
    .filter((c) => c.tipo === 'RECEITA')
    .map((c) => ({ label: c.nome as string, value: c.id }))
)

const dialog = ref(false)
const salvando = ref(false)
const form = reactive<ReceitaRequest>({
  descricao: '',
  valor: 0,
  dataCompetencia: new Date().toISOString().slice(0, 10),
  carteiraId: 0,
  categoriaId: 0
})

function abrirNova() {
  Object.assign(form, {
    descricao: '',
    valor: 0,
    dataCompetencia: new Date().toISOString().slice(0, 10),
    carteiraId: 0,
    categoriaId: 0
  })
  dialog.value = true
}

async function salvar() {
  salvando.value = true
  try {
    await store.salvar({ ...form })
    dialog.value = false
    $q.notify({ type: 'positive', message: 'Receita salva' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar' })
  } finally {
    salvando.value = false
  }
}

function remover(row: Lancamento) {
  $q.dialog({ title: 'Remover', message: 'Remover esta receita?', cancel: true }).onOk(async () => {
    await store.remover(row.id)
    $q.notify({ type: 'positive', message: 'Removida' })
  })
}

onMounted(() => {
  store.carregar()
  carteiras.carregar()
  categorias.carregar()
})
</script>
