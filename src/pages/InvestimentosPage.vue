<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">Investimentos</div>
      <q-space />
      <q-badge
        color="primary"
        class="q-mr-md text-body2"
        :label="`Patrimonio: ${brl(store.patrimonio)}`"
      />
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
          <q-btn flat dense round icon="savings" color="primary" @click="abrirAporte(props.row)">
            <q-tooltip>Aporte / resgate</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="delete" color="negative" @click="remover(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 360px">
        <q-card-section class="text-h6">Novo investimento</q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md" @submit="salvar">
            <q-input v-model="form.nome" label="Nome" :rules="[(v) => !!v || 'Informe']" />
            <q-select v-model="form.tipoInvestimento" :options="tiposInvestimento" label="Tipo" />
            <q-input v-model="form.instituicao" label="Instituicao" />
            <q-select
              v-model="form.carteiraId"
              :options="carteiraOpcoes"
              label="Carteira"
              emit-value
              map-options
            />
            <q-select v-model="form.indexador" :options="indexadores" label="Indexador" clearable />
            <q-input
              v-model.number="form.taxaContratada"
              type="number"
              step="0.01"
              label="Taxa contratada (%)"
            />
            <q-input v-model="form.dataAplicacao" type="date" label="Data de aplicacao" />
            <q-input v-model="form.dataVencimento" type="date" label="Vencimento" />
            <div class="row justify-end q-gutter-sm">
              <q-btn v-close-popup flat label="Cancelar" />
              <q-btn type="submit" color="primary" label="Salvar" :loading="salvando" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogAporte">
      <q-card style="min-width: 320px">
        <q-card-section class="text-h6">
          Aporte / resgate
          <div class="text-caption text-grey">{{ selecionado?.nome }}</div>
        </q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md" @submit="salvarAporte">
            <q-select v-model="aporte.tipo" :options="tiposAporte" label="Tipo" />
            <q-input v-model.number="aporte.valor" type="number" step="0.01" label="Valor" />
            <q-input v-model="aporte.data" type="date" label="Data" />
            <div class="row justify-end q-gutter-sm">
              <q-btn v-close-popup flat label="Cancelar" />
              <q-btn type="submit" color="primary" label="Registrar" :loading="salvando" />
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
import { useInvestimentosStore } from 'stores/investimentos'
import { useCarteirasStore } from 'stores/carteiras'
import type {
  Investimento,
  InvestimentoRequest,
  AporteRequest,
  TipoInvestimento,
  Indexador,
  TipoAporte
} from 'src/services/investimentos'

const $q = useQuasar()
const store = useInvestimentosStore()
const carteiras = useCarteirasStore()

const tiposInvestimento: TipoInvestimento[] = [
  'RENDA_FIXA',
  'RENDA_VARIAVEL',
  'FUNDO',
  'CRIPTO',
  'PREVIDENCIA',
  'POUPANCA',
  'RESERVA_EMERGENCIA'
]
const indexadores: Indexador[] = ['SELIC', 'CDI', 'IPCA', 'PRE']
const tiposAporte: TipoAporte[] = ['APORTE', 'RESGATE']

const colunas = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' as const, sortable: true },
  {
    name: 'tipoInvestimento',
    label: 'Tipo',
    field: 'tipoInvestimento',
    align: 'left' as const
  },
  { name: 'instituicao', label: 'Instituicao', field: 'instituicao', align: 'left' as const },
  {
    name: 'dataAplicacao',
    label: 'Aplicacao',
    field: 'dataAplicacao',
    align: 'left' as const
  },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' as const }
]

const carteiraOpcoes = computed(() => carteiras.itens.map((c) => ({ label: c.nome, value: c.id })))

function brl(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const hoje = () => new Date().toISOString().slice(0, 10)

const dialog = ref(false)
const salvando = ref(false)
const form = reactive<InvestimentoRequest>({
  nome: '',
  tipoInvestimento: 'RENDA_FIXA',
  instituicao: '',
  carteiraId: 0,
  indexador: null,
  taxaContratada: null,
  dataAplicacao: hoje(),
  dataVencimento: null
})

function abrirNovo() {
  Object.assign(form, {
    nome: '',
    tipoInvestimento: 'RENDA_FIXA',
    instituicao: '',
    carteiraId: 0,
    indexador: null,
    taxaContratada: null,
    dataAplicacao: hoje(),
    dataVencimento: null
  })
  dialog.value = true
}

async function salvar() {
  salvando.value = true
  try {
    await store.salvar({ ...form })
    dialog.value = false
    $q.notify({ type: 'positive', message: 'Investimento salvo' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar' })
  } finally {
    salvando.value = false
  }
}

const dialogAporte = ref(false)
const selecionado = ref<Investimento | null>(null)
const aporte = reactive<AporteRequest>({ valor: 0, data: hoje(), tipo: 'APORTE' })

function abrirAporte(row: Investimento) {
  selecionado.value = row
  Object.assign(aporte, { valor: 0, data: hoje(), tipo: 'APORTE' })
  dialogAporte.value = true
}

async function salvarAporte() {
  if (!selecionado.value) return
  salvando.value = true
  try {
    await store.adicionarAporte(selecionado.value.id, { ...aporte })
    dialogAporte.value = false
    $q.notify({ type: 'positive', message: 'Movimentacao registrada' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao registrar' })
  } finally {
    salvando.value = false
  }
}

function remover(row: Investimento) {
  $q.dialog({ title: 'Remover', message: 'Remover este investimento?', cancel: true }).onOk(
    async () => {
      await store.remover(row.id)
      $q.notify({ type: 'positive', message: 'Removido' })
    }
  )
}

onMounted(() => {
  store.carregar()
  carteiras.carregar()
})
</script>
