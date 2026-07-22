<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ t('titulos.listasCompra') }}</div>
      <q-space />
      <q-select
        v-model="filtroStatus"
        :options="statusOpcoes"
        label="Status"
        clearable
        dense
        style="min-width: 160px"
        class="q-mr-md"
        @update:model-value="recarregar"
      />
      <q-btn color="primary" icon="add" label="Nova" @click="abrirNova" />
    </div>

    <q-table
      :rows="store.itens"
      :columns="colunas"
      row-key="id"
      :loading="store.carregando"
      :pagination="{ rowsPerPage: 25, sortBy: 'data', descending: true }"
      :rows-per-page-options="[10, 25, 50, 100]"
      flat
      bordered
    >
      <template #body-cell-tipo="props">
        <q-td :props="props">
          <q-badge
            outline
            :color="props.row.tipo === 'CONSTRUCAO' ? 'brown-6' : 'teal-7'"
            :label="tipoLabel(props.row.tipo)"
          />
        </q-td>
      </template>
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="corStatus(props.row.status)" :label="props.row.status" />
        </q-td>
      </template>
      <template #body-cell-acoes="props">
        <q-td :props="props" class="text-right">
          <q-btn flat dense round icon="list_alt" color="primary" @click="abrir(props.row)">
            <q-tooltip>Itens</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="content_copy" @click="duplicar(props.row)">
            <q-tooltip>Duplicar</q-tooltip>
          </q-btn>
          <q-btn
            v-if="props.row.status === 'ABERTA'"
            flat
            dense
            round
            icon="point_of_sale"
            color="positive"
            @click="abrirFechar(props.row)"
          >
            <q-tooltip>Fechar em despesas</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="delete" color="negative" @click="remover(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 360px">
        <q-card-section class="text-h6">Nova lista</q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md" @submit="salvar">
            <q-input v-model="form.nome" label="Nome" :rules="[(v) => !!v || 'Informe']" />
            <q-select v-model="form.tipo" :options="tipos" label="Tipo" />
            <q-select
              v-model="form.carteiraId"
              :options="carteiraOpcoes"
              label="Carteira"
              emit-value
              map-options
            />
            <q-input v-model="form.data" type="date" label="Data" />
            <div class="row justify-end q-gutter-sm">
              <q-btn v-close-popup flat label="Cancelar" />
              <q-btn type="submit" color="primary" label="Salvar" :loading="salvando" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogFechar">
      <q-card style="min-width: 320px">
        <q-card-section class="text-h6">Fechar em despesas</q-card-section>
        <q-card-section>
          <div class="text-body2 q-mb-md">
            Gera uma despesa por estabelecimento escolhido nos itens.
          </div>
          <q-select
            v-model="categoriaFechar"
            :options="categoriaOpcoes"
            label="Categoria da despesa"
            emit-value
            map-options
          />
          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn v-close-popup flat label="Cancelar" />
            <q-btn color="positive" label="Fechar" :loading="salvando" @click="fechar" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatarData } from 'src/utils/format'
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useComprasStore } from 'stores/compras'
import { useCarteirasStore } from 'stores/carteiras'
import { useCategoriaStore } from 'stores/categorias'
import type { ListaCompra, ListaCompraRequest, StatusLista, TipoLista } from 'src/services/compras'

const { t } = useI18n()

const $q = useQuasar()
const router = useRouter()
const store = useComprasStore()
const carteiras = useCarteirasStore()
const categorias = useCategoriaStore()

const tipos: TipoLista[] = ['MANTIMENTOS', 'CONSTRUCAO']
const statusOpcoes: StatusLista[] = ['ABERTA', 'FECHADA', 'ARQUIVADA']

const TIPO_LABEL: Record<string, string> = { MANTIMENTOS: 'Mantimentos', CONSTRUCAO: 'Construção' }
function tipoLabel(t?: string | null) {
  return TIPO_LABEL[t ?? ''] ?? t ?? '—'
}

const colunas = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' as const, sortable: true },
  {
    name: 'tipo',
    label: 'Tipo',
    field: 'tipo',
    align: 'left' as const,
    sortable: true,
    sort: (a: string | null, b: string | null) => tipoLabel(a).localeCompare(tipoLabel(b))
  },
  {
    name: 'data',
    label: 'Data',
    field: 'data',
    align: 'left' as const,
    sortable: true,
    format: (v: string) => formatarData(v)
  },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const, sortable: true },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' as const }
]

const carteiraOpcoes = computed(() => carteiras.itens.map((c) => ({ label: c.nome, value: c.id })))
const categoriaOpcoes = computed(() =>
  categorias.itens
    .filter((c) => c.tipo === 'DESPESA')
    .map((c) => ({ label: c.nome as string, value: c.id }))
)

const filtroStatus = ref<StatusLista | null>(null)
function recarregar() {
  store.carregar(filtroStatus.value ?? undefined)
}

const hoje = () => new Date().toISOString().slice(0, 10)

const dialog = ref(false)
const salvando = ref(false)
const form = reactive<ListaCompraRequest>({
  nome: '',
  tipo: 'MANTIMENTOS',
  carteiraId: 0,
  data: hoje()
})

function abrirNova() {
  Object.assign(form, { nome: '', tipo: 'MANTIMENTOS', carteiraId: 0, data: hoje() })
  dialog.value = true
}

async function salvar() {
  salvando.value = true
  try {
    await store.salvar({ ...form })
    dialog.value = false
    $q.notify({ type: 'positive', message: 'Lista salva' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar' })
  } finally {
    salvando.value = false
  }
}

function abrir(row: ListaCompra) {
  router.push(`/listas-compra/${row.id}`)
}

async function duplicar(row: ListaCompra) {
  await store.duplicar(row.id)
  $q.notify({ type: 'positive', message: 'Lista duplicada' })
}

const dialogFechar = ref(false)
const listaFechar = ref<ListaCompra | null>(null)
const categoriaFechar = ref<number | null>(null)

function abrirFechar(row: ListaCompra) {
  listaFechar.value = row
  categoriaFechar.value = null
  dialogFechar.value = true
}

async function fechar() {
  if (!listaFechar.value || !categoriaFechar.value) return
  salvando.value = true
  try {
    const despesas = await store.fechar(listaFechar.value.id, categoriaFechar.value)
    dialogFechar.value = false
    $q.notify({ type: 'positive', message: `${despesas.length} despesa(s) gerada(s)` })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao fechar' })
  } finally {
    salvando.value = false
  }
}

function corStatus(status: StatusLista) {
  if (status === 'FECHADA') return 'positive'
  if (status === 'ARQUIVADA') return 'grey'
  return 'primary'
}

function remover(row: ListaCompra) {
  $q.dialog({ title: 'Remover', message: 'Remover esta lista?', cancel: true }).onOk(async () => {
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
