<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">Despesas</div>
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
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="corStatus(props.row.status)" :label="props.row.status || '-'" />
        </q-td>
      </template>
      <template #body-cell-acoes="props">
        <q-td :props="props" class="text-right">
          <q-btn
            v-if="props.row.status !== 'PAGO'"
            flat
            dense
            round
            icon="paid"
            color="positive"
            @click="pagar(props.row)"
          />
          <q-btn flat dense round icon="delete" color="negative" @click="remover(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 360px">
        <q-card-section class="text-h6">Nova despesa</q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md" @submit="salvar">
            <q-input
              v-model="form.descricao"
              label="Descricao"
              :rules="[(v) => !!v || 'Informe']"
            />
            <q-input v-model.number="form.valor" type="number" step="0.01" label="Valor" />
            <q-input v-model="form.dataCompetencia" type="date" label="Competencia" />
            <q-input v-model="form.dataVencimento" type="date" label="Vencimento" />
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
              label="Categoria (despesa)"
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
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useDespesasStore } from 'stores/lancamentos'
import { useCarteirasStore } from 'stores/carteiras'
import { useCategoriasStore } from 'stores/categorias'
import type { Lancamento, DespesaRequest } from 'src/services/lancamentos'

const $q = useQuasar()
const store = useDespesasStore()
const carteiras = useCarteirasStore()
const categorias = useCategoriasStore()

const colunas = [
  {
    name: 'descricao',
    label: 'Descricao',
    field: 'descricao',
    align: 'left' as const,
    sortable: true
  },
  { name: 'valor', label: 'Valor', field: 'valor', align: 'right' as const, sortable: true },
  { name: 'dataVencimento', label: 'Vencimento', field: 'dataVencimento', align: 'left' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' as const }
]

const carteiraOpcoes = computed(() => carteiras.itens.map((c) => ({ label: c.nome, value: c.id })))
const categoriaOpcoes = computed(() =>
  categorias.itens
    .filter((c) => c.tipo === 'DESPESA')
    .map((c) => ({ label: c.nome as string, value: c.id }))
)

const dialog = ref(false)
const salvando = ref(false)
const form = reactive<DespesaRequest>({
  descricao: '',
  valor: 0,
  dataCompetencia: new Date().toISOString().slice(0, 10),
  dataVencimento: new Date().toISOString().slice(0, 10),
  carteiraId: 0,
  categoriaId: 0
})

function abrirNova() {
  Object.assign(form, {
    descricao: '',
    valor: 0,
    dataCompetencia: new Date().toISOString().slice(0, 10),
    dataVencimento: new Date().toISOString().slice(0, 10),
    carteiraId: 0,
    categoriaId: 0
  })
  dialog.value = true
}

function corStatus(status: string | null | undefined) {
  if (status === 'PAGO') return 'positive'
  if (status === 'ATRASADO') return 'negative'
  return 'warning'
}

async function salvar() {
  salvando.value = true
  try {
    await store.salvar({ ...form })
    dialog.value = false
    $q.notify({ type: 'positive', message: 'Despesa salva' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar' })
  } finally {
    salvando.value = false
  }
}

async function pagar(row: Lancamento) {
  await store.pagar(row.id)
  $q.notify({ type: 'positive', message: 'Marcada como paga' })
}

function remover(row: Lancamento) {
  $q.dialog({ title: 'Remover', message: 'Remover esta despesa?', cancel: true }).onOk(async () => {
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
