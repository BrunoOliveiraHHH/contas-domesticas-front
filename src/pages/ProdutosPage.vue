<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ t('titulos.produtos') }}</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Novo" @click="abrirNovo" />
    </div>

    <q-table
      :rows="store.itens"
      :columns="colunas"
      row-key="id"
      :loading="store.carregando"
      :pagination="{ rowsPerPage: 25, sortBy: 'nome' }"
      :rows-per-page-options="[10, 25, 50, 100]"
      flat
      bordered
    >
      <template #body-cell-nivel="props">
        <q-td :props="props">
          <div class="row items-center no-wrap" style="gap: 8px; min-width: 120px">
            <div class="cd-barra col">
              <span :style="barraEstoque(props.row)" />
            </div>
            <span class="text-caption text-no-wrap">
              {{ fmt(props.row.estoqueAtual) }}/{{ fmt(props.row.estoqueMinimo) }}
            </span>
          </div>
        </q-td>
      </template>
      <template #body-cell-comprar="props">
        <q-td :props="props" class="text-right">
          <q-badge v-if="aComprar(props.row) > 0" color="warning">
            {{ fmt(aComprar(props.row)) }}
          </q-badge>
          <span v-else class="text-grey">—</span>
        </q-td>
      </template>
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
            <q-input v-model="form.descricao" label="Descricao" />
            <q-input v-model="form.codigoBarras" label="Codigo de barras" />
            <div class="row q-col-gutter-sm">
              <q-input
                v-model.number="form.estoqueMinimo"
                type="number"
                step="0.001"
                label="Estoque mínimo"
                class="col"
              />
              <q-input
                v-model.number="form.estoqueAtual"
                type="number"
                step="0.001"
                label="Estoque atual"
                class="col"
              />
            </div>
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
import { useI18n } from 'vue-i18n'
import { onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useProdutoStore } from 'stores/produtos'
import type { Produto, ProdutoRequest } from 'src/services/produtos'

const { t } = useI18n()

const $q = useQuasar()
const store = useProdutoStore()

const colunas = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' as const, sortable: true },
  {
    name: 'nivel',
    label: 'Nível de estoque',
    field: 'id',
    align: 'left' as const,
    sortable: true,
    sort: (_a: unknown, _b: unknown, ra: Produto, rb: Produto) => nivel(ra) - nivel(rb)
  },
  {
    name: 'estoqueMinimo',
    label: 'Mínimo',
    field: 'estoqueMinimo',
    align: 'right' as const,
    sortable: true
  },
  {
    name: 'estoqueAtual',
    label: 'Atual',
    field: 'estoqueAtual',
    align: 'right' as const,
    sortable: true
  },
  {
    name: 'comprar',
    label: 'A comprar',
    field: 'id',
    align: 'right' as const,
    sortable: true,
    sort: (_a: unknown, _b: unknown, ra: Produto, rb: Produto) => aComprar(ra) - aComprar(rb)
  },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' as const }
]

function aComprar(row: Produto) {
  const min = row.estoqueMinimo ?? 0
  const atual = row.estoqueAtual ?? 0
  return Math.max(0, min - atual)
}

// Razão atual/mínimo (para ordenar e para a largura da barra)
function nivel(row: Produto) {
  const min = row.estoqueMinimo ?? 0
  const atual = row.estoqueAtual ?? 0
  return min > 0 ? atual / min : atual > 0 ? 1 : 0
}

function fmt(v: number | null | undefined) {
  return (v ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 3 })
}

function barraEstoque(row: Produto) {
  const min = row.estoqueMinimo ?? 0
  const atual = row.estoqueAtual ?? 0
  const pct = Math.min(100, nivel(row) * 100)
  const cor = atual < min ? '#ef4444' : atual < min * 1.2 ? '#f59e0b' : '#43a047'
  return { width: `${pct}%`, background: cor }
}

const dialog = ref(false)
const salvando = ref(false)
const editando = ref<number | null>(null)
const form = reactive<ProdutoRequest>({
  nome: '',
  descricao: '',
  codigoBarras: '',
  estoqueMinimo: 0,
  estoqueAtual: 0
})

function abrirNovo() {
  editando.value = null
  Object.assign(form, {
    nome: '',
    descricao: '',
    codigoBarras: '',
    estoqueMinimo: 0,
    estoqueAtual: 0
  })
  dialog.value = true
}

function abrirEdicao(row: Produto) {
  editando.value = row.id
  Object.assign(form, {
    nome: row.nome,
    descricao: row.descricao,
    codigoBarras: row.codigoBarras,
    estoqueMinimo: row.estoqueMinimo ?? 0,
    estoqueAtual: row.estoqueAtual ?? 0
  })
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

function confirmarRemocao(row: Produto) {
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
